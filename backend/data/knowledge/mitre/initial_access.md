---
title: "Initial Access Techniques"
category: "mitre"
technique_id: "T1566.002"
source: "TRACE-X Knowledge Base"
---

# Initial Access — Overview

Initial Access consists of techniques that adversaries use to gain an initial foothold within a network. These techniques include exploiting public-facing applications, using valid accounts, and various forms of phishing.

## Phishing Links (T1566.002)

Spearphishing links are among the most common initial access vectors. Adversaries craft convincing emails that direct victims to attacker-controlled websites. These websites may:

- Harvest credentials through fake login pages
- Deliver malware through drive-by downloads
- Exploit browser vulnerabilities
- Redirect through multiple intermediate domains to evade URL filtering

## Drive-by Compromise

In drive-by compromise attacks, adversaries host malicious code on legitimate or compromised websites. When a user visits the site, their browser automatically executes the code, potentially installing malware without user interaction beyond visiting the page.

## Common Characteristics of Initial Access URLs

- Recently registered domains (less than 30 days)
- Domains that closely resemble legitimate services
- Use of free hosting or dynamic DNS services
- Multiple redirect hops before reaching the final destination
- Landing pages that prompt for credentials or downloads
- URLs with unusual path structures or encoded characters
- Short-lived infrastructure that disappears within hours

## Detection

- Correlate URL reputation across multiple threat intelligence sources
- Check domain age and registration details
- Analyze the full redirect chain
- Compare the final landing page against known phishing templates
- Monitor for newly registered domains resolving to known malicious infrastructure
