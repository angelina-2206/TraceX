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

  // src/content/gmail.ts
  console.log("[TRACE-X Sentinel] Gmail content script active.");
  var lastAnalyzedFingerprint = "";
  var currentEmailData = null;
  var injectedButton = null;
  var debounceTimer = null;
  var observer = new MutationObserver(() => {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(detectAndProcessEmailView, 300);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("popstate", () => setTimeout(detectAndProcessEmailView, 500));
  window.addEventListener("hashchange", () => setTimeout(detectAndProcessEmailView, 500));
  detectAndProcessEmailView();
  setTimeout(detectAndProcessEmailView, 800);
  setTimeout(detectAndProcessEmailView, 2e3);
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "EXTRACT_EMAIL" || message.type === "GET_CURRENT_EMAIL") {
      const emailView = findActiveEmailContainer() || document.querySelector('div[role="main"]') || document.body;
      const emailData = extractGmailData(emailView);
      if (emailData && emailData.sender) {
        currentEmailData = emailData;
        chrome.storage.local.set({ tracex_last_email: emailData }).catch(() => {
        });
        sendResponse({ email: emailData });
      } else if (currentEmailData) {
        sendResponse({ email: currentEmailData });
      } else {
        sendResponse({ email: null, reason: "No message open in Gmail" });
      }
      return true;
    }
  });
  function detectAndProcessEmailView() {
    const emailView = findActiveEmailContainer();
    if (!emailView) {
      if (injectedButton && !document.body.contains(injectedButton)) {
        injectedButton = null;
      }
      return;
    }
    const emailData = extractGmailData(emailView);
    if (!emailData || !emailData.sender) return;
    const currentFp = `${emailData.sender}|${emailData.subject}|${emailData.timestamp}`;
    if (currentFp === lastAnalyzedFingerprint && injectedButton && document.body.contains(injectedButton)) {
      return;
    }
    lastAnalyzedFingerprint = currentFp;
    currentEmailData = emailData;
    chrome.storage.local.set({ tracex_last_email: emailData }).catch(() => {
    });
    try {
      chrome.runtime.sendMessage({
        type: "EMAIL_EXTRACTED",
        payload: emailData
      });
    } catch (e) {
    }
    attachLinkHoverInspectors(emailView);
  }
  function findActiveEmailContainer() {
    const selectors = [
      'div[role="main"] div[data-message-id]',
      'div[role="main"] .adn',
      'div[role="main"] .gs',
      'div[role="main"] .h7',
      'div[role="main"] .gE',
      "div.nH.hx",
      'div[role="main"] .ii.gt',
      'div[role="main"]',
      ".nH.if"
    ];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && (el.innerText || el.textContent) && (el.innerText || el.textContent).length > 10) {
        return el;
      }
    }
    return document.querySelector('div[role="main"]') || document.body;
  }
  function extractGmailData(container) {
    try {
      const mainPane = document.querySelector('div[role="main"]') || container || document.body;
      let subject = "";
      const subjectEl = mainPane.querySelector("h2.hP, .hP, [data-legacy-thread-id], [data-thread-perm-id]") || document.querySelector("h2.hP, .hP");
      if (subjectEl && subjectEl.textContent) {
        const candidate = sanitizeText(subjectEl.textContent.trim(), 200);
        if (candidate && !candidate.toLowerCase().startsWith("search results") && candidate !== "Gmail") {
          subject = candidate;
        }
      }
      let bodyText = "";
      const bodyEls = mainPane.querySelectorAll('.a3s.aiL, .a3s, div[dir="ltr"], .ii.gt');
      if (bodyEls && bodyEls.length > 0) {
        const texts = [];
        bodyEls.forEach((el) => {
          if (el.textContent) texts.push(el.textContent);
        });
        bodyText = sanitizeText(texts.join("\n\n"), 4e3);
      }
      if (!bodyText) {
        bodyText = sanitizeText(mainPane.innerText || mainPane.textContent || "", 2500);
      }
      if (!subject) {
        const fwdSubjectMatch = bodyText.match(/Subject:\s*([^\n\r]+)/i);
        if (fwdSubjectMatch && fwdSubjectMatch[1]) {
          subject = sanitizeText(fwdSubjectMatch[1].trim(), 200);
        }
      }
      if (!subject && document.title) {
        const title = document.title.replace(/\s*-\s*(Gmail|Google Workspace|Inbox).*$/i, "").trim();
        const isSearchOrList = /^(search results|inbox(\s*\(\d+\))?|sent|drafts|starred|spam|trash)$/i.test(title);
        if (title && !isSearchOrList && title !== "Gmail") {
          subject = sanitizeText(title, 200);
        }
      }
      let sender = "";
      let senderName = "";
      const senderEls = document.querySelectorAll("span.gD[email], span[email], span.gD, span.zF, span[data-hovercard-id], span.qu[email], span[data-name]");
      for (let i = 0; i < senderEls.length; i++) {
        const el = senderEls[i];
        const emailAttr = el.getAttribute("email") || el.getAttribute("data-hovercard-id") || "";
        const nameAttr = el.getAttribute("name") || el.getAttribute("data-name") || el.textContent || "";
        if (emailAttr && emailAttr.includes("@")) {
          sender = emailAttr;
          senderName = nameAttr;
          break;
        }
        if (el.textContent && el.textContent.includes("@")) {
          sender = el.textContent.trim();
          senderName = nameAttr;
          break;
        }
      }
      const fwdMatch = bodyText.match(/From:\s*([^<\n\r]+)?\s*<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/i) || bodyText.match(/From:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
      if (fwdMatch) {
        if (!sender) {
          sender = (fwdMatch[2] || fwdMatch[1]).trim();
          senderName = fwdMatch[1] && fwdMatch[2] ? fwdMatch[1].trim() : sender;
        }
      }
      if (!sender) {
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const allFound = (mainPane.innerText || "").match(emailRegex);
        if (allFound && allFound.length > 0) {
          sender = allFound[0];
        }
      }
      if (!sender && !subject && (!bodyText || bodyText.length < 15)) {
        return null;
      }
      const recipients = [];
      const recipientEls = document.querySelectorAll(".g2, span.hb[email], span[data-hovercard-id], span.qu[email]");
      recipientEls.forEach((el) => {
        const email = el.getAttribute("email") || el.getAttribute("data-hovercard-id") || el.textContent;
        if (email && email.includes("@") && !recipients.includes(email)) {
          recipients.push(email.trim());
        }
      });
      let timestamp = "";
      const dateEl = mainPane.querySelector(".g3, .gH span, [data-timestamp], span.g3[title]");
      if (dateEl) {
        timestamp = dateEl.getAttribute("title") || dateEl.textContent || "";
      }
      const links = [];
      const anchorEls = mainPane.querySelectorAll("a[href]");
      anchorEls.forEach((a) => {
        const href = a.getAttribute("href");
        if (href && !href.startsWith("mailto:") && !href.startsWith("javascript:") && !href.startsWith("#")) {
          links.push(href);
        }
      });
      const allUrls = Array.from(/* @__PURE__ */ new Set([...links, ...extractUrlsFromText(bodyText)]));
      return {
        source: "gmail",
        sender: sender.trim() || "investigation-target@webmail.com",
        senderName: senderName.trim(),
        recipients: recipients.length > 0 ? recipients : ["user@enterprise.com"],
        subject: subject.trim() || "Email Investigation Artifact",
        timestamp: timestamp.trim() || (/* @__PURE__ */ new Date()).toUTCString(),
        bodyText,
        urls: allUrls.slice(0, 10)
      };
    } catch (err) {
      console.warn("[TRACE-X Sentinel] Extraction warning:", err);
      return null;
    }
  }
  function attachLinkHoverInspectors(container) {
    const bodyEl = container.querySelector('.a3s.aiL, .a3s, div[dir="ltr"], .ii.gt');
    if (!bodyEl) return;
    const anchors = bodyEl.querySelectorAll("a[href]:not(.tracex-inspected)");
    anchors.forEach((a) => {
      a.classList.add("tracex-inspected");
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.includes("google.com") || href.includes("gstatic.com")) return;
      let tooltip = null;
      a.addEventListener("mouseenter", () => {
        const rect = a.getBoundingClientRect();
        const domain = extractDomain(href);
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
        <button class="tracex-tooltip-action" id="trace-btn-${Math.random().toString(36).substring(7)}">
          Scan Link Safety
        </button>
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
                <div style="font-size: 11px; color: #CBD5E1; margin-bottom: 2px;">
                  Reputation: <b>${d.reputation_score}/100</b>
                </div>
                <div style="font-size: 10px; color: #94A3B8; line-height: 1.3;">
                  ${isSafe ? "No malicious redirects or threat indicators detected." : escapeHtml(d.risk_factors.join(" \xB7 "))}
                </div>
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
  function extractDomain(urlStr) {
    try {
      return new URL(urlStr).hostname;
    } catch {
      return urlStr.substring(0, 30);
    }
  }
  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
})();
