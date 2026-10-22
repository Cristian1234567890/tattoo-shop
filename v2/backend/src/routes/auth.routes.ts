import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/login', authRateLimiter, (req, res, next) => {
  authController.login(req, res).catch(next);
});

router.post('/register', authRateLimiter, (req, res, next) => {
  authController.register(req, res).catch(next);
});

router.post('/check-availability', (req, res, next) => {
  authController.checkAvailability(req, res).catch(next);
});

router.post('/send-email-otp', authRateLimiter, (req, res, next) => {
  authController.sendEmailOtp(req, res).catch(next);
});

router.post('/verify-email-otp', authRateLimiter, (req, res, next) => {
  authController.verifyEmailOtp(req, res).catch(next);
});

router.post('/logout', optionalAuth, (req, res, next) => {
  authController.logout(req, res).catch(next);
});

router.post('/enroll', authRateLimiter, requireAuth, (req, res, next) => {
  authController.enroll(req, res).catch(next);
});

router.post('/verify2fa', authRateLimiter, requireAuth, (req, res, next) => {
  authController.verify2fa(req, res).catch(next);
});

export default router;
