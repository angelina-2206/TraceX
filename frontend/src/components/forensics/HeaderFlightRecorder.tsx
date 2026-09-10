import React, { useState } from 'react';
import { Route, Server, AlertTriangle, ShieldCheck, ArrowRight, Globe, Database, FileText, CheckCircle2 } from 'lucide-react';
import { HeaderHop, CaseDetail } from '../../types';
import { PageHeader } from '../common/PageHeader';

interface HeaderFlightRecorderProps {
  caseDetail: CaseDetail;
}

export const HeaderFlightRecorder: React.FC<HeaderFlightRecorderProps> = ({ caseDetail }) => {
  const hops = caseDetail.header_hops;
  const [selectedHopIndex, setSelectedHopIndex] = useState<number>(0);

  const activeHop: HeaderHop = hops[selectedHopIndex] || hops[0];
  const flaggedHopsCount = hops.filter(h => h.is_suspicious).length;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ── Page Header ── */}
      <PageHeader
        breadcrumbs={['TRACE-X', caseDetail.case_id, 'Forensic Analysis', 'Header Flight Recorder']}
        title="Header Flight Recorder"
        description="Reconstruct the message delivery path and inspect network evidence associated with each relay from originating MTA to recipient inbox gateway."
        metadata={
          <>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              {hops.length} delivery hops
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              {hops.length * 3} forensic telemetry points
            </span>
            {flaggedHopsCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full badge-high">
                {flaggedHopsCount} flagged relay
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full badge-safe">
                All relays verified
              </span>
            )}
          </>
        }
      />

      {/* ── Visual Delivery Pathway ── */}
      <div className="tracex-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Server className="w-4 h-4 text-[var(--blue-primary)]" />
            <span>Delivery Path Sequence</span>
          </h3>
          <span className="text-xs text-[var(--text-muted)]">Select any relay node to view detailed telemetry</span>
        </div>

        {/* Delivery Path Sequence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
          {hops.map((hop, idx) => {
            const isSelected = selectedHopIndex === idx;
            return (
              <button
                key={hop.hop_index}
                onClick={() => setSelectedHopIndex(idx)}
                className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--surface-2)] border-[var(--blue-primary)] shadow-sm'
                    : hop.is_suspicious
                    ? 'bg-[var(--surface)] border-amber-600/40 hover:border-amber-600'
                    : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-hi)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    hop.is_suspicious ? 'badge-medium' : 'bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border)]'
                  }`}>
                    Hop 0{hop.hop_index}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{hop.geo_location}</span>
                </div>

                <div className="font-semibold text-[var(--text-primary)] text-sm truncate">{hop.from_host}</div>
                <div className="text-xs text-[var(--blue-secondary)] mt-0.5 font-mono">IP: {hop.ip}</div>
                <div className="text-xs text-[var(--text-muted)] truncate mt-1">ASN: {hop.asn}</div>

                {hop.is_suspicious && (
                  <div className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded">
                    Flagged: Origin relay outside claimed infrastructure
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2-Column Inspector: Hop Specs & Raw Header ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hop Specs */}
        <div className="lg:col-span-2 tracex-card p-6 space-y-4">
          <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Route className="w-4 h-4 text-[var(--blue-primary)]" />
              <span>Selected Hop Telemetry — Hop 0{activeHop.hop_index}</span>
            </h3>
            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${activeHop.is_suspicious ? 'badge-high' : 'badge-safe'}`}>
              {activeHop.is_suspicious ? 'Flagged Relay' : 'Verified Route'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)] text-xs font-medium uppercase">Observed Relay IP</span>
              <p className="text-[var(--text-primary)] font-mono font-bold text-sm mt-0.5">{activeHop.ip}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)] text-xs font-medium uppercase">Autonomous System (ASN)</span>
              <p className="text-[var(--text-primary)] font-bold text-xs mt-0.5">{activeHop.asn}</p>
              <p className="text-[var(--text-muted)] text-xs">{activeHop.isp}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)] text-xs font-medium uppercase">Infrastructure Provider</span>
              <p className="text-[var(--text-primary)] font-semibold text-xs mt-0.5">{activeHop.isp}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)] text-xs font-medium uppercase">Geolocation Clue</span>
              <p className="text-[var(--text-primary)] font-semibold text-xs mt-0.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[var(--blue-primary)]" />
                <span>{activeHop.geo_location}</span>
              </p>
              <p className="text-[var(--text-muted)] text-xs mt-0.5">Delay Delta: +{activeHop.delay_seconds} seconds</p>
            </div>
          </div>

          {activeHop.is_suspicious && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-xs uppercase tracking-wide">Relay Flag Analysis:</span>
                <p className="text-xs text-[var(--text-primary)] mt-0.5">{activeHop.flag_reason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Raw Header Snippet Box */}
        <div className="tracex-card p-6 space-y-3">
          <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--blue-primary)]" />
              <span>Raw Received Header</span>
            </h3>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-secondary)] code-mono overflow-x-auto whitespace-pre-wrap select-all leading-relaxed h-[220px]">
            {activeHop.raw_header}
          </div>
        </div>
      </div>

      {/* ── Evidence Correlation Card ── */}
      <div className="tracex-card p-5 border-t-2 border-t-[var(--blue-primary)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--blue-primary)]" />
          <span>Forensic Evidence Record</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--border)]">
            <span className="text-[var(--text-muted)] text-[11px]">Evidence ID</span>
            <div className="font-mono font-semibold text-[var(--text-primary)] mt-0.5">EV-0192</div>
          </div>
          <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--border)]">
            <span className="text-[var(--text-muted)] text-[11px]">Source</span>
            <div className="font-semibold text-[var(--text-primary)] mt-0.5">Received Header</div>
          </div>
          <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--border)]">
            <span className="text-[var(--text-muted)] text-[11px]">Confidence</span>
            <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">High (94%)</div>
          </div>
          <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--border)]">
            <span className="text-[var(--text-muted)] text-[11px]">Severity</span>
            <div className="font-semibold text-rose-600 dark:text-rose-400 mt-0.5">High Risk</div>
          </div>
        </div>
      </div>
    </div>
  );
};
