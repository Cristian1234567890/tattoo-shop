/**
 * Tier 4: Real-World Scenarios - Complete Artist Onboarding & Subscription Check
 * Models an end-to-end tattoo artist onboarding flow:
 *  1. Artist registers studio account.
 *  2. Creates and binds $1.99/mo PayPal subscription.
 *  3. Verifies active subscription status.
 *  4. Enrolls in 2FA TOTP for account security.
 *  5. Configures studio address, style specialization, and social links.
 *  6. Uploads studio profile avatar.
 *  7. Validates public discovery on the platform.
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail, SAMPLE_BASE64_IMAGE } from '../config.ts';

export function registerArtistOnboardingScenarioTests(client: ApiClient) {
  setTier('Tier 4 - Real-World Scenarios');

  describe('Scenario 2: Complete Artist Onboarding & Subscription Check', () => {
    it('TC-SCEN-02: End-to-end artist signup, subscription check, security, and public catalog appearance', async () => {
      const email = generateTestEmail('onboard_artist');
      const password = 'StudioPassword123!';
      const studioName = `InkMasters_${Date.now()}`;

      // 1. Artist signs up
      const regRes = await client.register({
        email,
        password,
        nombre: studioName,
        apellido: 'Studio',
        edad: '1989-02-14',
        tipo: 'Tatuador',
        telefono: '67770000',
        provincia: 'Panamá',
        ciudad: 'Ciudad de Panamá',
        direccion: 'El Cangrejo, Calle Andrés Mojica',
      });

      expect(regRes.status).toBe(200);
      const userId = regRes.data.user.id;
      const token = regRes.data.session.access_token;
      const refresh = regRes.data.session.refresh_token;

      const authHeaders = {
        Authorization: `Bearer ${token}`,
        refresh_token: refresh,
      };

      // 2. Artist initiates PayPal product & subscription creation
      const prodRes = await client.createProduct({});
      expect(prodRes.status).toBe(200);

      const subRes = await client.subscribe({
        id: prodRes.data.id,
        name: 'App Subscription',
        description: 'Subscripción mensual para tatuadores',
      });
      expect(subRes.status).toBe(200);

      // 3. Bind subscription to user
      const storeRes = await client.insertUserSubscription(
        {
          id: userId,
          product_id: prodRes.data.id,
          subscription_id: subRes.data.id,
        },
        authHeaders
      );
      expect(storeRes.status).toBe(200);

      // 4. Validate subscription status before granting dashboard access (equivalent to frontend validateSubscription)
      const userSubRes = await client.getUserSubscription(userId, authHeaders);
      expect(userSubRes.status).toBe(200);
      expect(userSubRes.data.data.length).toBeGreaterThan(0);

      const planStatusRes = await client.getPayPalSubscription(subRes.data.id);
      expect(planStatusRes.status).toBe(200);
      expect(planStatusRes.data.status).toBe('ACTIVE');

      // 5. Enroll in 2FA
      const enrollRes = await client.enroll(authHeaders);
      expect(enrollRes.status).toBe(200);
      expect(enrollRes.data.data.totp.secret).toBeDefined();

      // 6. Complete profile customization
      const updateRes = await client.updateUser(
        {
          email,
          nombre: studioName,
          apellido: 'Studio',
          work_type: 'realista',
          facebook: 'https://facebook.com/inkmasters',
          instagram: 'https://instagram.com/inkmasters',
          twitter: 'https://twitter.com/inkmasters',
          link: 'https://inkmasters-pty.com',
          provincia: 'Panamá',
          ciudad: 'Ciudad de Panamá',
          direccion: 'El Cangrejo',
        },
        authHeaders
      );
      expect(updateRes.status).toBe(200);

      // 7. Upload studio avatar
      const avatarRes = await client.updateUserImg(
        { imageData: SAMPLE_BASE64_IMAGE },
        authHeaders
      );
      expect(avatarRes.status).toBe(200);

      // 8. Public validation in catalog
      const catalogRes = await client.getTatto();
      expect(catalogRes.status).toBe(200);
      const isListed = catalogRes.data.data.some(
        (artist: any) => artist.id === userId || artist.data?.email === email
      );
      expect(isListed).toBe(true);
    });
  });
}
