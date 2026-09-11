import React from 'react';
import { ExternalLink, ArrowRight, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { UrlAnalysisItem, CaseDetail } from '../../types';
import { PageHeader } from '../common/PageHeader';

interface UrlRedirectTracerProps {
  caseDetail: CaseDetail;
}

export const UrlRedirectTracer: React.FC<UrlRedirectTracerProps> = ({ caseDetail }) => {
  const urls = caseDetail.urls;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ── Page Header ── */}
      <PageHeader
        breadcrumbs={['ANVESHAK', caseDetail.case_id, 'Forensic Analysis', 'Redirect Tracer']}
        title="URL Redirect Tracer & Infrastructure Pipeline"
        description="Un-shorten links, resolve multi-hop redirect chains, inspect landing page credential harvesting forms, and fingerprint destination domains."
        metadata={
          <>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              Case {caseDetail.case_id}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              {urls.length} Embedded URLs
            </span>
          </>
        }
      />

      {urls.length === 0 ? (
        <div className="tracex-card p-8 text-center text-[var(--text-muted)] text-xs">
          No external hyperlinks or embedded URLs detected in email payload.
        </div>
      ) : (
        <div className="space-y-6">
          {urls.map((u) => (
            <div key={u.url_id} className="tracex-card p-6 space-y-4">
              {/* Top Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] pb-3 gap-2">
                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-bold text-[var(--blue-primary)] font-mono">{u.url_id}</span>
                  <span className="text-[var(--text-primary)] font-semibold">{u.domain}</span>
                  {u.redirect_count > 0 && (
                    <span className="px-2 py-0.5 rounded badge-medium text-[10px]">
                      {u.redirect_count} Redirect Hop(s)
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  {u.has_credential_form && (
                    <span className="px-2 py-0.5 rounded badge-critical text-[10px] flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Credential Harvest Form</span>
                    </span>
                  )}
                  <span className="text-[var(--text-muted)]">Reputation Risk: </span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{u.reputation_score.toFixed(0)} / 100</span>
                </div>
              </div>

              {/* Step-by-Step Redirect Chain Flow */}
              <div>
                <div className="text-[var(--text-muted)] text-xs font-semibold uppercase mb-3">Resolved Redirect Chain Step-By-Step</div>
                <div className="space-y-3">
                  {u.redirect_chain.map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center font-bold text-[10px] text-[var(--text-secondary)] shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-mono text-[var(--text-primary)] font-medium text-[11px] truncate">{step.url}</div>
                          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">IP: {step.ip} • Status {step.status_code}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[10px] text-[var(--text-secondary)] font-mono">
                          {step.ip}
                        </span>
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
