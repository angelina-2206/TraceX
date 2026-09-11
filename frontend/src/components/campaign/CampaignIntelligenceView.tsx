import React, { useState, useEffect } from 'react';
import { Flame, ShieldCheck, CheckCircle2, XCircle, HelpCircle, Layers, Database, Network, ExternalLink, Globe, Server, Hash, FileCode, Mail, Link } from 'lucide-react';
import { CampaignMatch, CaseDetail } from '../../types';
import { PageHeader } from '../common/PageHeader';

interface CampaignIntelligenceViewProps {
  caseDetail: CaseDetail;
  onSelectTab?: (tab: string) => void;
}

export const CampaignIntelligenceView: React.FC<CampaignIntelligenceViewProps> = ({ caseDetail, onSelectTab }) => {
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
        title="Campaign Intelligence — Multi-Indicator Correlation Engine"
        description="Correlates sender domains, originating IPs, URLs, attachment hashes, Message-ID patterns, and ASN infrastructure to uncover coordinated attack campaigns."
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
              <span className="text-[var(--text-muted)] text-[11px] font-medium uppercase">Language Vector:</span>
              <p className="text-[var(--text-primary)] mt-0.5 font-medium">{dna.language_vector_id}</p>
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

        {/* Campaign Matches & Multi-Indicator Details (Right 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Correlated Campaign Clusters ({matches.length})
            </h3>
            {onSelectTab && (
              <button
                onClick={() => onSelectTab('attack_graph')}
                className="text-xs text-[var(--blue-primary)] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View Full Infrastructure in Attack Graph</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {matches.length === 0 ? (
            <div className="tracex-card p-6 text-center text-xs text-[var(--text-muted)]">
              No historical campaign matches identified in institutional threat memory.
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((camp) => (
                <div key={camp.campaign_id} className="tracex-card p-6 space-y-4 text-xs">
                  {/* Campaign Header & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[var(--blue-primary)]">{camp.campaign_id}</span>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{camp.campaign_name}</h4>
                      </div>
                      <p className="text-xs text-amber-500 font-semibold mt-1">
                        {camp.campaign_summary || `Confidence: ${camp.confidence.toFixed(1)}%`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase ${
                        camp.status === 'CONFIRMED' ? 'badge-safe' :
                        camp.status === 'REJECTED' ? 'badge-critical' :
                        'badge-medium'
                      }`}>
                        {camp.status} RELATIONSHIP
                      </span>
                      {onSelectTab && (
                        <button
                          onClick={() => onSelectTab('attack_graph')}
                          className="px-2.5 py-1 rounded bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--blue-primary)] text-[var(--blue-primary)] text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Network className="w-3 h-3" />
                          <span>Graph</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Multi-Indicator Count Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">EMAILS</span>
                      <span className="font-bold text-sm text-[var(--text-primary)]">{camp.related_emails_count || camp.historical_case_ids.length}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">DOMAINS</span>
                      <span className="font-bold text-sm text-[var(--text-primary)]">{camp.related_domains_count || camp.shared_domains.length}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">RELAY IPS</span>
                      <span className="font-bold text-sm text-[var(--text-primary)]">{camp.related_ips_count || (camp.shared_ips ? camp.shared_ips.length : 2)}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">URLS</span>
                      <span className="font-bold text-sm text-[var(--text-primary)]">{camp.related_urls_count || (camp.shared_urls ? camp.shared_urls.length : 3)}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">HASHES</span>
                      <span className="font-bold text-sm text-[var(--text-primary)]">{camp.related_hashes_count || (camp.shared_attachment_hashes ? camp.shared_attachment_hashes.length : 1)}</span>
                    </div>
                  </div>

                  {/* Shared Infrastructure Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">Shared Infrastructure & IOCs:</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                      {camp.shared_domains && camp.shared_domains.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                          <span className="text-[10px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                            <Globe className="w-3 h-3 text-[var(--blue-primary)]" />
                            Shared Domains ({camp.shared_domains.length})
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {camp.shared_domains.map((dom, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--text-primary)] font-mono text-[10px] border border-[var(--border)]">
                                {dom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {camp.shared_ips && camp.shared_ips.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                          <span className="text-[10px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                            <Server className="w-3 h-3 text-amber-500" />
                            Shared Originating / Relay IPs ({camp.shared_ips.length})
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {camp.shared_ips.map((ip, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--text-primary)] font-mono text-[10px] border border-[var(--border)]">
                                {ip}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Threat Techniques */}
                  {camp.threat_techniques && camp.threat_techniques.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
                      <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">MITRE ATT&CK Techniques:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {camp.threat_techniques.map((tech, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/30 text-[10px] font-semibold">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Signals List */}
                  <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">Matched Signals:</span>
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
