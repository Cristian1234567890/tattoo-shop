import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../src/app';
import { emailVerificationService } from '../src/services/email-verification.service';

describe('Email Verification & Availability Service Tests', () => {
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

  test('1. checkAvailability identifies invalid or already registered email', async () => {
    // Known existing user in Supabase
    const resultExisting = await emailVerificationService.checkAvailability({
      email: 'buglione2500@gmail.com',
    });
    assert.strictEqual(resultExisting.available, false);
    assert.strictEqual(resultExisting.field, 'email');
    assert.match(resultExisting.message || '', /ya está registrado/);

    // Fresh non-existent email
    const freshEmail = `test_unique_${Date.now()}@tattoohub.test`;
    const resultFresh = await emailVerificationService.checkAvailability({
      email: freshEmail,
    });
    assert.strictEqual(resultFresh.available, true);
  });

  test('2. sendOtp rejects invalid email and rejects existing email', async () => {
    // Empty email
    const emptyRes = await emailVerificationService.sendOtp('');
    assert.strictEqual(emptyRes.success, false);

    // Already registered email
    const existingRes = await emailVerificationService.sendOtp('buglione2500@gmail.com');
    assert.strictEqual(existingRes.success, false);
    assert.match(existingRes.message, /ya está registrado/);
  });

  test('3. sendOtp generates code and enforces 60-second cooldown', async () => {
    const testEmail = `avail_user_${Date.now()}@example.com`;
    const sendRes = await emailVerificationService.sendOtp(testEmail);
    assert.strictEqual(sendRes.success, true);
    assert.strictEqual(sendRes.cooldownRemaining, 60);

    // Immediate re-send attempt must be blocked by cooldown
    const secondRes = await emailVerificationService.sendOtp(testEmail);
    assert.strictEqual(secondRes.success, false);
    assert.match(secondRes.message, /espera \d+ segundos/);
  });

  test('4. verifyOtp validates master demo code (123456) and rejects wrong codes', async () => {
    const testEmail = `verify_user_${Date.now()}@example.com`;
    await emailVerificationService.sendOtp(testEmail);

    // Wrong code
    const wrongRes = await emailVerificationService.verifyOtp(testEmail, '999999');
    assert.strictEqual(wrongRes.success, false);
    assert.match(wrongRes.message, /Código incorrecto/);

    // Master test code
    const masterRes = await emailVerificationService.verifyOtp(testEmail, '123456');
    assert.strictEqual(masterRes.success, true);
  });

  test('5. verifyOtp enforces brute-force defense after 5 failed attempts', async () => {
    const bruteEmail = `brute_user_${Date.now()}@example.com`;
    await emailVerificationService.sendOtp(bruteEmail);

    for (let i = 0; i < 5; i++) {
      await emailVerificationService.verifyOtp(bruteEmail, '000000');
    }

    const lockedRes = await emailVerificationService.verifyOtp(bruteEmail, '000000');
    assert.strictEqual(lockedRes.success, false);
    assert.match(lockedRes.message, /límite de intentos fallidos/);
  });

  test('6. HTTP Endpoints: POST /check-availability, /send-email-otp, /verify-email-otp', async () => {
    // 6.1 Check availability
    const checkRes = await fetch(`${baseUrl}/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'buglione2500@gmail.com' }),
    });
    const checkData = await checkRes.json() as any;
    assert.strictEqual(checkRes.status, 200);
    assert.strictEqual(checkData.available, false);
    assert.strictEqual(checkData.field, 'email');

    // 6.2 Send OTP for available email
    const httpEmail = `http_user_${Date.now()}@example.com`;
    const sendRes = await fetch(`${baseUrl}/send-email-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: httpEmail }),
    });
    const sendData = await sendRes.json() as any;
    assert.strictEqual(sendRes.status, 200);
    assert.strictEqual(sendData.success, true);

    // 6.3 Verify OTP with master code
    const verifyRes = await fetch(`${baseUrl}/verify-email-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: httpEmail, code: '123456' }),
    });
    const verifyData = await verifyRes.json() as any;
    assert.strictEqual(verifyRes.status, 200);
    assert.strictEqual(verifyData.success, true);
  });
});
