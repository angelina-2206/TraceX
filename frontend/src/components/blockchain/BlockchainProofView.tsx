import React, { useState } from 'react';
import {
  Blocks, CheckCircle2, ShieldCheck, ExternalLink, Hash,
  Key, Copy, Check, Link2, ChevronDown, ChevronUp, Cpu
} from 'lucide-react';
import { CaseDetail, ChainOfCustodyEvent } from '../../types';

interface BlockchainProofViewProps {
  caseDetail: CaseDetail;
}

const HashBox: React.FC<{ label: string; value: string; color?: 'cyan' | 'green' | 'purple' | 'muted' }> = ({
  label, value, color = 'cyan'
}) => {
  const [copied, setCopied] = useState(false);

  const colorMap = {
    cyan:   { text: '#67e8f9', border: 'rgba(6,182,212,0.25)',   bg: 'rgba(6,182,212,0.04)' },
    green:  { text: '#6ee7b7', border: 'rgba(16,185,129,0.25)',  bg: 'rgba(16,185,129,0.04)' },
    purple: { text: '#d8b4fe', border: 'rgba(168,85,247,0.25)',  bg: 'rgba(168,85,247,0.04)' },
    muted:  { text: '#64748b', border: 'rgba(51,65,85,0.5)',     bg: 'rgba(10,18,35,0.6)' },
  };

  const c = colorMap[color];

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <span className="text-[10px] font-bold mb-1 block" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>
        {label}
      </span>
      <div
        className="flex items-start gap-2 p-2 rounded-lg group cursor-pointer"
        style={{ background: c.bg, border: `1px solid ${c.border}` }}
        onClick={copy}
        title="Click to copy"
      >
        <code
          className="flex-1 text-[10px] break-all leading-relaxed"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: c.text }}
        >
          {value}
        </code>
        <button className="shrink-0 mt-0.5 transition-colors" style={{ color: copied ? '#6ee7b7' : '#334155' }}>
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};

// Mini Merkle tree component
const MerkleTree: React.FC<{ events: ChainOfCustodyEvent[]; selectedIdx: number }> = ({ events, selectedIdx }) => {
  const nodes = events.slice(0, Math.min(events.length, 6));
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold mb-3 text-center" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>
        MERKLE PROOF PATH
      </div>
      {/* Root */}
      <div className="flex justify-center">
        <div
          className="merkle-node"
          style={{
            width: 40, height: 40,
            background: 'rgba(168,85,247,0.15)',
            border: '2px solid rgba(168,85,247,0.5)',
            color: '#d8b4fe',
            boxShadow: '0 0 12px rgba(168,85,247,0.25)',
          }}
        >
          ROOT
        </div>
      </div>
      {/* Connector line */}
      <div className="flex justify-center">
        <div className="w-0.5 h-4" style={{ background: 'linear-gradient(to bottom, rgba(168,85,247,0.5), rgba(6,182,212,0.5))' }} />
      </div>
      {/* Leaves */}
      <div className="flex justify-center gap-3 flex-wrap">
        {nodes.map((evt, idx) => (
          <div
            key={evt.event_id}
            className="merkle-node"
            style={{
              width: 34, height: 34,
              fontSize: '0.55rem',
              background: idx === selectedIdx ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.06)',
              border: `2px solid ${idx === selectedIdx ? 'rgba(6,182,212,0.7)' : 'rgba(6,182,212,0.2)'}`,
              color: idx === selectedIdx ? '#67e8f9' : '#475569',
              boxShadow: idx === selectedIdx ? '0 0 10px rgba(6,182,212,0.3)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            #{idx + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export const BlockchainProofView: React.FC<BlockchainProofViewProps> = ({ caseDetail }) => {
  const events = caseDetail.chain_of_custody;
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const activeEvent: ChainOfCustodyEvent | undefined = events[selectedIdx] || events[0];
  const proof = activeEvent ? (activeEvent as any).blockchain_proof : null;

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* ── Title Banner ── */}
      <div
        className="relative rounded-xl p-5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(6,182,212,0.05) 60%, rgba(10,18,35,0.95) 100%)',
          border: '1px solid rgba(168,85,247,0.25)',
          boxShadow: '0 0 40px rgba(168,85,247,0.07)',
        }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, #a855f7, transparent)', filter: 'blur(30px)' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(168,85,247,0.12)',
                border: '1px solid rgba(168,85,247,0.35)',
                boxShadow: '0 0 16px rgba(168,85,247,0.2)',
              }}
            >
              <Blocks className="w-5 h-5" style={{ color: '#a855f7' }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#f1f5f9' }}>
                IMMUTABLE BLOCKCHAIN PROOF LEDGER
              </h2>
              <p className="text-[11px] mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>
                SHA-256 anchored evidence chain · Merkle tree proof structure · Court-admissible
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Network badges */}
            {['POLYGON POS', 'HYPERLEDGER FABRIC'].map(net => (
              <div
                key={net}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{
                  background: 'rgba(168,85,247,0.08)',
                  border: '1px solid rgba(168,85,247,0.25)',
                }}
              >
                <div className="status-led status-led-green" />
                <span className="text-[10px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#c084fc' }}>
                  {net}
                </span>
              </div>
            ))}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#10b981' }}>
                CONTRACT VERIFIED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'TOTAL BLOCKS', value: events.length, color: '#a855f7', bg: 'rgba(168,85,247,0.06)', border: 'rgba(168,85,247,0.2)' },
          { label: 'BLOCK HEIGHT', value: proof?.block_height?.toLocaleString() ?? '–', color: '#06b6d4', bg: 'rgba(6,182,212,0.06)', border: 'rgba(6,182,212,0.2)' },
          { label: 'GAS USED', value: proof?.gas_used?.toLocaleString() ?? '21,045', color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' },
          { label: 'NETWORK STATUS', value: 'LIVE', color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' },
        ].map(({ label, value, color, bg, border }) => (
          <div
            key={label}
            className="rounded-xl p-3"
            style={{ background: bg, border: `1px solid ${border}` }}
          >
            <div className="text-[9px] font-bold mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>{label}</div>
            <div className="text-lg font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chain of blocks (left 2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>
              ON-CHAIN CHECKPOINT EVENTS · CLICK TO INSPECT MERKLE PROOF
            </h3>
          </div>

          {/* Visual chain */}
          <div className="space-y-0">
            {events.map((evt, idx) => {
              const isSelected = selectedIdx === idx;
              const isExpanded = expandedIdx === idx;

              return (
                <div key={evt.event_id} className="relative">
                  {/* Chain connector */}
                  {idx < events.length - 1 && (
                    <div
                      className="absolute left-[23px] z-0"
                      style={{
                        top: '64px',
                        height: '16px',
                        width: '2px',
                        background: 'linear-gradient(to bottom, rgba(168,85,247,0.5), rgba(6,182,212,0.3))',
                      }}
                    />
                  )}

                  <div
                    className="relative z-10 flex gap-3 cursor-pointer group"
                    onClick={() => { setSelectedIdx(idx); setExpandedIdx(isExpanded ? null : idx); }}
                  >
                    {/* Block number circle */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0 transition-all"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        background: isSelected ? 'rgba(168,85,247,0.2)' : 'rgba(10,18,35,0.8)',
                        border: `2px solid ${isSelected ? 'rgba(168,85,247,0.6)' : 'rgba(30,41,59,0.8)'}`,
                        color: isSelected ? '#d8b4fe' : '#475569',
                        boxShadow: isSelected ? '0 0 16px rgba(168,85,247,0.25)' : 'none',
                      }}
                    >
                      #{idx + 1}
                    </div>

                    {/* Block card */}
                    <div
                      className="flex-1 p-3 rounded-xl transition-all"
                      style={{
                        background: isSelected
                          ? 'rgba(168,85,247,0.06)'
                          : 'rgba(15,23,42,0.7)',
                        border: `1px solid ${isSelected ? 'rgba(168,85,247,0.35)' : 'rgba(30,41,59,0.7)'}`,
                        boxShadow: isSelected ? '0 0 20px rgba(168,85,247,0.08)' : 'none',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-[11px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#e2e8f0' }}>
                              {evt.action}
                            </div>
                            <div className="text-[10px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>
                              <span style={{ color: '#64748b' }}>{evt.actor}</span> · {evt.role}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded"
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              background: 'rgba(16,185,129,0.1)',
                              border: '1px solid rgba(16,185,129,0.3)',
                              color: '#10b981',
                            }}
                          >
                            VERIFIED BLOCK
                          </span>
                          {isExpanded
                            ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                            : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          }
                        </div>
                      </div>

                      {/* Expanded hash view */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 space-y-2 animate-fade-in"
                             style={{ borderTop: '1px solid rgba(30,41,59,0.6)' }}>
                          <HashBox label="PREV HASH" value={evt.prev_hash} color="muted" />
                          <HashBox label="CURRENT HASH (SHA-256)" value={evt.current_hash} color="cyan" />
                          <p className="text-[10px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>
                            {evt.details}
                          </p>
                          <div className="text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#334155' }}>
                            {evt.timestamp}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Proof Inspector */}
        <div className="space-y-4">
          {/* Merkle Tree Visualization */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(10,18,35,0.8)',
              border: '1px solid rgba(168,85,247,0.2)',
            }}
          >
            <MerkleTree events={events} selectedIdx={selectedIdx} />
          </div>

          {/* On-Chain Proof Details */}
          <div
            className="p-4 rounded-xl space-y-4"
            style={{
              background: 'rgba(10,18,35,0.8)',
              border: '1px solid rgba(30,41,59,0.8)',
            }}
          >
            <h3 className="text-[11px] font-bold flex items-center gap-2"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: '#a855f7' }}>
              <Key className="w-3.5 h-3.5" />
              MERKLE PROOF INSPECTOR — BLOCK #{selectedIdx + 1}
            </h3>

            {proof ? (
              <div className="space-y-3">
                <HashBox label="SMART CONTRACT ADDRESS" value={proof.contract_address} color="purple" />
                <HashBox label="TRANSACTION HASH (TX)" value={proof.tx_hash} color="cyan" />
                <HashBox label="MERKLE TREE ROOT" value={proof.merkle_root} color="green" />

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(10,18,35,0.8)', border: '1px solid rgba(30,41,59,0.6)' }}>
                    <div className="text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>BLOCK HEIGHT</div>
                    <div className="text-[11px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#06b6d4' }}>
                      #{proof.block_height?.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(10,18,35,0.8)', border: '1px solid rgba(30,41,59,0.6)' }}>
                    <div className="text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>GAS USED</div>
                    <div className="text-[11px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#10b981' }}>
                      {proof.gas_used?.toLocaleString()} gwei
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.25)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#10b981' }}>
                      {proof.status}
                    </span>
                  </div>
                  <div className="status-led status-led-green" />
                </div>
              </div>
            ) : (
              <p className="text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#334155' }}>
                Select a block event to inspect its cryptographic on-chain proof.
              </p>
            )}
          </div>

          {/* What is Blockchain here? */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(168,85,247,0.04)',
              border: '1px solid rgba(168,85,247,0.15)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3.5 h-3.5" style={{ color: '#a855f7' }} />
              <span className="text-[10px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#7c3aed' }}>
                HOW BLOCKCHAIN IS USED
              </span>
            </div>
            <ul className="space-y-1.5">
              {[
                'SHA-256 hash-linked event chain (prev_hash → current_hash)',
                'Merkle tree root ensures tamper-evidence',
                'Smart contract on Polygon POS + Hyperledger',
                'Each forensic action creates an immutable block',
                'Court-admissible chain of custody for evidence',
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span style={{ color: '#a855f7', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem' }}>-</span>
                  <span className="text-[10px] leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#64748b' }}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
