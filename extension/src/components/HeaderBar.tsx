import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';

interface HeaderBarProps {
  online?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ online = true }) => {
  return (
    <header className="flex items-center justify-between px-3.5 py-2.5 bg-[#101216] border-b border-[#22272E] select-none">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-[#181B20] border border-[#2D333B] flex items-center justify-center text-slate-300">
          <Shield className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-100 tracking-tight">TRACE-X</span>
            <span className="text-[10px] text-slate-400 font-mono font-medium">Sentinel</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-[#16191E] px-2 py-0.5 rounded border border-[#262C34]">
          <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{online ? 'Active' : 'Offline'}</span>
        </div>
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          title="Open TRACE-X Workstation"
          className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded hover:bg-[#1C2128]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
};
