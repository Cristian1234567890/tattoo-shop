import { Router } from 'express';
import { mailController } from '../controllers/mail.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { mailRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/mail', mailRateLimiter, requireAuth, (req, res, next) => {
  mailController.sendMail(req, res).catch(next);
});

export default router;
