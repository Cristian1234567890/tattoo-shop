import { Response } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { authService } from '../services/auth.service';
import { emailVerificationService } from '../services/email-verification.service';

export class AuthController {
  async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await authService.signIn(req.body);
    res.status(200).json(result);
  }

  async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await authService.signUp(req.body);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.status(200).json(result);
  }

  async checkAvailability(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await emailVerificationService.checkAvailability(req.body || {});
    res.status(200).json({
      success: true,
      ...result,
    });
  }

  async sendEmailOtp(req: AuthenticatedRequest, res: Response): Promise<void> {
    const email = req.body?.email;
    const result = await emailVerificationService.sendOtp(email);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.message,
        cooldownRemaining: result.cooldownRemaining,
      });
      return;
    }
    res.status(200).json(result);
  }

  async verifyEmailOtp(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { email, code } = req.body || {};
    const result = await emailVerificationService.verifyOtp(email, code);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.message,
      });
      return;
    }
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
