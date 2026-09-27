import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', (req, res, next) => {
  authController.login(req, res).catch(next);
});

router.post('/register', (req, res, next) => {
  authController.register(req, res).catch(next);
});

router.post('/logout', optionalAuth, (req, res, next) => {
  authController.logout(req, res).catch(next);
});

router.post('/enroll', requireAuth, (req, res, next) => {
  authController.enroll(req, res).catch(next);
});

router.post('/verify2fa', requireAuth, (req, res, next) => {
  authController.verify2fa(req, res).catch(next);
});

export default router;
