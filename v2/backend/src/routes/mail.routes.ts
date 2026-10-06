import { Router } from 'express';
import { mailController } from '../controllers/mail.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/mail', requireAuth, (req, res, next) => {
  mailController.sendMail(req, res).catch(next);
});

export default router;
