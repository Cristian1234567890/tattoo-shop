import { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  List,
  Map as MapIcon,
  Star,
  ChevronRight,
  MessageCircle,
  Building2,
  User,
  Users,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useGuestGate } from '../context/GuestGateContext';
import { SendSketchModal } from '../components/hub/SendSketchModal';
import { formatWhatsAppUrl } from '../utils/whatsapp';
import { ResidentArtist, StudioLocation } from '../types';

const STUDIOS_DATA: StudioLocation[] = [
  {
    id: 'obsidian',
    type: 'studio',
    name: 'Obsidian Atelier & Flash Lab',
    tagline: 'Colectivo de Arte Oscuro & Cybersigilism',
    description: 'Estudio profesional con artistas residentes de alto nivel en geometría oscura y blackwork.',
    banner: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 142,
    verified: true,
    address: 'Bella Vista, Calle 50, Ciudad de Panamá',
    distance: '2.4 km',
    mapPin: { x: '40%', y: '50%' },
    artistsCount: 3,
    residents: [
      {
        id: 'artist-kaelen',
        name: 'Kaelen Silva',
        alias: 'Void',
        avatar: '/assets/GB Tattoo.jpg',
        bio: 'Especialista en neo-tribal, cybersigilism, geometría oscura y blackwork biomecánico.',
        specialties: ['Cybersigilism', 'Neo-Tribal', 'Geometría Oscura'],
        hourlyRate: 80,
        availableToday: true,
        whatsapp: { number: '60012345', prefix: '507' },
        flashes: [
          { id: 'f1', title: 'Sigil Core 01', amount: 120, img: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=300&q=80' },
          { id: 'f2', title: 'Neo-Tribal Spine', amount: 150, img: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=300&q=80' },
          { id: 'f3', title: 'Dark Mandala', amount: 90, img: 'https://images.unsplash.com/photo-1621847468516-1ed15271c480?auto=format&fit=crop&w=300&q=80' },
        ],
      },
      {
        id: 'artist-maya',
        name: 'Maya Lin',
        alias: 'Thorne',
        avatar: '/assets/GB.jpeg',
        bio: 'Ornamental botánico de alta precisión, puntillismo sutil y micro-estructuras simétricas.',
        specialties: ['Ornamental', 'Dotwork', 'Botánico'],
        hourlyRate: 75,
        availableToday: true,
        whatsapp: { number: '61119988', prefix: '507' },
        flashes: [
          { id: 'f4', title: 'Flor de Loto Sagrada', amount: 110, img: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=300&q=80' },
          { id: 'f5', title: 'Enredadera de Espinas', amount: 85, img: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=300&q=80' },
        ],
      },
      {
        id: 'artist-carlos',
        name: 'Carlos Ruiz',
        alias: 'Neon',
        avatar: '/assets/1571.jpg',
        bio: 'Cyberpunk futurista, estética glitch y tatuajes con tintas reactivas UV.',
        specialties: ['Cyberpunk', 'Glitch Art', 'UV Reactive'],
        hourlyRate: 90,
        availableToday: false,
        whatsapp: { number: '62224455', prefix: '507' },
        flashes: [
          { id: 'f6', title: 'Circuit Cyber Run', amount: 140, img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=300&q=80' },
        ],
      },
    ],
  },
  {
    id: 'neon-ink',
    type: 'studio',
    name: 'Neon Ink Studio',
    tagline: 'Realismo a Color & Retratos de Alto Impacto',
    description: 'Estudio líder en Chiriquí para piezas de realismo y micro-detalle.',
    banner: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 96,
    verified: true,
    address: 'Barrio Bolívar, Calle 3ra, David, Chiriquí',
    distance: '3.1 km',
    mapPin: { x: '60%', y: '30%' },
    artistsCount: 2,
    residents: [
      {
        id: 'artist-cristian',
        name: 'Cristian Castillo',
        alias: 'Castillo Ink',
        avatar: '/assets/GB.jpeg',
        bio: 'Maestro del realismo a color, contraste saturado y retratos realistas.',
        specialties: ['Realismo Color', 'Retratos'],
        hourlyRate: 70,
        availableToday: true,
        whatsapp: { number: '67894321', prefix: '507' },
        flashes: [
          { id: 'f7', title: 'Ojo Hiperrealista', amount: 160, img: 'https://images.unsplash.com/photo-1621847468516-1ed15271c480?auto=format&fit=crop&w=300&q=80' },
        ],
      },
      {
        id: 'artist-elena',
        name: 'Elena Vega',
        alias: 'Aquarelle',
        avatar: '/assets/1251.jpg',
        bio: 'Pintura en piel, efectos de acuarela líquida y micro-realismo botánico.',
        specialties: ['Acuarela', 'Micro-realismo'],
        hourlyRate: 65,
        availableToday: true,
        whatsapp: { number: '68991122', prefix: '507' },
        flashes: [
          { id: 'f8', title: 'Colibrí Acuarela', amount: 95, img: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=300&q=80' },
        ],
      },
    ],
  },
  {
    id: 'ana-valdes',
    type: 'independent',
    name: 'Ana Valdés Tattoo',
    tagline: 'Tatuadora Independiente • Tradicional Americano',
    description: 'Atelier privado por cita previa especializado en tradicional americano de línea gruesa.',
    banner: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 78,
    verified: true,
    address: 'Avenida Central, La Chorrera, Panamá Oeste',
    distance: '5.0 km',
    mapPin: { x: '25%', y: '70%' },
    artistsCount: 1,
    residents: [
      {
        id: 'artist-ana',
        name: 'Ana Valdés',
        alias: 'Valdés Trad',
        avatar: '/assets/1571.jpg',
        bio: 'Líneas sólidas, paleta primaria eterna y clásica tradición marítima y americana.',
        specialties: ['Tradicional', 'Old School'],
        hourlyRate: 65,
        availableToday: true,
        whatsapp: { number: '61112233', prefix: '507' },
        flashes: [
          { id: 'f9', title: 'Daga Tradicional', amount: 80, img: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=300&q=80' },
          { id: 'f10', title: 'Pantera Clásica', amount: 110, img: 'https://images.unsplash.com/photo-1621847468516-1ed15271c480?auto=format&fit=crop&w=300&q=80' },
        ],
      },
    ],
  },
  {
    id: 'chroma-gallery',
    type: 'studio',
    name: 'Chroma Gallery & Tattoo',
    tagline: 'Estudio de Arte Contemporáneo & Gran Formato',
    description: 'Espacio artístico multidisciplinario en San Francisco con bioseguridad visible.',
    banner: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewCount: 52,
    verified: true,
    address: 'Calle 74 San Francisco, Ciudad de Panamá',
    distance: '7.2 km',
    mapPin: { x: '75%', y: '65%' },
    artistsCount: 2,
    residents: [
      {
        id: 'artist-valeria',
        name: 'Valeria Ríos',
        alias: 'Val FineLine',
        avatar: '/assets/GB Tattoo.jpg',
        bio: 'Fine line minimalista y tipografía cursiva anatómica.',
        specialties: ['Minimalista', 'Fine Line'],
        hourlyRate: 60,
        availableToday: true,
        whatsapp: { number: '62223344', prefix: '507' },
        flashes: [
          { id: 'f11', title: 'Trazo Continuo Floral', amount: 70, img: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=300&q=80' },
        ],
      },
      {
        id: 'artist-diego',
        name: 'Diego López',
        alias: 'Oriental Diego',
        avatar: '/assets/1251.jpg',
        bio: 'Irezumi japonés moderno, dragones y olas tradicionales.',
        specialties: ['Japonés', 'Irezumi'],
        hourlyRate: 85,
        availableToday: false,
        whatsapp: { number: '69001122', prefix: '507' },
        flashes: [
          { id: 'f12', title: 'Máscara Hannya', amount: 130, img: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=300&q=80' },
        ],
      },
    ],
  },
];

export default function ArtistsHubPage() {
  const { formatPrice } = useCurrency();
  const { requireAuth } = useGuestGate();

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [typeFilter, setTypeFilter] = useState<'all' | 'studio' | 'independent'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selección de Local/Estudio Activo
  const [activeStudioId, setActiveStudioId] = useState<string>('obsidian');
  // Selección del Artista Residente Específico dentro del Estudio
  const [selectedResidentId, setSelectedResidentId] = useState<string>('artist-kaelen');

  // Estado para el modal de bocetos (SendSketchModal)
  const [sketchModalOpen, setSketchModalOpen] = useState(false);
  const [sketchTarget, setSketchTarget] = useState<{ id: string; name: string } | null>(null);

  // Filtrado de Locales
  const filteredStudios = useMemo(() => {
    return STUDIOS_DATA.filter((s) => {
      const matchesType = typeFilter === 'all' ? true : s.type === typeFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query) ||
        (s.residents &&
          s.residents.some(
            (r) =>
              r.name.toLowerCase().includes(query) ||
              (r.alias && r.alias.toLowerCase().includes(query)) ||
              r.specialties.some((sp) => sp.toLowerCase().includes(query))
          ));
      return matchesType && matchesSearch;
    });
  }, [typeFilter, searchQuery]);

  // Estudio seleccionado actualmente
  const activeStudio = useMemo(() => {
    return STUDIOS_DATA.find((s) => s.id === activeStudioId) || STUDIOS_DATA[0];
  }, [activeStudioId]);

  // Artista Residente seleccionado dentro del Estudio
  const activeResident = useMemo(() => {
    if (!activeStudio.residents || activeStudio.residents.length === 0) {
      return null;
    }
    return (
      activeStudio.residents.find((r) => r.id === selectedResidentId) ||
      activeStudio.residents[0]
    );
  }, [activeStudio, selectedResidentId]);

  // Manejar cambio de Estudio (reajusta automáticamente al primer artista del estudio)
  const handleSelectStudio = (studioId: string) => {
    setActiveStudioId(studioId);
    const targetStudio = STUDIOS_DATA.find((s) => s.id === studioId);
    if (targetStudio && targetStudio.residents && targetStudio.residents.length > 0) {
      setSelectedResidentId(targetStudio.residents[0].id);
    }
  };

  // 1. Acción de Contacto por WhatsApp al Artista Específico
  const handleContactWhatsApp = (resident: ResidentArtist, studio: StudioLocation) => {
    requireAuth(
      () => {
        const text = `¡Hola ${resident.name}! Vi tu trabajo en ${studio.name} a través de Tattoo Hub y me gustaría cotizar un tatuaje estilo ${resident.specialties[0]}.`;
        const url = formatWhatsAppUrl(resident.whatsapp.number, resident.whatsapp.prefix, text);
        window.open(url, '_blank', 'noopener,noreferrer');
      },
      {
        title: `Contactar a ${resident.alias || resident.name}`,
        message: `Para iniciar chat directo por WhatsApp con ${resident.name} (${studio.name}), regístrate gratis en Tattoo Hub.`,
        redirectUrl: `/hub?studio=${studio.id}&artist=${resident.id}`,
      }
    );
  };

  // 2. Acción de Envío de Boceto al Artista Específico
  const handleSendSketch = (resident: ResidentArtist, studio: StudioLocation) => {
    requireAuth(
      () => {
        setSketchTarget({ id: resident.id, name: `${resident.name} (${studio.name})` });
        setSketchModalOpen(true);
      },
      {
        title: `Enviar Boceto a ${resident.alias || resident.name}`,
        message: `Para enviar tu boceto a ${resident.name} para su evaluación, crea tu cuenta en Tattoo Hub.`,
        redirectUrl: `/hub?studio=${studio.id}&artist=${resident.id}`,
      }
    );
  };

  // 3. Acción de Reserva de Turno / Flash Book
  const handleReserveFlash = (
    flashTitle: string,
    flashAmount: number,
    resident: ResidentArtist
  ) => {
    requireAuth(
      () => {
        alert(`¡Cupo apartado para "${flashTitle}" (${formatPrice(flashAmount)}) con ${resident.name}! Se notificará al artista.`);
      },
      {
        title: `Apartar Flash con ${resident.alias || resident.name}`,
        message: `Para reservar este diseño flash con ${resident.name}, regístrate en Tattoo Hub.`,
        redirectUrl: `/hub?studio=${activeStudio.id}&artist=${resident.id}`,
      }
    );
  };

  return (
    <div className="flex-1 relative flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Modal de Envío de Bocetos */}
      {sketchTarget && (
        <SendSketchModal
          isOpen={sketchModalOpen}
          onClose={() => setSketchModalOpen(false)}
          artistId={sketchTarget.id}
          artistName={sketchTarget.name}
        />
      )}

      <main className="flex-1 relative flex overflow-hidden w-full h-full">
        {/* MAPA INTERACTIVO CON PINES DISTINGUIDOS */}
        <div
          data-testid="hub-map-container"
          className="absolute inset-0 bg-zinc-950 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px]"
        >
          {filteredStudios.map((studio) => {
            const isActive = activeStudio.id === studio.id;
            const pinPosition = studio.mapPin || { x: '50%', y: '50%' };

            return (
              <div
                key={studio.id}
                data-testid="studio-pin"
                data-studio-id={studio.id}
                className="absolute flex flex-col items-center cursor-pointer transition-transform hover:scale-110 z-20"
                style={{
                  left: pinPosition.x,
                  top: pinPosition.y,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => handleSelectStudio(studio.id)}
              >
                {/* Pin Head */}
                <div className="relative">
                  {studio.type === 'studio' ? (
                    // PIN DE ESTUDIO (Múltiples residentes)
                    <div
                      className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border transition-all ${
                        isActive
                          ? 'bg-violet-600 border-violet-300 text-white shadow-[0_0_25px_rgba(139,92,246,0.9)] scale-110'
                          : 'bg-zinc-900/95 border-violet-500/50 text-violet-300 hover:border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.35)]'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-violet-200" />
                      <span className="text-xs font-black tracking-tight">{studio.artistsCount}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 hidden sm:inline">
                        Artistas
                      </span>
                    </div>
                  ) : (
                    // PIN DE ARTISTA INDEPENDIENTE
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                        isActive
                          ? 'bg-violet-600 border-white text-white shadow-[0_0_20px_rgba(139,92,246,0.85)] scale-110'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      <User className="w-4 h-4" />
                    </div>
                  )}

                  {/* Triángulo inferior del Pin */}
                  <div
                    className={`w-2 h-2 mx-auto rotate-45 -mt-1 ${
                      isActive ? 'bg-violet-600' : 'bg-zinc-900 border-r border-b border-violet-500/40'
                    }`}
                  />
                </div>

                {/* Etiqueta flotante del Pin */}
                <div
                  className={`mt-1.5 text-xs font-medium px-2.5 py-1 rounded-lg backdrop-blur-md transition-all ${
                    isActive
                      ? 'text-white bg-zinc-900/95 border border-violet-500/60 shadow-xl'
                      : 'text-zinc-400 bg-zinc-950/80 border border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">{studio.name}</span>
                    {studio.type === 'studio' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-950 text-violet-300 font-bold border border-violet-800/60">
                        {studio.artistsCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DRAWER LATERAL / PANEL FLOTANTE DE DETALLES */}
        <div className="relative z-30 w-full md:w-[480px] h-full flex flex-col p-3 md:p-4 pointer-events-none">
          <div
            data-testid="studio-drawer"
            className="flex-1 w-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl flex flex-col overflow-hidden pointer-events-auto shadow-2xl"
          >
            {/* Barra Superior de Búsqueda y Filtros */}
            <div className="p-4 border-b border-zinc-800 space-y-3 bg-zinc-950/50">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  type="text"
                  data-testid="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar estudio, artista o estilo..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                {/* Selector de Tipo: Todos / Estudios / Independientes */}
                <div className="flex gap-1.5 p-1 bg-zinc-950 rounded-lg border border-zinc-800/80">
                  <button
                    data-testid="filter-type-all"
                    onClick={() => setTypeFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      typeFilter === 'all'
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    data-testid="filter-type-studio"
                    onClick={() => setTypeFilter('studio')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      typeFilter === 'studio'
                        ? 'bg-violet-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Building2 className="w-3 h-3" /> Estudios
                  </button>
                  <button
                    data-testid="filter-type-independent"
                    onClick={() => setTypeFilter('independent')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      typeFilter === 'independent'
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <User className="w-3 h-3" /> Independientes
                  </button>
                </div>

                {/* Toggle Vista Mapa / Lista */}
                <div className="flex p-1 bg-zinc-950 rounded-lg border border-zinc-800/80">
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'map' ? 'bg-zinc-800 text-white' : 'text-zinc-500'
                    }`}
                    aria-label="Ver Mapa"
                  >
                    <MapIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500'
                    }`}
                    aria-label="Ver Lista"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido con Scroll: Tarjeta del Estudio & Artistas Residentes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* TARJETA DEL ESTUDIO / LOCAL ACTIVO */}
              <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-xl">
                {/* Banner & Identidad del Estudio */}
                <div className="relative h-36 w-full">
                  <img
                    src={activeStudio.banner}
                    alt={activeStudio.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

                  {/* Insignia de Estudio vs Independiente */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {activeStudio.type === 'studio' ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-violet-950/90 text-violet-300 border border-violet-500/50 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                        <Users className="w-3.5 h-3.5" /> {activeStudio.artistsCount} Artistas Residentes
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-900/90 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                        <User className="w-3.5 h-3.5" /> Artista Independiente
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-lg font-bold text-white leading-tight">
                          {activeStudio.name}
                        </h3>
                        {activeStudio.verified && (
                          <CheckCircle2 className="w-4 h-4 text-violet-400 fill-violet-400/20" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-violet-400" />
                        {activeStudio.address} • {activeStudio.distance}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-zinc-900/90 px-2 py-1 rounded-md text-xs font-semibold text-white border border-zinc-800">
                      <Star className="w-3 h-3 text-violet-400 fill-violet-400" />
                      {activeStudio.rating}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* SELECTOR DE ARTISTAS RESIDENTES (Multi-artista Studio Hierarchy) */}
                  {activeStudio.type === 'studio' &&
                    activeStudio.residents &&
                    activeStudio.residents.length > 0 && (
                      <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Artistas en este Local:
                          </span>
                          <span className="text-[11px] text-zinc-500">Selecciona para contactar</span>
                        </div>

                        {/* Concentric Violet Avatar Rings */}
                        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                          {activeStudio.residents.map((resident) => {
                            const isResidentSelected = activeResident?.id === resident.id;
                            return (
                              <button
                                key={resident.id}
                                data-testid="resident-artist-pill"
                                data-resident-id={resident.id}
                                onClick={() => setSelectedResidentId(resident.id)}
                                className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all shrink-0 text-left cursor-pointer ${
                                  isResidentSelected
                                    ? 'bg-violet-950/80 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.4)] text-white'
                                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                }`}
                              >
                                <div
                                  className={`relative w-8 h-8 rounded-full overflow-hidden p-0.5 ${
                                    isResidentSelected
                                      ? 'ring-2 ring-violet-500 ring-offset-1 ring-offset-zinc-950'
                                      : ''
                                  }`}
                                >
                                  <img
                                    src={resident.avatar}
                                    alt={resident.name}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                </div>
                                <div className="leading-tight">
                                  <div className="text-xs font-bold text-white flex items-center gap-1">
                                    {resident.alias || resident.name}
                                  </div>
                                  <div className="text-[10px] text-zinc-400 truncate max-w-[90px]">
                                    {resident.specialties[0]}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* BIO Y DETALLES DEL ARTISTA RESIDENTE SELECCIONADO */}
                  {activeResident && (
                    <div className="space-y-2 border-b border-zinc-800/80 pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-zinc-400 font-medium">Artista a contactar:</span>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            {activeResident.name}
                            {activeResident.alias && (
                              <span className="text-xs font-semibold text-violet-400">
                                "{activeResident.alias}"
                              </span>
                            )}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                            Tarifa Base
                          </span>
                          <span className="text-xs font-extrabold text-violet-300">
                            {formatPrice(activeResident.hourlyRate || 70)}/h
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">{activeResident.bio}</p>

                      {/* Chips de Especialidades */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeResident.specialties.map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FLASHES DISPONIBLES DEL ARTISTA SELECCIONADO */}
                  {activeResident && activeResident.flashes && activeResident.flashes.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Flashes de {activeResident.alias || activeResident.name}
                        </h4>
                        <span className="text-[11px] text-violet-400 hover:text-violet-300 cursor-pointer">
                          Ver catálogo ({activeResident.flashes.length})
                        </span>
                      </div>

                      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                        {activeResident.flashes.map((flash) => (
                          <div
                            key={flash.id}
                            data-testid="flash-card-item"
                            onClick={() =>
                              handleReserveFlash(
                                flash.title,
                                flash.amount || flash.price || 90,
                                activeResident
                              )
                            }
                            className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 group cursor-pointer border border-zinc-800 hover:border-violet-500 transition-colors"
                          >
                            <img
                              src={flash.img}
                              alt={flash.title}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-zinc-950/85 py-0.5 px-1 flex justify-center">
                              <span className="text-[10px] font-black text-violet-300">
                                {formatPrice(flash.amount || flash.price || 90)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BOTONES DE ACCIÓN: WHATSAPP, BOCETOS Y AGENDAMIENTO */}
                  {activeResident && (
                    <div className="space-y-2 pt-2">
                      {/* 1. Botón Principal de Reserva / Flash Book */}
                      <button
                        id="btn-reservar-cupo"
                        data-testid="btn-reservar-flash"
                        onClick={() =>
                          handleReserveFlash(
                            'Reserva General',
                            activeResident.hourlyRate || 70,
                            activeResident
                          )
                        }
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(124,58,237,0.35)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Reservar con {activeResident.alias || activeResident.name}
                      </button>

                      {/* 2. Botón de Envío de Bocetos */}
                      <button
                        data-testid="btn-enviar-boceto"
                        onClick={() => handleSendSketch(activeResident, activeStudio)}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 border border-violet-500/30 text-violet-300 hover:text-violet-200 text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4 text-violet-400" />
                        Enviar Boceto a {activeResident.alias || activeResident.name}
                      </button>

                      {/* 3. Botón de Contacto por WhatsApp */}
                      <div className="pt-1 flex items-center justify-between">
                        <button
                          data-testid="btn-whatsapp-direct"
                          onClick={() => handleContactWhatsApp(activeResident, activeStudio)}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                          Contactar por WhatsApp ({activeResident.alias || activeResident.name})
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* OTROS ESTUDIOS Y LOCALES EN EL DIRECTORIO (Tarjetas Colapsadas) */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Otros Locales & Artistas Cercanos
                </h3>

                {filteredStudios
                  .filter((s) => s.id !== activeStudio.id)
                  .map((studio) => (
                    <div
                      key={studio.id}
                      data-testid="other-studio-card"
                      data-other-studio-id={studio.id}
                      onClick={() => handleSelectStudio(studio.id)}
                      className="flex items-center gap-3 p-3 bg-zinc-950/60 border border-zinc-800/70 rounded-xl hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                        <img
                          src={studio.banner}
                          alt={studio.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white truncate">{studio.name}</h4>
                          {studio.type === 'studio' ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-950 text-violet-300 font-bold border border-violet-800/40 shrink-0">
                              {studio.artistsCount} Residentes
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium shrink-0">
                              Indep.
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">
                          {studio.residents?.map((r) => r.alias || r.name).join(', ')} •{' '}
                          {studio.distance}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(82, 82, 91, 0.4); border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(82, 82, 91, 0.7); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
