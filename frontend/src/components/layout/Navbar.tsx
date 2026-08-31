import React, { useState } from 'react';
import { Shield, ChevronDown, Mic, MicOff, Activity, UserCheck, AlertTriangle } from 'lucide-react';
import { UserRole, CaseDetail } from '../../types';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeCase: CaseDetail | null;
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
}

const ROLES: { id: UserRole; label: string; desc: string }[] = [
  { id: 'SOC_ANALYST', label: 'SOC ANALYST', desc: 'Technical evidence, headers, indicators, infrastructure' },
  { id: 'INVESTIGATOR', label: 'INVESTIGATOR', desc: 'Relationships, attack graph, campaigns, evidence' },
  { id: 'EXECUTIVE', label: 'EXECUTIVE', desc: 'Risk score, impact analysis, affected entities' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  activeCase,
  voiceActive,
  setVoiceActive
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const activeRoleObj = ROLES.find(r => r.id === currentRole) || ROLES[0];

  const severityColor =
    activeCase?.severity === 'CRITICAL' ? '#ef4444' :
    activeCase?.severity === 'HIGH' ? '#f59e0b' : '#10b981';

  return (
    <header className="h-14 bg-black/50 backdrop-blur-md border-b border-white/10 px-5 flex items-center justify-between shrink-0 z-40 select-none">
      {/* ── Left: Brand & Persistent Active Case Context ── */}
      <div className="flex items-center gap-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center cut-corners bg-fuchsia-950/30 border border-fuchsia-500/40">
            <Shield className="w-4 h-4 text-fuchsia-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-mono tracking-widest text-slate-100 leading-none">
              TRACE<span className="text-fuchsia-400">-X</span>
            </h1>
            <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
              SENTINEL WORKSTATION
            </span>
          </div>
        </div>

        {/* Active Case Context Status */}
        {activeCase ? (
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 cut-corners bg-black/40 border border-white/10 font-mono text-xs">
            <div className="status-led status-led-cyan" />
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">{activeCase.case_id}</span>
              <span className="text-slate-600">|</span>
              <span className="font-bold uppercase text-[11px]" style={{ color: severityColor }}>
                {activeCase.severity} · {activeCase.threat_score.overall_score}/100
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              INVESTIGATION ACTIVE
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 cut-corners bg-black/40 border border-white/10 font-mono text-xs text-slate-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>NO CASE SELECTED — SELECT OR INGEST EVIDENCE</span>
          </div>
        )}
      </div>

      {/* ── Right: Controls & Role Switcher Dropdown ── */}
      <div className="flex items-center gap-3">
        {/* Voice Copilot Switch */}
        <button
          onClick={() => setVoiceActive(!voiceActive)}
          className={`flex items-center gap-2 px-3 py-1.5 cut-corners text-xs font-mono font-bold transition-all ${
            voiceActive
              ? 'bg-fuchsia-950/40 border border-fuchsia-500/50 text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.2)]'
              : 'bg-black/40 border border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          {voiceActive ? (
            <Mic className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
          ) : (
            <MicOff className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span className="hidden sm:inline">{voiceActive ? 'COPILOT LIVE' : 'VOICE OFF'}</span>
        </button>

        {/* Functional Role Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 cut-corners bg-black/40 border border-white/10 hover:border-white/20 text-xs font-mono font-bold text-slate-200 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="text-slate-400">VIEW:</span>
            <span className="text-fuchsia-300">{activeRoleObj.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Role Dropdown Menu */}
          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-black/85 backdrop-blur-md border border-white/10 cut-corners p-2 shadow-2xl z-50 animate-fade-in font-mono">
              <div className="text-[9px] font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">
                SELECT PERSPECTIVE ROLE
              </div>
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setCurrentRole(r.id);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 cut-corners-sm transition-all mb-1 last:mb-0 ${
                    currentRole === r.id
                      ? 'bg-fuchsia-950/40 border border-fuchsia-500/40 text-fuchsia-300'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{r.label}</div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
