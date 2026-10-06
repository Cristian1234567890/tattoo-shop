import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Star,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  Building2,
  User,
  Image as ImageIcon,
  Filter,
} from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { useCurrency } from '../context/CurrencyContext';
import { useGuestGate } from '../context/GuestGateContext';
import { SendSketchModal } from '../components/hub/SendSketchModal';
import { formatWhatsAppUrl } from '../utils/whatsapp';
import { ResidentArtist, StudioLocation } from '../types';

const CATALOG_DATA: StudioLocation[] = [
  {
    id: 'obsidian',
    type: 'studio',
    name: 'Obsidian Atelier & Flash Lab',
    tagline: 'Colectivo de Arte Oscuro & Cybersigilism',
    description: 'Estudio especializado en geometría biomecánica, neo-tribal y piezas de alto contraste en piel.',
    banner: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 142,
    verified: true,
    address: 'Calle 50, Bella Vista, Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    country: 'Panamá',
    distance: '2.4 km',
    artistsCount: 3,
    residents: [
      {
        id: 'artist-kaelen',
        name: 'Kaelen Silva',
        alias: 'Void',
        avatar: '/assets/GB Tattoo.jpg',
        bio: 'Especialista en neo-tribal, cybersigilism, geometría oscura y blackwork biomecánico.',
        specialties: ['Cybersigilism', 'Blackwork', 'Neo-Tribal'],
        hourlyRate: 80,
        availableToday: true,
        whatsapp: { number: '60012345', prefix: '507' },
        flashes: [
          { id: 'f1', title: 'Sigil Core 01', amount: 120, img: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=300&q=80' },
          { id: 'f2', title: 'Neo-Tribal Spine', amount: 150, img: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=300&q=80' },
        ],
      },
      {
        id: 'artist-maya',
        name: 'Maya Lin',
        alias: 'Thorne',
        avatar: '/assets/GB.jpeg',
        bio: 'Ornamental botánico de alta precisión, puntillismo sutil y micro-estructuras simétricas.',
        specialties: ['Dotwork', 'Ornamental', 'Fine Line'],
        hourlyRate: 75,
        availableToday: true,
        whatsapp: { number: '61119988', prefix: '507' },
        flashes: [
          { id: 'f3', title: 'Flor de Loto Sagrada', amount: 110, img: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=300&q=80' },
        ],
      },
      {
        id: 'artist-carlos',
        name: 'Carlos Ruiz',
        alias: 'Neon',
        avatar: '/assets/1571.jpg',
        bio: 'Cyberpunk futurista, estética glitch y tatuajes con tintas reactivas UV.',
        specialties: ['Cyberpunk', 'Glitch Art', 'Color'],
        hourlyRate: 90,
        availableToday: false,
        whatsapp: { number: '62224455', prefix: '507' },
        flashes: [
          { id: 'f4', title: 'Circuit Cyber Run', amount: 140, img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=300&q=80' },
        ],
      },
    ],
  },
  {
    id: 'neon-ink',
    type: 'studio',
    name: 'Neon Ink Studio',
    tagline: 'Realismo a Color & Retratos de Alto Impacto',
    description: 'Estudio de referencia en Chiriquí para realismo botánico, retratos y cobertura de cicatrices.',
    banner: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 96,
    verified: true,
    address: 'Barrio Bolívar, Calle 3ra, David, Chiriquí',
    city: 'David',
    country: 'Panamá',
    distance: '3.1 km',
    artistsCount: 2,
    residents: [
      {
        id: 'artist-cristian',
        name: 'Cristian Castillo',
        alias: 'Castillo Ink',
        avatar: '/assets/GB.jpeg',
        bio: 'Maestro del realismo a color, contraste saturado y retratos realistas.',
        specialties: ['Realismo', 'Retratos', 'Color'],
        hourlyRate: 70,
        availableToday: true,
        whatsapp: { number: '67894321', prefix: '507' },
        flashes: [
          { id: 'f5', title: 'Ojo Hiperrealista', amount: 160, img: 'https://images.unsplash.com/photo-1621847468516-1ed15271c480?auto=format&fit=crop&w=300&q=80' },
        ],
      },
      {
        id: 'artist-elena',
        name: 'Elena Vega',
        alias: 'Aquarelle',
        avatar: '/assets/1251.jpg',
        bio: 'Pintura en piel, efectos de acuarela líquida y micro-realismo botánico.',
        specialties: ['Acuarela', 'Micro-realismo', 'Fine Line'],
        hourlyRate: 65,
        availableToday: true,
        whatsapp: { number: '68991122', prefix: '507' },
        flashes: [
          { id: 'f6', title: 'Colibrí Acuarela', amount: 95, img: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=300&q=80' },
        ],
      },
    ],
  },
  {
    id: 'ana-valdes',
    type: 'independent',
    name: 'Ana Valdés Tattoo',
    tagline: 'Tatuadora Independiente • Tradicional Americano',
    description: 'Atelier privado por cita previa especializado en piezas clásicas bold line y paleta eterna.',
    banner: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 78,
    verified: true,
    address: 'Avenida Central, La Chorrera, Panamá Oeste',
    city: 'La Chorrera',
    country: 'Panamá',
    distance: '5.0 km',
    artistsCount: 1,
    residents: [
      {
        id: 'artist-ana',
        name: 'Ana Valdés',
        alias: 'Valdés Trad',
        avatar: '/assets/1571.jpg',
        bio: 'Líneas sólidas, paleta primaria eterna y clásica tradición marítima y americana.',
        specialties: ['Tradicional', 'Old School', 'Bold Lines'],
        hourlyRate: 65,
        availableToday: true,
        whatsapp: { number: '61112233', prefix: '507' },
        flashes: [
          { id: 'f7', title: 'Daga Tradicional', amount: 80, img: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=300&q=80' },
          { id: 'f8', title: 'Pantera Clásica', amount: 110, img: 'https://images.unsplash.com/photo-1621847468516-1ed15271c480?auto=format&fit=crop&w=300&q=80' },
        ],
      },
    ],
  },
  {
    id: 'chroma-gallery',
    type: 'studio',
    name: 'Chroma Gallery & Tattoo',
    tagline: 'Estudio de Arte Contemporáneo & Gran Formato',
    description: 'Espacio artístico multidisciplinario en San Francisco con sala de esterilización abierta al público.',
    banner: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewCount: 52,
    verified: true,
    address: 'Calle 74 San Francisco, Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    country: 'Panamá',
    distance: '7.2 km',
    artistsCount: 2,
    residents: [
      {
        id: 'artist-valeria',
        name: 'Valeria Ríos',
        alias: 'Val FineLine',
        avatar: '/assets/GB Tattoo.jpg',
        bio: 'Fine line minimalista y tipografía anatómica.',
        specialties: ['Fine Line', 'Minimalista'],
        hourlyRate: 60,
        availableToday: true,
        whatsapp: { number: '62223344', prefix: '507' },
        flashes: [
          { id: 'f9', title: 'Trazo Continuo Floral', amount: 70, img: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=300&q=80' },
        ],
      },
      {
        id: 'artist-diego',
        name: 'Diego López',
        alias: 'Oriental Diego',
        avatar: '/assets/1251.jpg',
        bio: 'Irezumi japonés moderno, dragones y olas tradicionales.',
        specialties: ['Japonés', 'Irezumi', 'Neotradicional'],
        hourlyRate: 85,
        availableToday: false,
        whatsapp: { number: '69001122', prefix: '507' },
        flashes: [
          { id: 'f10', title: 'Máscara Hannya', amount: 130, img: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=300&q=80' },
        ],
      },
    ],
  },
];

const STYLE_FILTERS = [
  'Todos',
  'Realismo',
  'Blackwork',
  'Neotradicional',
  'Tradicional',
  'Fine Line',
  'Cybersigilism',
  'Dotwork',
  'Acuarela',
];

export const ArtistsDirectoryPage: React.FC = () => {
  const { formatPrice } = useCurrency();
  const { requireAuth } = useGuestGate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState<'all' | 'studio' | 'independent'>('all');

  // Track the active selected resident artist for each studio card
  const [selectedResidentByStudio, setSelectedResidentByStudio] = useState<Record<string, string>>({
    obsidian: 'artist-kaelen',
    'neon-ink': 'artist-cristian',
    'chroma-gallery': 'artist-valeria',
  });

  // Modal de envío de bocetos
  const [sketchModalOpen, setSketchModalOpen] = useState(false);
  const [sketchTarget, setSketchTarget] = useState<{ id: string; name: string } | null>(null);

  const filteredItems = useMemo(() => {
    return CATALOG_DATA.filter((item) => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.address.toLowerCase().includes(query) ||
        (item.city && item.city.toLowerCase().includes(query)) ||
        (item.residents &&
          item.residents.some(
            (r) =>
              r.name.toLowerCase().includes(query) ||
              (r.alias && r.alias.toLowerCase().includes(query)) ||
              r.specialties.some((s) => s.toLowerCase().includes(query))
          ));

      const matchesStyle =
        selectedStyle === 'Todos' ||
        (item.residents &&
          item.residents.some((r) =>
            r.specialties.some((s) => s.toLowerCase() === selectedStyle.toLowerCase())
          ));

      return matchesType && matchesSearch && matchesStyle;
    });
  }, [searchTerm, selectedStyle, typeFilter]);

  const handleSelectResident = (studioId: string, residentId: string) => {
    setSelectedResidentByStudio((prev) => ({ ...prev, [studioId]: residentId }));
  };

  const handleContactWhatsApp = (studio: StudioLocation, resident: ResidentArtist) => {
    requireAuth(
      () => {
        const text = `¡Hola ${resident.alias || resident.name}! Vi tu trabajo en ${studio.name} en Tattoo Hub y me gustaría agendar una consulta.`;
        const url = formatWhatsAppUrl(resident.whatsapp.number, resident.whatsapp.prefix, text);
        window.open(url, '_blank', 'noopener,noreferrer');
      },
      {
        title: `Contactar a ${resident.alias || resident.name}`,
        message: `Para iniciar chat directo por WhatsApp con ${resident.name} (${studio.name}), crea tu cuenta o inicia sesión en Tattoo Hub.`,
        redirectUrl: '/artistas',
      }
    );
  };

  const handleSendSketch = (studio: StudioLocation, resident: ResidentArtist) => {
    requireAuth(
      () => {
        setSketchTarget({ id: resident.id, name: `${resident.name} (${studio.name})` });
        setSketchModalOpen(true);
      },
      {
        title: `Enviar Boceto a ${resident.alias || resident.name}`,
        message: `Para enviar tu boceto a ${resident.name} para su evaluación anatómica, inicia sesión en Tattoo Hub.`,
        redirectUrl: '/artistas',
      }
    );
  };

  return (
    <PageTransition>
      <div className="bg-[#0B0B0E] min-h-screen text-zinc-300 font-sans flex flex-col selection:bg-violet-500/30">
        {/* Send Sketch Modal */}
        {sketchTarget && (
          <SendSketchModal
            isOpen={sketchModalOpen}
            onClose={() => setSketchModalOpen(false)}
            artistId={sketchTarget.id}
            artistName={sketchTarget.name}
          />
        )}

        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 w-full">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-widest uppercase text-violet-400 bg-violet-600/10 px-4 py-1.5 rounded-full border border-violet-500/20 mb-4 inline-block">
              DIRECTORIO GEOLOCALIZADO DE TALLERES
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Estudios y Artistas Residentes
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed">
              Explora locales físicos y artistas independientes. Contacta directamente a cada residente sin comisiones corporativas.
            </p>
          </div>

          {/* Search Bar & Type Filter */}
          <div className="atelier-card p-4 rounded-2xl mb-8 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por estudio, residente, ciudad o estilo..."
                  className="input-atelier w-full pl-10"
                />
              </div>

              {/* Type Filter Buttons */}
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === 'all'
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  Todos ({CATALOG_DATA.length})
                </button>
                <button
                  onClick={() => setTypeFilter('studio')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    typeFilter === 'studio'
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Estudios
                </button>
                <button
                  onClick={() => setTypeFilter('independent')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    typeFilter === 'independent'
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Independientes
                </button>
              </div>
            </div>

            {/* Style Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-violet-400" /> Estilo:
              </span>
              {STYLE_FILTERS.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedStyle === style
                      ? 'bg-violet-600/30 text-violet-300 border border-violet-500/50 font-bold'
                      : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredItems.map((studio) => {
              const activeResidentId =
                selectedResidentByStudio[studio.id] ||
                (studio.residents && studio.residents[0]?.id);
              const activeResident =
                studio.residents?.find((r) => r.id === activeResidentId) ||
                studio.residents?.[0];

              return (
                <div
                  key={studio.id}
                  className="atelier-card rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl"
                >
                  <div>
                    {/* Banner & Header */}
                    <div className="relative h-44 w-full">
                      <img
                        src={studio.banner}
                        alt={studio.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

                      {/* Studio Type Badge */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {studio.type === 'studio' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-950/90 text-violet-300 border border-violet-500/50 flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                            <Building2 className="w-3.5 h-3.5 text-violet-300" />
                            <span>{studio.artistsCount} Artistas Residentes</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-900/90 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                            <User className="w-3.5 h-3.5 text-zinc-300" />
                            <span>Tatuador Independiente</span>
                          </span>
                        )}
                      </div>

                      {/* Header Info */}
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-white leading-tight">
                              {studio.name}
                            </h3>
                            {studio.verified && (
                              <CheckCircle2 className="w-4 h-4 text-violet-400 fill-violet-400/20" />
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-violet-400" />
                            {studio.address} • {studio.distance}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-zinc-900/90 px-2.5 py-1 rounded-md text-xs font-bold text-white border border-zinc-800 backdrop-blur-md">
                          <Star className="w-3.5 h-3.5 text-violet-400 fill-violet-400" />
                          {studio.rating}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-5">
                      <p className="text-xs text-zinc-400 leading-relaxed">{studio.description}</p>

                      {/* RESIDENT ARTIST SELECTOR (Multi-Artist Studio Hierarchy) */}
                      {studio.type === 'studio' && studio.residents && studio.residents.length > 0 && (
                        <div className="p-4 bg-zinc-950/70 rounded-2xl border border-zinc-800/80">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Artistas en este Local:
                            </span>
                            <span className="text-[11px] text-zinc-500">Haz clic para elegir</span>
                          </div>

                          {/* Concentric Violet Avatar Rings */}
                          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                            {studio.residents.map((resident) => {
                              const isSelected = activeResident?.id === resident.id;
                              return (
                                <button
                                  key={resident.id}
                                  onClick={() => handleSelectResident(studio.id, resident.id)}
                                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all shrink-0 text-left cursor-pointer ${
                                    isSelected
                                      ? 'bg-violet-950/80 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.4)] text-white'
                                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                  }`}
                                >
                                  <div
                                    className={`relative w-8 h-8 rounded-full overflow-hidden p-0.5 ${
                                      isSelected
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
                                    <div className="text-xs font-bold text-white">
                                      {resident.alias || resident.name}
                                    </div>
                                    <div className="text-[10px] text-zinc-400 truncate max-w-[85px]">
                                      {resident.specialties[0]}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ACTIVE RESIDENT DETAILS */}
                      {activeResident && (
                        <div className="space-y-3 pt-1 border-t border-zinc-800/80">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs text-zinc-500">Residente a contactar:</span>
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

                          <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                            {activeResident.bio}
                          </p>

                          {/* Specialties */}
                          <div className="flex flex-wrap gap-1.5">
                            {activeResident.specialties.map((spec, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>

                          {/* Available Flashes with dynamic formatPrice */}
                          {activeResident.flashes && activeResident.flashes.length > 0 && (
                            <div className="pt-2">
                              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                                Flashes de {activeResident.alias || activeResident.name}:
                              </span>
                              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                                {activeResident.flashes.map((flash) => (
                                  <div
                                    key={flash.id}
                                    className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-zinc-800 group"
                                  >
                                    <img
                                      src={flash.img}
                                      alt={flash.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  {activeResident && (
                    <div className="p-6 pt-0 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Send Sketch Button */}
                        <button
                          onClick={() => handleSendSketch(studio, activeResident)}
                          className="w-full bg-zinc-900 hover:bg-zinc-800 border border-violet-500/30 text-violet-300 hover:text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ImageIcon className="w-4 h-4 text-violet-400" />
                          Enviar Boceto
                        </button>

                        {/* WhatsApp Contact Button */}
                        <button
                          onClick={() => handleContactWhatsApp(studio, activeResident)}
                          className="w-full bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default ArtistsDirectoryPage;
