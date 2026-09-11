import { ExtractedEmail } from '../types/investigation';
import { extractUrlsFromText, sanitizeText } from '../utils/sanitizer';

console.log('[Anveshak] Gmail content script active.');

let lastAnalyzedFingerprint = '';
let currentEmailData: ExtractedEmail | null = null;
let injectedButton: HTMLElement | null = null;

// Debounced DOM observer
let debounceTimer: number | null = null;
const observer = new MutationObserver(() => {
  if (debounceTimer) window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(detectAndProcessEmailView, 300);
});

observer.observe(document.body, { childList: true, subtree: true });

// Listen for SPA navigation in Gmail (URL/hash change)
window.addEventListener('popstate', () => setTimeout(detectAndProcessEmailView, 500));
window.addEventListener('hashchange', () => setTimeout(detectAndProcessEmailView, 500));

// Run initial detection immediately and staged
detectAndProcessEmailView();
setTimeout(detectAndProcessEmailView, 800);
setTimeout(detectAndProcessEmailView, 2000);

// Respond immediately to on-demand extraction requests from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'EXTRACT_EMAIL' || message.type === 'GET_CURRENT_EMAIL') {
    const emailView = findActiveEmailContainer() || (document.querySelector('div[role="main"]') as HTMLElement) || document.body;
    const emailData = extractGmailData(emailView);
    if (emailData && emailData.sender) {
      currentEmailData = emailData;
      chrome.storage.local.set({ tracex_last_email: emailData }).catch(() => {});
      sendResponse({ email: emailData });
    } else if (currentEmailData) {
      sendResponse({ email: currentEmailData });
    } else {
      sendResponse({ email: null, reason: 'No message open in Gmail' });
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

  // Persist in local storage and inform background worker
  chrome.storage.local.set({ tracex_last_email: emailData }).catch(() => {});

  try {
    chrome.runtime.sendMessage({
      type: 'EMAIL_EXTRACTED',
      payload: emailData,
    });
  } catch (e) {
    // Context invalidated during reload
  }

  attachLinkHoverInspectors(emailView);
}

function findActiveEmailContainer(): HTMLElement | null {
  // Check common Gmail message containers
  const selectors = [
    'div[role="main"] div[data-message-id]',
    'div[role="main"] .adn',
    'div[role="main"] .gs',
    'div[role="main"] .h7',
    'div[role="main"] .gE',
    'div.nH.hx',
    'div[role="main"] .ii.gt',
    'div[role="main"]',
    '.nH.if'
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector) as HTMLElement;
    if (el && (el.innerText || el.textContent) && (el.innerText || el.textContent)!.length > 10) {
      return el;
    }
  }
  return document.querySelector('div[role="main"]') as HTMLElement || document.body;
}

function extractGmailData(container: HTMLElement): ExtractedEmail | null {
  try {
    const mainPane = document.querySelector('div[role="main"]') as HTMLElement || container || document.body;

    // 1. Subject extraction (Strictly targeting currently open email view)
    let subject = '';

    // Primary: Gmail thread subject element (class .hP)
    const subjectEl = mainPane.querySelector('h2.hP, .hP, [data-legacy-thread-id], [data-thread-perm-id]') ||
                      document.querySelector('h2.hP, .hP');
    if (subjectEl && subjectEl.textContent) {
      const candidate = sanitizeText(subjectEl.textContent.trim(), 200);
      if (candidate && !candidate.toLowerCase().startsWith('search results') && candidate !== 'Gmail') {
        subject = candidate;
      }
    }

    // 2. Body Text & URLs
    let bodyText = '';
    const bodyEls = mainPane.querySelectorAll('.a3s.aiL, .a3s, div[dir="ltr"], .ii.gt');
    if (bodyEls && bodyEls.length > 0) {
      const texts: string[] = [];
      bodyEls.forEach((el) => {
        if (el.textContent) texts.push(el.textContent);
      });
      bodyText = sanitizeText(texts.join('\n\n'), 4000);
    }
    if (!bodyText) {
      bodyText = sanitizeText(mainPane.innerText || mainPane.textContent || '', 2500);
    }

    // Secondary subject fallback: from Forwarded message block inside the email body
    if (!subject) {
      const fwdSubjectMatch = bodyText.match(/Subject:\s*([^\n\r]+)/i);
      if (fwdSubjectMatch && fwdSubjectMatch[1]) {
        subject = sanitizeText(fwdSubjectMatch[1].trim(), 200);
      }
    }

    // Tertiary fallback: document title ONLY if it represents an opened email
    if (!subject && document.title) {
      const title = document.title.replace(/\s*-\s*(Gmail|Google Workspace|Inbox).*$/i, '').trim();
      const isSearchOrList = /^(search results|inbox(\s*\(\d+\))?|sent|drafts|starred|spam|trash)$/i.test(title);
      if (title && !isSearchOrList && title !== 'Gmail') {
        subject = sanitizeText(title, 200);
      }
    }

    // 3. Sender extraction (from DOM header badges or body)
    let sender = '';
    let senderName = '';

    // Search header spans in DOM
    const senderEls = document.querySelectorAll('span.gD[email], span[email], span.gD, span.zF, span[data-hovercard-id], span.qu[email], span[data-name]');
    for (let i = 0; i < senderEls.length; i++) {
      const el = senderEls[i];
      const emailAttr = el.getAttribute('email') || el.getAttribute('data-hovercard-id') || '';
      const nameAttr = el.getAttribute('name') || el.getAttribute('data-name') || el.textContent || '';
      if (emailAttr && emailAttr.includes('@')) {
        sender = emailAttr;
        senderName = nameAttr;
        break;
      }
      if (el.textContent && el.textContent.includes('@')) {
        sender = el.textContent.trim();
        senderName = nameAttr;
        break;
      }
    }

    // If sender not found in spans, look for Forwarded message headers in bodyText
    const fwdMatch = bodyText.match(/From:\s*([^<\n\r]+)?\s*<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/i) ||
                     bodyText.match(/From:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (fwdMatch) {
      if (!sender) {
        sender = (fwdMatch[2] || fwdMatch[1]).trim();
        senderName = (fwdMatch[1] && fwdMatch[2] ? fwdMatch[1].trim() : sender);
      }
    }

    // Fallback: search any email regex in the main container
    if (!sender) {
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
      const allFound = (mainPane.innerText || '').match(emailRegex);
      if (allFound && allFound.length > 0) {
        sender = allFound[0];
      }
    }

    if (!sender && !subject && (!bodyText || bodyText.length < 15)) {
      return null;
    }

    // 4. Recipients
    const recipients: string[] = [];
    const recipientEls = document.querySelectorAll('.g2, span.hb[email], span[data-hovercard-id], span.qu[email]');
    recipientEls.forEach((el) => {
      const email = el.getAttribute('email') || el.getAttribute('data-hovercard-id') || el.textContent;
      if (email && email.includes('@') && !recipients.includes(email)) {
        recipients.push(email.trim());
      }
    });

    // 5. Timestamp
    let timestamp = '';
    const dateEl = mainPane.querySelector('.g3, .gH span, [data-timestamp], span.g3[title]');
    if (dateEl) {
      timestamp = dateEl.getAttribute('title') || dateEl.textContent || '';
    }

    // 6. Extract URLs
    const links: string[] = [];
    const anchorEls = mainPane.querySelectorAll('a[href]');
    anchorEls.forEach((a) => {
      const href = a.getAttribute('href');
      if (href && !href.startsWith('mailto:') && !href.startsWith('javascript:') && !href.startsWith('#')) {
        links.push(href);
      }
    });

    const allUrls = Array.from(new Set([...links, ...extractUrlsFromText(bodyText)]));

    return {
      source: 'gmail',
      sender: sender.trim() || 'investigation-target@webmail.com',
      senderName: senderName.trim(),
      recipients: recipients.length > 0 ? recipients : ['user@enterprise.com'],
      subject: subject.trim() || 'Email Investigation Artifact',
      timestamp: timestamp.trim() || new Date().toUTCString(),
      bodyText,
      urls: allUrls.slice(0, 10),
    };
  } catch (err) {
    console.warn('[TRACE-X Sentinel] Extraction warning:', err);
    return null;
  }
}

let activeTooltipEl: HTMLElement | null = null;
let tooltipRemoveTimer: number | null = null;

function removeAllLinkTooltips() {
  if (tooltipRemoveTimer) {
    window.clearTimeout(tooltipRemoveTimer);
    tooltipRemoveTimer = null;
  }
  document.querySelectorAll('.tracex-link-inspector-tooltip').forEach((el) => el.remove());
  activeTooltipEl = null;
}

function scheduleTooltipRemoval(delayMs = 250) {
  if (tooltipRemoveTimer) window.clearTimeout(tooltipRemoveTimer);
  tooltipRemoveTimer = window.setTimeout(() => {
    removeAllLinkTooltips();
  }, delayMs);
}

// Clean up tooltips on page scroll
window.addEventListener('scroll', () => removeAllLinkTooltips(), { passive: true });

function attachLinkHoverInspectors(container: HTMLElement) {
  // Only target links inside the actual email message body (ignore Gmail top navbar / account links)
  const bodyEl = container.querySelector('.a3s.aiL, .a3s, div[dir="ltr"], .ii.gt');
  if (!bodyEl) return;

  const anchors = bodyEl.querySelectorAll('a[href]:not(.tracex-inspected)');
  anchors.forEach((a) => {
    a.classList.add('tracex-inspected');
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.includes('google.com') || href.includes('gstatic.com')) return;

    (a as HTMLElement).addEventListener('mouseenter', () => {
      // Immediately purge any existing open tooltips to prevent overlapping
      removeAllLinkTooltips();

      const rect = a.getBoundingClientRect();
      const domain = extractDomain(href);

      const tooltip = document.createElement('div');
      tooltip.className = 'tracex-link-inspector-tooltip';

      // Smart viewport fixed positioning to prevent link coverage or bottom overflow
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
        <button class="tracex-tooltip-action" id="trace-btn-${Math.random().toString(36).substring(7)}">
          Scan Link Safety
        </button>
      `;

      document.body.appendChild(tooltip);
      activeTooltipEl = tooltip;

      // Keep tooltip visible when mouse hovers inside the tooltip itself
      tooltip.addEventListener('mouseenter', () => {
        if (tooltipRemoveTimer) {
          window.clearTimeout(tooltipRemoveTimer);
          tooltipRemoveTimer = null;
        }
      });

      tooltip.addEventListener('mouseleave', () => {
        scheduleTooltipRemoval(150);
      });

      const traceBtn = tooltip.querySelector('.tracex-tooltip-action');
      if (traceBtn) {
        traceBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          traceBtn.textContent = 'Scanning...';
          chrome.runtime.sendMessage({ type: 'TRACE_LINK', url: href }, (res) => {
            if (res && res.data && activeTooltipEl === tooltip && document.body.contains(tooltip)) {
              const d = res.data;
              const isSafe = !d.is_suspicious && d.reputation_score >= 70;
              tooltip.innerHTML = `
                <div class="tracex-tooltip-header">
                  <span class="tracex-tooltip-title">Safety Result</span>
                  <span class="tracex-tooltip-badge ${isSafe ? 'safe' : 'critical'}">${isSafe ? 'Safe Link' : 'Suspicious'}</span>
                </div>
                <div style="font-size: 11px; color: #334155; margin-bottom: 2px;">
                  Reputation: <b>${d.reputation_score}/100</b>
                </div>
                <div style="font-size: 10px; color: #64748B; line-height: 1.3;">
                  ${isSafe ? 'No malicious redirects or threat indicators detected.' : escapeHtml(d.risk_factors.join(' · '))}
                </div>
              `;
            }
          });
        });
      }
    });

    (a as HTMLElement).addEventListener('mouseleave', () => {
      scheduleTooltipRemoval(250);
    });
  });
}

function extractDomain(urlStr: string): string {
  try {
    return new URL(urlStr).hostname;
  } catch {
    return urlStr.substring(0, 30);
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
