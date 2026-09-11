import React from 'react';

interface TracexLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  themeVariant?: 'auto' | 'light' | 'dark';
}

export const TracexLogo: React.FC<TracexLogoProps> = ({ size = 'md', showSubtitle = true, themeVariant = 'auto' }) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 38 : 30;
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';
  const subtitleSize = size === 'sm' ? 'text-[9px]' : 'text-[10px]';

  const textColorClass =
    themeVariant === 'dark'
      ? 'text-slate-100'
      : themeVariant === 'light'
      ? 'text-slate-900'
      : 'text-[var(--text-primary)]';

  const subtitleColorClass =
    themeVariant === 'dark'
      ? 'text-slate-400'
      : themeVariant === 'light'
      ? 'text-slate-500'
      : 'text-[var(--text-muted)]';

  return (
    <div className="flex items-center gap-2.5 select-none group">
      {/* Authentic Institutional Forensic SVG Logo Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          {/* Outer Shield/Hex Matrix Frame */}
          <polygon 
            points="20,2 36,10 36,28 20,38 4,28 4,10" 
            fill="#0A1628" 
            stroke="#0E7063" 
            strokeWidth="1.75" 
          />
          
          {/* Internal Geometric Forensic Node Grid */}
          <polygon 
            points="20,7 31,13 31,25 20,31 9,25 9,13" 
            fill="#0F1E35" 
            stroke="#14B8A6" 
            strokeWidth="1" 
            strokeOpacity="0.5" 
          />

          {/* Core Radar Scanning Lines & Center Target */}
          <line x1="20" y1="7" x2="20" y2="31" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="9" y1="19" x2="31" y2="19" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.4" />
          
          {/* Center Precision Node */}
          <circle cx="20" cy="19" r="4" fill="#14B8A6" />
          <circle cx="20" cy="19" r="7" stroke="#14B8A6" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
          
          {/* Top-Right Active Ping Indicator */}
          <circle cx="31" cy="13" r="2" fill="#2dd4bf" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center leading-tight">
        <div className={`font-bold tracking-wider ${textColorClass} flex items-center gap-1.5 ${textSize}`}>
          <span>ANVESHAK</span>
          <span className="bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/40 rounded px-1 text-[0.75em] font-extrabold tracking-normal">
            SEC
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-mono tracking-widest uppercase ${subtitleColorClass} ${subtitleSize}`}>
            Cyber Forensic Platform
          </span>
        )}
      </div>
    </div>
  );
};
