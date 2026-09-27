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
