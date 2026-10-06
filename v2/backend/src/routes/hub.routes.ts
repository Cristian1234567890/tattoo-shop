import { Router } from 'express';
import { HubController } from '../controllers/hub.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const hubController = new HubController();

// Schedules
router.get('/artists/:artistId/schedules', hubController.getArtistSchedules);
router.post('/schedules', requireAuth, hubController.createSchedule);
router.put('/schedules/:id', requireAuth, hubController.updateSchedule);
router.delete('/schedules/:id', requireAuth, hubController.deleteSchedule);

// Promotions
router.get('/artists/:artistId/promotions', hubController.getArtistPromotions);
router.post('/promotions', requireAuth, hubController.createPromotion);
router.put('/promotions/:id', requireAuth, hubController.updatePromotion);
router.delete('/promotions/:id', requireAuth, hubController.deletePromotion);

// Products (Tienda Fase 1)
router.get('/products', hubController.getProducts);
router.get('/artists/:artistId/products', hubController.getArtistProducts);
router.post('/products', requireAuth, hubController.createProduct);
router.put('/products/:id', requireAuth, hubController.updateProduct);
router.delete('/products/:id', requireAuth, hubController.deleteProduct);

// Orders
router.get('/orders', requireAuth, hubController.getOrders);
router.post('/orders', requireAuth, hubController.createOrder);
router.put('/orders/:id', requireAuth, hubController.updateOrder);

// Sketches
router.get('/sketches', requireAuth, hubController.getSketches); // For both client and artist
router.post('/sketches', requireAuth, hubController.createSketch);
router.put('/sketches/:id', requireAuth, hubController.updateSketch);

// Payments
router.get('/payments', requireAuth, hubController.getPayments);
router.post('/payments', requireAuth, hubController.createPayment);

// Agenda
router.get('/agenda', requireAuth, hubController.getAgenda);
router.post('/agenda', requireAuth, hubController.createAgenda);
router.put('/agenda/:id', requireAuth, hubController.updateAgenda);

export default router;
