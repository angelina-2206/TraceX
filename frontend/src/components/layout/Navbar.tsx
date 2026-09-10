import React, { useState, useRef, useEffect } from 'react';
import { Shield, ChevronDown, Mic, MicOff, Activity } from 'lucide-react';
import { UserRole, CaseDetail } from '../../types';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeCase: CaseDetail | null;
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
}

const ROLES: { id: UserRole; label: string; desc: string }[] = [
  { id: 'SOC_ANALYST',  label: 'SOC Analyst',  desc: 'Technical triage — headers, indicators, infrastructure analysis' },
  { id: 'INVESTIGATOR', label: 'Investigator', desc: 'Deep correlation — attack graph, campaigns, evidence chain' },
  { id: 'EXECUTIVE',    label: 'Executive',    desc: 'Risk governance — impact analysis, exposure and audit ledger' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  activeCase,
  voiceActive,
  setVoiceActive,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeRole = ROLES.find(r => r.id === currentRole) || ROLES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const severityColor =
    activeCase?.severity === 'CRITICAL' ? '#ef4444' :
    activeCase?.severity === 'HIGH'     ? '#f59e0b' : '#10b981';

  const roleColor = (id: UserRole) =>
    id === 'SOC_ANALYST' ? 'bg-emerald-400' :
    id === 'INVESTIGATOR' ? 'bg-sky-400' : 'bg-amber-400';

  return (
    <header
      className="bg-[#0D1014] border-b border-[#23272C] px-4 flex items-center justify-between shrink-0 z-40 select-none"
      style={{ height: '52px' }}
    >
      {/* ── Left: Persona Selector ── */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#181C20] border border-[#2A2E33] hover:border-[#40464E] text-xs text-gray-200 transition-all duration-200"
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${roleColor(currentRole)}`} />
            <span className="font-medium">{activeRole.label}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Animated dropdown */}
          <div
            className={`absolute left-0 mt-1.5 w-72 bg-[#131619] border border-[#2A2E33] rounded-md shadow-2xl z-50 overflow-hidden transition-all duration-200 origin-top-left ${
              dropdownOpen
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
            }`}
          >
            <div className="px-3 pt-2.5 pb-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-widest border-b border-[#23272C]">
              Analyst Perspective
            </div>
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => { setCurrentRole(r.id); setDropdownOpen(false); }}
                className={`w-full text-left px-3 py-2.5 transition-colors duration-150 border-l-2 ${
                  currentRole === r.id
                    ? 'bg-[#1E2226] border-white'
                    : 'border-transparent hover:bg-[#181C20]'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${roleColor(r.id)}`} />
                  <span className={`text-xs font-semibold ${
                    currentRole === r.id ? 'text-white' : 'text-gray-300'
                  }`}>
                    {r.label}
                  </span>
                  {currentRole === r.id && (
                    <span className="ml-auto text-[9px] text-gray-600 font-mono uppercase tracking-wider">Active</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-500 leading-snug pl-3.5">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Brand watermark */}
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#23272C]">
          <Shield className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[11px] font-mono font-semibold tracking-widest text-gray-500">
            TRACE<span className="text-gray-700">-X</span>
          </span>
        </div>
      </div>

      {/* ── Centre: Active Case Banner ── */}
      <div className="hidden md:flex items-center">
        {activeCase ? (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded bg-[#181C20] border border-[#2A2E33] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="text-gray-200 font-bold">{activeCase.case_id}</span>
            <span className="text-gray-600">|</span>
            <span className="font-semibold uppercase text-[11px]" style={{ color: severityColor }}>
              {activeCase.severity} · {activeCase.threat_score?.overall_score ?? '—'}/100
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#181C20] border border-[#2A2E33] text-[11px] text-gray-600 font-mono">
            <Activity className="w-3.5 h-3.5" />
            <span>No active case — ingest evidence to begin</span>
          </div>
        )}
      </div>

      {/* ── Right: Controls ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setVoiceActive(!voiceActive)}
          title={voiceActive ? 'Disable voice copilot' : 'Enable voice copilot'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium border transition-all duration-200 ${
            voiceActive
              ? 'bg-[#1a2a1a] border-emerald-700/60 text-emerald-300'
              : 'bg-[#181C20] border-[#2A2E33] text-gray-500 hover:text-gray-300 hover:border-[#40464E]'
          }`}
        >
          {voiceActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{voiceActive ? 'Copilot On' : 'Voice Off'}</span>
        </button>
      </div>
    </header>
  );
};
