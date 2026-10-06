import { api } from '../api/client';
import {
  AgendaItem,
  PaymentItem,
  ProductItem,
  OrderItem,
  SketchItem
} from '../types/hub.types';

export const DEFAULT_AGENDA_FALLBACK: AgendaItem[] = [
  {
    id: 'age-101',
    artist_id: 'art-001',
    client_id: 'cli-001',
    start_time: new Date(Date.now() + 86400000).toISOString(),
    end_time: new Date(Date.now() + 86400000 + 3600000 * 3).toISOString(),
    status: 'scheduled',
    notes: 'Sesión 1/2: Manga Blackwork Floral & Geometría Sagrada',
    artist_name: 'Kaelen Voss',
    client_name: 'Cliente Atelier',
    service_title: 'Manga Blackwork Custom',
    studio_name: 'Obsidian Atelier — Panamá Central',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'age-102',
    artist_id: 'art-002',
    client_id: 'cli-001',
    start_time: new Date(Date.now() + 86400000 * 4).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 4 + 3600000 * 2).toISOString(),
    status: 'pending_approval',
    notes: 'Revisión y perforación de cartílago con aro titanio ASTM F136',
    artist_name: 'Elena Rostova',
    client_name: 'Cliente Atelier',
    service_title: 'Piercing Biocompatible Helix',
    studio_name: 'Obsidian Atelier — Panamá Central',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'age-103',
    artist_id: 'art-003',
    client_id: 'cli-001',
    start_time: new Date(Date.now() - 86400000 * 12).toISOString(),
    end_time: new Date(Date.now() - 86400000 * 12 + 3600000 * 4).toISOString(),
    status: 'completed',
    notes: 'Finalización de pieza neo-tradicional y aplicación de Film dérmico',
    artist_name: 'Marcus Thorne',
    client_name: 'Cliente Atelier',
    service_title: 'Neo-Traditional Panther & Peony',
    studio_name: 'Obsidian Atelier — Panamá Central',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString()
  }
];

export const DEFAULT_PAYMENTS_FALLBACK: PaymentItem[] = [
  {
    id: 'pay-201',
    client_id: 'cli-001',
    artist_id: 'art-001',
    amount: 150.0,
    currency: 'USD',
    status: 'completed',
    payment_method: 'paypal',
    concept: 'Depósito Reserva • Manga Blackwork Custom',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'pay-202',
    client_id: 'cli-001',
    artist_id: 'art-002',
    amount: 50.0,
    currency: 'USD',
    status: 'pending',
    payment_method: 'cash_studio',
    concept: 'Abono Joyería Biocompatible & Apertura Piercing',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'pay-203',
    client_id: 'cli-001',
    artist_id: 'art-003',
    amount: 320.0,
    currency: 'USD',
    status: 'completed',
    payment_method: 'credit_card',
    concept: 'Liquidación Sesión Completa Neo-Tradicional',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString()
  }
];

export const DEFAULT_PRODUCTS_CATALOG: ProductItem[] = [
  {
    id: 'prod-001',
    name: 'Crema Cicatrizante Vegana 50ml',
    description: 'Fórmula botánica con caléndula y manteca de karité para regeneración dérmica profunda sin obstruir poros.',
    price: 12.5,
    material: 'Ingredientes 100% Veganos • Sin Parabenos',
    category: 'aftercare',
    in_stock: true,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'prod-002',
    name: 'Espuma Limpiadora pH Neutro 150ml',
    description: 'Jabón antibacteriano dermoprotector sin fragancias artificiales para higiene diaria de tatuajes recién realizados.',
    price: 14.0,
    material: 'pH 5.5 Neutro • Espuma Hipoalergénica',
    category: 'aftercare',
    in_stock: true,
    rating: 5.0,
    image_url: 'https://images.unsplash.com/photo-1608248597359-250810260714?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-02').toISOString()
  },
  {
    id: 'prod-003',
    name: 'Film Dérmico Protector Second Skin (Pack 5u)',
    description: 'Membrana impermeable de poliuretano médico que protege de patógenos y fricción permitiendo transpirar la piel.',
    price: 18.0,
    material: 'Poliuretano Médico Hipoalergénico',
    category: 'aftercare',
    in_stock: true,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-03').toISOString()
  },
  {
    id: 'prod-004',
    name: 'Aro Básico Titanio ASTM F136 (1.2mm)',
    description: 'Aro continuo pulido a mano para primera postura o cambio. Grado implante biocompatible de alta pureza.',
    price: 15.0,
    material: 'Titanio Grado Implante ASTM F136',
    category: 'jewelry',
    in_stock: true,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-04').toISOString()
  },
  {
    id: 'prod-005',
    name: 'Labret Titanio Rosca Interna con Circón',
    description: 'Barra recta de rosca interna con gema de circón engastada mecánicamente (sin pegamentos tóxicos).',
    price: 22.0,
    material: 'Titanio ASTM F136 + Circón Cúbico',
    category: 'jewelry',
    in_stock: true,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-05').toISOString()
  },
  {
    id: 'prod-006',
    name: 'Clicker Septum Oro 14k Neo-Tribal',
    description: 'Diseño exclusivo abisagrado en oro macizo de 14 quilates forjado por orfebres dedicados al body art fino.',
    price: 45.0,
    material: 'Oro Macizo 14K Libre de Níquel',
    category: 'jewelry',
    in_stock: true,
    rating: 5.0,
    image_url: 'https://images.unsplash.com/photo-1611591475152-47354c86574a?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-06').toISOString()
  },
  {
    id: 'prod-007',
    name: 'Hoodie Obsidian Atelier Heavyweight 400gsm',
    description: 'Sudadera corte oversize con serigrafía táctil de dagas góticas, capucha estructurada y costuras reforzadas.',
    price: 55.0,
    material: '100% Algodón Peinado 400g/m²',
    category: 'apparel',
    in_stock: true,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-07').toISOString()
  },
  {
    id: 'prod-008',
    name: 'Camiseta Heavyweight "Daga & Serpiente"',
    description: 'Corte cuadrado relajado, cuello grueso de 3cm y serigrafía artesanal con tintas ecológicas al agua.',
    price: 28.0,
    material: '100% Algodón Ring-Spun 240g/m²',
    category: 'apparel',
    in_stock: true,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-08').toISOString()
  },
  {
    id: 'prod-009',
    name: 'Flash Print Serigrafiado Edición Limitada',
    description: 'Lámina fine art 30x42cm en papel de algodón Hahnemühle 300g, numerada a mano y sellada con lacre de estudio.',
    price: 35.0,
    material: 'Papel Fine Art Hahnemühle 300g',
    category: 'prints',
    in_stock: true,
    rating: 5.0,
    image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-09').toISOString()
  },
  {
    id: 'prod-010',
    name: 'Set 3 Prints Dark Neo-Traditional A4',
    description: 'Colección de tres ilustraciones botánicas y animales oscuros impresas con tintas pigmentadas de archivo.',
    price: 45.0,
    material: 'Papel Texturizado Mate 250g',
    category: 'prints',
    in_stock: true,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-10').toISOString()
  },
  {
    id: 'prod-011',
    name: 'Gift Card Digital Atelier $50',
    description: 'Bono canjeable por sesiones de tatuaje, joyería corporal o insumos post-cuidado en el estudio físico.',
    price: 50.0,
    material: 'Bono Digital con Código QR Único',
    category: 'gift_cards',
    in_stock: true,
    rating: 5.0,
    image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-11').toISOString()
  },
  {
    id: 'prod-012',
    name: 'Gift Card Digital Atelier $100',
    description: 'Bono de regalo premium para piezas de tatuaje medianas, sesiones flash o perforaciones con oro 14k.',
    price: 100.0,
    material: 'Bono Digital con Código QR Único',
    category: 'gift_cards',
    in_stock: true,
    rating: 5.0,
    image_url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-12').toISOString()
  }
];

export const hubService = {
  // Agenda
  async getAgenda(artistId?: string): Promise<AgendaItem[]> {
    try {
      const res = await api.getAgenda(artistId);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return DEFAULT_AGENDA_FALLBACK;
    } catch (err) {
      console.warn('[hubService] getAgenda fallback:', err);
      return DEFAULT_AGENDA_FALLBACK;
    }
  },

  async createAgenda(data: Partial<AgendaItem>): Promise<AgendaItem> {
    const res = await api.createAgenda(data);
    if (!res.success) {
      throw new Error(res.error || 'Error al agendar cita');
    }
    return res.data;
  },

  async updateAgenda(id: string | number, data: Partial<AgendaItem>): Promise<AgendaItem> {
    const res = await api.updateAgenda(id, data);
    if (!res.success) {
      throw new Error(res.error || 'Error al actualizar cita');
    }
    return res.data;
  },

  // Payments
  async getPayments(clientId?: string): Promise<PaymentItem[]> {
    try {
      const res = await api.getPayments(clientId);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return DEFAULT_PAYMENTS_FALLBACK;
    } catch (err) {
      console.warn('[hubService] getPayments fallback:', err);
      return DEFAULT_PAYMENTS_FALLBACK;
    }
  },

  async createPayment(data: Partial<PaymentItem>): Promise<PaymentItem> {
    const res = await api.createPayment(data);
    if (!res.success) {
      throw new Error(res.error || 'Error al procesar pago');
    }
    return res.data;
  },

  // Products (Tienda Fase 1)
  async getProducts(params?: { category?: string; artistId?: string }): Promise<ProductItem[]> {
    try {
      const res = await api.getProducts(params);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        let items = res.data;
        if (params?.category && params.category !== 'all') {
          items = items.filter((p: ProductItem) => p.category === params.category);
        }
        return items;
      }
    } catch (err) {
      console.warn('[hubService] getProducts fallback:', err);
    }

    let items = DEFAULT_PRODUCTS_CATALOG;
    if (params?.category && params.category !== 'all') {
      items = items.filter((p) => p.category === params.category);
    }
    return items;
  },

  async createProduct(data: Partial<ProductItem>): Promise<ProductItem> {
    const res = await api.createStoreProduct(data);
    if (!res.success) {
      throw new Error(res.error || 'Error al crear producto');
    }
    return res.data;
  },

  // Orders (Studio Pickup Only)
  async getOrders(): Promise<OrderItem[]> {
    try {
      const res = await api.getOrders();
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    } catch (err) {
      console.warn('[hubService] getOrders fallback:', err);
      return [];
    }
  },

  async createOrder(payload: {
    artist_id?: string;
    total_amount: number;
    items: Array<{ product_id: string; quantity: number; price_at_time: number }>;
  }): Promise<OrderItem> {
    const res = await api.createOrder(payload);
    if (!res.success) {
      throw new Error(res.error || 'Error al generar pedido para retiro');
    }
    return res.data;
  },

  // Sketches
  async createSketch(artistId: string, imageUrl: string, description?: string): Promise<SketchItem> {
    const res = await api.createSketch({ artist_id: artistId, image_url: imageUrl, description });
    if (!res.success) {
      throw new Error(res.error || 'Error al enviar boceto');
    }
    return res.data;
  }
};
