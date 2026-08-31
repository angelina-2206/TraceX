---
title: "Credential Access — T1056"
category: "mitre"
technique_id: "T1056"
source: "TRACE-X Knowledge Base"
---

# T1056 — Input Capture

## Technique Description

Input capture involves techniques used by adversaries to intercept user input, most commonly credentials. This encompasses keylogging, GUI input capture, web portal capture, and credential API hooking.

## Sub-techniques

### T1056.002 — GUI Input Capture

Adversaries may mimic common operating system or application GUI components to prompt users for credentials. This includes fake login dialogs, spoofed authentication popups, and credential harvesting web pages that closely replicate legitimate services.

In web-based attacks, adversaries create fake login pages that visually replicate services like Microsoft 365, Google Workspace, banking portals, or corporate SSO systems. These pages capture entered credentials and may forward the user to the legitimate service to avoid suspicion.

## Typical Indicators

- Web pages that closely mimic legitimate login forms but are hosted on unfamiliar domains
- Forms that submit credentials to a different domain than the one displayed
- Pages using JavaScript to capture keystrokes or clipboard content
- Login pages that lack proper SSL/TLS certificates or use self-signed certificates
- Domain names that use visual similarities to legitimate brands (homograph attacks)
- Pages that immediately redirect after credential submission

## Detection Considerations

- Compare the visual structure and HTML source of suspected phishing pages against known legitimate login pages
- Check if the form action URL submits data to a third-party domain
- Analyze JavaScript on the page for credential exfiltration code
- Verify the SSL certificate chain and issuer
- Check the domain registration age and registrar
