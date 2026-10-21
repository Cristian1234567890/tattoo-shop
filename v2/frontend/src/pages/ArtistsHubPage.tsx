import { useState, useMemo, useEffect } from 'react';
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
  Clock,
  X,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link, useSearchParams } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useGuestGate } from '../context/GuestGateContext';
import { useGeolocation } from '../context/GeolocationContext';
import { SendSketchModal } from '../components/hub/SendSketchModal';
import { formatWhatsAppUrl } from '../utils/whatsapp';
import { api } from '../api/client';
import {
  DEFAULT_COORDINATES,
  SAMPLE_HUB_ARTISTS,
  normalizeHubArtist,
} from '../utils/geo';
import { ResidentArtist, StudioLocation } from '../types';

/**
 * Child controller to smoothly re-center the Leaflet map
 */
function MapRecenter({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || map.getZoom(), { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

/**
 * Controller to ensure Leaflet tiles have accessibility metadata and presentation role
 */
function MapTileA11yFix() {
  const map = useMap();
  useEffect(() => {
    const fixTiles = () => {
      const container = map.getContainer();
      if (!container) return;
      const tiles = container.querySelectorAll<HTMLImageElement>('.leaflet-tile');
      tiles.forEach((t) => {
        if (!t.getAttribute('alt')) {
          t.setAttribute('alt', 'Sección del mapa de estudios y artistas');
          t.setAttribute('role', 'presentation');
        }
      });
    };
    fixTiles();
    map.on('tileload', fixTiles);
    map.on('moveend', fixTiles);
    return () => {
      map.off('tileload', fixTiles);
      map.off('moveend', fixTiles);
    };
  }, [map]);
  return null;
}

/**
 * Safely format studio opening hours from string or dictionary to human-readable text
 */
export function formatOpeningHours(hours: any): string {
  if (!hours) return 'Lun - Sáb: 10:00 - 20:00';
  if (typeof hours === 'string') return hours;
  if (typeof hours === 'object') {
    const dayLabels: Record<string, string> = {
      mon: 'Lun',
      tue: 'Mar',
      wed: 'Mié',
      thu: 'Jue',
      fri: 'Vie',
      sat: 'Sáb',
      sun: 'Dom',
    };
    const parts: string[] = [];
    for (const [k, v] of Object.entries(hours)) {
      const label = dayLabels[k.toLowerCase()] || k;
      parts.push(`${label}: ${v}`);
    }
    return parts.join(' | ') || 'Lun - Sáb: 10:00 - 20:00';
  }
  return String(hours);
}

/**
 * Controller to smoothly transition Leaflet map tile colors between dark and light themes without remounting
 */
function MapThemeTransitionController({ isDark }: { isDark: boolean }) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;
    if (isDark) {
      container.classList.add('dark-map-tiles');
      container.classList.remove('light-map-tiles');
    } else {
      container.classList.remove('dark-map-tiles');
      container.classList.add('light-map-tiles');
    }
    // Seamless reactive tile refresh without reloading page or losing state
    requestAnimationFrame(() => {
      try {
        map.invalidateSize({ animate: false });
      } catch {}
    });
  }, [isDark, map]);
  return null;
}

const UserGpsIcon = L.divIcon({
  className: 'user-gps-marker',
  html: `<div class="relative flex items-center justify-center">
    <div class="w-6 h-6 rounded-full bg-violet-500/30 animate-ping absolute"></div>
    <div class="w-4 h-4 rounded-full bg-violet-500 border-2 border-white shadow-lg relative z-10"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

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
    lat: 8.9824,
    lng: -79.5199,
    mapPin: { x: '40%', y: '50%' },
    opening_hours: 'Lun - Sáb: 10:00 - 20:00',
    reviews: [
      { id: 'rev-obs-1', user: 'Andrés M.', author: 'Andrés M.', rating: 5, comment: 'Higiene de grado médico y diseño custom insuperable.', date: '15 Oct 2026' },
      { id: 'rev-obs-2', user: 'Sofía T.', author: 'Sofía T.', rating: 5, comment: 'El blackwork con Kaelen quedó legendario.', date: '08 Oct 2026' }
    ],
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
        name: 'Carlos Mendoza',
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
    description: 'Estudio líder en Chiriquí y Panamá para piezas de realismo y micro-detalle.',
    banner: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 96,
    verified: true,
    address: 'El Cangrejo, Vía Argentina, Ciudad de Panamá / Chiriquí',
    distance: '1.8 km',
    lat: 8.9912,
    lng: -79.5150,
    mapPin: { x: '60%', y: '30%' },
    opening_hours: 'Lun - Sáb: 11:00 - 21:00',
    reviews: [
      { id: 'rev-neon-1', user: 'Roberto D.', author: 'Roberto D.', rating: 5, comment: 'Retratos a color hiperrealistas impecables.', date: '10 Oct 2026' }
    ],
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
    address: 'Obarrio, Calle 54 Este, Ciudad de Panamá',
    distance: '3.0 km',
    lat: 8.9870,
    lng: -79.5120,
    mapPin: { x: '25%', y: '70%' },
    opening_hours: 'Mar - Sáb: 12:00 - 20:00',
    reviews: [
      { id: 'rev-ana-1', user: 'Gabriel C.', author: 'Gabriel C.', rating: 5, comment: 'Tradicional clásico con líneas sólidas eternas.', date: '02 Oct 2026' }
    ],
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
    lat: 8.9880,
    lng: -79.4980,
    mapPin: { x: '75%', y: '65%' },
    opening_hours: 'Lun - Dom: 10:00 - 22:00',
    reviews: [
      { id: 'rev-chr-1', user: 'Diana F.', author: 'Diana F.', rating: 4, comment: 'Excelente espacio artístico y gran ambiente.', date: '28 Sep 2026' }
    ],
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
  {
    id: 'black-pearl-casco',
    type: 'studio',
    name: 'Black Pearl Studio Casco Viejo',
    tagline: 'Blackwork de Vanguardia & Geometría Sagrada',
    description: 'Estudio de alta costura en el corazón histórico de Casco Antiguo frente a Plaza Herrera.',
    banner: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviewCount: 168,
    verified: true,
    address: 'Plaza Herrera, Calle 9na Oeste, Casco Antiguo, Ciudad de Panamá',
    distance: '1.8 km',
    lat: 8.9525,
    lng: -79.5342,
    mapPin: { x: '35%', y: '60%' },
    opening_hours: 'Mar - Dom: 11:00 - 21:00',
    reviews: [
      { id: 'rev-bp-1', user: 'Mateo R.', author: 'Mateo R.', rating: 5, comment: 'El mejor estudio en Casco Antiguo, atención de primera.', date: '12 Oct 2026' }
    ],
    artistsCount: 2,
    residents: [
      {
        id: 'artist-cristian-bp',
        name: 'Cristian Castillo',
        alias: 'Castillo Ink',
        avatar: '/assets/GB.jpeg',
        bio: 'Blackwork pesado, contraste extremo, anatomía oscura y geometría sagrada.',
        specialties: ['Blackwork', 'Geometría', 'Dark Art'],
        hourlyRate: 75,
        availableToday: true,
        whatsapp: { number: '67894321', prefix: '507' },
        flashes: [
          { id: 'f13', title: 'Calavera Barroca', amount: 140, img: 'https://images.unsplash.com/photo-1621847468516-1ed15271c480?auto=format&fit=crop&w=300&q=80' },
          { id: 'f14', title: 'Geometría Aural', amount: 110, img: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=300&q=80' },
        ],
      },
      {
        id: 'artist-sofia-bp',
        name: 'Sofía Arango',
        alias: 'Aura Dot',
        avatar: '/assets/GB Tattoo.jpg',
        bio: 'Puntillismo milimétrico, mandalas arquitectónicos y diseño ornamental.',
        specialties: ['Dotwork', 'Ornamental', 'Mandalas'],
        hourlyRate: 70,
        availableToday: true,
        whatsapp: { number: '64431188', prefix: '507' },
        flashes: [
          { id: 'f15', title: 'Mandala Solar', amount: 125, img: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=300&q=80' },
        ],
      },
    ],
  },
];

/**
 * Creates custom Leaflet HTML DivIcon for studios and independent artists
 */
function createStudioIcon(studio: StudioLocation, isActive: boolean) {
  const isStudio = studio.type === 'studio';
  const badgeHtml = isStudio
    ? `<div class="px-3 py-1.5 rounded-full flex items-center gap-1.5 border transition-all ${
        isActive
          ? 'bg-violet-600 border-violet-300 text-white shadow-[0_0_25px_rgba(139,92,246,0.9)] scale-110'
          : 'bg-zinc-900/95 border-violet-500/50 text-violet-300 hover:border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.35)]'
      }">
        <svg class="w-3.5 h-3.5 text-violet-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
        <span class="text-xs font-black tracking-tight">${studio.artistsCount || 1}</span>
        <span class="text-[10px] font-bold uppercase tracking-wider opacity-90 hidden sm:inline">Artistas</span>
      </div>`
    : `<div class="w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
        isActive
          ? 'bg-violet-600 border-white text-white shadow-[0_0_20px_rgba(139,92,246,0.85)] scale-110'
          : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
      }">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
      </div>`;

  const html = `
    <div
      data-testid="studio-pin"
      data-studio-id="${studio.id}"
      class="studio-pin-wrapper relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110 z-20"
      style="pointer-events: auto;"
    >
      <div class="relative">
        ${badgeHtml}
        <div class="w-2 h-2 mx-auto rotate-45 -mt-1 ${
          isActive ? 'bg-violet-600' : 'bg-zinc-900 border-r border-b border-violet-500/40'
        }"></div>
      </div>
      <div class="mt-1.5 text-xs font-medium px-2.5 py-1 rounded-lg backdrop-blur-md transition-all whitespace-nowrap ${
        isActive
          ? 'text-white bg-zinc-900/95 border border-violet-500/60 shadow-xl'
          : 'text-zinc-400 bg-zinc-950/80 border border-zinc-800'
      }">
        <div class="flex items-center gap-1.5">
          <span class="font-semibold">${studio.name}</span>
          ${
            studio.type === 'studio'
              ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-violet-950 text-violet-300 font-bold border border-violet-800/60">${studio.artistsCount}</span>`
              : ''
          }
        </div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-studio-pin-icon',
    html,
    iconSize: [120, 50],
    iconAnchor: [60, 40],
    popupAnchor: [0, -40],
  });
}


export const TATTOO_STYLES = [
  'All',
  'Realismo',
  'Tradicional',
  'Blackwork',
  'Minimalista',
  'Neotradicional',
  'Fineline',
  'Geométrico',
  'Acuarela',
  'Lettering',
  'Japonés / Irezumi',
  'Puntillismo / Dotwork',
  'Surrealismo',
  'Anime / Manga',
  'Tribal / Polinesio',
  'Ignorant'
];

export default function ArtistsHubPage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { formatPrice } = useCurrency();
  const { requireAuth } = useGuestGate();
  const { coords: globalCoords, status: globalGeoStatus, requestLocation: requestGlobalLocation } = useGeolocation();

  const [searchParams, setSearchParams] = useSearchParams();
  const urlStudio = searchParams.get('studio');
  const urlArtist = searchParams.get('artist');
  const urlQuery = searchParams.get('q');
  const urlRating = searchParams.get('rating');
  const urlStyle = searchParams.get('style');

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [typeFilter, setTypeFilter] = useState<'all' | 'studio' | 'independent'>('all');
  const [searchQuery, setSearchQuery] = useState(urlQuery || '');
  const [filter, setFilter] = useState<string>(urlStyle || 'All');

  // Mapa interactivo y posicionamiento GPS
  const [mapCenter, setMapCenter] = useState<[number, number]>(globalCoords || [8.9750, -79.5050]);
  const [mapZoom, setMapZoom] = useState<number>(globalCoords ? 13 : 12);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(globalCoords);
  const [gpsStatus, setGpsStatus] = useState<'prompt' | 'granted' | 'denied'>(
    globalCoords ? 'granted' : (globalGeoStatus === 'denied' ? 'denied' : 'prompt')
  );
  const [artists, setArtists] = useState<any[]>([]);

  // Selección de Local/Estudio Activo
  const [minRatingFilter, setMinRatingFilter] = useState<number>(urlRating ? parseFloat(urlRating) : 0);
  const [studiosList, setStudiosList] = useState<StudioLocation[]>(STUDIOS_DATA);
  const [activeStudioId, setActiveStudioId] = useState<string | null>(urlStudio || null);
  // Selección del Artista Residente Específico dentro del Estudio
  const [selectedResidentId, setSelectedResidentId] = useState<string>(urlArtist || 'artist-kaelen');

  // Estado para modal de reseñas
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Estado para el modal de bocetos (SendSketchModal)
  const [sketchModalOpen, setSketchModalOpen] = useState(false);
  const [sketchTarget, setSketchTarget] = useState<{ id: string; name: string } | null>(null);

  // Carga de estudios desde la API backend sincronizados con el mapa interactivo
  useEffect(() => {
    let isMounted = true;
    const fetchStudios = async () => {
      try {
        const res = await api.getStudios({
          minRating: minRatingFilter > 0 ? minRatingFilter : undefined,
        });
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const backendStudios = res.data;
          setStudiosList((prev) => {
            const list = [...prev];
            backendStudios.forEach((backendStudio: any) => {
              const existingIndex = list.findIndex((s) => s.id === backendStudio.id);
              const normalizedStudio: StudioLocation = {
                id: backendStudio.id,
                type: 'studio',
                name: backendStudio.name,
                tagline: backendStudio.tagline || backendStudio.description?.slice(0, 55) || 'Estudio Profesional de Tatuajes',
                description: backendStudio.description || 'Estudio profesional verificado en Tattoo Hub.',
                banner: backendStudio.banner_url || backendStudio.banner || 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
                rating: Number(backendStudio.rating) || 5.0,
                reviewCount: backendStudio.review_count !== undefined ? backendStudio.review_count : (backendStudio.reviewCount || backendStudio.reviews?.length || 0),
                verified: Boolean(backendStudio.verified),
                address: backendStudio.address || 'Ciudad de Panamá',
                distance: backendStudio.distance || '2.5 km',
                lat: Number(backendStudio.lat) || 8.9824,
                lng: Number(backendStudio.lng) || -79.5199,
                mapPin: backendStudio.mapPin || { x: '50%', y: '50%' },
                opening_hours: formatOpeningHours(backendStudio.opening_hours),
                reviews: (backendStudio.reviews || []).map((r: any) => ({
                  id: r.id || `rev-${Math.random()}`,
                  user: r.client_name || r.user || 'Cliente',
                  author: r.client_name || r.author || 'Cliente',
                  rating: Number(r.rating) || 5,
                  comment: r.comment || '',
                  date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Reciente'
                })),
                artistsCount: (backendStudio.residents && backendStudio.residents.length) || 1,
                residents: (backendStudio.residents && backendStudio.residents.length > 0)
                  ? backendStudio.residents
                  : [
                      {
                        id: backendStudio.owner_id || `artist-${backendStudio.id}`,
                        name: backendStudio.name + ' Residente',
                        alias: 'Residente',
                        avatar: '/assets/GB Tattoo.jpg',
                        bio: backendStudio.description || 'Artista residente en ' + backendStudio.name,
                        specialties: ['General', 'Blackwork'],
                        hourlyRate: 75,
                        availableToday: true,
                        whatsapp: { number: '60000000', prefix: '507' },
                        flashes: []
                      }
                    ]
              };
              if (existingIndex >= 0) {
                list[existingIndex] = { ...list[existingIndex], ...normalizedStudio };
              } else {
                list.unshift(normalizedStudio);
              }
            });
            return list;
          });
        }
      } catch (err) {
        console.warn('Backend studios fetch error, keeping cached studios:', err);
      }
    };
    fetchStudios();
    return () => {
      isMounted = false;
    };
  }, [minRatingFilter]);

  // Sincronizar parámetros en URL para preservar estado ante refrescos o navegación
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeStudioId) params.set('studio', activeStudioId);
    if (selectedResidentId && activeStudioId) params.set('artist', selectedResidentId);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (minRatingFilter > 0) params.set('rating', String(minRatingFilter));
    if (filter && filter !== 'All') params.set('style', filter);
    setSearchParams(params, { replace: true });
  }, [activeStudioId, selectedResidentId, searchQuery, minRatingFilter, filter, setSearchParams]);

  // Sincronizar coordenadas globales del usuario
  useEffect(() => {
    if (globalCoords) {
      setUserCoords(globalCoords);
      setMapCenter(globalCoords);
      setGpsStatus('granted');
      setMapZoom(13);
    }
  }, [globalCoords]);

  // 1. Geolocalización automática y manual
  const requestUserLocation = async () => {
    const loc = await requestGlobalLocation();
    if (loc) {
      setUserCoords(loc);
      setMapCenter(loc);
      setGpsStatus('granted');
      setMapZoom(13);
    } else {
      setGpsStatus('denied');
      setMapCenter(DEFAULT_COORDINATES);
    }
  };

  // 2. Carga de artistas con fallback a SAMPLE_HUB_ARTISTS
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await api.getTattooArtists();
        if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
          setArtists(response.data);
        } else {
          setArtists(SAMPLE_HUB_ARTISTS);
        }
      } catch (err) {
        console.warn('Backend unavailable, falling back to SAMPLE_HUB_ARTISTS:', err);
        setArtists(SAMPLE_HUB_ARTISTS);
      }
    };
    fetchArtists();
  }, []);

  // 3. Normalización y ordenamiento de artistas
  const normalizedArtistsList = useMemo(() => {
    const source = artists.length > 0 ? artists : SAMPLE_HUB_ARTISTS;
    const normalized = source.map((a, i) => normalizeHubArtist(a, i, userCoords));
    if (!userCoords) {
      return [...normalized].sort((a, b) => b.worksCount - a.worksCount);
    }
    return [...normalized].sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [artists, userCoords]);

  // Log or consume normalized artists for debugging / telemetry
  if (normalizedArtistsList.length === 0) {
    // no-op guard
  }

  // Capturar clics delegados en los pines HTML de Leaflet
  useEffect(() => {
    const handleGlobalPinClick = (e: MouseEvent) => {
      const pinTarget = (e.target as HTMLElement).closest('[data-studio-id]');
      if (pinTarget) {
        const sId = pinTarget.getAttribute('data-studio-id');
        if (sId) {
          handleSelectStudio(sId);
        }
      }
    };
    document.addEventListener('click', handleGlobalPinClick);
    return () => document.removeEventListener('click', handleGlobalPinClick);
  }, []);

  // Filtrado de Locales por Tipo, Búsqueda, Estilo y Calificación
  const filteredStudios = useMemo(() => {
    return studiosList.filter((s) => {
      const matchesType = typeFilter === 'all' ? true : s.type === typeFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query)) ||
        (s.residents &&
          s.residents.some(
            (r) =>
              r.name.toLowerCase().includes(query) ||
              (r.alias && r.alias.toLowerCase().includes(query)) ||
              r.specialties.some((sp) => sp.toLowerCase().includes(query))
          ));

      const matchesStyle =
        filter === 'All'
          ? true
          : s.residents?.some((r) =>
              r.specialties.some((sp) => {
                const spLower = sp.toLowerCase();
                const fLower = filter.toLowerCase();
                if (fLower.includes('realis')) return spLower.includes('realis');
                if (fLower.includes('japon') || fLower.includes('irezumi')) return spLower.includes('japon') || spLower.includes('irezumi');
                if (fLower.includes('puntill') || fLower.includes('dotwork')) return spLower.includes('puntill') || spLower.includes('dotwork');
                if (fLower.includes('anime') || fLower.includes('manga')) return spLower.includes('anime') || spLower.includes('manga');
                if (fLower.includes('tribal') || fLower.includes('polines')) return spLower.includes('tribal') || spLower.includes('polines');
                if (fLower.includes('geom')) return spLower.includes('geom');
                if (fLower.includes('acuar')) return spLower.includes('acuar');
                if (fLower.includes('letter')) return spLower.includes('letter');
                if (fLower.includes('line') || fLower.includes('fine')) return spLower.includes('fine') || spLower.includes('line');
                return spLower.includes(fLower);
              })
            );

      const matchesRating = minRatingFilter === 0 || (s.rating && s.rating >= minRatingFilter);

      return matchesType && matchesSearch && matchesStyle && matchesRating;
    });
  }, [studiosList, typeFilter, searchQuery, filter, minRatingFilter]);


  // Sugerencias de búsqueda predictiva categorizada (Estudios, Artistas y Estilos)
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return { studios: [], artists: [], styles: [] };

    const matchingStudios = studiosList.filter(
      (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchingArtists: { artist: ResidentArtist; studio: StudioLocation }[] = [];
    studiosList.forEach((s) => {
      s.residents?.forEach((r) => {
        if (
          r.name.toLowerCase().includes(q) ||
          (r.alias && r.alias.toLowerCase().includes(q)) ||
          r.specialties.some((sp) => sp.toLowerCase().includes(q))
        ) {
          if (!matchingArtists.some((ma) => ma.artist.id === r.id)) {
            matchingArtists.push({ artist: r, studio: s });
          }
        }
      });
    });

    const matchingStyles = TATTOO_STYLES.filter(
      (st) => st !== 'All' && st.toLowerCase().includes(q)
    ).slice(0, 4);

    return {
      studios: matchingStudios,
      artists: matchingArtists.slice(0, 4),
      styles: matchingStyles,
    };
  }, [studiosList, searchQuery]);

  // Estudio seleccionado actualmente
  const activeStudio = useMemo(() => {
    if (!activeStudioId) return null;
    return studiosList.find((s) => s.id === activeStudioId) || null;
  }, [studiosList, activeStudioId]);

  // Artista Residente seleccionado dentro del Estudio
  const activeResident = useMemo(() => {
    if (!activeStudio || !activeStudio.residents || activeStudio.residents.length === 0) {
      return null;
    }
    return (
      activeStudio.residents.find((r) => r.id === selectedResidentId) ||
      activeStudio.residents[0]
    );
  }, [activeStudio, selectedResidentId]);

  // Manejar cambio de Estudio (reajusta automáticamente al primer artista y centra el mapa)
  const handleSelectStudio = (studioId: string) => {
    setActiveStudioId(studioId);
    const targetStudio = studiosList.find((s) => s.id === studioId);
    if (targetStudio) {
      if (targetStudio.residents && targetStudio.residents.length > 0) {
        setSelectedResidentId(targetStudio.residents[0].id);
      }
      if (targetStudio.lat && targetStudio.lng) {
        setMapCenter([targetStudio.lat, targetStudio.lng]);
        setMapZoom(13);
      }
    }
  };

  // Manejar envío de Reseña a un Estudio
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudio || !reviewComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      const author = reviewAuthor.trim() || 'Cliente Verificado';
      await api.addStudioReview(activeStudio.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
        client_name: author,
      });
      const newReview = {
        id: `rev-${Date.now()}`,
        user: author,
        author: author,
        rating: reviewRating,
        comment: reviewComment.trim(),
        date: 'Hoy',
      };
      setStudiosList((prev) =>
        prev.map((s) =>
          s.id === activeStudio.id
            ? {
                ...s,
                reviews: [newReview, ...(s.reviews || [])],
                reviewCount: (s.reviewCount || 0) + 1,
              }
            : s
        )
      );
      setReviewComment('');
      setReviewModalOpen(false);
    } catch (err) {
      console.warn('Failed to submit review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // 1. Acción de Contacto por WhatsApp al Artista Específico (Protegido por GuestGate)
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

  // 2. Acción de Envío de Boceto al Artista Específico (Protegido por GuestGate)
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

  // 3. Acción de Reserva de Turno / Flash Book (Protegido por GuestGate)
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
        redirectUrl: `/hub?studio=${activeStudio?.id || ''}&artist=${resident.id}`,
      }
    );
  };

  return (
    <div className="flex-1 relative flex flex-col h-full min-h-0 overflow-hidden bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
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
        {/* MAPA INTERACTIVO REAL CON LEAFLET & OPENSTREETMAP */}
        <div
          data-testid="hub-map-container"
          className="absolute inset-0 z-0 bg-slate-100 dark:bg-zinc-950 overflow-hidden transition-colors duration-500"
        >
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            zoomControl={false}
            className={`w-full h-full z-0 ${isDark ? "dark-map-tiles" : "light-map-tiles"}`}
            style={{ width: '100%', height: '100%', minHeight: '400px' }}
          >
            {/* Zoom Controls */}
            <ZoomControl position="bottomright" />

            {/* Dynamic Re-centering, A11y and Theme transition controllers */}
            <MapRecenter center={mapCenter} zoom={mapZoom} />
            <MapTileA11yFix />
            <MapThemeTransitionController isDark={isDark} />

            {/* Dynamic Map Tiles: Smooth CSS filter transition without unmounting or reloading */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Marcador GPS pulsante del usuario */}
            {userCoords && (
              <Marker position={userCoords} icon={UserGpsIcon}>
                <Popup className="custom-popup">
                  <div className="p-2.5 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white rounded-xl text-xs font-bold border border-slate-200 dark:border-violet-500/30 flex items-center gap-2 shadow-2xl">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-ping"></div>
                    <span>📍 Tu ubicación actual</span>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Marcadores de Estudios y Locales */}
            {filteredStudios.map((studio) => {
              const isActive = activeStudio?.id === studio.id;
              const markerPos: [number, number] = [studio.lat || 8.9824, studio.lng || -79.5199];
              const resident = studio.residents?.[0];
              const artist = resident
                ? {
                    id: resident.id,
                    name: resident.name,
                    address: studio.address,
                    price: `${formatPrice(resident.hourlyRate || 70)}/h`,
                    whatsappUrl: formatWhatsAppUrl(resident.whatsapp.number, resident.whatsapp.prefix),
                    photoUrl: resident.avatar,
                    style: resident.specialties[0] || 'Blackwork',
                    distanceKm: studio.distance,
                  }
                : {
                    id: studio.id,
                    name: studio.name,
                    address: studio.address,
                    price: 'Consultar',
                    whatsappUrl: '',
                    photoUrl: studio.banner,
                    style: 'Estudio',
                    distanceKm: studio.distance,
                  };

              return (
                <Marker
                  key={studio.id}
                  position={markerPos}
                  icon={createStudioIcon(studio, isActive)}
                  eventHandlers={{
                    click: () => {
                      handleSelectStudio(studio.id);
                    },
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="w-72 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white rounded-2xl overflow-hidden shadow-2xl p-0 m-0 border border-slate-200 dark:border-violet-500/30">
                      <div className="relative h-28 w-full overflow-hidden bg-slate-100 dark:bg-zinc-900">
                        <img
                          src={studio.banner}
                          alt={studio.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-transparent to-transparent dark:from-zinc-950 dark:via-transparent dark:to-transparent" />
                        <span className="absolute bottom-2 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600/90 text-white backdrop-blur-sm">
                          {studio.type === 'studio' ? `${studio.artistsCount} Residentes` : 'Independiente'}
                        </span>
                        <span className="absolute bottom-2 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/90 text-white backdrop-blur-sm">
                          📍 {studio.distance}
                        </span>
                      </div>

                      <div className="p-3.5 space-y-2.5">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{studio.name}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-violet-500 dark:text-violet-400 shrink-0" />
                            {studio.address}
                          </p>
                        </div>

                        {resident && (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800">
                            <img src={resident.avatar} alt={resident.name} className="w-7 h-7 rounded-full object-cover" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{resident.alias || resident.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">{resident.specialties.join(', ')}</p>
                            </div>
                            <span className="text-xs font-black text-violet-700 dark:text-violet-300">
                              {formatPrice(resident.hourlyRate || 70)}/h
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2 pt-1">
                          {/* Botón WhatsApp interactivo con protección GuestGate */}
                          <button
                            data-testid="marker-whatsapp-btn"
                            onClick={() => resident && handleContactWhatsApp(resident, studio)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-2 px-2.5 rounded-xl transition shadow cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </button>

                          {/* Link semántico WhatsApp para compatibilidad */}
                          {artist.whatsappUrl && (
                            <a
                              href={artist.whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hidden"
                              aria-hidden="true"
                            >
                              WhatsApp
                            </a>
                          )}

                          {/* Botón Reservar con protección GuestGate */}
                          <button
                            data-testid="marker-reserve-btn"
                            onClick={() => resident && handleReserveFlash('Cita General', resident.hourlyRate || 70, resident)}
                            className="flex-1 flex items-center justify-center gap-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold py-2 rounded-xl transition cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Reservar
                          </button>

                          <Link
                            to={`/artist/${artist.id}`}
                            className="px-2.5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white text-xs font-medium rounded-xl transition border border-slate-300 dark:border-zinc-700"
                          >
                            Perfil
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* DRAWER LATERAL / PANEL FLOTANTE DE DETALLES */}
        <div className="relative z-30 w-full md:w-[480px] h-full min-h-0 flex flex-col p-2 sm:p-3 md:p-4 pointer-events-none">
          <div
            data-testid="studio-drawer"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            className="flex-1 min-h-0 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-800 rounded-2xl flex flex-col overflow-hidden pointer-events-auto shadow-2xl text-slate-900 dark:text-white"
          >
            {/* Barra Superior de Búsqueda y Filtros */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-zinc-800 space-y-2.5 sm:space-y-3 bg-slate-50/90 dark:bg-zinc-950/70 shrink-0 relative">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  type="text"
                  data-testid="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={isEn ? "Search studio, artist or style..." : "Buscar estudio, artista o estilo..."}
                  className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors shadow-sm"
                />
                {/* Autocomplete Predictive Suggestions Popover */}
                {isSearchFocused && searchQuery.trim().length > 0 && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsSearchFocused(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 dark:bg-zinc-950/95 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2.5 z-40 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150 max-h-80 overflow-y-auto custom-scrollbar">
                      {/* Estudios */}
                      {searchSuggestions.studios.length > 0 && (
                        <div className="mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-2 py-1 flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 text-violet-500" /> {isEn ? 'Studios' : 'Estudios'}
                          </span>
                          {searchSuggestions.studios.map((s) => (
                            <button
                              key={s.id}
                              onMouseDown={() => {
                                handleSelectStudio(s.id);
                                setSearchQuery(s.name);
                                setIsSearchFocused(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 transition flex items-center justify-between group cursor-pointer"
                            >
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400">{s.name}</p>
                                <p className="text-[10px] text-slate-500 dark:text-zinc-400">{s.address}</p>
                              </div>
                              <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold">{s.distance}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Artistas */}
                      {searchSuggestions.artists.length > 0 && (
                        <div className="mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-2 py-1 flex items-center gap-1.5">
                            <User className="w-3 h-3 text-fuchsia-500" /> {isEn ? 'Artists' : 'Artistas'}
                          </span>
                          {searchSuggestions.artists.map(({ artist, studio }) => (
                            <button
                              key={artist.id}
                              onMouseDown={() => {
                                handleSelectStudio(studio.id);
                                setSelectedResidentId(artist.id);
                                setSearchQuery(artist.alias || artist.name);
                                setIsSearchFocused(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 transition flex items-center justify-between group cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <img src={artist.avatar} alt={artist.name} className="w-6 h-6 rounded-full object-cover" />
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400">{artist.alias || artist.name}</p>
                                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">{studio.name} • {artist.specialties[0]}</p>
                                </div>
                              </div>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{formatPrice(artist.hourlyRate || 70)}/h</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Estilos */}
                      {searchSuggestions.styles.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-2 py-1 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-amber-500" /> {isEn ? 'Styles' : 'Estilos'}
                          </span>
                          <div className="flex flex-wrap gap-1.5 px-2 py-1">
                            {searchSuggestions.styles.map((styleName) => (
                              <button
                                key={styleName}
                                onMouseDown={() => {
                                  setFilter(styleName);
                                  setSearchQuery('');
                                  setIsSearchFocused(false);
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 transition cursor-pointer"
                              >
                                {styleName}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchSuggestions.studios.length === 0 && searchSuggestions.artists.length === 0 && searchSuggestions.styles.length === 0 && (
                        <div className="p-3 text-center text-xs text-slate-500 dark:text-zinc-400">
                          {isEn ? 'No direct matches found' : 'No se encontraron coincidencias directas'}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                {/* Selector de Tipo: Todos / Estudios / Independientes */}
                <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800/80">
                  <button
                    data-testid="filter-type-all"
                    onClick={() => setTypeFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      typeFilter === 'all'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
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
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Building2 className="w-3 h-3" /> Estudios
                  </button>
                  <button
                    data-testid="filter-type-independent"
                    onClick={() => setTypeFilter('independent')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      typeFilter === 'independent'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <User className="w-3 h-3" /> Independientes
                  </button>
                </div>

                {/* Toggle Vista Mapa / Lista */}
                <div className="flex p-1 bg-slate-100 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800/80">
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'map' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                    aria-label="Ver Mapa"
                  >
                    <MapIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                    aria-label="Ver Lista"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filtro de Calificación Mínima */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 shrink-0">
                  Rating:
                </span>
                <button
                  data-testid="filter-rating-all"
                  onClick={() => setMinRatingFilter(0)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                    minRatingFilter === 0
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  Todas
                </button>
                <button
                  data-testid="filter-rating-45"
                  onClick={() => setMinRatingFilter(4.5)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 transition-colors cursor-pointer ${
                    minRatingFilter === 4.5
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  4.5+ <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                </button>
                <button
                  data-testid="filter-rating-48"
                  onClick={() => setMinRatingFilter(4.8)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 transition-colors cursor-pointer ${
                    minRatingFilter === 4.8
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  4.8+ <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                </button>
              </div>

              {/* Filtros dinámicos de estilo y geolocalización con scroll táctil suave */}
              <div
                id="hub-style-filters-container"
                className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none overscroll-x-contain touch-pan-x"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-x',
                }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {TATTOO_STYLES.map(
                  (styleName) => (
                    <button
                      key={styleName}
                      onClick={() => setFilter(styleName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                        filter === styleName
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                          : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800'
                      }`}
                    >
                      {styleName}
                    </button>
                  )
                )}
              </div>

              {/* Botón manual de GPS si no fue otorgado */}
              {gpsStatus !== 'granted' && (
                <button
                  id="hub-request-location-btn"
                  onClick={requestUserLocation}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-violet-500/30 text-violet-700 dark:text-violet-300 text-xs font-semibold transition cursor-pointer shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  Usar mi ubicación
                </button>
              )}
            </div>

            {/* Contenido con Scroll: Tarjeta del Estudio & Artistas Residentes O Estado Inicial */}
            <div
              id="hub-drawer-scrollable-content"
              style={{
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
              }}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar"
            >
              {!activeStudio ? (
                /* ESTADO INICIAL DEL DRAWER (Sin estudio seleccionado) */
                <div
                  data-testid="drawer-initial-state"
                  className="p-8 text-center text-slate-500 dark:text-zinc-400 flex flex-col items-center justify-center space-y-3 my-auto"
                >
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                    {isEn ? "Select a Studio or Artist on the Map" : "Selecciona un Estudio o Artista en el Mapa"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                    {isEn
                      ? "Tap any studio marker to inspect resident artists, opening hours, reviews, and flash catalogs."
                      : "Toca cualquier marcador del mapa para explorar sus artistas residentes, horarios de atención, calificaciones y catálogo de flashes."}
                  </p>
                </div>
              ) : (
                /* DETALLE EXPANDIDO DEL ESTUDIO / LOCAL ACTIVO */
                <>
                  <div className="bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800/90 rounded-2xl overflow-hidden shadow-xl text-slate-900 dark:text-white">
                    {/* Banner & Identidad del Estudio */}
                    <div className="relative h-36 w-full">
                      <img
                        src={activeStudio.banner}
                        alt={activeStudio.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

                      {/* Botón de Cerrar / Minimizar Detalle para volver al estado inicial */}
                      <button
                        data-testid="close-drawer-details"
                        onClick={() => setActiveStudioId(null)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700 backdrop-blur-sm transition cursor-pointer shadow-md z-10"
                        aria-label="Cerrar detalles del estudio"
                      >
                        <X className="w-4 h-4" />
                      </button>

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
                          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
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
                      {/* Horario de Atención */}
                      {activeStudio.opening_hours && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800/80 text-xs text-slate-700 dark:text-zinc-300">
                          <Clock className="w-4 h-4 text-violet-500 shrink-0" />
                          <span className="font-bold">{isEn ? 'Opening Hours:' : 'Horario:'}</span>
                          <span>{formatOpeningHours(activeStudio.opening_hours)}</span>
                        </div>
                      )}

                      {/* SELECTOR DE ARTISTAS RESIDENTES (Multi-artista Studio Hierarchy) */}
                      {activeStudio.type === 'studio' &&
                        activeStudio.residents &&
                        activeStudio.residents.length > 0 && (
                          <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="text-xs font-bold text-slate-700 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" /> Artistas en este Local:
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Selecciona para contactar</span>
                            </div>

                            {/* Concentric Violet Avatar Rings */}
                            <div
                              className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar overscroll-x-contain touch-pan-x"
                              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
                              onTouchStart={(e) => e.stopPropagation()}
                              onTouchMove={(e) => e.stopPropagation()}
                            >
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
                                        ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/30 dark:bg-violet-950/80 dark:text-white dark:shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                                        : 'bg-slate-100 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-900 dark:hover:text-zinc-200'
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
                                      <div className={`text-xs font-bold flex items-center gap-1 ${
                                        isResidentSelected
                                          ? 'text-white'
                                          : 'text-slate-900 dark:text-white'
                                      }`}>
                                        {resident.alias || resident.name}
                                      </div>
                                      <div className={`text-[10px] truncate max-w-[90px] ${
                                        isResidentSelected
                                          ? 'text-violet-100 dark:text-zinc-300'
                                          : 'text-slate-500 dark:text-zinc-400'
                                      }`}>
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
                        <div className="space-y-2 border-b border-slate-200 dark:border-zinc-800/80 pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{isEn ? "Artist to contact:" : "Artista a contactar:"}</span>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {activeResident.name}
                                {activeResident.alias && (
                                  <span className="text-xs font-semibold text-violet-400">
                                    "{activeResident.alias}"
                                  </span>
                                )}
                              </h4>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold block">
                                Tarifa Base
                              </span>
                              <span className="text-xs font-extrabold text-violet-700 dark:text-violet-300">
                                {formatPrice(activeResident.hourlyRate || 70)}/h
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{activeResident.bio}</p>

                          {/* Chips de Especialidades */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {activeResident.specialties.map((spec, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800"
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
                            <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-400 uppercase tracking-wider">
                              {isEn ? "Flashes by" : "Flashes de"} {activeResident.alias || activeResident.name}
                            </h4>
                            <span className="text-[11px] text-violet-400 hover:text-violet-300 cursor-pointer">
                              {isEn ? "View catalog" : "Ver catálogo"} ({activeResident.flashes.length})
                            </span>
                          </div>

                          <div
                            className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 overscroll-x-contain touch-pan-x"
                            style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
                            onTouchStart={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                          >
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
                                className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 group cursor-pointer border border-slate-200 dark:border-zinc-800 hover:border-violet-500 transition-colors shadow-sm"
                              >
                                <img
                                  src={flash.img}
                                  alt={flash.title}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-white/90 dark:bg-zinc-950/85 py-0.5 px-1 flex justify-center border-t border-slate-200/60 dark:border-transparent">
                                  <span className="text-[10px] font-black text-violet-700 dark:text-violet-300">
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
                            {isEn ? "Book with" : "Reservar con"} {activeResident.alias || activeResident.name}
                          </button>

                          {/* 2. Botón de Envío de Bocetos */}
                          <button
                            data-testid="btn-enviar-boceto"
                            onClick={() => handleSendSketch(activeResident, activeStudio)}
                            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-violet-500/30 text-violet-700 dark:text-violet-300 hover:text-violet-900 dark:hover:text-violet-200 text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                          >
                            <ImageIcon className="w-4 h-4 text-violet-400" />
                            {isEn ? "Send Sketch to" : "Enviar Boceto a"} {activeResident.alias || activeResident.name}
                          </button>

                          {/* 3. Botón de Contacto por WhatsApp */}
                          <div className="pt-1 flex items-center justify-between">
                            <button
                              data-testid="btn-whatsapp-direct"
                              onClick={() => handleContactWhatsApp(activeResident, activeStudio)}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-colors cursor-pointer shadow-sm"
                            >
                              <MessageCircle className="w-4 h-4 text-emerald-400" />
                              {isEn ? "Contact via WhatsApp" : "Contactar por WhatsApp"} ({activeResident.alias || activeResident.name})
                            </button>
                          </div>
                        </div>
                      )}

                      {/* SECCIÓN DE RESEÑAS Y CALIFICACIONES DEL ESTUDIO */}
                      <div className="pt-3 border-t border-slate-200 dark:border-zinc-800/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-slate-800 dark:text-white">
                              {activeStudio.rating} ({activeStudio.reviewCount || activeStudio.reviews?.length || 0} {isEn ? 'reviews' : 'reseñas'})
                            </span>
                          </div>
                          <button
                            data-testid="btn-add-review"
                            onClick={() => setReviewModalOpen(true)}
                            className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 cursor-pointer"
                          >
                            + {isEn ? 'Leave Review' : 'Dejar Reseña'}
                          </button>
                        </div>

                        {/* Lista de Reseñas */}
                        {activeStudio.reviews && activeStudio.reviews.length > 0 ? (
                          <div className="space-y-2">
                            {activeStudio.reviews.slice(0, 3).map((rev) => (
                              <div
                                key={rev.id}
                                className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/60 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {rev.author || rev.user}
                                  </span>
                                  <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                      <Star
                                        key={idx}
                                        className={`w-3 h-3 ${
                                          idx < rev.rating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-zinc-600'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                                  "{rev.comment}"
                                </p>
                                {rev.date && (
                                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                                    {rev.date}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-zinc-500 italic">
                            {isEn ? 'No reviews yet. Be the first!' : 'Aún no hay reseñas. ¡Sé el primero en calificar!'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* OTROS ESTUDIOS Y LOCALES EN EL DIRECTORIO (Tarjetas Colapsadas) */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                      {isEn ? "Other Nearby Ateliers & Artists" : "Otros Locales & Artistas Cercanos"}
                    </h3>

                    {filteredStudios
                      .filter((s) => s.id !== activeStudio.id)
                      .map((studio) => (
                        <div
                          key={studio.id}
                          data-testid="other-studio-card"
                          data-other-studio-id={studio.id}
                          onClick={() => handleSelectStudio(studio.id)}
                          className="flex items-center gap-3 p-3 bg-slate-50/90 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/70 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer group text-slate-900 dark:text-white"
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
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{studio.name}</h4>
                              {studio.type === 'studio' ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 font-bold border border-violet-200 dark:border-violet-800/40 shrink-0">
                                  {studio.artistsCount} Residentes
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 font-medium border border-slate-200 dark:border-zinc-700 shrink-0">
                                  Indep.
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 truncate">
                              {studio.residents?.map((r) => r.alias || r.name).join(', ')} •{' '}
                              {studio.distance}
                            </p>
                          </div>

                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal para Dejar Reseña */}
      {reviewModalOpen && activeStudio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                {isEn ? 'Review' : 'Calificar'} {activeStudio.name}
              </h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                  {isEn ? 'Rating (1 to 5 Stars):' : 'Calificación (1 a 5 Estrellas):'}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold ml-2 text-amber-400">{reviewRating} / 5</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  {isEn ? 'Your Name or Alias:' : 'Tu Nombre o Alias:'}
                </label>
                <input
                  type="text"
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  {isEn ? 'Comment / Experience:' : 'Comentario / Experiencia:'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={isEn ? "Describe the hygiene, precision, and vibe..." : "Describe la higiene, atención, pulso y acabado del tatuaje..."}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                >
                  {isEn ? 'Cancel' : 'Cancelar'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview || !reviewComment.trim()}
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReview ? (isEn ? 'Saving...' : 'Publicando...') : (isEn ? 'Post Review' : 'Publicar Reseña')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        /* Map Tiles Styles: Inverted Dark Mode vs Natural CartoDB Light Mode */
        .leaflet-tile-pane {
          transition: filter 0.4s ease-in-out;
        }
        .dark-map-tiles .leaflet-tile-pane {
          filter: invert(1) hue-rotate(180deg) brightness(0.85) contrast(1.1) saturate(0.3);
        }
        .light-map-tiles .leaflet-tile-pane {
          filter: none !important;
        }
        /* Visually hide OSM watermark while keeping in DOM for legal attribution compliance */
        .leaflet-control-attribution {
          opacity: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
          bottom: -9999px !important;
        }
        .dark-map-tiles .leaflet-marker-pane,
        .dark-map-tiles .leaflet-popup-pane,
        .dark-map-tiles .leaflet-shadow-pane,
        .dark-map-tiles .leaflet-overlay-pane,
        .light-map-tiles .leaflet-marker-pane,
        .light-map-tiles .leaflet-popup-pane,
        .light-map-tiles .leaflet-shadow-pane,
        .light-map-tiles .leaflet-overlay-pane {
          filter: none !important;
        }
        .custom-studio-pin-icon {
          background: transparent !important;
          border: none !important;
        }
        .user-gps-marker {
          background: transparent;
          border: none;
        }
        /* Zoom Control: Dark Theme */
        .dark-map-tiles .leaflet-control-zoom,
        html.dark .leaflet-control-zoom {
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
        }
        .dark-map-tiles .leaflet-control-zoom a,
        html.dark .leaflet-control-zoom a {
          background: rgba(9, 13, 22, 0.9) !important;
          color: #e5e7eb !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
          backdrop-filter: blur(12px);
        }
        .dark-map-tiles .leaflet-control-zoom a:hover,
        html.dark .leaflet-control-zoom a:hover {
          background: rgba(105, 68, 255, 0.3) !important;
          color: #fff !important;
        }
        /* Zoom Control: Light Theme */
        .light-map-tiles .leaflet-control-zoom,
        html.light .leaflet-control-zoom {
          border: 1px solid rgba(0, 0, 0, 0.12) !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
        }
        .light-map-tiles .leaflet-control-zoom a,
        html.light .leaflet-control-zoom a {
          background: rgba(255, 255, 255, 0.95) !important;
          color: #0f172a !important;
          border-color: rgba(0, 0, 0, 0.1) !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
        }
        .light-map-tiles .leaflet-control-zoom a:hover,
        html.light .leaflet-control-zoom a:hover {
          background: #f1f5f9 !important;
          color: #7c3aed !important;
        }
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .leaflet-popup-tip {
          background: #09090b !important;
        }
        .light-map-tiles .leaflet-popup-tip {
          background: #ffffff !important;
        }
        [data-testid="studio-pin"] * {
          pointer-events: none;
        }
        [data-testid="studio-pin"] {
          pointer-events: auto !important;
        }
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
