import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';

interface HeaderBarProps {
  online?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ online = true }) => {
  return (
    <header className="flex items-center justify-between px-3.5 py-2.5 bg-[#050B17] border-b border-white/10 select-none">
      <div className="flex items-center gap-2">
        <div className="w-6.5 h-6.5 rounded bg-[#0A1628] border border-white/10 flex items-center justify-center text-teal-400">
          <Shield className="w-3.5 h-3.5 text-[#14B8A6]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-100 tracking-wide">TRACE-X</span>
            <span className="text-[10px] text-teal-400 font-sans font-medium">Sentinel</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-300 bg-[#0F1E35] px-2 py-0.5 rounded border border-white/10">
          <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          <span>{online ? 'Active' : 'Offline'}</span>
        </div>
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          title="Open TRACE-X Workstation"
          className="text-slate-400 hover:text-slate-100 transition-colors p-1 rounded hover:bg-[#0F1E35]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
};
