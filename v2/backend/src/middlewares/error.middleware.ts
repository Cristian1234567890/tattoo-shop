import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { reportSentryErrorToDiscord } from '../utils/sentry-notifier.util';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Catch malformed JSON syntax from express.json()
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    res.status(400).json({
      success: false,
      error: { message: 'Malformed JSON syntax in request body' },
    });
    return;
  }

  // Payload too large error (413)
  if (err.type === 'entity.too.large' || err.status === 413) {
    res.status(413).json({
      success: false,
      error: { message: 'Payload too large, exceeds 50MB limit' },
    });
    return;
  }

  const status = typeof err.status === 'number' ? err.status : 500;

  // Report internal errors (500) to Sentry and Discord
  if (status >= 500) {
    Sentry.captureException(err);
    reportSentryErrorToDiscord({
      message: err.message || 'Internal Server Error',
      stack: err.stack,
      path: req.originalUrl || req.url,
      method: req.method,
      source: 'v2/backend'
    }).catch(() => {});
  }

  res.status(status).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
}
