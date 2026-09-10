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
    <div className="p-3.5 rounded-lg bg-[#0A1628] border border-white/10 space-y-3">
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
          <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold border ${badgeStyle}`}>
            {verdict.severity} RISK
          </span>
        </div>

        <div className="text-right">
          <span className="text-base font-bold text-slate-100">{Math.round(verdict.risk_score)}</span>
          <span className="text-[11px] text-slate-400"> / 100</span>
        </div>
      </div>

      {/* Summary statement */}
      <p className="text-xs text-slate-300 font-sans leading-relaxed">
        {verdict.summary}
      </p>

      {/* Primary Key Reasons */}
      <div className="space-y-1.5 pt-2 border-t border-white/10">
        {verdict.reasons.slice(0, 3).map((reason, idx) => (
          <div key={idx} className="flex items-start gap-1.5 text-[11px]">
            <span className="text-teal-400 mt-0.5">•</span>
            <span className="leading-snug text-slate-300">{reason}</span>
          </div>
        ))}
      </div>

      {/* Footer & Main Action CTA */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
        <div className="text-[10px] text-slate-400 font-sans">
          {verdict.threat_indicators_count} indicators · {verdict.urls_count} links
        </div>

        <button
          onClick={onOpenDashboard}
          className="px-3 py-1.5 rounded bg-gradient-to-r from-[#0E7063] to-[#0B5C51] hover:from-[#14B8A6] hover:to-[#0E7063] text-white text-[11px] font-semibold inline-flex items-center gap-1.5 border border-[#14B8A6]/30 transition-all shadow-sm"
        >
          <span>Open Investigation</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
