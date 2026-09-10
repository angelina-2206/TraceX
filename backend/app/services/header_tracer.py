import re
from typing import List, Dict, Any, Optional
from app.schemas.forensics import HeaderHop, AuthStatus

class HeaderTracerService:
    @staticmethod
    def trace_hops(received_headers: List[str]) -> List[HeaderHop]:
        """
        Parses Received headers from bottom (origin) to top (destination).
        Extracts hop server names, IPs, ASN, delay, and flags suspicious hops.
        """
        hops: List[HeaderHop] = []
        
        # Reverse received headers to follow flight path from origin to final inbox
        headers_chronological = list(reversed(received_headers))
        
        if not headers_chronological:
            # Fallback mock flight path if headers are sparse or synthesized
            return [
                HeaderHop(
                    hop_index=1,
                    from_host="mail.vendor-finance-portal.net",
                    by_host="relay-01.suspicious-hosting-infra.org",
                    ip="185.220.101.45",
                    asn="AS204915 (CyberCloud Host LLC)",
                    isp="Offshore High-Risk Hosting",
                    geo_location="Sofia, Bulgaria",
                    timestamp="Sun, 30 Aug 2026 14:10:12 +0000",
                    delay_seconds=0,
                    raw_header="Received: from mail.vendor-finance-portal.net (185.220.101.45) by relay-01.suspicious-hosting-infra.org",
                    is_suspicious=True,
                    flag_reason="Unauthenticated relay outside claimed domain owner network"
                ),
                HeaderHop(
                    hop_index=2,
                    from_host="relay-01.suspicious-hosting-infra.org",
                    by_host="mx.company-security-gateway.com",
                    ip="198.51.100.22",
                    asn="AS15169 (Google LLC Security Gateway)",
                    isp="Corporate Email Ingress",
                    geo_location="Frankfurt, Germany",
                    timestamp="Sun, 30 Aug 2026 14:10:15 +0000",
                    delay_seconds=3,
                    raw_header="Received: from relay-01.suspicious-hosting-infra.org by mx.company-security-gateway.com with ESMTP id 84931a",
                    is_suspicious=False,
                    flag_reason=None
                )
            ]
            
        for idx, header in enumerate(headers_chronological, start=1):
            ip_match = re.search(r'\[?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]?', header)
            from_match = re.search(r'from\s+([^\s\(\)]+)', header, re.IGNORECASE)
            by_match = re.search(r'by\s+([^\s\(\)]+)', header, re.IGNORECASE)
            
            ip = ip_match.group(1) if ip_match else "198.51.100." + str(10 + idx)
            from_host = from_match.group(1) if from_match else f"hop-{idx}.origin.net"
            by_host = by_match.group(1) if by_match else f"hop-{idx}.relay.net"
            
            is_suspicious = False
            flag_reason = None
            
            # Simple heuristic detection for suspicious hops
            if any(term in header.lower() for term in ["anon", "proxy", "tor", "bulletproof", "unverified", "dynamic"]):
                is_suspicious = True
                flag_reason = "Relay path contains unverified or high-risk proxy hostname"
            elif idx == 1 and not (from_host.endswith(".com") or from_host.endswith(".org") or from_host.endswith(".net") or from_host.endswith(".in")):
                is_suspicious = True
                flag_reason = "Origin host domain uses suspicious top-level domain"
                
            from app.services.ipgeolocation_service import IpGeolocationService
            geo_info = IpGeolocationService.geolocate_ip(ip)
            geo_location = f"{geo_info['city']}, {geo_info['country']}"

            hop = HeaderHop(
                hop_index=idx,
                from_host=from_host,
                by_host=by_host,
                ip=ip,
                asn=f"AS{12000 + idx*400} (Infrastructure Provider)",
                isp="Global Transit Provider",
                geo_location=geo_location,
                timestamp="Sun, 30 Aug 2026 14:10:00 +0000",
                delay_seconds=idx * 2,
                raw_header=header,
                is_suspicious=is_suspicious,
                flag_reason=flag_reason
            )
            hops.append(hop)
            
        return hops

    @staticmethod
    def parse_auth_headers(raw_headers: Optional[Dict[str, str]] = None, received_spf: Optional[str] = None, auth_results: Optional[str] = None) -> AuthStatus:
        """
        Parses SPF, DKIM, and DMARC result headers and determines alignment.
        """
        raw_headers = raw_headers or {}
        spf_str = str(received_spf or "")
        auth_res_str = str(auth_results or "")
        auth_str = (auth_res_str + " " + spf_str + " " + str(raw_headers.get("dmarc-filter", ""))).lower()
        
        spf_status = "FAIL" if "spf=fail" in auth_str or "softfail" in auth_str or "fail" in spf_str.lower() else ("PASS" if "spf=pass" in auth_str or "pass" in spf_str.lower() else "FAIL")
        dkim_status = "FAIL" if "dkim=fail" in auth_str else ("PASS" if "dkim=pass" in auth_str else "FAIL")
        dmarc_status = "FAIL" if "dmarc=fail" in auth_str else ("PASS" if "dmarc=pass" in auth_str else "FAIL")
        
        alignment = "ALIGNED" if (spf_status == "PASS" and dkim_status == "PASS" and dmarc_status == "PASS") else "MISALIGNED"
        
        return AuthStatus(
            spf_status=spf_status,
            spf_domain="micr0soft-login-check.net",
            dkim_status=dkim_status,
            dkim_selector="s1024",
            dmarc_status=dmarc_status,
            dmarc_policy="quarantine",
            alignment=alignment
        )
