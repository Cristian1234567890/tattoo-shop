-- Migration 12: Seed Initial Atelier Store Products (Tienda Fase 1)

DO $$
DECLARE
    v_artist_id UUID;
BEGIN
    -- Select the first active artist profile if available, or generate a dummy UUID
    SELECT id INTO v_artist_id FROM public.user_profiles WHERE role = 'artist' LIMIT 1;
    
    IF v_artist_id IS NULL THEN
        SELECT id INTO v_artist_id FROM public.user_profiles LIMIT 1;
    END IF;

    IF v_artist_id IS NOT NULL THEN
        -- Insert starter products if none exist
        INSERT INTO public.products (id, artist_id, name, description, price, material, in_stock, image_url)
        VALUES
        (
            'e0000001-0000-0000-0000-000000000001',
            v_artist_id,
            'Crema Cicatrizante Vegana 50ml',
            'Fórmula botánica con caléndula y karité para regeneración dérmica profunda sin obstruir poros.',
            12.50,
            'Ingredientes 100% Veganos',
            true,
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80'
        ),
        (
            'e0000001-0000-0000-0000-000000000002',
            v_artist_id,
            'Espuma Limpiadora pH Neutro 150ml',
            'Jabón antibacteriano suave sin fragancias para higiene diaria durante los primeros 15 días.',
            14.00,
            'pH 5.5 Neutro',
            true,
            'https://images.unsplash.com/photo-1608248597359-250810260714?auto=format&fit=crop&w=600&q=80'
        ),
        (
            'e0000001-0000-0000-0000-000000000003',
            v_artist_id,
            'Aro Básico Titanio ASTM F136',
            'Aro continuo para perforación inicial o cicatrizada. Pulido espejo grado implante médico.',
            15.00,
            'Titanio Grado Implante ASTM F136',
            true,
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
        ),
        (
            'e0000001-0000-0000-0000-000000000004',
            v_artist_id,
            'Clicker Septum Oro 14k Neo-Tribal',
            'Diseño exclusivo forjado a mano por orfebres especializados en body piercing fino.',
            45.00,
            'Oro Macizo 14K Libre de Níquel',
            true,
            'https://images.unsplash.com/photo-1611591475152-47354c86574a?auto=format&fit=crop&w=600&q=80'
        ),
        (
            'e0000001-0000-0000-0000-000000000005',
            v_artist_id,
            'Hoodie Obsidian Atelier 400gsm',
            'Sudadera pesada corte oversized, serigrafía de alta densidad frontal y dorsal.',
            55.00,
            '100% Algodón Peinado 400g/m²',
            true,
            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;
