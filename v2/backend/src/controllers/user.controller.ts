import { Response } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { userService } from '../services/user.service';

export class UserController {
  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || !req.token) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const result = await userService.updateUser(
      req.body,
      req.user,
      req.token,
      req.refreshToken
    );
    res.status(200).json(result);
  }

  async updateUserImg(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || !req.token) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const result = await userService.updateUserImg(
      req.body?.imageData,
      req.user,
      req.token,
      req.refreshToken
    );
    res.status(200).json(result);
  }

  async completeOnboarding(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || !req.token) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const result = await userService.completeOnboarding(
      req.body,
      req.user,
      req.token,
      req.refreshToken
    );
    const status = result.success ? 200 : (result.error?.status || 400);
    res.status(status).json(result);
  }

  async getUserProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const result = await userService.getUserProfile(req.user);
    if (!result.success || !result.data) {
      res.status(200).json(result);
      return;
    }

    const profile = result.data as any;
    const createdAtStr = profile.created_at || (req.user as any).created_at || new Date().toISOString();
    const createdAt = new Date(createdAtStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const hasActiveSubscription = Boolean(
      profile.has_active_subscription ??
      req.user.user_metadata?.has_active_subscription ??
      false
    );

    const rawRole = profile.role || req.user.user_metadata?.tipo || req.user.user_metadata?.role || '';
    const isArtist = (rawRole || '').toLowerCase() === 'tatuador';

    const augmentedData = {
      ...profile,
      role: rawRole || profile.role,
      has_active_subscription: hasActiveSubscription,
      ...(isArtist
        ? {
            is_trial_active: diffDays <= 90,
            trial_days_remaining: Math.max(0, 90 - diffDays),
            trial_expired: diffDays > 90 && !hasActiveSubscription,
            days_active: diffDays,
          }
        : {
            is_trial_active: false,
            trial_days_remaining: 0,
            trial_expired: false,
          }),
    };

    res.status(200).json({
      success: true,
      data: augmentedData,
    });
  }

  async saveTattooProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const { tattooId, stage, notes, photo_url } = req.body || {};
    res.status(200).json({
      success: true,
      message: 'Progreso de cicatrización registrado exitosamente',
      data: {
        id: `prog-${Date.now()}`,
        userId: req.user.id,
        tattooId: tattooId || 'default',
        stage: stage || 'Fase 1: Limpieza & Primer Vendaje',
        notes: notes || '',
        photo_url: photo_url || null,
        created_at: new Date().toISOString(),
      },
    });
  }
}

export const userController = new UserController();
