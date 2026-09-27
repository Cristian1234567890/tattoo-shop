/**
 * Tier 1: Feature Coverage - Auth Endpoints
 * Tests:
 *  - Endpoint 1: POST /login (6 test cases)
 *  - Endpoint 2: POST /register (6 test cases)
 *  - Endpoint 13: POST /logout (5 test cases)
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail } from '../config.ts';

export function registerAuthEndpointsTests(client: ApiClient) {
  setTier('Tier 1 - Feature Coverage');

  describe('Feature 1: POST /login (Authentication)', () => {
    it('TC-LOGIN-01: Valid client credentials return HTTP 200 with success: true and session tokens', async () => {
      const email = generateTestEmail('login_client');
      const password = 'Password123!';

      // Setup user first
      const regRes = await client.register({
        email,
        password,
        nombre: 'Carlos',
        apellido: 'Santana',
        edad: '1990-01-01',
        tipo: 'Cliente',
        telefono: '61112222',
        provincia: 'Panamá',
        ciudad: 'Ciudad de Panamá',
        direccion: 'Vía Argentina',
      });

      // Login
      const loginRes = await client.login({ email, password });
      expect(loginRes.status).toBe(200);
      expect(loginRes.data.success).toBe(true);
      expect(loginRes.data.data).toBeDefined();
      expect(loginRes.data.data.user).toBeDefined();
      expect(loginRes.data.data.user.email).toBe(email);
      expect(loginRes.data.data.session).toBeDefined();
      expect(loginRes.data.data.session.access_token).toBeDefined();
    });

    it('TC-LOGIN-02: Valid artist credentials return HTTP 200 with artist metadata (tipo: Tatuador)', async () => {
      const email = generateTestEmail('login_artist');
      const password = 'Password123!';

      await client.register({
        email,
        password,
        nombre: 'Mario',
        apellido: 'Inker',
        edad: '1992-05-10',
        tipo: 'Tatuador',
        telefono: '63334444',
        provincia: 'Panamá',
        ciudad: 'Ciudad de Panamá',
        direccion: 'Calle 50',
      });

      const loginRes = await client.login({ email, password });
      expect(loginRes.status).toBe(200);
      expect(loginRes.data.success).toBe(true);
      expect(loginRes.data.data.user.user_metadata.tipo).toBe('Tatuador');
    });

    it('TC-LOGIN-03: Invalid password returns HTTP 200 with success: false and error message', async () => {
      const email = generateTestEmail('wrong_pwd');
      await client.register({
        email,
        password: 'CorrectPassword123!',
        nombre: 'User',
        apellido: 'Test',
        tipo: 'Cliente',
      });

      const loginRes = await client.login({ email, password: 'WrongPassword999!' });
      expect(loginRes.status).toBe(200);
      expect(loginRes.data.success).toBe(false);
      expect(loginRes.data.error).toBeDefined();
    });

    it('TC-LOGIN-04: Non-existent email returns HTTP 200 with success: false', async () => {
      const loginRes = await client.login({
        email: 'unregistered_ghost_user_99999@tattoo-v2-nonexistent.org',
        password: 'AnyPassword123!',
      });
      expect(loginRes.status).toBe(200);
      expect(loginRes.data.success).toBe(false);
      expect(loginRes.data.error).toBeDefined();
    });

    it('TC-LOGIN-05: Missing password in login payload returns failure error', async () => {
      const loginRes = await client.login({
        email: 'user_missing_password@example.com',
      });
      expect(loginRes.status).toBe(200);
      expect(loginRes.data.success).toBe(false);
    });

    it('TC-LOGIN-06: Empty login payload {} returns failure error without crashing', async () => {
      const loginRes = await client.login({});
      expect(loginRes.status).toBe(200);
      expect(loginRes.data.success).toBe(false);
    });
  });

  describe('Feature 2: POST /register (User Registration)', () => {
    it('TC-REG-01: Standard client registration succeeds, returning user object with role Cliente and session', async () => {
      const email = generateTestEmail('reg_client');
      const res = await client.register({
        email,
        password: 'ValidPassword123!',
        nombre: 'Elena',
        apellido: 'Perez',
        edad: '1998-04-20',
        tipo: 'Cliente',
        telefono: '65556666',
        provincia: 'Panamá Oeste',
        ciudad: 'La Chorrera',
        direccion: 'Barrio Colón',
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.user.email).toBe(email);
      expect(res.data.data.user.user_metadata.tipo).toBe('Cliente');
      expect(res.data.data.session).toBeDefined();
      expect(res.data.data.session.access_token).toBeDefined();
    });

    it('TC-REG-02: Artist registration succeeds and assigns role Tatuador', async () => {
      const email = generateTestEmail('reg_artist');
      const res = await client.register({
        email,
        password: 'ValidPassword123!',
        nombre: 'Diego',
        apellido: 'Tattoo',
        edad: '1991-08-15',
        tipo: 'Tatuador',
        telefono: '67778888',
        provincia: 'Panamá',
        ciudad: 'San Francisco',
        direccion: 'Calle 74',
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.user.user_metadata.tipo).toBe('Tatuador');
    });

    it('TC-REG-03: Duplicate email registration fails gracefully with descriptive error', async () => {
      const email = generateTestEmail('duplicate_reg');
      const payload = {
        email,
        password: 'Password123!',
        nombre: 'First',
        apellido: 'Attempt',
        tipo: 'Cliente',
      };

      const firstRes = await client.register(payload);
      expect(firstRes.status).toBe(200);
      expect(firstRes.data.success).toBe(true);

      const secondRes = await client.register(payload);
      expect(secondRes.status).toBe(200);
      expect(secondRes.data.success).toBe(false);
      expect(secondRes.data.error).toBeDefined();
    });

    it('TC-REG-04: Registration with missing mandatory email returns failure error', async () => {
      const res = await client.register({
        password: 'Password123!',
        nombre: 'NoEmail',
        apellido: 'User',
        tipo: 'Cliente',
      });
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(false);
    });

    it('TC-REG-05: Registration with short/weak password (< 6 chars) returns error', async () => {
      const email = generateTestEmail('weak_pwd');
      const res = await client.register({
        email,
        password: '123',
        nombre: 'Weak',
        apellido: 'Pass',
        tipo: 'Cliente',
      });
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(false);
    });

    it('TC-REG-06: Registration preserves unicode special characters in name and location', async () => {
      const email = generateTestEmail('unicode_user');
      const res = await client.register({
        email,
        password: 'Password123!',
        nombre: 'José María ñandú',
        apellido: 'González López',
        edad: '1995-12-25',
        tipo: 'Cliente',
        telefono: '68889999',
        provincia: 'Panamá',
        ciudad: 'Ciudad de Panamá',
        direccion: 'Calle 50 #12-34 áéíóú',
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.user.user_metadata.nombre).toBe('José María ñandú');
      expect(res.data.data.user.user_metadata.direccion).toContain('áéíóú');
    });
  });

  describe('Feature 13: POST /logout (Sign Out)', () => {
    it('TC-LOGOUT-01: Authenticated user signs out and receives success: true', async () => {
      const email = generateTestEmail('logout_user');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'Logout',
        apellido: 'Test',
        tipo: 'Cliente',
      });

      const token = reg.data.session.access_token;
      const refresh = reg.data.session.refresh_token;

      const logoutRes = await client.logout({
        Authorization: `Bearer ${token}`,
        refresh_token: refresh,
      });

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.data.success).toBe(true);
    });

    it('TC-LOGOUT-02: Logout accepts header key "refresh" as alternative to "refresh_token"', async () => {
      const email = generateTestEmail('logout_alt_header');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'LogoutAlt',
        apellido: 'Header',
        tipo: 'Cliente',
      });

      const token = reg.data.session.access_token;
      const refresh = reg.data.session.refresh_token;

      const logoutRes = await client.logout({
        Authorization: `Bearer ${token}`,
        refresh: refresh,
      });

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.data.success).toBe(true);
    });

    it('TC-LOGOUT-03: Logout without Authorization header is handled gracefully without crashing', async () => {
      const logoutRes = await client.logout({});
      expect(logoutRes.status).toBeGreaterThanOrEqual(200);
      expect(logoutRes.status).toBeLessThan(500);
    });

    it('TC-LOGOUT-04: Logout with malformed token does not crash server', async () => {
      const logoutRes = await client.logout({
        Authorization: 'Bearer invalid.bogus.jwt.token',
        refresh_token: 'bogus_refresh',
      });
      expect(logoutRes.status).toBeGreaterThanOrEqual(200);
      expect(logoutRes.status).toBeLessThan(500);
    });

    it('TC-LOGOUT-05: Double logout with same token returns valid response', async () => {
      const email = generateTestEmail('double_logout');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'Double',
        apellido: 'Logout',
        tipo: 'Cliente',
      });

      const headers = {
        Authorization: `Bearer ${reg.data.session.access_token}`,
        refresh_token: reg.data.session.refresh_token,
      };

      await client.logout(headers);
      const secondLogout = await client.logout(headers);
      expect(secondLogout.status).toBeGreaterThanOrEqual(200);
      expect(secondLogout.status).toBeLessThan(500);
    });
  });
}
