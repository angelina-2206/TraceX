---
title: "Phishing Indicators"
category: "phishing"
source: "TRACE-X Knowledge Base"
---

# Common Phishing Indicators

Phishing attacks use a variety of techniques to deceive users. Understanding the common indicators helps analysts rapidly assess whether a suspicious URL, email, or domain is likely part of a phishing campaign.

## URL-Based Indicators

**Typosquatting**: Attackers register domains that closely resemble legitimate ones by introducing subtle character changes. Examples include replacing 'l' with '1', 'o' with '0', or adding extra characters (e.g., microsoftt.com, g00gle.com).

**URL Obfuscation**: Techniques used to hide the true destination of a link include:
- Using URL shorteners (bit.ly, tinyurl.com) to mask the actual domain
- Encoding characters in the URL using percent-encoding
- Using the @ symbol in URLs to direct to attacker-controlled servers
- Embedding legitimate-looking text in the URL path or subdomain

**Suspicious TLDs**: While not definitive, certain top-level domains are disproportionately used in phishing campaigns, including .xyz, .top, .click, .loan, and .work.

## Domain-Based Indicators

- Recently registered domains (less than 30 days old)
- Domains using privacy protection or anonymous registration services
- Domains hosted on free or low-cost hosting providers
- Domains resolving to IPs associated with known phishing infrastructure
- Domains with certificate transparency logs showing recent issuance

## Content-Based Indicators

- Login forms that submit to domains different from the displayed URL
- Pages mimicking well-known brands (Microsoft, Google, banking institutions)
- Urgency language ("Your account will be suspended", "Verify immediately")
- Requests for sensitive information (passwords, SSNs, credit card numbers)
- Poor grammar or unusual formatting that differs from the legitimate brand

## Email-Based Indicators

- Sender domain that differs from the organization being impersonated
- Reply-to address that differs from the sender address
- Inconsistent email headers indicating potential spoofing
- Attachments with suspicious file types or double extensions
- Links that do not match the displayed anchor text
