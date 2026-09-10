from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import hashlib
import time

from app.db.seed_data import get_seed_cases
from app.schemas.forensics import CaseDetail, AttackDNA, CampaignMatch
from app.core.security import InMemoryRateLimiter, enforce_rate_limit
from app.services.email_parser import EmailParserService
from app.services.header_tracer import HeaderTracerService
from app.services.identity_engine import IdentityEngineService
from app.services.social_eng_engine import SocialEngEngineService
from app.services.url_tracer import UrlTracerService
from app.services.geo_financial import GeoFinancialService
from app.services.threat_scorer import ThreatScorerService
from app.services.graph_builder import GraphBuilderService
from app.services.attack_dna import AttackDnaService
from app.services.chain_of_custody import ChainOfCustodyService
from app.services.ipgeolocation_service import IpGeolocationService
from app.api.endpoints.cases import cases_db

router = APIRouter(prefix="/extension", tags=["Chrome Extension Bridge"])

# Dedicated rate limiter for extension telemetry (60 requests/min)
extension_limiter = InMemoryRateLimiter(requests_limit=60, window_seconds=60)

# Local in-memory analysis cache: sha256(fingerprint) -> AnalysisResult
analysis_cache: Dict[str, Dict[str, Any]] = {}

class ExtensionEmailPayload(BaseModel):
    source: str = "gmail"  # "gmail" | "outlook" | "webmail"
    sender: str
    recipients: List[str] = []
    subject: str = ""
    timestamp: Optional[str] = None
    body_text: str = ""
    raw_headers: Optional[str] = None
    urls: List[str] = []
    message_id: Optional[str] = None

class ExtensionFinding(BaseModel):
    type: str  # "identity" | "auth" | "url" | "content" | "infrastructure" | "campaign"
    severity: str  # "CRITICAL" | "HIGH" | "WARNING" | "INFO"
    title: str
    description: str
    evidence_id: Optional[str] = None

class ExtensionAnalysisResponse(BaseModel):
    case_id: str
    risk_score: float
    severity: str
    confidence: float
    summary: str
    reasons: List[str]
    findings: List[ExtensionFinding]
    authentication: Dict[str, str]
    extracted_urls: List[Dict[str, Any]]
    threat_indicators_count: int
    urls_count: int
    deep_link_url: str
    created_at: str
    cached: bool = False

class TraceLinkPayload(BaseModel):
    url: str

class TraceLinkResponse(BaseModel):
    url: str
    domain: str
    reputation_score: float
    risk_level: str
    has_homoglyph: bool
    is_suspicious: bool
    redirect_count: int
    risk_factors: List[str]


@router.post("/analyze", response_model=ExtensionAnalysisResponse)
async def analyze_email_from_extension(payload: ExtensionEmailPayload, request: Request):
    """
    Ingests and analyzes suspicious email evidence directly from TRACE-X Sentinel Chrome Extension.
    Performs fast forensic evaluation, constructs an immutable case record, and returns an explainable verdict.
    """
    enforce_rate_limit(request, extension_limiter)

    # 1. Compute deterministic email fingerprint to avoid duplicate re-analysis
    cache_key_raw = f"{payload.sender}|{payload.subject}|{payload.timestamp or ''}|{payload.body_text[:120]}|{','.join(sorted(payload.urls))}"
    cache_key = hashlib.sha256(cache_key_raw.encode("utf-8")).hexdigest()

    if cache_key in analysis_cache:
        cached_result = analysis_cache[cache_key].copy()
        cached_result["cached"] = True
        return cached_result

    # 2. Parse headers / synthetic hops
    if payload.raw_headers:
        parsed = EmailParserService.parse_raw_eml(payload.raw_headers.encode('utf-8'))
        hops = HeaderTracerService.trace_hops(parsed.get("received_headers", []))
        auth = HeaderTracerService.parse_auth_headers(
            parsed.get("raw_headers_dict", {}),
            parsed.get("received_spf"),
            parsed.get("auth_results")
        )
    else:
        # Generate baseline hops and auth from extracted sender
        hops = []
        # Synthesize auth based on sender domain consistency
        sender_domain = payload.sender.split('@')[-1] if '@' in payload.sender else "unknown.com"
        auth = HeaderTracerService.parse_auth_headers(
            raw_headers={"from": payload.sender, "subject": payload.subject},
            received_spf=None,
            auth_results=None
        )

    # 3. Identity & Social Engineering
    identity = IdentityEngineService.analyze_identity(
        from_str=payload.sender,
        reply_to=payload.sender,
        return_path=None,
        auth_aligned=(auth.alignment == "ALIGNED")
    )
    social_signals = SocialEngEngineService.analyze_social_engineering(payload.body_text)

    # 4. URL Analysis
    urls = UrlTracerService.analyze_urls(payload.urls)

    # 5. Geo-Financial Detection
    seed_key = payload.subject + payload.sender + payload.body_text
    if hops:
        first_hop = hops[0]
        geo_info = IpGeolocationService.geolocate_ip(first_hop.ip, seed_text=seed_key)
    else:
        geo_info = IpGeolocationService.get_fallback_location(seed_key)

    ip_geo = f"{geo_info['city']}, {geo_info['country']}"
    geo_fin = GeoFinancialService.extract_geo_financial(
        payload.body_text,
        ip_geo=ip_geo,
        ip_lat=geo_info['lat'],
        ip_lng=geo_info['lng']
    )

    # 6. Attack DNA & Campaign Memory
    case_num = len(cases_db) + 301
    case_id = f"CASE-{case_num}"

    attack_dna = AttackDnaService.compute_attack_dna(
        case_id=case_id,
        identity=identity,
        urls=urls,
        hops=hops,
        subject=payload.subject,
        body_text=payload.body_text
    )
    campaigns = AttackDnaService.correlate_campaigns(
        current_dna=attack_dna,
        historical_cases=list(cases_db.values()),
        subject=payload.subject,
        sender_email=identity.sender_email,
        urls=urls
    )

    # 7. Decomposed Threat Score Calculation
    threat_score = ThreatScorerService.calculate_decomposed_score(
        identity=identity,
        auth=auth,
        social_signals=social_signals,
        urls=urls,
        campaign_matches=campaigns
    )

    # 8. Build Attack Graph & Chain of Custody
    graph = GraphBuilderService.build_attack_graph(
        case_id=case_id,
        sender_email=identity.sender_email,
        identity=identity,
        hops=hops,
        urls=urls,
        geo_fin=geo_fin,
        campaigns=campaigns
    )

    coc_event = ChainOfCustodyService.create_event(
        actor="TRACE-X Sentinel Chrome Extension",
        role="BROWSER_SENSOR",
        action="EXTENSION_CAPTURE",
        artifact_id=f"EV-EXT-{case_num}",
        details=f"Live capture from webmail ({payload.source.upper()}). Subject: '{payload.subject[:45]}'.",
        prev_events=[]
    )

    # 9. Register case in backend cases_db for seamless deep linking
    new_case = CaseDetail(
        case_id=case_id,
        title=f"Sentinel Capture - {payload.subject[:40] if payload.subject else 'Webmail Ingestion'}",
        status="INVESTIGATING",
        severity=threat_score.severity,
        created_at="2026-08-30T21:00:00Z",
        updated_at="2026-08-30T21:00:00Z",
        assignee="TRACE-X Sentinel Sensor",
        summary=f"Automated ingestion by TRACE-X Sentinel from {payload.source.upper()}. Overall threat score: {threat_score.overall_score:.0f}/100.",
        raw_email_id=f"EV-EXT-{case_num}",
        email_subject=payload.subject,
        email_from=payload.sender,
        email_to=", ".join(payload.recipients) if payload.recipients else "user@enterprise.com",
        email_date=payload.timestamp or "Sun, 30 Aug 2026 21:00:00 +0000",
        header_hops=hops,
        auth_status=auth,
        identity_analysis=identity,
        social_eng_signals=social_signals,
        urls=urls,
        attachments=[],
        geo_financial=geo_fin,
        threat_score=threat_score,
        attack_dna=attack_dna,
        campaign_matches=campaigns,
        attack_graph=graph,
        chain_of_custody=[coc_event]
    )
    cases_db[case_id] = new_case

    # 10. Generate Explainable Findings for the Extension Popup
    findings: List[ExtensionFinding] = []
    reasons: List[str] = []

    # Identity Findings
    if identity.deception_score > 30:
        findings.append(ExtensionFinding(
            type="identity",
            severity="CRITICAL" if identity.deception_score > 60 else "HIGH",
            title="Sender Identity Deception Detected",
            description=f"Display name '{identity.display_name}' conflicts with actual sender address '{identity.sender_email}'.",
            evidence_id="EV-ID-SPOOF"
        ))
        reasons.append("Sender display name impersonates executive/brand")

    if identity.reply_to_mismatch:
        findings.append(ExtensionFinding(
            type="identity",
            severity="HIGH",
            title="Reply-To Routing Mismatch",
            description=f"Reply-To is directed to unverified domain: '{identity.reply_to}'.",
            evidence_id="EV-REPLY-MISMATCH"
        ))
        reasons.append("Reply-To address differs from visible sender")

    # Authentication Findings
    if auth.spf_status == "FAIL" or auth.dmarc_status == "FAIL":
        findings.append(ExtensionFinding(
            type="auth",
            severity="HIGH",
            title="Email Authentication Failure",
            description=f"SPF: {auth.spf_status} | DKIM: {auth.dkim_status} | DMARC: {auth.dmarc_status}",
            evidence_id="EV-AUTH-FAIL"
        ))
        reasons.append("Failed SPF/DMARC authentication checks")

    # URL Findings
    suspicious_urls = [u for u in urls if u.reputation_score > 40 or u.has_homoglyph_domain]
    if suspicious_urls:
        top_u = suspicious_urls[0]
        findings.append(ExtensionFinding(
            type="url",
            severity="CRITICAL" if top_u.reputation_score > 70 else "HIGH",
            title="Suspicious Destination Link Identified",
            description=f"Link pointing to '{top_u.domain}' exhibits {len(top_u.redirect_chain)} redirect hops and high threat reputation.",
            evidence_id=top_u.evidence_id
        ))
        reasons.append(f"{len(suspicious_urls)} suspicious link(s) detected in email body")

    # Social Engineering Findings
    high_social = [s for s in social_signals if s.severity in ["HIGH", "CRITICAL"]]
    if high_social:
        top_s = high_social[0]
        findings.append(ExtensionFinding(
            type="content",
            severity="WARNING",
            title=f"Psychological Manipulation: {top_s.category}",
            description=f"Quote: \"{top_s.evidence_quote}\" (line {top_s.line_number}).",
            evidence_id="EV-SOC-ENG"
        ))
        reasons.append(f"High-pressure urgency/deception detected ({top_s.category})")

    # Financial Anomaly Findings
    if geo_fin and geo_fin.location_mismatch and geo_fin.ifsc_code:
        findings.append(ExtensionFinding(
            type="infrastructure",
            severity="CRITICAL",
            title="Geo-Financial Infrastructure Discrepancy",
            description=f"Sender originating location '{ip_geo}' conflicts with beneficiary bank branch '{geo_fin.branch_name}'.",
            evidence_id="EV-GEO-FIN"
        ))
        reasons.append(f"Geo-Financial routing anomaly ({geo_fin.bank_name} {geo_fin.ifsc_code})")

    # Threat Campaign Correlation
    if campaigns:
        top_camp = campaigns[0]
        findings.append(ExtensionFinding(
            type="campaign",
            severity="HIGH",
            title=f"Matches {top_camp.campaign_name}",
            description=f"Attack DNA correlates with historical threat cluster with {top_camp.confidence:.1f}% confidence.",
            evidence_id="EV-CAMP-MATCH"
        ))
        reasons.append(f"Historical campaign match: {top_camp.campaign_name}")

    if not reasons:
        reasons = ["No critical threat indicators detected in initial webmail triage"]

    urls_summary = [
        {
            "original_url": u.original_url,
            "domain": u.domain,
            "reputation_score": u.reputation_score,
            "has_homoglyph": u.has_homoglyph_domain,
            "redirect_count": len(u.redirect_chain),
            "evidence_id": u.evidence_id
        }
        for u in urls
    ]

    total_indicators = len(findings) + len(suspicious_urls)

    response_obj = ExtensionAnalysisResponse(
        case_id=case_id,
        risk_score=round(threat_score.overall_score, 1),
        severity=threat_score.severity,
        confidence=round(0.85 + (len(findings) * 0.03), 2),
        summary=f"TRACE-X Sentinel identified {len(findings)} risk indicator(s). Overall severity is {threat_score.severity}.",
        reasons=reasons[:4],
        findings=findings,
        authentication={
            "spf": auth.spf_status,
            "dkim": auth.dkim_status,
            "dmarc": auth.dmarc_status,
            "alignment": auth.alignment
        },
        extracted_urls=urls_summary,
        threat_indicators_count=total_indicators,
        urls_count=len(urls),
        deep_link_url=f"http://localhost:5173/?case={case_id}&tab=email_forensics",
        created_at=new_case.created_at,
        cached=False
    )

    # Save to local cache
    analysis_cache[cache_key] = response_obj.model_dump()
    return response_obj


@router.post("/trace-link", response_model=TraceLinkResponse)
async def trace_link_from_extension(payload: TraceLinkPayload, request: Request):
    """
    On-demand single URL analysis for TRACE-X Sentinel link hover inspector.
    """
    enforce_rate_limit(request, extension_limiter)
    
    analyzed_list = UrlTracerService.analyze_urls([payload.url])
    if not analyzed_list:
        raise HTTPException(status_code=400, detail="Unable to parse URL")
        
    u = analyzed_list[0]
    factors = []
    for hop in u.redirect_chain:
        if hop.risk_factors:
            factors.extend(hop.risk_factors)
    if not factors:
        factors = ["Standard HTTP route"]

    return TraceLinkResponse(
        url=u.original_url,
        domain=u.domain,
        reputation_score=u.reputation_score,
        risk_level="CRITICAL" if u.reputation_score > 70 else ("HIGH" if u.reputation_score > 40 else "SAFE"),
        has_homoglyph=u.has_homoglyph_domain,
        is_suspicious=u.reputation_score > 40 or u.has_homoglyph_domain,
        redirect_count=len(u.redirect_chain),
        risk_factors=factors
    )
