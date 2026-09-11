/**
 * Security Sanitization Utilities for Anveshak
 * Strictly isolates all untrusted webmail inputs (HTML, scripts, payloads).
 */

export function sanitizeText(input: string | null | undefined, maxLen = 500): string {
  if (!input) return '';
  // Strip control characters and HTML tags
  const clean = input
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
  return clean.length > maxLen ? clean.substring(0, maxLen) + '…' : clean;
}

export function sanitizeUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    const cleanHref = parsed.href;
    return (cleanHref.endsWith('/') && parsed.pathname === '/' && !rawUrl.endsWith('/')) ? cleanHref.slice(0, -1) : cleanHref;
  } catch {
    return '';
  }
}

export function extractUrlsFromText(text: string): string[] {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+)/gi;
  const matches = text.match(urlRegex) || [];
  const uniqueUrls = Array.from(new Set(matches.map(u => sanitizeUrl(u)).filter(Boolean)));
  return uniqueUrls.slice(0, 15); // Cap at 15 URLs
}

export function computeEmailFingerprint(sender: string, subject: string, timestamp?: string, bodySnippet?: string): string {
  const payload = `${sender.toLowerCase().trim()}|${subject.toLowerCase().trim()}|${(timestamp || '').trim()}|${(bodySnippet || '').substring(0, 80).trim()}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'fp_' + Math.abs(hash).toString(16);
}
