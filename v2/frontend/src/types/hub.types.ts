export interface AgendaItem {
  id: string | number;
  artist_id?: string;
  client_id?: string;
  start_time: string;
  end_time?: string;
  status:
    | 'pending_approval'
    | 'scheduled'
    | 'reschedule_requested_client'
    | 'reschedule_requested_artist'
    | 'completed'
    | 'cancelled';
  notes?: string;
  artist_name?: string;
  client_name?: string;
  service_title?: string;
  studio_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentItem {
  id: string | number;
  client_id?: string;
  artist_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'paypal' | 'credit_card' | 'cash_studio' | 'transfer' | string;
  sketch_id?: string | null;
  concept?: string;
  created_at: string;
  updated_at?: string;
}

export type ProductCategory =
  | 'all'
  | 'aftercare'
  | 'jewelry'
  | 'apparel'
  | 'prints'
  | 'gift_cards';

export interface ProductItem {
  id: string;
  artist_id?: string;
  name: string;
  description: string;
  price: number;
  material?: string;
  in_stock: boolean;
  image_url: string;
  category: 'aftercare' | 'jewelry' | 'apparel' | 'prints' | 'gift_cards' | string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  client_id?: string;
  artist_id?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';
  pickup_code?: string;
  created_at: string;
  order_items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    price_at_time: number;
    products?: ProductItem;
  }>;
}

export interface SketchItem {
  id: string;
  client_id?: string;
  artist_id?: string;
  image_url: string;
  description?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
}
