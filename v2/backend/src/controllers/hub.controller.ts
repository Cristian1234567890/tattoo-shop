import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { HubService } from '../services/hub.service';

export class HubController {
    private hubService: HubService;

    constructor() {
        this.hubService = new HubService();
    }

    // Schedules
    getArtistSchedules = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { artistId } = req.params;
            const schedules = await this.hubService.getSchedules(artistId);
            res.json({ success: true, data: schedules });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    createSchedule = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const data = { ...req.body, artist_id: req.user?.id };
            const schedule = await this.hubService.createSchedule(data);
            res.json({ success: true, data: schedule });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    updateSchedule = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const schedule = await this.hubService.updateSchedule(id, req.body);
            res.json({ success: true, data: schedule });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    deleteSchedule = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            await this.hubService.deleteSchedule(id);
            res.json({ success: true });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    // Promotions
    getArtistPromotions = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { artistId } = req.params;
            const promos = await this.hubService.getPromotions(artistId);
            res.json({ success: true, data: promos });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    createPromotion = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const data = { ...req.body, artist_id: req.user?.id };
            const promo = await this.hubService.createPromotion(data);
            res.json({ success: true, data: promo });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    updatePromotion = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const promo = await this.hubService.updatePromotion(id, req.body);
            res.json({ success: true, data: promo });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    deletePromotion = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            await this.hubService.deletePromotion(id);
            res.json({ success: true });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    // Sketches
    getSketches = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user?.id!;
            const role = req.user?.user_metadata?.role;
            const sketches = await this.hubService.getSketches(userId);
            res.json({ success: true, data: sketches });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    createSketch = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const data = { ...req.body, client_id: req.user?.id };
            const sketch = await this.hubService.createSketch(data);
            res.json({ success: true, data: sketch });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    updateSketch = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const sketch = await this.hubService.updateSketch(id, req.body);
            res.json({ success: true, data: sketch });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    // Payments
    getPayments = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user?.id!;
            const payments = await this.hubService.getPayments(userId);
            res.json({ success: true, data: payments });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    createPayment = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const data = { ...req.body, client_id: req.user?.id };
            const payment = await this.hubService.createPayment(data);
            res.json({ success: true, data: payment });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    // Agenda
    getAgenda = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user?.id!;
            const agenda = await this.hubService.getAgenda(userId);
            res.json({ success: true, data: agenda });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    createAgenda = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const data = { ...req.body };
            const role = req.user?.user_metadata?.role;
            if (role === 'client') {
                data.client_id = req.user?.id;
            } else {
                data.artist_id = req.user?.id;
            }
            const agenda = await this.hubService.createAgenda(data);
            res.json({ success: true, data: agenda });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    updateAgenda = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const agenda = await this.hubService.updateAgenda(id, req.body);
            res.json({ success: true, data: agenda });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    // Products
    getProducts = async (req: Request, res: Response) => {
        try {
            const { artistId, category } = req.query as { artistId?: string; category?: string };
            const products = await this.hubService.getProducts(artistId, category);
            res.json({ success: true, data: products });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    getArtistProducts = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { artistId } = req.params;
            const products = await this.hubService.getProducts(artistId);
            res.json({ success: true, data: products });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    createProduct = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const data = { ...req.body, artist_id: req.user?.id };
            const product = await this.hubService.createProduct(data);
            res.json({ success: true, data: product });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    updateProduct = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const product = await this.hubService.updateProduct(id, req.body);
            res.json({ success: true, data: product });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            await this.hubService.deleteProduct(id);
            res.json({ success: true });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    // Orders
    getOrders = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user?.id!;
            const orders = await this.hubService.getOrders(userId);
            res.json({ success: true, data: orders });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    createOrder = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { items, ...orderData } = req.body;
            orderData.client_id = req.user?.id;
            const order = await this.hubService.createOrder(orderData, items);
            res.json({ success: true, data: order });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    updateOrder = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const order = await this.hubService.updateOrder(id, req.body);
            res.json({ success: true, data: order });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };
}
