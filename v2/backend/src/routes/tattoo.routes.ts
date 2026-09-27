import { Router } from 'express';
import { tattooController } from '../controllers/tattoo.controller';
import { optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/gettatto', optionalAuth, (req, res, next) => {
  tattooController.getTatto(req, res).catch(next);
});

export default router;
