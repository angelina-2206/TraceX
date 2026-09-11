import React from 'react';

interface GovtCyberBadgeProps {
  compact?: boolean;
}

export const GovtCyberBadge: React.FC<GovtCyberBadgeProps> = ({ compact = false }) => {
  return (
    <div 
      className="flex items-center gap-2.5 px-3 py-1 rounded-md bg-slate-900/90 border border-amber-500/35 text-white select-none shadow-sm backdrop-blur-md hover:border-amber-500/60 transition-all duration-200"
      title="Indian Cyber Crime Coordination Centre (I4C) & CERT-In Certified Forensic Infrastructure"
    >
      {/* Official Ashoka Chakra + Indian Tricolor Shield Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Glow halo */}
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#FF9933]/30 via-white/20 to-[#138808]/30 blur-[2px]" />

        <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-sm">
          {/* Outer Shield with Gold/Amber Border */}
          <path 
            d="M18 2L32 7V17C32 25.5 26 31.5 18 34C10 31.5 4 25.5 4 17V7L18 2Z" 
            fill="#09111E" 
            stroke="#F59E0B" 
            strokeWidth="1.5" 
          />
          
          {/* Indian Tricolor Accent Bands inside shield */}
          <path d="M8 10.5L28 10.5" stroke="#FF9933" strokeWidth="1.75" strokeLinecap="round" opacity="0.95" />
          <path d="M10 17L26 17" stroke="#FFFFFF" strokeWidth="1.75" strokeLinecap="round" opacity="0.95" />
          <path d="M8 23.5L28 23.5" stroke="#138808" strokeWidth="1.75" strokeLinecap="round" opacity="0.95" />

          {/* Center Ashoka Chakra Circle */}
          <circle cx="18" cy="17" r="4.5" fill="#09111E" stroke="#000080" strokeWidth="1.2" />
          <circle cx="18" cy="17" r="0.9" fill="#000080" />
          
          {/* Ashoka Chakra 24 Spokes */}
          {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((angle) => (
            <line
              key={angle}
              x1="18"
              y1="17"
              x2={18 + 3.8 * Math.cos((angle * Math.PI) / 180)}
              y2={17 + 3.8 * Math.sin((angle * Math.PI) / 180)}
              stroke="#000080"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </div>

      {/* Official Government Department Typography */}
      {!compact && (
        <div className="flex flex-col text-left leading-none justify-center">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-amber-300 uppercase">
            <span>GOVT. OF INDIA</span>
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-mono">I4C · CERT-In</span>
          </div>
          <span className="text-[9px] text-slate-300 font-sans tracking-tight mt-0.5 opacity-90">
            Cyber Security & Forensic Division
          </span>
        </div>
      )}
    </div>
  );
};
