import React, { useState, useEffect } from 'react';
import { Flame, ShieldCheck, CheckCircle2, XCircle, HelpCircle, Layers, Database } from 'lucide-react';
import { CampaignMatch, CaseDetail } from '../../types';

interface CampaignIntelligenceViewProps {
  caseDetail: CaseDetail;
}

export const CampaignIntelligenceView: React.FC<CampaignIntelligenceViewProps> = ({ caseDetail }) => {
  const [matches, setMatches] = useState<CampaignMatch[]>(caseDetail.campaign_matches);

  useEffect(() => {
    setMatches(caseDetail.campaign_matches || []);
  }, [caseDetail]);

  const handleDecision = (campId: string, newStatus: string) => {
    setMatches(prev => prev.map(m => m.campaign_id === campId ? { ...m, status: newStatus } : m));
  };

  const dna = caseDetail.attack_dna;

  return (
    <div className="space-y-6 p-6">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center space-x-2">
          <Flame className="w-5 h-5 text-cyan-400" />
          <span>CAMPAIGN INTELLIGENCE — INSTITUTIONAL THREAT MEMORY</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Correlates Attack DNA fingerprints with historical cases to uncover shared ASN infrastructure, redirect patterns, and campaign signatures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack DNA Fingerprint Card */}
        <div className="forensic-card p-6 space-y-4 font-mono text-xs">
          <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>ATTACK DNA FINGERPRINT</span>
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400 text-[11px]">DNA HASH:</span>
              <p className="text-slate-100 font-bold text-sm mt-0.5"><code className="text-cyan-300">{dna.dna_hash}</code></p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">IDENTITY PATTERN:</span>
              <p className="text-slate-200 mt-0.5">{dna.identity_fingerprint}</p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">REDIRECT PATTERN:</span>
              <p className="text-slate-200 mt-0.5">{dna.url_structure_hash}</p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">AUTHENTICATION PROFILE:</span>
              <p className="text-slate-200 mt-0.5">{dna.auth_behavior_code}</p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">INFRASTRUCTURE ASN SET:</span>
              <div className="flex items-center space-x-2 mt-1">
                {dna.infrastructure_asn_set.map(asn => (
                  <span key={asn} className="px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 font-bold">
                    {asn}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Matches & Analyst Decisions (Right 2 columns) */}
        <div className="lg:col-span-2 forensic-card p-6 space-y-4 font-mono text-xs">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
            HISTORICAL CAMPAIGN CORRELATIONS ({matches.length})
          </h3>

          {matches.length === 0 ? (
            <p className="text-slate-400 py-6 text-center">No historical campaign matches identified in institutional threat memory.</p>
          ) : (
            <div className="space-y-4">
              {matches.map((camp) => (
                <div key={camp.campaign_id} className="p-4 rounded bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-100">{camp.campaign_name}</div>
                      <div className="text-[11px] text-slate-400">Match Confidence: <span className="text-cyan-400 font-bold">{camp.confidence.toFixed(1)}%</span></div>
                    </div>

                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      camp.status === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      camp.status === 'REJECTED' ? 'bg-slate-900 text-slate-400 border border-slate-700' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {camp.status} RELATIONSHIP
                    </span>
                  </div>

                  {/* Matched Signals List */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-900">
                    <span className="text-slate-400 text-[11px]">SHARED EVIDENCE SIGNALS:</span>
                    {camp.matched_signals.map((sig, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>

                  {/* Analyst Decision Controls */}
                  <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">ANALYST DECISION:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDecision(camp.campaign_id, 'CONFIRMED')}
                        className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-[10px] font-bold"
                      >
                        CONFIRM MATCH
                      </button>
                      <button
                        onClick={() => handleDecision(camp.campaign_id, 'REJECTED')}
                        className="px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold"
                      >
                        REJECT
                      </button>
                      <button
                        onClick={() => handleDecision(camp.campaign_id, 'SUSPECTED')}
                        className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 text-[10px] font-bold"
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
