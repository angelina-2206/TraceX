---
title: "Certificate Analysis"
category: "web"
source: "TRACE-X Knowledge Base"
---

# SSL/TLS Certificate Analysis

SSL/TLS certificates provide encryption and authentication for web traffic. Analyzing certificate characteristics can reveal important information about whether a website is legitimate or potentially malicious.

## Certificate Authorities and Trust

**Free certificate authorities** like Let's Encrypt issue Domain Validation (DV) certificates that only verify domain ownership. While essential for internet security, these certificates are also commonly used by phishing sites because they are free, automated, and require no identity verification.

**Organization Validation (OV)** and **Extended Validation (EV)** certificates require verified organizational identity and are less commonly used by threat actors due to the verification requirements.

## Suspicious Certificate Patterns

- Certificate issued very recently (same day or week as domain registration)
- Certificate subject does not match the visual branding on the page
- Self-signed certificates on public-facing websites
- Wildcard certificates used on phishing infrastructure
- Certificates issued to generic or anonymous entities
- Short validity periods (less than 30 days)

## What Certificates Cannot Tell You

- A valid HTTPS connection does NOT mean a website is safe
- Free certificates are used by millions of legitimate websites
- Certificate presence alone should not influence trust decisions
- Certificate revocation may not be enforced by all browsers

## Investigation Approach

When analyzing certificates during threat investigation:
1. Check the certificate issuer and validation level
2. Compare the certificate issuance date against the domain registration date
3. Verify that the certificate subject matches the claimed organization
4. Look for certificate transparency logs showing related certificates
5. Check if the certificate has been revoked or flagged
