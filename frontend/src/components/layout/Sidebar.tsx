import React from 'react';
import {
  FolderKanban, Mail, Route, ShieldAlert, Sparkles,
  Link, Paperclip, Network, Globe, DollarSign, Activity,
  Lock, FileText, Blocks, Zap, ChevronRight, Upload, Search, CheckCircle2, Circle
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
  // Navigation categories mapping cleanly to the 5 investigation stages
  const STAGES = [
    {
      group: 'CASES',
      items: [
        { id: 'case_desk', label: 'Case Desk', icon: FolderKanban, roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] },
      ]
    },
    {
      group: 'ANALYZE',
      items: [
        { id: 'email_forensics', label: 'Email', icon: Mail, roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] },
        { id: 'header_recorder', label: 'Header Path', icon: Route, roles: ['SOC_ANALYST', 'INVESTIGATOR'] },
        { id: 'identity_deception', label: 'Identity', icon: ShieldAlert, roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] },
        { id: 'url_tracer', label: 'Links', icon: Link, roles: ['SOC_ANALYST', 'INVESTIGATOR'] },
        { id: 'attachment_sandbox', label: 'Attachments', icon: Paperclip, roles: ['SOC_ANALYST', 'INVESTIGATOR'] },
      ]
    },
    {
      group: 'TRACE',
      items: [
        { id: 'attack_graph', label: 'Attack Map', icon: Network, roles: ['SOC_ANALYST', 'INVESTIGATOR'] },
        { id: 'campaign_intel', label: 'Campaigns', icon: Globe, roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] },
        { id: 'geo_financial', label: 'Geo & Finance', icon: DollarSign, roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] },
      ]
    },
    {
      group: 'INVESTIGATE',
      items: [
        { id: 'ai_copilot', label: 'AI Investigator', icon: Sparkles, roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] },
        { id: 'impact_lab', label: 'Risk Simulator', icon: Activity, roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] },
      ]
    },
    {
      group: 'EVIDENCE',
      items: [
        { id: 'evidence_vault', label: 'Evidence', icon: FileText, roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] },
        { id: 'blockchain_proof', label: 'Chain of Custody', icon: Blocks, roles: ['SOC_ANALYST', 'INVESTIGATOR', 'EXECUTIVE'] },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-black/35 backdrop-blur-md border-r border-white/10 flex flex-col justify-between h-full shrink-0 select-none font-sans">
      <div className="flex-1 overflow-y-auto p-3 space-y-5">

        {/* ── BEFORE CASE SELECTION vs AFTER CASE SELECTION ── */}
        {!activeCase ? (
          /* BEFORE CASE SELECTION STATE */
          <div className="space-y-4 pt-1">
            <div className="px-2">
              <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider">
                INVESTIGATION ENVIRONMENT
              </span>
              <h2 className="text-sm font-bold font-mono text-slate-200 mt-1">TRACE-X WORKSTATION</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Select an active case below or ingest new evidence to begin investigation.
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-500 px-2 py-1">CASES</div>
              <button
                onClick={() => setActiveTab('case_desk')}
                className={`nav-item ${activeTab === 'case_desk' ? 'active' : ''}`}
              >
                <FolderKanban className="w-4 h-4 text-fuchsia-400" />
                <span>Case Desk</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-500 px-2 py-1">TOOLS</div>
              <button
                onClick={() => setActiveTab('case_desk')}
                className="nav-item text-slate-400 hover:text-slate-200"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Upload Evidence</span>
              </button>
              <button
                onClick={() => setActiveTab('case_desk')}
                className="nav-item text-slate-400 hover:text-slate-200"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Search Cases</span>
              </button>
            </div>
          </div>
        ) : (
          /* AFTER CASE SELECTION STATE (INVESTIGATION RAIL) */
          <div className="space-y-5">
            {/* Active Case Banner */}
            <div className="p-3 cut-corners bg-black/40 border border-fuchsia-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-fuchsia-400">{activeCase.case_id}</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  {activeCase.severity}
                </span>
              </div>
              <h3 className="text-xs font-bold font-mono text-slate-100 line-clamp-1">
                {activeCase.title}
              </h3>
            </div>

            {/* Investigation Progress Rail */}
            <div className="p-3 cut-corners bg-black/20 border border-white/5 space-y-2 font-mono">
              <div className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">
                INVESTIGATION PROGRESS
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex items-center gap-2 text-fuchsia-400 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-fuchsia-400" />
                  <span>INGEST</span>
                  <span className="text-[9px] text-slate-500 ml-auto">Received</span>
                </div>
                <div className="flex items-center gap-2 text-fuchsia-400 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-fuchsia-400" />
                  <span>ANALYZE</span>
                  <span className="text-[9px] text-slate-500 ml-auto">7 signals</span>
                </div>
                <div className="flex items-center gap-2 text-fuchsia-400 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-fuchsia-400" />
                  <span>TRACE</span>
                  <span className="text-[9px] text-slate-500 ml-auto">4 links</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Circle className="w-3 h-3 text-slate-600" />
                  <span>CORRELATE</span>
                  <span className="text-[9px] text-slate-500 ml-auto">2 cases</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Circle className="w-3 h-3 text-slate-600" />
                  <span>PRESERVE</span>
                  <span className="text-[9px] text-slate-500 ml-auto">Sealed</span>
                </div>
              </div>
            </div>

            {/* 5 Investigation Stage Navigation Groups */}
            <div className="space-y-4">
              {STAGES.map((stageGroup) => (
                <div key={stageGroup.group} className="space-y-1">
                  <div className="text-[9px] font-mono font-bold text-slate-500 tracking-widest px-2 py-0.5 uppercase">
                    {stageGroup.group}
                  </div>
                  {stageGroup.items.map((item) => {
                    const isPermitted = item.roles.includes(currentRole);
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    if (!isPermitted) return null;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-fuchsia-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-white/10 font-mono text-[10px] bg-black/40 space-y-1.5">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CYBER LAB ONLINE</span>
          </div>
          <span className="text-slate-500 font-bold">v2.0</span>
        </div>
        <div className="flex items-center justify-between text-[9px] text-slate-500">
          <span>ENGINE: FASTAPI / RAG</span>
          <span className="text-fuchsia-400 font-bold">SHA-256</span>
        </div>
      </div>
    </aside>
  );
};
