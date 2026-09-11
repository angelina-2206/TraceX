import React from 'react';
import { Zap, AlertTriangle, MessageSquare, AlertCircle, ShieldAlert } from 'lucide-react';
import { SocialEngSignal, CaseDetail } from '../../types';
import { PageHeader } from '../common/PageHeader';

interface SocialEngineeringViewProps {
  caseDetail: CaseDetail;
}

export const SocialEngineeringView: React.FC<SocialEngineeringViewProps> = ({ caseDetail }) => {
  const signals: SocialEngSignal[] = caseDetail.social_eng_signals || [];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ── Page Header ── */}
      <PageHeader
        breadcrumbs={['ANVESHAK', caseDetail.case_id, 'Behavioral Analysis', 'Social Engineering']}
        title="Social Engineering & NLP Analysis Engine"
        description="Detects psychological manipulation, urgency coercion, executive impersonation, wire transfer demands, and credential harvesting lures."
        metadata={
          <>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              {signals.length} behavioral indicators flagged
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              NLP Confidence: 94.8%
            </span>
          </>
        }
      />

      <div className="space-y-4 text-xs">
        {signals.length === 0 ? (
          <div className="tracex-card p-8 text-center text-[var(--text-muted)]">
            No social engineering coercion signals detected in this message.
          </div>
        ) : (
          signals.map((s, idx) => (
            <div key={idx} className="tracex-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-[var(--blue-primary)] text-xs uppercase tracking-wider">
                    INDICATOR #{idx + 1}
                  </span>
                  <span className="text-[var(--text-primary)] font-semibold text-sm">{s.category}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  s.severity === 'HIGH' || s.severity === 'CRITICAL' ? 'badge-critical' : 'badge-medium'
                }`}>
                  {s.severity} SEVERITY ({s.score.toFixed(0)}/100)
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)]">
                <span className="text-[var(--text-muted)] font-bold mr-2 text-[10px] uppercase">
                  [LINE {s.line_number || 1}]
                </span>
                <span className="font-medium italic">"{s.evidence_quote}"</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
