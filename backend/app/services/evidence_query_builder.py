"""
Evidence-to-Query Transformation Layer.
Converts raw API intelligence into semantically meaningful queries
for the RAG retriever. This improves retrieval quality by querying
knowledge with targeted phrases rather than raw JSON.
"""
import logging
from typing import Dict, Any, List

logger = logging.getLogger("uvicorn.error")


def build_queries_from_evidence(intel_data: Dict[str, Any], provider_status: Dict[str, str]) -> List[str]:
    """
    Analyze the gathered threat intelligence and produce 2-4 targeted
    natural language queries for semantic search against the knowledge base.
    """
    queries = []

    vt = intel_data.get("virustotal", {})
    abuse = intel_data.get("abuseipdb", {})
    urlscan = intel_data.get("urlscan", {})
    geo = intel_data.get("ipgeolocation", {})

    # --- VirusTotal-driven queries ---
    if _is_available(vt):
        malicious = vt.get("malicious", 0) or 0
        categories = vt.get("categories", []) or []

        if malicious > 0:
            cat_str = " ".join(categories[:3]) if categories else "malicious"
            queries.append(f"malicious URL domain detection {cat_str} security vendor analysis")

        if "phishing" in str(categories).lower():
            queries.append("credential phishing fake login page harvesting")

        if vt.get("reputation", 0) and vt["reputation"] < -10:
            queries.append("low reputation domain threat indicator community reports")

    # --- AbuseIPDB-driven queries ---
    if _is_available(abuse) and abuse.get("found"):
        confidence = abuse.get("abuse_confidence", 0) or 0
        usage = abuse.get("usage_type", "") or ""

        if confidence > 50:
            queries.append(f"IP address abuse reputation high confidence malicious activity")

        if "hosting" in usage.lower() or "data center" in usage.lower():
            queries.append("VPS hosting infrastructure threat actor bulletproof hosting")

    # --- URLScan-driven queries ---
    if _is_available(urlscan):
        redirects = urlscan.get("redirects", []) or []
        page_title = urlscan.get("page_title", "") or ""

        if len(redirects) > 1:
            queries.append("malicious redirect chain URL obfuscation evasion phishing")

        if any(kw in page_title.lower() for kw in ["login", "sign in", "verify", "account", "password"]):
            queries.append("credential phishing login page impersonation social engineering")

    # --- Geolocation-driven queries ---
    if _is_available(geo):
        isp = geo.get("isp", "") or ""
        org = geo.get("organization", "") or ""

        if any(kw in (isp + org).lower() for kw in ["cloud", "hosting", "vps", "server", "data center"]):
            queries.append("hosting infrastructure analysis ASN data center threat")

    # Deduplicate while preserving order
    seen = set()
    unique_queries = []
    for q in queries:
        if q not in seen:
            seen.add(q)
            unique_queries.append(q)

    # Ensure at least one general query if nothing specific was generated
    if not unique_queries:
        unique_queries.append("cybersecurity threat investigation indicator analysis")

    # Cap at 4 queries to keep retrieval focused
    return unique_queries[:4]


def _is_available(data: Dict[str, Any]) -> bool:
    """Check if a provider's data is available."""
    if not data or not isinstance(data, dict):
        return False
    return data.get("available", False)
