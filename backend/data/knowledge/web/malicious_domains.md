---
title: "Malicious Domains"
category: "web"
source: "TRACE-X Knowledge Base"
---

# Malicious Domain Analysis

Malicious domains are registered or compromised domains used by threat actors for phishing, malware distribution, command and control communication, or other illegal activities.

## Newly Registered Domains (NRDs)

Domains registered within the last 30 days are statistically more likely to be used for malicious purposes. While many new domains are legitimate, a significant percentage of domains used in phishing campaigns are registered shortly before the attack.

Key characteristics of suspicious NRDs:
- Registration through registrars known for loose abuse policies
- Use of privacy protection or anonymous registration services
- Registration of multiple similar domains simultaneously
- Domain names that contain brand names or financial terms
- Quick DNS propagation followed by very short active periods

## Domain Reputation Indicators

When VirusTotal or other threat intelligence sources flag a domain:

**Malicious detections**: Multiple independent security vendors classifying a domain as malicious significantly increases confidence. A single detection may be a false positive, but multiple detections rarely are.

**Community votes**: Security researchers and analysts submit reputation votes. Negative community scores reinforce automated detections.

**Categories**: Domains may be categorized as phishing, malware, spam, or C2. These categories indicate the type of threat associated with the domain.

## Analysis Workflow

1. Check the domain registration date and registrar details
2. Query VirusTotal for reputation and category data
3. Resolve the domain to its hosting IP and check IP reputation
4. Analyze the ASN for the hosting infrastructure
5. Check for related domains registered by the same entity
6. Review URLScan results for page content and behavior analysis
