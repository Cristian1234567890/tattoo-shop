export interface UserSubscriptionRecord {
  id: string;
  product_id: string;
  subscription_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface InsertUserSubscriptionDTO {
  id?: string;
  product_id?: string;
  subscription_id?: string;
}

export interface PayPalProduct {
  id: string;
  name: string;
  description?: string;
  type?: string;
  category?: string;
  [key: string]: any;
}

export interface PayPalPlan {
  id: string;
  product_id?: string;
  name: string;
  description?: string;
  status: string;
  [key: string]: any;
}

export interface CardAffiliationDTO {
  user_id?: string;
  holder_name: string;
  card_number: string;
  expiration: string;
  cvv: string;
  agreement_accepted: boolean;
  role?: 'cliente' | 'tatuador' | string;
  plan_type?: 'vip' | 'studio' | string;
  billing_cycle?: 'monthly' | 'annual';
}

export interface CancelSubscriptionDTO {
  id?: string;
  user_id?: string;
  reason?: string;
}

export interface ReactivateSubscriptionDTO {
  id?: string;
  user_id?: string;
}

export interface SubscriptionStatusDTO {
  has_active_subscription: boolean;
  subscription_status: 'active' | 'canceling' | 'canceled' | 'none';
  cancel_at_period_end: boolean;
  current_period_end?: string;
  days_remaining?: number;
  plan?: string;
  card?: {
    last4: string;
    brand: string;
    exp_month?: string;
    exp_year?: string;
    holder?: string;
  };
}

