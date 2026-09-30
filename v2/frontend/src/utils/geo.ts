/**
 * Geo & Mapping Utilities for Tattoo Hub
 * Implements Haversine distance calculation, city geocoding dictionary,
 * coordinate resolution with fallback, and artist normalization.
 */

import { formatWhatsAppUrl } from './whatsapp';

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
 * to [latitude, longitude] tuples.
 */
export const CITY_COORDINATES: Record<string, [number, number]> = {
  // Panamá
  'ciudad de panama': [8.9824, -79.5199],
  'ciudad de panamá': [8.9824, -79.5199],
  'panama': [8.9824, -79.5199],
  'panamá': [8.9824, -79.5199],
  'panama city': [8.9824, -79.5199],
  'bella vista': [8.9824, -79.5199],
  'san francisco': [8.9880, -79.4980],
  'costa del este': [9.0135, -79.4673],
  'david': [8.4273, -82.4312],
  'chiriqui': [8.4273, -82.4312],
  'chiriquí': [8.4273, -82.4312],
  'boquete': [8.7801, -82.4414],
  'colon': [9.3598, -79.9013],
  'colón': [9.3598, -79.9013],
  'cuatro altos': [9.3400, -79.8850],
  'la chorrera': [8.8803, -79.7833],
  'panama oeste': [8.8803, -79.7833],
  'panamá oeste': [8.8803, -79.7833],
  'arraijan': [8.9500, -79.6500],
  'arraiján': [8.9500, -79.6500],
  'santiago': [8.1000, -80.9833],
  'veraguas': [8.1000, -80.9833],
  'chitre': [7.9620, -80.4289],
  'chitré': [7.9620, -80.4289],
  'herrera': [7.9620, -80.4289],
  'las tablas': [7.7667, -80.2833],
  'los santos': [7.7667, -80.2833],
  'penonome': [8.5189, -80.3553],
  'penonomé': [8.5189, -80.3553],
  'cocle': [8.5189, -80.3553],
  'coclé': [8.5189, -80.3553],
  'bocas del toro': [9.3403, -82.2422],

  // Colombia
  'bogota': [4.7110, -74.0721],
  'bogotá': [4.7110, -74.0721],
  'medellin': [6.2442, -75.5812],
  'medellín': [6.2442, -75.5812],
  'cali': [3.4516, -76.5320],
  'cartagena': [10.3910, -75.4794],
  'barranquilla': [10.9685, -74.7813],

  // México
  'ciudad de mexico': [19.4326, -99.1332],
  'ciudad de méxico': [19.4326, -99.1332],
  'cdmx': [19.4326, -99.1332],
  'mexico': [19.4326, -99.1332],
  'méxico': [19.4326, -99.1332],
  'guadalajara': [20.6597, -103.3496],
  'monterrey': [25.6866, -100.3161],

  // España
  'madrid': [40.4168, -3.7038],
  'barcelona': [41.3879, 2.1699],
  'valencia': [39.4699, -0.3763],
  'sevilla': [37.3891, -5.9845],

  // América del Sur & Central
  'buenos aires': [-34.6037, -58.3816],
  'santiago de chile': [-33.4489, -70.6693],
  'lima': [-12.0464, -77.0428],
  'san jose': [9.9281, -84.0907],
  'san josé': [9.9281, -84.0907],
  'quito': [-0.1807, -78.4678],
  'guayaquil': [-2.1894, -79.8891],

  // USA
  'miami': [25.7617, -80.1918],
  'new york': [40.7128, -74.0060],
  'los angeles': [34.0522, -118.2437],
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
 * 3. Default coordinates with deterministic jitter based on fallbackIndex.
 *
 * @param artist Object containing artist location fields
 * @param fallbackIndex Unique integer used to avoid exact overlapping marker positions
 * @returns [latitude, longitude]
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
    data.provincia,
    artist.provincia,
    data.country,
    artist.country,
    data.direccion,
    artist.direccion,
  ];

  for (const candidate of candidateFields) {
    const norm = normalizeKey(candidate);
    if (!norm) continue;

    // Direct key match
    if (CITY_COORDINATES[norm]) {
      const base = CITY_COORDINATES[norm];
      const jitterLat = ((fallbackIndex % 5) - 2) * 0.005;
      const jitterLng = (((fallbackIndex * 3) % 5) - 2) * 0.005;
      return [base[0] + jitterLat, base[1] + jitterLng];
    }

    // Substring match
    for (const [dictKey, base] of Object.entries(CITY_COORDINATES)) {
      const normDictKey = normalizeKey(dictKey);
      if (norm.includes(normDictKey) || normDictKey.includes(norm)) {
        const jitterLat = ((fallbackIndex % 5) - 2) * 0.005;
        const jitterLng = (((fallbackIndex * 3) % 5) - 2) * 0.005;
        return [base[0] + jitterLat, base[1] + jitterLng];
      }
    }
  }

  // 3. Fallback to default coordinates with small deterministic scatter
  const spreadLat = ((fallbackIndex % 7) - 3) * 0.008;
  const spreadLng = (((fallbackIndex * 2) % 7) - 3) * 0.008;
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
  photoUrl: string;
  style: string;
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
  price: string;
  email: string;
  instagram: string;
  raw: any;
}

/**
 * Normalizes an artist record (from GET /gettatto or fallback) into NormalizedHubArtist.
 *
 * @param rawArtist The raw artist record
 * @param index Index for deterministic coordinate spreading
 * @param userCoords Optional user coordinates [lat, lng] to calculate distance
 * @returns NormalizedHubArtist
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
  const photoUrl =
    data.profile ||
    rawArtist.profile ||
    rawArtist.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2a2a2a&color=fff`;

  const phone = data.telefono || rawArtist.telefono || data.phone || rawArtist.phone || '';
  const phonePrefix = data.phone_prefix || rawArtist.phone_prefix || '507';
  const whatsappNumber = data.whatsapp_number || rawArtist.whatsapp_number || phone;

  const effectivePhone = whatsappNumber || phone;
  const whatsappUrl = formatWhatsAppUrl(
    effectivePhone,
    phonePrefix,
    `¡Hola ${name}! Vi tu perfil en Tattoo Hub y me gustaría cotizar un tatuaje estilo ${style}.`
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
    photoUrl,
    style,
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
    worksCount: data.worksCount ?? rawArtist.worksCount ?? 45,
    followersCount: data.followersCount ?? rawArtist.followersCount ?? 1200,
    price: data.price || rawArtist.price || 'Consultar',
    email: data.email || rawArtist.email || '',
    instagram: data.instagram || rawArtist.instagram || '',
    raw: rawArtist,
  };
}

/**
 * Rich sample artist dataset to ensure the interactive map is always populated,
 * operational, and demonstrates all style filters and proximity ranking.
 */
export const SAMPLE_HUB_ARTISTS: any[] = [
  {
    id: 'artist-001',
    data: {
      email: 'giovanni.tattoo@example.com',
      nombre: 'Giovanni',
      apellido: 'Buglione',
      work_type: 'realista',
      telefono: '60012345',
      phone_prefix: '507',
      whatsapp_number: '60012345',
      provincia: 'Panamá',
      ciudad: 'Ciudad de Panamá',
      country: 'Panamá',
      direccion: 'Bella Vista, Calle 50',
      profile: '/assets/GB Tattoo.jpg',
      followersCount: 1598,
      followingCount: 65,
      worksCount: 85,
      lat: 8.9824,
      lng: -79.5199,
      price: '$80/h',
    },
  },
  {
    id: 'artist-002',
    data: {
      email: 'cristian.tattoo@example.com',
      nombre: 'Cristian',
      apellido: 'Castillo',
      work_type: 'blackwork',
      telefono: '67894321',
      phone_prefix: '507',
      whatsapp_number: '67894321',
      provincia: 'Chiriquí',
      ciudad: 'David',
      country: 'Panamá',
      direccion: 'Barrio Bolívar, Calle 3ra',
      profile: '/assets/GB.jpeg',
      followersCount: 2340,
      followingCount: 110,
      worksCount: 142,
      lat: 8.4273,
      lng: -82.4312,
      price: '$70/h',
    },
  },
  {
    id: 'artist-003',
    data: {
      email: 'ana.tradicional@example.com',
      nombre: 'Ana',
      apellido: 'Valdés',
      work_type: 'tradicional',
      telefono: '61112233',
      phone_prefix: '507',
      whatsapp_number: '61112233',
      provincia: 'Panamá Oeste',
      ciudad: 'La Chorrera',
      country: 'Panamá',
      direccion: 'Avenida Central',
      profile: '/assets/1571.jpg',
      followersCount: 1250,
      followingCount: 88,
      worksCount: 97,
      lat: 8.8803,
      lng: -79.7833,
      price: '$65/h',
    },
  },
  {
    id: 'artist-004',
    data: {
      email: 'luis.oriental@example.com',
      nombre: 'Luis',
      apellido: 'López',
      work_type: 'japones',
      telefono: '69001122',
      phone_prefix: '507',
      whatsapp_number: '69001122',
      provincia: 'Colón',
      ciudad: 'Colón',
      country: 'Panamá',
      direccion: 'Cuatro Altos Shopping',
      profile: '/assets/1251.jpg',
      followersCount: 980,
      followingCount: 42,
      worksCount: 63,
      lat: 9.3598,
      lng: -79.9013,
      price: '$75/h',
    },
  },
  {
    id: 'artist-005',
    data: {
      email: 'valeria.minimal@example.com',
      nombre: 'Valeria',
      apellido: 'Ríos',
      work_type: 'minimalista',
      telefono: '62223344',
      phone_prefix: '507',
      whatsapp_number: '62223344',
      provincia: 'Panamá',
      ciudad: 'San Francisco',
      country: 'Panamá',
      direccion: 'Calle 74 San Francisco',
      profile: '/assets/GB Tattoo.jpg',
      followersCount: 3120,
      followingCount: 140,
      worksCount: 178,
      lat: 8.9880,
      lng: -79.4980,
      price: '$60/h',
    },
  },
  {
    id: 'artist-006',
    data: {
      email: 'mateo.neotrad@example.com',
      nombre: 'Mateo',
      apellido: 'Silva',
      work_type: 'neotradicional',
      telefono: '3001234567',
      phone_prefix: '57',
      whatsapp_number: '3001234567',
      provincia: 'Cundinamarca',
      ciudad: 'Bogotá',
      country: 'Colombia',
      direccion: 'Chapinero Alto',
      profile: '/assets/GB.jpeg',
      followersCount: 2890,
      followingCount: 95,
      worksCount: 112,
      lat: 4.7110,
      lng: -74.0721,
      price: '$60/h',
    },
  },
  {
    id: 'artist-007',
    data: {
      email: 'camila.blackwork@example.com',
      nombre: 'Camila',
      apellido: 'Mendoza',
      work_type: 'blackwork',
      telefono: '3109876543',
      phone_prefix: '57',
      whatsapp_number: '3109876543',
      provincia: 'Antioquia',
      ciudad: 'Medellín',
      country: 'Colombia',
      direccion: 'El Poblado',
      profile: '/assets/1571.jpg',
      followersCount: 1840,
      followingCount: 77,
      worksCount: 89,
      lat: 6.2442,
      lng: -75.5812,
      price: '$55/h',
    },
  },
  {
    id: 'artist-008',
    data: {
      email: 'diego.realismo@example.com',
      nombre: 'Diego',
      apellido: 'Navarro',
      work_type: 'realista',
      telefono: '612345678',
      phone_prefix: '34',
      whatsapp_number: '612345678',
      provincia: 'Madrid',
      ciudad: 'Madrid',
      country: 'España',
      direccion: 'Malasaña, Calle Pez',
      profile: '/assets/1251.jpg',
      followersCount: 4100,
      followingCount: 190,
      worksCount: 210,
      lat: 40.4168,
      lng: -3.7038,
      price: '€90/h',
    },
  },
];
