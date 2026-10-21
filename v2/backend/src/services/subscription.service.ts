import { supabaseAdmin } from '../config/supabase';
import { ApiResponse } from '../types/api.types';
import {
  UserSubscriptionRecord,
  InsertUserSubscriptionDTO,
  CardAffiliationDTO,
  CancelSubscriptionDTO,
  ReactivateSubscriptionDTO,
  SubscriptionStatusDTO,
} from '../types/subscription.types';

export function isValidLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function detectCardBrand(cardNumber: string): string {
  const clean = cardNumber.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^(5[1-5]|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'American Express';
  if (/^6(?:011|5)/.test(clean)) return 'Discover';
  return 'Tarjeta';
}

// In-memory vault for caching active subscription statuses and sandbox mock states
const memorySubscriptionVault = new Map<string, {
  user_id: string;
  has_active_subscription: boolean;
  subscription_status: 'active' | 'canceling' | 'canceled' | 'none';
  cancel_at_period_end: boolean;
  current_period_end: string;
  plan?: string;
  card?: {
    last4: string;
    brand: string;
    exp_month?: string;
    exp_year?: string;
    holder?: string;
  };
}>();

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

    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Cache in memory vault
    memorySubscriptionVault.set(id, {
      user_id: id,
      has_active_subscription: true,
      subscription_status: 'active',
      cancel_at_period_end: false,
      current_period_end: currentPeriodEnd,
      plan: product_id,
      card: {
        last4: '4242',
        brand: 'Visa',
        exp_month: '12',
        exp_year: '28',
      },
    });

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
          subscription_status: 'active',
          cancel_at_period_end: false,
          current_period_end: currentPeriodEnd,
        },
      });
    } catch {}

    return { success: true, data: data || [] };
  }

  // Legacy Card Affiliation Vault: saves card directly without Stripe redirect
  async affiliateCard(dto: CardAffiliationDTO): Promise<ApiResponse<any>> {
    const {
      user_id,
      holder_name,
      card_number,
      expiration,
      cvv,
      agreement_accepted,
      role,
      plan_type,
      billing_cycle,
    } = dto;

    if (!holder_name || holder_name.trim().length < 2) {
      return { success: false, error: 'El nombre del titular es obligatorio y debe ser válido.' };
    }

    const cleanCard = (card_number || '').replace(/\D/g, '');
    if (cleanCard.length < 13 || cleanCard.length > 19) {
      return { success: false, error: 'El número de tarjeta debe contener entre 13 y 19 dígitos numéricos.' };
    }

    // Luhn validation (allows 4000123456789010 / 4242... for sandbox/QA if needed, else strict Luhn)
    const isSandboxPattern = cleanCard.startsWith('4000') || cleanCard.startsWith('4242') || cleanCard.startsWith('4111');
    if (!isSandboxPattern && !isValidLuhn(cleanCard)) {
      return { success: false, error: 'El número de tarjeta no es válido (algoritmo de Luhn).' };
    }

    // Expiration date MM/AA validation
    const expParts = (expiration || '').split('/');
    if (expParts.length !== 2) {
      return { success: false, error: 'Formato de expiración inválido. Utiliza MM/AA.' };
    }
    const expMonth = parseInt(expParts[0].trim(), 10);
    const expYear = parseInt(expParts[1].trim(), 10);
    if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
      return { success: false, error: 'El mes de expiración debe estar entre 01 y 12.' };
    }
    if (isNaN(expYear)) {
      return { success: false, error: 'El año de expiración no es válido.' };
    }

    const now = new Date();
    const currentFullYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const fullExpYear = expYear < 100 ? 2000 + expYear : expYear;

    if (fullExpYear < currentFullYear || (fullExpYear === currentFullYear && expMonth < currentMonth)) {
      return { success: false, error: 'La tarjeta indicada se encuentra vencida.' };
    }

    // CVV validation
    const cleanCvv = (cvv || '').replace(/\D/g, '');
    const brand = detectCardBrand(cleanCard);
    const requiredCvvLen = brand === 'American Express' ? 4 : 3;
    if (cleanCvv.length < 3 || cleanCvv.length > 4) {
      return { success: false, error: `El código CVV debe tener ${requiredCvvLen} dígitos.` };
    }

    // Affiliation consent
    if (!agreement_accepted) {
      return {
        success: false,
        error: 'Debes autorizar expresamente la afiliación de la tarjeta para débitos periódicos de suscripción.',
      };
    }

    const last4 = cleanCard.slice(-4);
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const maskedCard = {
      last4,
      brand,
      exp_month: String(expMonth).padStart(2, '0'),
      exp_year: String(expYear).padStart(2, '0'),
      holder: holder_name.trim().toUpperCase(),
    };

    const targetUserId = user_id || 'anonymous_user';

    // Store in memory vault
    memorySubscriptionVault.set(targetUserId, {
      user_id: targetUserId,
      has_active_subscription: true,
      subscription_status: 'active',
      cancel_at_period_end: false,
      current_period_end: currentPeriodEnd,
      plan: plan_type || (role === 'tatuador' ? 'studio' : 'vip'),
      card: maskedCard,
    });

    // If real user ID exists, update Supabase user profiles and metadata
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUserId);
    if (isUuid) {
      try {
        await supabaseAdmin
          .from('user_profiles')
          .update({
            has_active_subscription: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user_id);

        const targetRole = role === 'tatuador' ? 'Tatuador' : (role === 'cliente' ? 'Cliente' : undefined);
        const metaUpdate: Record<string, any> = {
          has_active_subscription: true,
          subscription_status: 'active',
          cancel_at_period_end: false,
          current_period_end: currentPeriodEnd,
          card_last4: last4,
          card_brand: brand,
          card_exp: `${maskedCard.exp_month}/${maskedCard.exp_year}`,
          card_holder: maskedCard.holder,
          billing_cycle: billing_cycle || 'monthly',
        };
        if (targetRole) {
          metaUpdate.tipo = targetRole;
          metaUpdate.role = targetRole;
        }

        await supabaseAdmin.auth.admin.updateUserById(user_id!, {
          user_metadata: metaUpdate,
        });
      } catch (err) {
        console.warn('[SubscriptionService] Supabase profile sync warning:', err);
      }
    }

    return {
      success: true,
      message: 'Tarjeta afiliada exitosamente y membresía activada por 30 días.',
      data: {
        subscription_status: 'active',
        has_active_subscription: true,
        cancel_at_period_end: false,
        current_period_end: currentPeriodEnd,
        card: maskedCard,
      },
    };
  }

  // Cancel subscription with 30-day grace period
  async cancelSubscription(dto: CancelSubscriptionDTO): Promise<ApiResponse<any>> {
    const userId = dto.user_id || dto.id;
    if (!userId) {
      return { success: false, error: 'Se requiere el identificador de usuario para cancelar la suscripción.' };
    }

    const existing = memorySubscriptionVault.get(userId);
    const now = new Date();
    const periodEnd = existing?.current_period_end || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const updated = {
      user_id: userId,
      has_active_subscription: true, // Keep benefits during the remainder of the 30-day period
      subscription_status: 'canceling' as const,
      cancel_at_period_end: true,
      current_period_end: periodEnd,
      plan: existing?.plan || 'vip',
      card: existing?.card || { last4: '4242', brand: 'Visa', exp_month: '12', exp_year: '28' },
    };

    memorySubscriptionVault.set(userId, updated);

    // Update Supabase if valid UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (isUuid) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            has_active_subscription: true,
            subscription_status: 'canceling',
            cancel_at_period_end: true,
            current_period_end: periodEnd,
            cancellation_reason: dto.reason || 'Usuario solicitó cancelación',
            canceled_at: now.toISOString(),
          },
        });
      } catch (err) {
        console.warn('[SubscriptionService] Failed to update user metadata on cancel:', err);
      }
    }

    return {
      success: true,
      message: 'Cancelación programada exitosamente. Mantendrás tus beneficios activos hasta cumplir los 30 días del período contratado.',
      data: {
        subscription_status: 'canceling',
        has_active_subscription: true,
        cancel_at_period_end: true,
        current_period_end: periodEnd,
      },
    };
  }

  // Reactivate a subscription that was scheduled to cancel
  async reactivateSubscription(dto: ReactivateSubscriptionDTO): Promise<ApiResponse<any>> {
    const userId = dto.user_id || dto.id;
    if (!userId) {
      return { success: false, error: 'Se requiere el identificador de usuario para reactivar la suscripción.' };
    }

    const existing = memorySubscriptionVault.get(userId);
    const periodEnd = existing?.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const updated = {
      user_id: userId,
      has_active_subscription: true,
      subscription_status: 'active' as const,
      cancel_at_period_end: false,
      current_period_end: periodEnd,
      plan: existing?.plan || 'vip',
      card: existing?.card || { last4: '4242', brand: 'Visa', exp_month: '12', exp_year: '28' },
    };

    memorySubscriptionVault.set(userId, updated);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (isUuid) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            has_active_subscription: true,
            subscription_status: 'active',
            cancel_at_period_end: false,
            current_period_end: periodEnd,
            canceled_at: null,
            cancellation_reason: null,
          },
        });
      } catch (err) {
        console.warn('[SubscriptionService] Failed to update user metadata on reactivate:', err);
      }
    }

    return {
      success: true,
      message: 'Suscripción reactivada exitosamente. Tu membresía continuará renovándose normalmente.',
      data: {
        subscription_status: 'active',
        has_active_subscription: true,
        cancel_at_period_end: false,
        current_period_end: periodEnd,
      },
    };
  }

  // Get current subscription status
  async getSubscriptionStatus(userId: string): Promise<ApiResponse<SubscriptionStatusDTO>> {
    const cached = memorySubscriptionVault.get(userId);

    // If cached, evaluate expiration
    if (cached) {
      const now = new Date();
      const periodEndDate = new Date(cached.current_period_end);
      const isExpired = now.getTime() > periodEndDate.getTime();

      if (isExpired && cached.cancel_at_period_end) {
        cached.has_active_subscription = false;
        cached.subscription_status = 'canceled';
      }

      const diffTime = Math.max(0, periodEndDate.getTime() - now.getTime());
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        success: true,
        data: {
          has_active_subscription: cached.has_active_subscription,
          subscription_status: cached.subscription_status,
          cancel_at_period_end: cached.cancel_at_period_end,
          current_period_end: cached.current_period_end,
          days_remaining: daysRemaining,
          plan: cached.plan,
          card: cached.card,
        },
      };
    }

    // Try fetching from Supabase auth user metadata
    try {
      const { data: userRecord } = await supabaseAdmin.auth.admin.getUserById(userId);
      const meta = userRecord?.user?.user_metadata || {};
      const hasActive = Boolean(meta.has_active_subscription);
      const cancelAtPeriodEnd = Boolean(meta.cancel_at_period_end);
      const currentPeriodEnd = meta.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const now = new Date();
      const periodEndDate = new Date(currentPeriodEnd);
      const isExpired = now.getTime() > periodEndDate.getTime();

      let status: 'active' | 'canceling' | 'canceled' | 'none' = 'none';
      if (hasActive) {
        status = cancelAtPeriodEnd ? 'canceling' : 'active';
      }
      if (isExpired && cancelAtPeriodEnd) {
        status = 'canceled';
      }

      const daysRemaining = Math.ceil(Math.max(0, periodEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const card = meta.card_last4 ? {
        last4: meta.card_last4,
        brand: meta.card_brand || 'Visa',
        exp_month: meta.card_exp?.split('/')[0] || '12',
        exp_year: meta.card_exp?.split('/')[1] || '28',
        holder: meta.card_holder || '',
      } : undefined;

      return {
        success: true,
        data: {
          has_active_subscription: isExpired && cancelAtPeriodEnd ? false : hasActive,
          subscription_status: status,
          cancel_at_period_end: cancelAtPeriodEnd,
          current_period_end: currentPeriodEnd,
          days_remaining: daysRemaining,
          plan: meta.role === 'Tatuador' ? 'studio' : 'vip',
          card,
        },
      };
    } catch {
      return {
        success: true,
        data: {
          has_active_subscription: false,
          subscription_status: 'none',
          cancel_at_period_end: false,
        },
      };
    }
  }
}

export const subscriptionService = new SubscriptionService();

