import React from 'react';

export interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const sizeMap = {
    sm: {
      icon: 'w-6 h-6',
      text: 'text-lg',
      subtext: 'text-[9px]',
    },
    md: {
      icon: 'w-9 h-9',
      text: 'text-2xl',
      subtext: 'text-[11px]',
    },
    lg: {
      icon: 'w-12 h-12',
      text: 'text-3xl',
      subtext: 'text-xs',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Pure SVG Tattoo Machine Emblem */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${currentSize.icon} shrink-0 drop-shadow-[0_2px_10px_rgba(139,92,246,0.35)] transition-transform hover:scale-105 duration-300`}
        aria-label="Tattoo Hub Logo Emblem"
      >
        <defs>
          <linearGradient id="logoPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="logoAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="logoDarkPlate" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Tech Shield Frame */}
        <rect
          x="6"
          y="6"
          width="108"
          height="108"
          rx="28"
          fill="url(#logoDarkPlate)"
          stroke="url(#logoPrimaryGrad)"
          strokeWidth="3.5"
        />

        {/* Ambient Orbit Ring */}
        <circle
          cx="60"
          cy="56"
          r="40"
          stroke="url(#logoPrimaryGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.45"
        />

        {/* Rotary Motor Housing */}
        <circle
          cx="60"
          cy="38"
          r="16"
          fill="#18181B"
          stroke="url(#logoPrimaryGrad)"
          strokeWidth="2.5"
        />
        <circle cx="60" cy="38" r="8" fill="url(#logoPrimaryGrad)" />
        <circle cx="60" cy="38" r="3" fill="#FFFFFF" />

        {/* Frame Braces */}
        <path
          d="M48 40 L38 52 L42 66 L52 64"
          stroke="url(#logoPrimaryGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M72 40 L82 52 L78 66 L68 64"
          stroke="url(#logoPrimaryGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Machine Grip */}
        <rect
          x="53"
          y="62"
          width="14"
          height="22"
          rx="3"
          fill="#27272A"
          stroke="url(#logoPrimaryGrad)"
          strokeWidth="2"
        />
        <line x1="53" y1="67" x2="67" y2="67" stroke="url(#logoPrimaryGrad)" strokeWidth="1.5" opacity="0.8" />
        <line x1="53" y1="72" x2="67" y2="72" stroke="url(#logoPrimaryGrad)" strokeWidth="1.5" opacity="0.8" />
        <line x1="53" y1="77" x2="67" y2="77" stroke="url(#logoPrimaryGrad)" strokeWidth="1.5" opacity="0.8" />

        {/* Needle Blade & Glowing Tip */}
        <path d="M57 84 L63 84 L60 102 Z" fill="url(#logoAccentGrad)" filter="url(#logoGlow)" />
        <line x1="60" y1="54" x2="60" y2="102" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

        {/* Sparkle Particles */}
        <circle cx="78" cy="30" r="2" fill="#EC4899" />
        <circle cx="40" cy="32" r="1.5" fill="#8B5CF6" />
        <circle cx="60" cy="105" r="2.5" fill="#EC4899" filter="url(#logoGlow)" />
      </svg>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className={`font-black tracking-tight ${currentSize.text} flex items-center`}>
            <span className="text-gray-900 dark:text-white transition-colors duration-200">
              Tattoo
            </span>
            <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent ml-1">
              Hub
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
