import React, { useState, useEffect } from 'react';
import { Flame, ShieldCheck, CheckCircle2, XCircle, HelpCircle, Layers, Database } from 'lucide-react';
import { CampaignMatch, CaseDetail } from '../../types';
import { PageHeader } from '../common/PageHeader';

interface CampaignIntelligenceViewProps {
  caseDetail: CaseDetail;
}

export const CampaignIntelligenceView: React.FC<CampaignIntelligenceViewProps> = ({ caseDetail }) => {
  const [matches, setMatches] = useState<CampaignMatch[]>(caseDetail.campaign_matches || []);

  useEffect(() => {
    setMatches(caseDetail.campaign_matches || []);
  }, [caseDetail]);

  const handleDecision = (campId: string, newStatus: string) => {
    setMatches(prev => prev.map(m => m.campaign_id === campId ? { ...m, status: newStatus } : m));
  };

  const dna = caseDetail.attack_dna;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ── Page Header ── */}
      <PageHeader
        breadcrumbs={['ANVESHAK', caseDetail.case_id, 'Threat Memory', 'Campaign Intelligence']}
        title="Campaign Intelligence — Institutional Threat Memory"
        description="Correlates Attack DNA fingerprints with historical cases to uncover shared ASN infrastructure, redirect patterns, and campaign signatures."
        metadata={
          <>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              {matches.length} campaign clusters identified
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)] code-mono">
              DNA: {dna.dna_hash.slice(0, 16)}...
            </span>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack DNA Fingerprint Card */}
        <div className="tracex-card p-6 space-y-4 text-xs">
          <h3 className="text-xs font-semibold text-[var(--blue-primary)] uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[var(--blue-primary)]" />
            <span>Attack DNA Fingerprint</span>
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-[var(--text-muted)] text-[11px] font-medium uppercase">DNA Hash:</span>
              <p className="font-semibold text-xs mt-0.5 break-all code-mono text-[var(--text-primary)] bg-[var(--surface-2)] p-2 rounded border border-[var(--border)]">
                {dna.dna_hash}
              </p>
            </div>

            <div>
              <span className="text-[var(--text-muted)] text-[11px] font-medium uppercase">Identity Pattern:</span>
              <p className="text-[var(--text-primary)] mt-0.5 font-medium">{dna.identity_fingerprint}</p>
            </div>

            <div>
              <span className="text-[var(--text-muted)] text-[11px] font-medium uppercase">Redirect Pattern:</span>
              <p className="text-[var(--text-primary)] mt-0.5 code-mono text-[11px]">{dna.url_structure_hash}</p>
            </div>

            <div>
              <span className="text-[var(--text-muted)] text-[11px] font-medium uppercase">Authentication Profile:</span>
              <p className="text-[var(--text-primary)] mt-0.5 font-medium">{dna.auth_behavior_code}</p>
            </div>

            <div>
              <span className="text-[var(--text-muted)] text-[11px] font-medium uppercase">Infrastructure ASN Set:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {dna.infrastructure_asn_set.map(asn => (
                  <span key={asn} className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--blue-primary)] border border-[var(--border)] font-semibold code-mono text-[11px]">
                    {asn}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Matches & Analyst Decisions (Right 2 columns) */}
        <div className="lg:col-span-2 tracex-card p-6 space-y-4 text-xs">
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
            Historical Campaign Correlations ({matches.length})
          </h3>

          {matches.length === 0 ? (
            <p className="text-[var(--text-muted)] py-6 text-center">No historical campaign matches identified in institutional threat memory.</p>
          ) : (
            <div className="space-y-4">
              {matches.map((camp) => (
                <div key={camp.campaign_id} className="p-4 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">{camp.campaign_name}</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Match Confidence: <span className="text-[var(--blue-primary)] font-bold">{camp.confidence.toFixed(1)}%</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase ${
                      camp.status === 'CONFIRMED' ? 'badge-safe' :
                      camp.status === 'REJECTED' ? 'badge-critical' :
                      'badge-medium'
                    }`}>
                      {camp.status} RELATIONSHIP
                    </span>
                  </div>

                  {/* Matched Signals List */}
                  <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)] text-[11px] font-medium">SHARED EVIDENCE SIGNALS:</span>
                    {camp.matched_signals.map((sig, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>

                  {/* Analyst Decision Controls */}
                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">ANALYST DECISION:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDecision(camp.campaign_id, 'CONFIRMED')}
                        className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-[10px] font-semibold cursor-pointer"
                      >
                        CONFIRM MATCH
                      </button>
                      <button
                        onClick={() => handleDecision(camp.campaign_id, 'REJECTED')}
                        className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 text-[10px] font-semibold cursor-pointer"
                      >
                        REJECT
                      </button>
                      <button
                        onClick={() => handleDecision(camp.campaign_id, 'SUSPECTED')}
                        className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 text-[10px] font-semibold cursor-pointer"
                      >
                        MARK UNCERTAIN
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
