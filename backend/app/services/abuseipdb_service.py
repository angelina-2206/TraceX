import logging
import requests
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class AbuseIPDBService:
    _cache: Dict[str, Dict[str, Any]] = {}

    @staticmethod
    def check_ip(ip: str) -> Dict[str, Any]:
        """
        Queries AbuseIPDB check endpoint for malicious/spam reports of an IP address.
        """
        if not ip:
            return {"abuse_score": 0, "is_malicious": False, "source": "local_heuristics"}

        if ip in AbuseIPDBService._cache:
            return {**AbuseIPDBService._cache[ip], "cached": True}

        logger.info(f"[ThreatIntel-AbuseIPDB] Checking IP reputation. ip={ip} case_context=active")

        # Mock Fallback if API key is missing
        if not settings.ABUSEIPDB_API_KEY:
            logger.info("[ThreatIntel-AbuseIPDB] API key missing. Using local heuristics.")
            # Blacklist matches from seed data
            is_abuse = ip in ("185.220.101.45", "194.26.29.112")
            result = {
                "abuse_score": 85 if is_abuse else 5,
                "is_malicious": is_abuse,
                "total_reports": 42 if is_abuse else 0,
                "country_code": "BG" if ip == "185.220.101.45" else "NL" if ip == "194.26.29.112" else "US",
                "source": "mock_heuristics"
            }
            AbuseIPDBService._cache[ip] = result
            return result

        # Live HTTPS Query
        try:
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
            
            response = requests.get(api_url, headers=headers, params=params, timeout=5.0)
            
            if response.status_code == 200:
                data = response.json().get("data", {})
                abuse_score = data.get("abuseConfidenceScore", 0)
                
                result = {
                    "abuse_score": abuse_score,
                    "is_malicious": abuse_score >= 50,
                    "total_reports": data.get("totalReports", 0),
                    "country_code": data.get("countryCode", "US"),
                    "source": "live_abuseipdb"
                }
                AbuseIPDBService._cache[ip] = result
                return result
            else:
                logger.error(f"[ThreatIntel-AbuseIPDB] API error status={response.status_code}")
                
        except Exception:
            logger.error("[ThreatIntel-AbuseIPDB] Connection exception occurred.")

        # Fallback response
        return {"abuse_score": 0, "is_malicious": False, "source": "fallback_heuristics"}
