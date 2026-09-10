import React, { useState } from 'react';
import {
  Upload, FileText, ArrowRight, ShieldCheck, Hash, Lock,
  Play, CheckCircle2, ChevronRight, Activity, Terminal
} from 'lucide-react';
import { CaseDetail } from '../../types';
import { PageHeader } from '../common/PageHeader';

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
      {/* ── Page Header ── */}
      <PageHeader
        breadcrumbs={['TRACE-X', 'Case Intake Workstation', 'Case Desk']}
        title="Case Desk & Evidence Intake Portal"
        description="Ingest suspicious email payloads (.eml/.msg or raw RFC-822 headers) into the institutional forensic ledger for route reconstruction, threat scoring, and SHA-256 evidence sealing."
        metadata={
          <>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              {cases.length} active case records
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              4 evidence chains sealed
            </span>
          </>
        }
      />

      {/* ── PRIMARY AREA: EVIDENCE INTAKE CARD ── */}
      <div className="tracex-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Upload className="w-4 h-4 text-[var(--blue-primary)]" />
              <span>Evidence Ingestion & Parsing Engine</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Submit suspicious email payload for automated MIME parsing, route reconstruction, and SHA-256 evidence sealing.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTabMode('upload')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTabMode === 'upload'
                  ? 'bg-[var(--blue-primary)] text-white font-semibold'
                  : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setActiveTabMode('paste')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTabMode === 'paste'
                  ? 'bg-[var(--blue-primary)] text-white font-semibold'
                  : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer relative ${
              dragOver
                ? 'border-[var(--blue-primary)] bg-[var(--surface-2)]'
                : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--border-hi)]'
            }`}
          >
            <input
              type="file"
              accept=".eml,.msg,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--blue-primary)]">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  Drop Suspicious Email File Here
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Supports <span className="font-semibold text-[var(--text-secondary)]">.eml</span>, raw RFC-822 headers, or text formats
                </p>
              </div>
              <button className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2 font-medium">
                <Upload className="w-3.5 h-3.5" />
                <span>Select Evidence File</span>
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
              className="w-full p-4 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--blue-primary)] code-mono"
            />
            <button
              onClick={handleTextSubmit}
              disabled={loading || !rawTextInput.trim()}
              className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 font-medium disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>Ingest Raw Email Headers</span>
            </button>
          </div>
        )}

        {/* 3 Forensic Intake Integrity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
          <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-3">
            <Hash className="w-4 h-4 text-[var(--blue-primary)] shrink-0" />
            <div>
              <div className="font-semibold text-[var(--text-primary)] text-xs">Integrity Seal</div>
              <div className="text-xs text-[var(--text-muted)]">SHA-256 hash automatically computed</div>
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-[var(--text-primary)] text-xs">Safe Sandbox</div>
              <div className="text-xs text-[var(--text-muted)]">Zero host execution risk</div>
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-3">
            <Lock className="w-4 h-4 text-[var(--blue-primary)] shrink-0" />
            <div>
              <div className="font-semibold text-[var(--text-primary)] text-xs">Chain of Custody</div>
              <div className="text-xs text-[var(--text-muted)]">Immutable ledger logging</div>
            </div>
          </div>
        </div>

        {/* Loading Progress State */}
        {ingestStep > 0 && (
          <div className="p-4 rounded-lg bg-[var(--surface-2)] border border-[var(--blue-primary)] space-y-2 animate-fade-in text-xs">
            <div className="flex items-center justify-between text-[var(--text-primary)] font-semibold">
              <span>Parsing & Ingesting Evidence Payload...</span>
              <span>Step {ingestStep}/4</span>
            </div>
            <div className="w-full bg-[var(--border)] h-1.5 rounded overflow-hidden">
              <div className="bg-[var(--blue-primary)] h-full transition-all duration-300" style={{ width: `${ingestStep * 25}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── RECENT INVESTIGATIONS GRID / INSPECTOR ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Recent Case Records ({cases.length})
          </h3>
          <span className="text-xs text-[var(--text-muted)]">Select case record to inspect details</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases Cards List */}
          <div className={`${activeCase ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
            <div className={`grid grid-cols-1 ${activeCase ? 'md:grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
              {cases.map((c) => {
                const isSelected = activeCase?.case_id === c.case_id;
                const badgeClass =
                  c.severity === 'CRITICAL' ? 'badge-critical' :
                  c.severity === 'HIGH' ? 'badge-high' : 'badge-safe';

                return (
                  <div
                    key={c.case_id}
                    onClick={() => onSelectCase(c)}
                    className={`tracex-card p-5 cursor-pointer relative overflow-hidden transition-all ${
                      isSelected ? 'tracex-card-active border-[var(--blue-primary)]' : 'hover:border-[var(--border-hi)]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold text-[var(--blue-primary)] font-mono">{c.case_id}</span>
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1 mt-0.5">{c.title}</h4>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase shrink-0 ${badgeClass}`}>
                        {c.severity}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4 leading-relaxed">
                      {c.summary}
                    </p>

                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-3">
                        <span>{c.header_hops.length} Hops</span>
                        <span>{c.urls.length} URLs</span>
                        <span>{c.chain_of_custody.length} Seals</span>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--blue-primary)] font-semibold">
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
                <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
                  <div>
                    <span className="text-xs text-[var(--text-muted)] font-medium uppercase">Selected Case</span>
                    <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2 mt-0.5 font-mono">
                      <Terminal className="w-4 h-4 text-[var(--blue-primary)]" />
                      {activeCase.case_id}
                    </h3>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase ${
                    activeCase.severity === 'CRITICAL' ? 'badge-critical' : activeCase.severity === 'HIGH' ? 'badge-high' : 'badge-safe'
                  }`}>
                    {activeCase.severity}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-primary)]">{activeCase.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {activeCase.summary}
                  </p>
                </div>

                {/* Telemetry IOC Grid */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[var(--text-muted)] uppercase">Extracted Indicators (IOCs)</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">HOPS</span>
                      <span className="font-semibold text-[var(--text-primary)]">{activeCase.header_hops.length} Hops</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">URL LINKS</span>
                      <span className="font-semibold text-[var(--text-primary)]">{activeCase.urls.length} URLs</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">PAYLOADS</span>
                      <span className="font-semibold text-[var(--text-primary)]">{activeCase.attachments.length} Files</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">BLOCKCHAIN</span>
                      <span className="font-semibold text-[var(--blue-primary)]">{activeCase.chain_of_custody.length} Seals</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectTab?.('email_forensics')}
                className="w-full btn-primary text-xs py-2.5 font-semibold flex items-center justify-center gap-2 mt-4"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Forensic Analysis Lab</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
