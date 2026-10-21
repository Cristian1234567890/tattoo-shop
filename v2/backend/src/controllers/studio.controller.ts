import { Response } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { StudioService } from '../services/studio.service';

export class StudioController {
  private studioService: StudioService;

  constructor() {
    this.studioService = new StudioService();
  }

  // GET /studios
  getStudios = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { search, minRating, style, city } = req.query;
      const studios = await this.studioService.getStudios({
        search: search as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        style: style as string,
        city: city as string,
      });
      res.json({ success: true, data: studios });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };

  // GET /studios/:id
  getStudioById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const studio = await this.studioService.getStudioById(id);
      if (!studio) {
        return res.status(404).json({ success: false, error: 'Estudio no encontrado' });
      }
      res.json({ success: true, data: studio });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };

  // POST /studios (create new studio, with duplicate name validation)
  createStudio = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const ownerId = req.user?.id || 'anon-owner';
      const studio = await this.studioService.createStudio(req.body, ownerId);
      res.status(201).json({ success: true, data: studio });
    } catch (error: any) {
      const status = error.message?.includes('Ya existe un estudio') ? 409 : 400;
      res.status(status).json({ success: false, error: error.message });
    }
  };

  // PUT /studios/:id
  updateStudio = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const requesterId = req.user?.id || '';
      const updated = await this.studioService.updateStudio(id, req.body, requesterId);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      const status = error.message?.includes('No tienes permisos') ? 403 : 400;
      res.status(status).json({ success: false, error: error.message });
    }
  };

  // POST /studios/:id/transfer
  transferOwnership = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { new_owner_id } = req.body;
      const currentOwnerId = req.user?.id || '';
      const studio = await this.studioService.transferOwnership(id, new_owner_id, currentOwnerId);
      res.json({ success: true, data: studio });
    } catch (error: any) {
      const status = error.message?.includes('Solo el propietario') ? 403 : 400;
      res.status(status).json({ success: false, error: error.message });
    }
  };

  // DELETE /studios/:id
  deleteStudio = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const currentOwnerId = req.user?.id || '';
      const result = await this.studioService.deleteStudio(id, currentOwnerId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      const status = error.message?.includes('Solo el propietario') ? 403 : 400;
      res.status(status).json({ success: false, error: error.message });
    }
  };

  // POST /studios/join
  joinStudio = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { studio_code } = req.body;
      const artistData = {
        id: req.user?.id || 'anon-artist',
        name: req.user?.user_metadata?.nombre || req.user?.user_metadata?.full_name || 'Artista Colaborador',
        avatar: req.user?.user_metadata?.avatar_url || req.user?.user_metadata?.profile,
        specialties: req.body.specialties || ['General']
      };
      const result = await this.studioService.joinStudio(studio_code, artistData);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };

  // POST /studios/:id/reviews
  addReview = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const clientId = req.user?.id || 'anon-client';
      const clientName = req.user?.user_metadata?.nombre || req.body.client_name || 'Cliente';
      const clientAvatar = req.user?.user_metadata?.avatar_url || req.body.client_avatar;
      const { rating, comment } = req.body;

      const result = await this.studioService.addReview(id, clientId, {
        rating,
        comment,
        clientName,
        clientAvatar
      });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };

  // POST /coupons/validate
  validateCoupon = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { code, applies_to } = req.body;
      const result = this.studioService.validateCoupon(code, applies_to);
      if (!result.valid) {
        return res.status(400).json({ success: false, error: result.message });
      }
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };
}
