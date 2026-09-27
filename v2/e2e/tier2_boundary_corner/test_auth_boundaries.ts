/**
 * Tier 2: Boundary & Corner Cases - Authentication Boundaries
 * Tests duplicate registrations, invalid credentials, token tampering, and security edges.
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail } from '../config.ts';

export function registerAuthBoundariesTests(client: ApiClient) {
  setTier('Tier 2 - Boundary & Corner Cases');

  describe('Boundary: Authentication & Token Security Limits', () => {
    it('TC-BND-AUTH-01: Duplicate user registration returns explicit failure with "User already registered"', async () => {
      const email = generateTestEmail('dup_boundary');
      const payload = {
        email,
        password: 'Password123!',
        nombre: 'DupTest',
        apellido: 'Boundary',
        tipo: 'Cliente',
      };

      const res1 = await client.register(payload);
      expect(res1.status).toBe(200);
      expect(res1.data.success).toBe(true);

      const res2 = await client.register(payload);
      expect(res2.status).toBe(200);
      expect(res2.data.success).toBe(false);
      expect(JSON.stringify(res2.data.error).toLowerCase()).toContain('already registered');
    });

    it('TC-BND-AUTH-02: Tampered JWT token signature returns 401 Unauthorized or failure', async () => {
      const email = generateTestEmail('tamper_jwt');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'Tamper',
        apellido: 'Test',
        tipo: 'Cliente',
      });

      const token = reg.data.session.access_token;
      // Tamper with the signature portion of the JWT (change last 5 characters)
      const tamperedToken = token.slice(0, -5) + 'XXXXX';

      const updateRes = await client.updateUser(
        { nombre: 'TamperedUpdate' },
        {
          Authorization: `Bearer ${tamperedToken}`,
          refresh_token: reg.data.session.refresh_token,
        }
      );

      expect(updateRes.status >= 400 || (updateRes.data && updateRes.data.success === false)).toBe(true);
    });

    it('TC-BND-AUTH-03: Login with uppercase/lowercase variation in email is handled consistently', async () => {
      const email = generateTestEmail('case_test').toLowerCase();
      await client.register({
        email,
        password: 'Password123!',
        nombre: 'CaseTest',
        tipo: 'Cliente',
      });

      // Attempt login with uppercase variant
      const upperEmail = email.toUpperCase();
      const loginRes = await client.login({
        email: upperEmail,
        password: 'Password123!',
      });

      expect(loginRes.status).toBe(200);
      // Supabase treats emails case-insensitively
      expect(loginRes.data.success).toBe(true);
    });

    it('TC-BND-AUTH-04: Non-existent user login returns error with success: false', async () => {
      const loginRes = await client.login({
        email: 'ghost_user_does_not_exist_ever@tattoo.org',
        password: 'GhostPassword123!',
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.data.success).toBe(false);
    });

    it('TC-BND-AUTH-05: Rapid sequential logins for the same account do not lock up', async () => {
      const email = generateTestEmail('rapid_auth');
      await client.register({
        email,
        password: 'Password123!',
        nombre: 'RapidAuth',
        tipo: 'Cliente',
      });

      const req1 = client.login({ email, password: 'Password123!' });
      const req2 = client.login({ email, password: 'Password123!' });
      const req3 = client.login({ email, password: 'Password123!' });

      const [res1, res2, res3] = await Promise.all([req1, req2, req3]);
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res3.status).toBe(200);
      expect(res1.data.success).toBe(true);
      expect(res2.data.success).toBe(true);
      expect(res3.data.success).toBe(true);
    });
  });
}
