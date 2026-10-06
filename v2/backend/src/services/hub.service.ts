import { supabaseAdmin as supabase } from '../config/supabase';

export const FALLBACK_PRODUCTS = [
    {
        id: 'prod-001',
        name: 'Crema Cicatrizante Vegana 50ml',
        description: 'Fórmula botánica con caléndula y karité para regeneración dérmica profunda sin obstruir poros.',
        price: 12.50,
        material: 'Ingredientes 100% Veganos',
        category: 'aftercare',
        in_stock: true,
        image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
        created_at: new Date('2026-01-01').toISOString()
    },
    {
        id: 'prod-002',
        name: 'Espuma Limpiadora pH Neutro 150ml',
        description: 'Jabón antibacteriano suave sin fragancias para higiene diaria durante los primeros 15 días.',
        price: 14.00,
        material: 'pH 5.5 Neutro',
        category: 'aftercare',
        in_stock: true,
        image_url: 'https://images.unsplash.com/photo-1608248597359-250810260714?auto=format&fit=crop&w=600&q=80',
        created_at: new Date('2026-01-02').toISOString()
    },
    {
        id: 'prod-003',
        name: 'Film Dérmico Second Skin (5 u)',
        description: 'Barrera impermeable y transpirable que bloquea bacterias y roce con ropa en tatuajes frescos.',
        price: 18.00,
        material: 'Poliuretano Médico Hipoalergénico',
        category: 'aftercare',
        in_stock: true,
        image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
        created_at: new Date('2026-01-03').toISOString()
    },
    {
        id: 'prod-004',
        name: 'Aro Básico Titanio ASTM F136',
        description: 'Aro continuo para perforación inicial o cicatrizada. Pulido espejo grado implante médico.',
        price: 15.00,
        material: 'Titanio Grado Implante ASTM F136',
        category: 'jewelry',
        in_stock: true,
        image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
        created_at: new Date('2026-01-04').toISOString()
    },
    {
        id: 'prod-005',
        name: 'Labret Titanio Rosca Interna Circón',
        description: 'Barra recta de 1.2mm con circón Swarovski engarzado sin pegamentos para máxima bio-seguridad.',
        price: 22.00,
        material: 'Titanio ASTM F136 + Circón Cúbico',
        category: 'jewelry',
        in_stock: true,
        image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
        created_at: new Date('2026-01-05').toISOString()
    },
    {
        id: 'prod-006',
        name: 'Clicker Septum Oro 14k Neo-Tribal',
        description: 'Diseño exclusivo forjado a mano por orfebres especializados en body piercing fino.',
        price: 45.00,
        material: 'Oro Macizo 14K Libre de Níquel',
        category: 'jewelry',
        in_stock: true,
        image_url: 'https://images.unsplash.com/photo-1611591475152-47354c86574a?auto=format&fit=crop&w=600&q=80',
        created_at: new Date('2026-01-06').toISOString()
    },
    {
        id: 'prod-007',
        name: 'Hoodie Obsidian Atelier 400gsm',
        description: 'Sudadera pesada corte oversized, serigrafía de alta densidad frontal y dorsal en tintas ecológicas.',
        price: 55.00,
        material: '100% Algodón Peinado 400g/m²',
        category: 'apparel',
        in_stock: true,
        image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
        created_at: new Date('2026-01-07').toISOString()
    },
    {
        id: 'prod-008',
        name: 'Camiseta Daga & Serpiente Oversized',
        description: 'Camiseta gráfica con corte relajado atelier, serigrafiada a mano en edición limitada de 50 piezas.',
        price: 28.00,
        material: '100% Algodón Ring-Spun 240g/m²',
        category: 'apparel',
        in_stock: true,
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
        created_at: new Date('2026-01-08').toISOString()
    },
    {
        id: 'prod-009',
        name: 'Flash Print Serigrafiado Ed. Limitada',
        description: 'Impresión fine art 30x42cm sobre papel Hahnemühle de 300g, firmada y sellada con lacre de estudio.',
        price: 35.00,
        material: 'Papel Artístico Algodón 300g',
        category: 'prints',
        in_stock: true,
        image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
        created_at: new Date('2026-01-09').toISOString()
    },
    {
        id: 'prod-010',
        name: 'Set 3 Prints Dark Neo-Traditional',
        description: 'Trilogía de láminas en formato A4 ilustradas por artistas residentes. Serie limitada numerada.',
        price: 45.00,
        material: 'Papel Texturizado Mate 250g',
        category: 'prints',
        in_stock: true,
        image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
        created_at: new Date('2026-01-10').toISOString()
    },
    {
        id: 'prod-011',
        name: 'Gift Card Digital Atelier $50',
        description: 'Vale canjeable directamente en el estudio para perforaciones, compras de tienda o abonos a citas.',
        price: 50.00,
        material: 'Bono Digital con Código QR Único',
        category: 'gift_cards',
        in_stock: true,
        image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
        created_at: new Date('2026-01-11').toISOString()
    },
    {
        id: 'prod-012',
        name: 'Gift Card Digital Atelier $100',
        description: 'Bono regalo ideal para sesiones de tatuaje medianas, piezas flash o joyería de oro macizo.',
        price: 100.00,
        material: 'Bono Digital con Código QR Único',
        category: 'gift_cards',
        in_stock: true,
        image_url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=600&q=80',
        created_at: new Date('2026-01-12').toISOString()
    }
];

export class HubService {
    // Schedules
    async getSchedules(artistId: string) {
        const { data, error } = await supabase
            .from('artist_schedules')
            .select('*')
            .eq('artist_id', artistId)
            .order('day_of_week', { ascending: true });
        if (error) throw error;
        return data;
    }

    async createSchedule(data: any) {
        const { data: schedule, error } = await supabase
            .from('artist_schedules')
            .insert([data])
            .select()
            .single();
        if (error) throw error;
        return schedule;
    }

    async updateSchedule(id: string, data: any) {
        const { data: schedule, error } = await supabase
            .from('artist_schedules')
            .update(data)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return schedule;
    }

    async deleteSchedule(id: string) {
        const { error } = await supabase
            .from('artist_schedules')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }

    // Promotions
    async getPromotions(artistId: string) {
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .eq('artist_id', artistId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }

    async createPromotion(data: any) {
        const { data: promo, error } = await supabase
            .from('promotions')
            .insert([data])
            .select()
            .single();
        if (error) throw error;
        return promo;
    }

    async updatePromotion(id: string, data: any) {
        const { data: promo, error } = await supabase
            .from('promotions')
            .update(data)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return promo;
    }

    async deletePromotion(id: string) {
        const { error } = await supabase
            .from('promotions')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }

    // Sketches
    async getSketches(userId: string) {
        const { data, error } = await supabase
            .from('sketches')
            .select('*')
            .or(`client_id.eq.${userId},artist_id.eq.${userId}`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }

    async createSketch(data: any) {
        const { data: sketch, error } = await supabase
            .from('sketches')
            .insert([data])
            .select()
            .single();
        if (error) throw error;
        return sketch;
    }

    async updateSketch(id: string, data: any) {
        const { data: sketch, error } = await supabase
            .from('sketches')
            .update(data)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return sketch;
    }

    // Payments
    async getPayments(userId: string) {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .or(`client_id.eq.${userId},artist_id.eq.${userId}`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }

    async createPayment(data: any) {
        const { data: payment, error } = await supabase
            .from('payments')
            .insert([data])
            .select()
            .single();
        if (error) throw error;
        return payment;
    }

    // Agenda
    async getAgenda(userId: string) {
        const { data, error } = await supabase
            .from('agenda')
            .select('*')
            .or(`client_id.eq.${userId},artist_id.eq.${userId}`)
            .order('start_time', { ascending: true });
        if (error) throw error;
        return data;
    }

    async createAgenda(data: any) {
        const { data: agenda, error } = await supabase
            .from('agenda')
            .insert([data])
            .select()
            .single();
        if (error) throw error;
        return agenda;
    }

    async updateAgenda(id: string, data: any) {
        const { data: agenda, error } = await supabase
            .from('agenda')
            .update(data)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return agenda;
    }

    // Products
    async getProducts(artistId?: string, category?: string) {
        try {
            let query = supabase
                .from('products')
                .select('*');
            if (artistId) {
                query = query.eq('artist_id', artistId);
            }
            if (category && category !== 'all') {
                query = query.eq('category', category);
            }
            const { data, error } = await query.order('created_at', { ascending: false });
            if (!error && Array.isArray(data) && data.length > 0) {
                return data;
            }
        } catch (err) {
            console.warn('[HubService] getProducts DB query failed or empty, using catalog fallback:', err);
        }

        let filtered = FALLBACK_PRODUCTS;
        if (category && category !== 'all') {
            filtered = filtered.filter(p => p.category === category);
        }
        return filtered;
    }

    async createProduct(data: any) {
        const { data: product, error } = await supabase
            .from('products')
            .insert([data])
            .select()
            .single();
        if (error) throw error;
        return product;
    }

    async updateProduct(id: string, data: any) {
        const { data: product, error } = await supabase
            .from('products')
            .update(data)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return product;
    }

    async deleteProduct(id: string) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }

    // Orders
    async getOrders(userId: string) {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, products(*))')
            .or(`client_id.eq.${userId},artist_id.eq.${userId}`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }

    async createOrder(data: any, items: any[]) {
        const { data: order, error } = await supabase
            .from('orders')
            .insert([data])
            .select()
            .single();
        if (error) throw error;
        
        if (items && items.length > 0) {
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_time: item.price_at_time
            }));
            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);
            if (itemsError) throw itemsError;
        }
        
        return order;
    }

    async updateOrder(id: string, data: any) {
        const { data: order, error } = await supabase
            .from('orders')
            .update(data)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return order;
    }
}
