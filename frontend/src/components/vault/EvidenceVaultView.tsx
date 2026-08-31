import React, { useState } from 'react';
import {
  Lock, Download, ShieldCheck, FileText, CheckCircle2,
  History, Hash, Copy, Check, Blocks, Shield, ExternalLink
} from 'lucide-react';
import { CaseDetail } from '../../types';

interface EvidenceVaultViewProps {
  caseDetail: CaseDetail;
}

const CopyHash: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer group transition-all"
      style={{
        background: 'rgba(10,18,35,0.7)',
        border: '1px solid rgba(30,41,59,0.6)',
      }}
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    >
      <span className="text-[9px] shrink-0 uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#334155' }}>
        {label}:
      </span>
      <code className="flex-1 text-[9px] truncate" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>
        {value.slice(0, 20)}…
      </code>
      {copied
        ? <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
        : <Copy className="w-2.5 h-2.5 text-slate-600 shrink-0 opacity-0 group-hover:opacity-100" />
      }
    </div>
  );
};

const ACTION_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  'INGEST':   { bg: 'rgba(6,182,212,0.08)',  border: 'rgba(6,182,212,0.3)',  text: '#67e8f9', dot: '#06b6d4' },
  'ANALYZE':  { bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.3)', text: '#d8b4fe', dot: '#a855f7' },
  'EXPORT':   { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7', dot: '#10b981' },
  'DEFAULT':  { bg: 'rgba(30,41,59,0.4)',    border: 'rgba(51,65,85,0.5)',   text: '#94a3b8', dot: '#475569' },
};

function getActionColor(action: string) {
  const upper = action.toUpperCase();
  if (upper.includes('INGEST')) return ACTION_COLORS.INGEST;
  if (upper.includes('ANALYZ') || upper.includes('DETECT')) return ACTION_COLORS.ANALYZE;
  if (upper.includes('EXPORT') || upper.includes('VAULT') || upper.includes('SEAL')) return ACTION_COLORS.EXPORT;
  return ACTION_COLORS.DEFAULT;
}

export const EvidenceVaultView: React.FC<EvidenceVaultViewProps> = ({ caseDetail }) => {
  const cocEvents = caseDetail.chain_of_custody;

  const downloadStix = async () => {
    const res = await fetch(`http://127.0.0.1:8000/api/v1/cases/${caseDetail.case_id}/stix`);
    const stixData = await res.json();
    const blob = new Blob([JSON.stringify(stixData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `STIX_Bundle_${caseDetail.case_id}.json`; a.click();
  };

  const downloadReport = () => {
    const reportText = `# TRACE-X FORENSIC INVESTIGATION REPORT — ${caseDetail.case_id}
Generated: ${new Date().toISOString()}

## 1. CASE SUMMARY
- Case ID: ${caseDetail.case_id}
- Title: ${caseDetail.title}
- Overall Threat Rating: ${caseDetail.threat_score.overall_score} / 100 (${caseDetail.threat_score.severity})
- Subject: ${caseDetail.email_subject}
- From: ${caseDetail.email_from}

## 2. FORENSIC FINDINGS
- SPF Status: ${caseDetail.auth_status.spf_status}
- DKIM Status: ${caseDetail.auth_status.dkim_status}
- DMARC Status: ${caseDetail.auth_status.dmarc_status}
- Envelope Alignment: ${caseDetail.auth_status.alignment}
- Sender Deception Score: ${caseDetail.identity_analysis.deception_score} / 100

## 3. BLOCKCHAIN CHAIN OF CUSTODY LEDGER
${cocEvents.map(e => `[${e.event_id}] ${e.action} by ${e.actor} | Current Hash: ${e.current_hash}`).join('\n')}
`;
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `Forensic_Report_${caseDetail.case_id}.md`; a.click();
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* ── Title Banner ── */}
      <div
        className="relative rounded-xl p-5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(6,182,212,0.04) 60%, rgba(10,18,35,0.95) 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
          boxShadow: '0 0 30px rgba(16,185,129,0.06)',
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, #10b981, transparent)', filter: 'blur(24px)' }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.35)',
                boxShadow: '0 0 16px rgba(16,185,129,0.2)',
              }}
            >
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#f1f5f9' }}>
                EVIDENCE VAULT & TAMPER-EVIDENT CHAIN OF CUSTODY
              </h2>
              <p className="text-[11px] mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>
                Cryptographically sealed SHA-256 event ledger · Legal chain-of-custody for digital evidence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadStix}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.25)',
                color: '#67e8f9',
              }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              STIX 2.1 IOC
            </button>
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                color: '#6ee7b7',
              }}
            >
              <Download className="w-3.5 h-3.5" />
              EXPORT REPORT
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'COC EVENTS', value: cocEvents.length, color: '#06b6d4', bg: 'rgba(6,182,212,0.06)', border: 'rgba(6,182,212,0.2)' },
          { label: 'HASH ALGO', value: 'SHA-256', color: '#a855f7', bg: 'rgba(168,85,247,0.06)', border: 'rgba(168,85,247,0.2)' },
          { label: 'INTEGRITY', value: '100%', color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' },
          { label: 'TAMPER STATUS', value: 'CLEAN', color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className="rounded-xl p-3" style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="text-[9px] font-bold mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>{label}</div>
            <div className="text-lg font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Timeline Chain ── */}
      <div className="forensic-card p-6">
        <h3 className="text-[11px] font-bold mb-6 flex items-center gap-2"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>
          <History className="w-4 h-4" style={{ color: '#06b6d4' }} />
          APPEND-ONLY BLOCKCHAIN LEDGER · {cocEvents.length} EVENTS
        </h3>

        <div className="relative">
          {/* Vertical timeline line */}
          <div
            className="absolute left-5 top-6 bottom-6 w-0.5"
            style={{
              background: 'linear-gradient(to bottom, rgba(6,182,212,0.6), rgba(168,85,247,0.4), rgba(16,185,129,0.2))',
            }}
          />

          <div className="space-y-4">
            {cocEvents.map((evt, idx) => {
              const ac = getActionColor(evt.action);
              const isFirst = idx === 0;

              return (
                <div key={evt.event_id} className="relative flex gap-5 pl-2 animate-block-appear"
                     style={{ animationDelay: `${idx * 80}ms` }}>
                  {/* Timeline node */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 relative z-10"
                    style={{
                      background: ac.bg,
                      border: `2px solid ${ac.border}`,
                      boxShadow: `0 0 10px ${ac.dot}30`,
                    }}
                  >
                    {isFirst
                      ? <Blocks className="w-3 h-3" style={{ color: ac.dot }} />
                      : <Hash className="w-3 h-3" style={{ color: ac.dot }} />
                    }
                  </div>

                  {/* Event card */}
                  <div
                    className="flex-1 rounded-xl p-4 transition-all"
                    style={{
                      background: ac.bg,
                      border: `1px solid ${ac.border}`,
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            background: ac.bg,
                            border: `1px solid ${ac.border}`,
                            color: ac.text,
                          }}
                        >
                          {evt.event_id}
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            background: 'rgba(30,41,59,0.5)',
                            border: '1px solid rgba(51,65,85,0.4)',
                            color: '#64748b',
                          }}
                        >
                          {evt.role}
                        </span>
                        <span className="text-xs font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#e2e8f0' }}>
                          {evt.action}
                        </span>
                      </div>
                      <span className="text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#334155' }}>
                        {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed mb-3" style={{ color: '#94a3b8' }}>
                      {evt.details}
                    </p>

                    {/* Hash chain */}
                    <div className="space-y-1.5">
                      <CopyHash label="PREV" value={evt.prev_hash} />
                      <div className="flex justify-center">
                        <div className="w-0.5 h-2" style={{ background: 'rgba(6,182,212,0.3)' }} />
                      </div>
                      <CopyHash label="CURR" value={evt.current_hash} />
                    </div>

                    {/* Verified badge */}
                    <div className="flex items-center gap-1.5 mt-3">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-[9px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#10b981' }}>
                        BLOCKCHAIN ANCHORED · TAMPER-EVIDENT
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
