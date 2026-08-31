import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { CaseDesk } from './components/case/CaseDesk';
import { EmailForensics } from './components/forensics/EmailForensics';
import { HeaderFlightRecorder } from './components/forensics/HeaderFlightRecorder';
import { IdentityDeceptionView } from './components/forensics/IdentityDeceptionView';
import { SocialEngineeringView } from './components/forensics/SocialEngineeringView';
import { UrlRedirectTracer } from './components/forensics/UrlRedirectTracer';
import { AttackGraphView } from './components/graph/AttackGraphView';
import { CampaignIntelligenceView } from './components/campaign/CampaignIntelligenceView';
import { GeoFinancialMapView } from './components/geo/GeoFinancialMapView';
import { ImpactLabView } from './components/lab/ImpactLabView';
import { ForensicRagCopilotView } from './components/ai/ForensicRagCopilotView';
import { EvidenceVaultView } from './components/vault/EvidenceVaultView';
import { ExecutiveRiskView } from './components/executive/ExecutiveRiskView';
import { BlockchainProofView } from './components/blockchain/BlockchainProofView';
import { AttachmentSandboxView } from './components/sandbox/AttachmentSandboxView';
import { InvestigationDrawer, EntityDetail } from './components/layout/InvestigationDrawer';
import { CaseTimelineBar } from './components/layout/CaseTimelineBar';
import { RisingLines } from './components/ui/RisingLines';
import { LandingPage } from './components/layout/LandingPage';
import { CaseDetail, UserRole } from './types';

export const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [cases, setCases] = useState<CaseDetail[]>([]);
  const [activeCase, setActiveCase] = useState<CaseDetail | null>(null);
  const [activeTab, setActiveTab] = useState<string>('case_desk');
  const [currentRole, setCurrentRole] = useState<UserRole>('SOC_ANALYST');
  const [voiceActive, setVoiceActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityDetail | null>(null);

  // Fetch Cases from FastAPI Backend
  const fetchCases = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/cases');
      const summaries = await res.json();
      
      // Fetch details for first case (CASE-204)
      if (summaries.length > 0) {
        const fullRes = await fetch(`http://127.0.0.1:8000/api/v1/cases/${summaries[0].case_id}`);
        const fullDetail = await fullRes.json();
        setCases([fullDetail]);
        setActiveCase(fullDetail);

        // Fetch remaining cases
        const allDetails = await Promise.all(
          summaries.map((s: any) => fetch(`http://127.0.0.1:8000/api/v1/cases/${s.case_id}`).then(r => r.json()))
        );
        setCases(allDetails);
      }
    } catch (e) {
      console.error("Error fetching cases from backend:", e);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSelectCase = (c: CaseDetail) => {
    setActiveCase(c);
  };

  const handleIngestNewEmail = async (file: File | null, rawText: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (rawText) formData.append('raw_text', rawText);

      const res = await fetch('http://127.0.0.1:8000/api/v1/cases/ingest', {
        method: 'POST',
        body: formData
      });
      const newCase = await res.json();
      setCases(prev => [newCase, ...prev]);
      setActiveCase(newCase);
      setActiveTab('email_forensics');
    } catch (e) {
      console.error("Ingestion failed:", e);
    } finally {
      setLoading(false);
    }
  };

  if (showLanding) {
    return <LandingPage onEnterWorkspace={(initialTab) => {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      setShowLanding(false);
    }} />;
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans antialiased relative overflow-hidden"
         style={{ background: '#000000' }}>
      
      {/* Background Laser lines & Particles - Magenta/Purple theme */}
      <RisingLines
        color="#d946ef"
        horizonColor="#a855f7"
        haloColor="#d946ef"
        riseSpeed={0.7}
        flowSpeed={0.4}
        flowDensity={85}
        horizonHeight={0.98}
        horizonIntensity={0.8}
        haloIntensity={0.2}
        circleScale={1.0}
      />

      {/* Workspace Entrance Transition Wrapper */}
      <div className="flex flex-col h-screen overflow-hidden fade-enter relative z-10">
        {/* Simplified Header & Role Switcher */}
        <Navbar
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          activeCase={activeCase}
          voiceActive={voiceActive}
          setVoiceActive={setVoiceActive}
        />

        <div className="flex flex-1 overflow-hidden relative">
          {/* Contextual Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentRole={currentRole}
            activeCase={activeCase}
          />

          {/* Primary Workstation Main Canvas (Translucent for glassmorphic effect) */}
          <div className="flex-1 flex flex-col overflow-hidden bg-black/45 backdrop-blur-[6px]">
            {/* Persistent Top Case Context Bar when investigating a specific module */}
            {activeCase && activeTab !== 'case_desk' && (
              <div className="bg-black/55 backdrop-blur-md border-b border-white/10 px-5 py-2 flex items-center justify-between font-mono text-xs z-20 shrink-0 select-none">
                <div className="flex items-center gap-3">
                  <span className="text-fuchsia-400 font-bold text-[13px]">{activeCase.case_id}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200 font-bold">{activeCase.title}</span>
                  <span className="text-slate-600">|</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                        style={{
                          background: activeCase.severity === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                          color: activeCase.severity === 'CRITICAL' ? '#fca5a5' : '#fcd34d',
                          border: `1px solid ${activeCase.severity === 'CRITICAL' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`
                        }}>
                    {activeCase.severity} RISK ({activeCase.threat_score.overall_score}/100)
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('case_desk')}
                  className="text-[11px] text-slate-400 hover:text-fuchsia-300 transition-colors flex items-center gap-1 font-mono font-bold"
                >
                  [ CHANGE CASE ]
                </button>
              </div>
            )}

            {/* Investigation View Canvas */}
            <main className="flex-1 overflow-y-auto">
              <div key={activeTab} className="animate-fade-in h-full">
                {activeTab === 'case_desk' && (
                  <CaseDesk
                    cases={cases}
                    activeCase={activeCase}
                    onSelectCase={handleSelectCase}
                    onIngestNewEmail={handleIngestNewEmail}
                    loading={loading}
                    onSelectTab={setActiveTab}
                  />
                )}

                {activeCase && (
                  <>
                    {activeTab === 'email_forensics' && <EmailForensics caseDetail={activeCase} />}
                    {activeTab === 'header_recorder' && <HeaderFlightRecorder caseDetail={activeCase} />}
                    {activeTab === 'identity_deception' && <IdentityDeceptionView caseDetail={activeCase} />}
                    {activeTab === 'social_engineering' && <SocialEngineeringView caseDetail={activeCase} />}
                    {activeTab === 'url_tracer' && <UrlRedirectTracer caseDetail={activeCase} />}
                    {activeTab === 'attachment_sandbox' && <AttachmentSandboxView caseDetail={activeCase} />}
                    {activeTab === 'attack_graph' && <AttackGraphView caseDetail={activeCase} />}
                    {activeTab === 'campaign_intel' && <CampaignIntelligenceView caseDetail={activeCase} />}
                    {activeTab === 'geo_financial' && <GeoFinancialMapView caseDetail={activeCase} />}
                    {activeTab === 'impact_lab' && <ImpactLabView caseDetail={activeCase} />}
                    {activeTab === 'ai_copilot' && <ForensicRagCopilotView caseDetail={activeCase} voiceActive={voiceActive} />}
                    {activeTab === 'blockchain_proof' && <BlockchainProofView caseDetail={activeCase} />}
                    {activeTab === 'evidence_vault' && <EvidenceVaultView caseDetail={activeCase} />}
                    {activeTab === 'executive_risk' && <ExecutiveRiskView caseDetail={activeCase} />}
                  </>
                )}
              </div>
            </main>

            {/* Persistent Telemetry Timeline Bar at bottom */}
            {activeCase && (
              <CaseTimelineBar
                activeCase={activeCase}
                onNavigateToTab={setActiveTab}
              />
            )}
          </div>
        </div>
      </div>

      {/* Universal Right-Side Investigation Drawer */}
      <InvestigationDrawer
        entity={selectedEntity}
        onClose={() => setSelectedEntity(null)}
        onNavigateToModule={setActiveTab}
      />
    </div>
  );
};

export default App;
