import React, { useState } from 'react';
import { Route, Server, AlertTriangle, ShieldCheck, ArrowRight, Clock, Globe, Database, Plane, CheckCircle2 } from 'lucide-react';
import { HeaderHop, CaseDetail } from '../../types';

interface HeaderFlightRecorderProps {
  caseDetail: CaseDetail;
}

export const HeaderFlightRecorder: React.FC<HeaderFlightRecorderProps> = ({ caseDetail }) => {
  const hops = caseDetail.header_hops;
  const [selectedHopIndex, setSelectedHopIndex] = useState<number>(0);

  const activeHop: HeaderHop = hops[selectedHopIndex] || hops[0];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ── Title Header ── */}
      <div className="tracex-card p-5 border-l-4 border-l-teal-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold font-mono text-slate-100 flex items-center space-x-2">
            <Route className="w-5 h-5 text-teal-400" />
            <span>HEADER FLIGHT RECORDER — HOPS & NETWORK PATH</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Visual hop-by-hop email delivery flight path from origin MTA down to recipient inbox gateway.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Plane className="w-3.5 h-3.5 text-teal-400" />
            <span>{hops.length} TOTAL FLIGHT HOPS</span>
          </div>
        </div>
      </div>

      {/* ── VISUAL FLIGHT PATHWAY CANVAS ── */}
      <div className="tracex-card p-6 space-y-4 font-mono">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between border-b border-white/5 pb-3">
          <span className="flex items-center gap-2">
            <Server className="w-4 h-4 text-teal-400" />
            FLIGHT PATH ROUTE MAP
          </span>
          <span className="text-[11px] text-teal-400 font-normal">CLICK ANY HOP NODE TO INSPECT DETAILS</span>
        </h3>

        {/* Horizontal Flight Route Diagram */}
        <div className="flex items-center overflow-x-auto py-4 px-2 gap-3">
          {hops.map((hop, idx) => {
            const isSelected = selectedHopIndex === idx;
            return (
              <React.Fragment key={hop.hop_index}>
                <button
                  onClick={() => setSelectedHopIndex(idx)}
                  className={`flex flex-col p-4 rounded-xl border text-left min-w-[210px] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-teal-400 shadow-lg ring-2 ring-teal-500/30 scale-105'
                      : hop.is_suspicious
                      ? 'bg-slate-950 border-amber-800/80 hover:border-amber-600'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                      hop.is_suspicious ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                    }`}>
                      #{hop.hop_index}
                    </span>
                    <span className="text-[10px] text-slate-500">{hop.geo_location}</span>
                  </div>

                  <div className="font-bold text-slate-100 text-xs truncate max-w-[180px]">{hop.from_host}</div>
                  <div className="text-[10px] text-teal-300 mt-0.5 truncate max-w-[180px]">IP: {hop.ip}</div>
                  <div className="text-[9px] text-slate-500 truncate mt-1">ASN: {hop.asn}</div>

                  {hop.is_suspicious && (
                    <span className="mt-2 text-[9px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 uppercase">
                      FLAGGED RELAY
                    </span>
                  )}
                </button>

                {idx < hops.length - 1 && (
                  <div className="flex flex-col items-center shrink-0 px-1 text-slate-500">
                    <span className="text-[9px] text-teal-400 font-bold mb-1">+{hop.delay_seconds}s</span>
                    <ArrowRight className="w-5 h-5 text-teal-400" />
                    <span className="text-[8px] text-slate-600 uppercase mt-0.5">TRANSIT</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Detailed Hop Inspector Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 tracex-card p-6 space-y-4 font-mono text-xs">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center justify-between">
            <span>SELECTED HOP DETAILED SPECS — HOP #{activeHop.hop_index}</span>
            <span className="text-teal-400 font-bold">{activeHop.is_suspicious ? 'SUSPICIOUS RELAY' : 'NORMAL ROUTE'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">OBSERVED SENDER HOST</span>
              <p className="text-slate-100 font-bold text-xs mt-0.5">{activeHop.from_host}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">RECEIVING GATEWAY HOST</span>
              <p className="text-slate-100 font-bold text-xs mt-0.5">{activeHop.by_host}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">IP ADDRESS & ASN</span>
              <p className="text-teal-300 font-bold text-xs mt-0.5">{activeHop.ip}</p>
              <p className="text-slate-400 text-[10px]">{activeHop.asn} ({activeHop.isp})</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">GEOGRAPHIC LOCATION & DELAY</span>
              <p className="text-slate-100 font-bold text-xs mt-0.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                <span>{activeHop.geo_location}</span>
              </p>
              <p className="text-slate-400 text-[10px] mt-0.5">Delay Delta: +{activeHop.delay_seconds} seconds</p>
            </div>
          </div>

          {activeHop.is_suspicious && (
            <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-800 text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">SUSPICIOUS RELAY FLAG:</span>
                <p className="text-slate-300 mt-0.5 font-sans">{activeHop.flag_reason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Raw Header Snippet Box */}
        <div className="tracex-card p-6 space-y-3 font-mono text-xs">
          <h3 className="text-xs font-semibold text-teal-400 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-400" />
            <span>RAW MIME RECEIVED HEADER</span>
          </h3>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap select-all leading-relaxed h-[220px]">
            {activeHop.raw_header}
          </div>
        </div>
      </div>
    </div>
  );
};
