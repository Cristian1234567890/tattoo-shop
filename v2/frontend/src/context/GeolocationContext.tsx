import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Navigation, X, Compass } from 'lucide-react';

export interface GeolocationContextType {
  coords: [number, number] | null;
  status: 'prompt' | 'granted' | 'denied' | 'unsupported';
  requestLocation: () => Promise<[number, number] | null>;
  isPromptOpen: boolean;
  dismissPrompt: () => void;
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

export const GeolocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<[number, number] | null>(() => {
    const saved = sessionStorage.getItem('user_coords');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 2) return parsed as [number, number];
      } catch {}
    }
    return null;
  });

  const [status, setStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return 'unsupported';
    if (sessionStorage.getItem('user_coords')) return 'granted';
    if (sessionStorage.getItem('geolocation_dismissed')) return 'denied';
    return 'prompt';
  });

  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return false;
    return !sessionStorage.getItem('user_coords') && !sessionStorage.getItem('geolocation_dismissed');
  });

  const requestLocation = useCallback(async (): Promise<[number, number] | null> => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unsupported');
      setIsPromptOpen(false);
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setCoords(userLoc);
          setStatus('granted');
          setIsPromptOpen(false);
          sessionStorage.setItem('user_coords', JSON.stringify(userLoc));
          sessionStorage.removeItem('geolocation_dismissed');
          resolve(userLoc);
        },
        (error) => {
          console.warn('Geolocation denied or failed:', error.message);
          setStatus('denied');
          setIsPromptOpen(false);
          sessionStorage.setItem('geolocation_dismissed', 'true');
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  }, []);

  const dismissPrompt = useCallback(() => {
    setIsPromptOpen(false);
    sessionStorage.setItem('geolocation_dismissed', 'true');
    setStatus('denied');
  }, []);

  // Proactive request when user enters the platform
  useEffect(() => {
    if (status === 'prompt') {
      // Show prompt banner after brief delay so client sees page context first
      const timer = setTimeout(() => {
        setIsPromptOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <GeolocationContext.Provider
      value={{
        coords,
        status,
        requestLocation,
        isPromptOpen,
        dismissPrompt,
      }}
    >
      {children}

      {/* Proactive Geolocation Prompt Banner / Modal for Clients entering the page */}
      {isPromptOpen && (
        <aside
          id="geolocation-consent-banner"
          aria-label="Permiso de geolocalización"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
        >
          <div className="bg-zinc-950/95 border border-violet-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-zinc-200">
            <div className="flex items-start justify-between gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                <Compass className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Tatuadores cerca de ti</span>
                  <span className="text-[10px] uppercase font-extrabold bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded">
                    GPS
                  </span>
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  ¿Deseas activar tu ubicación para mostrarte los estudios, flashes y artistas disponibles a tu alrededor?
                </p>
              </div>
              <button
                onClick={dismissPrompt}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                aria-label="Cerrar aviso de ubicación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-3.5 pt-2 border-t border-zinc-800/80">
              <button
                id="geo-allow-btn"
                onClick={() => requestLocation()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-lg shadow-violet-600/30 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                Permitir Ubicación
              </button>
              <button
                id="geo-dismiss-btn"
                onClick={dismissPrompt}
                className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium border border-zinc-800 transition cursor-pointer"
              >
                Ahora no
              </button>
            </div>
          </div>
        </aside>
      )}
    </GeolocationContext.Provider>
  );
};

export const useGeolocation = (): GeolocationContextType => {
  const context = useContext(GeolocationContext);
  if (!context) {
    throw new Error('useGeolocation must be used within a GeolocationProvider');
  }
  return context;
};
