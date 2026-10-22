import { supabaseAdmin } from '../config/supabase';
import { ApiResponse } from '../types/api.types';
import { TatuadorRecord } from '../types/tattoo.types';

export interface ArtistFilterParams {
  country?: string;
  city?: string;
  style?: string;
  currency?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

/**
 * Normalizes string for accent-insensitive and case-insensitive comparison.
 */
function normalizeString(str?: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Extracts a numeric price from diverse artist data representations.
 */
function extractArtistPrice(data: any): number | null {
  if (!data) return null;
  const val = data.price ?? data.precio ?? data.min_price ?? data.minPrice ?? data.hourly_rate;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Sandbox isolation helpers.
 * This service uses the service-role client (bypasses RLS), so the
 * test/real separation MUST be enforced here explicitly:
 *  - Anonymous and real users only see real artists.
 *  - Test accounts (is_test_account = true) only see test artists.
 */
async function isTestAccount(userId?: string): Promise<boolean> {
  if (!userId) return false;
  const { data } = await supabaseAdmin
    .from('user_profiles')
    .select('is_test_account')
    .eq('id', userId)
    .maybeSingle();
  return data?.is_test_account === true;
}

async function getTestAccountIds(): Promise<Set<string>> {
  const { data } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('is_test_account', true);
  return new Set((data || []).map((r: { id: string }) => r.id));
}




export const RESIDENT_ARTISTS_CATALOG: Record<string, any> = {
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
  },
  'artist-carlos': {
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
  },
  'artist-cristian': {
    email: 'cristian.castillo@inkandiron.com',
    nombre: 'Cristian',
    apellido: 'Castillo',
    name: 'Cristian Castillo',
    alias: 'Iron Fist',
    bio: 'Tradicional americano clásico, líneas pesadas, paleta primaria sólida y acabados atemporales.',
    work_type: 'Tradicional Americano',
    specialties: ['Tradicional Americano', 'Old School'],
    telefono: '63337788',
    phone_prefix: '+507',
    whatsapp_number: '63337788',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'El Cangrejo, Vía Argentina',
    studio: 'Ink & Iron Tattoo Parlour',
    hourly_rate: 70,
    price: 70,
    profile: '/assets/1403.jpg',
    avatar_url: '/assets/1403.jpg',
    instagram: 'https://instagram.com/ironfist.trad',
  },
  'artist-elena': {
    email: 'elena.vega@inkandiron.com',
    nombre: 'Elena',
    apellido: 'Vega',
    name: 'Elena Vega',
    alias: 'Black Rose',
    bio: 'Neotradicional de alto contraste, animales con ornamentación floral y paletas saturadas.',
    work_type: 'Neotradicional',
    specialties: ['Neotradicional', 'Full Color'],
    telefono: '64441122',
    phone_prefix: '+507',
    whatsapp_number: '64441122',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'El Cangrejo, Vía Argentina',
    studio: 'Ink & Iron Tattoo Parlour',
    hourly_rate: 80,
    price: 80,
    profile: '/assets/1251.jpg',
    avatar_url: '/assets/1251.jpg',
    instagram: 'https://instagram.com/blackrose.elena',
  },
  'artist-ana': {
    email: 'ana.valdes@cascocollective.com',
    nombre: 'Ana',
    apellido: 'Valdés',
    name: 'Ana Valdés',
    alias: 'Alma Trad',
    bio: 'Tatuaje tradicional y lettering chicano personalizado con líneas sólidas y sombras degradadas.',
    work_type: 'Tradicional & Lettering',
    specialties: ['Tradicional', 'Lettering'],
    telefono: '65559900',
    phone_prefix: '+507',
    whatsapp_number: '65559900',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'Casco Antiguo, Avenida Central',
    studio: 'Casco Viejo Tattoo Collective',
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
    avatar_url: '/assets/GB Tattoo.jpg',
    instagram: 'https://instagram.com',
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
    avatar_url: '/assets/GB Tattoo.jpg',
  },
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class TattooService {
  async getTattoPublicData(
    requesterId?: string,
    filters?: ArtistFilterParams
  ): Promise<ApiResponse<TatuadorRecord[]>> {
    const { data, error } = await supabaseAdmin.from('tatuadores_data').select('*');
    if (error) {
      return { success: false, error };
    }
    const [requesterIsTest, testIds] = await Promise.all([
      isTestAccount(requesterId),
      getTestAccountIds(),
    ]);

    // Apply sandbox isolation
    let result = (data || []).filter((row: TatuadorRecord) =>
      requesterIsTest ? testIds.has(row.id) : !testIds.has(row.id)
    );

    // Apply filters if provided
    if (filters) {
      // 1. Country filter
      if (filters.country) {
        const targetCountry = normalizeString(filters.country);
        result = result.filter((row: TatuadorRecord) => {
          const country = normalizeString(
            row.data?.country ||
            row.data?.pais ||
            (normalizeString(row.data?.provincia).includes('panam') ? 'Panamá' : '') ||
            (normalizeString(row.data?.ciudad).includes('panam') ? 'Panamá' : '')
          );
          if (!country) return false;
          return country === targetCountry || country.includes(targetCountry) || targetCountry.includes(country);
        });
      }

      // 2. City filter
      if (filters.city) {
        const targetCity = normalizeString(filters.city);
        result = result.filter((row: TatuadorRecord) => {
          const city = normalizeString(row.data?.city || row.data?.ciudad || row.data?.provincia);
          if (!city) return false;
          return city === targetCity || city.includes(targetCity) || targetCity.includes(city);
        });
      }

      // 3. Style / work_type filter
      if (filters.style) {
        const targetStyle = normalizeString(filters.style);
        result = result.filter((row: TatuadorRecord) => {
          const style = normalizeString(row.data?.work_type || row.data?.style || row.data?.estilo);
          if (!style) return false;
          return style === targetStyle || style.includes(targetStyle) || targetStyle.includes(style);
        });
      }

      // 4. Currency filter
      if (filters.currency) {
        const targetCurrency = filters.currency.trim().toUpperCase();
        result = result.filter((row: TatuadorRecord) => {
          const curr = (row.data?.currency || 'USD').trim().toUpperCase();
          return curr === targetCurrency;
        });
      }

      // 5. Min price filter
      if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
        result = result.filter((row: TatuadorRecord) => {
          const price = extractArtistPrice(row.data);
          return price !== null && price >= filters.minPrice!;
        });
      }

      // 6. Max price filter
      if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
        result = result.filter((row: TatuadorRecord) => {
          const price = extractArtistPrice(row.data);
          return price !== null && price <= filters.maxPrice!;
        });
      }

      // 7. General search term (name, studio, city, style, bio)
      if (filters.search) {
        const q = normalizeString(filters.search);
        result = result.filter((row: TatuadorRecord) => {
          const d = row.data || {};
          const fullName = normalizeString(`${d.nombre || ''} ${d.apellido || ''} ${d.name || ''}`);
          const city = normalizeString(`${d.ciudad || ''} ${d.city || ''}`);
          const style = normalizeString(`${d.work_type || ''} ${d.style || ''}`);
          const studio = normalizeString(`${d.studio || ''} ${d.direccion || ''}`);
          const bio = normalizeString(`${d.bio || ''} ${d.description || ''} ${d.descripcion || ''}`);
          return fullName.includes(q) || city.includes(q) || style.includes(q) || studio.includes(q) || bio.includes(q);
        });
      }

      // 8. Sorting
      if (filters.sort) {
        const sortKey = filters.sort.trim().toLowerCase();
        if (sortKey === 'price_asc') {
          result.sort((a, b) => {
            const pa = extractArtistPrice(a.data) ?? Infinity;
            const pb = extractArtistPrice(b.data) ?? Infinity;
            return pa - pb;
          });
        } else if (sortKey === 'price_desc') {
          result.sort((a, b) => {
            const pa = extractArtistPrice(a.data) ?? -Infinity;
            const pb = extractArtistPrice(b.data) ?? -Infinity;
            return pb - pa;
          });
        } else if (sortKey === 'name_asc' || sortKey === 'name') {
          result.sort((a, b) => {
            const na = `${a.data?.nombre || ''} ${a.data?.apellido || ''}`.trim();
            const nb = `${b.data?.nombre || ''} ${b.data?.apellido || ''}`.trim();
            return na.localeCompare(nb);
          });
        } else if (sortKey === 'name_desc') {
          result.sort((a, b) => {
            const na = `${a.data?.nombre || ''} ${a.data?.apellido || ''}`.trim();
            const nb = `${b.data?.nombre || ''} ${b.data?.apellido || ''}`.trim();
            return nb.localeCompare(na);
          });
        } else if (sortKey === 'rating' || sortKey === 'rating_desc') {
          result.sort((a, b) => {
            const ra = Number(a.data?.rating ?? a.data?.calificacion ?? 0);
            const rb = Number(b.data?.rating ?? b.data?.calificacion ?? 0);
            return rb - ra;
          });
        } else if (sortKey === 'recent' || sortKey === 'newest') {
          result.sort((a, b) => {
            const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
            const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
            return tb - ta;
          });
        }
      }

      // 9. Pagination (limit and offset)
      if (filters.limit !== undefined && !isNaN(filters.limit) && filters.limit > 0) {
        const offset = filters.offset !== undefined && !isNaN(filters.offset) ? Math.max(0, filters.offset) : 0;
        result = result.slice(offset, offset + filters.limit);
      }
    }

    return { success: true, data: result };
  }

  async getTattoById(id: string, requesterId?: string): Promise<ApiResponse<TatuadorRecord>> {
    // 1. Check resident artists catalog
    if (RESIDENT_ARTISTS_CATALOG[id]) {
      const requesterIsTest = await isTestAccount(requesterId);
      if (requesterIsTest) {
        return { success: false, error: 'Artist not found' };
      }
      return {
        success: true,
        data: {
          id,
          data: RESIDENT_ARTISTS_CATALOG[id],
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      };
    }

    // 2. Query database (if DB throws 22P02 invalid uuid syntax or other error, safely treat as not found)
    const { data, error } = await supabaseAdmin
      .from('tatuadores_data')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: 'Artist not found' };
    }

    // 3. Ensure record has profile data (reject empty/dummy records)
    const d = data.data || {};
    if (!d.nombre && !d.name && !d.alias) {
      return { success: false, error: 'Artist not found' };
    }

    // 4. Enforce sandbox: a profile from the "other world" behaves as not found.
    const [requesterIsTest, artistIsTest] = await Promise.all([
      isTestAccount(requesterId),
      isTestAccount(id),
    ]);
    if (requesterIsTest !== artistIsTest) {
      return { success: false, error: 'Artist not found' };
    }
    return { success: true, data };
  }
}

export const tattooService = new TattooService();
