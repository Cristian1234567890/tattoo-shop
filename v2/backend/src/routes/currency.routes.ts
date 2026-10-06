import { Router } from 'express';
import { currencyController } from '../controllers/currency.controller';

const router = Router();

router.get('/currencies', (req, res, next) => {
  currencyController.getCurrencies(req, res).catch(next);
});

export default router;
