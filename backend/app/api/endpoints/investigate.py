import logging
from fastapi import APIRouter, HTTPException, Request, status
from app.schemas.threat import InvestigationTarget, UnifiedThreatReport
from app.utils.indicators import extract_and_normalize_target
from app.services.threat_aggregator import ThreatAggregatorService
from app.core.security import enforce_rate_limit, InMemoryRateLimiter

logger = logging.getLogger("uvicorn.error")

router = APIRouter()

# Rate limit: 20 investigations per minute
investigate_limiter = InMemoryRateLimiter(requests_limit=20, window_seconds=60)

@router.post("/investigate", response_model=UnifiedThreatReport, summary="Aggregate threat intelligence for an indicator")
async def investigate_indicator(request: Request, payload: InvestigationTarget):
    """
    Submits a URL, IP, Domain, or Hash to the threat aggregator.
    Executes parallel lookups across VirusTotal, AbuseIPDB, URLScan, and IPGeolocation,
    calculates a transparent risk score, and returns normalized evidence.
    """
    # 1. Enforce Rate Limiting
    enforce_rate_limit(request, investigate_limiter)

    target_str = payload.target.strip()
    if not target_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Investigation target cannot be empty."
        )

    # 2. Extract and Normalize target details
    normalized = extract_and_normalize_target(target_str)
    
    # 3. Prevent SSRF/Private host lookups directly at the gateway level
    ip = normalized.get("ip")
    if ip and ip.startswith(("127.", "10.", "192.168.", "172.16.", "0.")):
         raise HTTPException(
             status_code=status.HTTP_400_BAD_REQUEST,
             detail="SSRF Protection: Lookups on private or loopback IP ranges are forbidden."
         )

    logger.info(f"[API-Investigate] Received investigation request. target={target_str[:40]} type={normalized['indicator_type']}")

    # 4. Trigger concurrency aggregator
    try:
        report = await ThreatAggregatorService.aggregate_intelligence(normalized)
        return report
    except Exception as e:
        logger.error(f"[API-Investigate] Aggregate error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while compiling threat intelligence data."
        )
