import { CookieOptions } from 'express';

/**
 * Standard security options for session and authentication cookies
 * adhering strictly to OWASP 2025 and cookie-debugging security standards.
 */
export function getSecureCookieOptions(overrides: Partial<CookieOptions> = {}): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true, // Prevents client-side script access via document.cookie (mitigates XSS token theft)
    secure: isProduction, // Requires HTTPS in production environments (mitigates MITM interception)
    sameSite: 'lax', // Mitigates Cross-Site Request Forgery (CSRF) while allowing normal top-level navigations
    path: '/',
    ...overrides,
  };
}

/**
 * Validates whether a Set-Cookie header string conforms to security guidelines.
 */
export function validateCookieSecurityString(cookieStr: string): {
  valid: boolean;
  missingAttributes: string[];
} {
  const missing: string[] = [];
  const lower = cookieStr.toLowerCase();

  if (!lower.includes('httponly')) {
    missing.push('HttpOnly');
  }

  if (process.env.NODE_ENV === 'production' && !lower.includes('secure')) {
    missing.push('Secure');
  }

  if (!lower.includes('samesite=lax') && !lower.includes('samesite=strict')) {
    missing.push('SameSite=Lax|Strict');
  }

  return {
    valid: missing.length === 0,
    missingAttributes: missing,
  };
}
