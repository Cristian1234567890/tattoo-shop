import { Response } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { authService } from '../services/auth.service';

export class AuthController {
  async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await authService.signIn(req.body);
    res.status(200).json(result);
  }

  async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await authService.signUp(req.body);
    res.status(200).json(result);
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await authService.signOut(req.token, req.refreshToken);
    res.status(200).json(result);
  }

  async enroll(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.token) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const result = await authService.enroll2FA(req.token, req.refreshToken);
    res.status(200).json(result);
  }

  async verify2fa(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.token) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const result = await authService.verify2FA(req.body, req.token, req.refreshToken);
    res.status(200).json(result);
  }
}

export const authController = new AuthController();
