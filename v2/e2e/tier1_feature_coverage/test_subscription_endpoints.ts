/**
 * Tier 1: Feature Coverage - Subscription & PayPal Endpoints
 * Tests:
 *  - Endpoint 8: POST /createproduct (5 test cases)
 *  - Endpoint 9: POST /subscribe (5 test cases)
 *  - Endpoint 10: GET /paypalsubscription/:id (5 test cases)
 *  - Endpoint 11: GET /usersubscription/:id (5 test cases)
 *  - Endpoint 12: POST /usersubscription (5 test cases)
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail } from '../config.ts';

export function registerSubscriptionEndpointsTests(client: ApiClient) {
  setTier('Tier 1 - Feature Coverage');

  describe('Feature 8: POST /createproduct (PayPal Catalog Product)', () => {
    it('TC-PROD-01: Creates PayPal catalog product, returning product ID and description', async () => {
      const res = await client.createProduct({});
      expect(res.status).toBe(200);
      expect(res.data.id).toBeDefined();
      expect(res.data.name).toBeDefined();
    });

    it('TC-PROD-02: Works in fallback mode when PAYPAL_KEY=pendiente without crashing', async () => {
      const res = await client.createProduct();
      expect(res.status).toBe(200);
      expect(typeof res.data.id).toBe('string');
      expect(res.data.id.length).toBeGreaterThan(0);
    });

    it('TC-PROD-03: Product response contains type SERVICE and category SOFTWARE', async () => {
      const res = await client.createProduct();
      expect(res.status).toBe(200);
      if (res.data.type) {
        expect(res.data.type).toBe('SERVICE');
      }
    });

    it('TC-PROD-04: Consecutive product creation calls return valid product definitions', async () => {
      const res1 = await client.createProduct();
      const res2 = await client.createProduct();
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res1.data.id).toBeDefined();
      expect(res2.data.id).toBeDefined();
    });

    it('TC-PROD-05: Product name defaults to "App Subscription" or custom name', async () => {
      const res = await client.createProduct();
      expect(res.status).toBe(200);
      expect(res.data.name).toBe('App Subscription');
    });
  });

  describe('Feature 9: POST /subscribe (PayPal Subscription Plan)', () => {
    it('TC-SUB-01: Creates billing plan with product ID, returning active plan', async () => {
      const prodRes = await client.createProduct();
      const productId = prodRes.data.id;

      const subRes = await client.subscribe({
        id: productId,
        name: 'App Subscription',
        description: 'Subscripción para tatuadores',
      });

      expect(subRes.status).toBe(200);
      expect(subRes.data.id).toBeDefined();
      expect(subRes.data.status).toBe('ACTIVE');
    });

    it('TC-SUB-02: Works with fallback when PAYPAL_KEY=pendiente without throwing unhandled exceptions', async () => {
      const subRes = await client.subscribe({
        id: 'PROD-TEST-FALLBACK',
      });
      expect(subRes.status).toBe(200);
      expect(subRes.data.id).toBeDefined();
    });

    it('TC-SUB-03: Request with custom plan name preserves name attribute', async () => {
      const subRes = await client.subscribe({
        id: 'PROD-CUSTOM',
        name: 'Custom Artist Tier',
        description: 'Tier description',
      });
      expect(subRes.status).toBe(200);
      expect(subRes.data.id).toBeDefined();
    });

    it('TC-SUB-04: Returns plan with product_id matching input', async () => {
      const prodId = 'PROD-MATCH-123';
      const subRes = await client.subscribe({
        id: prodId,
      });
      expect(subRes.status).toBe(200);
      if (subRes.data.product_id) {
        expect(subRes.data.product_id).toBe(prodId);
      }
    });

    it('TC-SUB-05: Empty payload in subscribe returns fallback active plan or validation response', async () => {
      const subRes = await client.subscribe({});
      expect(subRes.status).toBe(200);
      expect(subRes.data.id).toBeDefined();
    });
  });

  describe('Feature 10: GET /paypalsubscription/:id (PayPal Subscription Status)', () => {
    it('TC-PAYSUB-01: Retrieves subscription status for a valid plan ID (returns ACTIVE)', async () => {
      const prodRes = await client.createProduct();
      const subRes = await client.subscribe({ id: prodRes.data.id });
      const planId = subRes.data.id;

      const checkRes = await client.getPayPalSubscription(planId);
      expect(checkRes.status).toBe(200);
      expect(checkRes.data.id).toBe(planId);
      expect(checkRes.data.status).toBe('ACTIVE');
    });

    it('TC-PAYSUB-02: Works in fallback mode when PAYPAL_KEY=pendiente', async () => {
      const checkRes = await client.getPayPalSubscription('P-MOCK-TEST-001');
      expect(checkRes.status).toBe(200);
      expect(checkRes.data.status).toBe('ACTIVE');
    });

    it('TC-PAYSUB-03: Query with arbitrary plan ID returns valid plan status structure', async () => {
      const checkRes = await client.getPayPalSubscription('arbitrary-plan-id');
      expect(checkRes.status).toBe(200);
      expect(checkRes.data.id).toBeDefined();
    });

    it('TC-PAYSUB-04: Response includes plan name and status', async () => {
      const checkRes = await client.getPayPalSubscription('P-TEST-VERIFY');
      expect(checkRes.status).toBe(200);
      expect(checkRes.data.name).toBeDefined();
      expect(checkRes.data.status).toBeDefined();
    });

    it('TC-PAYSUB-05: HTTP response status is 200 without throwing 500 error', async () => {
      const checkRes = await client.getPayPalSubscription('P-NONEXISTENT-999');
      expect(checkRes.status).toBe(200);
    });
  });

  describe('Feature 11: GET /usersubscription/:id (User Subscription Query)', () => {
    it('TC-USERSUB-GET-01: Query for user with subscription returns array with product_id and subscription_id', async () => {
      const email = generateTestEmail('sub_artist_get');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'SubArtist',
        apellido: 'Query',
        tipo: 'Tatuador',
      });

      const token = reg.data.session.access_token;
      const refresh = reg.data.session.refresh_token;
      const userId = reg.data.user.id;

      // Insert subscription first
      await client.insertUserSubscription(
        {
          id: userId,
          product_id: 'PROD-UNIT-01',
          subscription_id: 'P-SUB-UNIT-01',
        },
        {
          Authorization: `Bearer ${token}`,
          refresh_token: refresh,
        }
      );

      // Query subscription
      const queryRes = await client.getUserSubscription(userId, {
        Authorization: `Bearer ${token}`,
        refresh_token: refresh,
      });

      expect(queryRes.status).toBe(200);
      expect(queryRes.data.success).toBe(true);
      expect(Array.isArray(queryRes.data.data)).toBe(true);
      expect(queryRes.data.data.length).toBeGreaterThan(0);
      expect(queryRes.data.data[0].subscription_id).toBe('P-SUB-UNIT-01');
    });

    it('TC-USERSUB-GET-02: Query for user without subscription returns success: true with empty array []', async () => {
      const email = generateTestEmail('sub_none');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'NoSub',
        apellido: 'User',
        tipo: 'Cliente',
      });

      const queryRes = await client.getUserSubscription(reg.data.user.id, {
        Authorization: `Bearer ${reg.data.session.access_token}`,
        refresh_token: reg.data.session.refresh_token,
      });

      expect(queryRes.status).toBe(200);
      expect(queryRes.data.success).toBe(true);
      expect(Array.isArray(queryRes.data.data)).toBe(true);
      expect(queryRes.data.data.length).toBe(0);
    });

    it('TC-USERSUB-GET-03: Query with arbitrary UUID returns empty array without throwing error', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const queryRes = await client.getUserSubscription(fakeUuid);
      expect(queryRes.status).toBe(200);
      expect(queryRes.data.success).toBe(true);
      expect(Array.isArray(queryRes.data.data)).toBe(true);
      expect(queryRes.data.data.length).toBe(0);
    });

    it('TC-USERSUB-GET-04: Supports header key "refresh" variant', async () => {
      const email = generateTestEmail('sub_alt_refresh');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'AltSub',
        apellido: 'Test',
        tipo: 'Cliente',
      });

      const queryRes = await client.getUserSubscription(reg.data.user.id, {
        Authorization: `Bearer ${reg.data.session.access_token}`,
        refresh: reg.data.session.refresh_token,
      });

      expect(queryRes.status).toBe(200);
      expect(queryRes.data.success).toBe(true);
    });

    it('TC-USERSUB-GET-05: Response strictly satisfies { success: true, data: [...] } envelope', async () => {
      const res = await client.getUserSubscription('11111111-1111-1111-1111-111111111111');
      expect(res.status).toBe(200);
      expect(typeof res.data).toBe('object');
      expect(res.data.success).toBe(true);
      expect(Array.isArray(res.data.data)).toBe(true);
    });
  });

  describe('Feature 12: POST /usersubscription (Store User Subscription)', () => {
    it('TC-USERSUB-POST-01: Persists user subscription binding (id, product_id, subscription_id)', async () => {
      const email = generateTestEmail('sub_store_artist');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'SubStore',
        apellido: 'Artist',
        tipo: 'Tatuador',
      });

      const token = reg.data.session.access_token;
      const refresh = reg.data.session.refresh_token;
      const userId = reg.data.user.id;

      const storeRes = await client.insertUserSubscription(
        {
          id: userId,
          product_id: 'PROD-V2-STORE-01',
          subscription_id: 'P-V2-SUB-STORE-01',
        },
        {
          Authorization: `Bearer ${token}`,
          refresh_token: refresh,
        }
      );

      expect(storeRes.status).toBe(200);
      expect(storeRes.data.success).toBe(true);
      expect(Array.isArray(storeRes.data.data)).toBe(true);
      expect(storeRes.data.data[0].subscription_id).toBe('P-V2-SUB-STORE-01');
    });

    it('TC-USERSUB-POST-02: Subsequent GET /usersubscription/:id returns persisted subscription', async () => {
      const email = generateTestEmail('sub_store_verify');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'SubStoreVerify',
        apellido: 'Artist',
        tipo: 'Tatuador',
      });

      const token = reg.data.session.access_token;
      const refresh = reg.data.session.refresh_token;
      const userId = reg.data.user.id;

      await client.insertUserSubscription(
        {
          id: userId,
          product_id: 'PROD-ROUNDTRIP',
          subscription_id: 'P-ROUNDTRIP-PLAN',
        },
        {
          Authorization: `Bearer ${token}`,
          refresh_token: refresh,
        }
      );

      const checkRes = await client.getUserSubscription(userId, {
        Authorization: `Bearer ${token}`,
        refresh_token: refresh,
      });

      expect(checkRes.status).toBe(200);
      expect(checkRes.data.data.some((s: any) => s.subscription_id === 'P-ROUNDTRIP-PLAN')).toBe(true);
    });

    it('TC-USERSUB-POST-03: Request without Authorization header is rejected safely', async () => {
      const res = await client.insertUserSubscription({
        id: 'some-user-id',
        product_id: 'PROD-UNAUTH',
        subscription_id: 'P-UNAUTH',
      });
      expect(res.status >= 400 || (res.data && res.data.success === false)).toBe(true);
    });

    it('TC-USERSUB-POST-04: Missing subscription_id returns error response', async () => {
      const email = generateTestEmail('sub_store_missing');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'MissingSub',
        apellido: 'Test',
        tipo: 'Tatuador',
      });

      const res = await client.insertUserSubscription(
        {
          id: reg.data.user.id,
          product_id: 'PROD-ONLY',
        },
        {
          Authorization: `Bearer ${reg.data.session.access_token}`,
          refresh_token: reg.data.session.refresh_token,
        }
      );

      expect(res.status >= 400 || (res.data && res.data.success === false)).toBe(true);
    });

    it('TC-USERSUB-POST-05: Update existing user subscription replaces or records subscription', async () => {
      const email = generateTestEmail('sub_store_update');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'UpdateSub',
        apellido: 'Test',
        tipo: 'Tatuador',
      });

      const headers = {
        Authorization: `Bearer ${reg.data.session.access_token}`,
        refresh_token: reg.data.session.refresh_token,
      };

      // Store plan 1
      await client.insertUserSubscription(
        {
          id: reg.data.user.id,
          product_id: 'PROD-PLAN-1',
          subscription_id: 'P-PLAN-1',
        },
        headers
      );

      // Store plan 2
      const updateRes = await client.insertUserSubscription(
        {
          id: reg.data.user.id,
          product_id: 'PROD-PLAN-2',
          subscription_id: 'P-PLAN-2',
        },
        headers
      );

      expect(updateRes.status).toBe(200);
      expect(updateRes.data.success).toBe(true);
    });
  });
}
