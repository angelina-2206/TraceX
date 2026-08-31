---
title: "Domain Impersonation"
category: "phishing"
source: "TRACE-X Knowledge Base"
---

# Domain Impersonation and Typosquatting

Domain impersonation involves registering domain names that closely resemble legitimate brands or organizations to deceive users into believing they are interacting with a trusted entity.

## Typosquatting Techniques

**Character substitution**: Replacing characters with visually similar ones — e.g., rn→m (paypa1.com), 0→o (g00gle.com).

**Homograph attacks**: Using characters from different alphabets that appear identical (Cyrillic а vs Latin a).

**Missing/extra characters**: Adding or removing characters — e.g., gooogle.com, gogle.com.

**TLD variations**: Using alternative top-level domains — e.g., microsoft.co instead of microsoft.com.

**Subdomain abuse**: Placing the target brand in a subdomain — e.g., microsoft.com.attacker-site.xyz.

**Hyphenation**: Adding hyphens — e.g., pay-pal.com, microsoft-login.com.

## Brand Impersonation Patterns

Common patterns observed in credential phishing campaigns:
- `[brand]-login.com`
- `[brand]-verify.com`
- `login.[brand]-security.com`
- `[brand].account-update.com`
- `secure-[brand].com`
- `[brand]-support.[tld]`

## Investigation Checklist

When evaluating a domain for impersonation:
1. Compare the domain against known legitimate domains for the brand
2. Check for character substitutions or homograph characters
3. Verify the WHOIS registration data — impersonation domains are usually recently registered
4. Check if the domain resolves to infrastructure associated with the legitimate brand
5. Look for SSL certificate details — impersonation sites often use free certificates from Let's Encrypt
6. Analyze the website content for copied branding materials
7. Check VirusTotal and other reputation sources for community reports
