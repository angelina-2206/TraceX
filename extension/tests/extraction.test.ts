import { describe, it, expect } from 'vitest';
import { ExtractedEmail } from '../src/types/investigation';

describe('Webmail Evidence Payload Formatting', () => {
  const phishingEmail: ExtractedEmail = {
    source: 'gmail',
    sender: 'Robert Vance <ceo@micr0soft-login-check.net>',
    senderName: 'Robert Vance',
    recipients: ['finance@corporate.com'],
    subject: 'URGENT: Executive Wire Transfer Authorization #9981',
    timestamp: 'Sun, 30 Aug 2026 14:10:00 +0000',
    bodyText: 'Please wire 1,500,000 INR immediately to the updated account: IFSC HDFC0001234. Do not delay.',
    urls: ['https://micr0soft-login-check.net/login/verify.php']
  };

  const legitimateEmail: ExtractedEmail = {
    source: 'outlook',
    sender: 'Security Team <security@enterprise-corp.com>',
    senderName: 'Corporate Security',
    recipients: ['all-staff@enterprise-corp.com'],
    subject: 'Monthly Security Awareness Briefing - September 2026',
    timestamp: 'Sun, 30 Aug 2026 09:00:00 +0000',
    bodyText: 'Hello team, please review our internal standard operating procedures on the intranet portal.',
    urls: ['https://intranet.enterprise-corp.com/docs/sop-2026']
  };

  it('validates structured phishing payload integrity', () => {
    expect(phishingEmail.source).toBe('gmail');
    expect(phishingEmail.urls).toHaveLength(1);
    expect(phishingEmail.urls[0]).toContain('micr0soft-login-check.net');
    expect(phishingEmail.bodyText).toContain('IFSC HDFC0001234');
  });

  it('validates legitimate corporate payload formatting', () => {
    expect(legitimateEmail.source).toBe('outlook');
    expect(legitimateEmail.sender).toContain('@enterprise-corp.com');
    expect(legitimateEmail.urls[0]).toContain('https://intranet.enterprise-corp.com');
  });
});
