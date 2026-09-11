import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, Check, Globe } from 'lucide-react';
import { CaseDetail } from '../../types';
import { generateCasePdf, ReportLanguage } from '../../utils/pdfExporter';

interface PdfDownloadMenuProps {
  caseDetail: CaseDetail;
  variant?: 'primary' | 'secondary' | 'compact';
  className?: string;
}

const LANGUAGES: { code: ReportLanguage; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English (Default)' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी (Hindi)' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు (Telugu)' },
];

export const PdfDownloadMenu: React.FC<PdfDownloadMenuProps> = ({
  caseDetail,
  variant = 'primary',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<ReportLanguage>('en');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = (lang: ReportLanguage) => {
    setSelectedLang(lang);
    setOpen(false);
    generateCasePdf(caseDetail, lang);
  };

  if (variant === 'compact') {
    return (
      <div className="relative inline-block" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          title="Download Case PDF Report (English / Hindi / Telugu)"
          className={`px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-teal-300" />
          <span>PDF</span>
          <ChevronDown className={`w-3 h-3 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-48 rounded-lg bg-slate-900 border border-slate-700 shadow-xl z-50 overflow-hidden py-1 animate-fade-in text-xs">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center gap-1">
              <Globe className="w-3 h-3 text-teal-400" />
              <span>Report Language</span>
            </div>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleDownload(lang.code)}
                className="w-full text-left px-3 py-2 flex items-center justify-between text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-100">{lang.nativeLabel}</div>
                  <div className="text-[10px] text-slate-400">{lang.label} Forensic PDF</div>
                </div>
                {selectedLang === lang.code && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const isFullWidth = className.includes('w-full');
  const baseBtnClass =
    variant === 'primary'
      ? 'btn-primary text-xs py-2 px-3 font-semibold flex items-center justify-center gap-1.5 shadow-sm'
      : 'btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1.5';

  return (
    <div className={`relative ${isFullWidth ? 'w-full' : 'inline-block'} ${className}`} ref={menuRef}>
      <div className={`flex rounded-md shadow-sm ${isFullWidth ? 'w-full' : 'inline-flex'}`}>
        {/* Main Quick Trigger (Default English or last selected) */}
        <button
          onClick={() => generateCasePdf(caseDetail, selectedLang)}
          className={`${baseBtnClass} ${isFullWidth ? 'flex-1' : ''} rounded-r-none border-r border-slate-300 dark:border-slate-700/60 cursor-pointer`}
          title={`Download Case PDF Report in ${LANGUAGES.find(l => l.code === selectedLang)?.label}`}
        >
          <Download className="w-3.5 h-3.5 text-[var(--blue-primary)] dark:text-teal-400" />
          <span>Download PDF ({selectedLang.toUpperCase()})</span>
        </button>

        {/* Dropdown Toggle Arrow */}
        <button
          onClick={() => setOpen(!open)}
          className={`${baseBtnClass} rounded-l-none px-2.5 border-l-0 cursor-pointer hover:bg-[var(--surface-3)]`}
          title="Select Report Language (English / Hindi / Telugu)"
        >
          <ChevronDown className={`w-3.5 h-3.5 opacity-80 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Language Selection Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-60 rounded-lg bg-[var(--surface)] border border-[var(--border)] shadow-xl z-50 overflow-hidden py-1 animate-fade-in text-xs">
          <div className="px-3.5 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[var(--blue-primary)]" />
              <span>Select Language</span>
            </span>
            <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">PDF Ready</span>
          </div>

          <div className="py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleDownload(lang.code)}
                className="w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors group cursor-pointer"
              >
                <div>
                  <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--blue-primary)]">
                    {lang.nativeLabel}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Full court-admissible forensic translation
                  </div>
                </div>
                {selectedLang === lang.code && (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
