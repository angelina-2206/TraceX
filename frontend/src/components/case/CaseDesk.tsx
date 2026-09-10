import React, { useState } from 'react';
import {
  Upload, FileText, ArrowRight, ShieldCheck, Hash, Lock,
  Play, CheckCircle2, ChevronRight, Activity, Terminal
} from 'lucide-react';
import { CaseDetail } from '../../types';

interface CaseDeskProps {
  cases: CaseDetail[];
  activeCase: CaseDetail | null;
  onSelectCase: (caseDetail: CaseDetail) => void;
  onIngestNewEmail: (file: File | null, rawText: string) => Promise<void>;
  loading: boolean;
  onSelectTab?: (tab: string) => void;
}

export const CaseDesk: React.FC<CaseDeskProps> = ({
  cases,
  activeCase,
  onSelectCase,
  onIngestNewEmail,
  loading,
  onSelectTab
}) => {
  const [activeTabMode, setActiveTabMode] = useState<'upload' | 'paste'>('upload');
  const [rawTextInput, setRawTextInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [ingestStep, setIngestStep] = useState(0);

  const simulateIngestProgress = async (file: File | null, text: string) => {
    for (let i = 1; i <= 4; i++) {
      setIngestStep(i);
      await new Promise(r => setTimeout(r, 400));
    }
    await onIngestNewEmail(file, text);
    setIngestStep(0);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await simulateIngestProgress(e.dataTransfer.files[0], '');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await simulateIngestProgress(e.target.files[0], '');
    }
  };

  const handleTextSubmit = async () => {
    if (!rawTextInput.trim()) return;
    await simulateIngestProgress(null, rawTextInput);
    setRawTextInput('');
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto animate-fade-in">
      {/* ── Top Workstation Header & Telemetry ── */}
      <div className="tracex-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-teal-500">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-400">
              Case Intake Workstation
            </span>
            <span className="text-xs text-slate-400">Institutional Forensic Lab</span>
          </div>
          <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-teal-400" />
            Case Desk & Evidence Intake Portal
          </h1>
        </div>

        {/* Compact Statistics Counter */}
        <div className="flex items-center gap-4 text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-slate-100 font-bold">{cases.length}</span>
            <span className="text-slate-400 text-[11px]">Active Cases</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-bold">4</span>
            <span className="text-slate-400 text-[11px]">Evidence Chains</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">12</span>
            <span className="text-slate-400 text-[11px]">Extracted IOCs</span>
          </div>
        </div>
      </div>

      {/* ── PRIMARY AREA: EVIDENCE INTAKE CARD ── */}
      <div className="tracex-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-teal-400" />
              Evidence Ingestion & Parsing Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit suspicious email payload (.eml / .msg) for automated MIME parsing, route reconstruction, and SHA-256 evidence sealing.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTabMode('upload')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTabMode === 'upload'
                  ? 'bg-teal-500/20 border border-teal-500/40 text-teal-300'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setActiveTabMode('paste')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTabMode === 'paste'
                  ? 'bg-teal-500/20 border border-teal-500/40 text-teal-300'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Paste Headers
            </button>
          </div>
        </div>

        {/* Dropzone Area */}
        {activeTabMode === 'upload' ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative ${
              dragOver
                ? 'border-teal-400 bg-teal-500/10'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <input
              type="file"
              accept=".eml,.msg,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-teal-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Drop Suspicious Email File Here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports <span className="text-teal-300">.eml</span>, raw RFC-822 headers, or text formats
                </p>
              </div>
              <button className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2 font-medium">
                <Upload className="w-3.5 h-3.5" />
                Select Evidence File
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={rawTextInput}
              onChange={(e) => setRawTextInput(e.target.value)}
              placeholder="Paste raw RFC-822 MIME email headers or body content..."
              rows={5}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
            />
            <button
              onClick={handleTextSubmit}
              disabled={loading || !rawTextInput.trim()}
              className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 font-medium disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              Ingest Raw Email Headers
            </button>
          </div>
        )}

        {/* 3 Forensic Intake Integrity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-3">
            <Hash className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <div className="font-semibold text-slate-200 text-xs">Integrity Seal</div>
              <div className="text-[11px] text-slate-400">SHA-256 hash automatically computed</div>
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-slate-200 text-xs">Safe Sandbox</div>
              <div className="text-[11px] text-slate-400">Zero host execution risk</div>
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-3">
            <Lock className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <div className="font-semibold text-slate-200 text-xs">Chain of Custody</div>
              <div className="text-[11px] text-slate-400">Immutable ledger logging</div>
            </div>
          </div>
        </div>

        {/* Loading Progress State */}
        {ingestStep > 0 && (
          <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/30 space-y-2 animate-fade-in text-xs">
            <div className="flex items-center justify-between text-teal-300 font-semibold">
              <span>Parsing & Ingesting Evidence Payload...</span>
              <span>Step {ingestStep}/4</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
              <div className="bg-teal-400 h-full transition-all duration-300" style={{ width: `${ingestStep * 25}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── RECENT INVESTIGATIONS GRID / INSPECTOR ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Recent Case Records ({cases.length})
          </h3>
          <span className="text-[11px] text-slate-400">Select case to inspect details</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases Cards List */}
          <div className={`${activeCase ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
            <div className={`grid grid-cols-1 ${activeCase ? 'md:grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
              {cases.map((c) => {
                const isSelected = activeCase?.case_id === c.case_id;
                const severityColor =
                  c.severity === 'CRITICAL' ? '#ef4444' :
                  c.severity === 'HIGH' ? '#f59e0b' : '#10b981';

                return (
                  <div
                    key={c.case_id}
                    onClick={() => onSelectCase(c)}
                    className={`tracex-card p-5 cursor-pointer relative overflow-hidden transition-all ${
                      isSelected ? 'tracex-card-active shadow-lg' : 'hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold text-teal-400 font-mono">{c.case_id}</span>
                        <h4 className="text-sm font-semibold text-slate-100 line-clamp-1 mt-0.5">{c.title}</h4>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase shrink-0"
                            style={{
                              background: `${severityColor}18`,
                              color: severityColor,
                              border: `1px solid ${severityColor}35`
                            }}>
                        {c.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {c.summary}
                    </p>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-3">
                        <span>{c.header_hops.length} Hops</span>
                        <span>{c.urls.length} URLs</span>
                        <span className="text-slate-300">{c.chain_of_custody.length} Blocks</span>
                      </div>
                      <div className="flex items-center gap-1 text-teal-300 font-semibold">
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Case Inspector Panel */}
          {activeCase && (
            <div className="lg:col-span-1 tracex-card p-5 space-y-4 animate-fade-in flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium uppercase">Selected Case</span>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mt-0.5 font-mono">
                      <Terminal className="w-4 h-4 text-teal-400" />
                      {activeCase.case_id}
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded text-amber-400 bg-amber-500/10 border border-amber-500/30">
                    {activeCase.severity}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{activeCase.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {activeCase.summary}
                  </p>
                </div>

                {/* Telemetry IOC Grid */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Extracted Indicators (IOCs)</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">HOPS</span>
                      <span className="font-semibold text-slate-200">{activeCase.header_hops.length} Hops</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">URL LINKS</span>
                      <span className="font-semibold text-slate-200">{activeCase.urls.length} URLs</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">PAYLOADS</span>
                      <span className="font-semibold text-slate-200">{activeCase.attachments.length} Files</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">BLOCKCHAIN</span>
                      <span className="font-semibold text-teal-400">{activeCase.chain_of_custody.length} Seals</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectTab?.('email_forensics')}
                className="w-full btn-primary text-xs py-2.5 font-semibold flex items-center justify-center gap-2 mt-4"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Launch Forensic Analysis Lab
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
