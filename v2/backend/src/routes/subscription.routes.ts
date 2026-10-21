import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import currencyRoutes from './currency.routes';

const router = Router();

// Mount currency routes
router.use(currencyRoutes);

router.post('/createproduct', (req, res, next) => {
  subscriptionController.createProduct(req, res).catch(next);
});

router.post('/subscribe', requireAuth, (req, res, next) => {
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

// Legacy Card Affiliation Payment Gateway
router.post('/subscription/affiliate-card', optionalAuth, (req, res, next) => {
  subscriptionController.affiliateCard(req, res).catch(next);
});

// Subscription Cancellation with 30-day grace period
router.post('/subscription/cancel', optionalAuth, (req, res, next) => {
  subscriptionController.cancelSubscription(req, res).catch(next);
});

// Subscription Reactivation
router.post('/subscription/reactivate', optionalAuth, (req, res, next) => {
  subscriptionController.reactivateSubscription(req, res).catch(next);
});

// Subscription Status
router.get('/subscription/status/:id', optionalAuth, (req, res, next) => {
  subscriptionController.getStatus(req, res).catch(next);
});

router.get('/subscription/status', optionalAuth, (req, res, next) => {
  subscriptionController.getStatus(req, res).catch(next);
});

export default router;
