---
title: "MITRE ATT&CK Overview"
category: "mitre"
source: "TRACE-X Knowledge Base"
---

# MITRE ATT&CK Framework Overview

The MITRE ATT&CK (Adversarial Tactics, Techniques, and Common Knowledge) framework is a globally recognized knowledge base of adversary behaviors based on real-world observations. It categorizes the tactics and techniques used by threat actors across the cyber attack lifecycle.

## Key Concepts

**Tactics** represent the adversary's tactical objective — the reason for performing an action. Examples include Initial Access, Execution, Persistence, and Exfiltration.

**Techniques** describe how an adversary achieves a tactical objective. Each technique has a unique identifier (e.g., T1566 for Phishing).

**Sub-techniques** provide more specific descriptions of adversarial behavior within a technique.

**Procedures** are the specific implementations of techniques observed in the wild.

## Relevance to Threat Investigation

When investigating suspicious indicators such as URLs, IP addresses, or domains, ATT&CK mappings help analysts understand:

- What stage of an attack the observed activity might represent
- What adversary groups commonly use similar techniques
- What detection opportunities exist for the observed behavior
- What additional indicators might be associated with the same campaign

Mapping observed evidence to ATT&CK techniques provides a standardized language for communicating threat findings across security teams and organizations.
