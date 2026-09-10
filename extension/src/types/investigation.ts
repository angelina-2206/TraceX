export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'WARNING' | 'MEDIUM' | 'LOW' | 'SAFE' | 'UNVERIFIED';

export interface ExtractedEmail {
  source: 'gmail' | 'outlook' | 'webmail';
  sender: string;
  senderName?: string;
  recipients: string[];
  subject: string;
  timestamp?: string;
  bodyText: string;
  rawHeaders?: string;
  urls: string[];
  messageId?: string;
}

export interface ExtensionFinding {
  type: 'identity' | 'auth' | 'url' | 'content' | 'infrastructure' | 'campaign';
  severity: SeverityLevel;
  title: string;
  description: string;
  evidence_id?: string;
}

export interface ExtractedUrlInfo {
  original_url: string;
  domain: string;
  reputation_score: number;
  has_homoglyph: boolean;
  redirect_count: number;
  evidence_id: string;
}

export interface AnalysisVerdict {
  case_id: string;
  risk_score: number;
  severity: SeverityLevel;
  confidence: number;
  summary: string;
  reasons: string[];
  findings: ExtensionFinding[];
  authentication: {
    spf: string;
    dkim: string;
    dmarc: string;
    alignment: string;
  };
  extracted_urls: ExtractedUrlInfo[];
  threat_indicators_count: number;
  urls_count: number;
  deep_link_url: string;
  created_at: string;
  cached?: boolean;
}

export interface TraceLinkResult {
  url: string;
  domain: string;
  reputation_score: number;
  risk_level: SeverityLevel;
  has_homoglyph: boolean;
  is_suspicious: boolean;
  redirect_count: number;
  risk_factors: string[];
}

export type ExtensionState =
  | { status: 'NO_EMAIL_DETECTED' }
  | { status: 'EMAIL_DETECTED'; email: ExtractedEmail }
  | { status: 'ANALYZING'; step: number; stepText: string; email: ExtractedEmail }
  | { status: 'ANALYZED'; email: ExtractedEmail; verdict: AnalysisVerdict }
  | { status: 'ERROR'; message: string; email?: ExtractedEmail };
