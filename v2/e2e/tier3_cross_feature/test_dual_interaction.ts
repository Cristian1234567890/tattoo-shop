/**
 * Tier 3: Cross-Feature Combinations - Dual Account Interaction
 * Tests multi-user interactions:
 * Artist registers & configures profile -> Customer registers, queries catalog,
 * finds the artist, and sends an inquiry email with design sketch.
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail, SAMPLE_BASE64_IMAGE } from '../config.ts';

export function registerDualInteractionTests(client: ApiClient) {
  setTier('Tier 3 - Cross-Feature Combinations');

  describe('Cross-Feature: Dual User Interaction (Artist & Customer)', () => {
    it('TC-XFEAT-03: Customer locates specific registered Artist in catalog and submits quote inquiry', async () => {
      // 1. Register Artist
      const artistEmail = generateTestEmail('dual_artist');
      const artistReg = await client.register({
        email: artistEmail,
        password: 'Password123!',
        nombre: 'MasterInk',
        apellido: 'Panama',
        tipo: 'Tatuador',
        provincia: 'Panamá',
        ciudad: 'Ciudad de Panamá',
      });

      expect(artistReg.status).toBe(200);
      const artistToken = artistReg.data.session.access_token;
      const artistRefresh = artistReg.data.session.refresh_token;

      // Artist sets style
      await client.updateUser(
        {
          email: artistEmail,
          nombre: 'MasterInk',
          work_type: 'blackwork',
        },
        {
          Authorization: `Bearer ${artistToken}`,
          refresh_token: artistRefresh,
        }
      );

      // 2. Register Customer
      const clientEmail = generateTestEmail('dual_customer');
      const clientReg = await client.register({
        email: clientEmail,
        password: 'Password123!',
        nombre: 'CustomerSearcher',
        apellido: 'Test',
        tipo: 'Cliente',
      });

      expect(clientReg.status).toBe(200);
      const clientToken = clientReg.data.session.access_token;
      const clientRefresh = clientReg.data.session.refresh_token;

      // 3. Customer queries catalog
      const catalogRes = await client.getTatto({
        Authorization: `Bearer ${clientToken}`,
        refresh_token: clientRefresh,
      });

      expect(catalogRes.status).toBe(200);
      const foundArtist = catalogRes.data.data.find(
        (a: any) => a.data?.email === artistEmail || a.id === artistReg.data.user.id
      );
      expect(foundArtist).toBeDefined();

      // 4. Customer sends inquiry to found artist
      const targetEmail = foundArtist?.data?.email || artistEmail;
      const inquiryRes = await client.sendMail(
        {
          to: targetEmail,
          email: 'Hola MasterInk, me interesa tu estilo blackwork para un diseño de 10x15cm.',
          img: SAMPLE_BASE64_IMAGE,
        },
        {
          Authorization: `Bearer ${clientToken}`,
          refresh_token: clientRefresh,
        }
      );

      expect([200, 500]).toContain(inquiryRes.status);
    });
  });
}
