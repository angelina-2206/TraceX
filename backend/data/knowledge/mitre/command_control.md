---
title: "Command and Control — T1071"
category: "mitre"
technique_id: "T1071"
source: "TRACE-X Knowledge Base"
---

# T1071 — Application Layer Protocol

## Technique Description

Adversaries may communicate using application layer protocols to avoid detection and network filtering. By encapsulating command and control (C2) traffic within standard protocols, attackers blend malicious traffic with legitimate network activity.

## Sub-techniques

### T1071.001 — Web Protocols

Adversaries use HTTP and HTTPS to communicate with C2 infrastructure. This is the most common C2 channel because web traffic is permitted through most firewalls and proxies. C2 traffic may be disguised as normal web browsing, API calls, or content delivery.

Indicators of C2 over web protocols include:
- Periodic beaconing patterns (regular intervals between connections)
- Connections to domains with low reputation or recent registration
- Unusual HTTP headers or non-standard user agents
- POST requests with encoded or encrypted payloads
- Connections to IPs associated with VPS hosting providers commonly abused by threat actors

## Typical Indicators

- IP addresses flagged by multiple threat intelligence sources as C2 infrastructure
- Domains with high AbuseIPDB confidence scores
- Infrastructure hosted on bulletproof hosting providers
- Connections to IPs in jurisdictions commonly associated with cybercrime operations
- Regular timing intervals in connection patterns
- DNS queries to domains with algorithmically generated names (DGA)

## Detection Considerations

- Correlate IP reputation data from AbuseIPDB with connection logs
- Analyze the ASN and hosting provider — bulletproof hosts are a strong indicator
- Look for beaconing patterns in network connection timing
- Check VirusTotal for community-reported C2 associations
- Monitor for connections to newly observed domains or IPs
- Analyze geolocation data for connections to unexpected regions
