import { Response } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { payPalService } from '../services/paypal.service';
import { subscriptionService } from '../services/subscription.service';

export class SubscriptionController {
  async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    const product = await payPalService.createProduct(req.body);
    res.status(200).json(product);
  }

  async subscribe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const plan = await payPalService.subscription(req.body);
    res.status(200).json(plan);
  }

  async getPayPalSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id;
    const plan = await payPalService.getSubscriptionData(id);
    res.status(200).json(plan);
  }

  async getUserSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id;
    const result = await subscriptionService.getUserSubscription(id);
    res.status(200).json(result);
  }

  async insertUserSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await subscriptionService.insertUserSubscription(req.body);
    res.status(200).json(result);
  }
}

export const subscriptionController = new SubscriptionController();
