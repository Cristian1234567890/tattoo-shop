import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/createproduct', (req, res, next) => {
  subscriptionController.createProduct(req, res).catch(next);
});

router.post('/subscribe', (req, res, next) => {
  subscriptionController.subscribe(req, res).catch(next);
});

router.get('/paypalsubscription/:id', (req, res, next) => {
  subscriptionController.getPayPalSubscription(req, res).catch(next);
});

router.get('/usersubscription/:id', optionalAuth, (req, res, next) => {
  subscriptionController.getUserSubscription(req, res).catch(next);
});

router.post('/usersubscription', requireAuth, (req, res, next) => {
  subscriptionController.insertUserSubscription(req, res).catch(next);
});

export default router;
