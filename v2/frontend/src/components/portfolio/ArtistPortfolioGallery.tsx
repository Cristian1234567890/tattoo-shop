import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Filter,
  X,
  MessageCircle,
  Calendar,
  ZoomIn,
} from 'lucide-react';
import { PortfolioThemeConfig, DEFAULT_PORTFOLIO_CONFIG } from './PortfolioCustomizerModal';
import { useCurrency } from '../../context/CurrencyContext';
import { formatWhatsAppUrl } from '../../utils/whatsapp';

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'portfolio' | 'flashes' | 'sketches';
  style: string;
  image_url: string;
  description?: string;
  price?: number;
  estimated_hours?: number;
  available?: boolean;
}

interface ArtistPortfolioGalleryProps {
  items: PortfolioItem[];
  themeConfig?: Partial<PortfolioThemeConfig>;
  artistName: string;
  artistPhone?: string;
  artistPrefix?: string;
  onSelectDesignForBooking?: (item: PortfolioItem) => void;
}

export const ArtistPortfolioGallery: React.FC<ArtistPortfolioGalleryProps> = ({
  items = [],
  themeConfig = DEFAULT_PORTFOLIO_CONFIG,
  artistName,
  artistPhone = '',
  artistPrefix = '+507',
  onSelectDesignForBooking,
}) => {
  const { formatPrice } = useCurrency();
  const config = { ...DEFAULT_PORTFOLIO_CONFIG, ...themeConfig };

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [activeLightboxItem, setActiveLightboxItem] = useState<PortfolioItem | null>(null);

  // Extract unique styles for filter pills
  const availableStyles = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.style) set.add(it.style);
    });
    return Array.from(set);
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchCat = activeCategory === 'all' || it.category === activeCategory;
      const matchStyle = selectedStyle === 'all' || it.style.toLowerCase() === selectedStyle.toLowerCase();
      return matchCat && matchStyle;
    });
  }, [items, activeCategory, selectedStyle]);

  // Color Accent map
  const themeAccentColors = {
    violet: {
      pillActive: 'bg-violet-600 text-white shadow-violet-500/30',
      pillBadge: 'bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
      btnAccent: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/25',
      glowShadow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.35)]',
      borderRing: 'hover:ring-2 hover:ring-violet-500/60',
    },
    gold: {
      pillActive: 'bg-amber-500 text-black font-extrabold shadow-amber-500/30',
      pillBadge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      btnAccent: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black shadow-amber-500/25',
      glowShadow: 'hover:shadow-[0_0_30px_rgba(234,179,8,0.35)]',
      borderRing: 'hover:ring-2 hover:ring-amber-500/60',
    },
    neon: {
      pillActive: 'bg-cyan-500 text-black font-black shadow-cyan-500/30',
      pillBadge: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
      btnAccent: 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-cyan-300 hover:to-fuchsia-400 text-black font-black shadow-cyan-500/25',
      glowShadow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]',
      borderRing: 'hover:ring-2 hover:ring-cyan-400/70',
    },
    crimson: {
      pillActive: 'bg-rose-600 text-white shadow-rose-500/30',
      pillBadge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      btnAccent: 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-rose-500/25',
      glowShadow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.35)]',
      borderRing: 'hover:ring-2 hover:ring-rose-500/60',
    },
    emerald: {
      pillActive: 'bg-emerald-600 text-white shadow-emerald-500/30',
      pillBadge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      btnAccent: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25',
      glowShadow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]',
      borderRing: 'hover:ring-2 hover:ring-emerald-500/60',
    },
  }[config.accentTheme || 'violet'];

  // Card Animation styles
  const getCardAnimationClass = () => {
    switch (config.cardAnimation) {
      case 'glow':
        return `${themeAccentColors.glowShadow} transition-all duration-300`;
      case 'tilt':
        return 'hover:-translate-y-1.5 hover:rotate-0.5 transition-all duration-300 shadow-md hover:shadow-xl';
      case 'zoom':
        return 'transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-xl';
      case 'shimmer':
        return `${themeAccentColors.borderRing} transition-all duration-300`;
      default:
        return 'transition-all duration-200 hover:-translate-y-1 shadow-md';
    }
  };

  const getLayoutClass = () => {
    switch (config.layoutStyle) {
      case 'masonry':
        return 'columns-1 sm:columns-2 md:columns-3 gap-5 space-y-5';
      case 'editorial':
        return 'grid grid-cols-1 md:grid-cols-2 gap-8';
      case 'grid':
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4';
      default:
        return 'columns-1 sm:columns-2 md:columns-3 gap-5 space-y-5';
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-gray-800">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700 overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'Todos los Trabajos', count: items.length },
            {
              id: 'portfolio',
              label: 'Tatuajes Realizados',
              count: items.filter((i) => i.category === 'portfolio').length,
            },
            {
              id: 'flashes',
              label: 'Flashes Disponibles',
              count: items.filter((i) => i.category === 'flashes').length,
            },
            {
              id: 'sketches',
              label: 'Bocetos & Conceptos',
              count: items.filter((i) => i.category === 'sketches').length,
            },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? `${themeAccentColors.pillActive} shadow-sm`
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Style Filter Pills */}
        {availableStyles.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-xs text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              Estilo:
            </span>
            <button
              type="button"
              onClick={() => setSelectedStyle('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                selectedStyle === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-300'
              }`}
            >
              Todos
            </button>
            {availableStyles.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStyle(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition cursor-pointer ${
                  selectedStyle.toLowerCase() === st.toLowerCase()
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-slate-50 dark:bg-gray-900/40 border border-dashed border-slate-300 dark:border-gray-800 p-8">
          <Sparkles className="w-8 h-8 text-slate-400 dark:text-gray-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-gray-200">
            No hay obras para los filtros seleccionados
          </h4>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Prueba seleccionando otra categoría o limpiando los filtros de estilo.
          </p>
        </div>
      ) : (
        <div className={getLayoutClass()}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveLightboxItem(item)}
              className={`group relative rounded-2xl overflow-hidden bg-white dark:bg-gray-850 border border-slate-200 dark:border-gray-800 cursor-pointer break-inside-avoid ${getCardAnimationClass()}`}
            >
              {/* Image Frame */}
              <div className="relative overflow-hidden aspect-auto bg-slate-100 dark:bg-gray-900">
                <img
                  src={item.image_url}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="flex items-center justify-between text-white">
                    <span className="inline-flex items-center gap-1 text-xs font-bold">
                      <ZoomIn className="w-3.5 h-3.5" />
                      Ver en detalle
                    </span>
                    {item.price && (
                      <span className="text-xs font-extrabold bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge Category Tag */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${themeAccentColors.pillBadge}`}
                  >
                    {item.category === 'flashes'
                      ? 'Flash'
                      : item.category === 'sketches'
                      ? 'Boceto'
                      : 'Tatuaje'}
                  </span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 capitalize shrink-0">
                    {item.style}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Detail Modal */}
      <AnimatePresence>
        {activeLightboxItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-gray-800 flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveLightboxItem(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Column */}
              <div className="md:w-3/5 bg-slate-950 flex items-center justify-center p-2 overflow-hidden">
                <img
                  src={activeLightboxItem.image_url}
                  alt={activeLightboxItem.title}
                  className="max-h-[75vh] w-auto object-contain rounded-xl"
                />
              </div>

              {/* Meta & Actions Column */}
              <div className="md:w-2/5 p-6 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${themeAccentColors.pillBadge}`}
                    >
                      {activeLightboxItem.category === 'flashes'
                        ? 'Flash de Autor'
                        : activeLightboxItem.category === 'sketches'
                        ? 'Boceto Exclusivo'
                        : 'Obra Realizada'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-gray-400 font-bold capitalize">
                      {activeLightboxItem.style}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {activeLightboxItem.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-gray-300 mt-2 leading-relaxed">
                    {activeLightboxItem.description ||
                      `Diseño exclusivo creado por ${artistName}. Disponible para tatuar en estudio previa cita.`}
                  </p>

                  {/* Price & Duration Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-gray-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Precio / Seña
                      </span>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {activeLightboxItem.price
                          ? formatPrice(activeLightboxItem.price)
                          : 'A cotizar'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Duración Estimada
                      </span>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {activeLightboxItem.estimated_hours
                          ? `${activeLightboxItem.estimated_hours}h aprox.`
                          : '1 sesión'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectDesignForBooking) {
                        onSelectDesignForBooking(activeLightboxItem);
                      }
                      setActiveLightboxItem(null);
                    }}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${themeAccentColors.btnAccent}`}
                  >
                    <Calendar className="w-4 h-4" />
                    Reservar este diseño con {artistName}
                  </button>

                  {artistPhone && (
                    <button
                      type="button"
                      onClick={() => {
                        const waUrl = formatWhatsAppUrl(artistPhone, artistPrefix);
                        const msg = `¡Hola ${artistName}! Vi tu diseño "${activeLightboxItem.title}" en tu portafolio de Tattoo Hub y me gustaría agendar una cita.`;
                        window.open(
                          `${waUrl}&text=${encodeURIComponent(msg)}`,
                          '_blank',
                          'noopener,noreferrer'
                        );
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Consultar por WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
