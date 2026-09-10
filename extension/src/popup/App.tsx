import React, { useState, useEffect } from 'react';
import { HeaderBar } from '../components/HeaderBar';
import { VerdictCard } from '../components/VerdictCard';
import { ForensicProgress } from '../components/ForensicProgress';
import { EvidenceWhyList } from '../components/EvidenceWhyList';
import { UrlIntelligenceList } from '../components/UrlIntelligenceList';
import { InvestigationTimeline } from '../components/InvestigationTimeline';
import { ExtractedEmail, AnalysisVerdict, ExtensionState } from '../types/investigation';
import { tracexClient } from '../api/tracex-client';
import { Shield, Mail, RotateCw, ExternalLink, Bookmark, RefreshCw, AlertCircle } from 'lucide-react';

const DEMO_SAMPLES: Record<string, { label: string; tag: string; desc: string; data: ExtractedEmail }> = {
  bec: {
    label: 'Executive Wire Transfer Request',
    tag: 'BEC Lure',
    desc: 'Spoofed executive identity requesting urgent external funds transfer.',
    data: {
      source: 'gmail',
      sender: 'ceo-office@company-corp-urgent.com',
      senderName: 'CEO Executive Office',
      recipients: ['finance-director@enterprise.com'],
      subject: 'Urgent: Confidential Acquisition Wire Instruction',
      timestamp: new Date().toUTCString(),
      bodyText: 'Please process the attached wire transfer for $48,500 for our confidential acquisition before close of business today. Verify wire instructions at http://secure-wire-transfer-portal.ru/auth',
      urls: ['http://secure-wire-transfer-portal.ru/auth', 'https://bit.ly/3xUrgentInvoice'],
    },
  },
  sso: {
    label: 'Identity Provider Security Notice',
    tag: 'Credential Phish',
    desc: 'Lookalike single sign-on authentication portal soliciting credentials.',
    data: {
      source: 'outlook',
      sender: 'security-alert@okta-support-auth.com',
      senderName: 'Okta Identity Security',
      recipients: ['employee@enterprise.com'],
      subject: 'Security Alert: Suspicious Login Detected - Verify Credentials',
      timestamp: new Date().toUTCString(),
      bodyText: 'We detected an unauthorized sign-in attempt on your enterprise account. You must verify your MFA credentials: https://okta-login-verify-session.net/login?id=89234',
      urls: ['https://okta-login-verify-session.net/login?id=89234'],
    },
  },
  clean: {
    label: 'Weekly Threat Intelligence Digest',
    tag: 'Clean Baseline',
    desc: 'Standard organizational advisory with verified cryptographic signatures.',
    data: {
      source: 'gmail',
      sender: 'newsletter@security-bulletin.org',
      senderName: 'Cybersecurity Research Group',
      recipients: ['analyst@enterprise.com'],
      subject: 'Weekly Threat Intelligence Briefing: Issue #42',
      timestamp: new Date().toUTCString(),
      bodyText: 'Welcome to this week\'s threat briefing. In this issue we explore defensive strategies for zero-trust architectures and cloud workload protections.',
      urls: ['https://security-bulletin.org/digest-42'],
    },
  },
};

export const App: React.FC = () => {
  const [state, setState] = useState<ExtensionState>({ status: 'NO_EMAIL_DETECTED' });
  const [analyzingStep, setAnalyzingStep] = useState(1);
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isScanningTab, setIsScanningTab] = useState(false);
  const [tabDomain, setTabDomain] = useState<string>('');

  const scanForActiveEmail = () => {
    setIsScanningTab(true);

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.url) {
          try {
            setTabDomain(new URL(activeTab.url).hostname);
          } catch {
            setTabDomain('');
          }
        }

        if (activeTab?.id) {
          chrome.tabs.sendMessage(activeTab.id, { type: 'EXTRACT_EMAIL' }, (response) => {
            setIsScanningTab(false);
            if (!chrome.runtime.lastError && response?.email && response.email.sender) {
              setState({
                status: 'EMAIL_DETECTED',
                email: response.email,
              });
              return;
            }
            queryBackgroundAndStorage();
          });
          return;
        }
        setIsScanningTab(false);
        queryBackgroundAndStorage();
      });
    } else {
      setIsScanningTab(false);
      queryBackgroundAndStorage();
    }
  };

  const queryBackgroundAndStorage = () => {
    if (typeof chrome === 'undefined' || !chrome.runtime) return;

    chrome.runtime.sendMessage({ type: 'GET_CURRENT_EMAIL' }, (response) => {
      if (response?.email && response.email.sender) {
        if (response.verdict) {
          setState({
            status: 'ANALYZED',
            email: response.email,
            verdict: response.verdict,
          });
        } else {
          setState({
            status: 'EMAIL_DETECTED',
            email: response.email,
          });
        }
      } else {
        chrome.storage?.local?.get(['tracex_last_email'], (stored) => {
          if (stored?.tracex_last_email && stored.tracex_last_email.sender) {
            setState({
              status: 'EMAIL_DETECTED',
              email: stored.tracex_last_email,
            });
          }
        });
      }
    });
  };

  useEffect(() => {
    scanForActiveEmail();
  }, []);

  const handleRunAnalysis = async (email: ExtractedEmail) => {
    setState({ status: 'ANALYZING', step: 1, stepText: 'Initializing analysis', email });

    const interval = setInterval(() => {
      setAnalyzingStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 450);

    try {
      const verdict = await tracexClient.analyzeEmail(email);
      clearInterval(interval);
      setState({ status: 'ANALYZED', email, verdict });
    } catch (err: any) {
      clearInterval(interval);
      setState({
        status: 'ERROR',
        message: err.message || 'Unable to complete forensic analysis.',
        email,
      });
    }
  };

  const handleLoadDemoSample = (sampleKey: string) => {
    const sample = DEMO_SAMPLES[sampleKey];
    if (sample) {
      setState({
        status: 'EMAIL_DETECTED',
        email: sample.data,
      });
    }
  };

  const handleOpenDashboard = (verdict?: AnalysisVerdict) => {
    const targetUrl = verdict?.deep_link_url || 'http://localhost:5173/?tab=email_forensics';
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: targetUrl });
    } else {
      window.open(targetUrl, '_blank');
    }
  };

  const handleReportSuspicious = () => {
    setIsReporting(true);
    setTimeout(() => {
      setIsReporting(false);
      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 2500);
    }, 500);
  };

  const isWebmail = tabDomain.includes('mail.google.com') || tabDomain.includes('outlook') || tabDomain.includes('office');

  return (
    <div className="flex flex-col min-h-[500px] bg-[#0E1013] text-slate-100 font-sans antialiased select-none">
      <HeaderBar online={state.status !== 'ERROR'} />

      <main className="flex-1 p-3.5 space-y-3.5 overflow-y-auto">
        {/* State 1: NO EMAIL DETECTED */}
        {state.status === 'NO_EMAIL_DETECTED' && (
          <div className="py-1 space-y-3 animate-fade-in">
            <div className="p-3.5 rounded bg-[#13161A] border border-[#262C34] text-center space-y-2.5">
              <div className="w-8 h-8 rounded bg-[#181B20] border border-[#2D333B] flex items-center justify-center mx-auto text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-200 uppercase tracking-tight">
                  No Active Message Detected
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                  {isWebmail ? (
                    <span>Open any email in your webmail tab to run automated forensic extraction.</span>
                  ) : (
                    <span>Sentinel activates inside Gmail and Outlook Web when viewing an email message.</span>
                  )}
                </p>
              </div>

              <div className="pt-1">
                <button
                  onClick={scanForActiveEmail}
                  disabled={isScanningTab}
                  className="px-3 py-1 rounded bg-[#181B20] border border-[#2D333B] hover:border-slate-400 text-slate-300 hover:text-slate-100 text-[11px] inline-flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isScanningTab ? 'animate-spin' : ''}`} />
                  <span>{isScanningTab ? 'Scanning...' : 'Scan Active Tab'}</span>
                </button>
              </div>
            </div>

            {/* Clean Test Artifacts */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-0.5">
                Demonstration Artifacts
              </div>

              <div className="space-y-1">
                {Object.entries(DEMO_SAMPLES).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => handleLoadDemoSample(key)}
                    className="w-full text-left p-2.5 rounded bg-[#13161A] border border-[#262C34] hover:border-slate-500 hover:bg-[#181B20] transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                        {item.label}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 px-1 py-0.2 rounded bg-[#1C2128]">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleOpenDashboard()}
              className="w-full py-2 rounded bg-[#16191E] border border-[#262C34] text-slate-300 hover:text-white hover:border-slate-400 text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Launch TRACE-X Workstation</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* State 2: EMAIL DETECTED — READY FOR ANALYSIS */}
        {state.status === 'EMAIL_DETECTED' && (
          <div className="space-y-3 animate-fade-in">
            <div className="p-3 rounded bg-[#13161A] border border-[#262C34] space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-[#1E2328] pb-1.5">
                <span className="uppercase font-medium font-mono">Artifact: {state.email.source}</span>
                <span className="text-amber-400 font-mono font-medium">Ready</span>
              </div>
              <div className="text-xs space-y-1">
                <div>
                  <div className="text-slate-500 text-[9px] font-mono">SENDER</div>
                  <div className="font-medium text-slate-200 truncate">{state.email.sender}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[9px] font-mono">SUBJECT</div>
                  <div className="font-medium text-slate-300 truncate">{state.email.subject}</div>
                </div>
              </div>
              {state.email.urls && state.email.urls.length > 0 && (
                <div className="text-[10px] text-slate-500 pt-1 border-t border-[#1E2328]">
                  Embedded links: <span className="text-slate-300 font-mono">{state.email.urls.length}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleRunAnalysis(state.email)}
              className="w-full py-2.5 rounded bg-slate-200 text-slate-900 hover:bg-white transition-colors text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Evaluate Security Threat</span>
            </button>

            <button
              onClick={scanForActiveEmail}
              className="w-full py-1 text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Rescan active tab</span>
            </button>
          </div>
        )}

        {/* State 3: ANALYZING */}
        {state.status === 'ANALYZING' && (
          <div className="py-2 space-y-3 animate-fade-in">
            <ForensicProgress currentStep={analyzingStep} />
          </div>
        )}

        {/* State 4: ANALYZED */}
        {state.status === 'ANALYZED' && (
          <div className="space-y-3 animate-fade-in">
            <VerdictCard
              verdict={state.verdict}
              onOpenDashboard={() => handleOpenDashboard(state.verdict)}
            />

            <EvidenceWhyList
              findings={state.verdict.findings}
              authStatus={state.verdict.authentication}
            />

            <UrlIntelligenceList
              urls={state.verdict.extracted_urls}
              onOpenDashboard={() => handleOpenDashboard(state.verdict)}
            />

            <InvestigationTimeline />

            {/* Secondary Action */}
            <div className="pt-2 border-t border-[#1E2328] flex items-center justify-between text-xs">
              <button
                onClick={handleReportSuspicious}
                disabled={isReporting}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Bookmark className="w-3 h-3 text-slate-400" />
                <span>{reportSuccess ? 'Evidence Recorded' : 'Mark for Review'}</span>
              </button>

              <button
                onClick={() => handleRunAnalysis(state.email)}
                title="Re-run Analysis"
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-[#181B20]"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* State 5: ERROR */}
        {state.status === 'ERROR' && (
          <div className="p-3.5 rounded bg-[#1A1215] border border-rose-900/50 space-y-2.5 text-xs animate-fade-in">
            <div className="flex items-center gap-2 text-rose-300 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Analysis Unverified</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {state.message}
            </p>
            {state.email && (
              <button
                onClick={() => handleRunAnalysis(state.email!)}
                className="w-full py-1.5 rounded bg-[#201518] border border-rose-900/60 hover:border-rose-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 mt-1"
              >
                <RotateCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
