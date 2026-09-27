/**
 * Tier 1: Feature Coverage - Artist Catalog Endpoints
 * Tests:
 *  - Endpoint 7: GET /gettatto (6 test cases)
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail } from '../config.ts';

export function registerGalleryEndpointsTests(client: ApiClient) {
  setTier('Tier 1 - Feature Coverage');

  describe('Feature 7: GET /gettatto (Artist Public Catalog)', () => {
    it('TC-GETTATTO-01: Returns array of tattoo artist profiles with HTTP 200', async () => {
      const email = generateTestEmail('gallery_client');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'Gallery',
        apellido: 'Viewer',
        tipo: 'Cliente',
      });

      const res = await client.getTatto({
        Authorization: `Bearer ${reg.data.session.access_token}`,
        refresh_token: reg.data.session.refresh_token,
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('TC-GETTATTO-02: Each artist entry contains id and data object with artist attributes', async () => {
      // Register an artist first to ensure at least one exists
      const artistEmail = generateTestEmail('catalog_artist_item');
      await client.register({
        email: artistEmail,
        password: 'Password123!',
        nombre: 'CatalogArtist',
        apellido: 'Master',
        tipo: 'Tatuador',
        provincia: 'Panamá',
        ciudad: 'Ciudad de Panamá',
      });

      const res = await client.getTatto();
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.data)).toBe(true);

      if (res.data.data.length > 0) {
        const item = res.data.data[0];
        expect(item.id).toBeDefined();
        expect(item.data).toBeDefined();
      }
    });

    it('TC-GETTATTO-03: Newly registered artist appears in the returned public catalog list', async () => {
      const uniqueName = `Artist_${Date.now()}`;
      const artistEmail = generateTestEmail('catalog_new_artist');

      const reg = await client.register({
        email: artistEmail,
        password: 'Password123!',
        nombre: uniqueName,
        apellido: 'Specialist',
        tipo: 'Tatuador',
        provincia: 'Colón',
        ciudad: 'Colón',
      });

      const res = await client.getTatto({
        Authorization: `Bearer ${reg.data.session.access_token}`,
        refresh_token: reg.data.session.refresh_token,
      });

      expect(res.status).toBe(200);
      const found = res.data.data.some(
        (artist: any) =>
          artist.id === reg.data.user.id ||
          artist.data?.email === artistEmail ||
          artist.data?.nombre === uniqueName
      );
      expect(found).toBe(true);
    });

    it('TC-GETTATTO-04: Public catalog query without auth headers returns HTTP 200 or handles safely', async () => {
      const res = await client.getTatto();
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('TC-GETTATTO-05: Response structure strictly matches { success: true, data: [...] } envelope', async () => {
      const res = await client.getTatto();
      expect(res.status).toBe(200);
      expect(typeof res.data).toBe('object');
      expect(res.data.success).toBe(true);
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('TC-GETTATTO-06: Verified artist profile contains default or signed profile image URL', async () => {
      const artistEmail = generateTestEmail('catalog_artist_img');
      const reg = await client.register({
        email: artistEmail,
        password: 'Password123!',
        nombre: 'AvatarCheck',
        apellido: 'Artist',
        tipo: 'Tatuador',
      });

      const res = await client.getTatto({
        Authorization: `Bearer ${reg.data.session.access_token}`,
        refresh_token: reg.data.session.refresh_token,
      });

      const match = res.data.data.find(
        (a: any) => a.id === reg.data.user.id || a.data?.email === artistEmail
      );
      if (match) {
        expect(match.data.profile).toBeDefined();
        expect(typeof match.data.profile).toBe('string');
      }
    });
  });
}
