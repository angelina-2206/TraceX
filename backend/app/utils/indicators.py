import re
import socket
import ipaddress
from urllib.parse import urlparse
from typing import Dict, Any, Optional

def extract_and_normalize_target(target: str) -> Dict[str, Any]:
    """
    Detects the indicator type of the target (URL, IP, Domain, or Hash).
    Extracts the domain and resolves DNS names to IP addresses passively.
    """
    target = target.strip()
    original_target = target
    
    indicator_type = "domain"
    domain = None
    ip = None
    url = None
    normalized_target = target

    # 1. Detect Hash (MD5, SHA1, SHA256)
    hex_pattern = r"^[a-fA-F0-9]+$"
    if re.match(hex_pattern, target):
        if len(target) in (32, 40, 64):
            indicator_type = "hash"
            return {
                "original_target": original_target,
                "normalized_target": normalized_target.lower(),
                "indicator_type": indicator_type,
                "domain": None,
                "ip": None,
                "url": None
            }

    # 2. Detect IP Address (IPv4 or IPv6)
    try:
        ip_obj = ipaddress.ip_address(target)
        indicator_type = "ip"
        ip = str(ip_obj)
        normalized_target = ip
        return {
            "original_target": original_target,
            "normalized_target": normalized_target,
            "indicator_type": indicator_type,
            "domain": None,
            "ip": ip,
            "url": None
        }
    except ValueError:
        pass

    # 3. Detect URL
    if target.startswith(("http://", "https://")):
        indicator_type = "url"
        url = target
        try:
            parsed = urlparse(target)
            # Remove port if present
            hostname = parsed.hostname or ""
            domain = hostname
            normalized_target = target
        except Exception:
            domain = ""
    else:
        # If it doesn't start with HTTP, but contains slash or parameters, it might be a URL without scheme
        if "/" in target or "?" in target:
            target_with_scheme = "http://" + target
            try:
                parsed = urlparse(target_with_scheme)
                indicator_type = "url"
                url = target_with_scheme
                domain = parsed.hostname or ""
                normalized_target = target_with_scheme
            except Exception:
                pass
        
        if indicator_type != "url":
            # Otherwise it's a domain
            indicator_type = "domain"
            domain = target.split(":")[0]  # remove port if any
            normalized_target = domain.lower()

    # 4. Resolve Domain to IP (passive DNS lookup)
    if domain:
        try:
            resolved_ip = socket.gethostbyname(domain)
            # Validate resolved IP is not loopback/private to prevent SSRF
            ip_obj = ipaddress.ip_address(resolved_ip)
            if not (ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local):
                ip = resolved_ip
        except Exception:
            # Passive resolution failure is expected if domain is offline or invalid
            pass

    return {
        "original_target": original_target,
        "normalized_target": normalized_target,
        "indicator_type": indicator_type,
        "domain": domain.lower() if domain else None,
        "ip": ip,
        "url": url
    }
