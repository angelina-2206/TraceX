import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, User, Globe, Mail } from 'lucide-react';
import { IdentityAnalysis, CaseDetail } from '../../types';
import { PageHeader } from '../common/PageHeader';

interface IdentityDeceptionViewProps {
  caseDetail: CaseDetail;
}

export const IdentityDeceptionView: React.FC<IdentityDeceptionViewProps> = ({ caseDetail }) => {
  const identity: IdentityAnalysis = caseDetail.identity_analysis;
  const isHighRisk = identity.deception_score > 60;
  const isMediumRisk = identity.deception_score > 30 && !isHighRisk;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ── Page Header ── */}
      <PageHeader
        breadcrumbs={['ANVESHAK', caseDetail.case_id, 'Forensic Analysis', 'Identity Deception Engine']}
        title="Identity Deception & Impersonation Engine"
        description="Detect display-name brand spoofing, homoglyph character substitutions, typosquatting, and envelope Reply-To misalignments across email headers."
        metadata={
          <>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              Case {caseDetail.case_id}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full ${isHighRisk ? 'badge-critical' : isMediumRisk ? 'badge-medium' : 'badge-safe'}`}>
              Deception Score: {identity.deception_score.toFixed(0)} / 100
            </span>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deception Score Card */}
        <div className="tracex-card p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
            Identity Deception Score
          </div>

          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="60" stroke="currentColor" strokeWidth="10" className="text-[var(--border)]" fill="transparent" />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={376}
                strokeDashoffset={376 - (376 * identity.deception_score) / 100}
                className={isHighRisk ? 'text-rose-600 dark:text-rose-400' : isMediumRisk ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold font-mono text-[var(--text-primary)]">{identity.deception_score.toFixed(0)}</span>
              <span className="text-xs text-[var(--text-muted)]">/ 100</span>
            </div>
          </div>

          <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
            isHighRisk ? 'badge-critical' : isMediumRisk ? 'badge-medium' : 'badge-safe'
          }`}>
            {isHighRisk ? 'High Deception Risk' : isMediumRisk ? 'Moderate Risk' : 'Authentic Aligned'}
          </span>
        </div>

        {/* Detailed Impersonation Breakdown */}
        <div className="lg:col-span-2 tracex-card p-6 space-y-4">
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2 flex items-center justify-between">
            <span>Identity Alignment Audit</span>
            <span className="text-[var(--blue-primary)] font-semibold">HEADER VERDICT</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)] font-medium uppercase text-[10px]">CLAIMED DISPLAY NAME:</span>
                <span className="font-semibold text-[var(--text-primary)]">{identity.display_name}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)] font-medium uppercase text-[10px]">FROM HEADER ADDRESS:</span>
                <span className="font-semibold text-[var(--text-primary)] code-mono">{identity.sender_email}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)] font-medium uppercase text-[10px]">REPLY-TO ADDRESS:</span>
                <span className="font-semibold text-[var(--text-primary)] code-mono">{identity.reply_to || 'N/A'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)] font-medium uppercase text-[10px]">HOMOGLYPH CHECK:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${identity.homoglyph_detected ? 'badge-critical' : 'badge-safe'}`}>
                  {identity.homoglyph_detected ? 'HOMOGLYPH CHARACTERS DETECTED' : 'CLEAN CHARACTER SET'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
