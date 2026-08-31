from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class HeaderHop(BaseModel):
    hop_index: int
    from_host: str
    by_host: str
    ip: str
    asn: str
    isp: str
    geo_location: str
    timestamp: str
    delay_seconds: int
    raw_header: str
    is_suspicious: bool = False
    flag_reason: Optional[str] = None

class AuthStatus(BaseModel):
    spf_status: str # PASS, FAIL, SOFTFAIL, NONE
    spf_domain: str
    dkim_status: str # PASS, FAIL, NONE
    dkim_selector: Optional[str] = None
    dmarc_status: str # PASS, FAIL, NONE
    dmarc_policy: str # reject, quarantine, none
    alignment: str # ALIGNED, MISALIGNED

class IdentityAnalysis(BaseModel):
    display_name: str
    sender_email: str
    reply_to: Optional[str] = None
    return_path: Optional[str] = None
    claimed_brand: Optional[str] = None
    lookalike_detected: bool = False
    homoglyph_detected: bool = False
    typosquat_domain: Optional[str] = None
    reply_to_mismatch: bool = False
    return_path_mismatch: bool = False
    deception_score: float # 0 to 100
    deception_factors: List[str]

class SocialEngSignal(BaseModel):
    category: str # Urgency, Authority, Account Suspension, Financial Pressure, Payment Redirection
    severity: str # HIGH, MEDIUM, LOW
    score: float # 0 to 100
    evidence_quote: str
    line_number: Optional[int] = None

class UrlRedirectHop(BaseModel):
    step: int
    url: str
    domain: str
    ip: Optional[str] = None
    asn: Optional[str] = None
    status_code: int
    is_shortener: bool = False
    is_suspicious: bool = False
    risk_factors: List[str]

class UrlAnalysisItem(BaseModel):
    url_id: str
    original_url: str
    final_url: str
    domain: str
    redirect_count: int
    redirect_chain: List[UrlRedirectHop]
    has_credential_form: bool = False
    has_homoglyph_domain: bool = False
    reputation_score: float # 0 to 100
    evidence_id: str

class AttachmentItem(BaseModel):
    attachment_id: str
    filename: str
    mime_type: str
    size_bytes: int
    sha256: str
    is_executable: bool = False
    is_macro_enabled: bool = False
    risk_level: str # HIGH, MEDIUM, LOW, CLEAN
    magic_bytes: Optional[str] = "25 50 44 46 2D 31 2E 37" # %PDF-1.7
    entropy_score: Optional[float] = 6.42 # Shannon entropy
    yara_matches: Optional[List[str]] = ["SUSPICIOUS_OBFUSCATED_JAVASCRIPT", "URI_SCHEME_PAYLOAD"]
    extracted_strings: Optional[List[str]] = ["powershell.exe -e", "http://micr0soft-login-check.net"]
    sandbox_details: Optional[Dict[str, Any]] = None

class GeoFinancialEntity(BaseModel):
    entity_id: str
    beneficiary_name: Optional[str] = None
    bank_name: Optional[str] = None
    ifsc_code: Optional[str] = None
    branch_name: Optional[str] = None
    branch_city: Optional[str] = None
    branch_state: Optional[str] = None
    lat: float
    lng: float
    account_number_masked: Optional[str] = None
    amount_requested: Optional[str] = None
    ip_geolocation: str
    ip_lat: float
    ip_lng: float
    location_mismatch: bool = True
    uncertainty_disclaimer: str = "Cross-region infrastructure & payout clues observed. IFSC location does not confirm physical perpetrator location."

class ThreatScoreComponent(BaseModel):
    category: str
    score: float # max for this category
    max_score: float
    weight: float
    confidence: float
    reasons: List[str]
    evidence_ids: List[str]

class DecomposedThreatScore(BaseModel):
    overall_score: float # 0 to 100
    severity: str # CRITICAL, HIGH, MEDIUM, LOW
    identity_score: ThreatScoreComponent
    auth_score: ThreatScoreComponent
    content_score: ThreatScoreComponent
    url_score: ThreatScoreComponent
    infrastructure_score: ThreatScoreComponent
    campaign_score: ThreatScoreComponent

class AttackDNA(BaseModel):
    dna_hash: str
    identity_fingerprint: str
    url_structure_hash: str
    language_vector_id: str
    auth_behavior_code: str
    infrastructure_asn_set: List[str]
    similarity_vectors: Dict[str, float]

class CampaignMatch(BaseModel):
    campaign_id: str
    campaign_name: str
    confidence: float # 0 to 100
    matched_signals: List[str]
    shared_asns: List[str]
    shared_domains: List[str]
    historical_case_ids: List[str]
    status: str = "SUSPECTED" # CONFIRMED, REJECTED, SUSPECTED

class GraphNode(BaseModel):
    id: str
    label: str
    type: str # EMAIL, IDENTITY, DOMAIN, URL, IP, ASN, ATTACHMENT, HASH, BANK_ENTITY, LOCATION, CAMPAIGN, CASE
    details: Dict[str, Any]
    severity: str = "INFO"

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    relationship: str # SENT_BY, CLAIMS_TO_BE, REPLY_TO, ROUTED_THROUGH, CONTAINS, REDIRECTS_TO, RESOLVES_TO, HOSTED_BY, OBSERVED_IN, RELATED_TO, REQUESTS_PAYMENT_TO, LOCATED_IN, PART_OF_CAMPAIGN
    confidence: float = 1.0
    evidence_id: str

class AttackGraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class ChainOfCustodyEvent(BaseModel):
    event_id: str
    timestamp: str
    actor: str
    role: str
    action: str
    artifact_id: str
    prev_hash: str
    current_hash: str
    details: str
    blockchain_proof: Optional[Dict[str, Any]] = None
    merkle_proof: Optional[List[Dict[str, Any]]] = None

class CaseDetail(BaseModel):
    case_id: str
    title: str
    status: str # INVESTIGATING, UNDER_REVIEW, SEALED, QUARANTINED
    severity: str # CRITICAL, HIGH, MEDIUM, LOW
    created_at: str
    updated_at: str
    assignee: str
    summary: str
    
    # Forensic analysis objects
    raw_email_id: str
    email_subject: str
    email_from: str
    email_to: str
    email_date: str
    header_hops: List[HeaderHop]
    auth_status: AuthStatus
    identity_analysis: IdentityAnalysis
    social_eng_signals: List[SocialEngSignal]
    urls: List[UrlAnalysisItem]
    attachments: List[AttachmentItem]
    geo_financial: Optional[GeoFinancialEntity] = None
    threat_score: DecomposedThreatScore
    attack_dna: AttackDNA
    campaign_matches: List[CampaignMatch]
    attack_graph: AttackGraphData
    chain_of_custody: List[ChainOfCustodyEvent]
    mitre_techniques: Optional[List[Dict[str, Any]]] = None
