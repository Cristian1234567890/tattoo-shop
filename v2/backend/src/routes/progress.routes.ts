import { Router, Response } from 'express';
import { progressService } from '../services/progress.service';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireClientPremium } from '../middlewares/subscription.middleware';
import { AuthenticatedRequest } from '../types/api.types';

const router = Router();

// =========================================================================
// Client Progress Endpoints (Protected by requireAuth & requireClientPremium)
// Supports both '/api/client/tattoo-progress' and '/client/tattoo-progress'
// =========================================================================

// POST - Create tattoo progress entry
const handleSaveProgress = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    return;
  }
  const result = await progressService.saveProgress(req.user.id, req.body || {});
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
};

router.post('/api/client/tattoo-progress', requireAuth, requireClientPremium, (req, res, next) => {
  handleSaveProgress(req, res).catch(next);
});

router.post('/client/tattoo-progress', requireAuth, requireClientPremium, (req, res, next) => {
  handleSaveProgress(req, res).catch(next);
});

// GET - List client's tattoo progress entries
const handleGetClientProgress = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    return;
  }
  const result = await progressService.getClientProgress(req.user.id);
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
};

router.get('/api/client/tattoo-progress', requireAuth, requireClientPremium, (req, res, next) => {
  handleGetClientProgress(req, res).catch(next);
});

router.get('/client/tattoo-progress', requireAuth, requireClientPremium, (req, res, next) => {
  handleGetClientProgress(req, res).catch(next);
});

// DELETE - Delete a progress entry (by id)
const handleDeleteProgress = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    return;
  }
  const { id } = req.params;
  const result = await progressService.deleteProgress(id, req.user.id);
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
};

router.delete('/api/client/tattoo-progress/:id', requireAuth, requireClientPremium, (req, res, next) => {
  handleDeleteProgress(req, res).catch(next);
});

router.delete('/client/tattoo-progress/:id', requireAuth, requireClientPremium, (req, res, next) => {
  handleDeleteProgress(req, res).catch(next);
});

// =========================================================================
// Artist Progress Endpoints (Protected by requireAuth)
// Artists can view progress shared with them
// =========================================================================
const handleGetArtistProgress = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    return;
  }
  const result = await progressService.getArtistClientProgress(req.user.id);
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
};

router.get('/api/artist/tattoo-progress', requireAuth, (req, res, next) => {
  handleGetArtistProgress(req, res).catch(next);
});

router.get('/artist/tattoo-progress', requireAuth, (req, res, next) => {
  handleGetArtistProgress(req, res).catch(next);
});

export default router;
