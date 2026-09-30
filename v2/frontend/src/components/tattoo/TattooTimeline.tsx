import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Camera,
  Trash2,
  Maximize2,
  Tag,
  ChevronRight,
  Filter,
} from 'lucide-react';

export interface ProgressItem {
  id: string;
  client_id: string;
  artist_id?: string | null;
  title: string;
  notes?: string;
  image_url: string;
  stage: string;
  session_number?: number;
  date: string;
  created_at?: string;
  metadata?: {
    storage_path?: string;
    file_size?: number;
    healing_rating?: number;
    body_part?: string;
    [key: string]: any;
  };
  artist?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    phone_prefix?: string;
    whatsapp_number?: string;
  } | null;
}

interface TattooTimelineProps {
  entries: ProgressItem[];
  onOpenUpload: () => void;
  onSelectEntry: (entry: ProgressItem) => void;
  onDeleteEntry?: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const TattooTimeline: React.FC<TattooTimelineProps> = ({
  entries,
  onOpenUpload,
  onSelectEntry,
  onDeleteEntry,
  isLoading = false,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortAscending, setSortAscending] = useState<boolean>(false);

  // Filtering stages
  const filteredEntries = entries
    .filter((item) => {
      if (selectedFilter === 'all') return true;
      return (item.stage || '').toLowerCase().includes(selectedFilter.toLowerCase());
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || a.created_at || 0).getTime();
      const dateB = new Date(b.date || b.created_at || 0).getTime();
      return sortAscending ? dateA - dateB : dateB - dateA;
    });

  const getStageBadgeStyle = (stage: string) => {
    const s = (stage || '').toLowerCase();
    if (s.includes('fase 1') || s.includes('limpieza')) {
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
    if (s.includes('fase 2') || s.includes('descamación') || s.includes('descamacion') || s.includes('hidratación')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    if (s.includes('fase 3') || s.includes('cicatrización') || s.includes('cicatrizacion')) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
  };

  return (
    <div className="w-full">
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-gray-900/60 p-4 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter size={16} className="text-gray-400 shrink-0 mr-1" />
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedFilter === 'all'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Todas ({entries.length})
          </button>
          <button
            onClick={() => setSelectedFilter('fase 1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedFilter === 'fase 1'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Fase 1: Limpieza
          </button>
          <button
            onClick={() => setSelectedFilter('fase 2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedFilter === 'fase 2'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Fase 2: Descamación
          </button>
          <button
            onClick={() => setSelectedFilter('fase 3')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedFilter === 'fase 3'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Fase 3: Cicatrizado
          </button>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            onClick={() => setSortAscending(!sortAscending)}
            className="text-xs text-gray-400 hover:text-gray-200 transition flex items-center gap-1.5 bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700"
          >
            <Clock size={14} />
            <span>{sortAscending ? 'Más antiguos primero' : 'Más recientes primero'}</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition transform hover:scale-105"
          >
            <Camera size={14} /> Subir Foto
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-gray-400 text-sm">Cargando tu línea de tiempo...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredEntries.length === 0 && (
        <div className="bg-gray-900/40 border border-dashed border-gray-800 rounded-3xl p-10 text-center flex flex-col items-center justify-center my-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
            <Camera size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No hay registros de progreso todavía</h3>
          <p className="text-gray-400 text-sm max-w-md mb-6 leading-relaxed">
            Comienza a documentar la evolución de tus tatuajes, los cuidados diarios y las fases de curación compartidas con tu artista.
          </p>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition transform hover:scale-105"
          >
            <Camera size={16} /> Subir Primera Fotografía
          </button>
        </div>
      )}

      {/* Chronological Timeline Track */}
      {!isLoading && filteredEntries.length > 0 && (
        <div className="relative pl-6 md:pl-10 my-4 space-y-8 before:absolute before:left-2.5 md:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-indigo-500 before:to-purple-800">
          <AnimatePresence>
            {filteredEntries.map((entry, idx) => (
              <motion.div
                key={entry.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="relative flex items-start gap-4 md:gap-6 group"
              >
                {/* Timeline Dot Node */}
                <div className="absolute -left-6 md:-left-10 top-3 flex items-center justify-center">
                  <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-gray-950 border-2 border-primary group-hover:border-purple-400 transition-all flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-primary group-hover:bg-purple-300"></div>
                  </div>
                </div>

                {/* Timeline Card */}
                <div className="flex-1 bg-gray-900/80 border border-gray-800 hover:border-primary/50 transition-all rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-sm overflow-hidden flex flex-col md:flex-row gap-6">
                  {/* Photo Preview Thumbnail */}
                  <div
                    onClick={() => onSelectEntry(entry)}
                    className="relative w-full md:w-56 h-56 md:h-48 rounded-xl overflow-hidden bg-gray-950 shrink-0 cursor-pointer group/photo border border-gray-800"
                  >
                    <img
                      src={entry.image_url || '/assets/placeholder-tattoo.png'}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-white text-xs font-semibold flex items-center gap-1.5 drop-shadow">
                        <Maximize2 size={14} /> Ver en detalle
                      </span>
                    </div>
                  </div>

                  {/* Entry Information */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Stage & Date Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStageBadgeStyle(
                            entry.stage
                          )}`}
                        >
                          {entry.stage}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar size={13} className="text-gray-500" />
                          <span>{entry.date || 'Sin fecha'}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-primary transition">
                        {entry.title}
                      </h4>

                      {/* Notes / Aftercare observations */}
                      {entry.notes && (
                        <p className="text-gray-300 text-sm leading-relaxed mb-4 bg-gray-950/40 p-3 rounded-xl border border-gray-800/80">
                          {entry.notes}
                        </p>
                      )}
                    </div>

                    {/* Footer Row: Tagged Artist & Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-800/80 mt-auto">
                      {entry.artist ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={entry.artist.avatar_url || '/assets/Tattoo Machine Rotary.png'}
                            alt={entry.artist.full_name || 'Artista'}
                            className="w-7 h-7 rounded-full object-cover border border-purple-500/50"
                          />
                          <span className="text-xs text-gray-300 font-medium">
                            {entry.artist.full_name || 'Artista del Estudio'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Tag size={13} />
                          <span>Registro Personal</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {onDeleteEntry && (
                          <button
                            onClick={() => onDeleteEntry(entry.id)}
                            className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition"
                            title="Eliminar registro"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => onSelectEntry(entry)}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-semibold px-2 py-1"
                        >
                          Detalles <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default TattooTimeline;
