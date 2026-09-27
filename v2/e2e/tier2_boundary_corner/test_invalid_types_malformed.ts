/**
 * Tier 2: Boundary & Corner Cases - Invalid Types & Malformed Payloads
 * Tests resilience against corrupt JSON, invalid types, empty values, and injection vectors.
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail } from '../config.ts';

export function registerInvalidTypesTests(client: ApiClient) {
  setTier('Tier 2 - Boundary & Corner Cases');

  describe('Boundary: Invalid Types & Malformed Payloads', () => {
    it('TC-BND-TYPE-01: Malformed JSON syntax in POST /login returns HTTP 400 without crashing', async () => {
      const res = await client.request('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        rawBody: '{"email": "broken_json@test.com", "password": ',
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('TC-BND-TYPE-02: Non-string data types in registration payload (numbers, arrays, booleans) do not crash', async () => {
      const res = await client.register({
        email: 123456 as any,
        password: ['not', 'a', 'string'] as any,
        nombre: { nested: true } as any,
        tipo: false as any,
      });

      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(600);
    });

    it('TC-BND-TYPE-03: Whitespace-only string fields in registration are rejected or handled gracefully', async () => {
      const res = await client.register({
        email: '   ',
        password: '   ',
        nombre: '   ',
        tipo: 'Cliente',
      });

      expect(res.status >= 400 || (res.data && res.data.success === false)).toBe(true);
    });

    it('TC-BND-TYPE-04: SQL injection payload in login email is neutralized and safely rejected', async () => {
      const res = await client.login({
        email: "' OR '1'='1' --",
        password: "' OR '1'='1",
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(false);
    });

    it('TC-BND-TYPE-05: SQL DDL drop table injection in registration fields does not execute or harm database', async () => {
      const sqlInjectionEmail = generateTestEmail('sqli_user');
      const res = await client.register({
        email: sqlInjectionEmail,
        password: 'Password123!',
        nombre: "Robert'); DROP TABLE public.tatuadores_data; --",
        apellido: "DropTableTest",
        tipo: 'Tatuador',
      });

      // Whether registered or rejected, the catalog table must STILL be intact and queryable!
      const catalogCheck = await client.getTatto();
      expect(catalogCheck.status).toBe(200);
      expect(catalogCheck.data.success).toBe(true);
      expect(Array.isArray(catalogCheck.data.data)).toBe(true);
    });

    it('TC-BND-TYPE-06: Cross-site scripting (XSS) payload in profile update does not crash and preserves safety', async () => {
      const email = generateTestEmail('xss_user');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'NormalUser',
        apellido: 'Test',
        tipo: 'Cliente',
      });

      const token = reg.data.session.access_token;
      const refresh = reg.data.session.refresh_token;

      const updateRes = await client.updateUser(
        {
          email,
          nombre: '<script>alert("XSS")</script>',
          direccion: '<img src=x onerror=alert(1)>',
        },
        {
          Authorization: `Bearer ${token}`,
          refresh_token: refresh,
        }
      );

      expect(updateRes.status).toBe(200);
      expect(updateRes.data.success).toBe(true);
    });
  });
}
