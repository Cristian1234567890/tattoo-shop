import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import tattooRoutes from './routes/tattoo.routes';
import subscriptionRoutes from './routes/subscription.routes';
import mailRoutes from './routes/mail.routes';
import progressRoutes from './routes/progress.routes';
import hubRoutes from './routes/hub.routes';
import studioRoutes from './routes/studio.routes';
import phoneRoutes from './routes/phone.routes';
import { errorHandler } from './middlewares/error.middleware';
import { generalApiLimiter } from './middlewares/rateLimit.middleware';
import { securityHeadersMiddleware } from './middlewares/security.middleware';

export function createApp(): Application {
  const appInstance: Application = express();

  // Trust reverse proxy (Vercel / Cloudflare) for accurate IP-based rate limiting
  appInstance.set('trust proxy', 1);

  // Disable Express fingerprinting header (OWASP Information Disclosure Prevention)
  appInstance.disable('x-powered-by');

  // OWASP 2025 Security Headers Middleware (Helmet-equivalent hardening)
  appInstance.use(securityHeadersMiddleware);

  // Cross-Origin Resource Sharing
  appInstance.use(cors());

  // General API Rate Limiting to prevent scraping and DoS
  appInstance.use(generalApiLimiter);

  // 50MB body limit for base64 image uploads and email attachments
  appInstance.use(express.json({ limit: '50mb' }));
  appInstance.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Healthcheck endpoint
  appInstance.get('/health', (_req: Request, res: Response) => {
    const { supabaseAdmin } = require('./config/supabase');
    const adminKey = (supabaseAdmin as any).supabaseKey || '';
    const adminRef = adminKey.includes('.') ? JSON.parse(Buffer.from(adminKey.split('.')[1], 'base64').toString()).ref : 'none';
    res.status(200).json({ status: 'ok', adminRef, timestamp: new Date().toISOString() });
  });

  // Mount API route groups at root to preserve exact legacy contracts
  appInstance.use(authRoutes);
  appInstance.use(userRoutes);
  appInstance.use(tattooRoutes);
  appInstance.use(subscriptionRoutes);
  appInstance.use(mailRoutes);
  appInstance.use(progressRoutes);
  appInstance.use(hubRoutes);
  appInstance.use(studioRoutes);
  // Phone verification routes (Vonage SMS)
  appInstance.use('/api/phone', phoneRoutes);
  appInstance.use('/phone', phoneRoutes);

  // 404 Handler for unmatched routes
  appInstance.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: { message: 'Route not found' },
    });
  });

  // Global Error Handler
  appInstance.use(errorHandler);

  return appInstance;
}

export const app: Application = createApp();
export default app;
