import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

const isTestMode = (req: Request): boolean => {
  if (req.headers['x-test-rate-limit'] === 'true') {
    return false; // Do not skip when explicitly testing rate limit
  }
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_TEST_CONTEXT !== undefined ||
    process.argv.some((arg) => arg.includes('test'))
  );
};

/**
 * Rate Limiter for Authentication and Security Endpoints
 * Mitigates brute-force attacks on /login, /register, /verify2fa, etc.
 * 20 requests per 15 minutes window per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => isTestMode(req),
  message: {
    success: false,
    error: {
      message: 'Demasiados intentos de autenticación desde esta IP. Por seguridad, por favor intenta nuevamente en 15 minutos.',
      status: 429,
    },
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiados intentos de autenticación desde esta IP. Por seguridad, por favor intenta nuevamente en 15 minutos.',
        status: 429,
      },
    });
  },
});

/**
 * Rate Limiter for Inquiries & Email Dispatch (/mail)
 * Prevents spam bots from flooding artist inboxes.
 * 10 emails per hour per IP.
 */
export const mailRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 emails per hour
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => isTestMode(req),
  message: {
    success: false,
    error: {
      message: 'Has alcanzado el límite de consultas permitidas por hora. Por favor intenta más tarde.',
      status: 429,
    },
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Has alcanzado el límite de consultas permitidas por hora. Por favor intenta más tarde.',
        status: 429,
      },
    });
  },
});

/**
 * General API Rate Limiter
 * Guards public endpoints against runaway scraper loops and DoS.
 * 120 requests per 1 minute window per IP.
 */
export const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    if (isTestMode(req)) return true;
    return req.method === 'OPTIONS' || req.path === '/health';
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Límite de solicitudes por minuto excedido. Por favor intenta en unos momentos.',
        status: 429,
      },
    });
  },
});
