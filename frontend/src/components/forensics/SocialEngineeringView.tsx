import React from 'react';
import { Zap, AlertTriangle, MessageSquare, AlertCircle } from 'lucide-react';
import { SocialEngSignal, CaseDetail } from '../../types';

interface SocialEngineeringViewProps {
  caseDetail: CaseDetail;
}

export const SocialEngineeringView: React.FC<SocialEngineeringViewProps> = ({ caseDetail }) => {
  const signals: SocialEngSignal[] = caseDetail.social_eng_signals;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Title */}
      <div className="tracex-card p-5 border-l-4 border-l-teal-500">
        <h2 className="text-base font-bold font-mono text-slate-100 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-teal-400" />
          <span>SOCIAL ENGINEERING & NLP ANALYSIS ENGINE</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Detects coercion techniques including urgency, executive authority pressure, account suspension threats, and payment redirection.
        </p>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {signals.map((s, idx) => (
          <div key={idx} className="tracex-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-teal-400">SIGNAL #{idx + 1}</span>
                <span className="text-slate-100 font-semibold">{s.category}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                s.severity === 'HIGH' ? 'bg-red-950/60 text-red-300 border border-red-800' : 'bg-amber-950/60 text-amber-300 border border-amber-800'
              }`}>
                {s.severity} SEVERITY ({s.score.toFixed(0)}/100)
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-200">
              <span className="text-slate-500 font-bold mr-2">[LINE {s.line_number || 1}]</span>
              <span>"{s.evidence_quote}"</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
