import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { vonageService } from '../src/services/vonage.service';

describe('VonageService Unit & Security Tests', () => {
  beforeEach(() => {
    vonageService.clearAllOtps();
  });

  it('1. normalizePhone should clean non-digits and merge prefix + number', () => {
    const res1 = vonageService.normalizePhone('+507', '6123-4567');
    assert.equal(res1, '50761234567');

    const res2 = vonageService.normalizePhone('57', ' 300 123 4567 ');
    assert.equal(res2, '573001234567');

    const res3 = vonageService.normalizePhone('+1', '(555) 234-5678');
    assert.equal(res3, '15552345678');
  });

  it('2. generateOtpCode should generate exactly a 6-digit numeric string', () => {
    for (let i = 0; i < 20; i++) {
      const code = vonageService.generateOtpCode();
      assert.equal(code.length, 6);
      assert.ok(/^\d{6}$/.test(code), `Code must be 6 digits: ${code}`);
      const num = parseInt(code, 10);
      assert.ok(num >= 100000 && num <= 999999);
    }
  });

  it('3. sendOtp should reject phone numbers with invalid length', async () => {
    const shortRes = await vonageService.sendOtp('+507', '123');
    assert.equal(shortRes.success, false);
    assert.ok(shortRes.message.includes('inválido'));

    const emptyRes = await vonageService.sendOtp('+507', '');
    assert.equal(emptyRes.success, false);
  });

  it('4. sendOtp should generate code and enforce 60-second cooldown', async () => {
    const res1 = await vonageService.sendOtp('+507', '65551234');
    assert.equal(res1.success, true);

    const activeCode = vonageService.getActiveOtpForTesting('+507', '65551234');
    assert.ok(activeCode);
    assert.equal(activeCode?.length, 6);

    // Immediate second call should be blocked by cooldown
    const res2 = await vonageService.sendOtp('+507', '65551234');
    assert.equal(res2.success, false);
    assert.ok(res2.cooldownRemaining! > 0);
    assert.ok(res2.message.includes('espera'));
  });

  it('5. verifyOtp should validate the 6-digit code correctly', async () => {
    await vonageService.sendOtp('+507', '67778899');
    const validCode = vonageService.getActiveOtpForTesting('+507', '67778899')!;

    // Invalid format
    const formatRes = vonageService.verifyOtp('+507', '67778899', '123');
    assert.equal(formatRes.success, false);
    assert.ok(formatRes.message.includes('6 dígitos'));

    // Wrong code decrements attempts
    const wrongRes = vonageService.verifyOtp('+507', '67778899', '000000');
    assert.equal(wrongRes.success, false);
    assert.ok(wrongRes.message.includes('incorrecto'));
    assert.equal(wrongRes.attemptsRemaining, 4);

    // Correct code succeeds
    const correctRes = vonageService.verifyOtp('+507', '67778899', validCode);
    assert.equal(correctRes.success, true);
    assert.ok(correctRes.message.includes('exitosamente'));

    // Once used, the code cannot be reused (replay attack prevention)
    const replayRes = vonageService.verifyOtp('+507', '67778899', validCode);
    assert.equal(replayRes.success, false);
  });

  it('6. verifyOtp should invalidate code after 5 failed attempts (brute-force defense)', async () => {
    await vonageService.sendOtp('+507', '69990011');
    const validCode = vonageService.getActiveOtpForTesting('+507', '69990011')!;

    for (let i = 1; i <= 4; i++) {
      const res = vonageService.verifyOtp('+507', '69990011', '111111');
      assert.equal(res.success, false);
      assert.equal(res.attemptsRemaining, 5 - i);
    }

    // 5th failed attempt locks out the OTP
    const fifthRes = vonageService.verifyOtp('+507', '69990011', '111111');
    assert.equal(fifthRes.success, false);
    assert.ok(fifthRes.message.includes('superado') || fifthRes.message.includes('incorrecto'));

    // Even if valid code is entered on 6th try, it's invalidated
    const laterRes = vonageService.verifyOtp('+507', '69990011', validCode);
    assert.equal(laterRes.success, false);
  });
});
