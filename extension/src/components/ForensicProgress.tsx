import React from 'react';
import { Loader2, Check } from 'lucide-react';

interface ForensicProgressProps {
  currentStep: number;
}

const STAGES = [
  'Parsing message headers and MIME structure',
  'Evaluating sender identity & routing path',
  'Verifying SPF, DKIM, and DMARC alignment',
  'Querying threat intelligence database',
  'Synthesizing composite risk assessment',
];

export const ForensicProgress: React.FC<ForensicProgressProps> = ({ currentStep }) => {
  return (
    <div className="p-3.5 rounded-lg bg-[#0A1628] border border-white/10 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-200 border-b border-white/10 pb-2">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
          <span>Analyzing Artifact</span>
        </span>
        <span className="text-[10px] text-slate-500 font-mono">Step {Math.min(currentStep, 5)} / 5</span>
      </div>

      <div className="space-y-1.5 pt-0.5">
        {STAGES.map((stage, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;

          return (
            <div
              key={idx}
              className={`flex items-center gap-2 text-xs transition-opacity ${
                isDone
                  ? 'text-slate-400'
                  : isCurrent
                  ? 'text-slate-100 font-medium'
                  : 'text-slate-600 opacity-50'
              }`}
            >
              {isDone ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-3.5 h-3.5 text-slate-300 animate-spin shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
              )}
              <span className="truncate">{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
