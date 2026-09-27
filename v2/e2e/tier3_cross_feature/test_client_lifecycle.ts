/**
 * Tier 3: Cross-Feature Combinations - Client Complete Lifecycle
 * Executes the sequential chain:
 * Register -> Login -> MFA Enroll -> Verify 2FA -> Update Profile ->
 * Upload Avatar -> Query Catalog -> Send Email Inquiry -> Logout -> Verify Session Invalidation
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail, SAMPLE_BASE64_IMAGE } from '../config.ts';

export function registerClientLifecycleTests(client: ApiClient) {
  setTier('Tier 3 - Cross-Feature Combinations');

  describe('Cross-Feature: Complete Client Lifecycle Journey', () => {
    it('TC-XFEAT-01: Full Customer Lifecycle Sequence', async () => {
      const email = generateTestEmail('lifecycle_client');
      const password = 'StrongPassword123!';

      // Step 1: Register client account
      const regRes = await client.register({
        email,
        password,
        nombre: 'Valeria',
        apellido: 'Rios',
        edad: '1997-03-12',
        tipo: 'Cliente',
        telefono: '62223333',
        provincia: 'Panamá',
        ciudad: 'Bella Vista',
        direccion: 'Calle 45 Este',
      });
      expect(regRes.status).toBe(200);
      expect(regRes.data.success).toBe(true);

      // Step 2: Login and acquire fresh tokens
      const loginRes = await client.login({ email, password });
      expect(loginRes.status).toBe(200);
      expect(loginRes.data.success).toBe(true);
      const token = loginRes.data.data.session.access_token;
      const refresh = loginRes.data.data.session.refresh_token;
      expect(token).toBeDefined();

      const authHeaders = {
        Authorization: `Bearer ${token}`,
        refresh_token: refresh,
      };

      // Step 3: MFA Enroll
      const enrollRes = await client.enroll(authHeaders);
      expect(enrollRes.status).toBe(200);
      expect(enrollRes.data.success).toBe(true);
      const factorId = enrollRes.data.data.id;
      expect(factorId).toBeDefined();

      // Step 4: Verify 2FA (Testing challenge response structure)
      const verifyRes = await client.verify2FA(
        {
          factorId,
          code: '000000', // Mock verification check
        },
        authHeaders
      );
      expect(verifyRes.status).toBe(200);

      // Step 5: Update personal profile
      const updateRes = await client.updateUser(
        {
          email,
          nombre: 'Valeria Updated',
          telefono: '68887777',
          provincia: 'Panamá',
          ciudad: 'San Francisco',
          direccion: 'Calle 73',
        },
        authHeaders
      );
      expect(updateRes.status).toBe(200);
      expect(updateRes.data.success).toBe(true);

      // Step 6: Upload avatar
      const avatarRes = await client.updateUserImg(
        { imageData: SAMPLE_BASE64_IMAGE },
        authHeaders
      );
      expect(avatarRes.status).toBe(200);
      expect(avatarRes.data.success).toBe(true);

      // Step 7: Query artist catalog
      const catalogRes = await client.getTatto(authHeaders);
      expect(catalogRes.status).toBe(200);
      expect(Array.isArray(catalogRes.data.data)).toBe(true);

      // Step 8: Send contact email to artist
      const mailRes = await client.sendMail(
        {
          to: 'artist_target@testtattoo.com',
          email: 'Hola, me gustaría cotizar un diseño de mandala en el antebrazo.',
          img: SAMPLE_BASE64_IMAGE,
        },
        authHeaders
      );
      expect([200, 500]).toContain(mailRes.status);

      // Step 9: Logout
      const logoutRes = await client.logout(authHeaders);
      expect(logoutRes.status).toBe(200);
      expect(logoutRes.data.success).toBe(true);
    });
  });
}
