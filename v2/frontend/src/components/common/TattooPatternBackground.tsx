import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * TattooPatternBackground
 * Dynamic adaptive SVG watermark background providing an authentic atelier tattoo aesthetic.
 * - In Dark Mode: Violet & neon delicate tattoo line art, needles, stippling, and mandalas (opacity 25%).
 * - In Light Mode: Ultra-tenuous slate/stone fine watermark (opacity 10-12%) so text and forms remain crisp and effortless to read.
 * Zero-layout shift, fixed viewport coverage, hardware-accelerated SVG pattern.
 */
export const TattooPatternBackground: React.FC = () => {
  const { isDark } = useTheme();

  const strokeColor = isDark ? 'currentColor' : '#cbd5e1';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-700 select-none"
      aria-hidden="true"
    >
      <svg
        className={`w-full h-full transition-opacity duration-700 ${
          isDark ? 'opacity-25 text-violet-400' : 'opacity-[0.10] text-slate-300'
        }`}
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="tattoo-atelier-pattern"
            width="240"
            height="240"
            patternUnits="userSpaceOnUse"
          >
            {/* Ink Needle / Quill Motifs */}
            <path
              d="M 30,120 L 70,80 L 75,85 L 35,125 Z M 70,80 L 85,65 L 82,62 L 67,77 Z M 28,122 L 20,130 L 25,127 Z"
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Ornamental Mandala Center */}
            <circle
              cx="120"
              cy="120"
              r="28"
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.7"
              strokeDasharray="2,3"
            />
            <circle
              cx="120"
              cy="120"
              r="14"
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.75"
            />
            <path
              d="M 120,86 L 120,98 M 120,142 L 120,154 M 86,120 L 98,120 M 142,120 L 154,120"
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.75"
              strokeLinecap="round"
            />
            <path
              d="M 96,96 L 105,105 M 135,135 L 144,144 M 144,96 L 135,105 M 105,135 L 96,144"
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.65"
              strokeLinecap="round"
            />

            {/* Sacred Geometry Rays & Stars */}
            <path
              d="M 120,40 L 122,50 L 132,52 L 122,54 L 120,64 L 118,54 L 108,52 L 118,50 Z"
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.65"
            />
            <path
              d="M 210,190 L 212,198 L 220,200 L 212,202 L 210,210 L 208,202 L 200,200 L 208,198 Z"
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.65"
            />

            {/* Ornamental Waves & Stippling */}
            <path
              d="M 10,20 Q 30,5 50,20 T 90,20"
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.6"
              strokeDasharray="1,4"
            />
            <path
              d="M 150,220 Q 170,205 190,220 T 230,220"
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.6"
              strokeDasharray="1,4"
            />

            {/* Delicate Stipple Dots */}
            <circle cx="120" cy="120" r="1.2" fill={strokeColor} />
            <circle cx="40" cy="40" r="1" fill={strokeColor} />
            <circle cx="200" cy="40" r="1" fill={strokeColor} />
            <circle cx="40" cy="200" r="1" fill={strokeColor} />
            <circle cx="200" cy="200" r="1" fill={strokeColor} />
          </pattern>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="url(#tattoo-atelier-pattern)"
        />
      </svg>
    </div>
  );
};

export default TattooPatternBackground;
