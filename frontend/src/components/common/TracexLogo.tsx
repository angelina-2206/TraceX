import React from 'react';

interface TracexLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  themeVariant?: 'auto' | 'light' | 'dark';
  onlyIcon?: boolean;
}

export const TracexLogo: React.FC<TracexLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  themeVariant = 'auto',
  onlyIcon = false,
}) => {
  const iconDimensions =
    size === 'sm'
      ? 'w-7 h-7'
      : size === 'lg'
      ? 'w-11 h-11'
      : size === 'xl'
      ? 'w-16 h-16'
      : 'w-9 h-9';

  const textSize =
    size === 'sm'
      ? 'text-sm'
      : size === 'lg'
      ? 'text-xl'
      : size === 'xl'
      ? 'text-2xl'
      : 'text-base';

  const subtitleSize = size === 'sm' ? 'text-[9px]' : size === 'xl' ? 'text-xs' : 'text-[10px]';

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
      {/* Official ANVESHAK Emblem Image */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconDimensions}`}>
        <img
          src="/anveshak-logo.png"
          alt="ANVESHAK Emblem"
          className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Typography */}
      {!onlyIcon && (
        <div className="flex flex-col justify-center leading-tight">
          <div className={`font-bold tracking-wider ${textColorClass} flex items-center gap-1.5 ${textSize}`}>
            <span>ANVESHAK</span>
            <span className="bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 rounded px-1 text-[0.72em] font-extrabold tracking-normal">
              SEC
            </span>
          </div>
          {showSubtitle && (
            <span className={`font-mono tracking-widest uppercase ${subtitleColorClass} ${subtitleSize}`}>
              Cyber Forensic Platform
            </span>
          )}
        </div>
      )}
    </div>
  );
};
