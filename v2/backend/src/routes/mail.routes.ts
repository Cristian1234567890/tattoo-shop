import { Router } from 'express';
import { mailController } from '../controllers/mail.controller';
import { optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/mail', optionalAuth, (req, res, next) => {
  mailController.sendMail(req, res).catch(next);
});

export default router;
