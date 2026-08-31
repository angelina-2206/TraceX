---
title: "Incident Containment"
category: "incident_response"
source: "TRACE-X Knowledge Base"
---

# Incident Containment Strategies

Containment is a critical phase of incident response where the goal is to limit the scope and impact of an ongoing security incident while preserving evidence for investigation.

## Immediate Containment Actions

When a phishing or malicious URL incident is confirmed:

**Network level**:
- Block the malicious domain and IP at the firewall and DNS level
- Add the URL to the organization's web proxy blocklist
- Update email filtering rules to quarantine messages containing the URL

**Endpoint level**:
- Identify which users accessed the malicious URL
- Isolate potentially compromised endpoints
- Force password resets for users who may have entered credentials

**Identity level**:
- Revoke active sessions for potentially compromised accounts
- Enable additional authentication requirements
- Monitor for unauthorized access attempts using potentially stolen credentials

## Evidence Preservation

During containment, preserve evidence for later analysis:
- Capture network traffic logs showing connections to the malicious infrastructure
- Save copies of phishing pages before they are taken down
- Document the redirect chain and all intermediate domains
- Record timestamps of user interactions with the malicious content
- Preserve email headers and metadata

## Communication

- Notify affected users without causing panic
- Report the incident to relevant internal teams (security, IT, legal)
- Consider reporting the malicious infrastructure to hosting providers and domain registrars
- Submit indicators to threat intelligence sharing platforms
