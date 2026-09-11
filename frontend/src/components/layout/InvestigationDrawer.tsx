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

  const severityBadgeClass =
    entity.severity === 'CRITICAL' ? 'badge-critical' :
    entity.severity === 'HIGH'     ? 'badge-high' :
    entity.severity === 'MEDIUM'   ? 'badge-medium' : 'badge-safe';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in font-sans">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Container */}
      <div className="relative w-full max-w-md bg-[var(--surface)] text-[var(--text-primary)] border-l border-[var(--border)] h-full flex flex-col justify-between shadow-2xl z-10">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-start justify-between bg-[var(--surface-2)]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--blue-primary)] uppercase">
                {entity.type} ENTITY
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${severityBadgeClass}`}>
                {entity.severity} RISK
              </span>
            </div>
            <h2 className="text-base font-bold text-[var(--text-primary)] break-all">
              {entity.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* Primary Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {entity.firstObserved && (
              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">First Observed</div>
                <div className="text-[var(--text-primary)] font-medium text-[11px] code-mono">{entity.firstObserved}</div>
              </div>
            )}
            {entity.asn && (
              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">ASN / Provider</div>
                <div className="text-[var(--blue-primary)] font-semibold text-[11px] truncate code-mono">{entity.asn}</div>
              </div>
            )}
            {entity.country && (
              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Location Clue</div>
                <div className="text-[var(--text-primary)] font-medium text-[11px]">{entity.country}</div>
              </div>
            )}
            <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Attribution Status</div>
              <div className="text-amber-600 dark:text-amber-400 font-semibold text-[11px]">Unconfirmed</div>
            </div>
          </div>

          {/* Risk Factors */}
          {entity.riskFactors && entity.riskFactors.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                IDENTIFIED ANOMALIES & SIGNALS
              </div>
              <div className="space-y-1.5">
                {entity.riskFactors.map((factor, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Cases */}
          {entity.relatedCases && entity.relatedCases.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-[var(--blue-primary)]" />
                CORRELATED HISTORICAL CASES
              </div>
              <div className="flex flex-wrap gap-2">
                {entity.relatedCases.map((caseId) => (
                  <span key={caseId} className="px-2.5 py-1 rounded font-semibold text-xs bg-[var(--surface-2)] border border-[var(--border)] text-[var(--blue-primary)] code-mono">
                    {caseId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Associated Evidence IDs */}
          {entity.evidenceIds && entity.evidenceIds.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[var(--blue-primary)]" />
                CHAIN OF CUSTODY EVIDENCE
              </div>
              <div className="flex flex-wrap gap-2">
                {entity.evidenceIds.map((evId) => (
                  <span key={evId} className="px-2.5 py-1 rounded text-xs bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] code-mono">
                    {evId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[var(--border)] bg-[var(--surface-2)] space-y-2">
          <button
            onClick={() => {
              onNavigateToModule?.('attack_graph');
              onClose();
            }}
            className="w-full py-2.5 text-xs font-semibold btn-primary flex items-center justify-center gap-2"
          >
            <Network className="w-4 h-4" />
            <span>Correlate in Attack Graph</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-medium btn-secondary justify-center"
          >
            Dismiss Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
