export type UserRole = 'SOC_ANALYST' | 'INVESTIGATOR' | 'EXECUTIVE';

export interface HeaderHop {
  hop_index: number;
  from_host: string;
  by_host: string;
  ip: string;
  asn: string;
  isp: string;
  geo_location: string;
  timestamp: string;
  delay_seconds: number;
  raw_header: string;
  is_suspicious: boolean;
  flag_reason?: string;
}

export interface AuthStatus {
  spf_status: string;
  spf_domain: string;
  dkim_status: string;
  dkim_selector?: string;
  dmarc_status: string;
  dmarc_policy: string;
  alignment: string;
}

export interface IdentityAnalysis {
  display_name: string;
  sender_email: string;
  reply_to?: string;
  return_path?: string;
  claimed_brand?: string;
  lookalike_detected: boolean;
  homoglyph_detected: boolean;
  typosquat_domain?: string;
  reply_to_mismatch: boolean;
  return_path_mismatch: boolean;
  deception_score: number;
  deception_factors: string[];
}

export interface SocialEngSignal {
  category: string;
  severity: string;
  score: number;
  evidence_quote: string;
  line_number?: number;
}

export interface UrlRedirectHop {
  step: number;
  url: string;
  domain: string;
  ip?: string;
  asn?: string;
  status_code: number;
  is_shortener: boolean;
  is_suspicious: boolean;
  risk_factors: string[];
}

export interface UrlAnalysisItem {
  url_id: string;
  original_url: string;
  final_url: string;
  domain: string;
  redirect_count: number;
  redirect_chain: UrlRedirectHop[];
  has_credential_form: boolean;
  has_homoglyph_domain: boolean;
  reputation_score: number;
  evidence_id: string;
}

export interface AttachmentItem {
  attachment_id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  is_executable: boolean;
  is_macro_enabled: boolean;
  risk_level: string;
}

export interface GeoFinancialEntity {
  entity_id: string;
  beneficiary_name?: string;
  bank_name?: string;
  ifsc_code?: string;
  branch_name?: string;
  branch_city?: string;
  branch_state?: string;
  lat: number;
  lng: number;
  account_number_masked?: string;
  amount_requested?: string;
  ip_geolocation: string;
  ip_lat: number;
  ip_lng: number;
  location_mismatch: boolean;
  uncertainty_disclaimer: string;
}

export interface ThreatScoreComponent {
  category: string;
  score: number;
  max_score: number;
  weight: number;
  confidence: number;
  reasons: string[];
  evidence_ids: string[];
}

export interface DecomposedThreatScore {
  overall_score: number;
  severity: string;
  identity_score: ThreatScoreComponent;
  auth_score: ThreatScoreComponent;
  content_score: ThreatScoreComponent;
  url_score: ThreatScoreComponent;
  infrastructure_score: ThreatScoreComponent;
  campaign_score: ThreatScoreComponent;
}

export interface AttackDNA {
  dna_hash: string;
  identity_fingerprint: string;
  url_structure_hash: string;
  language_vector_id: string;
  auth_behavior_code: string;
  infrastructure_asn_set: string[];
  similarity_vectors: Record<string, number>;
}

export interface EmailClassification {
  category: string; // Legitimate, Suspicious, Phishing, Impersonation, Financial Fraud, BEC, Malware
  confidence: number;
  severity: string;
  summary_label: string;
  explainable_reasons: string[];
  key_indicators: Record<string, any>;
}

export interface CampaignMatch {
  campaign_id: string;
  campaign_name: string;
  confidence: number;
  matched_signals: string[];
  shared_asns: string[];
  shared_domains: string[];
  historical_case_ids: string[];
  status: string;
  related_emails_count?: number;
  related_domains_count?: number;
  related_ips_count?: number;
  related_urls_count?: number;
  related_hashes_count?: number;
  shared_ips?: string[];
  shared_urls?: string[];
  shared_attachment_hashes?: string[];
  shared_reply_tos?: string[];
  shared_message_id_patterns?: string[];
  threat_techniques?: string[];
  campaign_summary?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  details: Record<string, any>;
  severity?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  confidence: number;
  evidence_id: string;
}

export interface AttackGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ChainOfCustodyEvent {
  event_id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  artifact_id: string;
  prev_hash: string;
  current_hash: string;
  details: string;
}

export interface CaseSummary {
  case_id: string;
  title: string;
  status: string;
  severity: string;
  threat_score: number;
  email_subject: string;
  email_from: string;
  assignee: string;
  created_at: string;
  classification?: EmailClassification;
  campaign_matches?: CampaignMatch[];
}

export interface CaseDetail {
  case_id: string;
  title: string;
  status: string;
  severity: string;
  created_at: string;
  updated_at: string;
  assignee: string;
  summary: string;
  raw_email_id: string;
  email_subject: string;
  email_from: string;
  email_to: string;
  email_date: string;
  header_hops: HeaderHop[];
  auth_status: AuthStatus;
  identity_analysis: IdentityAnalysis;
  social_eng_signals: SocialEngSignal[];
  urls: UrlAnalysisItem[];
  attachments: AttachmentItem[];
  geo_financial?: GeoFinancialEntity;
  threat_score: DecomposedThreatScore;
  attack_dna: AttackDNA;
  campaign_matches: CampaignMatch[];
  attack_graph: AttackGraphData;
  chain_of_custody: ChainOfCustodyEvent[];
  classification?: EmailClassification;
}
