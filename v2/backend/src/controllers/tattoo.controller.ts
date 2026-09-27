import { Response } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { tattooService } from '../services/tattoo.service';

export class TattooController {
  async getTatto(_req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await tattooService.getTattoPublicData();
    res.status(200).json(result);
  }
}

export const tattooController = new TattooController();
