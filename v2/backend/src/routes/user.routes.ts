import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  checkArtistSubscription,
  has_active_subscription,
} from '../middlewares/subscription.middleware';

const router = Router();

router.post('/updateuser', requireAuth, (req, res, next) => {
  userController.updateUser(req, res).catch(next);
});

router.post('/updateuserimg', requireAuth, has_active_subscription, (req, res, next) => {
  userController.updateUserImg(req, res).catch(next);
});

router.post('/complete-onboarding', requireAuth, (req, res, next) => {
  userController.completeOnboarding(req, res).catch(next);
});

router.get('/userprofile', requireAuth, (req, res, next) => {
  userController.getUserProfile(req, res).catch(next);
});

export default router;

