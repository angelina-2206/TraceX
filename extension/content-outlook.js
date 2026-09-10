"use strict";
(() => {
  // src/utils/sanitizer.ts
  function sanitizeText(input, maxLen = 500) {
    if (!input) return "";
    const clean = input.replace(/<[^>]*>/g, "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
    return clean.length > maxLen ? clean.substring(0, maxLen) + "\u2026" : clean;
  }
  function sanitizeUrl(rawUrl) {
    if (!rawUrl) return "";
    try {
      const parsed = new URL(rawUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return "";
      }
      const cleanHref = parsed.href;
      return cleanHref.endsWith("/") && parsed.pathname === "/" && !rawUrl.endsWith("/") ? cleanHref.slice(0, -1) : cleanHref;
    } catch {
      return "";
    }
  }
  function extractUrlsFromText(text) {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+)/gi;
    const matches = text.match(urlRegex) || [];
    const uniqueUrls = Array.from(new Set(matches.map((u) => sanitizeUrl(u)).filter(Boolean)));
    return uniqueUrls.slice(0, 15);
  }

  // src/content/outlook.ts
  console.log("[TRACE-X Sentinel] Outlook content script active.");
  var lastAnalyzedFingerprint = "";
  var injectedButton = null;
  var debounceTimer = null;
  var observer = new MutationObserver(() => {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(detectAndProcessOutlookEmail, 350);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("popstate", () => setTimeout(detectAndProcessOutlookEmail, 500));
  window.addEventListener("hashchange", () => setTimeout(detectAndProcessOutlookEmail, 500));
  detectAndProcessOutlookEmail();
  setTimeout(detectAndProcessOutlookEmail, 1e3);
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "EXTRACT_EMAIL" || message.type === "GET_CURRENT_EMAIL") {
      const pane = document.querySelector('[aria-label="Reading Pane"], div[role="main"], .ReadingPaneContainer') || document.body;
      const emailData = extractOutlookData(pane);
      if (emailData && emailData.sender) {
        chrome.storage.local.set({ tracex_last_email: emailData }).catch(() => {
        });
        sendResponse({ email: emailData });
      } else {
        sendResponse({ email: null, reason: "No message open in Outlook" });
      }
      return true;
    }
  });
  function detectAndProcessOutlookEmail() {
    const readingPane = document.querySelector('[aria-label="Reading Pane"], div[role="main"], .ReadingPaneContainer');
    if (!readingPane) return;
    const emailData = extractOutlookData(readingPane);
    if (!emailData || !emailData.sender) return;
    const currentFp = `${emailData.sender}|${emailData.subject}|${emailData.timestamp}`;
    if (currentFp === lastAnalyzedFingerprint && injectedButton && document.body.contains(injectedButton)) {
      return;
    }
    lastAnalyzedFingerprint = currentFp;
    try {
      chrome.runtime.sendMessage({
        type: "EMAIL_EXTRACTED",
        payload: emailData
      });
    } catch (e) {
    }
    attachOutlookLinkInspectors(readingPane);
  }
  function extractOutlookData(pane) {
    try {
      let subject = "";
      const subjectEl = pane.querySelector('[role="heading"], .expandedHeaderSubject, [data-log-name="Subject"]');
      if (subjectEl && subjectEl.textContent) {
        subject = sanitizeText(subjectEl.textContent.trim(), 200);
      }
      let sender = "";
      let senderName = "";
      const senderEl = pane.querySelector('[data-log-name="From"], .expandedHeaderFrom, [aria-label*="From:"]');
      if (senderEl) {
        sender = senderEl.getAttribute("title") || senderEl.textContent || "";
        senderName = senderEl.textContent || "";
      }
      let bodyText = "";
      const bodyEl = pane.querySelector('[aria-label="Message body"], .ItemPartBody, [data-log-name="Body"]');
      if (bodyEl) {
        bodyText = sanitizeText(bodyEl.textContent || "", 3e3);
      } else {
        bodyText = sanitizeText(pane.innerText || "", 1500);
      }
      if (!subject) {
        const fwdMatch = bodyText.match(/Subject:\s*([^\n\r]+)/i);
        if (fwdMatch && fwdMatch[1]) subject = sanitizeText(fwdMatch[1].trim(), 200);
      }
      const urls = extractUrlsFromText(bodyText);
      return {
        source: "outlook",
        sender: sender.trim() || "unknown@outlook.com",
        senderName: senderName.trim(),
        recipients: ["user@enterprise.com"],
        subject: subject.trim() || "Outlook Email",
        timestamp: (/* @__PURE__ */ new Date()).toUTCString(),
        bodyText,
        urls
      };
    } catch (err) {
      return null;
    }
  }
  function attachOutlookLinkInspectors(container) {
    const bodyEl = container.querySelector('[aria-label="Message body"], .ItemPartBody, [data-log-name="Body"]') || container;
    const anchors = bodyEl.querySelectorAll("a[href]:not(.tracex-inspected)");
    anchors.forEach((a) => {
      a.classList.add("tracex-inspected");
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.includes("microsoft.com") || href.includes("live.com") || href.includes("office.com")) return;
      let tooltip = null;
      a.addEventListener("mouseenter", () => {
        const rect = a.getBoundingClientRect();
        let domain = href;
        try {
          domain = new URL(href).hostname;
        } catch {
        }
        tooltip = document.createElement("div");
        tooltip.className = "tracex-link-inspector-tooltip";
        tooltip.style.top = `${window.scrollY + rect.bottom + 4}px`;
        tooltip.style.left = `${window.scrollX + Math.max(8, rect.left)}px`;
        tooltip.innerHTML = `
        <div class="tracex-tooltip-header">
          <span class="tracex-tooltip-title">Link Safety Check</span>
          <span class="tracex-tooltip-badge warning">Unverified</span>
        </div>
        <div class="tracex-tooltip-domain">${escapeHtml(domain)}</div>
        <button class="tracex-tooltip-action">Scan Link Safety</button>
      `;
        document.body.appendChild(tooltip);
        const traceBtn = tooltip.querySelector(".tracex-tooltip-action");
        if (traceBtn) {
          traceBtn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            traceBtn.textContent = "Scanning...";
            chrome.runtime.sendMessage({ type: "TRACE_LINK", url: href }, (res) => {
              if (res && res.data && tooltip) {
                const d = res.data;
                const isSafe = !d.is_suspicious && d.reputation_score >= 70;
                tooltip.innerHTML = `
                <div class="tracex-tooltip-header">
                  <span class="tracex-tooltip-title">Safety Result</span>
                  <span class="tracex-tooltip-badge ${isSafe ? "safe" : "critical"}">${isSafe ? "Safe Link" : "Suspicious"}</span>
                </div>
                <div style="font-size: 11px; color: #CBD5E1; margin-bottom: 2px;">Reputation: <b>${d.reputation_score}/100</b></div>
                <div style="font-size: 10px; color: #94A3B8;">${isSafe ? "No malicious indicators detected." : escapeHtml(d.risk_factors.join(" \xB7 "))}</div>
              `;
              }
            });
          });
        }
      });
      a.addEventListener("mouseleave", () => {
        setTimeout(() => {
          if (tooltip && document.body.contains(tooltip)) {
            tooltip.remove();
            tooltip = null;
          }
        }, 400);
      });
    });
  }
  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
})();
