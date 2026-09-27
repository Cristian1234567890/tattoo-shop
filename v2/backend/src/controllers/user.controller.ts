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
}

export const userController = new UserController();
