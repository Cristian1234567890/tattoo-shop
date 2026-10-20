import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * TattooPatternBackground
 * Dynamic adaptive SVG watermark background providing an authentic atelier tattoo aesthetic.
 * - In Dark Mode: Violet & neon delicate tattoo line art, needles, stippling, and mandalas.
 * - In Light Mode: Charcoal & slate ink watermark that feels like ink on skin or fine parchment.
 * Zero-layout shift, fixed viewport coverage, hardware-accelerated SVG pattern.
 */
export const TattooPatternBackground: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-700"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full opacity-60 dark:opacity-40"
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
              className="fill-none stroke-current"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Ornamental Mandala Center */}
            <circle
              cx="120"
              cy="120"
              r="28"
              className="fill-none stroke-current"
              strokeWidth="0.75"
              strokeDasharray="2,3"
            />
            <circle
              cx="120"
              cy="120"
              r="14"
              className="fill-none stroke-current"
              strokeWidth="0.8"
            />
            <path
              d="M 120,86 L 120,98 M 120,142 L 120,154 M 86,120 L 98,120 M 142,120 L 154,120"
              className="fill-none stroke-current"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <path
              d="M 96,96 L 105,105 M 135,135 L 144,144 M 144,96 L 135,105 M 105,135 L 96,144"
              className="fill-none stroke-current"
              strokeWidth="0.7"
              strokeLinecap="round"
            />

            {/* Sacred Geometry Rays & Stars */}
            <path
              d="M 120,40 L 122,50 L 132,52 L 122,54 L 120,64 L 118,54 L 108,52 L 118,50 Z"
              className="fill-none stroke-current"
              strokeWidth="0.7"
            />
            <path
              d="M 210,190 L 212,198 L 220,200 L 212,202 L 210,210 L 208,202 L 200,200 L 208,198 Z"
              className="fill-none stroke-current"
              strokeWidth="0.7"
            />

            {/* Ornamental Waves & Stippling */}
            <path
              d="M 10,20 Q 30,5 50,20 T 90,20"
              className="fill-none stroke-current"
              strokeWidth="0.65"
              strokeDasharray="1,4"
            />
            <path
              d="M 150,220 Q 170,205 190,220 T 230,220"
              className="fill-none stroke-current"
              strokeWidth="0.65"
              strokeDasharray="1,4"
            />

            {/* Delicate Stipple Dots */}
            <circle cx="120" cy="120" r="1.5" className="fill-current" />
            <circle cx="40" cy="40" r="1.2" className="fill-current" />
            <circle cx="200" cy="40" r="1.2" className="fill-current" />
            <circle cx="40" cy="200" r="1.2" className="fill-current" />
            <circle cx="200" cy="200" r="1.2" className="fill-current" />
          </pattern>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="url(#tattoo-atelier-pattern)"
          className={`transition-colors duration-500 ${
            isDark ? 'text-violet-500/25' : 'text-slate-800/15'
          }`}
        />
      </svg>
    </div>
  );
};

export default TattooPatternBackground;
