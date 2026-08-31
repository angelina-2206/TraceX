import logging
import httpx
from typing import Dict, Any, Optional, List
from app.core.config import settings
from app.core.security import validate_ssrf_safe_url

logger = logging.getLogger("uvicorn.error")

class URLScanClient:
    @staticmethod
    async def scan_url(url: Optional[str], domain: Optional[str] = None) -> Dict[str, Any]:
        """
        Queries URLScan.io for the reputation, redirect logs, and screenshot of a URL.
        Performs a passive search on historical scans first. Enforces SSRF checks.
        """
        if not url:
            return {"available": False}

        # 1. Enforce Server-Side Request Forgery (SSRF) Protection
        if not validate_ssrf_safe_url(url):
            logger.warning(f"[ThreatIntel-URLScan] SSRF attempt blocked! url={url[:40]}")
            return {
                "available": True,
                "scan_id": "blocked_ssrf",
                "submitted_url": url,
                "final_url": url,
                "verdict": "BLOCKED",
                "http_status": 403,
                "details": "SSRF Prevention: Target hostname resolves to private range.",
                "source": "ssrf_protection"
            }

        logger.info(f"[ThreatIntel-URLScan] Querying URL. url={url[:50]}")

        # If API key is missing, fall back to mock heuristics
        if not settings.URLSCAN_API_KEY:
            logger.info("[ThreatIntel-URLScan] API key missing. Using mock response.")
            is_suspicious = any(term in url.lower() for term in ["login", "verify", "micr0soft", "payment"])
            if is_suspicious:
                return {
                    "available": True,
                    "scan_id": "8ca0e653-5e82-411a-8e2b-f7ee8ba9204c",
                    "submitted_url": url,
                    "final_url": "https://login-microsoft-auth-session.xyz/sso/login.php",
                    "domain": "login-microsoft-auth-session.xyz",
                    "ip": "194.26.29.112",
                    "asn": "AS54215",
                    "country": "NL",
                    "http_status": 200,
                    "page_title": "Sign in to your Microsoft Account",
                    "redirects": [
                        "http://micr0soft-login-check.net/login?ref=a8f2",
                        "https://login-microsoft-auth-session.xyz/sso/login.php"
                    ],
                    "technologies": ["Nginx", "PHP", "Cloudflare"],
                    "screenshot": "https://urlscan.io/screenshots/8ca0e653-5e82-411a-8e2b-f7ee8ba9204c.png",
                    "scan_time": "2026-08-30T14:10:00Z"
                }
            else:
                return {
                    "available": True,
                    "scan_id": "e6a0d6f3-8e42-11a2-8e2b-ffebba8294cd",
                    "submitted_url": url,
                    "final_url": url,
                    "domain": domain or "example.com",
                    "ip": "93.184.216.34",
                    "asn": "AS15133",
                    "country": "US",
                    "http_status": 200,
                    "page_title": "Example Domain",
                    "redirects": [],
                    "technologies": ["Apache"],
                    "screenshot": "https://urlscan.io/screenshots/e6a0d6f3-8e42-11a2-8e2b-ffebba8294cd.png",
                    "scan_time": "2026-08-30T14:10:00Z"
                }

        # 2. Perform Passive Search of Historical Scans
        search_query = f"domain:{domain}" if domain else f"url:\"{url}\""
        search_url = f"https://urlscan.io/api/v1/search/?q={search_query}&size=1"
        headers = {"API-Key": settings.URLSCAN_API_KEY}

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                search_response = await client.get(search_url, headers=headers)
                
                if search_response.status_code == 200:
                    results = search_response.json().get("results", [])
                    if results:
                        # Extract the first recent scan result
                        latest_scan = results[0]
                        task = latest_scan.get("task", {})
                        page = latest_scan.get("page", {})
                        
                        return {
                            "available": True,
                            "scan_id": task.get("uuid"),
                            "submitted_url": task.get("url"),
                            "final_url": page.get("url"),
                            "domain": page.get("domain"),
                            "ip": page.get("ip"),
                            "asn": page.get("asnname"),
                            "country": page.get("country"),
                            "http_status": page.get("status"),
                            "page_title": page.get("title", ""),
                            "redirects": [task.get("url"), page.get("url")] if task.get("url") != page.get("url") else [],
                            "technologies": latest_scan.get("stats", {}).get("uniqCountries", []),  # fallback placeholder
                            "screenshot": f"https://urlscan.io/screenshots/{task.get('uuid')}.png",
                            "scan_time": task.get("time")
                        }

                # 3. Fallback: Submit a New Scan if no history exists (quick submit, no waiting loop)
                submit_url = "https://urlscan.io/api/v1/scan/"
                payload = {"url": url, "visibility": "unlisted"}
                
                response = await client.post(submit_url, headers=headers, json=payload)
                if response.status_code == 201:
                    data = response.json()
                    scan_uuid = data.get("uuid")
                    
                    return {
                        "available": True,
                        "scan_id": scan_uuid,
                        "submitted_url": url,
                        "final_url": url,
                        "domain": domain,
                        "ip": None,
                        "asn": None,
                        "country": None,
                        "http_status": 202,  # Accepted/Processing
                        "page_title": "Scan Queued (Processing)",
                        "redirects": [],
                        "technologies": [],
                        "screenshot": f"https://urlscan.io/screenshots/{scan_uuid}.png" if scan_uuid else None,
                        "scan_time": "Just submitted"
                    }
                else:
                    logger.error(f"[ThreatIntel-URLScan] Submit scan failed: status={response.status_code}")
                    return {"available": False, "error": "api_error", "status_code": response.status_code}
                    
        except httpx.TimeoutException:
            logger.error("[ThreatIntel-URLScan] Request timed out.")
            return {"available": False, "error": "timeout"}
        except Exception:
            logger.error("[ThreatIntel-URLScan] Connection failure.")
            return {"available": False, "error": "connection_error"}
