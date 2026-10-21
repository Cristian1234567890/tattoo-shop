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

  async affiliateCard(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id || req.body.user_id;
    const result = await subscriptionService.affiliateCard({
      ...req.body,
      user_id: userId,
    });
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  }

  async cancelSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id || req.body.id || req.body.user_id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Usuario no autenticado o ID faltante.' });
      return;
    }
    const result = await subscriptionService.cancelSubscription({
      ...req.body,
      user_id: userId,
    });
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  }

  async reactivateSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id || req.body.id || req.body.user_id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Usuario no autenticado o ID faltante.' });
      return;
    }
    const result = await subscriptionService.reactivateSubscription({
      ...req.body,
      user_id: userId,
    });
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  }

  async getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id || req.params.id || (req.query.id as string);
    if (!userId) {
      res.status(400).json({ success: false, error: 'ID de usuario requerido.' });
      return;
    }
    const result = await subscriptionService.getSubscriptionStatus(userId);
    res.status(200).json(result);
  }
}

export const subscriptionController = new SubscriptionController();
