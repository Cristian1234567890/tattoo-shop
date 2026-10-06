import { Request, Response } from 'express';
import { currencyService } from '../services/currency.service';

export class CurrencyController {
  async getCurrencies(_req: Request, res: Response): Promise<void> {
    try {
      const result = await currencyService.getActiveCurrencies();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Error fetching currencies' },
      });
    }
  }
}

export const currencyController = new CurrencyController();
