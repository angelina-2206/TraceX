import React from 'react';
import { ExternalLink, ArrowRight, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { UrlAnalysisItem, CaseDetail } from '../../types';

interface UrlRedirectTracerProps {
  caseDetail: CaseDetail;
}

export const UrlRedirectTracer: React.FC<UrlRedirectTracerProps> = ({ caseDetail }) => {
  const urls = caseDetail.urls;

  return (
    <div className="space-y-6 p-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center space-x-2">
          <ExternalLink className="w-5 h-5 text-cyan-400" />
          <span>URL REDIRECT TRACER & INFRASTRUCTURE PIPELINE</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Un-shortens links, resolves multi-hop redirect chains, inspects landing page credential forms, and applies SSRF security guardrails.
        </p>
      </div>

      {urls.length === 0 ? (
        <div className="forensic-card p-8 text-center text-slate-400 font-mono text-xs">
          No external hyperlinks or embedded URLs detected in email content.
        </div>
      ) : (
        <div className="space-y-6">
          {urls.map((u) => (
            <div key={u.url_id} className="forensic-card p-6 space-y-4 font-mono text-xs">
              {/* Top Summary Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-cyan-400">{u.url_id}</span>
                  <span className="text-slate-300 font-semibold">{u.domain}</span>
                  {u.redirect_count > 0 && (
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px]">
                      {u.redirect_count} REDIRECT HOP(S)
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {u.has_credential_form && (
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>CREDENTIAL FORM</span>
                    </span>
                  )}
                  <span className="text-slate-400">Risk Rating: </span>
                  <span className="text-red-400 font-bold">{u.reputation_score.toFixed(0)}/100</span>
                </div>
              </div>

              {/* Step-by-Step Redirect Chain Flow */}
              <div>
                <div className="text-slate-400 text-[11px] uppercase mb-3">RESOLVED REDIRECT CHAIN STEP-BY-STEP</div>
                <div className="space-y-3">
                  {u.redirect_chain.map((hop) => (
                    <div key={hop.step} className="p-3 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[11px]">
                          #{hop.step}
                        </div>
                        <div>
                          <div className="text-slate-200 font-semibold">{hop.domain}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-lg">{hop.url}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-slate-300">{hop.ip || 'Pending IP'}</div>
                        <div className="text-[10px] text-slate-400">{hop.asn}</div>
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
