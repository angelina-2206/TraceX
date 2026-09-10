import React, { useState, useEffect } from 'react';
import { TopNav } from './components/layout/TopNav';
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

  const fetchCases = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const deepLinkCaseId = urlParams.get('case') || urlParams.get('investigate');
      const deepLinkTab = urlParams.get('tab');

      const res = await fetch('http://127.0.0.1:8000/api/v1/cases');
      const summaries = await res.json();
      
      if (summaries.length > 0) {
        const allDetails = await Promise.all(
          summaries.map((s: any) => fetch(`http://127.0.0.1:8000/api/v1/cases/${s.case_id}`).then(r => r.json()))
        );
        setCases(allDetails);

        if (deepLinkCaseId) {
          const matched = allDetails.find((c: CaseDetail) => c.case_id.toLowerCase() === deepLinkCaseId.toLowerCase());
          if (matched) {
            setActiveCase(matched);
            setShowLanding(false);
            if (deepLinkTab) setActiveTab(deepLinkTab);
            else setActiveTab('email_forensics');
            return;
          } else {
            // Fetch case directly in case it was just captured by extension
            try {
              const specificRes = await fetch(`http://127.0.0.1:8000/api/v1/cases/${deepLinkCaseId}`);
              if (specificRes.ok) {
                const specificDetail = await specificRes.json();
                setCases(prev => [specificDetail, ...prev.filter(c => c.case_id !== specificDetail.case_id)]);
                setActiveCase(specificDetail);
                setShowLanding(false);
                if (deepLinkTab) setActiveTab(deepLinkTab);
                else setActiveTab('email_forensics');
                return;
              }
            } catch (err) {
              console.warn("Could not fetch deep linked case directly:", err);
            }
          }
        }

        setActiveCase(allDetails[0]);
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
    <div className="min-h-screen flex flex-col font-sans antialiased relative overflow-hidden" style={{ background: 'var(--canvas-bg)', color: 'var(--text-primary)' }}>

      {/* Subtle Rising Lines */}
      <RisingLines
        color="#FFFFFF"
        horizonColor="#1E3A5F"
        haloColor="#0F2040"
        riseSpeed={0.5}
        flowSpeed={0.2}
        flowDensity={48}
        horizonHeight={0.98}
        horizonIntensity={0.12}
        haloIntensity={0.07}
        circleScale={1.0}
      />


      <div className="flex flex-col h-screen overflow-hidden fade-enter relative z-10">
        {/* Top Navigation (replaces Navbar + Sidebar) */}
        <TopNav
          currentRole={currentRole}
          setCurrentRole={handleRoleChange}
          activeCase={activeCase}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          voiceActive={voiceActive}
          setVoiceActive={setVoiceActive}
        />

        {/* Primary Workstation Main Canvas - full width, no sidebar */}
        <div className="flex flex-1 overflow-hidden relative">
          <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--canvas-bg)' }}>
            {/* Case context bar */}
            {activeCase && activeTab !== 'case_desk' && (
              <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }} className="px-6 py-2.5 flex items-center justify-between font-mono text-xs z-20 shrink-0 select-none">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">{activeCase.case_id}</span>
                  <span style={{ color: 'var(--text-muted)' }}>|</span>
                  <span style={{ color: 'var(--text-secondary)' }} className="font-semibold">{activeCase.title}</span>
                </div>
                <button
                  onClick={() => setActiveTab('case_desk')}
                  className="text-xs font-medium transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseOver={e => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  Change Case
                </button>
              </div>
            )}

            {/* Investigation View Canvas */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full">
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
