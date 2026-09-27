import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/api.types';
import { supabaseAdmin } from '../config/supabase';
import { isTokenRevoked } from '../services/auth.service';

/**
 * Safely extracts bearer token from Authorization header.
 * Supports "Bearer <token>" as well as raw "<token>".
 */
export function extractToken(authHeader?: string): string | undefined {
  if (!authHeader || typeof authHeader !== 'string') {
    return undefined;
  }
  const trimmed = authHeader.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.toLowerCase().startsWith('bearer ')) {
    const token = trimmed.substring(7).trim();
    return token.length > 0 ? token : undefined;
  }

  // Raw token provided without Bearer prefix
  return trimmed;
}

/**
 * Extracts refresh token from either "refresh_token" or "refresh" header.
 */
export function extractRefreshToken(headers: Record<string, any>): string | undefined {
  const refresh = headers['refresh_token'] || headers['refresh'];
  if (typeof refresh === 'string' && refresh.trim().length > 0) {
    return refresh.trim();
  }
  return undefined;
}

/**
 * Middleware: Requires valid authentication.
 * Returns HTTP 401 on missing, revoked, or invalid tokens without throwing.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);
    const refreshToken = extractRefreshToken(req.headers);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or invalid Authorization token',
      });
      return;
    }

    if (isTokenRevoked(token)) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Session revoked',
      });
      return;
    }

    // Verify token with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({
        success: false,
        error: error?.message || 'Unauthorized: Invalid authentication session',
      });
      return;
    }

    req.user = data.user;
    req.token = token;
    req.refreshToken = refreshToken;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: err?.message || 'Unauthorized',
    });
  }
}

/**
 * Middleware: Optional authentication.
 * If token is provided, always attaches token/refreshToken, and verifies user if active.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);
    const refreshToken = extractRefreshToken(req.headers);

    req.token = token;
    req.refreshToken = refreshToken;

    if (token && !isTokenRevoked(token)) {
      const { data } = await supabaseAdmin.auth.getUser(token);
      if (data?.user) {
        req.user = data.user;
      }
    }
  } catch {
    // Graceful fallback for optional auth
  }
  next();
}
