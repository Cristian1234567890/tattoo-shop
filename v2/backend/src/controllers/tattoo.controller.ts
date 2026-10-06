import { Response } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { tattooService, ArtistFilterParams } from '../services/tattoo.service';

export class TattooController {
  async getTatto(req: AuthenticatedRequest, res: Response): Promise<void> {
    const filters: ArtistFilterParams = {
      country: typeof req.query.country === 'string' ? req.query.country : undefined,
      city: typeof req.query.city === 'string' ? req.query.city : undefined,
      style: typeof (req.query.style || req.query.work_type) === 'string' ? String(req.query.style || req.query.work_type) : undefined,
      currency: typeof req.query.currency === 'string' ? req.query.currency : undefined,
      minPrice: req.query.minPrice !== undefined && req.query.minPrice !== '' ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice !== undefined && req.query.maxPrice !== '' ? Number(req.query.maxPrice) : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
      limit: req.query.limit !== undefined && req.query.limit !== '' ? Number(req.query.limit) : undefined,
      offset: req.query.offset !== undefined && req.query.offset !== '' ? Number(req.query.offset) : undefined,
    };

    const result = await tattooService.getTattoPublicData(req.user?.id, filters);
    res.status(200).json(result);
  }

  async getTattoById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: 'Artist ID is required' });
      return;
    }
    const result = await tattooService.getTattoById(id, req.user?.id);
    if (!result.success && result.error === 'Artist not found') {
      res.status(404).json(result);
      return;
    }
    res.status(result.success ? 200 : 500).json(result);
  }
}

export const tattooController = new TattooController();
