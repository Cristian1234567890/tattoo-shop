/**
 * Tier 2: Boundary & Corner Cases - Missing Headers
 * Tests that missing Authorization, refresh_token, or Content-Type headers
 * do not cause unhandled crashes (e.g., TypeError: Cannot read properties of undefined (reading 'split')).
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { SAMPLE_BASE64_IMAGE } from '../config.ts';

export function registerMissingHeadersTests(client: ApiClient) {
  setTier('Tier 2 - Boundary & Corner Cases');

  describe('Boundary: Missing Headers Resilience', () => {
    it('TC-BND-HDR-01: POST /updateuser with completely omitted headers does not crash server process', async () => {
      const res = await client.request('/updateuser', {
        method: 'POST',
        headers: {},
        body: { nombre: 'CrashTest' },
      });

      // Must return an HTTP response (400, 401, etc.) without dying
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(600);

      // Verify server is alive
      const alive = await client.getTatto();
      expect(alive.status).toBe(200);
    });

    it('TC-BND-HDR-02: POST /updateuserimg without Authorization header returns error safely', async () => {
      const res = await client.request('/updateuserimg', {
        method: 'POST',
        headers: {},
        body: { imageData: SAMPLE_BASE64_IMAGE },
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(600);
    });

    it('TC-BND-HDR-03: POST /enroll without Authorization header returns unauthorized error', async () => {
      const res = await client.request('/enroll', {
        method: 'POST',
        headers: {},
        body: {},
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(600);
    });

    it('TC-BND-HDR-04: POST /verify2fa without Authorization header returns unauthorized error', async () => {
      const res = await client.request('/verify2fa', {
        method: 'POST',
        headers: {},
        body: { factorId: 'fac-123', code: '123456' },
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(600);
    });

    it('TC-BND-HDR-05: POST /usersubscription without Authorization header returns error', async () => {
      const res = await client.request('/usersubscription', {
        method: 'POST',
        headers: {},
        body: { id: '00000000-0000-0000-0000-000000000000', product_id: 'P', subscription_id: 'S' },
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(600);
    });

    it('TC-BND-HDR-06: Authorization header with "Bearer" but empty token ("Bearer ") is rejected safely', async () => {
      const res = await client.request('/updateuser', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ',
          refresh_token: 'refresh_only',
        },
        body: { nombre: 'Test' },
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(600);
    });

    it('TC-BND-HDR-07: Authorization header without "Bearer " prefix (raw token) handles gracefully', async () => {
      const res = await client.request('/updateuser', {
        method: 'POST',
        headers: {
          Authorization: 'raw_token_without_bearer_prefix',
        },
        body: { nombre: 'Test' },
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(600);
    });
  });
}
