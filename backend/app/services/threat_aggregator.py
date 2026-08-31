import logging
import asyncio
import uuid
import time
from typing import Dict, Any
from app.services.abuseipdb import AbuseIPDBClient
from app.services.ipgeolocation import IPGeolocationClient
from app.services.urlscan import URLScanClient
from app.services.virustotal import VirusTotalClient
from app.services.risk_engine import RiskEngine
from app.services import rag_retriever
from app.schemas.threat import UnifiedThreatReport, AggregatedIntelligence, IndicatorDetails

logger = logging.getLogger("uvicorn.error")

class ThreatAggregatorService:
    @staticmethod
    async def aggregate_intelligence(normalized: Dict[str, Any]) -> Dict[str, Any]:
        """
        Coordinates parallel lookups across the four external threat APIs.
        Fails safely if individual providers crash or time out.
        """
        investigation_id = str(uuid.uuid4())
        target_value = normalized["normalized_target"]
        indicator_type = normalized["indicator_type"]
        domain = normalized["domain"]
        ip = normalized["ip"]
        url = normalized["url"]

        logger.info(f"[ThreatAggregator] Initiating parallel lookups. investigation_id={investigation_id} target={target_value[:40]}")

        # Setup parallel tasks
        # Determine which queries are applicable
        # IP Geolocation & AbuseIPDB require an IP (either directly provided or resolved from domain/URL)
        abuseipdb_task = AbuseIPDBClient.check_ip(ip) if ip else ThreatAggregatorService._empty_fallback()
        ipgeo_task = IPGeolocationClient.geolocate_ip(ip) if ip else ThreatAggregatorService._empty_fallback()
        
        # URLScan processes URL or Domain strings
        urlscan_task = (
            URLScanClient.scan_url(url or target_value, domain) 
            if indicator_type in ("url", "domain") 
            else ThreatAggregatorService._empty_fallback()
        )
        
        # VirusTotal queries all types (url, domain, ip, hash)
        virustotal_task = VirusTotalClient.query_indicator(target_value, indicator_type)

        start_time = time.time()

        # Run all tasks concurrently
        results = await asyncio.gather(
            abuseipdb_task,
            ipgeo_task,
            urlscan_task,
            virustotal_task,
            return_exceptions=True
        )

        duration_ms = int((time.time() - start_time) * 1000)
        logger.info(f"[ThreatAggregator] Concurrency gather complete in {duration_ms}ms")

        # Map results and catch individual errors/exceptions
        provider_names = ["abuseipdb", "ipgeolocation", "urlscan", "virustotal"]
        intel_data = {}
        provider_status = {}

        for idx, name in enumerate(provider_names):
            res = results[idx]
            
            if isinstance(res, Exception):
                logger.error(f"[ThreatAggregator] Provider '{name}' raised an unhandled exception: {str(res)}")
                intel_data[name] = {"available": False}
                provider_status[name] = "error"
            elif isinstance(res, dict) and "error" in res:
                logger.warning(f"[ThreatAggregator] Provider '{name}' returned error: {res['error']}")
                intel_data[name] = {"available": False}
                provider_status[name] = res["error"]
            else:
                intel_data[name] = res
                provider_status[name] = "success"

        # Calculate final unified risk scoring
        risk_rating = RiskEngine.calculate_risk(intel_data, provider_status)

        # RAG enrichment — gracefully skip if Qdrant is unavailable
        rag_context = None
        try:
            rag_context = rag_retriever.retrieve_for_evidence(intel_data, provider_status)
        except Exception as e:
            logger.warning(f"[ThreatAggregator] RAG enrichment failed (non-fatal): {e}")

        return {
            "investigation_id": investigation_id,
            "target": normalized["original_target"],
            "indicator_type": indicator_type,
            "normalized": IndicatorDetails(**normalized),
            "intelligence": AggregatedIntelligence(**intel_data),
            "risk": risk_rating,
            "provider_status": provider_status,
            "rag": rag_context
        }

    @staticmethod
    async def _empty_fallback() -> Dict[str, Any]:
        """Helper to return an immediate empty fallback for skipped providers."""
        return {"available": False}
