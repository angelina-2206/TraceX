import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, User, Globe, Mail } from 'lucide-react';
import { IdentityAnalysis, CaseDetail } from '../../types';

interface IdentityDeceptionViewProps {
  caseDetail: CaseDetail;
}

export const IdentityDeceptionView: React.FC<IdentityDeceptionViewProps> = ({ caseDetail }) => {
  const identity: IdentityAnalysis = caseDetail.identity_analysis;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Title */}
      <div className="tracex-card p-5 border-l-4 border-l-teal-500">
        <h2 className="text-base font-bold font-mono text-slate-100 flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-teal-400" />
          <span>IDENTITY DECEPTION ENGINE — ANALYSIS & IMPERSONATION</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Detects display-name brand spoofing, homoglyph character substitutions, typosquatting, and envelope Reply-To misalignments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deception Score Gauge Card */}
        <div className="tracex-card p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-slate-400 font-mono text-xs uppercase tracking-wider">
            IDENTITY DECEPTION SCORE
          </div>

          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="60" stroke="currentColor" strokeWidth="10" className="text-slate-800" fill="transparent" />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={376}
                strokeDashoffset={376 - (376 * identity.deception_score) / 100}
                className={identity.deception_score > 60 ? 'text-red-500' : identity.deception_score > 30 ? 'text-amber-500' : 'text-teal-400'}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold font-mono text-slate-100">{identity.deception_score.toFixed(0)}</span>
              <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-md font-mono text-xs font-bold uppercase ${
            identity.deception_score > 60 ? 'bg-red-950/60 text-red-300 border border-red-800' :
            identity.deception_score > 30 ? 'bg-amber-950/60 text-amber-300 border border-amber-800' :
            'bg-teal-500/10 text-teal-300 border border-teal-500/30'
          }`}>
            {identity.deception_score > 60 ? 'HIGH DECEPTION RISK' : identity.deception_score > 30 ? 'MODERATE RISK' : 'AUTHENTIC ALIGNED'}
          </span>
        </div>

        {/* Detailed Impersonation Breakdown (Right 2 columns) */}
        <div className="lg:col-span-2 tracex-card p-6 space-y-4 font-mono text-xs">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-2">
            EXTRACTED SENDER ENTITIES & MISMATCHES
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[11px]">VISIBLE DISPLAY NAME</div>
              <div className="font-semibold text-slate-100 text-sm mt-1">{identity.display_name}</div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[11px]">CLAIMED BRAND / ROLE</div>
              <div className="font-semibold text-teal-300 text-sm mt-1">{identity.claimed_brand || 'None Detected'}</div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[11px]">SENDER EMAIL DOMAIN</div>
              <div className="font-semibold text-slate-200 mt-1">{identity.sender_email}</div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[11px]">REPLY-TO DESTINATION</div>
              <div className={`font-semibold mt-1 ${identity.reply_to_mismatch ? 'text-red-400' : 'text-slate-200'}`}>
                {identity.reply_to || 'Aligned with From header'}
              </div>
            </div>
          </div>

          {/* Detected Deception Factors List */}
          <div className="mt-4">
            <div className="text-slate-400 text-[11px] mb-2 uppercase">DETECTED DECEPTION FACTORS ({identity.deception_factors.length})</div>
            <div className="space-y-2">
              {identity.deception_factors.map((factor, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-red-950/20 border border-red-900/50 text-red-200 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
