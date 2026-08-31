import React from 'react';
import { X, ShieldAlert, Globe, Server, Hash, ExternalLink, Network, FileText, Lock, AlertTriangle, ArrowRight } from 'lucide-react';

export interface EntityDetail {
  id: string;
  type: 'DOMAIN' | 'IP' | 'EMAIL' | 'CAMPAIGN' | 'HASH' | 'BANK_ENTITY' | 'URL';
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  firstObserved?: string;
  asn?: string;
  provider?: string;
  country?: string;
  relatedCases?: string[];
  evidenceIds?: string[];
  riskFactors?: string[];
  details?: Record<string, any>;
}

interface InvestigationDrawerProps {
  entity: EntityDetail | null;
  onClose: () => void;
  onNavigateToModule?: (tab: string) => void;
}

export const InvestigationDrawer: React.FC<InvestigationDrawerProps> = ({
  entity,
  onClose,
  onNavigateToModule
}) => {
  if (!entity) return null;

  const severityColor =
    entity.severity === 'CRITICAL' ? '#ef4444' :
    entity.severity === 'HIGH' ? '#f59e0b' :
    entity.severity === 'MEDIUM' ? '#06b6d4' : '#10b981';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Container */}
      <div className="relative w-full max-w-md bg-[#0e1422] border-l border-white/10 h-full flex flex-col justify-between shadow-2xl z-10 slide-over-enter">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between bg-black/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
                {entity.type} ENTITY
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase"
                    style={{
                      background: `${severityColor}18`,
                      color: severityColor,
                      border: `1px solid ${severityColor}40`
                    }}>
                {entity.severity} RISK
              </span>
            </div>
            <h2 className="text-base font-bold font-mono text-slate-100 break-all">
              {entity.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* Primary Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {entity.firstObserved && (
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] font-mono text-slate-500">FIRST OBSERVED</div>
                <div className="font-mono text-slate-200 font-medium text-[11px]">{entity.firstObserved}</div>
              </div>
            )}
            {entity.asn && (
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] font-mono text-slate-500">ASN / PROVIDER</div>
                <div className="font-mono text-cyan-400 font-medium text-[11px] truncate">{entity.asn}</div>
              </div>
            )}
            {entity.country && (
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] font-mono text-slate-500">LOCATION CLUE</div>
                <div className="font-mono text-slate-200 font-medium text-[11px]">{entity.country}</div>
              </div>
            )}
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div className="text-[10px] font-mono text-slate-500">ATTRIBUTION</div>
              <div className="font-mono text-amber-400 font-medium text-[11px]">UNCONFIRMED</div>
            </div>
          </div>

          {/* Risk Factors */}
          {entity.riskFactors && entity.riskFactors.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                IDENTIFIED ANOMALIES & SIGNALS
              </div>
              <div className="space-y-1.5">
                {entity.riskFactors.map((factor, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-black/30 border border-white/5 text-xs text-slate-300 font-mono flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Cases */}
          {entity.relatedCases && entity.relatedCases.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-cyan-400" />
                CORRELATED HISTORICAL CASES
              </div>
              <div className="flex flex-wrap gap-2">
                {entity.relatedCases.map((caseId) => (
                  <span key={caseId} className="px-2.5 py-1 rounded font-mono text-xs bg-cyan-950/30 border border-cyan-500/30 text-cyan-300">
                    {caseId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Associated Evidence IDs */}
          {entity.evidenceIds && entity.evidenceIds.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                CHAIN OF CUSTODY EVIDENCE
              </div>
              <div className="flex flex-wrap gap-2">
                {entity.evidenceIds.map((evId) => (
                  <span key={evId} className="px-2.5 py-1 rounded font-mono text-xs bg-purple-950/30 border border-purple-500/30 text-purple-300">
                    {evId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/10 bg-black/40 space-y-2">
          <button
            onClick={() => {
              onNavigateToModule?.('attack_graph');
              onClose();
            }}
            className="w-full py-2.5 cut-corners text-xs font-mono font-bold btn-primary flex items-center justify-center gap-2"
          >
            <Network className="w-4 h-4" />
            EXPAND IN ATTACK MAP
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 cut-corners text-xs font-mono font-medium btn-secondary"
          >
            DISMISS DRAWER
          </button>
        </div>
      </div>
    </div>
  );
};
