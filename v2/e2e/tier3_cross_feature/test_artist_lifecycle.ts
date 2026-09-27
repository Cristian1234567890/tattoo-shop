/**
 * Tier 3: Cross-Feature Combinations - Artist Complete Onboarding & Monetization Lifecycle
 * Executes the sequential chain:
 * Register Artist -> Auto-create in tatuadores_data -> Create PayPal Product & Plan ->
 * Link Subscription to User -> Verify Subscription Status -> Update Artist Portfolio & Style ->
 * Upload Artist Avatar -> Query Public Catalog and Confirm Listing
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail, SAMPLE_BASE64_IMAGE } from '../config.ts';

export function registerArtistLifecycleTests(client: ApiClient) {
  setTier('Tier 3 - Cross-Feature Combinations');

  describe('Cross-Feature: Complete Artist Onboarding & Subscription Lifecycle', () => {
    it('TC-XFEAT-02: Full Artist Onboarding & Verification Sequence', async () => {
      const email = generateTestEmail('artist_journey');
      const password = 'ArtistPassword123!';
      const artistName = `Artist_${Date.now()}`;

      // Step 1: Register as Tatuador
      const regRes = await client.register({
        email,
        password,
        nombre: artistName,
        apellido: 'TattooStudio',
        edad: '1993-07-22',
        tipo: 'Tatuador',
        telefono: '64445555',
        provincia: 'Panamá',
        ciudad: 'Ciudad de Panamá',
        direccion: 'Casco Antiguo, Calle 4ta',
      });

      expect(regRes.status).toBe(200);
      expect(regRes.data.success).toBe(true);
      const userId = regRes.data.user.id;
      const token = regRes.data.session.access_token;
      const refresh = regRes.data.session.refresh_token;

      const authHeaders = {
        Authorization: `Bearer ${token}`,
        refresh_token: refresh,
      };

      // Step 2: Create PayPal Catalog Product
      const prodRes = await client.createProduct({});
      expect(prodRes.status).toBe(200);
      const productId = prodRes.data.id;
      expect(productId).toBeDefined();

      // Step 3: Create PayPal Subscription Plan
      const subPlanRes = await client.subscribe({
        id: productId,
        name: 'App Subscription',
        description: 'Subscripción para tatuadores',
      });
      expect(subPlanRes.status).toBe(200);
      const subscriptionId = subPlanRes.data.id;
      expect(subscriptionId).toBeDefined();

      // Step 4: Link User to Subscription
      const linkRes = await client.insertUserSubscription(
        {
          id: userId,
          product_id: productId,
          subscription_id: subscriptionId,
        },
        authHeaders
      );
      expect(linkRes.status).toBe(200);
      expect(linkRes.data.success).toBe(true);

      // Step 5: Verify User Subscription Query
      const querySubRes = await client.getUserSubscription(userId, authHeaders);
      expect(querySubRes.status).toBe(200);
      expect(querySubRes.data.data.length).toBeGreaterThan(0);
      expect(querySubRes.data.data[0].subscription_id).toBe(subscriptionId);

      // Step 6: Verify Plan Status on PayPal
      const paypalStatusRes = await client.getPayPalSubscription(subscriptionId);
      expect(paypalStatusRes.status).toBe(200);
      expect(paypalStatusRes.data.status).toBe('ACTIVE');

      // Step 7: Update Artist Profile with style and social media
      const updateRes = await client.updateUser(
        {
          email,
          nombre: artistName,
          work_type: 'neotradicional',
          facebook: 'https://facebook.com/myinkstudio',
          instagram: 'https://instagram.com/myinkstudio',
          link: 'https://myinkstudio.com',
          provincia: 'Panamá',
          ciudad: 'Ciudad de Panamá',
          direccion: 'Casco Antiguo',
        },
        authHeaders
      );
      expect(updateRes.status).toBe(200);
      expect(updateRes.data.success).toBe(true);

      // Step 8: Upload Avatar
      const avatarRes = await client.updateUserImg(
        { imageData: SAMPLE_BASE64_IMAGE },
        authHeaders
      );
      expect(avatarRes.status).toBe(200);

      // Step 9: Verify Artist Appears in Public Gallery with Updated Data
      const galleryRes = await client.getTatto(authHeaders);
      expect(galleryRes.status).toBe(200);
      const myArtist = galleryRes.data.data.find(
        (a: any) => a.id === userId || a.data?.email === email
      );
      expect(myArtist).toBeDefined();
      if (myArtist && myArtist.data) {
        expect(myArtist.data.work_type).toBe('neotradicional');
        expect(myArtist.data.instagram).toBe('https://instagram.com/myinkstudio');
      }
    });
  });
}
