import { supabaseAdmin as supabase } from '../config/supabase';

export interface StudioFilterParams {
  search?: string;
  minRating?: number;
  style?: string;
  city?: string;
}

export interface StudioRecord {
  id: string;
  studio_code: string;
  name: string;
  name_normalized: string;
  owner_id?: string;
  delegated_admin_id?: string;
  address: string;
  city: string;
  province?: string;
  country?: string;
  lat: number;
  lng: number;
  phone?: string;
  description?: string;
  banner_url?: string;
  opening_hours?: Record<string, string>;
  rating: number;
  review_count: number;
  verified: boolean;
  residents?: any[];
  reviews?: any[];
  created_at: string;
  updated_at?: string;
}

export function normalizeStudioName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const SEEDED_STUDIOS: StudioRecord[] = [
  {
    id: 'obsidian',
    studio_code: 'STD-OBSID01',
    name: 'Obsidian Atelier & Flash Lab',
    name_normalized: normalizeStudioName('Obsidian Atelier & Flash Lab'),
    owner_id: 'artist-kaelen',
    address: 'Bella Vista, Calle 50, Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    province: 'Panamá',
    country: 'Panama',
    lat: 8.9824,
    lng: -79.5199,
    phone: '+507 60012345',
    description: 'Estudio profesional con artistas residentes de alto nivel en geometría oscura, cybersigilism y blackwork biomecánico.',
    banner_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    opening_hours: {
      mon: '10:00 - 20:00',
      tue: '10:00 - 20:00',
      wed: '10:00 - 20:00',
      thu: '10:00 - 20:00',
      fri: '10:00 - 20:00',
      sat: '10:00 - 18:00',
      sun: 'Cerrado'
    },
    rating: 4.9,
    review_count: 142,
    verified: true,
    residents: [
      {
        id: 'artist-kaelen',
        name: 'Artista Residente Void',
        alias: 'Void',
        avatar: '/assets/GB Tattoo.jpg',
        bio: 'Especialista en neo-tribal, cybersigilism y geometría oscura.',
        specialties: ['Cybersigilism', 'Neo-Tribal', 'Geometría Oscura'],
        hourlyRate: 80,
        availableToday: true,
        whatsapp: { number: '60012345', prefix: '507' },
      },
      {
        id: 'artist-maya',
        name: 'Maya Lin',
        alias: 'Maya',
        avatar: '/assets/Tattoo Machine Rotary.png',
        bio: 'Fineline botánico y micro-realismo.',
        specialties: ['Fineline', 'Micro-realismo', 'Floral'],
        hourlyRate: 95,
        availableToday: false,
        whatsapp: { number: '60023456', prefix: '507' },
      }
    ],
    reviews: [
      {
        id: 'rev-1',
        studio_id: 'obsidian',
        client_name: 'Carlos Mendoza',
        rating: 5,
        comment: 'Excelente atención, bioseguridad impecable y el tatuaje sanó perfecto.',
        created_at: new Date('2026-02-15').toISOString()
      },
      {
        id: 'rev-2',
        studio_id: 'obsidian',
        client_name: 'Valeria Gómez',
        rating: 5,
        comment: 'Void es un genio del cybersigilism. Muy recomendado el local.',
        created_at: new Date('2026-03-01').toISOString()
      }
    ],
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'studio-sacred',
    studio_code: 'STD-SACRED02',
    name: 'Sacred Ink Studio San Francisco',
    name_normalized: normalizeStudioName('Sacred Ink Studio San Francisco'),
    owner_id: 'artist-mateo',
    address: 'Calle 74 Este, San Francisco, Ciudad de Panamá',
    city: 'San Francisco',
    province: 'Panamá',
    country: 'Panama',
    lat: 8.9892,
    lng: -79.4981,
    phone: '+507 62234567',
    description: 'Especialistas en realismo sombra, tradicional japonés Irezumi y piezas de gran formato.',
    banner_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
    opening_hours: {
      mon: '11:00 - 21:00',
      tue: '11:00 - 21:00',
      wed: '11:00 - 21:00',
      thu: '11:00 - 21:00',
      fri: '11:00 - 22:00',
      sat: '10:00 - 20:00',
      sun: '12:00 - 18:00'
    },
    rating: 4.8,
    review_count: 98,
    verified: true,
    residents: [
      {
        id: 'artist-mateo',
        name: 'Mateo Rivas',
        alias: 'Mateo',
        avatar: '/assets/GB Tattoo.jpg',
        bio: 'Realismo negro y gris, retratos y fauna.',
        specialties: ['Realismo', 'Black & Grey', 'Retratos'],
        hourlyRate: 85,
        availableToday: true,
        whatsapp: { number: '62234567', prefix: '507' }
      }
    ],
    reviews: [
      {
        id: 'rev-3',
        studio_id: 'studio-sacred',
        client_name: 'Esteban Ortiz',
        rating: 5,
        comment: 'El mejor realismo en sombras de Panamá. Instalaciones de lujo.',
        created_at: new Date('2026-02-20').toISOString()
      }
    ],
    created_at: new Date('2026-01-05').toISOString()
  },
  {
    id: 'studio-casco',
    studio_code: 'STD-CASCO03',
    name: 'Casco Antiguo Tattoo Club',
    name_normalized: normalizeStudioName('Casco Antiguo Tattoo Club'),
    owner_id: 'artist-elena',
    address: 'Av. Central, Casco Viejo, Ciudad de Panamá',
    city: 'Casco Viejo',
    province: 'Panamá',
    country: 'Panama',
    lat: 8.9525,
    lng: -79.5342,
    phone: '+507 63345678',
    description: 'Estudio de autor en el corazón histórico, enfocado en tradicional americano, anime y lettering fino.',
    banner_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    opening_hours: {
      mon: '12:00 - 20:00',
      tue: '12:00 - 20:00',
      wed: '12:00 - 20:00',
      thu: '12:00 - 20:00',
      fri: '12:00 - 22:00',
      sat: '11:00 - 22:00',
      sun: '12:00 - 18:00'
    },
    rating: 4.7,
    review_count: 64,
    verified: true,
    residents: [
      {
        id: 'artist-elena',
        name: 'Elena Vega',
        alias: 'Elena',
        avatar: '/assets/Tattoo Machine Rotary.png',
        bio: 'Tradicional clásico y anime manga vibrante.',
        specialties: ['Tradicional', 'Anime / Manga', 'Color'],
        hourlyRate: 75,
        availableToday: true,
        whatsapp: { number: '63345678', prefix: '507' }
      }
    ],
    reviews: [
      {
        id: 'rev-4',
        studio_id: 'studio-casco',
        client_name: 'Sofía Chen',
        rating: 4,
        comment: 'Buen ambiente y arte tradicional con colores muy limpios.',
        created_at: new Date('2026-03-05').toISOString()
      }
    ],
    created_at: new Date('2026-01-10').toISOString()
  }
];

export const KNOWN_COUPONS = [
  { code: 'TATTOO10', discount_percentage: 10, description: '10% de descuento en tu compra o membresía', applies_to: 'all' },
  { code: 'PROMO20', discount_percentage: 20, description: '20% de descuento en productos de cuidado y joyería', applies_to: 'product' },
  { code: 'VIP50', discount_percentage: 50, description: '50% de descuento en el primer mes de tu membresía VIP', applies_to: 'subscription' },
  { code: 'TATTOOHUB', discount_percentage: 15, description: '15% de descuento de bienvenida', applies_to: 'all' }
];

// In-memory runtime cache for fallback and test isolation
const runtimeStudios: StudioRecord[] = JSON.parse(JSON.stringify(SEEDED_STUDIOS));

export class StudioService {
  /**
   * Normalizes studio name for duplicate comparison (diacritics and case invariant)
   */
  public normalizeName(name: string): string {
    if (!name) return '';
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generates a unique Studio Verification ID (e.g. STD-A9B2C4)
   */
  public generateStudioCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'STD-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Reset runtime cache (for tests)
   */
  public resetRuntimeStudios(): void {
    runtimeStudios.length = 0;
    runtimeStudios.push(...JSON.parse(JSON.stringify(SEEDED_STUDIOS)));
  }

  /**
   * List studios with filtering by search, minimum rating, city, or style
   */
  async getStudios(filters?: StudioFilterParams): Promise<StudioRecord[]> {
    try {
      let query = supabase.from('studios').select('*, studio_reviews(*)');
      if (filters?.minRating) {
        query = query.gte('rating', filters.minRating);
      }
      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        let results = data;
        if (filters?.search) {
          const s = this.normalizeName(filters.search);
          results = results.filter((st: any) =>
            this.normalizeName(st.name).includes(s) ||
            this.normalizeName(st.address).includes(s) ||
            this.normalizeName(st.description).includes(s)
          );
        }
        return results;
      }
    } catch {
      // Fallback to runtime studios
    }

    let list = [...runtimeStudios];
    if (filters?.minRating) {
      list = list.filter((st) => (st.rating || 0) >= filters.minRating!);
    }
    if (filters?.city) {
      const cityNorm = this.normalizeName(filters.city);
      list = list.filter((st) => this.normalizeName(st.city).includes(cityNorm));
    }
    if (filters?.search) {
      const searchNorm = this.normalizeName(filters.search);
      list = list.filter((st) =>
        this.normalizeName(st.name).includes(searchNorm) ||
        this.normalizeName(st.address).includes(searchNorm) ||
        this.normalizeName(st.description || '').includes(searchNorm) ||
        (st.residents && st.residents.some((r: any) =>
          this.normalizeName(r.name).includes(searchNorm) ||
          (r.specialties && r.specialties.some((sp: string) => this.normalizeName(sp).includes(searchNorm)))
        ))
      );
    }
    if (filters?.style && filters.style !== 'All') {
      const styleNorm = this.normalizeName(filters.style);
      list = list.filter((st) =>
        st.residents &&
        st.residents.some((r: any) =>
          r.specialties && r.specialties.some((sp: string) => this.normalizeName(sp).includes(styleNorm))
        )
      );
    }

    return list;
  }

  /**
   * Get single studio by ID
   */
  async getStudioById(id: string): Promise<StudioRecord | null> {
    try {
      const { data, error } = await supabase
        .from('studios')
        .select('*, studio_reviews(*)')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) return data;
    } catch {}

    const found = runtimeStudios.find((s) => s.id === id);
    return found || null;
  }

  /**
   * Create and register a new Studio in the map (Validating against existing names)
   */
  async createStudio(
    data: {
      name: string;
      address: string;
      city?: string;
      province?: string;
      lat?: number;
      lng?: number;
      phone?: string;
      description?: string;
      banner_url?: string;
      opening_hours?: Record<string, string>;
      delegated_admin_id?: string;
    },
    ownerId: string
  ): Promise<StudioRecord> {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('El nombre del estudio es obligatorio y debe tener al menos 2 caracteres.');
    }
    if (!data.address || data.address.trim().length < 3) {
      throw new Error('La dirección física del estudio es obligatoria.');
    }

    const nameNorm = this.normalizeName(data.name);

    // Duplicate name validation across DB and runtime cache
    try {
      const { data: existing } = await supabase
        .from('studios')
        .select('id, name')
        .eq('name_normalized', nameNorm)
        .maybeSingle();
      if (existing) {
        throw new Error(`Ya existe un estudio registrado con el nombre "${data.name.trim()}". Por favor elige un nombre distintivo.`);
      }
    } catch (err: any) {
      if (err.message?.includes('Ya existe')) throw err;
    }

    const runtimeDuplicate = runtimeStudios.find((s) => s.name_normalized === nameNorm);
    if (runtimeDuplicate) {
      throw new Error(`Ya existe un estudio registrado con el nombre "${data.name.trim()}". Por favor elige un nombre distintivo.`);
    }

    const studioCode = this.generateStudioCode();
    const newStudio: StudioRecord = {
      id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studio_code: studioCode,
      name: data.name.trim(),
      name_normalized: nameNorm,
      owner_id: ownerId,
      delegated_admin_id: data.delegated_admin_id || undefined,
      address: data.address.trim(),
      city: data.city || 'Ciudad de Panamá',
      province: data.province || 'Panamá',
      country: 'Panama',
      lat: Number(data.lat) || 8.9824,
      lng: Number(data.lng) || -79.5199,
      phone: data.phone || '',
      description: data.description || '',
      banner_url: data.banner_url || 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
      opening_hours: data.opening_hours || {
        mon: '10:00 - 20:00',
        tue: '10:00 - 20:00',
        wed: '10:00 - 20:00',
        thu: '10:00 - 20:00',
        fri: '10:00 - 20:00',
        sat: '10:00 - 18:00',
        sun: 'Cerrado'
      },
      rating: 5.0,
      review_count: 0,
      verified: true,
      residents: [],
      reviews: [],
      created_at: new Date().toISOString()
    };

    try {
      const { data: dbStudio, error } = await supabase
        .from('studios')
        .insert([{
          studio_code: newStudio.studio_code,
          name: newStudio.name,
          name_normalized: newStudio.name_normalized,
          owner_id: ownerId,
          delegated_admin_id: newStudio.delegated_admin_id,
          address: newStudio.address,
          city: newStudio.city,
          province: newStudio.province,
          country: newStudio.country,
          lat: newStudio.lat,
          lng: newStudio.lng,
          phone: newStudio.phone,
          description: newStudio.description,
          banner_url: newStudio.banner_url,
          opening_hours: newStudio.opening_hours
        }])
        .select()
        .single();
      if (!error && dbStudio) {
        newStudio.id = dbStudio.id;
      }
    } catch {}

    runtimeStudios.unshift(newStudio);
    return newStudio;
  }

  /**
   * Update studio details, opening hours, schedules, or delegated admin.
   * Can only be executed by the studio owner or delegated admin.
   */
  async updateStudio(
    studioId: string,
    updates: Partial<StudioRecord>,
    requesterId: string
  ): Promise<StudioRecord> {
    const studio = await this.getStudioById(studioId);
    if (!studio) {
      throw new Error('Estudio no encontrado.');
    }

    const isOwner = studio.owner_id === requesterId;
    const isDelegated = studio.delegated_admin_id === requesterId;
    if (!isOwner && !isDelegated) {
      throw new Error('No tienes permisos de administración sobre este estudio.');
    }

    if (updates.name && this.normalizeName(updates.name) !== studio.name_normalized) {
      const newNorm = this.normalizeName(updates.name);
      const duplicate = runtimeStudios.find((s) => s.id !== studioId && s.name_normalized === newNorm);
      if (duplicate) {
        throw new Error(`Ya existe otro estudio con el nombre "${updates.name.trim()}".`);
      }
      studio.name = updates.name.trim();
      studio.name_normalized = newNorm;
    }

    if (updates.address) studio.address = updates.address;
    if (updates.opening_hours) studio.opening_hours = updates.opening_hours;
    if (updates.phone) studio.phone = updates.phone;
    if (updates.description) studio.description = updates.description;
    if (updates.banner_url) studio.banner_url = updates.banner_url;
    if (updates.lat !== undefined) studio.lat = Number(updates.lat);
    if (updates.lng !== undefined) studio.lng = Number(updates.lng);

    // Only owner can update delegated admin
    if (isOwner && updates.delegated_admin_id !== undefined) {
      studio.delegated_admin_id = updates.delegated_admin_id;
    }

    studio.updated_at = new Date().toISOString();

    try {
      await supabase
        .from('studios')
        .update({
          name: studio.name,
          name_normalized: studio.name_normalized,
          address: studio.address,
          opening_hours: studio.opening_hours,
          phone: studio.phone,
          description: studio.description,
          banner_url: studio.banner_url,
          lat: studio.lat,
          lng: studio.lng,
          delegated_admin_id: studio.delegated_admin_id,
          updated_at: studio.updated_at
        })
        .eq('id', studioId);
    } catch {}

    return studio;
  }

  /**
   * Transfer studio ownership to another user/collaborator.
   * Only the current owner can perform this operation.
   */
  async transferOwnership(
    studioId: string,
    newOwnerId: string,
    currentOwnerId: string
  ): Promise<StudioRecord> {
    const studio = await this.getStudioById(studioId);
    if (!studio) {
      throw new Error('Estudio no encontrado.');
    }

    if (studio.owner_id !== currentOwnerId) {
      throw new Error('Solo el propietario actual puede transferir la titularidad del estudio.');
    }

    if (!newOwnerId || newOwnerId === currentOwnerId) {
      throw new Error('Debes indicar un usuario colaborador diferente como nuevo propietario.');
    }

    studio.owner_id = newOwnerId;
    studio.updated_at = new Date().toISOString();

    try {
      await supabase
        .from('studios')
        .update({ owner_id: newOwnerId, updated_at: studio.updated_at })
        .eq('id', studioId);
    } catch {}

    return studio;
  }

  /**
   * Delete studio.
   * CRITICAL REQUIREMENT:
   * "no eliminaría a los artistas, debería de pasarlos a independientes hasta que se asocie a un estudio."
   */
  async deleteStudio(studioId: string, currentOwnerId: string): Promise<{ success: boolean; unlinkedArtistsCount: number }> {
    const studio = await this.getStudioById(studioId);
    if (!studio) {
      throw new Error('Estudio no encontrado.');
    }

    if (studio.owner_id !== currentOwnerId) {
      throw new Error('Solo el propietario del estudio puede eliminarlo.');
    }

    const unlinkedCount = studio.residents?.length || 0;

    // Disassociate artists from DB: clear studio_id and mark as independent
    try {
      await supabase
        .from('user_profiles')
        .update({ studio_id: null, is_independent: true })
        .eq('studio_id', studioId);
      await supabase
        .from('studios')
        .delete()
        .eq('id', studioId);
    } catch {}

    // Remove from runtime cache
    const idx = runtimeStudios.findIndex((s) => s.id === studioId);
    if (idx !== -1) {
      runtimeStudios.splice(idx, 1);
    }

    return { success: true, unlinkedArtistsCount: unlinkedCount };
  }

  /**
   * Associate artist to studio using the studio ID / code
   */
  async joinStudio(
    studioCode: string,
    artistData: { id: string; name: string; avatar?: string; specialties?: string[] }
  ): Promise<{ success: boolean; studio: StudioRecord }> {
    const normalizedCode = studioCode.trim().toUpperCase();
    const studio = runtimeStudios.find((s) => s.studio_code.toUpperCase() === normalizedCode);
    if (!studio) {
      throw new Error('El Código de Estudio no es válido o no existe.');
    }

    if (!studio.residents) studio.residents = [];
    const alreadyJoined = studio.residents.some((r) => r.id === artistData.id);
    if (!alreadyJoined) {
      studio.residents.push({
        id: artistData.id,
        name: artistData.name,
        alias: artistData.name,
        avatar: artistData.avatar || '/assets/GB Tattoo.jpg',
        specialties: artistData.specialties || ['General'],
        hourlyRate: 75,
        availableToday: true,
        whatsapp: { number: '60000000', prefix: '507' }
      });
    }

    try {
      await supabase
        .from('studio_artists')
        .upsert([{ studio_id: studio.id, artist_id: artistData.id, role: 'resident' }]);
    } catch {}

    return { success: true, studio };
  }

  /**
   * Client rates studio (1-5 stars) and leaves comment
   */
  async addReview(
    studioId: string,
    clientId: string,
    review: {
      rating: number;
      comment: string;
      clientName?: string;
      clientAvatar?: string;
    }
  ): Promise<{ success: boolean; review: any; updatedRating: number; reviewCount: number }> {
    if (!review.rating || review.rating < 1 || review.rating > 5) {
      throw new Error('La puntuación debe ser un número entero entre 1 y 5 estrellas.');
    }

    const studio = await this.getStudioById(studioId);
    if (!studio) {
      throw new Error('Estudio no encontrado.');
    }

    const newRev = {
      id: `rev-${Date.now()}`,
      studio_id: studioId,
      client_id: clientId,
      client_name: review.clientName || 'Cliente de Tattoo Hub',
      client_avatar: review.clientAvatar || '',
      rating: Math.round(review.rating),
      comment: review.comment?.trim() || '',
      created_at: new Date().toISOString()
    };

    if (!studio.reviews) studio.reviews = [];
    studio.reviews.unshift(newRev);

    // Recompute studio rating
    const totalStars = studio.reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    studio.review_count = studio.reviews.length;
    studio.rating = Number((totalStars / studio.review_count).toFixed(1));

    try {
      await supabase.from('studio_reviews').insert([newRev]);
      await supabase
        .from('studios')
        .update({ rating: studio.rating, review_count: studio.review_count })
        .eq('id', studioId);
    } catch {}

    return {
      success: true,
      review: newRev,
      updatedRating: studio.rating,
      reviewCount: studio.review_count
    };
  }

  /**
   * Validate coupon code for discounts on products or memberships
   */
  public validateCoupon(code: string, appliesTo?: string): {
    valid: boolean;
    discount_percentage: number;
    code: string;
    description: string;
    message: string;
  } {
    if (!code || !code.trim()) {
      return {
        valid: false,
        discount_percentage: 0,
        code: '',
        description: '',
        message: 'Por favor ingresa un código de cupón.'
      };
    }

    const clean = code.trim().toUpperCase();
    const found = KNOWN_COUPONS.find((c) => c.code === clean);

    if (!found) {
      return {
        valid: false,
        discount_percentage: 0,
        code: clean,
        description: '',
        message: `El cupón "${clean}" no es válido o ha expirado.`
      };
    }

    if (appliesTo && found.applies_to !== 'all' && found.applies_to !== appliesTo) {
      return {
        valid: false,
        discount_percentage: 0,
        code: clean,
        description: '',
        message: `El cupón "${clean}" solo aplica para ${found.applies_to === 'subscription' ? 'membresías' : 'productos de la tienda'}.`
      };
    }

    return {
      valid: true,
      discount_percentage: found.discount_percentage,
      code: found.code,
      description: found.description,
      message: `¡Cupón ${found.code} aplicado con éxito! Descuento del ${found.discount_percentage}%.`
    };
  }
}
