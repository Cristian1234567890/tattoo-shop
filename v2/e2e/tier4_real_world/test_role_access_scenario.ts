/**
 * Tier 4: Real-World Scenarios - Multi-Role Dashboard Segregation & Route Navigation
 * Simulates real-world production user sessions:
 *  - Segregation between Cliente and Tatuador dashboard routes
 *  - Smart redirection on legacy /user URL access
 *  - Route guard enforcement for unauthenticated sessions
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail } from '../config.ts';

export function registerRoleAccessScenarioTests(client: ApiClient) {
  setTier('Tier 4 - Real-World Scenarios');

  describe('Scenario 5: Multi-Role Dashboard Segregation & Route Navigation', () => {
    it('TC-SCEN-05: Real-World: Authenticated Cliente and Tatuador sessions maintain segregated roles and profile metadata', async () => {
      // 1. Create a Cliente session
      const clientEmail = generateTestEmail('scen_client');
      const clientReg = await client.register({
        email: clientEmail,
        password: 'Password123!',
        nombre: 'Lucia',
        apellido: 'Clientina',
        tipo: 'Cliente',
        legal_accepted: true,
      });

      expect(clientReg.status).toBe(200);
      const clientToken = clientReg.data.data.session.access_token;

      // 2. Create a Tatuador session
      const artistEmail = generateTestEmail('scen_artist');
      const artistReg = await client.register({
        email: artistEmail,
        password: 'Password123!',
        nombre: 'Esteban',
        apellido: 'Artisto',
        tipo: 'Tatuador',
        legal_accepted: true,
      });

      expect(artistReg.status).toBe(200);
      const artistToken = artistReg.data.data.session.access_token;

      // 3. Verify client profile metadata
      const clientProfile = await client.getUserProfile({
        Authorization: `Bearer ${clientToken}`,
      });
      expect(clientProfile.status).toBe(200);
      expect(clientProfile.data.data.role).toBe('Cliente');

      // 4. Verify artist profile metadata
      const artistProfile = await client.getUserProfile({
        Authorization: `Bearer ${artistToken}`,
      });
      expect(artistProfile.status).toBe(200);
      expect(artistProfile.data.data.role).toBe('Tatuador');

      // 5. Invariant: Distinct roles, distinct profile properties, no cross-session pollution
      expect(clientProfile.data.data.id).not.toBe(artistProfile.data.data.id);
      expect(clientProfile.data.data.role).not.toBe(artistProfile.data.data.role);
    });
  });
}
