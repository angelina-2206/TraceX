import React, { useState } from 'react';
import { Shield, ChevronDown, Mic, MicOff, Activity, UserCheck } from 'lucide-react';
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
    <header className="h-14 bg-[#121518] border-b border-[#2A2E33] px-5 flex items-center justify-between shrink-0 z-40 select-none">
      {/* ── Left: Brand & Active Case Context ── */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center rounded bg-[#181C20] border border-[#2A2E33]">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-mono tracking-widest text-white leading-none">
              TRACE<span className="text-gray-400">-X</span>
            </h1>
            <span className="text-[10px] font-mono text-gray-500 block mt-0.5">
              FORENSIC WORKSTATION
            </span>
          </div>
        </div>

        {/* Active Case Context */}
        {activeCase ? (
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded bg-[#181C20] border border-[#2A2E33] text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="flex items-center gap-2">
              <span className="text-gray-200 font-bold">{activeCase.case_id}</span>
              <span className="text-gray-600">|</span>
              <span className="font-bold uppercase text-[11px]" style={{ color: severityColor }}>
                {activeCase.severity} · {activeCase.threat_score.overall_score}/100
              </span>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-[#181C20] border border-[#2A2E33] text-xs text-gray-400 font-mono">
            <Activity className="w-3.5 h-3.5 text-gray-400" />
            <span>NO CASE SELECTED — INGEST EVIDENCE TO BEGIN</span>
          </div>
        )}
      </div>

      {/* ── Right: Role Switcher & Copilot Controls ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setVoiceActive(!voiceActive)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-all ${
            voiceActive
              ? 'bg-[#22262B] border border-[#40464E] text-white'
              : 'bg-[#181C20] border border-[#2A2E33] text-gray-400 hover:text-gray-200'
          }`}
        >
          {voiceActive ? (
            <Mic className="w-3.5 h-3.5 text-white" />
          ) : (
            <MicOff className="w-3.5 h-3.5 text-gray-500" />
          )}
          <span className="hidden sm:inline">{voiceActive ? 'COPILOT LIVE' : 'VOICE OFF'}</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#181C20] border border-[#2A2E33] hover:border-[#40464E] text-xs font-mono text-gray-200 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400">VIEW:</span>
            <span className="text-white font-semibold">{activeRoleObj.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#121518] border border-[#2A2E33] rounded p-2 shadow-xl z-50 animate-fade-in font-mono">
              <div className="text-[9px] font-semibold text-gray-500 px-2 py-1 uppercase tracking-wider">
                SELECT PERSPECTIVE ROLE
              </div>
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setCurrentRole(r.id);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded transition-all mb-1 last:mb-0 ${
                    currentRole === r.id
                      ? 'bg-[#181C20] border-l-2 border-white text-white font-semibold'
                      : 'hover:bg-[#181C20] text-gray-300'
                  }`}
                >
                  <div className="text-xs">{r.label}</div>
                  <div className="text-[10px] text-gray-400 font-sans mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
