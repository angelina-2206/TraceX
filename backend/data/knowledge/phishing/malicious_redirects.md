---
title: "Malicious Redirects"
category: "phishing"
source: "TRACE-X Knowledge Base"
---

# Malicious Redirect Chains

Redirect chains are sequences of HTTP redirects that route a user through multiple intermediate URLs before reaching a final destination. While redirects have legitimate uses, attackers exploit them extensively in phishing and malware delivery campaigns.

## Why Attackers Use Redirects

**Evasion**: Each redirect hop adds a layer of indirection that makes it harder for security tools to determine the final destination when scanning the initial URL.

**Filtering**: Intermediate redirectors can check the visitor's characteristics (IP, user agent, referrer, geolocation) and only redirect potential victims to the malicious page, while redirecting security scanners to benign content.

**Tracking**: Attackers add unique identifiers at each hop to track which email recipients click their links.

**Reputation Abuse**: By routing through legitimate services (Google redirects, Microsoft Safe Links, URL shorteners), attackers borrow the reputation of trusted domains.

## Common Redirect Patterns

- **URL shortener chains**: bit.ly → tinyurl.com → attacker domain
- **Open redirect abuse**: trusted-site.com/redirect?url=attacker.com
- **JavaScript redirects**: Pages that use JavaScript to redirect after a delay
- **Meta refresh redirects**: HTML meta tags that trigger automatic navigation
- **Server-side redirects**: HTTP 301/302 responses from intermediate servers

## Risk Assessment

Multiple redirects in a URL chain increase the likelihood that the final destination is malicious:
- 0-1 redirects: Common in legitimate web usage
- 2-3 redirects: Warrants closer examination
- 4+ redirects: Highly suspicious and commonly associated with phishing campaigns

## Analysis Approach

When investigating URLs with redirect chains:
1. Resolve the complete redirect chain to identify the final destination
2. Check each intermediate domain against threat intelligence sources
3. Identify any open redirect vulnerabilities being exploited
4. Note any conditional behavior (different redirects for different user agents)
5. Check if URL shortening services are used to obscure the chain
