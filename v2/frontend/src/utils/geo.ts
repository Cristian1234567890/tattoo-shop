/**
 * Geo & Mapping Utilities for Tattoo Hub
 * Implements Haversine distance calculation, city geocoding dictionary,
 * coordinate resolution with fallback, and artist normalization.
 */

import { formatWhatsAppUrl } from './whatsapp';
import { formatPrice } from './currency';

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula with Earth radius R = 6371 km.
 *
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in kilometers rounded to 1 decimal place
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return 0;
  }

  // Exact same point
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const R = 6371; // Earth radius in kilometers
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Geocoding dictionary mapping known cities, provinces, and regions
 * to [latitude, longitude] tuples. Focus on verified Panama zones.
 */
export const CITY_COORDINATES: Record<string, [number, number]> = {
  // Panamá — Zonas Urbanas de la Capital
  'ciudad de panama': [8.9824, -79.5199],
  'ciudad de panamá': [8.9824, -79.5199],
  'panama': [8.9824, -79.5199],
  'panamá': [8.9824, -79.5199],
  'panama city': [8.9824, -79.5199],
  'casco antiguo': [8.9525, -79.5342],
  'casco viejo': [8.9525, -79.5342],
  'san felipe': [8.9525, -79.5342],
  'bella vista': [8.9824, -79.5199],
  'calle 50': [8.9850, -79.5150],
  'el cangrejo': [8.9888, -79.5262],
  'via argentina': [8.9888, -79.5262],
  'vía argentina': [8.9888, -79.5262],
  'san francisco': [8.9880, -79.4980],
  'obarrio': [8.9875, -79.5165],
  'costa del este': [9.0135, -79.4673],
  'punta pacifica': [8.9760, -79.5080],
  'albrook': [8.9745, -79.5515],
  'clayton': [9.0041, -79.5822],
  'ciudad del saber': [9.0041, -79.5822],
  
  // Panamá — Provincias e Interior
  'david': [8.4273, -82.4312],
  'chiriqui': [8.4273, -82.4312],
  'chiriquí': [8.4273, -82.4312],
  'boquete': [8.7801, -82.4414],
  'volcan': [8.7725, -82.6375],
  'volcán': [8.7725, -82.6375],
  'colon': [9.3598, -79.9013],
  'colón': [9.3598, -79.9013],
  'cuatro altos': [9.3400, -79.8850],
  'la chorrera': [8.8803, -79.7833],
  'costa verde': [8.8950, -79.7540],
  'panama oeste': [8.8803, -79.7833],
  'panamá oeste': [8.8803, -79.7833],
  'arraijan': [8.9500, -79.6500],
  'arraiján': [8.9500, -79.6500],
  'coronado': [8.5375, -79.8970],
  'santiago': [8.1000, -80.9833],
  'veraguas': [8.1000, -80.9833],
  'chitre': [7.9620, -80.4289],
  'chitré': [7.9620, -80.4289],
  'herrera': [7.9620, -80.4289],
  'las tablas': [7.7667, -80.2833],
  'los santos': [7.7667, -80.2833],
  'pedasi': [7.5317, -80.0306],
  'pedasí': [7.5317, -80.0306],
  'playa venao': [7.4239, -80.1983],
  'penonome': [8.5189, -80.3553],
  'penonomé': [8.5189, -80.3553],
  'cocle': [8.5189, -80.3553],
  'coclé': [8.5189, -80.3553],
  'bocas del toro': [9.3403, -82.2422],
  'isla colon': [9.3403, -82.2422],

  // Referencias Internacionales
  'bogota': [4.7110, -74.0721],
  'medellin': [6.2442, -75.5812],
  'madrid': [40.4168, -3.7038],
  'miami': [25.7617, -80.1918],
};

/** Default fallback map coordinates (Panama City) */
export const DEFAULT_COORDINATES: [number, number] = [8.9824, -79.5199];

/**
 * Normalizes text by converting to lowercase and stripping accents/diacritics.
 */
function normalizeKey(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Resolves geographic coordinates for an artist.
 * Priority:
 * 1. Explicit lat/lng properties on the object or its data sub-object.
 * 2. Geocoding match from ciudad, provincia, country, or direccion against CITY_COORDINATES.
 * 3. Default coordinates with deterministic scatter based on fallbackIndex.
 */
export function resolveArtistCoordinates(
  artist: any,
  fallbackIndex = 0
): [number, number] {
  if (!artist) {
    return DEFAULT_COORDINATES;
  }

  const data = artist.data || artist;

  // 1. Direct explicit lat/lng
  const rawLat = artist.lat ?? data.lat;
  const rawLng = artist.lng ?? data.lng;

  if (rawLat !== undefined && rawLat !== null && rawLng !== undefined && rawLng !== null) {
    const parsedLat = typeof rawLat === 'string' ? parseFloat(rawLat) : Number(rawLat);
    const parsedLng = typeof rawLng === 'string' ? parseFloat(rawLng) : Number(rawLng);

    if (!isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat !== 0 && parsedLng !== 0) {
      return [parsedLat, parsedLng];
    }
  }

  // 2. Dictionary matching
  const candidateFields = [
    data.ciudad,
    artist.ciudad,
    data.direccion,
    artist.direccion,
    data.provincia,
    artist.provincia,
    data.country,
    artist.country,
  ];

  for (const candidate of candidateFields) {
    const norm = normalizeKey(candidate);
    if (!norm) continue;

    // Direct key match
    if (CITY_COORDINATES[norm]) {
      const base = CITY_COORDINATES[norm];
      const jitterLat = ((fallbackIndex % 5) - 2) * 0.003;
      const jitterLng = (((fallbackIndex * 3) % 5) - 2) * 0.003;
      return [base[0] + jitterLat, base[1] + jitterLng];
    }

    // Substring match
    for (const [dictKey, base] of Object.entries(CITY_COORDINATES)) {
      const normDictKey = normalizeKey(dictKey);
      if (norm.includes(normDictKey) || normDictKey.includes(norm)) {
        const jitterLat = ((fallbackIndex % 5) - 2) * 0.003;
        const jitterLng = (((fallbackIndex * 3) % 5) - 2) * 0.003;
        return [base[0] + jitterLat, base[1] + jitterLng];
      }
    }
  }

  // 3. Fallback to default coordinates with small deterministic scatter
  const spreadLat = ((fallbackIndex % 7) - 3) * 0.006;
  const spreadLng = (((fallbackIndex * 2) % 7) - 3) * 0.006;
  return [DEFAULT_COORDINATES[0] + spreadLat, DEFAULT_COORDINATES[1] + spreadLng];
}

/**
 * Normalized artist representation for the interactive Hub view.
 */
export interface NormalizedHubArtist {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  studioName?: string;
  photoUrl: string;
  style: string;
  specialty: string;
  city: string;
  province: string;
  country: string;
  address: string;
  phone: string;
  phonePrefix: string;
  whatsappNumber: string;
  whatsappUrl: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  worksCount: number;
  followersCount: number;
  rating: number;
  reviewsCount: number;
  price: string;
  email: string;
  instagram: string;
  raw: any;
}

/**
 * Normalizes an artist record (from GET /gettatto or fallback) into NormalizedHubArtist.
 */
export function normalizeHubArtist(
  rawArtist: any,
  index = 0,
  userCoords?: [number, number] | null
): NormalizedHubArtist {
  const data = rawArtist?.data || rawArtist || {};
  const id = rawArtist?.id || data.id || `artist-${index + 1}`;

  const firstName = (data.nombre || rawArtist.nombre || '').trim();
  const lastName = (data.apellido || rawArtist.apellido || '').trim();
  const name =
    [firstName, lastName].filter(Boolean).join(' ') ||
    rawArtist.name ||
    'Tatuador Profesional';

  const city = data.ciudad || rawArtist.ciudad || 'Ciudad de Panamá';
  const province = data.provincia || rawArtist.provincia || 'Panamá';
  const country = data.country || rawArtist.country || 'Panamá';
  const address = data.direccion || rawArtist.direccion || `${city}, ${province}`;

  const style = data.work_type || rawArtist.work_type || rawArtist.style || 'Realismo';
  const specialty = data.specialty || rawArtist.specialty || style;
  const photoUrl =
    data.profile ||
    rawArtist.profile ||
    rawArtist.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2a2a2a&color=f59e0b`;

  const phone = data.telefono || rawArtist.telefono || data.phone || rawArtist.phone || '';
  const phonePrefix = data.phone_prefix || rawArtist.phone_prefix || '507';
  const whatsappNumber = data.whatsapp_number || rawArtist.whatsapp_number || phone;

  const effectivePhone = whatsappNumber || phone;
  const whatsappUrl = formatWhatsAppUrl(
    effectivePhone,
    phonePrefix,
    `¡Hola ${name}! Vi tu perfil en Tattoo Hub Panamá y me gustaría cotizar una cita para un tatuaje estilo ${style}.`
  );

  const [lat, lng] = resolveArtistCoordinates(rawArtist, index);

  let distanceKm: number | undefined;
  if (userCoords && typeof userCoords[0] === 'number' && typeof userCoords[1] === 'number') {
    distanceKm = calculateDistanceKm(userCoords[0], userCoords[1], lat, lng);
  }

  return {
    id: String(id),
    name,
    firstName,
    lastName,
    studioName: data.studioName || rawArtist.studioName || undefined,
    photoUrl,
    style,
    specialty,
    city,
    province,
    country,
    address,
    phone: effectivePhone,
    phonePrefix,
    whatsappNumber,
    whatsappUrl,
    lat,
    lng,
    distanceKm,
    worksCount: data.worksCount ?? rawArtist.worksCount ?? 50,
    followersCount: data.followersCount ?? rawArtist.followersCount ?? 1500,
    rating: data.rating ?? rawArtist.rating ?? 4.9,
    reviewsCount: data.reviewsCount ?? rawArtist.reviewsCount ?? 68,
    price: (data.price || rawArtist.price)
      ? (typeof (data.price || rawArtist.price) === 'string' && (data.price || rawArtist.price).toLowerCase() === 'consultar'
          ? 'Consultar'
          : formatPrice(data.price || rawArtist.price))
      : 'Consultar',
    email: data.email || rawArtist.email || '',
    instagram: data.instagram || rawArtist.instagram || '',
    raw: rawArtist,
  };
}

/**
 * Rich, authentic Panama artist dataset with verified coordinates, local Panama phone prefixes (+507),
 * diverse styles (Realismo, Blackwork, Fine Line, Oriental, Neo-trad, Anime, etc.) and realistic studios.
 */
export const SAMPLE_HUB_ARTISTS: any[] = [
  {
    id: 'panama-001',
    data: {
      email: 'giovanni.tattoo@tattoohub.com',
      nombre: 'Giovanni',
      apellido: 'Buglione',
      studioName: 'Atelier Buglione Art Studio',
      work_type: 'realista',
      specialty: 'Realismo Sombras & Retratos Clásicos',
      telefono: '60012345',
      phone_prefix: '507',
      whatsapp_number: '60012345',
      provincia: 'Panamá',
      ciudad: 'Bella Vista',
      country: 'Panamá',
      direccion: 'Bella Vista, Calle 50, Plaza Bella Vista Piso 3',
      profile: '/assets/GB Tattoo.jpg',
      followersCount: 2850,
      followingCount: 110,
      worksCount: 124,
      rating: 5.0,
      reviewsCount: 94,
      lat: 8.9824,
      lng: -79.5199,
      instagram: '@giovanni_ink_panama',
      get price() {
        return formatPrice(85) + '/h';
      },
    },
  },
  {
    id: 'panama-002',
    data: {
      email: 'cristian.castillo@tattoohub.com',
      nombre: 'Cristian',
      apellido: 'Castillo',
      studioName: 'Black Pearl Studio Casco Viejo',
      work_type: 'blackwork',
      specialty: 'Blackwork Pesado & Geometría Sagrada',
      telefono: '67894321',
      phone_prefix: '507',
      whatsapp_number: '67894321',
      provincia: 'Panamá',
      ciudad: 'Casco Antiguo',
      country: 'Panamá',
      direccion: 'Casco Antiguo, Plaza Herrera, Calle 9na Oeste',
      profile: '/assets/GB.jpeg',
      followersCount: 3410,
      followingCount: 135,
      worksCount: 188,
      rating: 4.9,
      reviewsCount: 128,
      lat: 8.9525,
      lng: -79.5342,
      instagram: '@cristian_blackpearl_pty',
      get price() {
        return formatPrice(75) + '/h';
      },
    },
  },
  {
    id: 'panama-003',
    data: {
      email: 'valeria.rios@tattoohub.com',
      nombre: 'Valeria',
      apellido: 'Ríos',
      studioName: 'Aura Fine Line Atelier',
      work_type: 'minimalista',
      specialty: 'Fine Line Botánico & Micro-Realismo',
      telefono: '62223344',
      phone_prefix: '507',
      whatsapp_number: '62223344',
      provincia: 'Panamá',
      ciudad: 'San Francisco',
      country: 'Panamá',
      direccion: 'San Francisco, Calle 74 Este, Edificio Loft 74',
      profile: '/assets/1571.jpg',
      followersCount: 4120,
      followingCount: 160,
      worksCount: 215,
      rating: 5.0,
      reviewsCount: 156,
      lat: 8.9880,
      lng: -79.4980,
      instagram: '@valeria_fineline_pty',
      get price() {
        return formatPrice(70) + '/h';
      },
    },
  },
  {
    id: 'panama-004',
    data: {
      email: 'kai.chen@tattoohub.com',
      nombre: 'Carlos Kai',
      apellido: 'Chen',
      studioName: 'Dragon & Lotus Oriental Studio',
      work_type: 'japones',
      specialty: 'Irezumi Tradicional, Carpas & Dragones',
      telefono: '69348812',
      phone_prefix: '507',
      whatsapp_number: '69348812',
      provincia: 'Panamá',
      ciudad: 'El Cangrejo',
      country: 'Panamá',
      direccion: 'El Cangrejo, Vía Argentina, Galería Einstein',
      profile: '/assets/1251.jpg',
      followersCount: 2980,
      followingCount: 88,
      worksCount: 145,
      rating: 4.9,
      reviewsCount: 89,
      lat: 8.9888,
      lng: -79.5262,
      instagram: '@kaichen_irezumi_panama',
      get price() {
        return formatPrice(80) + '/h';
      },
    },
  },
  {
    id: 'panama-005',
    data: {
      email: 'ana.valdes@tattoohub.com',
      nombre: 'Ana Sofía',
      apellido: 'Valdés',
      studioName: 'Panama Ink Collective',
      work_type: 'tradicional',
      specialty: 'Tradicional Americano & Dagas Clásicas',
      telefono: '61112233',
      phone_prefix: '507',
      whatsapp_number: '61112233',
      provincia: 'Panamá',
      ciudad: 'Costa del Este',
      country: 'Panamá',
      direccion: 'Costa del Este, Financial Park, Torre B Local 12',
      profile: '/assets/GB Tattoo.jpg',
      followersCount: 1950,
      followingCount: 94,
      worksCount: 110,
      rating: 4.8,
      reviewsCount: 72,
      lat: 9.0135,
      lng: -79.4673,
      instagram: '@anasofia_traditional',
      get price() {
        return formatPrice(65) + '/h';
      },
    },
  },
  {
    id: 'panama-006',
    data: {
      email: 'luis.morales@tattoohub.com',
      nombre: 'Luis',
      apellido: 'Morales',
      studioName: 'Otaku & Cyberpunk Ink',
      work_type: 'neotradicional',
      specialty: 'Anime, Manga & Ilustración de Videojuegos',
      telefono: '65541199',
      phone_prefix: '507',
      whatsapp_number: '65541199',
      provincia: 'Panamá',
      ciudad: 'Obarrio',
      country: 'Panamá',
      direccion: 'Obarrio, Calle 54 Este, Plaza Obarrio',
      profile: '/assets/GB.jpeg',
      followersCount: 3820,
      followingCount: 145,
      worksCount: 167,
      rating: 4.9,
      reviewsCount: 115,
      lat: 8.9875,
      lng: -79.5165,
      instagram: '@luis_otaku_tattoo_pty',
      get price() {
        return formatPrice(75) + '/h';
      },
    },
  },
  {
    id: 'panama-007',
    data: {
      email: 'alejandro.pitti@tattoohub.com',
      nombre: 'Alejandro',
      apellido: 'Pittí',
      studioName: 'Tierras Altas Tattoo Sanctuary',
      work_type: 'realista',
      specialty: 'Realismo Color, Quetzales & Flora Tropical',
      telefono: '68813344',
      phone_prefix: '507',
      whatsapp_number: '68813344',
      provincia: 'Chiriquí',
      ciudad: 'Boquete',
      country: 'Panamá',
      direccion: 'Bajo Boquete, Calle Principal frente a Plaza Los Establos',
      profile: '/assets/1571.jpg',
      followersCount: 2640,
      followingCount: 120,
      worksCount: 135,
      rating: 5.0,
      reviewsCount: 82,
      lat: 8.7801,
      lng: -82.4414,
      instagram: '@pitti_boquete_ink',
      get price() {
        return formatPrice(70) + '/h';
      },
    },
  },
  {
    id: 'panama-008',
    data: {
      email: 'gabriel.santos@tattoohub.com',
      nombre: 'Gabriel',
      apellido: 'Santos',
      studioName: 'David City Custom Tattoo',
      work_type: 'blackwork',
      specialty: 'Lettering Chicano & Caligrafía Personalizada',
      telefono: '63329901',
      phone_prefix: '507',
      whatsapp_number: '63329901',
      provincia: 'Chiriquí',
      ciudad: 'David',
      country: 'Panamá',
      direccion: 'David, Barrio Bolívar, Avenida 3ra Este',
      profile: '/assets/1251.jpg',
      followersCount: 1890,
      followingCount: 85,
      worksCount: 98,
      rating: 4.8,
      reviewsCount: 64,
      lat: 8.4273,
      lng: -82.4312,
      instagram: '@gabo_santos_david',
      get price() {
        return formatPrice(60) + '/h';
      },
    },
  },
  {
    id: 'panama-009',
    data: {
      email: 'elena.carrizo@tattoohub.com',
      nombre: 'Elena',
      apellido: 'Carrizo',
      studioName: 'Pacific Drift Surf & Tattoo',
      work_type: 'minimalista',
      specialty: 'Mandalas Sagrados, Olas & Dotwork Playero',
      telefono: '67785544',
      phone_prefix: '507',
      whatsapp_number: '67785544',
      provincia: 'Los Santos',
      ciudad: 'Pedasí',
      country: 'Panamá',
      direccion: 'Playa Venao, Venao Beach Road Local 4',
      profile: '/assets/GB Tattoo.jpg',
      followersCount: 3150,
      followingCount: 180,
      worksCount: 154,
      rating: 4.9,
      reviewsCount: 97,
      lat: 7.4239,
      lng: -80.1983,
      instagram: '@elena_venao_ink',
      get price() {
        return formatPrice(65) + '/h';
      },
    },
  },
  {
    id: 'panama-010',
    data: {
      email: 'roberto.batista@tattoohub.com',
      nombre: 'Roberto',
      apellido: 'Batista',
      studioName: 'Caribe Ink & Piercing Studio',
      work_type: 'blackwork',
      specialty: 'Tribal Moderno, Polinesio & Coberturas (Cover-ups)',
      telefono: '69001122',
      phone_prefix: '507',
      whatsapp_number: '69001122',
      provincia: 'Colón',
      ciudad: 'Colón',
      country: 'Panamá',
      direccion: 'Cuatro Altos Mall, Pasillo Central Local 28',
      profile: '/assets/GB.jpeg',
      followersCount: 1720,
      followingCount: 75,
      worksCount: 88,
      rating: 4.7,
      reviewsCount: 53,
      lat: 9.3598,
      lng: -79.9013,
      instagram: '@roberto_caribe_ink',
      get price() {
        return formatPrice(60) + '/h';
      },
    },
  },
  {
    id: 'panama-011',
    data: {
      email: 'lucia.montenegro@tattoohub.com',
      nombre: 'Lucía',
      apellido: 'Montenegro',
      studioName: 'Costa Verde Tattoo Boutique',
      work_type: 'minimalista',
      specialty: 'Acuarela, Siluetas & Tatuaje Cosmético',
      telefono: '66219988',
      phone_prefix: '507',
      whatsapp_number: '66219988',
      provincia: 'Panamá Oeste',
      ciudad: 'La Chorrera',
      country: 'Panamá',
      direccion: 'Costa Verde, Plaza Uniplaza Local 15',
      profile: '/assets/1571.jpg',
      followersCount: 2280,
      followingCount: 115,
      worksCount: 130,
      rating: 4.9,
      reviewsCount: 76,
      lat: 8.8950,
      lng: -79.7540,
      instagram: '@lucia_costaverde_ink',
      get price() {
        return formatPrice(65) + '/h';
      },
    },
  },
  {
    id: 'panama-012',
    data: {
      email: 'mariana.deleon@tattoohub.com',
      nombre: 'Mariana',
      apellido: 'De León',
      studioName: 'Canal Zone Tattoo Parlour',
      work_type: 'tradicional',
      specialty: 'Ilustración Náutica, Barcos & Lettering Fino',
      telefono: '64437722',
      phone_prefix: '507',
      whatsapp_number: '64437722',
      provincia: 'Panamá',
      ciudad: 'Albrook',
      country: 'Panamá',
      direccion: 'Albrook Mall, Pasillo del Koala, Local K-14',
      profile: '/assets/1251.jpg',
      followersCount: 2710,
      followingCount: 105,
      worksCount: 142,
      rating: 4.8,
      reviewsCount: 84,
      lat: 8.9745,
      lng: -79.5515,
      instagram: '@mariana_canal_zone_ink',
      get price() {
        return formatPrice(70) + '/h';
      },
    },
  },
];
