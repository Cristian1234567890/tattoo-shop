import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/updateuser', requireAuth, (req, res, next) => {
  userController.updateUser(req, res).catch(next);
});

router.post('/updateuserimg', requireAuth, (req, res, next) => {
  userController.updateUserImg(req, res).catch(next);
});

export default router;
