import React, { useState } from 'react';
import { CaseDetail } from '../../types';
import { Activity, CheckCircle2, AlertCircle, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';

interface CaseTimelineBarProps {
  activeCase: CaseDetail | null;
  onNavigateToTab?: (tab: string) => void;
}

export const CaseTimelineBar: React.FC<CaseTimelineBarProps> = ({ activeCase, onNavigateToTab }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  if (!activeCase) return null;

  const timelineEvents = [
    { label: 'INGESTED', time: '09:42', tab: 'case_desk', done: true },
    { label: 'MIME PARSED', time: '09:42', tab: 'email_forensics', done: true },
    { label: 'AUTH FAILED', time: '09:43', tab: 'identity_deception', alert: true },
    { label: 'URL TRACED', time: '09:43', tab: 'url_tracer', done: true },
    { label: 'IP RESOLVED', time: '09:44', tab: 'header_recorder', done: true },
    { label: 'CAMPAIGN MATCH', time: '09:45', tab: 'campaign_intel', done: true },
    { label: 'EVIDENCE SEALED', time: '09:46', tab: 'blockchain_proof', done: true },
  ];

  return (
    <div className="bg-[var(--surface)] border-t border-[var(--border)] px-6 transition-all select-none shrink-0 z-30 font-sans shadow-sm">
      {/* Expanded Full Timeline View */}
      {expanded && (
        <div className="py-2.5 border-b border-[var(--border)] flex items-center gap-2 overflow-x-auto text-xs">
          {timelineEvents.map((evt, idx) => (
            <React.Fragment key={idx}>
              <button
                onClick={() => onNavigateToTab?.(evt.tab)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface-2)] hover:bg-[var(--surface-light)] transition-colors border border-[var(--border)] group shrink-0 cursor-pointer"
              >
                {evt.alert ? (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                <span className={`font-semibold text-[11px] ${evt.alert ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--text-primary)]'}`}>
                  {evt.label}
                </span>
                <span className="text-[var(--text-muted)] text-[10px]">{evt.time}</span>
              </button>
              {idx < timelineEvents.length - 1 && (
                <ArrowRight className="w-3 h-3 text-[var(--border-hi)] shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Collapsed Bar Summary (Compact) */}
      <div className="h-9 flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-3">
          <span className="text-[var(--text-primary)] font-bold">{activeCase.case_id}</span>
          <span className="text-[var(--border-hi)]">•</span>
          <span>7 Forensic Events</span>
          <span className="text-[var(--border-hi)]">•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Chain Sealed (SHA-256)</span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] text-[var(--blue-primary)] hover:underline font-semibold cursor-pointer"
        >
          <span>{expanded ? 'Hide Timeline' : 'Expand Timeline'}</span>
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
