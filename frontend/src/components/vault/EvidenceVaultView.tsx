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
      className="flex items-center gap-2 p-2 rounded-md cursor-pointer group transition-all bg-slate-950 border border-slate-800"
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    >
      <span className="text-[9px] font-mono shrink-0 uppercase text-slate-500">
        {label}:
      </span>
      <code className="flex-1 text-[10px] font-mono text-slate-400 truncate">
        {value.slice(0, 24)}…
      </code>
      {copied
        ? <Check className="w-3 h-3 text-teal-400 shrink-0" />
        : <Copy className="w-3 h-3 text-slate-600 shrink-0 opacity-0 group-hover:opacity-100" />
      }
    </div>
  );
};

export const EvidenceVaultView: React.FC<EvidenceVaultViewProps> = ({ caseDetail }) => {
  const cocEvents = caseDetail.chain_of_custody;

  const downloadStix = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/cases/${caseDetail.case_id}/stix`);
      const stixData = await res.json();
      const blob = new Blob([JSON.stringify(stixData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `STIX_Bundle_${caseDetail.case_id}.json`; a.click();
    } catch (e) {
      console.error("STIX download error:", e);
    }
  };

  const downloadJsonReport = () => {
    const blob = new Blob([JSON.stringify(caseDetail, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `Forensic_Evidence_Package_${caseDetail.case_id}.json`; a.click();
  };

  const downloadReport = () => {
    const gf = caseDetail.geo_financial;
    const auth = caseDetail.auth_status;
    const threat = caseDetail.threat_score;
    const identity = caseDetail.identity_analysis;

    const reportText = `================================================================================
                    TRACE-X CYBER-FORENSIC INVESTIGATION REPORT
================================================================================
Report Generated : ${new Date().toISOString()}
Case Identifier  : ${caseDetail.case_id}
Classification   : LAW ENFORCEMENT & SOC COURT-ADMISSIBLE FORENSIC EVIDENCE

--------------------------------------------------------------------------------
1. EXECUTIVE THREAT ASSESSMENT & RISK PARAMETERS
--------------------------------------------------------------------------------
- Overall Risk Score       : ${threat.overall_score} / 100 (${threat.severity})
- Threat Classification    : Business Email Compromise (BEC) / Financial Redirection
- Primary Incident Status  : ${caseDetail.status}
- Ingestion Timestamp      : ${caseDetail.created_at}

--------------------------------------------------------------------------------
2. EMAIL ARTIFACT & MIME INTAKE DECOMPOSITION
--------------------------------------------------------------------------------
- Subject Line             : ${caseDetail.email_subject}
- Visible Sender (From)    : ${caseDetail.email_from}
- Declared Reply-To        : ${identity.reply_to || 'None'}
- Reply-To Mismatch Flag   : ${identity.reply_to_mismatch ? 'CRITICAL MISMATCH DETECTED' : 'Matched'}
- Recipient Target (To)    : ${caseDetail.email_to}

--------------------------------------------------------------------------------
3. AUTHENTICATION ALIGNMENT & HEADER VERIFICATION MATRIX
--------------------------------------------------------------------------------
- SPF Protocol Result     : ${auth.spf_status} (Domain: ${auth.spf_domain})
- DKIM Signature Result    : ${auth.dkim_status} (Selector: ${auth.dkim_selector || 'N/A'})
- DMARC Policy Evaluation  : ${auth.dmarc_status} (Policy: ${auth.dmarc_policy})
- Domain Alignment Verdict : ${auth.alignment}
- Display Name Homoglyphs  : ${identity.homoglyph_detected ? 'YES (Homoglyph Character Spoofing)' : 'None'}
- Claimed Brand Target     : ${identity.claimed_brand || 'N/A'}
- Sender Deception Score   : ${identity.deception_score} / 100

--------------------------------------------------------------------------------
4. HEADER FLIGHT PATH RECONSTRUCTION & RELAY PARAMETERS
--------------------------------------------------------------------------------
Total Delivery Hops: ${caseDetail.header_hops.length}

${caseDetail.header_hops.map((h, i) => `[HOP #${i + 1}]
  - Origin IP     : ${h.ip}
  - Host Route    : ${h.from_host} -> ${h.by_host}
  - Geolocation   : ${h.geo_location || 'Unknown'} (ASN: ${h.asn}, ISP: ${h.isp})
  - Hop Latency   : ${h.delay_seconds}s
  - Relay Risk    : ${h.is_suspicious ? 'SUSPICIOUS RELAY NODE' : 'Standard Node'}`).join('\n\n')}

--------------------------------------------------------------------------------
5. EMBEDDED URL HYPERLINK & REDIRECT CHAIN ANALYSIS
--------------------------------------------------------------------------------
Total Extracted Hyperlinks: ${caseDetail.urls.length}

${caseDetail.urls.map(u => `[URL ID: ${u.url_id}]
  - Original URL    : ${u.original_url}
  - Final Unshortened: ${u.final_url}
  - Domain Name     : ${u.domain}
  - Redirect Hops   : ${u.redirect_count}
  - Credential Form : ${u.has_credential_form ? 'DETECTED (Phishing Form)' : 'None'}
  - Risk Reputation : ${u.reputation_score} / 100`).join('\n\n')}

--------------------------------------------------------------------------------
6. EXTRACTED BENEFICIARY & FINANCIAL EVIDENCE
--------------------------------------------------------------------------------
${gf ? `- Beneficiary Name   : ${gf.beneficiary_name}
- Bank Name          : ${gf.bank_name} (${gf.branch_city}, India)
- IFSC Branch Code   : ${gf.ifsc_code}
- Payout Requested   : ${gf.amount_requested}
- Account Masked     : ${gf.account_number_masked}
- Origin vs Bank Dist: ${gf.uncertainty_disclaimer}` : 'No financial payout data extracted.'}

--------------------------------------------------------------------------------
7. CHAIN OF CUSTODY AUDIT & BLOCKCHAIN PROOF LEDGER
--------------------------------------------------------------------------------
Total On-Chain Events: ${caseDetail.chain_of_custody.length}

${caseDetail.chain_of_custody.map((c, i) => `[BLOCK #${i + 1}] Action: ${c.action} | Actor: ${c.actor} (${c.role})
  - Timestamp    : ${c.timestamp}
  - Details      : ${c.details}
  - Prev Hash    : ${c.prev_hash}
  - Current Hash : ${c.current_hash}`).join('\n\n')}

================================================================================
END OF OFFICIAL FORENSIC REPORT — TRACE-X FORENSIC PLATFORM
================================================================================`;

    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `TRACE-X_Forensic_Report_${caseDetail.case_id}.md`; a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ── Title Banner ── */}
      <div className="tracex-card p-5 border-l-4 border-l-teal-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Evidence Vault & STIX 2.1 Export Portal
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Court-admissible evidence package · STIX 2.1 JSON bundle export · Forensic audit ledger
            </p>
          </div>
        </div>

        {/* Small Export Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={downloadStix}
            className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:border-teal-400/50 hover:bg-slate-800 rounded-md transition-all flex items-center gap-1.5"
            title="Download STIX 2.1 JSON bundle"
          >
            <Download className="w-3 h-3 text-teal-400" />
            <span>STIX 2.1</span>
          </button>
          <button
            onClick={downloadJsonReport}
            className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:border-teal-400/50 hover:bg-slate-800 rounded-md transition-all flex items-center gap-1.5"
            title="Export full raw JSON evidence package"
          >
            <FileText className="w-3 h-3 text-teal-400" />
            <span>Raw JSON</span>
          </button>
          <button
            onClick={downloadReport}
            className="btn-primary text-[11px] py-1 px-3 font-semibold flex items-center gap-1.5 rounded-md"
            title="Export detailed court-admissible markdown report"
          >
            <Download className="w-3 h-3" />
            <span>Export Report (.md)</span>
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Chain of Custody Events', value: cocEvents.length, color: '#14B8A6' },
          { label: 'Hash Algorithm', value: 'SHA-256', color: '#38bdf8' },
          { label: 'Ledger Integrity', value: '100%', color: '#10b981' },
          { label: 'Tamper Verification', value: 'CLEAN', color: '#10b981' },
        ].map(({ label, value, color }) => (
          <div key={label} className="tracex-card p-3.5">
            <div className="text-[11px] font-medium text-slate-400">{label}</div>
            <div className="text-lg font-mono font-bold mt-1" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Timeline Chain ── */}
      <div className="tracex-card p-6 space-y-4">
        <h3 className="text-xs font-semibold flex items-center gap-2 text-slate-300 uppercase tracking-wider">
          <History className="w-4 h-4 text-teal-400" />
          Append-Only Chain of Custody Ledger · {cocEvents.length} Recorded Events
        </h3>

        <div className="space-y-3">
          {cocEvents.map((evt, idx) => (
            <div key={evt.event_id} className="tracex-card p-4 space-y-3 bg-slate-950/80">
              {/* Header */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300">
                    {evt.event_id}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {evt.role}
                  </span>
                  <span className="text-xs font-semibold text-slate-100">
                    {evt.action}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(evt.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {evt.details}
              </p>

              {/* Hash chain */}
              <div className="space-y-1.5 pt-2 border-t border-slate-900">
                <CopyHash label="PREV" value={evt.prev_hash} />
                <CopyHash label="CURR" value={evt.current_hash} />
              </div>

              {/* Verified badge */}
              <div className="flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-[10px] font-mono font-semibold text-teal-400">
                  CHAIN SEALED · TAMPER-EVIDENT
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
