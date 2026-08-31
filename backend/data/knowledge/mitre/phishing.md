---
title: "Phishing — T1566"
category: "mitre"
technique_id: "T1566"
source: "TRACE-X Knowledge Base"
---

# T1566 — Phishing

## Technique Description

Phishing is a social engineering technique where adversaries send messages to victims designed to trick them into revealing sensitive information, downloading malware, or granting access to systems. Phishing is one of the most prevalent initial access methods used by threat actors.

## Sub-techniques

### T1566.001 — Spearphishing Attachment

Adversaries send targeted emails containing malicious attachments. Common attachment types include Office documents with macros, PDF files with embedded scripts, and archive files containing executables.

### T1566.002 — Spearphishing Link

Adversaries send targeted emails containing links to malicious websites. These websites may host credential harvesting forms, exploit kits, or malware downloads. The links often use URL obfuscation, shortened URLs, or redirect chains to evade security controls.

### T1566.003 — Spearphishing via Service

Adversaries use third-party services such as social media, personal email, or messaging platforms to deliver phishing messages, bypassing corporate email security controls.

## Typical Indicators

- Emails with urgent or threatening language
- Sender domain that closely resembles a legitimate organization (typosquatting)
- Links pointing to recently registered domains
- URLs with excessive redirect chains
- Credential harvesting forms that mimic legitimate login pages
- Attachments with double extensions (e.g., document.pdf.exe)
- Links using URL shortening services to hide the true destination
- Mismatched display name and actual sender address

## Detection Considerations

- Monitor for emails containing links to newly registered domains (less than 30 days old)
- Analyze URL redirect chains — legitimate services rarely use more than 2 redirects
- Check domain WHOIS data for recently created or privacy-protected registrations
- Compare landing page structure against known credential harvesting templates
- Examine if the final URL domain differs significantly from the initially clicked link
- Look for VirusTotal detections marking the URL or domain as phishing
