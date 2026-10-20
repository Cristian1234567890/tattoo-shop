import { Request, Response, NextFunction } from 'express';

/**
 * Security Headers Middleware (OWASP 2025 & Defense-in-Depth Hardening)
 * Equivalent to helmet baseline protection without unnecessary external dependency overhead.
 */
export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent Clickjacking attacks
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Legacy browser cross-site scripting filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Enforce HTTPS connection (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Referrer-Policy defense
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict sensitive browser permissions
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  // Remove Express fingerprinting header if present
  res.removeHeader('X-Powered-By');

  next();
}
