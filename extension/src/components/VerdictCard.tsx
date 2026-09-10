import React from 'react';
import { ArrowRight, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { AnalysisVerdict } from '../types/investigation';

interface VerdictCardProps {
  verdict: AnalysisVerdict;
  onOpenDashboard: () => void;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({ verdict, onOpenDashboard }) => {
  const isCritical = verdict.severity === 'CRITICAL' || verdict.severity === 'HIGH';
  const isWarning = verdict.severity === 'WARNING' || verdict.severity === 'MEDIUM';

  const badgeStyle = isCritical
    ? 'bg-rose-950/40 text-rose-300 border-rose-800/60'
    : isWarning
    ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60';

  return (
    <div className="p-3.5 rounded-md bg-[#13161A] border border-[#262C34] space-y-3">
      {/* Top Verdict Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : isWarning ? (
            <AlertCircle className="w-4 h-4 text-amber-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          )}
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${badgeStyle}`}>
            {verdict.severity} RISK
          </span>
        </div>

        <div className="text-right font-mono">
          <span className="text-base font-bold text-slate-100">{Math.round(verdict.risk_score)}</span>
          <span className="text-[11px] text-slate-500"> / 100</span>
        </div>
      </div>

      {/* Summary statement */}
      <p className="text-xs text-slate-300 font-sans leading-relaxed">
        {verdict.summary}
      </p>

      {/* Primary Key Reasons */}
      <div className="space-y-1.5 pt-1 border-t border-[#1C2128]">
        {verdict.reasons.slice(0, 3).map((reason, idx) => (
          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
            <span className="text-slate-600 mt-0.5">•</span>
            <span className="leading-snug text-slate-300">{reason}</span>
          </div>
        ))}
      </div>

      {/* Footer & Main Action CTA */}
      <div className="pt-2 border-t border-[#1C2128] flex items-center justify-between gap-2">
        <div className="text-[10px] text-slate-500 font-mono">
          {verdict.threat_indicators_count} indicators · {verdict.urls_count} links
        </div>

        <button
          onClick={onOpenDashboard}
          className="px-2.5 py-1 rounded bg-slate-200 text-slate-900 hover:bg-white transition-colors text-[11px] font-medium inline-flex items-center gap-1.5 shadow-sm"
        >
          <span>Open Investigation</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
