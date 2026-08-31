import logging
import requests
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class IpGeolocationService:
    _cache: Dict[str, Dict[str, Any]] = {}

    @staticmethod
    def geolocate_ip(ip: str) -> Dict[str, Any]:
        """
        Geolocates an IP address using ipgeolocation.io API.
        Uses cached responses. Falls back to mock values if the API key is not configured.
        """
        if not ip or ip.startswith(("10.", "192.168.", "127.", "172.")):
            return {
                "country": "Local Network",
                "city": "Private Range",
                "lat": 0.0,
                "lng": 0.0,
                "source": "private_ip"
            }

        if ip in IpGeolocationService._cache:
            return {**IpGeolocationService._cache[ip], "cached": True}

        logger.info(f"[GeoIP-ipgeolocation] Resolving IP coordinates. ip={ip}")

        # Mock Fallback if API key is missing
        if not settings.IPGEOLOCATION_API_KEY:
            logger.info("[GeoIP-ipgeolocation] API key is missing. Using heuristics fallback.")
            if ip == "185.220.101.45":
                result = {"country": "Bulgaria", "city": "Sofia", "lat": 42.6977, "lng": 23.3219, "source": "mock"}
            elif ip == "194.26.29.112":
                result = {"country": "Netherlands", "city": "Amsterdam", "lat": 52.3676, "lng": 4.9041, "source": "mock"}
            else:
                result = {"country": "United States", "city": "Ashburn", "lat": 39.0438, "lng": -77.4874, "source": "mock"}
            IpGeolocationService._cache[ip] = result
            return result

        # Live API Request
        try:
            api_url = "https://api.ipgeolocation.io/ipgeo"
            params = {
                "apiKey": settings.IPGEOLOCATION_API_KEY,
                "ip": ip
            }
            response = requests.get(api_url, params=params, timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                result = {
                    "country": data.get("country_name", "Unknown Country"),
                    "city": data.get("city", "Unknown City"),
                    "lat": float(data.get("latitude", 0.0)),
                    "lng": float(data.get("longitude", 0.0)),
                    "source": "live_ipgeolocation"
                }
                IpGeolocationService._cache[ip] = result
                return result
            else:
                logger.error(f"[GeoIP-ipgeolocation] API error: status={response.status_code}")
        except Exception:
            logger.error("[GeoIP-ipgeolocation] Connection exception occurred.")

        # Fallback
        return {"country": "United States", "city": "Ashburn", "lat": 39.0438, "lng": -77.4874, "source": "fallback"}
