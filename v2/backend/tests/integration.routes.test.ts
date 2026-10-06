import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../src/app';

describe('HTTP Integration Routes & Auth Hardening Tests', () => {
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

  // Feature: GET /currencies
  it('GET /currencies should return 200 OK with active currencies (Public)', async () => {
    const res = await fetch(`${baseUrl}/currencies`);
    assert.equal(res.status, 200);

    const body = await res.json() as { success: boolean; data: any[] };
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 5);

    const codes = body.data.map(c => c.code);
    assert.ok(codes.includes('USD'));
    assert.ok(codes.includes('PAB'));
    assert.ok(codes.includes('EUR'));
    assert.ok(codes.includes('COP'));
    assert.ok(codes.includes('MXN'));
  });

  // Feature: GET /gettatto with query params
  it('GET /gettatto should return 200 OK with public artist catalog', async () => {
    const res = await fetch(`${baseUrl}/gettatto`);
    assert.equal(res.status, 200);

    const body = await res.json() as { success: boolean; data: any[] };
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  it('GET /gettatto?country=Panama should return 200 OK and filter artists', async () => {
    const res = await fetch(`${baseUrl}/gettatto?country=Panama`);
    assert.equal(res.status, 200);

    const body = await res.json() as { success: boolean; data: any[] };
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  it('GET /gettatto?currency=USD should return 200 OK and filter artists', async () => {
    const res = await fetch(`${baseUrl}/gettatto?currency=USD`);
    assert.equal(res.status, 200);

    const body = await res.json() as { success: boolean; data: any[] };
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  // Auth Hardening: POST /mail requires authentication
  it('POST /mail without authentication should return 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/mail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Inquiry',
        text: 'Hello artist',
      }),
    });

    assert.equal(res.status, 401);
    const body = await res.json() as { success: boolean; error: string };
    assert.equal(body.success, false);
    assert.ok(body.error.toLowerCase().includes('unauthorized'));
  });

  // Auth Hardening: POST /subscribe requires authentication
  it('POST /subscribe without authentication should return 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tier: 'artist_pro',
      }),
    });

    assert.equal(res.status, 401);
    const body = await res.json() as { success: boolean; error: string };
    assert.equal(body.success, false);
    assert.ok(body.error.toLowerCase().includes('unauthorized'));
  });

  // Guest Gating: POST /agenda requires authentication
  it('POST /agenda without authentication should return 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/agenda`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'New Tattoo Session',
        date: '2026-11-01',
      }),
    });

    assert.equal(res.status, 401);
    const body = await res.json() as { success: boolean; error: string };
    assert.equal(body.success, false);
    assert.ok(body.error.toLowerCase().includes('unauthorized'));
  });

  // Feature: GET /products (Tienda Fase 1)
  it('GET /products should return 200 OK with product catalog (Public)', async () => {
    const res = await fetch(`${baseUrl}/products`);
    assert.equal(res.status, 200);

    const body = await res.json() as { success: boolean; data: any[] };
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);

    const first = body.data[0];
    assert.ok(first.name);
    assert.ok(typeof first.price === 'number' || typeof first.price === 'string');
  });

  it('GET /products?category=aftercare should filter products by category', async () => {
    const res = await fetch(`${baseUrl}/products?category=aftercare`);
    assert.equal(res.status, 200);

    const body = await res.json() as { success: boolean; data: any[] };
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
    body.data.forEach(item => {
      if (item.category) {
        assert.equal(item.category, 'aftercare');
      }
    });
  });
});

