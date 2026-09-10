import React, { useState, useRef, useEffect } from 'react';
import {
  Shield, Cpu, Blocks, Mail, Route, Lock, ArrowRight,
  Globe, Activity, ChevronRight, ChevronDown,
  FileSearch, Network, BookOpen, UserCheck
} from 'lucide-react';
import { RisingLines } from '../ui/RisingLines';
import { TracexLogo } from '../common/TracexLogo';

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
    <div className="min-h-screen flex flex-col font-sans antialiased relative overflow-x-hidden" style={{ background: '#07101D', color: '#F1F5F9' }}>

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
        <header
          className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-6 rounded-lg"
          style={{ height: '60px', background: '#050B17', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Left: Persona + Brand */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={personaRef}>
              <button
                onClick={() => setPersonaOpen(v => !v)}
                className="tracex-persona-btn flex items-center gap-2"
              >
                <span className="tracex-persona-dot" style={{ background: '#34d399' }} />
                <span>Analyst Perspective</span>
                <ChevronDown className={`w-3.5 h-3.5 tracex-chevron ${personaOpen ? 'rotate-180' : ''}`} />
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
                      <span className="tracex-persona-dot" style={{ background: p.color }} />
                      <span className="tracex-persona-label">{p.label}</span>
                    </div>
                    <p className="tracex-persona-desc">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden sm:flex items-center pl-4" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
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

          {/* CTA */}
          <button
            onClick={() => onEnterWorkspace()}
            className="btn-primary text-sm"
          >
            Open Workspace
          </button>
        </header>
      </div>

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-16 px-6 sm:px-10 flex flex-col items-center text-center max-w-4xl mx-auto z-10 flex-1 w-full">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full text-xs font-medium font-mono tracking-wide"
          style={{ background: 'rgba(14,112,99,0.15)', border: '1px solid rgba(20,184,166,0.25)', color: '#5eead4' }}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Academic Cyber-Forensics Research Platform
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5" style={{ color: '#FFFFFF' }}>
          TRACE-X Forensic Platform
        </h1>

        <p className="text-base leading-relaxed max-w-2xl mb-2" style={{ color: '#94A3B8' }}>
          A structured digital forensics workstation for email header analysis, relay path tracing,
          attachment detonation, and tamper-evident chain of custody.
        </p>
        <p className="text-xs mb-10 font-mono" style={{ color: '#475569' }}>
          Designed for SOC analysts, digital investigators, and executive oversight.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => onEnterWorkspace()}
            className="btn-primary flex items-center gap-2"
          >
            Enter Forensic Lab
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEnterWorkspace('case_desk')}
            className="btn-secondary"
          >
            View Case Desk
          </button>
        </div>
      </section>

      {/* ── Module Grid ── */}
      <section className="px-6 sm:px-10 pb-20 relative z-10 max-w-6xl mx-auto w-full">
        <div className="mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
            Investigation Modules
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="forensic-card p-5 flex flex-col justify-between group"
                style={{ minHeight: '170px' }}
              >
                <div>
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-md mb-4"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: '#64748B' }} />
                  </div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#F1F5F9' }}>{feat.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>{feat.desc}</p>
                </div>
                <button
                  onClick={() => onEnterWorkspace(feat.tab)}
                  className="mt-4 flex items-center gap-1 text-xs font-medium transition-colors duration-200"
                  style={{ color: '#475569' }}
                  onMouseOver={e => (e.currentTarget.style.color = '#14B8A6')}
                  onMouseOut={e => (e.currentTarget.style.color = '#475569')}
                >
                  Open module
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#050B17' }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="tracex-logo-mark">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="tracex-brand">TRACE<span className="tracex-brand-x">-X</span></span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
              Digital forensics and immutable evidence chain platform for academic and professional investigation.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Modules</div>
            <ul className="space-y-1.5">
              {['Case Desk Intake', 'Header Flight Recorder', 'Identity Deception', 'Chain of Custody'].map(l => (
                <li key={l}>
                  <button
                    onClick={() => onEnterWorkspace('email_forensics')}
                    className="text-xs transition-colors"
                    style={{ color: '#475569' }}
                    onMouseOver={e => (e.currentTarget.style.color = '#F1F5F9')}
                    onMouseOut={e => (e.currentTarget.style.color = '#475569')}
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Architecture</div>
            <ul className="space-y-1.5 text-xs" style={{ color: '#475569' }}>
              <li>MIME Parsing Engine</li>
              <li>SHA-256 Merkle Proof System</li>
              <li>Qdrant Vector Engine</li>
              <li>FastAPI 0.110 Async Gateway</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>System Status</div>
            <div
              className="p-3 rounded-lg space-y-2 text-xs font-mono"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: '#475569' }}>Status</span>
                <span className="flex items-center gap-1.5" style={{ color: '#10b981' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: '#475569' }}>Integrity</span>
                <span style={{ color: '#94A3B8' }}>SHA-256 Sealed</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="max-w-7xl mx-auto px-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: '#334155' }}
        >
          <div>© 2026 TRACE-X Forensic Platform. All rights reserved.</div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            <span>Research Use Only</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
