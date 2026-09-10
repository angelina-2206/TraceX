import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeUrl, extractUrlsFromText, computeEmailFingerprint } from '../src/utils/sanitizer';

describe('Security Sanitizer & Fingerprinting', () => {
  it('strips script tags and malicious HTML injections', () => {
    const malicious = '<script>alert("XSS")</script>Urgent payment <img src="x" onerror="alert(1)">required';
    const cleaned = sanitizeText(malicious);
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('<img');
    expect(cleaned).toContain('Urgent payment');
    expect(cleaned).toContain('required');
  });

  it('sanitizes unsafe URI schemes', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    expect(sanitizeUrl('https://micr0soft-login.net/verify')).toBe('https://micr0soft-login.net/verify');
    expect(sanitizeUrl('http://insecure-portal.com/login')).toBe('http://insecure-portal.com/login');
  });

  it('extracts unique valid URLs from body text', () => {
    const body = 'Please visit https://portal-sso.net/login and check https://portal-sso.net/login or http://wire-transfer.org';
    const urls = extractUrlsFromText(body);
    expect(urls).toHaveLength(2);
    expect(urls).toContain('https://portal-sso.net/login');
    expect(urls).toContain('http://wire-transfer.org');
  });

  it('computes stable deterministic fingerprints for identical emails', () => {
    const fp1 = computeEmailFingerprint('ceo@vendor.com', 'Invoice #102', 'Sun, 30 Aug 2026', 'Please pay immediately');
    const fp2 = computeEmailFingerprint('ceo@vendor.com', 'Invoice #102', 'Sun, 30 Aug 2026', 'Please pay immediately');
    const fp3 = computeEmailFingerprint('attacker@fraud.com', 'Invoice #102', 'Sun, 30 Aug 2026', 'Please pay immediately');

    expect(fp1).toBe(fp2);
    expect(fp1).not.toBe(fp3);
  });
});
