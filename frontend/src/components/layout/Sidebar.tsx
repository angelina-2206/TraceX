import React from 'react';
import {
  LayoutDashboard,
  FileSearch,
  Mail,
  Route,
  UserRound,
  Link2,
  Paperclip,
  Network,
  Layers,
  Globe2
} from 'lucide-react';
import { UserRole, CaseDetail } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  activeCase: CaseDetail | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  activeCase
}) => {
  const getNavigationForRole = (role: UserRole) => {
    switch (role) {
      case 'EXECUTIVE':
        return [
          {
            group: 'EXECUTIVE GOVERNANCE',
            items: [
              { id: 'executive_risk', label: 'Executive Risk', icon: LayoutDashboard },
              { id: 'geo_financial', label: 'Financial Exposure', icon: Globe2 },
              { id: 'blockchain_proof', label: 'Audit Ledger', icon: Layers },
              { id: 'evidence_vault', label: 'Evidence Vault', icon: FileSearch },
            ]
          },
          {
            group: 'INTELLIGENCE',
            items: [
              { id: 'case_desk', label: 'Case Desk Overview', icon: LayoutDashboard },
              { id: 'ai_copilot', label: 'Executive AI Advisory', icon: UserRound },
            ]
          }
        ];
      case 'INVESTIGATOR':
        return [
          {
            group: 'WORKSPACE',
            items: [
              { id: 'case_desk', label: 'Overview', icon: LayoutDashboard },
              { id: 'evidence_vault', label: 'Evidence', icon: FileSearch },
            ]
          },
          {
            group: 'FORENSIC ANALYSIS',
            items: [
              { id: 'email_forensics', label: 'Email', icon: Mail },
              { id: 'header_recorder', label: 'Header Path', icon: Route },
              { id: 'identity_deception', label: 'Identity', icon: UserRound },
              { id: 'url_tracer', label: 'Links', icon: Link2 },
              { id: 'attachment_sandbox', label: 'Attachments', icon: Paperclip },
            ]
          },
          {
            group: 'DEEP CORRELATION',
            items: [
              { id: 'attack_graph', label: 'Attack Map', icon: Network },
              { id: 'campaign_intel', label: 'Campaigns', icon: Layers },
              { id: 'geo_financial', label: 'Geo & Finance', icon: Globe2 },
              { id: 'ai_copilot', label: 'Forensic RAG Copilot', icon: UserRound },
              { id: 'blockchain_proof', label: 'Merkle Proofs', icon: Layers },
            ]
          }
        ];
      case 'SOC_ANALYST':
      default:
        return [
          {
            group: 'TRIAGE WORKSPACE',
            items: [
              { id: 'case_desk', label: 'Overview Desk', icon: LayoutDashboard },
              { id: 'evidence_vault', label: 'Evidence Ingestion', icon: FileSearch },
            ]
          },
          {
            group: 'TECHNICAL ANALYSIS',
            items: [
              { id: 'email_forensics', label: 'Email Artifacts', icon: Mail },
              { id: 'header_recorder', label: 'Header Flight Path', icon: Route },
              { id: 'identity_deception', label: 'Identity Deception', icon: UserRound },
              { id: 'url_tracer', label: 'Redirect Tracer', icon: Link2 },
            ]
          },
          {
            group: 'THREAT INTELLIGENCE',
            items: [
              { id: 'geo_financial', label: 'Geo & Financial', icon: Globe2 },
              { id: 'ai_copilot', label: 'RAG Copilot', icon: UserRound },
            ]
          }
        ];
    }
  };

  const navigation = getNavigationForRole(currentRole);

  const roleLabels: Record<UserRole, { title: string; subtitle: string; badgeColor: string }> = {
    SOC_ANALYST: { title: 'SOC ANALYST', subtitle: 'Rapid Triage & Intake Workspace', badgeColor: 'border-emerald-500/40 text-emerald-400' },
    INVESTIGATOR: { title: 'INVESTIGATOR', subtitle: 'Deep Correlation & Trace Workspace', badgeColor: 'border-cyan-500/40 text-cyan-400' },
    EXECUTIVE: { title: 'EXECUTIVE / CISO', subtitle: 'Risk Governance & Exposure View', badgeColor: 'border-amber-500/40 text-amber-400' },
  };

  const currentRoleInfo = roleLabels[currentRole] || roleLabels.SOC_ANALYST;

  return (
    <aside className="w-56 bg-[#0B0D0F] border-r border-[#2A2E33] flex flex-col justify-between h-full shrink-0 select-none font-sans">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header / Brand */}
        <div className="p-4 border-b border-[#2A2E33]">
          <div className="text-white font-bold font-mono tracking-wide text-sm flex items-center justify-between">
            <span>TRACE-X</span>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${currentRoleInfo.badgeColor}`}>
              {currentRole}
            </span>
          </div>
          <div className="text-gray-500 font-mono text-[10px] uppercase tracking-wider mt-1 truncate" title={currentRoleInfo.subtitle}>
            {currentRoleInfo.subtitle}
          </div>
        </div>

        {/* Case Context (if active) */}
        {activeCase && (
          <div className="px-4 py-3 border-b border-[#2A2E33] bg-[#121518]/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-200 font-mono text-xs font-bold">{activeCase.case_id}</span>
              <span className={`text-[9px] font-mono font-bold uppercase ${
                activeCase.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {activeCase.severity}
              </span>
            </div>
            <div className="text-gray-400 text-xs truncate" title={activeCase.title}>
              {activeCase.title}
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        <nav className="p-3 space-y-5 mt-1">
          {navigation.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 pb-1 text-[9px] font-mono font-semibold text-gray-500 tracking-wider">
                {section.group}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors border-l-2 ${
                          isActive
                            ? 'bg-[#181C20] border-white text-white font-semibold'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#121518]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-gray-200' : 'text-gray-500'}`} />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-3.5 border-t border-[#2A2E33] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-gray-500 font-semibold tracking-wider">
            SYSTEM ONLINE
          </span>
        </div>
        <span className="text-[9px] font-mono text-gray-600">v2.4</span>
      </div>
    </aside>
  );
};
