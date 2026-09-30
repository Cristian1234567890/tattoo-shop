import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const has_active_subscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    // Query user_profiles using supabaseAdmin to bypass RLS restrictions
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('created_at, has_active_subscription, role')
      .eq('id', user.id)
      .maybeSingle();

    const meta = user.user_metadata || {};
    const role = (profile?.role || meta.role || meta.tipo || '').trim();
    const isArtist = role.toLowerCase() === 'tatuador';
    const hasActiveSubscription = Boolean(profile?.has_active_subscription ?? meta.has_active_subscription ?? false);

    // 1. Tatuador role: verify active subscription or valid 90-day trial
    if (isArtist) {
      if (hasActiveSubscription) {
        return next();
      }

      const createdAtStr = profile?.created_at || user.created_at || new Date().toISOString();
      const createdAt = new Date(createdAtStr);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 90) {
        return next();
      }

      return res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'Tu período de prueba de 90 días ha expirado. Por favor, adquiere una suscripción para continuar usando las funciones comerciales.',
        trial_expired: true,
        days_active: diffDays,
      });
    }

    // 2. Cliente role: allow standard routes, guard premium routes if invoked directly
    const path = req.path || '';
    const originalUrl = req.originalUrl || '';
    const isPremiumPath = path.includes('tattoo-progress') || originalUrl.includes('tattoo-progress');

    if (isPremiumPath && !hasActiveSubscription) {
      return res.status(403).json({
        success: false,
        code: 'CLIENT_PREMIUM_REQUIRED',
        message: 'Función disponible solo para suscriptores premium ($4.99/mes).',
      });
    }

    return next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error validando la suscripción' });
  }
};

// Backward-compatible alias for existing endpoints and tests
export const checkArtistSubscription = has_active_subscription;

export const requireClientPremium = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('has_active_subscription, role')
      .eq('id', user.id)
      .maybeSingle();

    const meta = user.user_metadata || {};
    const hasActiveSubscription = Boolean(profile?.has_active_subscription ?? meta.has_active_subscription ?? false);

    if (!hasActiveSubscription) {
      return res.status(403).json({
        success: false,
        code: 'CLIENT_PREMIUM_REQUIRED',
        message: 'Función disponible solo para suscriptores premium ($4.99/mes).',
      });
    }

    return next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error validando suscripción premium del cliente' });
  }
};

