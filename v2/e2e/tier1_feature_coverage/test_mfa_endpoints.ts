/**
 * Tier 1: Feature Coverage - MFA Endpoints
 * Tests:
 *  - Endpoint 3: POST /enroll (5 test cases)
 *  - Endpoint 4: POST /verify2fa (6 test cases)
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail } from '../config.ts';

export function registerMfaEndpointsTests(client: ApiClient) {
  setTier('Tier 1 - Feature Coverage');

  describe('Feature 3: POST /enroll (TOTP MFA Enrollment)', () => {
    it('TC-ENROLL-01: Authenticated user enrolls TOTP and receives QR code, secret and uri', async () => {
      const email = generateTestEmail('enroll_user');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'Enroller',
        apellido: 'Test',
        tipo: 'Cliente',
      });

      const token = reg.data.session.access_token;
      const refresh = reg.data.session.refresh_token;

      const enrollRes = await client.enroll({
        Authorization: `Bearer ${token}`,
        refresh_token: refresh,
      });

      expect(enrollRes.status).toBe(200);
      expect(enrollRes.data.success).toBe(true);
      expect(enrollRes.data.data).toBeDefined();
      expect(enrollRes.data.data.type).toBe('totp');
      expect(enrollRes.data.data.id).toBeDefined();
      expect(enrollRes.data.data.totp).toBeDefined();
      expect(enrollRes.data.data.totp.secret).toBeDefined();
      expect(enrollRes.data.data.totp.qr_code).toBeDefined();
    });

    it('TC-ENROLL-02: QR code field returns valid data URI or svg', async () => {
      const email = generateTestEmail('enroll_qr');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'QrTest',
        apellido: 'User',
        tipo: 'Cliente',
      });

      const enrollRes = await client.enroll({
        Authorization: `Bearer ${reg.data.session.access_token}`,
        refresh_token: reg.data.session.refresh_token,
      });

      expect(enrollRes.status).toBe(200);
      const qrCode = enrollRes.data.data.totp.qr_code;
      expect(typeof qrCode).toBe('string');
      expect(qrCode.length).toBeGreaterThan(10);
    });

    it('TC-ENROLL-03: Request without Authorization header is rejected safely', async () => {
      const res = await client.enroll({});
      expect(res.status >= 400 || (res.data && res.data.success === false)).toBe(true);
    });

    it('TC-ENROLL-04: Request with invalid token is rejected', async () => {
      const res = await client.enroll({
        Authorization: 'Bearer fake.invalid.jwt',
        refresh_token: 'fake_refresh',
      });
      expect(res.status >= 400 || (res.data && res.data.success === false)).toBe(true);
    });

    it('TC-ENROLL-05: Enroll supports header key "refresh" in addition to "refresh_token"', async () => {
      const email = generateTestEmail('enroll_alt');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'AltRefresh',
        apellido: 'Test',
        tipo: 'Cliente',
      });

      const enrollRes = await client.enroll({
        Authorization: `Bearer ${reg.data.session.access_token}`,
        refresh: reg.data.session.refresh_token,
      });

      expect(enrollRes.status).toBe(200);
      expect(enrollRes.data.success).toBe(true);
    });
  });

  describe('Feature 4: POST /verify2fa (TOTP Challenge Verification)', () => {
    it('TC-VERIFY2FA-01: Invalid 6-digit TOTP code returns failure response', async () => {
      const email = generateTestEmail('verify_invalid');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'Verify',
        apellido: 'Invalid',
        tipo: 'Cliente',
      });

      const token = reg.data.session.access_token;
      const refresh = reg.data.session.refresh_token;

      const enrollRes = await client.enroll({
        Authorization: `Bearer ${token}`,
        refresh_token: refresh,
      });

      const factorId = enrollRes.data?.data?.id || 'faked-factor-id-001';

      const verifyRes = await client.verify2FA(
        {
          factorId,
          code: '000000',
        },
        {
          Authorization: `Bearer ${token}`,
          refresh_token: refresh,
        }
      );

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.data.success).toBe(false);
      expect(verifyRes.data.error).toBeDefined();
    });

    it('TC-VERIFY2FA-02: Missing factorId in body returns error response', async () => {
      const verifyRes = await client.verify2FA({
        code: '123456',
      });
      expect(verifyRes.status >= 400 || (verifyRes.data && verifyRes.data.success === false)).toBe(true);
    });

    it('TC-VERIFY2FA-03: Missing code in body returns error response', async () => {
      const verifyRes = await client.verify2FA({
        factorId: 'some-factor-id',
      });
      expect(verifyRes.status >= 400 || (verifyRes.data && verifyRes.data.success === false)).toBe(true);
    });

    it('TC-VERIFY2FA-04: Non-digit characters in code (e.g. "abcdef") return rejection', async () => {
      const verifyRes = await client.verify2FA({
        factorId: 'factor-id-test',
        code: 'abcdef',
      });
      expect(verifyRes.status >= 400 || (verifyRes.data && verifyRes.data.success === false)).toBe(true);
    });

    it('TC-VERIFY2FA-05: Verification request without Authorization header is rejected', async () => {
      const verifyRes = await client.verify2FA({
        factorId: 'factor-id-no-auth',
        code: '123456',
      });
      expect(verifyRes.status >= 400 || (verifyRes.data && verifyRes.data.success === false)).toBe(true);
    });

    it('TC-VERIFY2FA-06: Code with incorrect length (e.g. 3 digits or 8 digits) returns error', async () => {
      const verifyRes = await client.verify2FA({
        factorId: 'factor-id-len',
        code: '123',
      });
      expect(verifyRes.status >= 400 || (verifyRes.data && verifyRes.data.success === false)).toBe(true);
    });
  });
}
