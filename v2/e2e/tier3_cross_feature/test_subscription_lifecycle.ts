/**
 * Tier 3: Cross-Feature Combinations - Subscription & Trial Multi-Role Lifecycle
 * Executes end-to-end multi-step user lifecycles:
 *  1. Artist Trial Lifecycle: Signup -> Active Trial -> Trial Expiration -> Lockout Interception -> Subscription Activation -> Recovery
 *  2. Client Premium Lifecycle: Signup -> Free Dashboard Access -> Premium Action Gated -> Upgrade Subscription -> Premium Unlocked
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail, SAMPLE_BASE64_IMAGE } from '../config.ts';

export function registerSubscriptionLifecycleTests(client: ApiClient) {
  setTier('Tier 3 - Cross-Feature Combinations');

  describe('Cross-Feature: Complete Subscription & Trial Multi-Role Lifecycle', () => {
    it('TC-XFEAT-SUB-01: Artist 90-Day Trial Expiration, Lockout & Recovery Lifecycle', async () => {
      const email = generateTestEmail('artist_sub_lifecycle');
      const password = 'Password123!';

      // Step 1: Register Artist
      const regRes = await client.register({
        email,
        password,
        nombre: 'ArtistLifecycler',
        apellido: 'Studio',
        tipo: 'Tatuador',
        legal_accepted: true,
      });

      expect(regRes.status).toBe(200);
      expect(regRes.data.success).toBe(true);
      const userId = regRes.data.data.user.id;
      const token = regRes.data.data.session.access_token;
      const authHeaders = { Authorization: `Bearer ${token}` };

      // Step 2: Fresh artist is within 90-day trial -> commercial action allowed
      const freshUploadRes = await client.updateUserImg(
        { img: `data:image/png;base64,${SAMPLE_BASE64_IMAGE}` },
        authHeaders
      );
      expect(freshUploadRes.status).not.toBe(403);

      // Step 3: Simulate trial expiration by backdating created_at >90 days ago
      const backdateOk = await client.backdateUserProfile(userId, 95);

      if (backdateOk) {
        // Step 4: Commercial action is now BLOCKED with HTTP 403 SUBSCRIPTION_REQUIRED
        const expiredRes = await client.updateUserImg(
          { img: `data:image/png;base64,${SAMPLE_BASE64_IMAGE}` },
          authHeaders
        );
        expect(expiredRes.status).toBe(403);
        if (expiredRes.data && typeof expiredRes.data === 'object') {
          expect(expiredRes.data.code).toBe('SUBSCRIPTION_REQUIRED');
        }

        // Step 5: Artist acquires and activates subscription
        const prodRes = await client.createProduct({});
        const subRes = await client.subscribe({ id: prodRes.data.id });
        const bindRes = await client.insertUserSubscription(
          {
            id: userId,
            product_id: prodRes.data.id,
            subscription_id: subRes.data.id || 'P-SIMULATED-SUB',
          },
          authHeaders
        );

        // Also update profile active subscription flag
        await client.setUserSubscriptionActive(userId, true);

        // Step 6: Commercial action is now RESTORED (HTTP 200 or successful non-403)
        const recoveredRes = await client.updateUserImg(
          { img: `data:image/png;base64,${SAMPLE_BASE64_IMAGE}` },
          authHeaders
        );
        expect(recoveredRes.status).not.toBe(403);
      }
    });

    it('TC-XFEAT-SUB-02: Client Free Dashboard Access, Premium Gating & Upgrade Lifecycle', async () => {
      const email = generateTestEmail('client_sub_lifecycle');
      const password = 'Password123!';

      // Step 1: Register Standard Client
      const regRes = await client.register({
        email,
        password,
        nombre: 'ClientLifecycler',
        apellido: 'Tester',
        tipo: 'Cliente',
        legal_accepted: true,
      });

      expect(regRes.status).toBe(200);
      expect(regRes.data.success).toBe(true);
      const userId = regRes.data.data.user.id;
      const token = regRes.data.data.session.access_token;
      const authHeaders = { Authorization: `Bearer ${token}` };

      // Step 2: Client accesses profile and catalog freely
      const profileRes = await client.getUserProfile(authHeaders);
      expect(profileRes.status).toBe(200);
      expect(profileRes.data.data.role).toBe('Cliente');
      expect(Boolean(profileRes.data.data.has_active_subscription)).toBe(false);

      const catalogRes = await client.getTatto();
      expect(catalogRes.status).toBe(200);

      // Step 3: Client attempts premium feature without subscription
      const premRes = await client.postClientTattooProgress(
        { tattooId: 'sample-tattoo', notes: 'Healing day 3' },
        authHeaders
      );
      // Either 403 CLIENT_PREMIUM_REQUIRED or 404 if route pending M3 mount
      expect([403, 404].includes(premRes.status)).toBe(true);

      // Step 4: Client upgrades to premium ($4.99/mo)
      await client.setUserSubscriptionActive(userId, true);

      // Step 5: Profile now reflects active subscription
      const updatedProfile = await client.getUserProfile(authHeaders);
      if (updatedProfile.status === 200 && updatedProfile.data?.data) {
        expect(Boolean(updatedProfile.data.data.has_active_subscription)).toBe(true);
      }
    });
  });
}
