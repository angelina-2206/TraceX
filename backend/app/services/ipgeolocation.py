import logging
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class IPGeolocationClient:
    @staticmethod
    async def geolocate_ip(ip: Optional[str]) -> Dict[str, Any]:
        """
        Asynchronously geolocates an IP address using ipgeolocation.io API.
        """
        if not ip:
            return {"available": False}

        logger.info(f"[GeoIP-ipgeolocation] Querying IP location. ip={ip}")

        # If API key is not configured, fall back to mock heuristics
        if not settings.IPGEOLOCATION_API_KEY:
            logger.info("[GeoIP-ipgeolocation] API key missing. Using mock coordinates.")
            if ip == "185.220.101.45":
                return {
                    "available": True,
                    "ip": ip,
                    "country": "Bulgaria",
                    "country_code": "BG",
                    "region": "Sofia-Capital",
                    "city": "Sofia",
                    "latitude": 42.6977,
                    "longitude": 23.3219,
                    "timezone": "Europe/Sofia",
                    "isp": "Offshore Cloud Transit",
                    "organization": "CyberCloud Host LLC",
                    "asn": "AS204915"
                }
            elif ip == "194.26.29.112":
                return {
                    "available": True,
                    "ip": ip,
                    "country": "Netherlands",
                    "country_code": "NL",
                    "region": "North Holland",
                    "city": "Amsterdam",
                    "latitude": 52.3676,
                    "longitude": 4.9041,
                    "timezone": "Europe/Amsterdam",
                    "isp": "Transit Hosting Service",
                    "organization": "Hosting Services Corp",
                    "asn": "AS54215"
                }
            else:
                return {
                    "available": True,
                    "ip": ip,
                    "country": "United States",
                    "country_code": "US",
                    "region": "Virginia",
                    "city": "Ashburn",
                    "latitude": 39.0438,
                    "longitude": -77.4874,
                    "timezone": "America/New_York",
                    "isp": "Amazon Technologies Inc.",
                    "organization": "Amazon.com Inc.",
                    "asn": "AS16509"
                }

        # Perform Live Async HTTP Query
        api_url = "https://api.ipgeolocation.io/ipgeo"
        params = {
            "apiKey": settings.IPGEOLOCATION_API_KEY,
            "ip": ip
        }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(api_url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "available": True,
                        "ip": ip,
                        "country": data.get("country_name", "Unknown Country"),
                        "country_code": data.get("country_code2", "US"),
                        "region": data.get("state_prov", "Unknown Region"),
                        "city": data.get("city", "Unknown City"),
                        "latitude": float(data.get("latitude", 0.0)) if data.get("latitude") else 0.0,
                        "longitude": float(data.get("longitude", 0.0)) if data.get("longitude") else 0.0,
                        "timezone": data.get("time_zone", {}).get("name", "UTC"),
                        "isp": data.get("isp", "Unknown ISP"),
                        "organization": data.get("organization", "Unknown Org"),
                        "asn": data.get("asn", "Unknown ASN")
                    }
                elif response.status_code == 429:
                    logger.warning("[GeoIP-ipgeolocation] Rate limit hit.")
                    return {"available": False, "error": "rate_limit", "status_code": 429}
                else:
                    logger.error(f"[GeoIP-ipgeolocation] Server returned status={response.status_code}")
                    return {"available": False, "error": "api_error", "status_code": response.status_code}
                    
        except httpx.TimeoutException:
            logger.error("[GeoIP-ipgeolocation] Request timed out.")
            return {"available": False, "error": "timeout"}
        except Exception:
            logger.error("[GeoIP-ipgeolocation] Connection failure.")
            return {"available": False, "error": "connection_error"}
