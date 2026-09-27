/**
 * Tier 2: Boundary & Corner Cases - Subscription Boundaries
 * Tests edge cases in subscription lookups, non-existent records, and binding validations.
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail } from '../config.ts';

export function registerSubscriptionBoundariesTests(client: ApiClient) {
  setTier('Tier 2 - Boundary & Corner Cases');

  describe('Boundary: Subscription Lookups & Edge Cases', () => {
    it('TC-BND-SUB-01: GET /usersubscription/:id with non-existent UUID returns success: true and empty data []', async () => {
      const nonExistentUuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
      const res = await client.getUserSubscription(nonExistentUuid);

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(Array.isArray(res.data.data)).toBe(true);
      expect(res.data.data.length).toBe(0);
    });

    it('TC-BND-SUB-02: GET /paypalsubscription/:id with invalid/malformed ID returns fallback or error without 500', async () => {
      const res = await client.getPayPalSubscription('INVALID_PLAN_FORMAT_!@#$%^');
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('TC-BND-SUB-03: Storing subscription with non-existent user UUID returns appropriate error or rejection', async () => {
      const fakeUuid = '99999999-9999-9999-9999-999999999999';
      const res = await client.insertUserSubscription({
        id: fakeUuid,
        product_id: 'PROD-GHOST',
        subscription_id: 'P-GHOST-SUB',
      });

      // Foreign key constraint or unauthorized prevents orphan inserts
      expect(res.status >= 400 || (res.data && res.data.success === false)).toBe(true);
    });

    it('TC-BND-SUB-04: Client role user checking subscription returns empty array and does not crash frontend logic', async () => {
      const email = generateTestEmail('client_sub_check');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'ClientNoSub',
        tipo: 'Cliente',
      });

      const res = await client.getUserSubscription(reg.data.user.id, {
        Authorization: `Bearer ${reg.data.session.access_token}`,
        refresh_token: reg.data.session.refresh_token,
      });

      expect(res.status).toBe(200);
      expect(res.data.data.length).toBe(0);
    });
  });
}
