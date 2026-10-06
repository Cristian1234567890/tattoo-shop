-- Phase 1 Store (Catalog & Pickup)

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    material TEXT,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, ready_for_pickup, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- RLS Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read, only artist can insert/update/delete
CREATE POLICY "Public read for products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Artists can insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Artists can update own products" ON public.products FOR UPDATE USING (auth.uid() = artist_id);
CREATE POLICY "Artists can delete own products" ON public.products FOR DELETE USING (auth.uid() = artist_id);
CREATE POLICY "Service role full access products" ON public.products FOR ALL TO service_role USING (true);

-- Orders: Clients read their own, Artists read received orders
CREATE POLICY "Clients and Artists read orders" ON public.orders FOR SELECT USING (auth.uid() = client_id OR auth.uid() = artist_id);
CREATE POLICY "Clients can insert orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients and Artists update orders" ON public.orders FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = artist_id);
CREATE POLICY "Service role full access orders" ON public.orders FOR ALL TO service_role USING (true);

-- Order Items: Based on order visibility
CREATE POLICY "Clients and Artists read order_items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND (o.client_id = auth.uid() OR o.artist_id = auth.uid()))
);
CREATE POLICY "Clients can insert order_items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.client_id = auth.uid())
);
CREATE POLICY "Service role full access order_items" ON public.order_items FOR ALL TO service_role USING (true);
