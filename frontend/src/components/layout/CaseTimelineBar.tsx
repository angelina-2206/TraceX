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
    <div className="bg-[#121518] border-t border-[#2A2E33] px-5 transition-all select-none shrink-0 z-30 font-mono">
      {/* Expanded Full Timeline View */}
      {expanded && (
        <div className="py-3 border-b border-[#2A2E33] flex items-center gap-2 overflow-x-auto animate-fade-in text-xs">
          {timelineEvents.map((evt, idx) => (
            <React.Fragment key={idx}>
              <button
                onClick={() => onNavigateToTab?.(evt.tab)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181C20] hover:bg-[#22262B] transition-colors border border-[#2A2E33] group shrink-0"
              >
                {evt.alert ? (
                  <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                )}
                <span className={`font-semibold text-[11px] ${evt.alert ? 'text-amber-400' : 'text-gray-300'} group-hover:text-white`}>
                  {evt.label}
                </span>
                <span className="text-gray-500 text-[10px]">{evt.time}</span>
              </button>
              {idx < timelineEvents.length - 1 && (
                <ArrowRight className="w-3 h-3 text-gray-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Collapsed Bar Summary (Compact) */}
      <div className="h-9 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold">{activeCase.case_id}</span>
          <span className="text-gray-600">•</span>
          <span>7 EVENTS</span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-300">LAST EVENT: SHA-256 SEALED</span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white font-medium transition-colors"
        >
          <span>{expanded ? 'COLLAPSE TIMELINE' : 'TIMELINE'}</span>
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
