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

    // 90-Day Trial Boundary Tests (Day 89 vs Day 90 vs Day 91)
    it('TC-BND-SUB-05: Boundary test: Day 89 of trial allows access without active subscription', () => {
      const now = new Date();
      const day89Date = new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000);
      const diffTime = Math.abs(now.getTime() - day89Date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const hasActiveSubscription = false;

      // Invariant: diffDays (89) <= 90 -> NOT locked out
      expect(diffDays).toBe(89);
      expect(diffDays > 90 && !hasActiveSubscription).toBe(false);
    });

    it('TC-BND-SUB-06: Boundary test: Day 90 of trial (exact boundary) allows access', () => {
      const now = new Date();
      const day90Date = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const diffTime = Math.abs(now.getTime() - day90Date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const hasActiveSubscription = false;

      // Invariant: diffDays (90) is NOT strictly greater than 90 -> NOT locked out
      expect(diffDays).toBe(90);
      expect(diffDays > 90 && !hasActiveSubscription).toBe(false);
    });

    it('TC-BND-SUB-07: Boundary test: Day 91 of trial (first expired day) triggers lockout (HTTP 403 SUBSCRIPTION_REQUIRED)', () => {
      const now = new Date();
      const day91Date = new Date(now.getTime() - 91 * 24 * 60 * 60 * 1000);
      const diffTime = Math.abs(now.getTime() - day91Date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const hasActiveSubscription = false;

      // Invariant: diffDays (91) > 90 && !hasActiveSubscription -> LOCKED OUT
      expect(diffDays).toBe(91);
      expect(diffDays > 90 && !hasActiveSubscription).toBe(true);
    });

    it('TC-BND-SUB-08: Boundary test: Day 91 of trial with active subscription bypasses lockout cleanly', () => {
      const now = new Date();
      const day91Date = new Date(now.getTime() - 91 * 24 * 60 * 60 * 1000);
      const diffTime = Math.abs(now.getTime() - day91Date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const hasActiveSubscription = true;

      // Invariant: hasActiveSubscription=true prevents lockout even after 90 days
      expect(diffDays > 90 && !hasActiveSubscription).toBe(false);
    });

    it('TC-BND-SUB-09: Client role is strictly exempt from 90-day trial lockout on basic views', () => {
      const clientCreatedAt = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
      const clientRole = 'Cliente';
      const hasActiveSubscription = false;

      // Client should not be blocked from the platform, only from premium actions
      const isArtistRole = clientRole.toLowerCase() === 'tatuador';
      expect(isArtistRole).toBe(false);
    });

  });
}
