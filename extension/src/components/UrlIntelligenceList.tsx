import React from 'react';
import { ExternalLink, Check, AlertTriangle } from 'lucide-react';
import { ExtractedUrlInfo } from '../types/investigation';

interface UrlIntelligenceListProps {
  urls: ExtractedUrlInfo[];
  onOpenDashboard: () => void;
}

export const UrlIntelligenceList: React.FC<UrlIntelligenceListProps> = ({ urls, onOpenDashboard }) => {
  if (!urls || urls.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-0.5">
        <span>Email Links & Safety ({urls.length})</span>
        <button
          onClick={onOpenDashboard}
          className="text-[9px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
        >
          <span>Open Full URL Analysis</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>

      <div className="space-y-1">
        {urls.slice(0, 3).map((u, idx) => {
          const isSuspicious = u.reputation_score > 40 || u.has_homoglyph;

          return (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-[#0A1628] border border-white/10 flex items-center justify-between text-xs gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                {isSuspicious ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="font-medium text-slate-200 truncate">{u.domain}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{u.redirect_count} redirect hop(s)</span>
                    {u.has_homoglyph && (
                      <span className="text-rose-400 font-medium font-mono text-[9px]">Lookalike Domain</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                    isSuspicious
                      ? 'bg-rose-950/40 text-rose-300 border-rose-900/50'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50'
                  }`}
                >
                  {isSuspicious ? `Risk Score: ${Math.round(u.reputation_score)}` : 'Safe'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
