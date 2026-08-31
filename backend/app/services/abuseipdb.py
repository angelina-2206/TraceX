import logging
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class AbuseIPDBClient:
    @staticmethod
    async def check_ip(ip: Optional[str]) -> Dict[str, Any]:
        """
        Asynchronously queries the AbuseIPDB API for reputation details of an IP address.
        """
        if not ip:
            return {"available": False, "found": False}

        logger.info(f"[ThreatIntel-AbuseIPDB] Querying IP. ip={ip}")

        # If API key is not configured, fall back to mock heuristics
        if not settings.ABUSEIPDB_API_KEY:
            logger.info("[ThreatIntel-AbuseIPDB] API key missing. Using mockup fallback.")
            is_malicious = ip in ("185.220.101.45", "194.26.29.112")
            if is_malicious:
                return {
                    "available": True,
                    "found": True,
                    "ip": ip,
                    "abuse_confidence": 87 if ip == "185.220.101.45" else 95,
                    "country": "BG" if ip == "185.220.101.45" else "NL",
                    "isp": "CyberCloud Host LLC" if ip == "185.220.101.45" else "Hosting Network Service",
                    "usage_type": "Data Center/Web Hosting/Transit",
                    "total_reports": 42 if ip == "185.220.101.45" else 115,
                    "distinct_reporters": 18 if ip == "185.220.101.45" else 42,
                    "last_reported": "2026-08-30T14:10:00Z"
                }
            else:
                return {
                    "available": True,
                    "found": False,
                    "ip": ip,
                    "abuse_confidence": 0,
                    "country": "US",
                    "isp": "Local Service Provider",
                    "usage_type": "Consumer",
                    "total_reports": 0,
                    "distinct_reporters": 0,
                    "last_reported": None
                }

        # Perform Live Async HTTP Query
        api_url = "https://api.abuseipdb.com/api/v2/check"
        params = {
            "ipAddress": ip,
            "maxAgeInDays": "90",
            "verbose": "false"
        }
        headers = {
            "Key": settings.ABUSEIPDB_API_KEY,
            "Accept": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                response = await client.get(api_url, headers=headers, params=params)
                
                if response.status_code == 200:
                    data = response.json().get("data", {})
                    total_reports = data.get("totalReports", 0)
                    
                    if total_reports == 0 and data.get("abuseConfidenceScore", 0) == 0:
                        return {
                            "available": True,
                            "found": False,
                            "ip": ip,
                            "abuse_confidence": 0,
                            "country": data.get("countryCode", "US"),
                            "isp": data.get("isp", "Unknown"),
                            "usage_type": data.get("usageType", "Unknown"),
                            "total_reports": 0,
                            "distinct_reporters": 0,
                            "last_reported": None
                        }
                    
                    return {
                        "available": True,
                        "found": True,
                        "ip": ip,
                        "abuse_confidence": data.get("abuseConfidenceScore", 0),
                        "country": data.get("countryCode", "US"),
                        "isp": data.get("isp", "Unknown"),
                        "usage_type": data.get("usageType", "Unknown"),
                        "total_reports": total_reports,
                        "distinct_reporters": data.get("numDistinctUsers", 0),
                        "last_reported": data.get("lastReportedAt", "")
                    }
                elif response.status_code == 429:
                    logger.warning("[ThreatIntel-AbuseIPDB] Rate limit exceeded.")
                    return {"available": False, "error": "rate_limit", "status_code": 429}
                else:
                    logger.error(f"[ThreatIntel-AbuseIPDB] Server returned status={response.status_code}")
                    return {"available": False, "error": "api_error", "status_code": response.status_code}
                    
        except httpx.TimeoutException:
            logger.error("[ThreatIntel-AbuseIPDB] Request timed out.")
            return {"available": False, "error": "timeout"}
        except Exception:
            logger.error("[ThreatIntel-AbuseIPDB] Connection failure.")
            return {"available": False, "error": "connection_error"}
