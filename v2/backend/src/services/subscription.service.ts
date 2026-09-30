import { supabaseAdmin } from '../config/supabase';
import { ApiResponse } from '../types/api.types';
import {
  UserSubscriptionRecord,
  InsertUserSubscriptionDTO,
} from '../types/subscription.types';

export class SubscriptionService {
  async getUserSubscription(id: string): Promise<ApiResponse<UserSubscriptionRecord[]>> {
    const { data, error } = await supabaseAdmin
      .from('user_subscription')
      .select('*')
      .eq('id', id);

    if (error) {
      return { success: false, error };
    }

    return { success: true, data: data || [] };
  }

  async insertUserSubscription(
    dto: InsertUserSubscriptionDTO
  ): Promise<ApiResponse<UserSubscriptionRecord[]>> {
    const { id, product_id, subscription_id } = dto;

    if (!id || !product_id || !subscription_id) {
      return {
        success: false,
        error: 'Missing required fields: id, product_id, subscription_id',
      };
    }

    const { data, error } = await supabaseAdmin
      .from('user_subscription')
      .upsert([{ id, product_id, subscription_id }])
      .select();

    if (error) {
      return { success: false, error };
    }
    
    // Also update the user_profiles table and user_metadata
    await supabaseAdmin
      .from('user_profiles')
      .update({
        has_active_subscription: true,
        paypal_subscription_id: subscription_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    try {
      await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: {
          has_active_subscription: true,
        },
      });
    } catch {}

    return { success: true, data: data || [] };
  }
}

export const subscriptionService = new SubscriptionService();
