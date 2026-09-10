import React, { useState, useRef, useEffect } from 'react';
import {
  Shield, Cpu, Blocks, Mail, Route, Lock, ArrowRight,
  Globe, Activity, ChevronRight, ChevronDown,
  FileSearch, Network, BookOpen, UserCheck, Sun, Moon, Laptop
} from 'lucide-react';
import { RisingLines } from '../ui/RisingLines';
import { TracexLogo } from '../common/TracexLogo';
import { useTheme } from '../../context/ThemeContext';

interface LandingPageProps {
  onEnterWorkspace: (initialTab?: string) => void;
}

const PERSONAS = [
  { label: 'SOC Analyst',  color: '#34d399', desc: 'Technical triage — headers, indicators, infrastructure analysis' },
  { label: 'Investigator', color: '#38bdf8', desc: 'Deep correlation — attack graph, campaigns, evidence chain'  },
  { label: 'Executive',    color: '#fbbf24', desc: 'Risk governance — impact analysis, exposure and audit ledger' },
];

const MODULES = [
  {
    title: 'Email Forensics Lab',
    desc: 'Decompose MIME structure, trace relay hops, verify SPF/DKIM/DMARC, detect display-name spoofing.',
    icon: Mail,
    tab: 'email_forensics',
  },
  {
    title: 'Header Flight Recorder',
    desc: 'Map every Received header into an ordered relay path with timestamp deltas and AS attribution.',
    icon: Route,
    tab: 'header_recorder',
  },
  {
    title: 'Identity Deception Analysis',
    desc: 'Cross-reference From, Reply-To and Return-Path to expose impersonation and business email compromise.',
    icon: UserCheck,
    tab: 'identity_deception',
  },
  {
    title: 'Detonation Sandbox',
    desc: 'Static analysis of attachments — entropy scoring, YARA signature matching, embedded artefact extraction.',
    icon: Cpu,
    tab: 'attachment_sandbox',
  },
  {
    title: 'Attack Graph Correlator',
    desc: 'Visualise actor-infrastructure relationships across cases to surface campaign patterns and shared TTPs.',
    icon: Network,
    tab: 'attack_graph',
  },
  {
    title: 'Merkle Chain of Custody',
    desc: 'Cryptographically anchor every evidence event into a SHA-256 Merkle tree with inclusion proof verification.',
    icon: Blocks,
    tab: 'blockchain_proof',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterWorkspace }) => {
  const [personaOpen, setPersonaOpen] = useState(false);
  const personaRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setPersonaOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased relative overflow-x-hidden bg-[var(--canvas-bg)] text-[var(--text-primary)]">

      {/* Background rising lines */}
      <RisingLines
        color="#FFFFFF"
        horizonColor="#1E3A5F"
        haloColor="#0F2040"
        riseSpeed={0.45}
        flowSpeed={0.16}
        flowDensity={35}
        horizonHeight={0.98}
        horizonIntensity={0.08}
        haloIntensity={0.05}
        circleScale={1.0}
      />

      {/* ── Top Navigation ── */}
      <div className="w-full px-5 sm:px-8 pt-5 relative z-50 shrink-0">
        <header className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-6 rounded-lg tracex-topnav" style={{ height: '60px' }}>
          {/* Left: Persona + Brand */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={personaRef}>
              <button
                onClick={() => setPersonaOpen(v => !v)}
                className="px-3 py-1.5 rounded-md border border-white/20 bg-white/10 text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Analyst Perspective</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${personaOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className={`tracex-dropdown tracex-persona-dropdown ${personaOpen ? 'tracex-dropdown-open' : ''}`}>
                <div className="tracex-dropdown-header">Select your analyst role</div>
                {PERSONAS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { onEnterWorkspace(); setPersonaOpen(false); }}
                    className="tracex-persona-item"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                      <span className="tracex-persona-label">{p.label}</span>
                    </div>
                    <p className="tracex-persona-desc">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden sm:flex items-center pl-4 border-l border-white/20">
              <TracexLogo size="md" showSubtitle={false} />
            </div>
          </div>

          {/* Centre nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { label: 'Forensics Lab',    tab: 'email_forensics'   },
              { label: 'Sandbox',          tab: 'attachment_sandbox' },
              { label: 'Chain of Custody', tab: 'blockchain_proof'  },
              { label: 'Campaign Intel',   tab: 'campaign_intel'    },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => onEnterWorkspace(item.tab)}
                className="tracex-nav-link"
                style={{ height: '40px' }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Controls: Theme + CTA */}
          <div className="flex items-center gap-3">
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
              onClick={() => onEnterWorkspace()}
              className="btn-primary text-xs py-2 px-4"
            >
              Open Workspace
            </button>
          </div>
        </header>
      </div>

      {/* ── Hero ── */}
      <section className="relative pt-20 pb-16 px-6 sm:px-10 flex flex-col items-center text-center max-w-4xl mx-auto z-10 flex-1 w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full text-xs font-semibold bg-[var(--surface-2)] border border-[var(--border)] text-[var(--blue-primary)]">
          <BookOpen className="w-3.5 h-3.5" />
          Academic & National Cyber-Forensics Research Platform
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5 text-[var(--text-primary)]">
          TRACE-X Forensic Platform
        </h1>

        <p className="text-base leading-relaxed max-w-2xl mb-2 text-[var(--text-secondary)]">
          A structured digital forensics workstation for email header analysis, relay path tracing,
          attachment detonation, and tamper-evident chain of custody.
        </p>
        <p className="text-xs mb-10 text-[var(--text-muted)]">
          Designed for CERT-In analysts, digital investigators, academic researchers, and executive oversight.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <button
            onClick={() => onEnterWorkspace('case_desk')}
            className="btn-primary py-3 px-7 text-sm font-semibold flex items-center gap-2 rounded-md shadow-sm"
          >
            <span>Launch Case Desk Intake</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEnterWorkspace('email_forensics')}
            className="btn-secondary py-3 px-6 text-sm font-medium rounded-md"
          >
            Explore Forensics Lab
          </button>
        </div>

        {/* Stats Row */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl border-t border-b border-[var(--border)] py-6 text-center">
          <div>
            <div className="text-2xl font-bold font-mono text-[var(--blue-primary)]">SHA-256</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">Merkle Proof Ledger</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">STIX 2.1</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">JSON Bundle Export</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">QEMU-KVM</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">Isolated Detonation</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">Tamper-Evident Seal</div>
          </div>
        </div>
      </section>

      {/* ── Module Grid ── */}
      <section className="relative py-16 px-6 sm:px-10 z-10 bg-[var(--surface-2)] border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
              Forensic Capability Suite
            </h2>
            <p className="text-xs text-[var(--text-muted)] max-w-lg mx-auto">
              Six core investigation modules engineered for rigorous evidence gathering and threat correlation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((m) => {
              const IconComp = m.icon;
              return (
                <div
                  key={m.tab}
                  onClick={() => onEnterWorkspace(m.tab)}
                  className="tracex-card p-6 flex flex-col justify-between cursor-pointer transition-all hover:border-[var(--blue-primary)]"
                >
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-md bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--blue-primary)]">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">{m.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{m.desc}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--blue-primary)]">
                    <span>Inspect Module</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 sm:px-10 z-10 border-t border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-muted)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TracexLogo size="sm" showSubtitle={false} />
            <span>Digital Forensics & Threat Investigation Platform</span>
          </div>
          <div>© 2026 TRACE-X Platform. Restricted Academic & Institutional Use.</div>
        </div>
      </footer>
    </div>
  );
};
