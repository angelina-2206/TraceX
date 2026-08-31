import logging
import requests
from typing import Dict, Any
from app.core.config import settings
from app.core.security import validate_ssrf_safe_url

logger = logging.getLogger("uvicorn.error")

class UrlScanService:
    _cache: Dict[str, Dict[str, Any]] = {}

    @staticmethod
    def scan_url(url: str) -> Dict[str, Any]:
        """
        Submits URL to URLScan.io for dynamic sandboxed screenshot and link tracing.
        Enforces SSRF prevention checks before calling API.
        """
        if not url:
            return {"scanned": False, "verdict": "CLEAN", "source": "local_heuristics"}

        if url in UrlScanService._cache:
            return {**UrlScanService._cache[url], "cached": True}

        # 1. Enforce Server-Side Request Forgery (SSRF) Protection
        if not validate_ssrf_safe_url(url):
            logger.warning(f"[ThreatIntel-URLScan] SSRF attempt blocked! URL tries to access private range. url={url[:40]}")
            return {
                "scanned": False,
                "verdict": "BLOCKED",
                "risk_score": 100,
                "details": "BLOCKED: URL target host resolves to private/loopback IP address ranges.",
                "source": "ssrf_protection"
            }

        logger.info(f"[ThreatIntel-URLScan] Submitting URL scan. url={url[:50]} case_context=active")

        # Mock Fallback if API key is missing
        if not settings.URLSCAN_API_KEY:
            logger.info("[ThreatIntel-URLScan] API key missing. Using local heuristics.")
            is_harvester = "micr0soft" in url or "login" in url or "verify" in url
            result = {
                "scanned": True,
                "verdict": "MALICIOUS" if is_harvester else "CLEAN",
                "risk_score": 95 if is_harvester else 5,
                "screenshot_url": "https://urlscan.io/screenshots/mock-phish.png" if is_harvester else None,
                "redirects": ["https://bit.ly/m365-sso-verify-portal", "https://login-microsoft-auth-session.xyz/sso/login.php"] if is_harvester else [],
                "source": "mock_heuristics"
            }
            UrlScanService._cache[url] = result
            return result

        # Live HTTPS Call
        try:
            api_url = "https://urlscan.io/api/v1/scan/"
            headers = {
                "API-Key": settings.URLSCAN_API_KEY,
                "Content-Type": "application/json"
            }
            payload = {
                "url": url,
                "visibility": "unlisted"
            }
            
            response = requests.post(api_url, headers=headers, json=payload, timeout=8.0)
            
            if response.status_code == 201:
                data = response.json()
                scan_uuid = data.get("uuid")
                result_url = data.get("result")
                
                result = {
                    "scanned": True,
                    "verdict": "SUSPICIOUS",
                    "risk_score": 50,
                    "screenshot_url": f"https://urlscan.io/screenshots/{scan_uuid}.png",
                    "scan_uuid": scan_uuid,
                    "result_details": result_url,
                    "source": "live_urlscan"
                }
                UrlScanService._cache[url] = result
                return result
            else:
                logger.error(f"[ThreatIntel-URLScan] API scan submission failed: status={response.status_code}")
                
        except Exception:
            logger.error("[ThreatIntel-URLScan] Connection exception occurred during URLScan request.")

        return {"scanned": False, "verdict": "SUSPICIOUS", "risk_score": 50, "source": "fallback_heuristics"}
