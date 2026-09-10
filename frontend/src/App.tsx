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
import { CheckCircle2, Circle } from 'lucide-react';

export const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [cases, setCases] = useState<CaseDetail[]>([]);
  const [activeCase, setActiveCase] = useState<CaseDetail | null>(null);
  const [activeTab, setActiveTab] = useState<string>('case_desk');
  const [currentRole, setCurrentRole] = useState<UserRole>('SOC_ANALYST');
  const [voiceActive, setVoiceActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityDetail | null>(null);

  const fetchCases = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/cases');
      const summaries = await res.json();
      
      if (summaries.length > 0) {
        const fullRes = await fetch(`http://127.0.0.1:8000/api/v1/cases/${summaries[0].case_id}`);
        const fullDetail = await fullRes.json();
        setCases([fullDetail]);
        setActiveCase(fullDetail);

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

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'EXECUTIVE' && activeTab !== 'executive_risk' && activeTab !== 'geo_financial' && activeTab !== 'blockchain_proof' && activeTab !== 'evidence_vault' && activeTab !== 'ai_copilot') {
      setActiveTab('executive_risk');
    } else if (role === 'INVESTIGATOR' && activeTab === 'executive_risk') {
      setActiveTab('attack_graph');
    } else if (role === 'SOC_ANALYST' && (activeTab === 'executive_risk' || activeTab === 'attack_graph' || activeTab === 'campaign_intel' || activeTab === 'attachment_sandbox')) {
      setActiveTab('case_desk');
    }
  };

  return (
    <div className="min-h-screen text-[#F2F2F2] flex flex-col font-sans antialiased relative overflow-hidden"
         style={{ background: '#0B0D0F' }}>
      
      {/* Signature Ascending Lines - Monochrome Data Trajectory */}
      <RisingLines
        color="#FFFFFF"
        horizonColor="#6B7280"
        haloColor="#4B5563"
        riseSpeed={0.7}
        flowSpeed={0.25}
        flowDensity={55}
        horizonHeight={0.98}
        horizonIntensity={0.35}
        haloIntensity={0.12}
        circleScale={1.0}
      />

      <div className="flex flex-col h-screen overflow-hidden fade-enter relative z-10">
        {/* Compact Header & Role Switcher */}
        <Navbar
          currentRole={currentRole}
          setCurrentRole={handleRoleChange}
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

          {/* Primary Workstation Main Canvas */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0B0D0F]/90">
            {/* Top Workflow Indicator Bar inside main workspace when inspecting a case */}
            {activeCase && activeTab !== 'case_desk' && (
              <div className="bg-[#121518] border-b border-[#2A2E33] px-6 py-2.5 flex items-center justify-between font-mono text-xs z-20 shrink-0 select-none">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-sm">{activeCase.case_id}</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-gray-300 font-semibold">{activeCase.title}</span>
                </div>

                {/* Horizontal Investigation Progress Indicator */}
                <div className="hidden lg:flex items-center gap-4 text-[11px]">
                  <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>INGEST</span>
                  </div>
                  <span className="text-gray-700">──</span>
                  <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ANALYZE</span>
                  </div>
                  <span className="text-gray-700">──</span>
                  <div className="flex items-center gap-1 text-white font-bold">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>TRACE</span>
                  </div>
                  <span className="text-gray-700">──</span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Circle className="w-3 h-3 text-gray-600" />
                    <span>CORRELATE</span>
                  </div>
                  <span className="text-gray-700">──</span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Circle className="w-3 h-3 text-gray-600" />
                    <span>PRESERVE</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('case_desk')}
                  className="text-xs text-gray-400 hover:text-white transition-colors font-mono font-medium"
                >
                  Change Case →
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

                {(() => {
                  const currentCase = activeCase || cases[0];
                  if (!currentCase) return null;

                  return (
                    <>
                      {activeTab === 'email_forensics' && <EmailForensics caseDetail={currentCase} />}
                      {activeTab === 'header_recorder' && <HeaderFlightRecorder caseDetail={currentCase} />}
                      {activeTab === 'identity_deception' && <IdentityDeceptionView caseDetail={currentCase} />}
                      {activeTab === 'social_engineering' && <SocialEngineeringView caseDetail={currentCase} />}
                      {activeTab === 'url_tracer' && <UrlRedirectTracer caseDetail={currentCase} />}
                      {activeTab === 'attachment_sandbox' && <AttachmentSandboxView caseDetail={currentCase} />}
                      {activeTab === 'attack_graph' && <AttackGraphView caseDetail={currentCase} />}
                      {activeTab === 'campaign_intel' && <CampaignIntelligenceView caseDetail={currentCase} />}
                      {activeTab === 'geo_financial' && <GeoFinancialMapView caseDetail={currentCase} />}
                      {activeTab === 'impact_lab' && <ImpactLabView caseDetail={currentCase} />}
                      {activeTab === 'ai_copilot' && <ForensicRagCopilotView caseDetail={currentCase} voiceActive={voiceActive} />}
                      {activeTab === 'blockchain_proof' && <BlockchainProofView caseDetail={currentCase} />}
                      {activeTab === 'evidence_vault' && <EvidenceVaultView caseDetail={currentCase} />}
                      {activeTab === 'executive_risk' && <ExecutiveRiskView caseDetail={currentCase} />}
                    </>
                  );
                })()}
              </div>
            </main>

            {/* Compact & Expandable Telemetry Bar */}
            {activeCase && (
              <CaseTimelineBar
                activeCase={activeCase}
                onNavigateToTab={setActiveTab}
              />
            )}
          </div>
        </div>
      </div>

      <InvestigationDrawer
        entity={selectedEntity}
        onClose={() => setSelectedEntity(null)}
        onNavigateToModule={setActiveTab}
      />
    </div>
  );
};

export default App;
