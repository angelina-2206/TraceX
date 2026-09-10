import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ExtensionFinding } from '../types/investigation';

interface EvidenceWhyListProps {
  findings: ExtensionFinding[];
  authStatus?: {
    spf: string;
    dkim: string;
    dmarc: string;
    alignment: string;
  };
}

export const EvidenceWhyList: React.FC<EvidenceWhyListProps> = ({ findings, authStatus }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-0.5">
        <span>Evidence & Findings ({findings.length})</span>
        <span className="text-[9px] text-slate-500 font-mono">Forensic Basis</span>
      </div>

      <div className="space-y-1">
        {findings.map((f, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              className="rounded-lg bg-[#0A1628] border border-white/10 overflow-hidden text-xs"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full p-2 flex items-center justify-between text-left hover:bg-[#0F1E35] transition-colors"
              >
                <div className="flex items-center gap-2 pr-2 min-w-0">
                  <span className="text-slate-500 text-[10px] font-sans font-medium">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-slate-200 font-medium truncate">{f.title}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-sans font-semibold uppercase ${
                      f.severity === 'CRITICAL' || f.severity === 'HIGH'
                        ? 'text-rose-300 bg-rose-950/40 border border-rose-800/60'
                        : 'text-amber-300 bg-amber-950/40 border border-amber-800/60'
                    }`}
                  >
                    {f.severity}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-2.5 bg-[#0F1E35] border-t border-white/10 space-y-1.5 text-[11px] text-slate-300">
                  <p className="leading-relaxed">{f.description}</p>
                  {f.evidence_id && (
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 pt-0.5">
                      <span>Ref:</span>
                      <code className="text-teal-300">{f.evidence_id}</code>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Authentication Summary Grid */}
        {authStatus && (
          <div className="p-2.5 rounded-lg bg-[#0A1628] border border-white/10 grid grid-cols-4 gap-1.5 text-center text-[10px]">
            <div>
              <div className="text-slate-500 text-[9px]">SPF</div>
              <div className={`font-semibold ${authStatus.spf === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {authStatus.spf}
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[9px]">DKIM</div>
              <div className={`font-semibold ${authStatus.dkim === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {authStatus.dkim}
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[9px]">DMARC</div>
              <div className={`font-semibold ${authStatus.dmarc === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {authStatus.dmarc}
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[9px]">ALIGN</div>
              <div className={`font-semibold ${authStatus.alignment === 'ALIGNED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {authStatus.alignment}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
