---
title: "Credential Phishing"
category: "phishing"
technique_id: "T1566.002"
source: "TRACE-X Knowledge Base"
---

# Credential Phishing

Credential phishing is a targeted attack where adversaries create fake login pages designed to harvest usernames, passwords, multi-factor authentication tokens, and other authentication credentials.

## How Credential Phishing Works

1. **Lure Delivery**: The attacker sends an email, message, or social media post containing a link to a fake login page.
2. **Deceptive Landing**: The victim clicks the link and arrives at a page that visually replicates a legitimate service's login interface.
3. **Credential Capture**: When the victim enters their credentials, the data is sent to the attacker's server.
4. **Transparent Redirect**: Many credential phishing pages forward the victim to the real service after capture, making the victim believe the login simply failed or succeeded.

## Common Targeted Services

- Microsoft 365 / Outlook
- Google Workspace / Gmail
- Corporate SSO portals
- Banking and financial platforms
- Social media platforms
- Cloud service providers (AWS, Azure)

## Technical Characteristics

**Domain Impersonation**: Fake login pages are hosted on domains designed to look legitimate. Common patterns include:
- login-microsoft365.com (hyphenated brand name)
- microsoft.account-verify.com (brand in subdomain)
- microsft.com (typosquatting)

**Redirect Chains**: Credential phishing campaigns commonly use multiple redirects to:
- Evade URL reputation checks
- Filter out automated analysis tools
- Geofence victims to specific regions
- Add tracking parameters

**Page Characteristics**: Fake login pages often include:
- Exact visual replicas of legitimate login forms
- Stolen CSS and branding assets
- JavaScript that validates input format before submission
- Anti-analysis techniques (detecting headless browsers, VPNs)

## Investigation Approach

When analyzing a suspected credential phishing URL:
1. Check the domain registration date and registrar
2. Analyze the full redirect chain
3. Compare the landing page HTML against known phishing kits
4. Check VirusTotal for malicious detections
5. Review AbuseIPDB for hosting IP reputation
6. Determine if the domain uses a newly issued certificate
