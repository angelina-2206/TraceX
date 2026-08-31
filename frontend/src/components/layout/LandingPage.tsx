import React from 'react';
import {
  Shield, Cpu, Blocks, Mail, Route, Lock, ArrowRight,
  Terminal, Globe, Activity, CheckCircle2, ChevronRight
} from 'lucide-react';
import { RisingLines } from '../ui/RisingLines';

interface LandingPageProps {
  onEnterWorkspace: (initialTab?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterWorkspace }) => {
  return (
    <div className="min-h-screen text-[#F2F2F2] flex flex-col font-sans antialiased relative overflow-x-hidden"
         style={{ background: '#0B0D0F' }}>
      
      {/* Signature Ascending Lines - Monochrome Data Trajectory */}
      <RisingLines
        color="#FFFFFF"
        horizonColor="#4B5563"
        haloColor="#374151"
        riseSpeed={0.6}
        flowSpeed={0.2}
        flowDensity={40}
        horizonHeight={0.98}
        horizonIntensity={0.15}
        haloIntensity={0.08}
        circleScale={1.0}
      />

      {/* ── Navbar ── */}
      <div className="w-full px-4 sm:px-8 pt-5 relative z-50 shrink-0">
        <header className="h-14 max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-8 rounded-md border border-[#2A2E33] bg-[#121518] backdrop-blur-md">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 flex items-center justify-center rounded bg-[#181C20] border border-[#2A2E33]">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-widest font-mono text-white">
                SENTINEL<span className="text-gray-400">.TRACE-X</span>
              </span>
            </div>
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { label: 'Forensics Lab', tab: 'email_forensics' },
                { label: 'Detonation Sandbox', tab: 'attachment_sandbox' },
                { label: 'Chain of Custody', tab: 'blockchain_proof' },
                { label: 'Threat Intel', tab: 'campaign_intel' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => onEnterWorkspace(item.tab)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <button
            onClick={() => onEnterWorkspace()}
            className="px-4 py-1.5 rounded text-xs font-semibold bg-white text-black hover:bg-gray-200 transition-all"
          >
            Launch Workspace
          </button>
        </header>
      </div>

      {/* ── Hero Section ── */}
      <section className="relative pt-20 pb-16 px-6 sm:px-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto z-10 flex-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded bg-[#181C20] border border-[#2A2E33] text-gray-300 text-xs font-mono">
          <Activity className="w-3.5 h-3.5 text-gray-400" />
          Academic Cyber-Forensics Research Platform
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight text-balance">
          TRACE-X Forensic Platform
        </h1>

        <p className="mt-4 text-sm sm:text-base leading-relaxed text-gray-400 max-w-2xl text-balance">
          An enterprise digital forensics workstation for headers flow analysis, email relay tracing, attachment detonation sandboxing, and tamper-evident Merkle chain of custody.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => onEnterWorkspace()}
            className="px-6 py-2.5 rounded text-xs font-semibold bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            Enter Forensic Lab
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Core Feature Blocks ── */}
      <section className="px-6 sm:px-10 pb-20 relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            title: 'MIME Forensics Lab',
            desc: 'Decompose mail routing paths, analyze SPF/DKIM/DMARC headers, and detect display name homoglyphs.',
            icon: Mail,
            tab: 'email_forensics'
          },
          {
            title: 'Detonation Sandbox',
            desc: 'Isolate attachments in a read-only environment to compute entropy, compile YARA rules, and dissect payloads.',
            icon: Cpu,
            tab: 'attachment_sandbox'
          },
          {
            title: 'Merkle Chain of Custody',
            desc: 'Cryptographically hash evidence events onto a binary Merkle tree with verification path proofs.',
            icon: Blocks,
            tab: 'blockchain_proof'
          }
        ].map((feat, i) => {
          const Icon = feat.icon;
          
          return (
            <div
              key={i}
              className="p-6 rounded-md border border-[#2A2E33] bg-[#121518] flex flex-col justify-between h-52 transition-all hover:border-[#40464E]"
            >
              <div>
                <div className="w-8 h-8 flex items-center justify-center rounded bg-[#181C20] border border-[#2A2E33] mb-4">
                  <Icon className="w-4 h-4 text-gray-300" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>

              <div
                className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-white cursor-pointer"
                onClick={() => onEnterWorkspace(feat.tab)}
              >
                <span>Explore Module</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 border-t border-[#2A2E33] bg-[#0B0D0F] relative z-10 font-sans text-gray-400 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#181C20] border border-[#2A2E33] flex items-center justify-center text-white font-mono font-bold text-xs">
                TX
              </div>
              <span className="font-mono font-bold text-sm tracking-widest text-white">
                TRACE<span className="text-gray-400">-X</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Digital Forensics & Immutable Evidence Chain Platform.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">INVESTIGATION MODULES</div>
            <ul className="space-y-1 text-gray-400">
              <li><button onClick={() => onEnterWorkspace('email_forensics')} className="hover:text-white transition-colors">Case Desk Intake</button></li>
              <li><button onClick={() => onEnterWorkspace('email_forensics')} className="hover:text-white transition-colors">Header Flight Recorder</button></li>
              <li><button onClick={() => onEnterWorkspace('email_forensics')} className="hover:text-white transition-colors">Identity Deception</button></li>
              <li><button onClick={() => onEnterWorkspace('blockchain_proof')} className="hover:text-white transition-colors">Chain of Custody</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">ARCHITECTURE</div>
            <ul className="space-y-1 text-gray-400">
              <li>MIME Parsing Engine</li>
              <li>SHA-256 Merkle Proof System</li>
              <li>Qdrant Vector Engine</li>
              <li>FastAPI 0.110 Async Gateway</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">TELEMETRY</div>
            <div className="p-3 rounded bg-[#121518] border border-[#2A2E33] space-y-1 text-[11px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">STATUS:</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  ONLINE
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">INTEGRITY:</span>
                <span className="text-gray-200">SHA-256 SEALED</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-[#181C20] flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-gray-500 font-mono">
          <div>© 2026 TRACE-X FORENSICS WORKSTATION. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>
    </div>
  );
};
