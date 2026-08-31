import React from 'react';
import { CaseDetail } from '../../types';
import { Activity, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface CaseTimelineBarProps {
  activeCase: CaseDetail | null;
  onNavigateToTab?: (tab: string) => void;
}

export const CaseTimelineBar: React.FC<CaseTimelineBarProps> = ({ activeCase, onNavigateToTab }) => {
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
    <div className="h-10 bg-black/60 backdrop-blur-md border-t border-white/10 px-5 flex items-center justify-between text-xs font-mono select-none shrink-0 z-30">
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-fuchsia-400 font-bold text-[11px]">
          <Activity className="w-3.5 h-3.5" />
          <span>TELEMETRY TIMELINE</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300 font-bold text-[11px]">{activeCase.case_id}</span>
      </div>

      {/* Timeline Stream */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto py-1">
        {timelineEvents.map((evt, idx) => (
          <React.Fragment key={idx}>
            <button
              onClick={() => onNavigateToTab?.(evt.tab)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] transition-all hover:bg-white/10 group"
            >
              {evt.alert ? (
                <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-fuchsia-400 shrink-0" />
              )}
              <span className={`font-bold ${evt.alert ? 'text-amber-400' : 'text-slate-300'} group-hover:text-fuchsia-300`}>
                {evt.label}
              </span>
              <span className="text-slate-500 text-[9px]">{evt.time}</span>
            </button>
            {idx < timelineEvents.length - 1 && (
              <ArrowRight className="w-2.5 h-2.5 text-slate-700 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-3 text-[10px] text-slate-500 shrink-0">
        <span className="text-fuchsia-400 font-bold hidden lg:inline">SHA-256 SEALED</span>
        <span className="text-slate-700 hidden lg:inline">|</span>
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>7 STAGES VERIFIED</span>
        </div>
      </div>
    </div>
  );
};
