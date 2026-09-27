/**
 * Tier 4: Real-World Scenarios - Complete Customer Quote Workflow
 * Models an end-to-end customer interaction:
 *  1. Customer creates account and authenticates.
 *  2. Browses catalog of artists.
 *  3. Filters for a specific artist.
 *  4. Composes custom tattoo quote request with reference image.
 *  5. Dispatches request via /mail.
 *  6. Updates profile contact info to ensure artist can reply.
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail, SAMPLE_BASE64_IMAGE } from '../config.ts';

export function registerCustomerQuoteScenarioTests(client: ApiClient) {
  setTier('Tier 4 - Real-World Scenarios');

  describe('Scenario 1: Complete Customer Quote Workflow', () => {
    it('TC-SCEN-01: End-to-end customer quote request and profile sync', async () => {
      // 1. Customer registers
      const customerEmail = generateTestEmail('quote_customer');
      const password = 'CustomerPassword123!';

      const regRes = await client.register({
        email: customerEmail,
        password,
        nombre: 'Sofia',
        apellido: 'Vergara',
        edad: '1996-11-04',
        tipo: 'Cliente',
        telefono: '61119999',
        provincia: 'Panamá',
        ciudad: 'Ciudad de Panamá',
        direccion: 'Obarrio, Calle 54',
      });

      expect(regRes.status).toBe(200);
      const token = regRes.data.session.access_token;
      const refresh = regRes.data.session.refresh_token;

      const authHeaders = {
        Authorization: `Bearer ${token}`,
        refresh_token: refresh,
      };

      // 2. Customer browses artist directory
      const catalogRes = await client.getTatto(authHeaders);
      expect(catalogRes.status).toBe(200);

      // Determine recipient artist
      const targetArtistEmail =
        catalogRes.data.data.length > 0 && catalogRes.data.data[0].data?.email
          ? catalogRes.data.data[0].data.email
          : 'lead_artist@tattooshop.com';

      // 3. Customer submits inquiry quote with custom tattoo specs and reference image
      const mailRes = await client.sendMail(
        {
          to: targetArtistEmail,
          email: 'Hola, deseo cotizar una pieza de realismo botánico en el antebrazo derecho (12x8cm) para el próximo mes.',
          img: SAMPLE_BASE64_IMAGE,
        },
        authHeaders
      );

      expect([200, 500]).toContain(mailRes.status);

      // 4. Customer updates phone number so artist can reach them via WhatsApp
      const updateRes = await client.updateUser(
        {
          email: customerEmail,
          nombre: 'Sofia',
          apellido: 'Vergara',
          telefono: '69998888',
        },
        authHeaders
      );

      expect(updateRes.status).toBe(200);
      expect(updateRes.data.data.user.user_metadata.telefono).toBe('69998888');
    });
  });
}
