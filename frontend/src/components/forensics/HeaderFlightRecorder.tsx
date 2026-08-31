import React, { useState } from 'react';
import { Route, Server, AlertTriangle, ShieldCheck, ArrowDown, Clock, Globe, Database } from 'lucide-react';
import { HeaderHop, CaseDetail } from '../../types';

interface HeaderFlightRecorderProps {
  caseDetail: CaseDetail;
}

export const HeaderFlightRecorder: React.FC<HeaderFlightRecorderProps> = ({ caseDetail }) => {
  const hops = caseDetail.header_hops;
  const [selectedHopIndex, setSelectedHopIndex] = useState<number>(0);

  const activeHop: HeaderHop = hops[selectedHopIndex] || hops[0];

  return (
    <div className="space-y-6 p-6">
      {/* Header Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center space-x-2">
          <Route className="w-5 h-5 text-cyan-400" />
          <span>HEADER FLIGHT RECORDER — HOPS & NETWORK PATH</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Visual hop-by-hop email delivery reconstruction from origin MTA down to recipient inbox server.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Flight Pathway (Left 2 columns) */}
        <div className="lg:col-span-2 forensic-card p-6 space-y-4">
          <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>RECONSTRUCTED FLIGHT HOPS ({hops.length})</span>
            <span className="text-[11px] text-cyan-400 font-normal">CLICK ANY HOP TO INSPECT EVIDENCE</span>
          </h3>

          <div className="space-y-4 relative">
            {hops.map((hop, idx) => {
              const isSelected = selectedHopIndex === idx;
              return (
                <div key={hop.hop_index} className="flex flex-col items-center">
                  <div
                    onClick={() => setSelectedHopIndex(idx)}
                    className={`w-full p-4 rounded-lg border font-mono text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-850 border-cyan-400 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                        : hop.is_suspicious
                        ? 'bg-slate-900 border-amber-800/80 hover:border-amber-600'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${
                          hop.is_suspicious ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                        }`}>
                          #{hop.hop_index}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{hop.from_host}</div>
                          <div className="text-[11px] text-slate-400">Routed via <code className="text-cyan-400">{hop.by_host}</code></div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-slate-300">{hop.ip}</div>
                        <div className="text-[10px] text-slate-400">{hop.geo_location}</div>
                      </div>
                    </div>

                    {hop.is_suspicious && (
                      <div className="mt-2.5 pt-2 border-t border-amber-900/60 flex items-center space-x-2 text-[11px] text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>FLAGGED: {hop.flag_reason}</span>
                      </div>
                    )}
                  </div>

                  {idx < hops.length - 1 && (
                    <div className="my-2 flex flex-col items-center text-slate-600">
                      <div className="h-4 w-0.5 bg-slate-800"></div>
                      <ArrowDown className="w-4 h-4 text-cyan-400/80 my-0.5" />
                      <div className="h-4 w-0.5 bg-slate-800"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Evidence Inspector (Right Column) */}
        <div className="forensic-card p-6 space-y-4 font-mono text-xs">
          <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center space-x-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>HOP EVIDENCE INSPECTOR (HOP #{activeHop.hop_index})</span>
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400 text-[11px]">OBSERVED RELAY IP:</span>
              <p className="text-slate-100 font-bold text-sm mt-0.5">{activeHop.ip}</p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">AUTONOMOUS SYSTEM (ASN):</span>
              <p className="text-cyan-300 font-semibold mt-0.5">{activeHop.asn}</p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">INTERNET SERVICE PROVIDER:</span>
              <p className="text-slate-200 mt-0.5">{activeHop.isp}</p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">GEOGRAPHIC LOCATION CLUE:</span>
              <p className="text-slate-200 mt-0.5 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeHop.geo_location}</span>
              </p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">DELAY SECONDS:</span>
              <p className="text-slate-200 mt-0.5 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>+{activeHop.delay_seconds} seconds</span>
              </p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">RAW RECEIVED HEADER SNIPPET:</span>
              <div className="mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap select-all">
                {activeHop.raw_header}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
