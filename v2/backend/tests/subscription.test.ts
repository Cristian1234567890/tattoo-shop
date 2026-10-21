import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../src/app';
import { isValidLuhn, detectCardBrand } from '../src/services/subscription.service';

describe('Subscription Cancellation & Legacy Card Affiliation Vault Tests', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  describe('1. Luhn Algorithm & Card Brand Detection', () => {
    it('1.1 should correctly validate valid cards using Luhn algorithm', () => {
      assert.equal(isValidLuhn('4111 1111 1111 1111'), true);
      assert.equal(isValidLuhn('4242 4242 4242 4242'), true);
      assert.equal(isValidLuhn('4000 0000 0000 0002'), true);
    });

    it('1.2 should reject cards with invalid Luhn checksum', () => {
      assert.equal(isValidLuhn('4111 1111 1111 1112'), false);
      assert.equal(isValidLuhn('1234 5678 9012 3456'), false);
      assert.equal(isValidLuhn('123'), false);
    });

    it('1.3 should detect card brand correctly (Visa, Mastercard, Amex)', () => {
      assert.equal(detectCardBrand('4111111111111111'), 'Visa');
      assert.equal(detectCardBrand('5100000000000000'), 'Mastercard');
      assert.equal(detectCardBrand('340000000000000'), 'American Express');
      assert.equal(detectCardBrand('370000000000000'), 'American Express');
    });
  });

  describe('2. Legacy Card Affiliation Gateway (POST /subscription/affiliate-card)', () => {
    it('2.1 should affiliate card and activate 30-day membership for user', async () => {
      const res = await fetch(`${baseUrl}/subscription/affiliate-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test_client_vip_1',
          holder_name: 'Alejandro Cruz',
          card_number: '4111 1111 1111 1111',
          expiration: '12/28',
          cvv: '123',
          agreement_accepted: true,
          role: 'cliente',
          plan_type: 'vip',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json() as any;
      assert.equal(body.success, true);
      assert.equal(body.data.subscription_status, 'active');
      assert.equal(body.data.has_active_subscription, true);
      assert.equal(body.data.cancel_at_period_end, false);
      assert.ok(body.data.current_period_end);
      assert.equal(body.data.card.brand, 'Visa');
      assert.equal(body.data.card.last4, '1111');
      assert.equal(body.data.card.holder, 'ALEJANDRO CRUZ');
    });

    it('2.2 should reject affiliation without explicit agreement', async () => {
      const res = await fetch(`${baseUrl}/subscription/affiliate-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test_client_vip_2',
          holder_name: 'Alejandro Cruz',
          card_number: '4111 1111 1111 1111',
          expiration: '12/28',
          cvv: '123',
          agreement_accepted: false,
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json() as any;
      assert.equal(body.success, false);
      assert.ok(body.error.toLowerCase().includes('autorizar'));
    });

    it('2.3 should reject affiliation with invalid expiration format', async () => {
      const res = await fetch(`${baseUrl}/subscription/affiliate-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test_client_vip_3',
          holder_name: 'Alejandro Cruz',
          card_number: '4111 1111 1111 1111',
          expiration: '14/28',
          cvv: '123',
          agreement_accepted: true,
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json() as any;
      assert.equal(body.success, false);
      assert.ok(body.error.toLowerCase().includes('mes de expiración'));
    });
  });

  describe('3. Subscription Cancellation with 30-day Grace Period (POST /subscription/cancel)', () => {
    it('3.1 should schedule cancellation while preserving active benefits until period end', async () => {
      const res = await fetch(`${baseUrl}/subscription/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test_client_vip_1',
          reason: 'Costo mensual',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json() as any;
      assert.equal(body.success, true);
      assert.equal(body.data.subscription_status, 'canceling');
      assert.equal(body.data.cancel_at_period_end, true);
      assert.equal(body.data.has_active_subscription, true); // Active until period ends
      assert.ok(body.data.current_period_end);
    });

    it('3.2 should return updated status via GET /subscription/status/:id', async () => {
      const res = await fetch(`${baseUrl}/subscription/status/test_client_vip_1`);
      assert.equal(res.status, 200);
      const body = await res.json() as any;
      assert.equal(body.success, true);
      assert.equal(body.data.subscription_status, 'canceling');
      assert.equal(body.data.cancel_at_period_end, true);
      assert.equal(body.data.has_active_subscription, true);
      assert.ok(body.data.days_remaining > 0);
    });
  });

  describe('4. Subscription Reactivation (POST /subscription/reactivate)', () => {
    it('4.1 should reactivate subscription and cancel the scheduled cancellation', async () => {
      const res = await fetch(`${baseUrl}/subscription/reactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test_client_vip_1',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json() as any;
      assert.equal(body.success, true);
      assert.equal(body.data.subscription_status, 'active');
      assert.equal(body.data.cancel_at_period_end, false);
      assert.equal(body.data.has_active_subscription, true);
    });
  });
});
