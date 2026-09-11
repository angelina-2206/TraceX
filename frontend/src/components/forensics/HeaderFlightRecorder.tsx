import React, { useState } from 'react';
import { Route, Server, AlertTriangle, ShieldCheck, ArrowRight, Globe, Database, FileText, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
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
        breadcrumbs={['ANVESHAK', caseDetail.case_id, 'Forensic Analysis', 'Header Flight Recorder']}
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
          <span className="text-xs text-[var(--text-muted)]">Sequential message relay pipeline &mdash; click any node to inspect telemetry</span>
        </div>

        {/* Delivery Path Sequence Track with Prominent Connector Arrows */}
        <div className="flex items-stretch gap-2 overflow-x-auto pb-4 pt-2">
          {hops.map((hop, idx) => {
            const isSelected = selectedHopIndex === idx;
            const isFirst = idx === 0;
            const isLast = idx === hops.length - 1;
            const roleLabel = isFirst ? 'Origin MTA' : isLast ? 'Destination Gateway' : `Relay Hop #${idx + 1}`;

            return (
              <React.Fragment key={hop.hop_index}>
                {/* Hop Node Card */}
                <button
                  onClick={() => setSelectedHopIndex(idx)}
                  className={`min-w-[270px] md:min-w-[300px] flex-1 p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--surface-2)] border-[var(--blue-primary)] shadow-md ring-2 ring-[var(--blue-primary)]/20'
                      : hop.is_suspicious
                      ? 'bg-[var(--surface)] border-amber-600/40 hover:border-amber-600 hover:shadow-sm'
                      : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-hi)] hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          hop.is_suspicious 
                            ? 'badge-medium' 
                            : 'bg-[var(--surface-muted)] text-[var(--text-primary)] border border-[var(--border)]'
                        }`}>
                          Hop 0{hop.hop_index}
                        </span>
                        <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">
                          {roleLabel}
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-1">
                        <Globe className="w-3 h-3 text-[var(--blue-primary)]" />
                        {hop.geo_location}
                      </span>
                    </div>

                    <div className="font-semibold text-[var(--text-primary)] text-sm truncate" title={hop.from_host}>
                      {hop.from_host}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5" title={`by ${hop.by_host}`}>
                      &rarr; by {hop.by_host}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[var(--blue-secondary)] text-[11px] font-semibold">
                        IP: {hop.ip}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] truncate">
                        ASN {hop.asn.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {hop.is_suspicious ? (
                    <div className="mt-3 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span className="truncate">{hop.flag_reason || 'Flagged Relay Anomaly'}</span>
                    </div>
                  ) : (
                    <div className="mt-3 text-[10px] text-[var(--text-muted)] flex items-center gap-1 pt-2 border-t border-[var(--border)]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Verified Relay Route</span>
                    </div>
                  )}
                </button>

                {/* Prominent High-Contrast Directional Arrow Connector */}
                {idx < hops.length - 1 && (
                  <div className="flex flex-col items-center justify-center shrink-0 px-2 select-none self-center py-2">
                    {/* Latency Tag */}
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[10px] font-mono text-[var(--text-muted)] mb-1.5 shadow-2xs font-semibold">
                      <Clock className="w-3 h-3 text-[var(--blue-primary)]" />
                      <span>+{hops[idx + 1]?.delay_seconds || 1}s</span>
                    </div>

                    {/* Prominent Arrow Circle */}
                    <div className="w-10 h-10 rounded-full bg-[var(--surface)] border-2 border-[var(--blue-primary)] flex items-center justify-center shadow-md text-[var(--blue-primary)] hover:scale-110 transition-transform">
                      <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </div>

                    <span className="text-[9px] font-bold text-[var(--text-muted)] mt-1.5 uppercase tracking-wider">
                      Next Hop
                    </span>
                  </div>
                )}
              </React.Fragment>
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
