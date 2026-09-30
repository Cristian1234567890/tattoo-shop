import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { Compass, Sparkles } from 'lucide-react';

/**
 * Skeleton placeholder for the nearest artists drawer cards.
 */
export const HubDrawerSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 p-1">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-3 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2.5 animate-pulse"
        >
          <div className="flex items-start gap-3">
            {/* Rank badge placeholder */}
            <Skeleton className="w-5 h-4 rounded" />

            {/* Avatar placeholder */}
            <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />

            {/* Info details placeholder */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
          </div>

          {/* Action buttons placeholder */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <Skeleton className="h-7 flex-1 rounded-xl" />
            <Skeleton className="h-7 flex-1 rounded-xl" />
            <Skeleton className="h-7 w-7 rounded-xl flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Luxury Studio Hub Map Radar skeleton overlay.
 * Renders an atmospheric dark obsidian radar screen with glowing concentric circles
 * and pulse effects while geolocation and live artists initialize.
 */
export const HubSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#090d16] flex items-center justify-center overflow-hidden">
      {/* Ambient background studio glows */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />

      {/* Concentric radar rings */}
      <div className="absolute w-96 h-96 rounded-full border border-violet-500/15 animate-ping [animation-duration:4s]" />
      <div className="absolute w-80 h-80 rounded-full border border-violet-500/20" />
      <div className="absolute w-60 h-60 rounded-full border border-primary/25" />
      <div className="absolute w-40 h-40 rounded-full border border-blue-500/30" />
      <div className="absolute w-20 h-20 rounded-full border border-blue-400/40" />

      {/* Crosshair grid lines */}
      <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
      <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-violet-500/20 to-transparent" />

      {/* Radar sweep beam animation */}
      <div className="absolute w-72 h-72 rounded-full overflow-hidden pointer-events-none animate-spin [animation-duration:6s]">
        <div className="w-1/2 h-1/2 bg-gradient-to-br from-violet-500/20 to-transparent origin-bottom-right" />
      </div>

      {/* Center Radar Beacon & Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/30 to-primary/20 border border-violet-500/40 backdrop-blur-xl flex items-center justify-center text-primary shadow-[0_0_30px_rgba(105,68,255,0.3)]">
            <Compass size={32} className="animate-spin [animation-duration:10s]" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#090d16] animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold mb-2">
          <Sparkles size={12} />
          <span>Radar de Estudio</span>
        </div>

        <h3 className="text-lg font-bold text-white tracking-wide">
          Sincronizando Radar de Artistas
        </h3>
        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
          Calibrando coordenadas GPS y cargando estudios de tatuaje verificados en tiempo real...
        </p>
      </div>
    </div>
  );
};

export default HubSkeleton;
