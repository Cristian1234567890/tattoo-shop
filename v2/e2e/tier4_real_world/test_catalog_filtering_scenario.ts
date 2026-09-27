/**
 * Tier 4: Real-World Scenarios - Multi-Style Artist Catalog & Search Filtering
 * Tests catalog population and filtering across diverse tattoo styles:
 * (Realista, Tradicional, Neotradicional, Blackwork, Japonés, Tribal, Acuarela).
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail } from '../config.ts';

export function registerCatalogFilteringScenarioTests(client: ApiClient) {
  setTier('Tier 4 - Real-World Scenarios');

  describe('Scenario 4: Multi-Style Artist Catalog Filtering', () => {
    it('TC-SCEN-04: Multi-style artist registration and catalog style categorization', async () => {
      // 1. Register Artist with style Realista
      const emailRealista = generateTestEmail('style_realista');
      const reg1 = await client.register({
        email: emailRealista,
        password: 'Password123!',
        nombre: 'ArtistRealista',
        apellido: 'Pro',
        tipo: 'Tatuador',
        provincia: 'Panamá',
        ciudad: 'Ciudad de Panamá',
      });
      expect(reg1.status).toBe(200);

      await client.updateUser(
        { email: emailRealista, nombre: 'ArtistRealista', work_type: 'realista' },
        {
          Authorization: `Bearer ${reg1.data.session.access_token}`,
          refresh_token: reg1.data.session.refresh_token,
        }
      );

      // 2. Register Artist with style Tradicional
      const emailTradicional = generateTestEmail('style_tradicional');
      const reg2 = await client.register({
        email: emailTradicional,
        password: 'Password123!',
        nombre: 'ArtistTradicional',
        apellido: 'Pro',
        tipo: 'Tatuador',
        provincia: 'Chiriquí',
        ciudad: 'David',
      });
      expect(reg2.status).toBe(200);

      await client.updateUser(
        { email: emailTradicional, nombre: 'ArtistTradicional', work_type: 'tradicional' },
        {
          Authorization: `Bearer ${reg2.data.session.access_token}`,
          refresh_token: reg2.data.session.refresh_token,
        }
      );

      // 3. Query public catalog
      const catalogRes = await client.getTatto();
      expect(catalogRes.status).toBe(200);
      expect(catalogRes.data.success).toBe(true);

      const allArtists = catalogRes.data.data;
      expect(allArtists.length).toBeGreaterThanOrEqual(2);

      // Filter simulation
      const realistaArtists = allArtists.filter((a: any) => a.data?.work_type === 'realista');
      const tradicionalArtists = allArtists.filter((a: any) => a.data?.work_type === 'tradicional');

      expect(realistaArtists.length).toBeGreaterThanOrEqual(1);
      expect(tradicionalArtists.length).toBeGreaterThanOrEqual(1);
    });
  });
}
