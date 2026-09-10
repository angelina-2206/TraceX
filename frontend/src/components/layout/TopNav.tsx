import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Shield, Mic, MicOff, Activity, X, Sun, Moon, Laptop } from 'lucide-react';
import { UserRole, CaseDetail } from '../../types';
import { TracexLogo } from '../common/TracexLogo';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

interface TopNavProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeCase: CaseDetail | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
}

const ROLES: { id: UserRole; label: string; desc: string }[] = [
  { id: 'SOC_ANALYST',  label: 'SOC Analyst',  desc: 'Technical triage — headers, indicators, infrastructure analysis' },
  { id: 'INVESTIGATOR', label: 'Investigator', desc: 'Deep correlation — attack graph, campaigns, evidence chain' },
  { id: 'EXECUTIVE',    label: 'Executive',    desc: 'Risk governance — impact analysis, exposure and audit ledger' },
];

const roleColor = (id: UserRole) =>
  id === 'SOC_ANALYST' ? '#10B981' : id === 'INVESTIGATOR' ? '#0284C7' : '#D97706';

interface MegaMenuDef {
  label: string;
  groups: {
    heading?: string;
    items: { label: string; desc?: string; tab: string }[];
  }[];
}

const SOC_MENUS: MegaMenuDef[] = [
  {
    label: 'Forensic Analysis',
    groups: [
      {
        heading: 'Email Investigation',
        items: [
          { label: 'Email Artifacts',    desc: 'Decompose MIME structure, analyse routing and authentication', tab: 'email_forensics' },
          { label: 'Header Flight Path', desc: 'Trace every relay hop with timestamp deltas and ASN attribution', tab: 'header_recorder' },
          { label: 'Identity Deception', desc: 'Detect spoofing via From, Reply-To and display-name analysis',  tab: 'identity_deception' },
          { label: 'Redirect Tracer',    desc: 'Unroll URL redirect chains and fingerprint destination domains',  tab: 'url_tracer' },
        ],
      },
    ],
  },
  {
    label: 'Threat Intelligence',
    groups: [
      {
        heading: 'Intelligence Modules',
        items: [
          { label: 'Geo & Financial Map', desc: 'Visualise infrastructure geography and financial trail',     tab: 'geo_financial' },
          { label: 'RAG Copilot',         desc: 'Retrieval-augmented AI query over ingested case evidence',   tab: 'ai_copilot' },
        ],
      },
    ],
  },
  {
    label: 'Evidence',
    groups: [
      {
        items: [
          { label: 'Overview Desk',    desc: 'Case summary, severity scores and ingest controls', tab: 'case_desk' },
          { label: 'Evidence Ingestion', desc: 'Ingest raw email headers or .eml files into the case ledger', tab: 'evidence_vault' },
        ],
      },
    ],
  },
];

const INVESTIGATOR_MENUS: MegaMenuDef[] = [
  {
    label: 'Forensic Analysis',
    groups: [
      {
        heading: 'Email Investigation',
        items: [
          { label: 'Email Artifacts',    desc: 'Full MIME decomposition with authentication verdicts', tab: 'email_forensics' },
          { label: 'Header Flight Path', desc: 'Relay trace with autonomous system attribution',      tab: 'header_recorder' },
          { label: 'Identity Deception', desc: 'Business email compromise and spoofing detection',    tab: 'identity_deception' },
          { label: 'Redirect Tracer',    desc: 'URL redirect chain unrolling and domain fingerprinting', tab: 'url_tracer' },
          { label: 'Attachment Sandbox', desc: 'Static detonation: entropy, YARA, embedded artefacts', tab: 'attachment_sandbox' },
        ],
      },
    ],
  },
  {
    label: 'Correlation',
    groups: [
      {
        heading: 'Deep Correlation',
        items: [
          { label: 'Attack Graph',    desc: 'Actor-infrastructure relationship visualisation across cases', tab: 'attack_graph' },
          { label: 'Campaign Intel',  desc: 'Cross-case campaign clustering and TTP pattern analysis',  tab: 'campaign_intel' },
          { label: 'Geo & Financial', desc: 'Infrastructure geography and financial trail mapping',     tab: 'geo_financial' },
          { label: 'Forensic Copilot', desc: 'RAG-powered AI over ingested evidence corpus',           tab: 'ai_copilot' },
          { label: 'Merkle Proofs',   desc: 'SHA-256 blockchain chain-of-custody verification',        tab: 'blockchain_proof' },
        ],
      },
    ],
  },
  {
    label: 'Evidence',
    groups: [
      {
        items: [
          { label: 'Overview',  desc: 'Case summary and navigation', tab: 'case_desk' },
          { label: 'Evidence',  desc: 'Evidence vault and ingestion', tab: 'evidence_vault' },
        ],
      },
    ],
  },
];

const EXECUTIVE_MENUS: MegaMenuDef[] = [
  {
    label: 'Governance',
    groups: [
      {
        heading: 'Executive View',
        items: [
          { label: 'Executive Risk Dashboard', desc: 'Overall risk scoring and affected entity exposure summary', tab: 'executive_risk' },
          { label: 'Financial Exposure Map',   desc: 'Geographic and financial trail for risk quantification',   tab: 'geo_financial' },
          { label: 'Audit Ledger',             desc: 'SHA-256 Merkle tree chain-of-custody verification',        tab: 'blockchain_proof' },
          { label: 'Evidence Vault',           desc: 'Court-admissible evidence store and export controls',      tab: 'evidence_vault' },
        ],
      },
    ],
  },
  {
    label: 'Intelligence',
    groups: [
      {
        items: [
          { label: 'Case Desk Overview',   desc: 'High-level case summary and intake controls', tab: 'case_desk' },
          { label: 'Executive AI Advisory', desc: 'AI-driven risk narrative and recommendation engine', tab: 'ai_copilot' },
        ],
      },
    ],
  },
];

function getMenusForRole(role: UserRole): MegaMenuDef[] {
  if (role === 'INVESTIGATOR') return INVESTIGATOR_MENUS;
  if (role === 'EXECUTIVE') return EXECUTIVE_MENUS;
  return SOC_MENUS;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentRole, setCurrentRole, activeCase, activeTab, setActiveTab, voiceActive, setVoiceActive,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [personaOpen, setPersonaOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navRef = useRef<HTMLDivElement>(null);
  const activeRole = ROLES.find(r => r.id === currentRole) || ROLES[0];
  const menus = getMenusForRole(currentRole);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setPersonaOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setOpenMenu(null);
    setPersonaOpen(false);
  };

  const severityBadgeClass =
    activeCase?.severity === 'CRITICAL' ? 'badge-critical' :
    activeCase?.severity === 'HIGH'     ? 'badge-high' : 'badge-safe';

  return (
    <div ref={navRef} className="relative z-50 select-none">
      {/* ── Main Header Bar ── */}
      <header className="tracex-topnav flex items-center justify-between px-6" style={{ height: '60px' }}>

        {/* LEFT: Persona + Logo */}
        <div className="flex items-center gap-0">
          {/* Persona Selector */}
          <div className="relative mr-6">
            <button
              onClick={() => { setPersonaOpen(v => !v); setOpenMenu(null); }}
              className="px-3 py-1.5 rounded-md border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: roleColor(currentRole) }} />
              <span>{activeRole.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${personaOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`tracex-dropdown tracex-persona-dropdown ${personaOpen ? 'tracex-dropdown-open' : ''}`}>
              <div className="tracex-dropdown-header">Analyst Perspective</div>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => { setCurrentRole(r.id); setPersonaOpen(false); }}
                  className={`tracex-persona-item ${currentRole === r.id ? 'tracex-persona-item-active' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: roleColor(r.id) }} />
                    <span className="tracex-persona-label">{r.label}</span>
                    {currentRole === r.id && <span className="tracex-active-badge">Active</span>}
                  </div>
                  <p className="tracex-persona-desc">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Logo / Brand */}
          <div className="flex items-center pr-8 border-r border-white/20">
            <TracexLogo size="md" showSubtitle={false} />
          </div>
        </div>

        {/* CENTRE: Mega-nav links */}
        <nav className="hidden lg:flex items-stretch gap-0 h-full">
          {menus.map(menu => (
            <div key={menu.label} className="relative flex items-center">
              <button
                onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
                className={`tracex-nav-link ${openMenu === menu.label ? 'tracex-nav-link-active' : ''}`}
              >
                {menu.label}
                <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${openMenu === menu.label ? 'rotate-180' : ''}`} />
              </button>
            </div>
          ))}
          <button
            onClick={() => handleTabClick('case_desk')}
            className={`tracex-nav-link ${activeTab === 'case_desk' ? 'tracex-nav-link-active' : ''}`}
          >
            Case Desk
          </button>
        </nav>

        {/* RIGHT: Status + Theme Toggle + Controls */}
        <div className="flex items-center gap-3">
          {/* Active case badge */}
          {activeCase ? (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 border border-white/20 text-xs">
              <span className="font-semibold text-white">{activeCase.case_id}</span>
              <span className="opacity-40">|</span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${severityBadgeClass}`}>
                {activeCase.severity} · {activeCase.threat_score?.overall_score ?? '—'}/100
              </span>
            </div>
          ) : (
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-white/70">
              <Activity className="w-3.5 h-3.5" />
              <span>No active case</span>
            </div>
          )}

          {/* Theme Toggle Button (Light / System / Dark) */}
          <div className="flex items-center bg-white/10 border border-white/20 rounded-md p-0.5">
            <button
              onClick={() => setTheme('light')}
              title="Light Mode"
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${theme === 'light' ? 'bg-white text-slate-900 font-semibold' : 'text-white/80 hover:text-white'}`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Light</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              title="System Theme"
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${theme === 'system' ? 'bg-white text-slate-900 font-semibold' : 'text-white/80 hover:text-white'}`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Auto</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              title="Dark Mode"
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${theme === 'dark' ? 'bg-white text-slate-900 font-semibold' : 'text-white/80 hover:text-white'}`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Dark</span>
            </button>
          </div>

          <button
            onClick={() => setVoiceActive(!voiceActive)}
            className={`px-3 py-1.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              voiceActive
                ? 'bg-teal-500 text-slate-950 border-teal-300'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
            title={voiceActive ? 'Disable copilot' : 'Enable copilot'}
          >
            {voiceActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{voiceActive ? 'Copilot On' : 'Copilot'}</span>
          </button>
        </div>
      </header>

      {/* ── Mega-Menu Panel ── */}
      {openMenu && (() => {
        const menu = menus.find(m => m.label === openMenu);
        if (!menu) return null;
        return (
          <div className="tracex-megamenu">
            <div className="tracex-megamenu-inner">
              <div className="flex justify-between items-start mb-6">
                <h3 className="tracex-megamenu-title">{menu.label}</h3>
                <button onClick={() => setOpenMenu(null)} className="tracex-megamenu-close">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {menu.groups.map((group, gi) => (
                <div key={gi} className="mb-6 last:mb-0">
                  {group.heading && (
                    <div className="tracex-megamenu-group-heading">{group.heading}</div>
                  )}
                  <div className="tracex-megamenu-grid">
                    {group.items.map(item => (
                      <button
                        key={item.tab}
                        onClick={() => handleTabClick(item.tab)}
                        className={`tracex-megamenu-item ${activeTab === item.tab ? 'tracex-megamenu-item-active' : ''}`}
                      >
                        <span className="tracex-megamenu-item-label">{item.label}</span>
                        {item.desc && <span className="tracex-megamenu-item-desc">{item.desc}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
