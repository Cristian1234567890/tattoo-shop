import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  MessageCircle,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { TattooTimeline, ProgressItem } from './TattooTimeline';
import { ProgressDetailModal } from './ProgressDetailModal';
import { UploadProgressModal } from './UploadProgressModal';

export interface ClientTrackedTattoo {
  id: string;
  title: string;
  zone: string;
  style: string;
  startedAt: string;
  currentPhase: string;
  phaseDays: string;
  progressPercent: number;
  coverImage: string;
  artist: {
    id: string;
    name: string;
    handle: string;
    studio: string;
    avatar: string;
    phonePrefix: string;
    whatsappNumber: string;
  };
  seenStatus: {
    seen: boolean;
    seenAt: string;
    relativeTime: string;
  };
  feedback: {
    date: string;
    status: string;
    rating: number;
    message: string;
    recommendations: string[];
  };
  requiredProducts: Array<{
    id: string;
    name: string;
    role: string;
    instructions: string;
    icon: string;
    checked?: boolean;
  }>;
  entries: ProgressItem[];
}

const DEFAULT_CLIENT_TATTOOS: ClientTrackedTattoo[] = [
  {
    id: 'tattoo-dragon-back',
    title: 'Dragón Oriental en Espalda Completa',
    zone: 'Espalda Completa',
    style: 'Irezumi Japonés',
    startedAt: '10 Oct 2026',
    currentPhase: 'Fase 2: Descamación & Hidratación',
    phaseDays: 'Día 6 de 14',
    progressPercent: 65,
    coverImage: '/assets/placeholder-tattoo.png',
    artist: {
      id: 'artist-gabriel',
      name: 'Gabriel Bianchi',
      handle: '@gabriel_tattoo',
      studio: 'Atelier Ink Studio Central',
      avatar: '/assets/GB Tattoo.jpg',
      phonePrefix: '+507',
      whatsappNumber: '61234567',
    },
    seenStatus: {
      seen: true,
      seenAt: 'Hoy a las 14:35',
      relativeTime: 'hace 25 min',
    },
    feedback: {
      date: 'Hoy, 14:35',
      status: 'Evolución Óptima (100% Favorable)',
      rating: 5,
      message:
        'Excelente fijación del pigmento en las sombras del lomo y escamas. La fase descamativa avanza de manera uniforme sin zonas irritadas ni pérdida de tinta.',
      recommendations: [
        'Lavar suavemente con agua fría/tibia 2 veces al día usando solo las yemas de los dedos.',
        'Secar únicamente a toques suaves con toalla de papel absorbente limpia, jamás frotar.',
        'Aplicar una capa ultrafina de ungüento con D-Pantenol; la piel debe respirar sin brillo excesivo.',
        'No tirar de ninguna escama suelta; deja que se desprendan naturalmente durante el lavado.',
      ],
    },
    requiredProducts: [
      {
        id: 'p1',
        name: 'Jabón Neutro con Clorhexidina o Glicerina (pH 5.5)',
        role: 'Limpieza e Higiene Diaria',
        instructions: 'Usar mañana y noche antes de cada aplicación de crema para remover impurezas.',
        icon: '🧼',
      },
      {
        id: 'p2',
        name: 'Ungüento Cicatrizante con D-Pantenol (Bepanthol o Tattoo Care)',
        role: 'Regeneración Epitelial',
        instructions: 'Capa muy fina 3 veces al día en la zona descamativa para mantener elasticidad.',
        icon: '🧴',
      },
      {
        id: 'p3',
        name: 'Ropa Holgada 100% Algodón',
        role: 'Protección Mecánica',
        instructions: 'Evita telas sintéticas y fricción directa mientras las escamas terminan de caer.',
        icon: '👕',
      },
    ],
    entries: [
      {
        id: 'dragon-entry-1',
        client_id: 'client-1',
        title: 'Sesión Finalizada - Líneas y Sombra Base',
        notes: 'Recién vendado en estudio con film curativo transpirable. Ligero ardor normal.',
        image_url: '/assets/placeholder-tattoo.png',
        stage: 'Fase 1: Limpieza & Primer Vendaje',
        date: '10 Oct 2026',
        session_number: 1,
        artist: {
          id: 'artist-gabriel',
          full_name: 'Gabriel Bianchi',
          avatar_url: '/assets/GB Tattoo.jpg',
          phone_prefix: '+507',
          whatsapp_number: '61234567',
        },
      },
      {
        id: 'dragon-entry-2',
        client_id: 'client-1',
        title: 'Inicio de Descamación en Escamas Centrales',
        notes: 'Comienzan a formarse pequeñas escamas finas sin enrojecimiento. Se aplica ungüento 3x al día.',
        image_url: '/assets/placeholder-tattoo.png',
        stage: 'Fase 2: Descamación & Hidratación',
        date: '14 Oct 2026',
        session_number: 2,
        artist: {
          id: 'artist-gabriel',
          full_name: 'Gabriel Bianchi',
          avatar_url: '/assets/GB Tattoo.jpg',
          phone_prefix: '+507',
          whatsapp_number: '61234567',
        },
      },
    ],
  },
  {
    id: 'tattoo-rose-forearm',
    title: 'Rosa Neotradicional en Antebrazo',
    zone: 'Antebrazo Derecho',
    style: 'Neotradicional Full Color',
    startedAt: '25 Sep 2026',
    currentPhase: 'Fase 3: Cicatrización & Protección',
    phaseDays: 'Día 22 de 30',
    progressPercent: 90,
    coverImage: '/assets/placeholder-tattoo.png',
    artist: {
      id: 'artist-elena',
      name: 'Elena Rostova',
      handle: '@elena_ink',
      studio: 'Black Rose Atelier',
      avatar: '/assets/Tattoo Machine Rotary.png',
      phonePrefix: '+507',
      whatsappNumber: '68765432',
    },
    seenStatus: {
      seen: true,
      seenAt: 'Ayer a las 18:20',
      relativeTime: 'hace 1 día',
    },
    feedback: {
      date: '21 Oct, 18:20',
      status: 'Curación Avanzada (Excelente Estado)',
      rating: 5,
      message:
        'Los contrastes entre el carmín y los verdes esmeralda se conservan radiantes. La epidermis ya está completamente cerrada. Ahora el objetivo es nutrir y proteger del sol.',
      recommendations: [
        'Cambiar a loción hidratante diaria sin fragancias para mantener el brillo y tono de los colores.',
        'Aplicación indispensable de bloqueador solar FPS 50+ siempre que salgas al aire libre.',
        'Tu piel está lista para la sesión de fotos final del portafolio del estudio.',
      ],
    },
    requiredProducts: [
      {
        id: 'p4',
        name: 'Protector Solar Invisible FPS 50+ (Filtro UV)',
        role: 'Preservación de Pigmentos de Color',
        instructions: 'Aplicar 15 minutos antes de la exposición solar. Reaplicar cada 2-3 horas.',
        icon: '☀️',
      },
      {
        id: 'p5',
        name: 'Loción Hidratante Corporal con Vitamina E',
        role: 'Nutrición Continua',
        instructions: 'Aplicar tras la ducha diaria para mantener la piel suave y los contrastes nítidos.',
        icon: '💧',
      },
    ],
    entries: [
      {
        id: 'rose-entry-1',
        client_id: 'client-1',
        title: 'Cicatrización Total y Brillo de Pigmento',
        notes: 'Piel suave sin escamas. Colores intensos y definidos.',
        image_url: '/assets/placeholder-tattoo.png',
        stage: 'Fase 3: Cicatrización & Protección',
        date: '20 Oct 2026',
        session_number: 1,
        artist: {
          id: 'artist-elena',
          full_name: 'Elena Rostova',
          avatar_url: '/assets/Tattoo Machine Rotary.png',
          phone_prefix: '+507',
          whatsapp_number: '68765432',
        },
      },
    ],
  },
  {
    id: 'tattoo-sacred-chest',
    title: 'Geometría Sagrada & Mandala en Pecho',
    zone: 'Pectoral Izquierdo',
    style: 'Dotwork & Fine Line',
    startedAt: '22 Oct 2026',
    currentPhase: 'Fase 1: Limpieza & Primer Vendaje',
    phaseDays: 'Día 1 de 3',
    progressPercent: 20,
    coverImage: '/assets/placeholder-tattoo.png',
    artist: {
      id: 'artist-marcus',
      name: 'Marcus Vance',
      handle: '@marcus_geom',
      studio: 'Sacred Mandala Atelier',
      avatar: '/assets/GB Tattoo.jpg',
      phonePrefix: '+507',
      whatsappNumber: '67891234',
    },
    seenStatus: {
      seen: false,
      seenAt: 'Pendiente de revisión',
      relativeTime: 'subido hace 40 min',
    },
    feedback: {
      date: 'Pendiente',
      status: 'En Espera de Confirmación por el Artista',
      rating: 4,
      message:
        'Tu última fotografía está en la bandeja de revisión de Marcus. Recibirás una notificación y confirmación en cuanto revise el estado del vendaje dérmico.',
      recommendations: [
        'Mantén el parche dérmico puesto durante las primeras 24 horas si no hay acumulación excesiva de líquido.',
        'Si el parche se despega en los bordes, retíralo bajo agua tibia corriendo suavemente.',
      ],
    },
    requiredProducts: [
      {
        id: 'p6',
        name: 'Parche Dérmico Saniderm / Film Curativo Transpirable',
        role: 'Barrera Antibacteriana Inicial',
        instructions: 'Mantener colocado durante las primeras 24-48 horas según indicaciones.',
        icon: '🛡️',
      },
      {
        id: 'p7',
        name: 'Jabón Líquido Neutro Antibacterial',
        role: 'Higiene de Retiro',
        instructions: 'Lavar con abundante agua templada al momento de retirar el primer parche.',
        icon: '🧼',
      },
    ],
    entries: [
      {
        id: 'chest-entry-1',
        client_id: 'client-1',
        title: 'Primera Sesión: Trazos Finos y Sombra de Mandala',
        notes: 'Parche dérmico colocado en estudio. Todo en orden sin sangrado excesivo.',
        image_url: '/assets/placeholder-tattoo.png',
        stage: 'Fase 1: Limpieza & Primer Vendaje',
        date: '22 Oct 2026',
        session_number: 1,
        artist: {
          id: 'artist-marcus',
          full_name: 'Marcus Vance',
          avatar_url: '/assets/GB Tattoo.jpg',
          phone_prefix: '+507',
          whatsapp_number: '67891234',
        },
      },
    ],
  },
];

interface TattooLiveEvolutionSectionProps {
  isVip: boolean;
  lang?: 'es' | 'en';
  onOpenPaywall: () => void;
  user?: any;
  customEntries?: ProgressItem[];
  onOpenUploadExternal?: () => void;
}

export const TattooLiveEvolutionSection: React.FC<TattooLiveEvolutionSectionProps> = ({
  isVip,
  lang = 'es',
  onOpenPaywall,
  user,
  customEntries = [],
}) => {
  const isEn = lang === 'en';
  const [tattoos, setTattoos] = useState<ClientTrackedTattoo[]>(DEFAULT_CLIENT_TATTOOS);
  const [activeTattooId, setActiveTattooId] = useState<string>('tattoo-dragon-back');
  const [checkedProducts, setCheckedProducts] = useState<Record<string, boolean>>({
    p1: true,
    p2: true,
  });

  const [selectedDetailEntry, setSelectedDetailEntry] = useState<ProgressItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const activeTattoo =
    tattoos.find((t) => t.id === activeTattooId) || tattoos[0] || DEFAULT_CLIENT_TATTOOS[0];

  const toggleProductCheck = (productId: string) => {
    setCheckedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleOpenUpload = () => {
    if (!isVip) {
      onOpenPaywall();
      return;
    }
    setIsUploadModalOpen(true);
  };

  const handleProgressSaved = (newEntry: any) => {
    if (!newEntry) return;
    setTattoos((prev) =>
      prev.map((tat) => {
        if (tat.id === activeTattooId) {
          return {
            ...tat,
            entries: [newEntry, ...tat.entries],
          };
        }
        return tat;
      })
    );
  };

  const handleDeleteEntry = async (entryId: string) => {
    setTattoos((prev) =>
      prev.map((tat) => {
        if (tat.id === activeTattooId) {
          return {
            ...tat,
            entries: tat.entries.filter((e) => e.id !== entryId),
          };
        }
        return tat;
      })
    );
    setSelectedDetailEntry(null);
  };

  const artistWhatsAppUrl = activeTattoo.artist.whatsappNumber
    ? `https://wa.me/${activeTattoo.artist.phonePrefix.replace('+', '')}${activeTattoo.artist.whatsappNumber}?text=${encodeURIComponent(
        `Hola ${activeTattoo.artist.name}, te escribo desde Tattoo Hub para consultar sobre el seguimiento de mi tatuaje (${activeTattoo.title}).`
      )}`
    : null;

  // Combine server custom entries if available for active tattoo
  const displayedEntries =
    activeTattoo.entries.length > 0
      ? activeTattoo.entries
      : customEntries.length > 0
      ? customEntries
      : [];

  return (
    <div className="space-y-8" id="tattoo-evolution-hub">
      {/* 1. Header & Multi-Tattoo Selector Bar */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-heading">
                {isEn ? 'Live Evolution Gallery' : 'Galería de Evolución en Vivo'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                {tattoos.length} {isEn ? 'Tracked Tattoos' : 'Tatuajes en Registro'}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-600 dark:text-gray-400 mt-1">
              {isEn
                ? 'Select one of your tattoos to inspect photographic healing, clinical recommendations, and feedback from your artist.'
                : 'Selecciona uno de tus tatuajes para consultar el progreso fotográfico, recomendaciones clínicas y el feedback de tu tatuador.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenUpload}
            className="self-start md:self-auto inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 !text-white keep-white-text font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-lg transition hover:scale-105 cursor-pointer"
          >
            <Camera size={16} /> Subir Nueva Foto
          </button>
        </div>

        {/* Horizontal Tattoo Selector Tabs */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-3">
            Selecciona el Tatuaje en Seguimiento:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tattoos.map((tat) => {
              const isSelected = tat.id === activeTattooId;
              return (
                <div
                  key={tat.id}
                  onClick={() => setActiveTattooId(tat.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-left ${
                    isSelected
                      ? 'bg-violet-600/10 dark:bg-violet-500/15 border-violet-600 dark:border-violet-400 shadow-md ring-2 ring-violet-500/30'
                      : 'bg-slate-50 dark:bg-gray-800/40 hover:bg-slate-100 dark:hover:bg-gray-800/80 border-slate-200 dark:border-gray-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                        {tat.zone}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        {tat.progressPercent}%
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1">
                      {tat.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1">
                      <span>🎨</span> {tat.artist.name}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/80 dark:border-gray-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-gray-400">{tat.currentPhase.split(':')[0]}</span>
                    <span className="text-violet-600 dark:text-violet-400 font-semibold">{tat.phaseDays}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Active Tattoo Status & Assigned Tracking Artist Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Tattooer with Seen Indicator */}
        <div className="lg:col-span-1 backdrop-blur-xl bg-white/80 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                Tatuador en Seguimiento
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Verificado
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={activeTattoo.artist.avatar}
                alt={activeTattoo.artist.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-violet-500 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/Tattoo Machine Rotary.png';
                }}
              />
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {activeTattoo.artist.name}
                </h3>
                <span className="text-xs text-violet-600 dark:text-violet-400 font-medium block">
                  {activeTattoo.artist.handle}
                </span>
                <span className="text-xs text-slate-500 dark:text-gray-400 block mt-0.5">
                  {activeTattoo.artist.studio}
                </span>
              </div>
            </div>

            {/* Seen by Artist Status Pill */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700/80 mb-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  Estado de Revisión:
                </span>
                {activeTattoo.seenStatus.seen ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 size={11} /> Visto por el artista
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Clock size={11} /> Pendiente de revisión
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">
                {activeTattoo.seenStatus.seen
                  ? `${activeTattoo.seenStatus.seenAt} (${activeTattoo.seenStatus.relativeTime})`
                  : 'El tatuador revisará tus fotos en las próximas horas.'}
              </p>
            </div>
          </div>

          {/* Quick Chat with Artist */}
          {artistWhatsAppUrl && (
            <a
              href={artistWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 !text-white keep-white-text font-bold text-xs py-2.5 px-4 rounded-xl shadow transition"
            >
              <MessageCircle size={15} /> Consultar por WhatsApp
            </a>
          )}
        </div>

        {/* Center & Right Column: Feedback & Clinical Recommendations */}
        <div className="lg:col-span-2 backdrop-blur-xl bg-white/80 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Retroalimentación & Recomendaciones Médicas del Tatuador
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                {activeTattoo.feedback.status}
              </span>
            </div>

            {/* Feedback Message */}
            <div className="bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 rounded-xl p-4 mb-4">
              <p className="text-sm text-slate-800 dark:text-gray-200 leading-relaxed font-body">
                "{activeTattoo.feedback.message}"
              </p>
              <span className="text-[11px] text-slate-400 dark:text-gray-500 block text-right mt-2">
                — {activeTattoo.artist.name} · {activeTattoo.feedback.date}
              </span>
            </div>

            {/* Bulleted Clinical Checklist */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-2">
              Puntos Clave para esta Fase:
            </h4>
            <div className="space-y-2">
              {activeTattoo.feedback.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-gray-300 bg-white/60 dark:bg-gray-900/50 p-2.5 rounded-lg border border-slate-200/80 dark:border-gray-800/80"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <span>Fase activa: <strong>{activeTattoo.currentPhase}</strong></span>
            <span>Inicio: {activeTattoo.startedAt}</span>
          </div>
        </div>
      </div>

      {/* 3. Needed Products Kit (Checklist for Current Phase) */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Kit de Productos Necesarios para esta Fase ({activeTattoo.currentPhase.split(':')[0]})
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Verifica los insumos recomendados por tu tatuador para garantizar una cicatrización libre de infecciones.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">
            {Object.values(checkedProducts).filter(Boolean).length} de {activeTattoo.requiredProducts.length} listos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activeTattoo.requiredProducts.map((prod) => {
            const isChecked = Boolean(checkedProducts[prod.id]);
            return (
              <div
                key={prod.id}
                onClick={() => toggleProductCheck(prod.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isChecked
                    ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-gray-800/40 border-slate-200 dark:border-gray-800 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                    isChecked
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                  }`}
                >
                  {isChecked && <Check size={13} className="text-white" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{prod.icon}</span>
                    <h5
                      className={`text-xs font-bold ${
                        isChecked
                          ? 'text-emerald-800 dark:text-emerald-300 line-through opacity-80'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {prod.name}
                    </h5>
                  </div>
                  <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 block mb-1">
                    {prod.role}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed">
                    {prod.instructions}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Photographic Timeline Track for Active Tattoo */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              Diario Fotográfico: {activeTattoo.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Fotos secuenciales de curación vinculadas con tu tatuador en el estudio.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenUpload}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover !text-white keep-white-text font-bold text-xs px-4 py-2 rounded-xl shadow transition hover:scale-105 cursor-pointer"
          >
            <Camera size={14} /> Subir Avance
          </button>
        </div>

        <TattooTimeline
          entries={displayedEntries}
          onOpenUpload={handleOpenUpload}
          onSelectEntry={(entry) => setSelectedDetailEntry(entry)}
          onDeleteEntry={handleDeleteEntry}
          isLoading={false}
        />
      </div>

      {/* Lightbox Detail Modal */}
      <ProgressDetailModal
        entry={selectedDetailEntry}
        onClose={() => setSelectedDetailEntry(null)}
        onDelete={handleDeleteEntry}
        isOwner={true}
      />

      {/* Upload Modal with Supabase Integration */}
      <UploadProgressModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        userId={user?.id || 'demo-user'}
        onProgressSaved={handleProgressSaved}
      />
    </div>
  );
};
