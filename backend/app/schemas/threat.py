from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, TYPE_CHECKING

if TYPE_CHECKING:
    pass

class InvestigationTarget(BaseModel):
    target: str = Field(..., description="The suspicious URL, IP address, domain, or related indicator to aggregate intelligence for.")

    class Config:
        json_schema_extra = {
            "example": {
                "target": "https://suspicious-example.com/login"
            }
        }

class IndicatorDetails(BaseModel):
    original_target: str
    normalized_target: str
    indicator_type: str  # "url", "domain", "ip", "hash"
    domain: Optional[str] = None
    ip: Optional[str] = None
    url: Optional[str] = None

class AbuseIPDBReport(BaseModel):
    available: bool
    found: bool = True
    ip: Optional[str] = None
    abuse_confidence: Optional[int] = None
    country: Optional[str] = None
    isp: Optional[str] = None
    usage_type: Optional[str] = None
    total_reports: Optional[int] = None
    distinct_reporters: Optional[int] = None
    last_reported: Optional[str] = None

class IPGeolocationReport(BaseModel):
    available: bool
    ip: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None
    isp: Optional[str] = None
    organization: Optional[str] = None
    asn: Optional[str] = None

class URLScanReport(BaseModel):
    available: bool
    scan_id: Optional[str] = None
    submitted_url: Optional[str] = None
    final_url: Optional[str] = None
    domain: Optional[str] = None
    ip: Optional[str] = None
    asn: Optional[str] = None
    country: Optional[str] = None
    http_status: Optional[int] = None
    page_title: Optional[str] = None
    redirects: Optional[List[str]] = Field(default_factory=list)
    technologies: Optional[List[str]] = Field(default_factory=list)
    screenshot: Optional[str] = None
    scan_time: Optional[str] = None

class VirusTotalReport(BaseModel):
    available: bool
    indicator: Optional[str] = None
    type: Optional[str] = None
    reputation: Optional[int] = None
    malicious: Optional[int] = None
    suspicious: Optional[int] = None
    harmless: Optional[int] = None
    undetected: Optional[int] = None
    categories: Optional[List[str]] = Field(default_factory=list)
    detections: Optional[List[str]] = Field(default_factory=list)

class RiskEngineFactor(BaseModel):
    source: str
    reason: str
    weight: int

class RiskEngineRating(BaseModel):
    score: int
    level: str  # CLEAN, SUSPICIOUS, HIGH, CRITICAL, UNKNOWN
    confidence: int
    factors: List[RiskEngineFactor] = Field(default_factory=list)

class AggregatedIntelligence(BaseModel):
    abuseipdb: Optional[AbuseIPDBReport] = None
    ipgeolocation: Optional[IPGeolocationReport] = None
    urlscan: Optional[URLScanReport] = None
    virustotal: Optional[VirusTotalReport] = None

class UnifiedThreatReport(BaseModel):
    investigation_id: str
    target: str
    indicator_type: str
    normalized: IndicatorDetails
    intelligence: AggregatedIntelligence
    risk: RiskEngineRating
    provider_status: Dict[str, str]
    rag: Optional["InvestigationRAGContext"] = None
    ai_analysis: Optional[Dict[str, Any]] = None
    blockchain_anchor: Optional[Dict[str, Any]] = None


# Deferred import to avoid circular dependency
from app.schemas.rag import InvestigationRAGContext  # noqa: E402
UnifiedThreatReport.model_rebuild()
