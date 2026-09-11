import { ExtractedEmail, AnalysisVerdict } from '../types/investigation';
import { tracexClient } from '../api/tracex-client';

// Keep in-memory cache in service worker across popup closes
const verdictCache = new Map<string, AnalysisVerdict>();
let currentActiveEmail: ExtractedEmail | null = null;

// Badge severity color mapping
const BADGE_COLORS: Record<string, string> = {
  CRITICAL: '#E10600',
  HIGH: '#E10600',
  WARNING: '#F59E0B',
  MEDIUM: '#F59E0B',
  LOW: '#22C55E',
  SAFE: '#22C55E',
  UNVERIFIED: '#6B7280',
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Anveshak] Background Service Worker initialized.');
});

// Enable side panel on action click if supported
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EMAIL_EXTRACTED') {
    currentActiveEmail = message.payload as ExtractedEmail;
    chrome.storage.local.set({ tracex_last_email: currentActiveEmail }).catch(() => {});
    
    // Check if we already have a cached verdict for this email
    const cacheKey = `${currentActiveEmail.sender}|${currentActiveEmail.subject}`;
    if (verdictCache.has(cacheKey)) {
      const verdict = verdictCache.get(cacheKey)!;
      updateBadge(verdict.severity, verdict.risk_score, sender.tab?.id);
      sendResponse({ status: 'CACHED', verdict });
      return true;
    }

    sendResponse({ status: 'DETECTED', email: currentActiveEmail });
    return true;
  }

  if (message.type === 'GET_CURRENT_EMAIL') {
    // Check in-memory first, then storage
    if (currentActiveEmail) {
      const cacheKey = `${currentActiveEmail.sender}|${currentActiveEmail.subject}`;
      const verdict = verdictCache.get(cacheKey) || null;
      sendResponse({ email: currentActiveEmail, verdict });
    } else {
      chrome.storage.local.get(['tracex_last_email'], (result) => {
        const stored = result.tracex_last_email || null;
        if (stored) currentActiveEmail = stored;
        const cacheKey = stored ? `${stored.sender}|${stored.subject}` : '';
        const verdict = cacheKey ? verdictCache.get(cacheKey) || null : null;
        sendResponse({ email: stored, verdict });
      });
    }
    return true;
  }

  if (message.type === 'REQUEST_ANALYSIS') {
    const emailToAnalyze = (message.payload || currentActiveEmail) as ExtractedEmail;
    if (!emailToAnalyze) {
      sendResponse({ error: 'No active email detected to analyze.' });
      return true;
    }

    tracexClient.analyzeEmail(emailToAnalyze)
      .then((verdict) => {
        const cacheKey = `${emailToAnalyze.sender}|${emailToAnalyze.subject}`;
        verdictCache.set(cacheKey, verdict);
        updateBadge(verdict.severity, verdict.risk_score, sender.tab?.id);
        sendResponse({ success: true, verdict });
      })
      .catch((err) => {
        sendResponse({ error: err.message || 'Analysis failed' });
      });

    return true; // Keep message channel open for async response
  }

  if (message.type === 'OPEN_SIDE_PANEL') {
    if (sender.tab?.id && chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ tabId: sender.tab.id }).catch((err) => {
        console.warn('Could not open side panel:', err);
      });
    }
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === 'TRACE_LINK') {
    tracexClient.traceLink(message.url)
      .then((res) => sendResponse({ success: true, data: res }))
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});

function updateBadge(severity: string, score: number, tabId?: number) {
  const badgeText = severity === 'SAFE' ? 'SAFE' : `${Math.round(score)}`;
  const badgeColor = BADGE_COLORS[severity] || '#6B7280';

  chrome.action.setBadgeText({ text: badgeText, tabId });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor, tabId });
}
