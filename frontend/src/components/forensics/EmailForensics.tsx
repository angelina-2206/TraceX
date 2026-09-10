import React, { useState } from 'react';
import { Mail, ShieldCheck, ShieldAlert, FileCode, Paperclip, Eye, EyeOff, CheckCircle2, XCircle, X } from 'lucide-react';
import { CaseDetail } from '../../types';

interface EmailForensicsProps {
  caseDetail: CaseDetail;
}

export const EmailForensics: React.FC<EmailForensicsProps> = ({ caseDetail }) => {
  const [showRawHeaders, setShowRawHeaders] = useState(false);
  const [activeTab, setActiveTab] = useState<'HEADER' | 'BODY' | 'ATTACHMENTS'>('HEADER');

  const auth = caseDetail.auth_status;
  const identity = caseDetail.identity_analysis;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Title & Header Actions */}
      <div className="tracex-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-teal-500">
        <div>
          <h2 className="text-base font-bold font-mono text-slate-100 flex items-center space-x-2">
            <Mail className="w-5 h-5 text-teal-400" />
            <span>EMAIL FORENSICS LAB — {caseDetail.case_id}</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            MIME structure inspection, identity alignment, authentication verification, and payload analysis.
          </p>
        </div>

        <button
          onClick={() => setShowRawHeaders(!showRawHeaders)}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center space-x-2 font-mono"
        >
          {showRawHeaders ? <EyeOff className="w-4 h-4 text-teal-400" /> : <Eye className="w-4 h-4 text-teal-400" />}
          <span>{showRawHeaders ? 'HIDE RAW HEADERS' : 'VIEW RAW HEADERS'}</span>
        </button>
      </div>

      {/* Authentication Status Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="tracex-card p-4">
          <div className="text-slate-400 text-[11px] uppercase">SPF AUTHENTICATION</div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-slate-200 truncate max-w-[120px]">{auth.spf_domain}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              auth.spf_status === 'PASS' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30' : 'bg-red-950/60 text-red-300 border border-red-800'
            }`}>
              {auth.spf_status}
            </span>
          </div>
        </div>

        <div className="tracex-card p-4">
          <div className="text-slate-400 text-[11px] uppercase">DKIM SIGNATURE</div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-slate-200">{auth.dkim_selector ? `Selector: ${auth.dkim_selector}` : 'No Selector'}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              auth.dkim_status === 'PASS' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30' : 'bg-red-950/60 text-red-300 border border-red-800'
            }`}>
              {auth.dkim_status}
            </span>
          </div>
        </div>

        <div className="tracex-card p-4">
          <div className="text-slate-400 text-[11px] uppercase">DMARC ALIGNMENT</div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-slate-200">Policy: {auth.dmarc_policy}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              auth.dmarc_status === 'PASS' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30' : 'bg-red-950/60 text-red-300 border border-red-800'
            }`}>
              {auth.dmarc_status}
            </span>
          </div>
        </div>

        <div className="tracex-card p-4">
          <div className="text-slate-400 text-[11px] uppercase">INFRASTRUCTURE ALIGNMENT</div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-slate-200">Overall State</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              auth.alignment === 'ALIGNED' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30' : 'bg-red-950/60 text-red-300 border border-red-800'
            }`}>
              {auth.alignment}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab View: Header / Body / Attachments */}
      <div className="tracex-card p-6">
        <div className="flex items-center space-x-4 border-b border-white/5 pb-3 mb-4 font-mono text-xs">
          <button
            onClick={() => setActiveTab('HEADER')}
            className={`pb-1.5 border-b-2 transition-all ${
              activeTab === 'HEADER' ? 'border-teal-400 text-teal-300 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            STRUCTURED ENVELOPE HEADERS
          </button>
          <button
            onClick={() => setActiveTab('BODY')}
            className={`pb-1.5 border-b-2 transition-all ${
              activeTab === 'BODY' ? 'border-teal-400 text-teal-300 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            SANITIZED BODY VIEW
          </button>
          <button
            onClick={() => setActiveTab('ATTACHMENTS')}
            className={`pb-1.5 border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'ATTACHMENTS' ? 'border-teal-400 text-teal-300 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>ATTACHMENT PAYLOADS</span>
            <span className="px-1.5 py-0.2 bg-slate-800 rounded text-[10px] text-teal-300">{caseDetail.attachments.length}</span>
          </button>
        </div>

        {activeTab === 'HEADER' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 font-mono text-[10px]">SUBJECT:</span>
                <p className="text-slate-100 font-semibold mt-0.5">{caseDetail.email_subject}</p>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px]">DATE:</span>
                <p className="text-slate-200 mt-0.5">{caseDetail.email_date}</p>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px]">CLAIMED FROM:</span>
                <p className="text-slate-200 mt-0.5">{caseDetail.email_from}</p>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px]">RECIPIENT (TO):</span>
                <p className="text-slate-200 mt-0.5">{caseDetail.email_to}</p>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px]">REPLY-TO ADDRESS:</span>
                <p className={`mt-0.5 font-semibold ${identity.reply_to_mismatch ? 'text-red-400' : 'text-slate-200'}`}>
                  {identity.reply_to || 'None specified'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px]">RETURN-PATH:</span>
                <p className={`mt-0.5 ${identity.return_path_mismatch ? 'text-amber-400' : 'text-slate-200'}`}>
                  {identity.return_path || 'None specified'}
                </p>
              </div>
            </div>

            {/* Mismatch Warning Alert */}
            {identity.reply_to_mismatch && (
              <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-800/80 text-red-300 flex items-start space-x-3 text-xs">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">CRITICAL ENVELOPE MISMATCH DETECTED</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    The Reply-To address <code className="text-red-300 bg-slate-900 px-1 py-0.5 rounded">{identity.reply_to}</code> routes replies away from the visible sender domain <code className="text-slate-200 bg-slate-900 px-1 py-0.5 rounded">{caseDetail.email_from}</code>.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'BODY' && (
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
            {caseDetail.social_eng_signals.map((s, idx) => (
              <div key={idx} className="mb-2 p-2.5 rounded bg-amber-950/20 border border-amber-800/40 text-amber-200">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300 uppercase mr-2">
                  [LINE {s.line_number || 1}] {s.category}
                </span>
                <span>"{s.evidence_quote}"</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ATTACHMENTS' && (
          <div>
            {caseDetail.attachments.length === 0 ? (
              <p className="text-slate-400 font-mono text-xs py-4 text-center">No attachments present in email MIME payload.</p>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {caseDetail.attachments.map((att) => (
                  <div key={att.attachment_id} className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Paperclip className="w-5 h-5 text-teal-400" />
                      <div>
                        <div className="font-semibold text-slate-200">{att.filename}</div>
                        <div className="text-[11px] text-slate-400">
                          {att.mime_type} • {(att.size_bytes / 1024).toFixed(1)} KB
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          SHA-256: <code className="text-teal-400 break-all">{att.sha256}</code>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-red-950/60 text-red-300 border border-red-800 text-[10px] font-bold uppercase shrink-0">
                      UNTRUSTED EVIDENCE ({att.risk_level})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Raw Headers Modal Overlay */}
      {showRawHeaders && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between font-mono text-sm">
              <span className="font-bold text-slate-100">RAW FORENSIC EMAIL HEADERS ({caseDetail.case_id})</span>
              <button onClick={() => setShowRawHeaders(false)} className="text-slate-400 hover:text-slate-100 flex items-center gap-1.5"><X className="w-4 h-4" /> CLOSE</button>
            </div>
            <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-y-auto whitespace-pre-wrap select-all leading-relaxed">
              {caseDetail.header_hops.map(h => h.raw_header).join('\n')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
