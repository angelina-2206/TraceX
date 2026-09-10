import React from 'react';
import { ExternalLink, ArrowRight, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { UrlAnalysisItem, CaseDetail } from '../../types';

interface UrlRedirectTracerProps {
  caseDetail: CaseDetail;
}

export const UrlRedirectTracer: React.FC<UrlRedirectTracerProps> = ({ caseDetail }) => {
  const urls = caseDetail.urls;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Title */}
      <div className="tracex-card p-5 border-l-4 border-l-teal-500">
        <h2 className="text-base font-bold font-mono text-slate-100 flex items-center space-x-2">
          <ExternalLink className="w-5 h-5 text-teal-400" />
          <span>URL REDIRECT TRACER & INFRASTRUCTURE PIPELINE</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Un-shortens links, resolves multi-hop redirect chains, inspects landing page credential forms, and applies security guardrails.
        </p>
      </div>

      {urls.length === 0 ? (
        <div className="tracex-card p-8 text-center text-slate-400 font-mono text-xs">
          No external hyperlinks or embedded URLs detected in email payload.
        </div>
      ) : (
        <div className="space-y-6">
          {urls.map((u) => (
            <div key={u.url_id} className="tracex-card p-6 space-y-4 font-mono text-xs">
              {/* Top Summary Bar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-teal-400">{u.url_id}</span>
                  <span className="text-slate-100 font-semibold">{u.domain}</span>
                  {u.redirect_count > 0 && (
                    <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 text-[10px]">
                      {u.redirect_count} REDIRECT HOP(S)
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {u.has_credential_form && (
                    <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800 text-[10px] font-bold flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>CREDENTIAL HARVEST FORM</span>
                    </span>
                  )}
                  <span className="text-slate-400">Risk Score: </span>
                  <span className="text-red-400 font-bold">{u.reputation_score.toFixed(0)}/100</span>
                </div>
              </div>

              {/* Step-by-Step Redirect Chain Flow */}
              <div>
                <div className="text-slate-400 text-[11px] uppercase mb-3">RESOLVED REDIRECT CHAIN STEP-BY-STEP</div>
                <div className="space-y-3">
                  {u.redirect_chain.map((hop) => (
                    <div key={hop.step} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-[11px]">
                          #{hop.step}
                        </div>
                        <div>
                          <div className="text-slate-200 font-semibold">{hop.domain}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-lg">{hop.url}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-slate-300">{hop.ip || 'Pending IP'}</div>
                        <div className="text-[10px] text-slate-500">{hop.asn}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
