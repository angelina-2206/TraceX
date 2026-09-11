import React from 'react';
import { ArrowRight, ShieldCheck, Database, FileCheck, Activity } from 'lucide-react';
import { TracexLogo } from '../common/TracexLogo';
import { RisingLines } from '../ui/RisingLines';
import { UserRole } from '../../types';

interface LandingPageProps {
  onEnterWorkspace: (initialTab?: string, initialRole?: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterWorkspace }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between font-sans antialiased relative overflow-hidden bg-[var(--canvas-bg)] text-[var(--text-primary)]">

      {/* Background dynamic rising lines with high visibility */}
      <RisingLines
        color="#00D2BE"
        horizonColor="#0E7063"
        haloColor="#0F2040"
        riseSpeed={0.65}
        flowSpeed={0.22}
        flowDensity={70}
        horizonHeight={0.92}
        horizonIntensity={0.45}
        haloIntensity={0.2}
        circleScale={1.0}
      />

      {/* ── Full-Width Edge-to-Edge Top Navigation Bar ── */}
      <header className="w-full border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md px-6 sm:px-12 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onEnterWorkspace('case_desk')}>
          <TracexLogo size="md" showSubtitle={false} />
        </div>

        <button
          onClick={() => onEnterWorkspace('case_desk')}
          className="btn-primary text-xs py-2 px-4.5 shadow-sm cursor-pointer flex items-center gap-2 font-semibold rounded-md transition-all hover:scale-[1.02]"
        >
          <span>Enter Workstation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* ── Clean, Enlarged Hero Section ── */}
      <main className="relative flex-1 flex flex-col items-center justify-center text-center px-6 sm:px-12 py-16 max-w-5xl mx-auto z-10 w-full">
        {/* Academic Platform Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full text-xs font-medium tracking-wide bg-[var(--surface-2)] border border-[var(--border)] text-[var(--teal-primary)] shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[var(--teal-primary)]" />
          <span>Institutional Cyber-Forensics Workstation</span>
        </div>

        {/* Central Emblem Showcase */}
        <div className="mb-4 flex items-center justify-center">
          <img
            src="/anveshak-logo.png"
            alt="ANVESHAK Logo"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain filter drop-shadow-md select-none transition-transform hover:scale-105 duration-300"
          />
        </div>

        {/* Large Prominent Title */}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-none mb-6 text-[var(--text-primary)] select-none">
          ANVESHAK
        </h1>

        {/* Crisp Subtitle */}
        <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mb-10 text-[var(--text-secondary)] font-normal">
          Advanced digital forensics platform for structured email header flight recording,
          identity deception verification, dynamic sandbox telemetry, and cryptographically anchored chain of custody.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
          <button
            onClick={() => onEnterWorkspace('case_desk')}
            className="btn-primary py-3 px-8 text-sm font-semibold flex items-center gap-2.5 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Launch Case Desk Intake</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEnterWorkspace('email_forensics')}
            className="btn-secondary py-3 px-7 text-sm font-medium rounded-lg shadow-sm hover:border-[var(--teal-primary)] transition-all cursor-pointer"
          >
            Explore Forensics Lab
          </button>
        </div>

        {/* Minimal Feature Highlights Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl w-full">
          <div className="p-3 rounded-lg bg-[var(--surface)]/80 backdrop-blur-sm border border-[var(--border)] flex items-center justify-center gap-2 text-xs font-medium text-[var(--text-secondary)] shadow-sm">
            <Activity className="w-3.5 h-3.5 text-[var(--teal-primary)] shrink-0" />
            <span>Flight Recording</span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--surface)]/80 backdrop-blur-sm border border-[var(--border)] flex items-center justify-center gap-2 text-xs font-medium text-[var(--text-secondary)] shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--teal-primary)] shrink-0" />
            <span>Identity Auditing</span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--surface)]/80 backdrop-blur-sm border border-[var(--border)] flex items-center justify-center gap-2 text-xs font-medium text-[var(--text-secondary)] shadow-sm">
            <Database className="w-3.5 h-3.5 text-[var(--teal-primary)] shrink-0" />
            <span>Detonation Sandbox</span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--surface)]/80 backdrop-blur-sm border border-[var(--border)] flex items-center justify-center gap-2 text-xs font-medium text-[var(--text-secondary)] shadow-sm">
            <FileCheck className="w-3.5 h-3.5 text-[var(--teal-primary)] shrink-0" />
            <span>Merkle Proof Ledger</span>
          </div>
        </div>
      </main>

      {/* ── Minimal Clean Footer ── */}
      <footer className="py-5 px-6 sm:px-12 z-10 border-t border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-sm text-xs text-[var(--text-muted)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <TracexLogo size="sm" showSubtitle={false} />
            <span>Digital Forensics & Incident Response Platform</span>
          </div>
          <div>© 2026 ANVESHAK</div>
        </div>
      </footer>
    </div>
  );
};
