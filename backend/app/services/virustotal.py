import logging
import httpx
import base64
import hashlib
from typing import Dict, Any, Optional, List
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class VirusTotalClient:
    @staticmethod
    async def query_indicator(target: str, indicator_type: str) -> Dict[str, Any]:
        """
        Asynchronously queries the VirusTotal API based on indicator type (url, domain, ip, hash).
        """
        if not target:
            return {"available": False}

        logger.info(f"[ThreatIntel-VirusTotal] Querying indicator. type={indicator_type} value={target[:40]}")

        # If API key is missing, fall back to mock heuristics
        if not settings.VIRUSTOTAL_API_KEY:
            logger.info("[ThreatIntel-VirusTotal] API key missing. Using mock reputation data.")
            is_malicious = any(term in target.lower() for term in ["login", "verify", "micr0soft", "payment", "185.220.101.45", "194.26.29.112"])
            malicious_count = 14 if is_malicious else 0
            suspicious_count = 3 if is_malicious else 0
            harmless_count = 68 if is_malicious else 85
            undetected_count = 5 if is_malicious else 2
            
            return {
                "available": True,
                "indicator": target,
                "type": indicator_type,
                "reputation": -35 if is_malicious else 10,
                "malicious": malicious_count,
                "suspicious": suspicious_count,
                "harmless": harmless_count,
                "undetected": undetected_count,
                "categories": ["phishing", "malware_distribution"] if is_malicious else ["general_news"],
                "detections": ["Fortinet (Phishing)", "Kaspersky (Malicious)", "Symantec (Phishing)"] if is_malicious else []
            }

        # Determine endpoint path and target format
        headers = {
            "x-apikey": settings.VIRUSTOTAL_API_KEY,
            "Accept": "application/json"
        }

        api_url = None
        if indicator_type == "ip":
            api_url = f"https://www.virustotal.com/api/v3/ip_addresses/{target}"
        elif indicator_type == "domain":
            api_url = f"https://www.virustotal.com/api/v3/domains/{target}"
        elif indicator_type == "hash":
            api_url = f"https://www.virustotal.com/api/v3/files/{target}"
        elif indicator_type == "url":
            # VT URL ID is base64 without padding of the URL string
            url_id = base64.urlsafe_b64encode(target.encode()).decode().strip("=")
            api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"

        if not api_url:
            return {"available": False, "error": "unsupported_type"}

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                response = await client.get(api_url, headers=headers)
                
                if response.status_code == 200:
                    data = response.json().get("data", {})
                    attributes = data.get("attributes", {})
                    stats = attributes.get("last_analysis_stats", {})
                    
                    malicious = stats.get("malicious", 0)
                    suspicious = stats.get("suspicious", 0)
                    harmless = stats.get("harmless", 0)
                    undetected = stats.get("undetected", 0)
                    
                    # Extract categories (different mappers depending on type)
                    categories = []
                    if "categories" in attributes:
                        categories = list(set(attributes.get("categories", {}).values()))
                    
                    # Extract vendor detections
                    detections = []
                    results = attributes.get("last_analysis_results", {})
                    for vendor, detail in results.items():
                        if detail.get("category") in ("malicious", "suspicious"):
                            detections.append(f"{vendor} ({detail.get('result')})")
                    
                    reputation = attributes.get("reputation", 0)
                    
                    return {
                        "available": True,
                        "indicator": target,
                        "type": indicator_type,
                        "reputation": reputation,
                        "malicious": malicious,
                        "suspicious": suspicious,
                        "harmless": harmless,
                        "undetected": undetected,
                        "categories": categories[:5],
                        "detections": detections[:10]  # Limit to top 10 vendor detections
                    }
                elif response.status_code == 404:
                    logger.info(f"[ThreatIntel-VirusTotal] Indicator not found in VirusTotal database.")
                    return {
                        "available": True,
                        "indicator": target,
                        "type": indicator_type,
                        "reputation": 0,
                        "malicious": 0,
                        "suspicious": 0,
                        "harmless": 0,
                        "undetected": 0,
                        "categories": [],
                        "detections": []
                    }
                elif response.status_code == 429:
                    logger.warning("[ThreatIntel-VirusTotal] Rate limit hit.")
                    return {"available": False, "error": "rate_limit", "status_code": 429}
                else:
                    logger.error(f"[ThreatIntel-VirusTotal] Server returned status={response.status_code}")
                    return {"available": False, "error": "api_error", "status_code": response.status_code}
                    
        except httpx.TimeoutException:
            logger.error("[ThreatIntel-VirusTotal] Request timed out.")
            return {"available": False, "error": "timeout"}
        except Exception:
            logger.error("[ThreatIntel-VirusTotal] Connection failure.")
            return {"available": False, "error": "connection_error"}
