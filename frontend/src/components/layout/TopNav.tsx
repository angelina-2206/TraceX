import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Shield, Mic, MicOff, Activity, X } from 'lucide-react';
import { UserRole, CaseDetail } from '../../types';
import { TracexLogo } from '../common/TracexLogo';

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
  id === 'SOC_ANALYST' ? '#34d399' : id === 'INVESTIGATOR' ? '#38bdf8' : '#fbbf24';

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

  const severityColor =
    activeCase?.severity === 'CRITICAL' ? '#ef4444' :
    activeCase?.severity === 'HIGH'     ? '#f59e0b' : '#10b981';

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
              className="tracex-persona-btn flex items-center gap-2"
            >
              <span className="tracex-persona-dot" style={{ background: roleColor(currentRole) }} />
              <span>{activeRole.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 tracex-chevron ${personaOpen ? 'rotate-180' : ''}`} />
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
                    <span className="tracex-persona-dot" style={{ background: roleColor(r.id) }} />
                    <span className="tracex-persona-label">{r.label}</span>
                    {currentRole === r.id && <span className="tracex-active-badge">Active</span>}
                  </div>
                  <p className="tracex-persona-desc">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Logo / Brand */}
          <div className="flex items-center pr-8 border-r tracex-divider">
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
                <ChevronDown className={`w-3.5 h-3.5 tracex-chevron ${openMenu === menu.label ? 'rotate-180' : ''}`} />
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

        {/* RIGHT: Status + Controls */}
        <div className="flex items-center gap-3">
          {/* Active case pill */}
          {activeCase ? (
            <div className="hidden xl:flex items-center gap-2 tracex-case-badge">
              <span className="tracex-status-dot" style={{ background: severityColor }} />
              <span className="font-mono font-semibold text-xs text-white">{activeCase.case_id}</span>
              <span className="text-gray-500">|</span>
              <span className="font-mono text-xs font-semibold uppercase" style={{ color: severityColor }}>
                {activeCase.severity} {activeCase.threat_score?.overall_score ?? '—'}/100
              </span>
            </div>
          ) : (
            <div className="hidden xl:flex items-center gap-1.5 tracex-no-case">
              <Activity className="w-3.5 h-3.5" />
              <span>No active case</span>
            </div>
          )}

          <button
            onClick={() => setVoiceActive(!voiceActive)}
            className={`tracex-control-btn ${voiceActive ? 'tracex-control-btn-active' : ''}`}
            title={voiceActive ? 'Disable copilot' : 'Enable copilot'}
          >
            {voiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
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
