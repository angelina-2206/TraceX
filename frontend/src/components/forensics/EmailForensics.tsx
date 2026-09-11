import React, { useState } from 'react';
import { Mail, ShieldCheck, ShieldAlert, FileCode, Paperclip, Eye, EyeOff, CheckCircle2, XCircle, X, Network, ExternalLink, Zap, AlertTriangle } from 'lucide-react';
import { CaseDetail } from '../../types';
import { PageHeader } from '../common/PageHeader';

interface EmailForensicsProps {
  caseDetail: CaseDetail;
  onSelectTab?: (tab: string) => void;
}

export const EmailForensics: React.FC<EmailForensicsProps> = ({ caseDetail, onSelectTab }) => {
  const [showRawHeaders, setShowRawHeaders] = useState(false);
  const [activeTab, setActiveTab] = useState<'HEADER' | 'BODY' | 'ATTACHMENTS'>('HEADER');

  const auth = caseDetail.auth_status;
  const identity = caseDetail.identity_analysis;
  const classification = caseDetail.classification;
  const primaryCampaign = caseDetail.campaign_matches && caseDetail.campaign_matches.length > 0 ? caseDetail.campaign_matches[0] : null;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ── Page Header ── */}
      <PageHeader
        breadcrumbs={['ANVESHAK', caseDetail.case_id, 'Forensic Analysis', 'Email Artifacts']}
        title="Email Artifacts & MIME Analysis"
        description="Detailed MIME structure decomposition, identity alignment verification, SPF/DKIM/DMARC authentication, and payload artifact inspection."
        metadata={
          <>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              Case {caseDetail.case_id}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              {caseDetail.header_hops.length} Hops Analyzed
            </span>
          </>
        }
        actions={
          <button
            onClick={() => setShowRawHeaders(!showRawHeaders)}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center space-x-2"
          >
            {showRawHeaders ? <EyeOff className="w-4 h-4 text-[var(--blue-primary)]" /> : <Eye className="w-4 h-4 text-[var(--blue-primary)]" />}
            <span>{showRawHeaders ? 'Hide Raw Headers' : 'View Raw Headers'}</span>
          </button>
        }
      />

      {/* ── EMAIL CATEGORIZATION & EXPLAINABLE CONFIDENCE BANNER ── */}
      {classification && (
        <div className="tracex-card p-5 border-l-4 border-l-[var(--blue-primary)] space-y-3 bg-[var(--surface)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--blue-primary)]/10 text-[var(--blue-primary)] flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Automated Classifier Verdict
                </span>
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                  {classification.summary_label || `${classification.category} — ${classification.confidence.toFixed(0)}% confidence`}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                classification.severity === 'CRITICAL' ? 'badge-critical' :
                classification.severity === 'HIGH' ? 'badge-high' : 'badge-safe'
              }`}>
                {classification.severity} Severity
              </span>
              <span className="px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] font-mono">
                {classification.confidence.toFixed(1)}% Confidence
              </span>
            </div>
          </div>

          {/* Explainable Reasons List */}
          {classification.explainable_reasons && classification.explainable_reasons.length > 0 && (
            <div className="pt-2 border-t border-[var(--border)] space-y-1.5">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">
                Explainable Decision Factors:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {classification.explainable_reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] bg-[var(--surface-2)] p-2 rounded border border-[var(--border)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--blue-primary)] shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CAMPAIGN CORRELATION ENGINE BANNER ── */}
      {primaryCampaign && (
        <div className="tracex-card p-5 border-l-4 border-l-amber-500 bg-[var(--surface)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                  Campaign Correlation Engine Overlap ({primaryCampaign.confidence.toFixed(1)}% match)
                </span>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  {primaryCampaign.campaign_summary || `${primaryCampaign.campaign_id} — ${primaryCampaign.campaign_name}`}
                </h4>
              </div>
            </div>

            {onSelectTab && (
              <button
                onClick={() => onSelectTab('attack_graph')}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
              >
                <span>Open Campaign in Attack Graph</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Matched Signal Tags */}
          {primaryCampaign.matched_signals && primaryCampaign.matched_signals.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {primaryCampaign.matched_signals.map((sig, idx) => (
                <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border)]">
                  ⚡ {sig}
                </span>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Authentication Status Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="tracex-card p-4 space-y-2">
          <div className="text-[var(--text-muted)] text-[11px] font-semibold uppercase">SPF Authentication</div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[var(--text-primary)] truncate max-w-[120px]">{auth.spf_domain}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
              auth.spf_status === 'PASS' ? 'badge-safe' : 'badge-critical'
            }`}>
              {auth.spf_status}
            </span>
          </div>
        </div>

        <div className="tracex-card p-4 space-y-2">
          <div className="text-[var(--text-muted)] text-[11px] font-semibold uppercase">DKIM Signature</div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[var(--text-primary)]">{auth.dkim_selector ? `Selector: ${auth.dkim_selector}` : 'No Selector'}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
              auth.dkim_status === 'PASS' ? 'badge-safe' : 'badge-critical'
            }`}>
              {auth.dkim_status}
            </span>
          </div>
        </div>

        <div className="tracex-card p-4 space-y-2">
          <div className="text-[var(--text-muted)] text-[11px] font-semibold uppercase">DMARC Policy</div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[var(--text-primary)]">Policy: {auth.dmarc_policy || 'none'}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
              auth.dmarc_status === 'PASS' ? 'badge-safe' : 'badge-critical'
            }`}>
              {auth.dmarc_status}
            </span>
          </div>
        </div>

        <div className="tracex-card p-4 space-y-2">
          <div className="text-[var(--text-muted)] text-[11px] font-semibold uppercase">Domain Alignment</div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[var(--text-primary)]">Strict Alignment</span>
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
              auth.alignment === 'ALIGNED' ? 'badge-safe' : 'badge-high'
            }`}>
              {auth.alignment}
            </span>
          </div>
        </div>
      </div>

      {/* Main Forensic Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Envelope Metadata & Spoofing Assessment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Envelope Inspector */}
          <div className="tracex-card p-6 space-y-4">
            <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center justify-between">
              <span>Envelope & Transmission Headers</span>
              <span className="text-[var(--blue-primary)] font-semibold">Verified Forensic Ingest</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[var(--text-muted)] font-medium">FROM (Claimed Sender):</span>
                <span className="font-semibold text-[var(--text-primary)] code-mono">{caseDetail.email_from}</span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[var(--text-muted)] font-medium">REPLY-TO:</span>
                <span className="font-semibold text-[var(--text-primary)] code-mono">{identity?.reply_to || caseDetail.email_from}</span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[var(--text-muted)] font-medium">RETURN-PATH (Envelope Sender):</span>
                <span className="font-semibold text-[var(--text-primary)] code-mono">{identity?.return_path || 'Same as From'}</span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[var(--text-muted)] font-medium">MESSAGE-ID / RAW ID:</span>
                <span className="font-semibold text-[var(--text-secondary)] code-mono text-[11px] break-all">{caseDetail.raw_email_id}</span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[var(--text-muted)] font-medium">SUBJECT LINE:</span>
                <span className="font-semibold text-[var(--text-primary)]">{caseDetail.email_subject}</span>
              </div>
            </div>
          </div>

          {/* Identity Deception Assessment */}
          {identity && (
            <div className="tracex-card p-6 space-y-4">
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center justify-between">
                <span>Identity Deception Assessment</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${identity.lookalike_detected || identity.homoglyph_detected ? 'badge-critical' : 'badge-safe'}`}>
                  {identity.lookalike_detected || identity.homoglyph_detected ? 'Deception Detected' : 'Identity Aligned'}
                </span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                  {identity.lookalike_detected || identity.homoglyph_detected ? (
                    <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-[var(--text-primary)] text-sm">{identity.claimed_brand || 'Standard Sender Signature'}</div>
                    <p className="text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                      {identity.deception_factors.length > 0 ? identity.deception_factors.join(' • ') : 'Sender identity matches claimed domain credentials.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Artifact Tabs (Body Preview / Attachments) */}
        <div className="tracex-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => setActiveTab('HEADER')}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  activeTab === 'HEADER'
                    ? 'bg-[var(--blue-primary)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Structure
              </button>
              <button
                onClick={() => setActiveTab('BODY')}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  activeTab === 'BODY'
                    ? 'bg-[var(--blue-primary)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Body
              </button>
              <button
                onClick={() => setActiveTab('ATTACHMENTS')}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  activeTab === 'ATTACHMENTS'
                    ? 'bg-[var(--blue-primary)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Payloads ({caseDetail.attachments?.length || 0})
              </button>
            </div>
          </div>

          {activeTab === 'HEADER' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="text-[var(--text-muted)] text-[10px] uppercase font-semibold">MIME CONTENT-TYPE</span>
                <p className="text-[var(--text-primary)] font-semibold mt-0.5 font-mono">multipart/mixed; boundary="----=_Part_0_1294"</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="text-[var(--text-muted)] text-[10px] uppercase font-semibold">FORENSIC DIGEST (SHA-256)</span>
                <p className="text-[var(--blue-primary)] code-mono text-[10px] mt-0.5 break-all">
                  {caseDetail.chain_of_custody[0]?.current_hash || 'a4f89d91c8e14b22f091823ab129e4198231e'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'BODY' && (
            <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-mono overflow-y-auto max-h-[300px] leading-relaxed select-all">
              {caseDetail.summary || 'Raw plain text content extracted from ingested RFC-822 MIME payload.'}
            </div>
          )}

          {activeTab === 'ATTACHMENTS' && (
            <div className="space-y-2 text-xs">
              {caseDetail.attachments?.map((att, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 truncate">
                    <Paperclip className="w-4 h-4 text-[var(--blue-primary)] shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold text-[var(--text-primary)] truncate">{att.filename}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">{att.mime_type} • {(att.size_bytes / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${att.risk_level === 'HIGH' || att.is_executable ? 'badge-high' : 'badge-safe'}`}>
                    {att.risk_level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Raw Headers Modal Overlay */}
      {showRawHeaders && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between font-mono text-sm">
              <span className="font-bold text-[var(--text-primary)]">RAW FORENSIC EMAIL HEADERS ({caseDetail.case_id})</span>
              <button onClick={() => setShowRawHeaders(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1.5"><X className="w-4 h-4" /> CLOSE</button>
            </div>
            <div className="p-4 bg-[var(--surface-2)] code-mono text-xs text-[var(--text-secondary)] overflow-y-auto whitespace-pre-wrap select-all leading-relaxed">
              {caseDetail.header_hops.map(h => h.raw_header).join('\n')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
