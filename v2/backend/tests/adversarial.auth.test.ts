import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../src/app';
import { revokeToken } from '../src/services/auth.service';

describe('Adversarial Auth Hardening & Guest Protection Stress Tests', () => {
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

  // Helper to verify standard 401 Unauthorized JSON response
  async function assertUnauthorizedResponse(res: Response, expectedErrorSubstring?: string) {
    assert.equal(res.status, 401, `Expected HTTP 401, received ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('application/json'), `Expected JSON content-type, got: ${contentType}`);
    
    const body = (await res.json()) as { success?: boolean; error?: string };
    assert.equal(body.success, false, 'Expected body.success to be strictly false');
    assert.equal(typeof body.error, 'string', 'Expected body.error to be a non-empty string');
    assert.ok(body.error!.length > 0, 'body.error must not be empty');

    if (expectedErrorSubstring) {
      assert.ok(
        body.error!.toLowerCase().includes(expectedErrorSubstring.toLowerCase()),
        `Expected error message to include "${expectedErrorSubstring}", got: "${body.error}"`
      );
    }
  }

  // ==========================================
  // Section 1: Unauthenticated POST /mail
  // ==========================================
  describe('Adversarial Vectors: POST /mail', () => {
    const validMailPayload = {
      to: 'artist@example.com',
      subject: 'Booking Inquiry',
      text: 'Would love to book a session for next week',
    };

    it('1.1 should reject request with missing Authorization header (guest)', async () => {
      const res = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validMailPayload),
      });
      await assertUnauthorizedResponse(res, 'unauthorized');
    });

    it('1.2 should reject request with empty Authorization header', async () => {
      const res = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: '',
        },
        body: JSON.stringify(validMailPayload),
      });
      await assertUnauthorizedResponse(res, 'unauthorized');
    });

    it('1.3 should reject request with whitespace-only Authorization header', async () => {
      const res = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: '    \t   ',
        },
        body: JSON.stringify(validMailPayload),
      });
      await assertUnauthorizedResponse(res, 'unauthorized');
    });

    it('1.4 should reject request with empty Bearer token ("Bearer ") with 401', async () => {
      const res = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ',
        },
        body: JSON.stringify(validMailPayload),
      });
      await assertUnauthorizedResponse(res);
    });

    it('1.5 should reject request with whitespace-only Bearer token ("Bearer    ") with 401', async () => {
      const res = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer    ',
        },
        body: JSON.stringify(validMailPayload),
      });
      await assertUnauthorizedResponse(res);
    });

    it('1.6 should reject request with literal string "null" or "undefined"', async () => {
      const res1 = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer null',
        },
        body: JSON.stringify(validMailPayload),
      });
      await assertUnauthorizedResponse(res1);

      const res2 = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer undefined',
        },
        body: JSON.stringify(validMailPayload),
      });
      await assertUnauthorizedResponse(res2);
    });

    it('1.7 should prioritize auth rejection even if payload body is empty or malformed', async () => {
      // Empty body
      const res1 = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      await assertUnauthorizedResponse(res1, 'unauthorized');

      // Malformed non-JSON payload
      const res2 = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'NOT_JSON_PAYLOAD',
      });
      await assertUnauthorizedResponse(res2, 'unauthorized');
    });
  });

  // ==========================================
  // Section 2: Unauthenticated POST /subscribe
  // ==========================================
  describe('Adversarial Vectors: POST /subscribe', () => {
    const validSubscribePayload = {
      tier: 'artist_pro',
      paymentMethodId: 'pm_card_visa',
    };

    it('2.1 should reject request with missing Authorization header (guest)', async () => {
      const res = await fetch(`${baseUrl}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validSubscribePayload),
      });
      await assertUnauthorizedResponse(res, 'unauthorized');
    });

    it('2.2 should reject request with empty Authorization header', async () => {
      const res = await fetch(`${baseUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: '',
        },
        body: JSON.stringify(validSubscribePayload),
      });
      await assertUnauthorizedResponse(res, 'unauthorized');
    });

    it('2.3 should reject request with whitespace-only Authorization header', async () => {
      const res = await fetch(`${baseUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: '      ',
        },
        body: JSON.stringify(validSubscribePayload),
      });
      await assertUnauthorizedResponse(res, 'unauthorized');
    });

    it('2.4 should reject request with empty Bearer prefix ("Bearer ") with 401', async () => {
      const res = await fetch(`${baseUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ',
        },
        body: JSON.stringify(validSubscribePayload),
      });
      await assertUnauthorizedResponse(res);
    });

    it('2.5 should reject request with whitespace-only Bearer token ("Bearer   ") with 401', async () => {
      const res = await fetch(`${baseUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer    \r\n',
        },
        body: JSON.stringify(validSubscribePayload),
      });
      await assertUnauthorizedResponse(res);
    });

    it('2.6 should prioritize auth check even with empty body or non-JSON content', async () => {
      const res = await fetch(`${baseUrl}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      await assertUnauthorizedResponse(res, 'unauthorized');
    });
  });

  // ==========================================
  // Section 3: Token Forgery, Alg: none & Tampering
  // ==========================================
  describe('Adversarial Vectors: Token Forgery & Cryptographic Tampering', () => {
    it('3.1 should reject arbitrary high-entropy fake token', async () => {
      const fakeToken = 'Bearer abcdef0123456789deadbeefcafebabe9876543210';
      const res = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: fakeToken,
        },
        body: JSON.stringify({ to: 'victim@example.com', subject: 'Attack', text: 'Payload' }),
      });
      await assertUnauthorizedResponse(res);
    });

    it('3.2 should reject unsigned "alg: none" JWT bypass attempt', async () => {
      // Header: {"alg":"none","typ":"JWT"} -> eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0
      // Payload: {"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated","email":"admin@tattooshop.com"}
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          sub: '00000000-0000-0000-0000-000000000001',
          role: 'authenticated',
          aud: 'authenticated',
          email: 'admin@tattooshop.com',
          exp: Math.floor(Date.now() / 1000) + 3600,
        })
      ).toString('base64url');
      const algNoneToken = `Bearer ${header}.${payload}.`;

      const res = await fetch(`${baseUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: algNoneToken,
        },
        body: JSON.stringify({ tier: 'admin_bypass' }),
      });
      await assertUnauthorizedResponse(res);
    });

    it('3.3 should reject JWT with forged signature', async () => {
      // Valid-looking base64 header & payload, forged signature
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          sub: 'forged-user-id',
          role: 'service_role',
          email: 'attacker@evil.com',
          exp: Math.floor(Date.now() / 1000) + 7200,
        })
      ).toString('base64url');
      const forgedSig = Buffer.from('FAKE_UNVERIFIED_SIGNATURE_BITS').toString('base64url');
      const forgedToken = `Bearer ${header}.${payload}.${forgedSig}`;

      const res = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: forgedToken,
        },
        body: JSON.stringify({ to: 'test@example.com', subject: 'Forged', text: 'Attack' }),
      });
      await assertUnauthorizedResponse(res);
    });

    it('3.4 should reject non-Bearer auth schemes (Basic / Digest)', async () => {
      const basicAuth = `Basic ${Buffer.from('admin:password123').toString('base64')}`;
      const res = await fetch(`${baseUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: basicAuth,
        },
        body: JSON.stringify({ tier: 'vip' }),
      });
      await assertUnauthorizedResponse(res);
    });

    it('3.5 should reject oversized token (8KB) with 401 and handle large headers safely', async () => {
      // Within Node HTTP maxHeaderSize (16KB), token is passed to auth and rejected with 401
      const oversizedToken = `Bearer ${'A'.repeat(8192)}`;
      const res1 = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: oversizedToken,
        },
        body: JSON.stringify({ to: 'test@example.com', subject: 'Overflow', text: 'Attack' }),
      });
      await assertUnauthorizedResponse(res1);

      // Exceeding Node HTTP header limits (32KB), server responds with 431 without crashing
      const extremeToken = `Bearer ${'A'.repeat(32768)}`;
      const res2 = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: extremeToken,
        },
        body: JSON.stringify({ to: 'test@example.com', subject: 'Overflow', text: 'Attack' }),
      });
      assert.equal(res2.status, 431, 'Expected Node to reject extreme header with HTTP 431');
    });
  });

  // ==========================================
  // Section 4: Header Spoofing & Gateway Bypass Attempts
  // ==========================================
  describe('Adversarial Vectors: Header Spoofing & Injection Bypass', () => {
    it('4.1 should NOT bypass guard with spoofed x-user-id header', async () => {
      const res = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '00000000-0000-0000-0000-000000000001',
          'X-User-Id': '00000000-0000-0000-0000-000000000001',
        },
        body: JSON.stringify({ to: 'target@example.com', subject: 'Spoofed ID', text: 'Hello' }),
      });
      await assertUnauthorizedResponse(res, 'unauthorized');
    });

    it('4.2 should NOT bypass guard with spoofed x-user-role / x-role headers', async () => {
      const res = await fetch(`${baseUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
          'x-role': 'service_role',
          'x-consumer-username': 'superuser',
          'x-authenticated-user': 'admin',
        },
        body: JSON.stringify({ tier: 'artist_pro' }),
      });
      await assertUnauthorizedResponse(res, 'unauthorized');
    });

    it('4.3 should NOT bypass guard with spoofed x-forwarded-user or x-auth-user', async () => {
      const res = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-user': 'admin@tattooshop.com',
          'x-auth-user': 'admin',
        },
        body: JSON.stringify({ to: 'target@example.com', subject: 'Spoofed User', text: 'Hello' }),
      });
      await assertUnauthorizedResponse(res, 'unauthorized');
    });

    it('4.4 should reject SQL injection payload in Authorization header', async () => {
      const sqlInjectionToken = "Bearer ' OR '1'='1' -- ";
      const res = await fetch(`${baseUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: sqlInjectionToken,
        },
        body: JSON.stringify({ tier: 'artist_pro' }),
      });
      await assertUnauthorizedResponse(res);
    });

    it('4.5 should reject prototype pollution payload in Authorization header', async () => {
      const protoToken = 'Bearer {"__proto__":{"isAdmin":true}}';
      const res = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: protoToken,
        },
        body: JSON.stringify({ to: 'target@example.com', subject: 'Proto', text: 'Attack' }),
      });
      await assertUnauthorizedResponse(res);
    });
  });

  // ==========================================
  // Section 5: Revoked Token Invalidation Guard
  // ==========================================
  describe('Adversarial Vectors: Revoked Token Invalidation', () => {
    it('5.1 should immediately reject revoked token with "Session revoked" message on POST /mail', async () => {
      const revokedTokenString = 'revoked_token_test_session_12345';
      // Mark token as revoked in memory blacklist
      revokeToken(revokedTokenString);

      const res = await fetch(`${baseUrl}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${revokedTokenString}`,
        },
        body: JSON.stringify({ to: 'artist@example.com', subject: 'Revoked', text: 'Hello' }),
      });

      await assertUnauthorizedResponse(res, 'Session revoked');
    });

    it('5.2 should immediately reject revoked token with "Session revoked" message on POST /subscribe', async () => {
      const revokedTokenString = 'revoked_token_test_session_67890';
      revokeToken(revokedTokenString);

      const res = await fetch(`${baseUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${revokedTokenString}`,
        },
        body: JSON.stringify({ tier: 'artist_pro' }),
      });

      await assertUnauthorizedResponse(res, 'Session revoked');
    });
  });

  // ==========================================
  // Section 6: Additional Protected Routes (Boundary Check)
  // ==========================================
  describe('Boundary Check: Other Protected Routes for Guest Gating', () => {
    it('6.1 POST /usersubscription should strictly reject unauthenticated guest with 401', async () => {
      const res = await fetch(`${baseUrl}/usersubscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: 'sub_123' }),
      });
      await assertUnauthorizedResponse(res, 'unauthorized');
    });

    it('6.2 POST /agenda should strictly reject unauthenticated guest with 401', async () => {
      const res = await fetch(`${baseUrl}/agenda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Adversarial Tattoo Slot', date: '2026-12-01' }),
      });
      await assertUnauthorizedResponse(res, 'unauthorized');
    });
  });
});
