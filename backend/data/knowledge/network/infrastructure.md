---
title: "Hosting Infrastructure Analysis"
category: "network"
source: "TRACE-X Knowledge Base"
---

# Hosting Infrastructure Analysis

Understanding the hosting infrastructure behind a suspicious indicator provides critical context for threat assessment. The type of hosting, its geographic location, and its operational characteristics all contribute to determining the nature and intent of observed activity.

## Infrastructure Types

**Dedicated Servers**: Physical servers rented or owned by an entity. Less common in commodity cybercrime due to higher cost, but used by sophisticated threat actors for persistent operations.

**Virtual Private Servers (VPS)**: Virtualized server instances. Popular with threat actors because they are cheap, quickly provisioned, and disposable. Many VPS providers offer hourly billing, allowing attackers to deploy infrastructure for specific campaigns and destroy it afterward.

**Shared Hosting**: Multiple websites hosted on a single server. Frequently abused for phishing because it provides legitimate-looking hosting at minimal cost. However, shared hosting also means that malicious content may be hosted alongside legitimate sites.

**Cloud Platforms**: Major cloud providers (AWS, Azure, GCP) are sometimes used for malicious hosting. Their legitimate reputation can help attackers bypass URL filtering. Most cloud providers have active abuse teams, so malicious content tends to be short-lived.

**Residential Proxies**: IP addresses that belong to residential ISPs, used by attackers to route traffic through home connections. This makes the traffic appear to originate from a legitimate residential user, evading IP-based blocking.

## Infrastructure Red Flags

- Recently provisioned VPS instances hosting web content
- IP addresses with reverse DNS entries that do not match the site content
- Multiple unrelated domains hosted on the same IP address
- Infrastructure in countries with weak cybercrime enforcement
- Hosting providers with known tolerance for abuse
- IP addresses rapidly cycling through different domains

## Geolocation Considerations

IP geolocation data can indicate suspicious patterns but has inherent limitations:
- Cloud and VPS providers may assign IPs that geolocate to data center regions, not the operator's actual location
- CDN services can make infrastructure appear to be in multiple locations
- VPN services mask the true origin
- Geolocation databases have accuracy limitations, particularly at the city level
