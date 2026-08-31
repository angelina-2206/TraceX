---
title: "Suspicious Website Characteristics"
category: "web"
source: "TRACE-X Knowledge Base"
---

# Suspicious Website Characteristics

Identifying malicious websites requires analyzing multiple signals across the domain, content, infrastructure, and behavioral characteristics. No single indicator is definitive, but combinations of suspicious signals increase confidence in threat assessment.

## Visual and Content Signals

**Fake login pages**: Pages that replicate the visual appearance of legitimate login interfaces (Microsoft 365, Google, banking sites). These pages capture credentials entered by victims.

**Suspicious JavaScript**: Malicious pages may contain JavaScript that:
- Captures keystrokes or clipboard content
- Detects and evades analysis environments (virtual machines, headless browsers)
- Implements form data exfiltration
- Performs browser fingerprinting
- Disables right-click and developer tools

**Social engineering content**: Pages designed to create urgency:
- "Your account has been compromised"
- "Verify your identity to continue"
- "Your session has expired"
- "Confirm your payment information"

## Technical Signals

**Infrastructure**: Suspicious websites often exhibit:
- Hosting on IPs with poor reputation scores
- Shared hosting with other known malicious sites
- Recently provisioned infrastructure
- Use of free hosting services or compromised legitimate sites

**Certificates**: While HTTPS presence does not guarantee safety:
- Free certificates (Let's Encrypt) are heavily used by phishing sites
- Recently issued certificates align with recently registered domains
- Certificate subject may not match the domain or claimed organization
- Self-signed certificates indicate unprofessional or malicious operations

**Page behavior**: Observable through tools like URLScan:
- Pages that redirect differently based on visitor characteristics
- Pages that load different content for automated scanners vs real browsers
- Pages with extremely short lifespans (hours to days)
- Pages that attempt to disable browser navigation controls
