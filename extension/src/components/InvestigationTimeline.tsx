import React from 'react';
import { Check } from 'lucide-react';

export const InvestigationTimeline: React.FC = () => {
  const steps = [
    { label: 'Artifact Captured', time: '0ms' },
    { label: 'Headers Normalized', time: '+8ms' },
    { label: 'Reputation Verification', time: '+112ms' },
    { label: 'Forensic Hash Computed', time: 'SHA-256' },
  ];

  return (
    <div className="p-2.5 rounded bg-[#13161A] border border-[#262C34] space-y-1.5 text-xs">
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase border-b border-[#1C2128] pb-1">
        <span>Verification Telemetry</span>
        <span className="font-mono text-[9px] text-slate-500">Integrity Verified</span>
      </div>

      <div className="space-y-1 pt-0.5">
        {steps.map((s, idx) => (
          <div key={idx} className="flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>{s.label}</span>
            </div>
            <span className="font-mono text-[9px] text-slate-500">{s.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
