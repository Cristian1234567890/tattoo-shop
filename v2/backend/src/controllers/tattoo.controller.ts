import { Response } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { tattooService } from '../services/tattoo.service';

export class TattooController {
  async getTatto(_req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await tattooService.getTattoPublicData();
    res.status(200).json(result);
  }

  async getTattoById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: 'Artist ID is required' });
      return;
    }
    const result = await tattooService.getTattoById(id);
    if (!result.success && result.error === 'Artist not found') {
      res.status(404).json(result);
      return;
    }
    res.status(result.success ? 200 : 500).json(result);
  }
}

export const tattooController = new TattooController();
