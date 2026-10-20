import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import tattooRoutes from './routes/tattoo.routes';
import subscriptionRoutes from './routes/subscription.routes';
import mailRoutes from './routes/mail.routes';
import progressRoutes from './routes/progress.routes';
import hubRoutes from './routes/hub.routes';
import { errorHandler } from './middlewares/error.middleware';
import { generalApiLimiter } from './middlewares/rateLimit.middleware';
import { securityHeadersMiddleware } from './middlewares/security.middleware';

export function createApp(): Application {
  const app: Application = express();

  // Trust reverse proxy (Vercel / Cloudflare) for accurate IP-based rate limiting
  app.set('trust proxy', 1);

  // Disable Express fingerprinting header (OWASP Information Disclosure Prevention)
  app.disable('x-powered-by');

  // OWASP 2025 Security Headers Middleware (Helmet-equivalent hardening)
  app.use(securityHeadersMiddleware);

  // Cross-Origin Resource Sharing
  app.use(cors());

  // General API Rate Limiting to prevent scraping and DoS
  app.use(generalApiLimiter);

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
  app.use(progressRoutes);
  app.use(hubRoutes);

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
