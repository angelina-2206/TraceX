import React from 'react';
import {
  Shield, Cpu, Blocks, Mail, Route, Lock, ArrowRight,
  Terminal, Globe, Activity, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';
import { RisingLines } from '../ui/RisingLines';

interface LandingPageProps {
  onEnterWorkspace: (initialTab?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterWorkspace }) => {
  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans antialiased relative overflow-x-hidden"
         style={{ background: '#000000' }}>
      
      {/* Laser line background effect - Pink/Magenta color matching user reference */}
      <RisingLines
        color="#d946ef" // magenta
        horizonColor="#a855f7" // purple
        haloColor="#d946ef"
        riseSpeed={0.7}
        flowSpeed={0.4}
        flowDensity={85}
        horizonHeight={0.98} // horizon at the very bottom edge
        horizonIntensity={0.8}
        haloIntensity={0.2}
        circleScale={1.0}
      />

      {/* ── Floating Glassmorphic Navbar ── */}
      <div className="w-full px-4 sm:px-8 pt-5 relative z-50 shrink-0">
        <header className="h-14 max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-8 rounded-full border border-white/10 bg-black/45 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all hover:border-white/15">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500/20 to-purple-500/10 border border-fuchsia-500/40 shadow-[0_0_10px_rgba(217,70,239,0.15)]">
                <Shield className="w-3.5 h-3.5 text-fuchsia-400" />
              </div>
              <span className="text-sm font-bold tracking-widest font-mono text-slate-100">
                SENTINEL<span className="text-fuchsia-400">.TRACE-X</span>
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
                  className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors font-mono cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
              <a
                href="https://pro.reactbits.dev/docs/components/rising-lines"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors font-mono cursor-pointer"
              >
                Documentation
              </a>
            </nav>
          </div>

          <button
            onClick={() => onEnterWorkspace()}
            className="px-4 py-1.5 cut-corners-sm text-[10px] font-bold font-mono transition-all border border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/20 hover:text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.15)]"
          >
            LAUNCH WORKSPACE
          </button>
        </header>
      </div>

      {/* ── Hero Section ── */}
      <section className="relative pt-24 pb-20 px-6 sm:px-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto z-10 flex-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 cut-corners bg-fuchsia-950/20 border border-fuchsia-500/30 text-fuchsia-400 font-mono text-[10px] tracking-wider animate-pulse">
          <Activity className="w-3.5 h-3.5" />
          ACTIVE CRYPTOGRAPHIC CHAIN ONLINE
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-balance text-slate-100">
          Sentinel Trace-X <br />
          <span className="bg-gradient-to-r from-fuchsia-400 via-fuchsia-300 to-purple-500 bg-clip-text text-transparent">
            Forensic Mail Security Lab
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base leading-relaxed text-slate-400 max-w-2xl text-balance">
          An academic forensic prototype designed to trace headers delivery flows, inspect email message hops, run isolated attachment analysis, and simulate secure chain of custody blocks.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => onEnterWorkspace()}
            className="px-6 py-2.5 cut-corners text-xs font-bold font-mono transition-all border border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/20 hover:text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.15)]"
          >
            ENTER FORENSIC LAB
          </button>
        </div>
      </section>



      {/* ── Core Feature Blocks ── */}
      <section className="px-6 sm:px-10 pb-24 relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'MIME Forensics Lab',
            desc: 'Analyze mail envelope routing paths, SPF/DKIM/DMARC headers, and display name lookalike homoglyphs.',
            icon: Mail,
            color: 'cyan',
            tab: 'email_forensics'
          },
          {
            title: 'Detonation Sandbox',
            desc: 'Isolate attachments in a read-only environment to compute entropy, compile YARA matches, and dissect payloads.',
            icon: Cpu,
            color: 'purple',
            tab: 'attachment_sandbox'
          },
          {
            title: 'Merkle Chain of Custody',
            desc: 'Anchor evidence hashes directly onto a decentralised SHA-256 ledger to preserve tamper-evident digital records.',
            icon: Blocks,
            color: 'green',
            tab: 'blockchain_proof'
          }
        ].map((feat, i) => {
          const Icon = feat.icon;
          const style = 
            feat.color === 'cyan' ? 'border-cyan-500/20 bg-cyan-950/5' :
            feat.color === 'purple' ? 'border-purple-500/20 bg-purple-950/5' :
            'border-emerald-500/20 bg-emerald-950/5';
          
          return (
            <div
              key={i}
              className={`p-6 cut-corners border flex flex-col justify-between h-56 transition-all hover:translate-y-[-2px] ${style}`}
            >
              <div>
                <div className="w-8 h-8 flex items-center justify-center cut-corners-sm bg-slate-950/80 border border-slate-900 mb-4">
                  <Icon className="w-4 h-4" style={{ color: feat.color === 'cyan' ? '#06b6d4' : feat.color === 'purple' ? '#a855f7' : '#10b981' }} />
                </div>
                <h3 className="text-sm font-bold text-slate-100 font-mono mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold font-mono text-slate-500 hover:text-slate-300 cursor-pointer" onClick={() => onEnterWorkspace(feat.tab)}>
                EXPLORE MODULE <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-white/10 bg-[#080c14] relative z-10 font-sans text-slate-400">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
                TX
              </div>
              <span className="font-mono font-bold text-sm tracking-widest text-slate-100">
                TRACE<span className="text-cyan-400">-X</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Sentinel Cyber Forensics & Immutable Email Threat Intelligence Platform. Progressive evidence discovery and blockchain chain-of-custody.
            </p>
          </div>

          {/* Col 2: Modules */}
          <div className="space-y-2 font-mono text-[11px]">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">INVESTIGATION MODULES</div>
            <ul className="space-y-1.5 text-slate-400">
              <li><button onClick={() => onEnterWorkspace('email_forensics')} className="hover:text-cyan-400 transition-colors">Case Desk Intake</button></li>
              <li><button onClick={() => onEnterWorkspace('email_forensics')} className="hover:text-cyan-400 transition-colors">Header Flight Recorder</button></li>
              <li><button onClick={() => onEnterWorkspace('email_forensics')} className="hover:text-cyan-400 transition-colors">Identity Deception Lab</button></li>
              <li><button onClick={() => onEnterWorkspace('email_forensics')} className="hover:text-cyan-400 transition-colors">Attack Map Reconstruction</button></li>
              <li><button onClick={() => onEnterWorkspace('blockchain_proof')} className="hover:text-cyan-400 transition-colors">Evidence Vault & Blockchain</button></li>
            </ul>
          </div>

          {/* Col 3: Architecture */}
          <div className="space-y-2 font-mono text-[11px]">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">PLATFORM ARCHITECTURE</div>
            <ul className="space-y-1.5 text-slate-400">
              <li>MIME Parsing Engine v2.0</li>
              <li>SHA-256 Merkle Proof System</li>
              <li>Vector RAG Copilot (FAISS / Hybrid)</li>
              <li>Isolated Payload Sandboxing</li>
              <li>Polygon / Hyperledger Ledger</li>
            </ul>
          </div>

          {/* Col 4: Live Telemetry */}
          <div className="space-y-2 font-mono text-[11px]">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">LIVE LAB TELEMETRY</div>
            <div className="p-3 cut-corners bg-black/50 border border-white/10 space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">STATUS:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">INTEGRITY:</span>
                <span className="text-cyan-400">SHA-256 SEALED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">BACKEND:</span>
                <span className="text-slate-300">FASTAPI 0.110</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] font-mono text-slate-500">
          <div>© 2026 SENTINEL TRACE-X FORENSICS. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">PRIVACY POLICY</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">TERMS OF SERVICE</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">SECURITY DISCLOSURE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
