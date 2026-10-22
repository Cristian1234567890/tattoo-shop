import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Palette,
  LayoutGrid,
  Sparkles,
  Image as ImageIcon,
  Check,
  Save,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export interface PortfolioThemeConfig {
  accentTheme: 'violet' | 'gold' | 'neon' | 'crimson' | 'emerald';
  layoutStyle: 'masonry' | 'editorial' | 'grid';
  cardAnimation: 'glow' | 'tilt' | 'zoom' | 'shimmer';
  bannerPreset: string;
  customBannerUrl?: string;
}

export const DEFAULT_PORTFOLIO_CONFIG: PortfolioThemeConfig = {
  accentTheme: 'violet',
  layoutStyle: 'masonry',
  cardAnimation: 'glow',
  bannerPreset: 'gradient-dark',
};

interface PortfolioCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: Partial<PortfolioThemeConfig>;
  onSaveConfig: (config: PortfolioThemeConfig) => void;
}

const ACCENT_THEMES = [
  {
    id: 'violet',
    name: 'Obsidian Purple',
    colorHex: '#8b5cf6',
    borderClass: 'border-violet-500',
    bgClass: 'bg-gradient-to-r from-violet-600 to-indigo-600',
    desc: 'Eléctrico, sofisticado y moderno',
  },
  {
    id: 'gold',
    name: 'Luxury Gold',
    colorHex: '#eab308',
    borderClass: 'border-amber-500',
    bgClass: 'bg-gradient-to-r from-amber-500 to-yellow-600',
    desc: 'Exclusivo, cálido y elegante',
  },
  {
    id: 'neon',
    name: 'Cyberpunk Neon',
    colorHex: '#06b6d4',
    borderClass: 'border-cyan-400',
    bgClass: 'bg-gradient-to-r from-cyan-400 to-fuchsia-500',
    desc: 'Futurista, vibrante y llamativo',
  },
  {
    id: 'crimson',
    name: 'Crimson Ink',
    colorHex: '#f43f5e',
    borderClass: 'border-rose-500',
    bgClass: 'bg-gradient-to-r from-rose-600 to-red-700',
    desc: 'Intenso, tradicional y rebelde',
  },
  {
    id: 'emerald',
    name: 'Emerald Tattoo',
    colorHex: '#10b981',
    borderClass: 'border-emerald-500',
    bgClass: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    desc: 'Orgánico, nítido y balanceado',
  },
];

const LAYOUT_STYLES = [
  {
    id: 'masonry',
    name: 'Masonry Dinámico',
    desc: 'Estilo Pinterest con tarjetas que se adaptan a las proporciones de tus fotos.',
    icon: '📌',
  },
  {
    id: 'editorial',
    name: 'Editorial Minimalista',
    desc: 'Tarjetas amplias con mayor presencia y protagonismo a cada pieza.',
    icon: '📰',
  },
  {
    id: 'grid',
    name: 'Cuadrícula 3x3',
    desc: 'Diseño regular tipo Instagram, ordenado y directo.',
    icon: '📱',
  },
];

const CARD_ANIMATIONS = [
  {
    id: 'glow',
    name: 'Subtle Glow',
    desc: 'Resplandor ambiental al pasar el cursor sobre tus obras.',
  },
  {
    id: 'tilt',
    name: 'Inclinación 3D',
    desc: 'Sutil efecto de perspectiva y profundidad reactivo al movimiento.',
  },
  {
    id: 'zoom',
    name: 'Zoom Suave',
    desc: 'Agrandamiento fluido con enfoque visual en los detalles del tatuaje.',
  },
  {
    id: 'shimmer',
    name: 'Borde Shimmer',
    desc: 'Destello sutil recorriendo el contorno de la obra.',
  },
];

const BANNER_PRESETS = [
  {
    id: 'gradient-dark',
    name: 'Estudio Nocturno',
    css: 'from-slate-950 via-violet-950 to-indigo-950',
  },
  {
    id: 'gradient-gold',
    name: 'Obsidiana Dorada',
    css: 'from-stone-950 via-zinc-900 to-amber-950',
  },
  {
    id: 'gradient-crimson',
    name: 'Niebla Carmesí',
    css: 'from-black via-rose-950 to-red-950',
  },
  {
    id: 'gradient-cyber',
    name: 'Luces de Neón',
    css: 'from-slate-950 via-cyan-950 to-fuchsia-950',
  },
];

export const PortfolioCustomizerModal: React.FC<PortfolioCustomizerModalProps> = ({
  isOpen,
  onClose,
  initialConfig,
  onSaveConfig,
}) => {
  const { updateUserMetadata } = useAuth();
  const [accentTheme, setAccentTheme] = useState<PortfolioThemeConfig['accentTheme']>(
    initialConfig?.accentTheme || 'violet'
  );
  const [layoutStyle, setLayoutStyle] = useState<PortfolioThemeConfig['layoutStyle']>(
    initialConfig?.layoutStyle || 'masonry'
  );
  const [cardAnimation, setCardAnimation] = useState<PortfolioThemeConfig['cardAnimation']>(
    initialConfig?.cardAnimation || 'glow'
  );
  const [bannerPreset, setBannerPreset] = useState<string>(
    initialConfig?.bannerPreset || 'gradient-dark'
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const updatedConfig: PortfolioThemeConfig = {
      accentTheme,
      layoutStyle,
      cardAnimation,
      bannerPreset,
    };

    try {
      await api.updateUser({
        portfolio_customization: updatedConfig,
      });

      updateUserMetadata({
        portfolio_customization: updatedConfig,
      } as any);

      onSaveConfig(updatedConfig);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Save portfolio customization error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-500 flex items-center justify-center">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Personalizar Mi Portafolio
                </h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Ajusta la paleta de colores, la disposición y las animaciones de tu perfil público.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
            {/* 1. Theme Accent */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-primary" />
                1. Paleta de Acento &amp; Estilo de Marca
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ACCENT_THEMES.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setAccentTheme(th.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      accentTheme === th.id
                        ? `border-2 ${th.borderClass} bg-slate-50 dark:bg-gray-800/80 shadow-md`
                        : 'border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-6 h-6 rounded-lg ${th.bgClass} shadow-xs`} />
                      {accentTheme === th.id && (
                        <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      {th.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
                      {th.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Layout Mode */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                2. Disposición de Cuadrícula para tus Obras
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LAYOUT_STYLES.map((lay) => (
                  <button
                    key={lay.id}
                    type="button"
                    onClick={() => setLayoutStyle(lay.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      layoutStyle === lay.id
                        ? 'border-2 border-primary bg-primary/5 shadow-md'
                        : 'border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{lay.icon}</span>
                      {layoutStyle === lay.id && (
                        <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      {lay.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
                      {lay.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Card Animations */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                3. Micro-Animación al Pasar el Cursor
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CARD_ANIMATIONS.map((anim) => (
                  <button
                    key={anim.id}
                    type="button"
                    onClick={() => setCardAnimation(anim.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      cardAnimation === anim.id
                        ? 'border-2 border-primary bg-primary/5 shadow-md'
                        : 'border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {anim.name}
                      </span>
                      {cardAnimation === anim.id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400">{anim.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Banner Cover */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                4. Cabecera / Banner Superior
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {BANNER_PRESETS.map((bp) => (
                  <div
                    key={bp.id}
                    onClick={() => setBannerPreset(bp.id)}
                    className={`h-20 rounded-xl bg-gradient-to-r ${bp.css} p-2.5 flex flex-col justify-end cursor-pointer border-2 transition-all ${
                      bannerPreset === bp.id
                        ? 'border-white ring-2 ring-primary scale-102 shadow-lg'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-white drop-shadow">
                      {bp.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-gray-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#ff7a29] text-white font-bold text-xs shadow-lg shadow-orange-500/25 hover:brightness-105 active:scale-98 transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando Estilo...
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  ¡Estilo Aplicado!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar y Aplicar al Portafolio
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
