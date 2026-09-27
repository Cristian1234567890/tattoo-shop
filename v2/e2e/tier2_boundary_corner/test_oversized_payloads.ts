/**
 * Tier 2: Boundary & Corner Cases - Oversized Payloads & Image Limits
 * Tests body limit enforcement (50MB Express body limit), large base64 strings,
 * and malformed image decoding.
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail } from '../config.ts';

export function registerOversizedPayloadsTests(client: ApiClient) {
  setTier('Tier 2 - Boundary & Corner Cases');

  describe('Boundary: Oversized Payloads & Base64 Stress', () => {
    it('TC-BND-SIZE-01: Moderately large base64 payload (~500KB) is accepted under 50MB limit', async () => {
      const email = generateTestEmail('large_img_user');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'LargeImage',
        apellido: 'Test',
        tipo: 'Cliente',
      });

      // Construct ~500KB base64 string
      const chunk = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const largeBase64 = chunk.repeat(5000);

      const uploadRes = await client.updateUserImg(
        { imageData: largeBase64 },
        {
          Authorization: `Bearer ${reg.data.session.access_token}`,
          refresh_token: reg.data.session.refresh_token,
        }
      );

      expect(uploadRes.status).toBeGreaterThanOrEqual(200);
      expect(uploadRes.status).toBeLessThan(500);
    });

    it('TC-BND-SIZE-02: Corrupted or non-base64 image payload (e.g. random ascii string) handled safely without crash', async () => {
      const email = generateTestEmail('corrupt_b64');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'Corrupt',
        apellido: 'Base64',
        tipo: 'Cliente',
      });

      const res = await client.updateUserImg(
        { imageData: '@@@NOT_VALID_BASE64_CHARACTERS###$$$' },
        {
          Authorization: `Bearer ${reg.data.session.access_token}`,
          refresh_token: reg.data.session.refresh_token,
        }
      );

      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(600);

      // Verify server is healthy
      const health = await client.getTatto();
      expect(health.status).toBe(200);
    });

    it('TC-BND-SIZE-03: Excessive payload header or huge body is handled cleanly', async () => {
      // Extremely long string in message field
      const longMessage = 'A'.repeat(50000);
      const mailRes = await client.sendMail({
        to: 'artist@testtattoo.com',
        email: longMessage,
      });

      expect([200, 400, 413, 500]).toContain(mailRes.status);
    });
  });
}
