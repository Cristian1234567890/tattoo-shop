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
          const country = normalizeString(row.data?.country || row.data?.pais);
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
    const { data, error } = await supabaseAdmin
      .from('tatuadores_data')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return { success: false, error };
    }
    if (!data) {
      return { success: false, error: 'Artist not found' };
    }
    // Enforce sandbox: a profile from the "other world" behaves as not found.
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
