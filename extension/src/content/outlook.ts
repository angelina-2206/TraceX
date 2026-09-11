import { ExtractedEmail } from '../types/investigation';
import { extractUrlsFromText, sanitizeText } from '../utils/sanitizer';

console.log('[Anveshak] Outlook content script active.');

let lastAnalyzedFingerprint = '';
let injectedButton: HTMLElement | null = null;

let debounceTimer: number | null = null;
const observer = new MutationObserver(() => {
  if (debounceTimer) window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(detectAndProcessOutlookEmail, 350);
});

observer.observe(document.body, { childList: true, subtree: true });

// SPA navigation listeners
window.addEventListener('popstate', () => setTimeout(detectAndProcessOutlookEmail, 500));
window.addEventListener('hashchange', () => setTimeout(detectAndProcessOutlookEmail, 500));

// Initial checks
detectAndProcessOutlookEmail();
setTimeout(detectAndProcessOutlookEmail, 1000);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'EXTRACT_EMAIL' || message.type === 'GET_CURRENT_EMAIL') {
    const pane = document.querySelector('[aria-label="Reading Pane"], div[role="main"], .ReadingPaneContainer') as HTMLElement || document.body;
    const emailData = extractOutlookData(pane);
    if (emailData && emailData.sender) {
      chrome.storage.local.set({ tracex_last_email: emailData }).catch(() => {});
      sendResponse({ email: emailData });
    } else {
      sendResponse({ email: null, reason: 'No message open in Outlook' });
    }
    return true;
  }
});

function detectAndProcessOutlookEmail() {
  const readingPane = document.querySelector('[aria-label="Reading Pane"], div[role="main"], .ReadingPaneContainer') as HTMLElement;
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
      type: 'EMAIL_EXTRACTED',
      payload: emailData,
    });
  } catch (e) {}

  attachOutlookLinkInspectors(readingPane);
}

function extractOutlookData(pane: HTMLElement): ExtractedEmail | null {
  try {
    // 1. Subject
    let subject = '';
    const subjectEl = pane.querySelector('[role="heading"], .expandedHeaderSubject, [data-log-name="Subject"]');
    if (subjectEl && subjectEl.textContent) {
      subject = sanitizeText(subjectEl.textContent.trim(), 200);
    }

    // 2. Sender
    let sender = '';
    let senderName = '';
    const senderEl = pane.querySelector('[data-log-name="From"], .expandedHeaderFrom, [aria-label*="From:"]');
    if (senderEl) {
      sender = senderEl.getAttribute('title') || senderEl.textContent || '';
      senderName = senderEl.textContent || '';
    }

    // 3. Body text
    let bodyText = '';
    const bodyEl = pane.querySelector('[aria-label="Message body"], .ItemPartBody, [data-log-name="Body"]');
    if (bodyEl) {
      bodyText = sanitizeText(bodyEl.textContent || '', 3000);
    } else {
      bodyText = sanitizeText(pane.innerText || '', 1500);
    }

    // Secondary subject fallback
    if (!subject) {
      const fwdMatch = bodyText.match(/Subject:\s*([^\n\r]+)/i);
      if (fwdMatch && fwdMatch[1]) subject = sanitizeText(fwdMatch[1].trim(), 200);
    }

    const urls = extractUrlsFromText(bodyText);

    return {
      source: 'outlook',
      sender: sender.trim() || 'unknown@outlook.com',
      senderName: senderName.trim(),
      recipients: ['user@enterprise.com'],
      subject: subject.trim() || 'Outlook Email',
      timestamp: new Date().toUTCString(),
      bodyText,
      urls,
    };
  } catch (err) {
    return null;
  }
}

let activeOutlookTooltipEl: HTMLElement | null = null;
let outlookTooltipRemoveTimer: number | null = null;

function removeAllOutlookLinkTooltips() {
  if (outlookTooltipRemoveTimer) {
    window.clearTimeout(outlookTooltipRemoveTimer);
    outlookTooltipRemoveTimer = null;
  }
  document.querySelectorAll('.tracex-link-inspector-tooltip').forEach((el) => el.remove());
  activeOutlookTooltipEl = null;
}

function scheduleOutlookTooltipRemoval(delayMs = 250) {
  if (outlookTooltipRemoveTimer) window.clearTimeout(outlookTooltipRemoveTimer);
  outlookTooltipRemoveTimer = window.setTimeout(() => {
    removeAllOutlookLinkTooltips();
  }, delayMs);
}

// Clean up tooltips on page scroll
window.addEventListener('scroll', () => removeAllOutlookLinkTooltips(), { passive: true });

function attachOutlookLinkInspectors(container: HTMLElement) {
  const bodyEl = container.querySelector('[aria-label="Message body"], .ItemPartBody, [data-log-name="Body"]') || container;
  const anchors = bodyEl.querySelectorAll('a[href]:not(.tracex-inspected)');

  anchors.forEach((a) => {
    a.classList.add('tracex-inspected');
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.includes('microsoft.com') || href.includes('live.com') || href.includes('office.com')) return;

    (a as HTMLElement).addEventListener('mouseenter', () => {
      // Purge any existing open tooltips to prevent overlapping
      removeAllOutlookLinkTooltips();

      const rect = a.getBoundingClientRect();
      let domain = href;
      try { domain = new URL(href).hostname; } catch {}

      const tooltip = document.createElement('div');
      tooltip.className = 'tracex-link-inspector-tooltip';

      // Smart viewport fixed positioning
      const estimatedHeight = 78;
      const spaceBelow = window.innerHeight - rect.bottom;
      let topPos = rect.bottom + 6;
      if (spaceBelow < estimatedHeight + 15 && rect.top > estimatedHeight + 15) {
        topPos = rect.top - estimatedHeight - 6;
      }
      const leftPos = Math.max(8, Math.min(rect.left, window.innerWidth - 290));

      tooltip.style.position = 'fixed';
      tooltip.style.top = `${Math.max(8, topPos)}px`;
      tooltip.style.left = `${leftPos}px`;

      tooltip.innerHTML = `
        <div class="tracex-tooltip-header">
          <span class="tracex-tooltip-title">Link Safety Check</span>
          <span class="tracex-tooltip-badge warning">Unverified</span>
        </div>
        <div class="tracex-tooltip-domain">${escapeHtml(domain)}</div>
        <button class="tracex-tooltip-action">Scan Link Safety</button>
      `;

      document.body.appendChild(tooltip);
      activeOutlookTooltipEl = tooltip;

      // Keep tooltip visible when mouse hovers inside the tooltip itself
      tooltip.addEventListener('mouseenter', () => {
        if (outlookTooltipRemoveTimer) {
          window.clearTimeout(outlookTooltipRemoveTimer);
          outlookTooltipRemoveTimer = null;
        }
      });

      tooltip.addEventListener('mouseleave', () => {
        scheduleOutlookTooltipRemoval(150);
      });

      const traceBtn = tooltip.querySelector('.tracex-tooltip-action');
      if (traceBtn) {
        traceBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          traceBtn.textContent = 'Scanning...';
          chrome.runtime.sendMessage({ type: 'TRACE_LINK', url: href }, (res) => {
            if (res && res.data && activeOutlookTooltipEl === tooltip && document.body.contains(tooltip)) {
              const d = res.data;
              const isSafe = !d.is_suspicious && d.reputation_score >= 70;
              tooltip.innerHTML = `
                <div class="tracex-tooltip-header">
                  <span class="tracex-tooltip-title">Safety Result</span>
                  <span class="tracex-tooltip-badge ${isSafe ? 'safe' : 'critical'}">${isSafe ? 'Safe Link' : 'Suspicious'}</span>
                </div>
                <div style="font-size: 11px; color: #334155; margin-bottom: 2px;">Reputation: <b>${d.reputation_score}/100</b></div>
                <div style="font-size: 10px; color: #64748B;">${isSafe ? 'No malicious indicators detected.' : escapeHtml(d.risk_factors.join(' · '))}</div>
              `;
            }
          });
        });
      }
    });

    (a as HTMLElement).addEventListener('mouseleave', () => {
      scheduleOutlookTooltipRemoval(250);
    });
  });
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
