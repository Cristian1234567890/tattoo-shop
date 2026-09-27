import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import tattooRoutes from './routes/tattoo.routes';
import subscriptionRoutes from './routes/subscription.routes';
import mailRoutes from './routes/mail.routes';
import { errorHandler } from './middlewares/error.middleware';

export function createApp(): Application {
  const app: Application = express();

  // Cross-Origin Resource Sharing
  app.use(cors());

  // 50MB body limit for base64 image uploads and email attachments
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Healthcheck endpoint
  app.get('/health', (_req: Request, res: Response) => {
    const { supabaseAdmin } = require('./config/supabase');
    const adminKey = (supabaseAdmin as any).supabaseKey || '';
    const adminRef = adminKey.includes('.') ? JSON.parse(Buffer.from(adminKey.split('.')[1], 'base64').toString()).ref : 'none';
    res.status(200).json({ status: 'ok', adminRef, timestamp: new Date().toISOString() });
  });

  // Mount API route groups at root to preserve exact legacy contracts
  app.use(authRoutes);
  app.use(userRoutes);
  app.use(tattooRoutes);
  app.use(subscriptionRoutes);
  app.use(mailRoutes);

  // 404 Handler for unmatched routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: { message: 'Route not found' },
    });
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
