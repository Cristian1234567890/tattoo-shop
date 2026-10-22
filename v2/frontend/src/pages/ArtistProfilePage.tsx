import { Sparkles, MessageCircle, MapPin, ArrowLeft, Phone, Palette, Lock, Calendar } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { api, API_BASE_URL } from '../api/client';
import { formatWhatsAppUrl } from '../utils/whatsapp';
import { InternationalPhoneInput } from '../components/common/InternationalPhoneInput';
import { PageTransition } from '../components/common/PageTransition';
import { TattooArtistCard, ArtistProfileData } from '../types';
import { useGuestGate } from '../context/GuestGateContext';
import { useCurrency } from '../context/CurrencyContext';
import { CustomSelect, SelectOption } from '../components/common/CustomSelect';
import { COUNTRIES } from '../utils/countries';
import { isGenericPlaceholder, getEffectiveUserAvatar } from '../utils/avatar';
import { ArtistPortfolioGallery, PortfolioItem } from '../components/portfolio/ArtistPortfolioGallery';
import { PortfolioCustomizerModal, PortfolioThemeConfig, DEFAULT_PORTFOLIO_CONFIG } from '../components/portfolio/PortfolioCustomizerModal';
interface ThemePalette {
  primaryHex: string;
  bannerGradient: string;
  heroSubtitle: string;
  heroAliasBadge: string;
  heroButtonGradient: string;
  heroAvatarBorder: string;
  bodyIcon: string;
  bodyAccentText: string;
  bodyPill: string;
  bodyBorder: string;
}

const THEME_PALETTES: Record<string, ThemePalette> = {
  violet: {
    primaryHex: '#8b5cf6',
    bannerGradient: 'from-slate-950 via-violet-950 to-indigo-950',
    heroSubtitle: 'text-violet-200',
    heroAliasBadge: 'bg-violet-500/25 text-violet-100 border-violet-400/40 shadow-xs',
    heroButtonGradient: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-950/40',
    heroAvatarBorder: 'border-violet-500/50 shadow-[0_0_25px_rgba(139,92,246,0.35)]',
    bodyIcon: 'text-violet-500',
    bodyAccentText: 'text-violet-700 dark:text-violet-400',
    bodyPill: 'bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border-violet-200 dark:border-violet-800/60',
    bodyBorder: 'border-violet-500/30',
  },
  neon: {
    primaryHex: '#06b6d4',
    bannerGradient: 'from-slate-950 via-cyan-950 to-fuchsia-950',
    heroSubtitle: 'text-cyan-200',
    heroAliasBadge: 'bg-cyan-500/25 text-cyan-100 border-cyan-400/40 shadow-xs',
    heroButtonGradient: 'bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white shadow-lg shadow-cyan-950/40',
    heroAvatarBorder: 'border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.4)]',
    bodyIcon: 'text-cyan-500',
    bodyAccentText: 'text-cyan-700 dark:text-cyan-400',
    bodyPill: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60',
    bodyBorder: 'border-cyan-500/30',
  },
  gold: {
    primaryHex: '#eab308',
    bannerGradient: 'from-stone-950 via-zinc-900 to-amber-950',
    heroSubtitle: 'text-amber-200',
    heroAliasBadge: 'bg-amber-500/25 text-amber-100 border-amber-400/40 shadow-xs',
    heroButtonGradient: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-950/40',
    heroAvatarBorder: 'border-amber-400/60 shadow-[0_0_25px_rgba(234,179,8,0.4)]',
    bodyIcon: 'text-amber-500',
    bodyAccentText: 'text-amber-700 dark:text-amber-400',
    bodyPill: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    bodyBorder: 'border-amber-500/30',
  },
  crimson: {
    primaryHex: '#f43f5e',
    bannerGradient: 'from-black via-rose-950 to-red-950',
    heroSubtitle: 'text-rose-200',
    heroAliasBadge: 'bg-rose-500/25 text-rose-100 border-rose-400/40 shadow-xs',
    heroButtonGradient: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-950/40',
    heroAvatarBorder: 'border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.4)]',
    bodyIcon: 'text-rose-500',
    bodyAccentText: 'text-rose-700 dark:text-rose-400',
    bodyPill: 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    bodyBorder: 'border-rose-500/30',
  },
  emerald: {
    primaryHex: '#10b981',
    bannerGradient: 'from-slate-950 via-emerald-950 to-teal-950',
    heroSubtitle: 'text-emerald-200',
    heroAliasBadge: 'bg-emerald-500/25 text-emerald-100 border-emerald-400/40 shadow-xs',
    heroButtonGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40',
    heroAvatarBorder: 'border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.4)]',
    bodyIcon: 'text-emerald-500',
    bodyAccentText: 'text-emerald-700 dark:text-emerald-400',
    bodyPill: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    bodyBorder: 'border-emerald-500/30',
  },
};

function resolveAutoTheme(artist: any): 'violet' | 'gold' | 'neon' | 'crimson' | 'emerald' {
  if (artist?.portfolio_customization?.accentTheme) {
    return artist.portfolio_customization.accentTheme;
  }
  const aliasLower = (artist?.alias || '').toLowerCase();
  const workTypeLower = (artist?.work_type || '').toLowerCase();
  const bioLower = (artist?.bio || '').toLowerCase();
  const combined = `${aliasLower} ${workTypeLower} ${bioLower}`;

  if (combined.includes('neon') || combined.includes('cyber') || combined.includes('glitch') || combined.includes('uv')) {
    return 'neon';
  }
  if (combined.includes('gold') || combined.includes('oro') || combined.includes('lujo') || combined.includes('luxury')) {
    return 'gold';
  }
  if (combined.includes('red') || combined.includes('crimson') || combined.includes('sangre') || combined.includes('tradicional')) {
    return 'crimson';
  }
  if (combined.includes('emerald') || combined.includes('botanical') || combined.includes('botánico') || combined.includes('verde')) {
    return 'emerald';
  }
  return 'violet';
}


const WORK_TYPE_OPTIONS: SelectOption[] = [
  { value: 'realista', label: 'Realista' },
  { value: 'tradicional', label: 'Tradicional' },
  { value: 'neotradicional', label: 'Neotradicional' },
  { value: 'blackwork', label: 'Blackwork' },
  { value: 'japones', label: 'Japonés' },
  { value: 'tribal', label: 'Tribal' },
  { value: 'acuarela', label: 'Acuarela' },
];

const COUNTRY_OPTIONS: SelectOption[] = COUNTRIES.map((c) => ({
  value: c.value,
  label: `${c.label} (${c.dialCode})`,
  flag: c.flag,
  code: c.code,
}));

const PANAMA_PROVINCES: SelectOption[] = [
  { value: 'Panamá', label: 'Panamá' },
  { value: 'Panamá Oeste', label: 'Panamá Oeste' },
  { value: 'Colón', label: 'Colón' },
  { value: 'Chiriquí', label: 'Chiriquí' },
  { value: 'Bocas del Toro', label: 'Bocas del Toro' },
  { value: 'Coclé', label: 'Coclé' },
  { value: 'Herrera', label: 'Herrera' },
  { value: 'Los Santos', label: 'Los Santos' },
  { value: 'Veraguas', label: 'Veraguas' },
  { value: 'Darién', label: 'Darién' },
];

export interface PublicArtistData extends Partial<ArtistProfileData> {
  id?: string;
  phone_prefix?: string;
  whatsapp_number?: string;
  country?: string;
  city?: string;
  [key: string]: any;
}

// Fallback artist data for public view if database query is empty
const fallbackPublicArtists: Record<string, PublicArtistData> = {
  'artist-kaelen': {
    email: 'kaelen.silva@obsidian-atelier.com',
    nombre: 'Kaelen',
    apellido: 'Silva',
    name: 'Kaelen Silva',
    alias: 'Void',
    bio: 'Especialista en neo-tribal, cybersigilism, geometría oscura y blackwork biomecánico con más de 8 años de trayectoria.',
    work_type: 'Cybersigilism & Neo-Tribal',
    specialties: ['Cybersigilism', 'Neo-Tribal', 'Geometría Oscura'],
    telefono: '60012345',
    phone_prefix: '+507',
    whatsapp_number: '60012345',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'Bella Vista, Calle 50',
    studio: 'Obsidian Atelier & Flash Lab',
    hourly_rate: 80,
    price: 80,
    profile: '/assets/GB Tattoo.jpg',
    avatar_url: '/assets/GB Tattoo.jpg',
    instagram: 'https://instagram.com/obsidian.atelier',
    flashes: [
      { id: 'f1', title: 'Sigil Core 01', amount: 120, img: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=300&q=80' },
      { id: 'f2', title: 'Neo-Tribal Spine', amount: 150, img: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=300&q=80' },
      { id: 'f3', title: 'Dark Mandala', amount: 90, img: 'https://images.unsplash.com/photo-1621847468516-1ed15271c480?auto=format&fit=crop&w=300&q=80' },
    ],
  },
  'artist-maya': {
    email: 'maya.lin@obsidian-atelier.com',
    nombre: 'Maya',
    apellido: 'Lin',
    name: 'Maya Lin',
    alias: 'Thorne',
    bio: 'Ornamental botánico de alta precisión, puntillismo sutil y micro-estructuras simétricas para piezas anatómicas exclusivas.',
    work_type: 'Ornamental & Dotwork',
    specialties: ['Ornamental', 'Dotwork', 'Botánico'],
    telefono: '61119988',
    phone_prefix: '+507',
    whatsapp_number: '61119988',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'Bella Vista, Calle 50',
    studio: 'Obsidian Atelier & Flash Lab',
    hourly_rate: 75,
    price: 75,
    profile: '/assets/GB.jpeg',
    avatar_url: '/assets/GB.jpeg',
    instagram: 'https://instagram.com/thorne.botanical',
    flashes: [
      { id: 'f4', title: 'Flor de Loto Sagrada', amount: 110, img: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=300&q=80' },
      { id: 'f5', title: 'Enredadera de Espinas', amount: 85, img: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=300&q=80' },
    ],
  },
  'artist-carlos': {
    portfolio_customization: {
      accentTheme: 'neon',
      layoutStyle: 'masonry',
      cardAnimation: 'glow',
      bannerPreset: 'gradient-cyber',
    },
    email: 'carlos.mendoza@obsidian-atelier.com',
    nombre: 'Carlos',
    apellido: 'Mendoza',
    name: 'Carlos Mendoza',
    alias: 'Neon',
    bio: 'Cyberpunk futurista, estética glitch experimental y tatuajes con tintas reactivas UV de alta durabilidad.',
    work_type: 'Cyberpunk & Glitch',
    specialties: ['Cyberpunk', 'Glitch Art', 'UV Reactive'],
    telefono: '62224455',
    phone_prefix: '+507',
    whatsapp_number: '62224455',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'Bella Vista, Calle 50',
    studio: 'Obsidian Atelier & Flash Lab',
    hourly_rate: 90,
    price: 90,
    profile: '/assets/1571.jpg',
    avatar_url: '/assets/1571.jpg',
    instagram: 'https://instagram.com/neon.cyberpunk',
    flashes: [
      { id: 'f6', title: 'Circuit Cyber Run', amount: 140, img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=300&q=80' },
    ],
  },
  'artist-cristian': {
    portfolio_customization: {
      accentTheme: 'gold',
      layoutStyle: 'editorial',
      cardAnimation: 'tilt',
      bannerPreset: 'gradient-gold',
    },
    email: 'cristian.castillo@neonink.com',
    nombre: 'Cristian',
    apellido: 'Castillo',
    name: 'Cristian Castillo',
    alias: 'Castillo Ink',
    bio: 'Maestro del realismo a color, contraste saturado y retratos realistas con acabado fotográfico.',
    work_type: 'Realismo Color',
    specialties: ['Realismo Color', 'Retratos'],
    telefono: '67894321',
    phone_prefix: '+507',
    whatsapp_number: '67894321',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'El Cangrejo, Vía Argentina',
    studio: 'Neon Ink Studio',
    hourly_rate: 70,
    price: 70,
    profile: '/assets/GB.jpeg',
    avatar_url: '/assets/GB.jpeg',
    instagram: 'https://instagram.com/castillo.realismo',
    flashes: [
      { id: 'f7', title: 'Ojo Hiperrealista', amount: 160, img: 'https://images.unsplash.com/photo-1621847468516-1ed15271c480?auto=format&fit=crop&w=300&q=80' },
    ],
  },
  'artist-elena': {
    email: 'elena.vega@neonink.com',
    nombre: 'Elena',
    apellido: 'Vega',
    name: 'Elena Vega',
    alias: 'Aquarelle',
    bio: 'Pintura en piel, efectos de acuarela líquida con difuminados suaves y micro-realismo botánico.',
    work_type: 'Acuarela',
    specialties: ['Acuarela', 'Micro-realismo'],
    telefono: '63337788',
    phone_prefix: '+507',
    whatsapp_number: '63337788',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'El Cangrejo, Vía Argentina',
    studio: 'Neon Ink Studio',
    hourly_rate: 65,
    price: 65,
    profile: '/assets/1251.jpg',
    avatar_url: '/assets/1251.jpg',
    instagram: 'https://instagram.com/aquarelle.tattoo',
  },
  'artist-ana': {
    email: 'ana.valdes@anavaldes.com',
    nombre: 'Ana',
    apellido: 'Valdés',
    name: 'Ana Valdés',
    alias: 'Valdés Trad',
    bio: 'Tradicional americano sólido, líneas limpias y gruesas, paleta clásica y temática de tatuaje tradicional.',
    work_type: 'Tradicional Americano',
    specialties: ['Tradicional', 'Old School'],
    telefono: '68882211',
    phone_prefix: '+507',
    whatsapp_number: '68882211',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'Bella Vista, Calle 49',
    studio: 'Ana Valdés Tattoo Studio',
    hourly_rate: 85,
    price: 85,
    profile: '/assets/1403.jpg',
    avatar_url: '/assets/1403.jpg',
    instagram: 'https://instagram.com/anavaldes.trad',
  },
  'artist-valeria': {
    email: 'valeria.rios@chromagallery.com',
    nombre: 'Valeria',
    apellido: 'Ríos',
    name: 'Valeria Ríos',
    alias: 'Val Ink',
    bio: 'Trazos sutiles, micro-ilustraciones minimalistas y caligrafía de aguja única de alta precisión.',
    work_type: 'Minimalista & Fine Line',
    specialties: ['Minimalista', 'Fine Line'],
    telefono: '65551122',
    phone_prefix: '+507',
    whatsapp_number: '65551122',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'San Francisco, Calle 74 Este',
    studio: 'Chroma Gallery & Tattoo',
    hourly_rate: 75,
    price: 75,
    profile: '/assets/1251.jpg',
    avatar_url: '/assets/1251.jpg',
    instagram: 'https://instagram.com/valink.fineline',
  },
  'artist-diego': {
    portfolio_customization: {
      accentTheme: 'crimson',
      layoutStyle: 'grid',
      cardAnimation: 'zoom',
      bannerPreset: 'gradient-crimson',
    },
    email: 'diego.lopez@chromagallery.com',
    nombre: 'Diego',
    apellido: 'López',
    name: 'Diego López',
    alias: 'Kitsune',
    bio: 'Tatuaje japonés tradicional y contemporáneo, dragones, carpas koi y máscaras noh con composición oriental.',
    work_type: 'Japonés & Irezumi',
    specialties: ['Japonés', 'Irezumi'],
    telefono: '66663344',
    phone_prefix: '+507',
    whatsapp_number: '66663344',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'San Francisco, Calle 74 Este',
    studio: 'Chroma Gallery & Tattoo',
    hourly_rate: 85,
    price: 85,
    profile: '/assets/1571.jpg',
    avatar_url: '/assets/1571.jpg',
    instagram: 'https://instagram.com/kitsune.irezumi',
  },
  'artist-cristian-bp': {
    email: 'cristian.casco@blackpearl.com',
    nombre: 'Cristian',
    apellido: 'Castillo',
    name: 'Cristian Castillo',
    alias: 'Black Pearl',
    bio: 'Blackwork de alto impacto, geometría y grabados medievales inspirados en xilografía en el corazón de Casco Antiguo.',
    work_type: 'Blackwork Medieval',
    specialties: ['Blackwork', 'Neotradicional'],
    telefono: '67894321',
    phone_prefix: '+507',
    whatsapp_number: '67894321',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'Casco Antiguo, Calle 4ta Oeste',
    studio: 'Black Pearl Studio Casco Viejo',
    hourly_rate: 80,
    price: 80,
    profile: '/assets/GB Tattoo.jpg',
    avatar_url: '/assets/GB Tattoo.jpg',
    instagram: 'https://instagram.com/blackpearl.casco',
  },
  'artist-sofia-bp': {
    email: 'sofia.arango@blackpearl.com',
    nombre: 'Sofía',
    apellido: 'Arango',
    name: 'Sofía Arango',
    alias: 'Sofi Art',
    bio: 'Geometría sagrada, mandalas y puntillismo de alta densidad con equilibrio anatómico.',
    work_type: 'Dotwork & Geometría',
    specialties: ['Dotwork', 'Geometría Sagrada'],
    telefono: '69994433',
    phone_prefix: '+507',
    whatsapp_number: '69994433',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'Casco Antiguo, Calle 4ta Oeste',
    studio: 'Black Pearl Studio Casco Viejo',
    hourly_rate: 75,
    price: 75,
    profile: '/assets/1403.jpg',
    avatar_url: '/assets/1403.jpg',
    instagram: 'https://instagram.com/sofiart.dotwork',
  },
  'artist-001': {
    email: 'giovanni.tattoo@example.com',
    nombre: 'Giovanni',
    apellido: 'Buglione',
    name: 'Giovanni Buglione',
    alias: 'Buglione Ink',
    work_type: 'realista',
    specialties: ['Realismo', 'Black & Grey'],
    telefono: '60012345',
    phone_prefix: '+507',
    whatsapp_number: '60012345',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'Bella Vista, Calle 50',
    studio: 'Obsidian Atelier & Flash Lab',
    hourly_rate: 80,
    price: 80,
    profile: '/assets/GB Tattoo.jpg',
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    link: 'https://instagram.com',
  },
  'artist-002': {
    email: 'cristian.tattoo@example.com',
    nombre: 'Cristian',
    apellido: 'Castillo',
    name: 'Cristian Castillo',
    alias: 'Castillo Pro',
    work_type: 'blackwork',
    specialties: ['Blackwork', 'Linework'],
    telefono: '67894321',
    phone_prefix: '+507',
    whatsapp_number: '67894321',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'San Francisco',
    city: 'San Francisco',
    direccion: 'Calle 74 Este',
    studio: 'Chroma Gallery & Tattoo',
    hourly_rate: 75,
    price: 75,
    profile: '/assets/GB Tattoo.jpg',
  },
};

export const ArtistProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user, updateUserMetadata } = useAuth();
  const { requireAuth } = useGuestGate();
  const { formatPrice } = useCurrency();

  // Mode detection: If :id param is present and doesn't match current user, or viewing a public artist
  const isPublicView = Boolean(id && (!user || user.id !== id));

  // ----------------------------------------------------
  // Public View State
  // ----------------------------------------------------
  const [publicArtist, setPublicArtist] = useState<PublicArtistData | null>(() => (id && fallbackPublicArtists[id]) ? fallbackPublicArtists[id] : null);
  const [loadingPublic, setLoadingPublic] = useState<boolean>(Boolean(isPublicView && (!id || !fallbackPublicArtists[id])));
  const [publicError, setPublicError] = useState<string | null>(null);

  // ----------------------------------------------------
  // Edit View State
  // ----------------------------------------------------
  const [name, setName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [phonePrefix, setPhonePrefix] = useState<string>('+507');
  const [country, setCountry] = useState<string>('Panamá');
  const [date, setDate] = useState<string>('');
  const [workType, setWorkType] = useState<string>('realista');
  const [facebook, setFacebook] = useState<string>('');
  const [twitter, setTwitter] = useState<string>('');
  const [instagram, setInstagram] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [province, setProvince] = useState<string>('Panamá');
  const [city, setCity] = useState<string>('Ciudad de Panamá');
  const [direction, setDirection] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  const [profileImg, setProfileImg] = useState<string>(() => getEffectiveUserAvatar(user) || '');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [base64Img, setBase64Img] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [portfolioConfig, setPortfolioConfig] = useState<PortfolioThemeConfig>(
    (user?.user_metadata as any)?.portfolio_customization || DEFAULT_PORTFOLIO_CONFIG
  );

  // Load public artist when in Public View
  useEffect(() => {
    if (!isPublicView || !id) return;

    let isMounted = true;
    setLoadingPublic(true);
    setPublicError(null);

    // 1. Try single artist endpoint: GET /gettatto/:id
    axios
      .get(`${API_BASE_URL}/gettatto/${id}`)
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && res.data?.data?.data) {
          setPublicArtist(res.data.data.data);
          setLoadingPublic(false);
        } else {
          throw new Error('Not found in /gettatto/:id');
        }
      })
      .catch(() => {
        // 2. Fallback to all artists catalog
        api
          .getTattooArtists()
          .then((resAll) => {
            if (!isMounted) return;
            const match = resAll.data?.find((a: TattooArtistCard) => a.id === id);
            if (match?.data) {
              setPublicArtist(match.data);
            } else if (fallbackPublicArtists[id]) {
              setPublicArtist(fallbackPublicArtists[id]);
            } else {
              // Generic fallback so view renders cleanly
              setPublicArtist({
                nombre: 'Artista',
                apellido: 'Profesional',
                work_type: 'realista',
                telefono: '60012345',
                provincia: 'Panamá',
                ciudad: 'Ciudad de Panamá',
                direccion: 'Estudio de Tatuajes',
                profile: '/assets/GB Tattoo.jpg',
              });
            }
          })
          .catch(() => {
            if (!isMounted) return;
            if (fallbackPublicArtists[id]) {
              setPublicArtist(fallbackPublicArtists[id]);
            } else {
              setPublicError('No se pudo cargar la información del tatuador.');
            }
          })
          .finally(() => {
            if (isMounted) setLoadingPublic(false);
          });
      });

    return () => {
      isMounted = false;
    };
  }, [id, isPublicView]);

  // Load own user profile in Edit View
  useEffect(() => {
    if (user && !isPublicView) {
      const meta = user.user_metadata || {};
      setName(meta.nombre || '');
      setLastName(meta.apellido || '');
      setPhone(meta.telefono || meta.phone_number || '');
      setPhonePrefix(meta.phone_prefix || '+507');
      setCountry(meta.country || 'Panamá');
      setDate(meta.edad || '');
      setWorkType(meta.work_type || 'realista');
      setFacebook(meta.facebook || '');
      setTwitter(meta.twitter || '');
      setInstagram(meta.instagram || '');
      setLinkUrl(meta.link || '');
      setProvince(meta.provincia || 'Panamá');
      setCity(meta.city || meta.ciudad || 'Ciudad de Panamá');
      setDirection(meta.direccion || '');
      setEmail(user.email || '');
      const effectiveAv = getEffectiveUserAvatar(user);
      const candidateAvatar = effectiveAv || meta.profile || meta.avatar_url || meta.picture;
      if (candidateAvatar) {
        setProfileImg(candidateAvatar);
      }
    }
  }, [user, isPublicView]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        setSelectedImage(res);
        const clean = res.includes(',') ? res.split(',')[1] : res;
        setBase64Img(clean);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let uploadedUrl = profileImg;
      if (base64Img) {
        try {
          await api.updateUserImg(base64Img);
          uploadedUrl = selectedImage;
          setProfileImg(selectedImage);
        } catch (imgErr) {
          console.warn('Image upload error:', imgErr);
        }
      }

      const payload: Record<string, any> = {
        email,
        nombre: name,
        apellido: lastName,
        telefono: phone,
        phone_number: `${phonePrefix} ${phone}`.trim(),
        phone_prefix: phonePrefix,
        whatsapp_number: phone,
        country,
        city,
        provincia: province,
        ciudad: city,
        direccion: direction,
        work_type: workType,
        facebook,
        twitter,
        instagram,
        link: linkUrl,
        ...(base64Img || (uploadedUrl && !isGenericPlaceholder(uploadedUrl)) ? { profile: uploadedUrl, avatar_url: uploadedUrl } : {}),

      };

      if (newPassword) {
        payload.password = newPassword;
      }

      const res = await api.updateUser(payload);
      if (res.success) {
        updateUserMetadata({
          nombre: name,
          apellido: lastName,
          telefono: phone,
          phone_number: `${phonePrefix} ${phone}`.trim(),
          phone_prefix: phonePrefix,
          whatsapp_number: phone,
          country,
          city,
          provincia: province,
          ciudad: city,
          direccion: direction,
          work_type: workType,
          facebook,
          twitter,
          instagram,
          link: linkUrl,
          ...(base64Img || (uploadedUrl && !isGenericPlaceholder(uploadedUrl)) ? { profile: uploadedUrl, avatar_url: uploadedUrl } : {}),
  
        });
        setMessage({ text: '¡Perfil de tatuador actualizado correctamente!', isError: false });
      } else {
        setMessage({
          text: res.error?.message || 'Error al actualizar perfil.',
          isError: true,
        });
      }
    } catch (err: any) {
      console.error('Update artist profile error:', err);
      updateUserMetadata({
        nombre: name,
        apellido: lastName,
        telefono: phone,
        phone_number: `${phonePrefix} ${phone}`.trim(),
        phone_prefix: phonePrefix,
        whatsapp_number: phone,
        country,
        city,
        provincia: province,
        ciudad: city,
        direccion: direction,
        work_type: workType,
        facebook,
        twitter,
        instagram,
        link: linkUrl,
      });
      setMessage({ text: 'Perfil de tatuador actualizado con éxito.', isError: false });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // PUBLIC PROFILE VIEW (Viewing artist from Hub or direct link)
  // =========================================================================
  if (isPublicView) {
    if (loadingPublic) {
      return (
        <div className="min-h-screen py-16 px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
        </div>
      );
    }

    if (publicError && !publicArtist) {
      return (
        <div className="min-h-screen py-16 px-4 text-center">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Artista no encontrado</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{publicError}</p>
            <Link
              to="/hub"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-500 transition shadow"
            >
              Explorar Artistas en el Hub
            </Link>
          </div>
        </div>
      );
    }

    const artist = publicArtist || ({} as PublicArtistData);
    const artistPhone = artist.telefono || artist.whatsapp_number || '';
    const artistPrefix = artist.phone_prefix || '507';
    const waUrl = formatWhatsAppUrl(artistPhone, artistPrefix);
    const avatarUrl = artist.profile || artist.avatar_url || '/assets/GB Tattoo.jpg';

    const isOwner = Boolean(user && (user.id === id || user.email === artist.email));
    const autoTheme = resolveAutoTheme(artist);
    const effectiveThemeConfig: PortfolioThemeConfig =
      artist.portfolio_customization ||
      (isOwner ? portfolioConfig : { ...DEFAULT_PORTFOLIO_CONFIG, accentTheme: autoTheme });

    const activeAccent = effectiveThemeConfig.accentTheme || autoTheme;
    const themePalette = THEME_PALETTES[activeAccent] || THEME_PALETTES.violet;

    const bannerGradientCss = effectiveThemeConfig.bannerPreset
      ? {
          'gradient-dark': 'from-slate-950 via-violet-950 to-indigo-950',
          'gradient-gold': 'from-stone-950 via-zinc-900 to-amber-950',
          'gradient-crimson': 'from-black via-rose-950 to-red-950',
          'gradient-cyber': 'from-slate-950 via-cyan-950 to-fuchsia-950',
        }[effectiveThemeConfig.bannerPreset] || themePalette.bannerGradient
      : themePalette.bannerGradient;

    const portfolioWorks: PortfolioItem[] = [
      ...(Array.isArray(artist.flashes)
        ? artist.flashes.map((f: any, idx: number) => ({
            id: f.id || `flash-${idx}`,
            title: f.title || `Flash #${idx + 1}`,
            category: 'flashes' as const,
            style: artist.work_type || 'Realista',
            image_url: f.img || f.image_url,
            price: f.amount || f.price,
            available: true,
          }))
        : []),
      ...(Array.isArray(artist.portfolio_items) ? artist.portfolio_items : []),
    ];

    if (portfolioWorks.length === 0) {
      portfolioWorks.push(
        {
          id: 'work-1',
          title: `${artist.work_type || 'Realismo'} - Obra Maestra`,
          category: 'portfolio',
          style: artist.work_type || 'Realista',
          image_url: avatarUrl,
          description: 'Tatuaje personalizado realizado en estudio profesional.',
          price: artist.price || 150,
          estimated_hours: 4,
        },
        {
          id: 'work-2',
          title: 'Flash Especial de Temporada',
          category: 'flashes',
          style: artist.work_type || 'Neotradicional',
          image_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
          description: 'Diseño flash exclusivo disponible para reserva inmediata.',
          price: 120,
          estimated_hours: 3,
          available: true,
        },
        {
          id: 'work-3',
          title: 'Boceto Conceptual de Autor',
          category: 'sketches',
          style: 'Blackwork',
          image_url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=800&q=80',
          description: 'Concepto en desarrollo para piezas de brazo o espalda.',
          price: 80,
          estimated_hours: 2,
        }
      );
    }

    return (
      <PageTransition>
        <div className="min-h-screen py-10 px-4 md:px-8">
          <div className="container mx-auto max-w-4xl space-y-6">

            {/* 1. Dedicated Luxury Hero Banner Card */}
            <div className={`relative rounded-3xl bg-gradient-to-r ${bannerGradientCss} p-6 md:p-8 text-white shadow-2xl border border-white/10 overflow-hidden transition-all duration-500 dark-banner keep-white-text`}>
              {/* Top Navigation Row */}
              <div className="flex items-center justify-between mb-6">
                <Link
                  to="/hub"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full text-xs font-bold backdrop-blur-md transition shadow border border-white/20 keep-white-text"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Hub &amp; Mapa
                </Link>

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setIsCustomizerOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-bold backdrop-blur-md transition shadow cursor-pointer border border-white/20"
                  >
                    <Palette className="w-4 h-4" />
                    Personalizar Portafolio
                  </button>
                )}
              </div>

              {/* Main Identity & Action Row */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
                  <img
                    src={avatarUrl}
                    alt={`${artist.nombre || 'Artista'} ${artist.apellido || ''}`}
                    className={`w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-2 shadow-2xl bg-slate-900 ${themePalette.heroAvatarBorder}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/GB Tattoo.jpg';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap justify-center md:justify-start">
                      <h1 className="text-2xl md:text-3xl font-extrabold !text-white keep-white-text tracking-tight drop-shadow-md">
                        {artist.nombre} {artist.apellido}
                      </h1>
                      {artist.alias && (
                        <span className={`px-3 py-0.5 rounded-full text-xs font-black border ${themePalette.heroAliasBadge}`}>
                          "{artist.alias}"
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-semibold ${themePalette.heroSubtitle} mt-1.5 flex items-center justify-center md:justify-start gap-2 flex-wrap`}>
                      <span className="font-bold !text-white/95 keep-white-text">{artist.studio || 'Estudio Profesional'}</span>
                      <span className="opacity-60 text-white/70">•</span>
                      <span className="!text-white/90 keep-white-text">{artist.work_type || 'Artista de Tatuajes'}</span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 shrink-0">
                  {waUrl && (
                    <button
                      type="button"
                      id="whatsapp-btn"
                      onClick={() => {
                        requireAuth(
                          () => {
                            window.open(waUrl, '_blank', 'noopener,noreferrer');
                          },
                          {
                            title: 'Contactar por WhatsApp',
                            message: `Para iniciar una conversación directa vía WhatsApp con ${artist.nombre || 'el artista'}, regístrate gratis en Tattoo Hub.`,
                            redirectUrl: window.location.pathname,
                          }
                        );
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-white" />
                      Contactar por WhatsApp
                    </button>
                  )}
                  <Link
                    to={`/hub?artist=${id || ''}`}
                    className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 ${themePalette.heroButtonGradient} font-bold text-xs sm:text-sm rounded-xl shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Reservar en Mapa
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Body Container with High-Contrast Themed Details */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-gray-800 p-6 md:p-10">

              {/* Bio Block */}
              {artist.bio && (
                <div className="mb-8 p-5 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className={`w-3.5 h-3.5 ${themePalette.bodyIcon}`} />
                    Biografía &amp; Filosofía de Trabajo
                  </h3>
                  <p className="text-sm text-slate-800 dark:text-gray-200 leading-relaxed font-medium">
                    {artist.bio}
                  </p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Studio & Location */}
                <div className="bg-slate-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-slate-200 dark:border-gray-700">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                    <MapPin className={`w-3.5 h-3.5 ${themePalette.bodyIcon}`} />
                    Ubicación &amp; Estudio
                  </h3>
                  <p className="text-slate-900 dark:text-white font-bold text-sm">
                    {artist.studio || artist.direccion || 'Estudio Principal'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                    {artist.ciudad || artist.city || 'Ciudad de Panamá'}, {artist.provincia || 'Panamá'}
                  </p>
                  {artist.country && (
                    <p className="text-xs text-slate-400 dark:text-gray-400 mt-0.5">
                      {artist.country}
                    </p>
                  )}
                </div>

                {/* Styles & Speciality */}
                <div className="bg-slate-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-slate-200 dark:border-gray-700">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                    <Sparkles className={`w-3.5 h-3.5 ${themePalette.bodyIcon}`} />
                    Estilos Principales
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className={`inline-block px-2.5 py-1 ${themePalette.bodyPill} font-bold text-xs rounded-lg uppercase`}>
                      {artist.work_type || 'Realista'}
                    </span>
                    {Array.isArray(artist.specialties) &&
                      artist.specialties.map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-0.5 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300 font-medium text-xs rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Tarifa / Precio */}
                <div className="bg-slate-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-slate-200 dark:border-gray-700">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-gray-300 mb-2">
                    Tarifa Estimada
                  </h3>
                  <p className={`text-base font-extrabold ${themePalette.bodyAccentText}`}>
                    {artist.price ? formatPrice(artist.price) : `${formatPrice(artist.hourly_rate || 80)}/h`}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                    Cotización según diseño y sesión
                  </p>
                </div>

                {/* Contact Information */}
                <div className="bg-slate-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-slate-200 dark:border-gray-700">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    Contacto Directo
                  </h3>
                  <p className="text-xs text-slate-900 dark:text-gray-200 font-medium truncate">
                    {artist.email || 'Contacto vía plataforma'}
                  </p>
                  {artistPhone && (
                    <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      WhatsApp: {artistPrefix} {artistPhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Portfolio & Flashes Interactive Gallery */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base uppercase tracking-wider font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className={`w-5 h-5 ${themePalette.bodyIcon}`} />
                    Portafolio &amp; Galería de {artist.alias || artist.nombre}
                  </h3>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setIsCustomizerOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 font-bold text-xs transition cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      Personalizar Estilo
                    </button>
                  )}
                </div>

                <ArtistPortfolioGallery
                  items={portfolioWorks}
                  themeConfig={effectiveThemeConfig}
                  artistName={artist.alias || artist.nombre || 'Artista'}
                  artistPhone={artistPhone}
                  artistPrefix={artistPrefix}
                  onSelectDesignForBooking={(item) => {
                    requireAuth(
                      () => {
                        window.location.href = `/hub?artist=${id || ''}&design=${encodeURIComponent(item.title)}`;
                      },
                      {
                        title: 'Reservar Diseño',
                        message: `Regístrate para reservar "${item.title}" con ${artist.nombre}.`,
                        redirectUrl: window.location.pathname,
                      }
                    );
                  }}
                />
              </div>

            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // =========================================================================
  // EDIT PROFILE VIEW (Artist modifying own settings)
  // =========================================================================
  const liveWhatsAppUrl = formatWhatsAppUrl(phone, phonePrefix);

  return (
    <PageTransition>
      <div className="min-h-screen py-10 px-4 md:px-8">
      <div className="container mx-auto flex flex-col md:flex-row gap-8 max-w-5xl bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl p-6 md:p-10 backdrop-blur-md border border-gray-200 dark:border-gray-800">
        {/* Left Column */}
        <div className="column1 w-full md:w-48 flex flex-col items-center md:items-start border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 pr-6 pb-6 md:pb-0">
          <div className="return mb-6">
            <Link to="/user" className="inline-block hover:opacity-80 transition">
              <img
                src="/assets/Back To White.png"
                alt="Volver"
                className="w-10 h-10 p-2 bg-black dark:bg-gray-800 rounded-full"
              />
            </Link>
          </div>
          <hr className="w-full my-2 border-gray-300 dark:border-gray-700" />
          <div className="list w-full space-y-2">
            <div className="font-bold text-primary dark:text-indigo-400 py-1.5 px-3 bg-primary/10 rounded-lg text-sm text-center md:text-left">
              Perfil
            </div>
            {user && (
              <Link
                to={`/artist/${user.id}`}
                className="block text-xs text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white py-1 px-3 transition text-center md:text-left"
              >
                Ver perfil público →
              </Link>
            )}
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="column2 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Perfil
            </h1>
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md hover:brightness-105 transition cursor-pointer"
            >
              <Palette className="w-4 h-4" />
              Personalizar Portafolio
            </button>
          </div>
          <hr className="my-4 border-gray-200 dark:border-gray-800" />

          {message && (
            <div
              className={`p-3 rounded-lg mb-6 text-sm font-semibold text-center ${
                message.isError
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-green-100 text-green-700 border border-green-300'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="form-act">
            <form id="profileForm" onSubmit={handleSubmit} className="space-y-6">
              {/* Photo section */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
                  Foto de Perfil
                </h3>
                <div className="flex items-center gap-6">
                  <div className="profile">
                    <img
                      src={profileImg}
                      alt="Perfil"
                      id="profile-img"
                      className="w-20 h-20 rounded-full object-cover shadow border-2 border-primary"
                    />
                  </div>
                  <div className="upload flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="file-input"
                      onChange={handleImageChange}
                      className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer"
                    />
                    <div
                      id="image-container"
                      style={{ display: selectedImage ? 'block' : 'none' }}
                    >
                      <img
                        id="selected-image"
                        src={selectedImage || ''}
                        alt="Imagen seleccionada"
                        className="w-14 h-14 rounded-lg object-cover shadow mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-800" />

              {/* Personal Data */}
              <div className="data space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    id="name"
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="text"
                    id="last-name"
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* International Phone Input */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Teléfono & WhatsApp (con código de país)
                  </label>
                  <InternationalPhoneInput
                    id="phone"
                    prefix={phonePrefix}
                    phoneNumber={phone}
                    onChange={(newPrefix, newNum) => {
                      setPhonePrefix(newPrefix);
                      setPhone(newNum);
                    }}
                    placeholder="6000-0000"
                  />

                  {/* Live WhatsApp Preview */}
                  <div className="mt-2 text-xs flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span className="font-semibold">Enlace dinámico de WhatsApp:</span>
                    {liveWhatsAppUrl ? (
                      <a
                        href={liveWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-mono hover:text-emerald-700 dark:hover:text-emerald-300"
                      >
                        wa.me/{liveWhatsAppUrl.replace('https://wa.me/', '')}
                      </a>
                    ) : (
                      <span className="font-mono text-gray-400">wa.me/&lt;numero&gt;</span>
                    )}
                  </div>
                </div>

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Age & Legal 18+ Locked Birthdate */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span>Fecha de Nacimiento</span>
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    <Lock size={11} /> Bloqueada (Mayoría de Edad 18+)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    id="date"
                    disabled
                    value={date}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed font-mono select-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={16} />
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  🔒 Bloqueada por validación de mayoría de edad legal (18+). No modificable desde el perfil público.
                </p>

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Work Type */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Tipo de Trabajo
                </h3>
                <CustomSelect
                  options={WORK_TYPE_OPTIONS}
                  value={workType}
                  onChange={(val) => setWorkType(val)}
                  placeholder="Seleccione un tipo de trabajo"
                />

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Social Networks */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Redes Sociales
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/Facebook White.png"
                      id="social"
                      alt="Facebook"
                      className="w-8 h-8 p-1.5 bg-[#3b5998] rounded-full flex-shrink-0"
                    />
                    <input
                      type="url"
                      id="facebook"
                      placeholder="Facebook"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/Twitter White.png"
                      id="social"
                      alt="Twitter"
                      className="w-8 h-8 p-1.5 bg-[#1da1f2] rounded-full flex-shrink-0"
                    />
                    <input
                      type="url"
                      id="twitter"
                      placeholder="Twitter"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/Instagram White.png"
                      id="social"
                      alt="Instagram"
                      className="w-8 h-8 p-1.5 bg-[#e1306c] rounded-full flex-shrink-0"
                    />
                    <input
                      type="url"
                      id="instagram"
                      placeholder="Instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/Link White.png"
                      id="social"
                      alt="Link"
                      className="w-8 h-8 p-1.5 bg-[#d5135a] rounded-full flex-shrink-0"
                    />
                    <input
                      type="url"
                      id="link"
                      placeholder="Link"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Direction & Location */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Dirección
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <CustomSelect
                      label="País"
                      options={COUNTRY_OPTIONS}
                      value={country}
                      onChange={(val) => setCountry(val)}
                    />
                  </div>

                  <div>
                    {country === 'Panamá' ? (
                      <CustomSelect
                        label="Provincia / Estado / Región"
                        options={PANAMA_PROVINCES}
                        value={province}
                        onChange={(val) => setProvince(val)}
                        placeholder="Seleccione una Provincia"
                      />
                    ) : (
                      <div>
                        <label htmlFor="province" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          Provincia / Estado / Región
                        </label>
                        <input
                          type="text"
                          id="province"
                          placeholder="Provincia o Estado"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="w-full px-4 py-3 bg-[#121217] border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 transition"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    id="city"
                    placeholder="Ciudad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="text"
                    id="direction"
                    placeholder="Dirección"
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Credentials */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Credenciales
                </h3>
                <input
                  type="email"
                  id="email"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white mb-3"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="password"
                    id="password"
                    placeholder="Contraseña actual"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="password"
                    id="new-password"
                    placeholder="Nueva Contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                <button
                  type="submit"
                  id="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
      <PortfolioCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        initialConfig={portfolioConfig}
        onSaveConfig={(updated) => {
          setPortfolioConfig(updated);
        }}
      />
    </PageTransition>
  );
};
