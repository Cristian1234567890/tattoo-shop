import { Router } from 'express';
import { StudioController } from '../controllers/studio.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const studioController = new StudioController();

// Public: List & get studios
router.get('/studios', studioController.getStudios);
router.get('/studios/:id', studioController.getStudioById);

// Public / Client: Validate coupon
router.post('/coupons/validate', studioController.validateCoupon);

// Protected: Create, update, transfer, delete studios
router.post('/studios', requireAuth, studioController.createStudio);
router.put('/studios/:id', requireAuth, studioController.updateStudio);
router.delete('/studios/:id', requireAuth, studioController.deleteStudio);
router.post('/studios/:id/transfer', requireAuth, studioController.transferOwnership);

// Protected: Collaborator join studio
router.post('/studios/join', requireAuth, studioController.joinStudio);

// Protected: Client reviews studio (1 to 5 stars)
router.post('/studios/:id/reviews', requireAuth, studioController.addReview);

export default router;
