import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateAge, AuthService } from '../src/services/auth.service';
import { renderMailTemplate } from '../src/templates/mail.template';

describe('TH-7 & TH-11: Security, Legal & DevOps Hardening Tests', () => {

  describe('1. Mathematical Age Verification (calculateAge)', () => {
    it('should return -1 for invalid or empty dates', () => {
      assert.strictEqual(calculateAge(''), -1);
      assert.strictEqual(calculateAge('not-a-date'), -1);
      assert.strictEqual(calculateAge(null as any), -1);
    });

    it('should accurately calculate age for adults', () => {
      const today = new Date();
      // Person born exactly 20 years ago today
      const birthDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
      const dateStr = birthDate.toISOString().split('T')[0];
      assert.strictEqual(calculateAge(dateStr), 20);
    });

    it('should accurately detect minors (under 18)', () => {
      const today = new Date();
      // Person born 17 years ago
      const birthDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
      const dateStr = birthDate.toISOString().split('T')[0];
      const age = calculateAge(dateStr);
      assert.strictEqual(age, 17);
      assert.ok(age < 18, 'Age must be strictly under 18');
    });

    it('should handle upcoming birthday this year correctly (not yet 18)', () => {
      const today = new Date();
      // Born 18 years ago, but next month
      const nextMonth = (today.getMonth() + 1) % 12;
      const year = nextMonth === 0 ? today.getFullYear() - 17 : today.getFullYear() - 18;
      const birthDate = new Date(year, nextMonth, 15);
      const dateStr = birthDate.toISOString().split('T')[0];
      const age = calculateAge(dateStr);
      // Since birthday is in next month, they are not yet 18 (either 17)
      assert.ok(age < 18, 'Person with birthday next month should not yet have turned 18');
    });
  });

  describe('2. AuthService.signUp 18+ COPPA Rejection', () => {
    const authService = new AuthService();

    it('should reject registration if birthdate indicates a minor under 18', async () => {
      const today = new Date();
      const minorDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate())
        .toISOString()
        .split('T')[0];

      const res = await authService.signUp({
        email: 'minor_test@example.com',
        password: 'password123',
        nombre: 'Menor',
        apellido: 'Test',
        birthdate: minorDate,
        legal_accepted: true,
      });

      assert.strictEqual(res.success, false);
      assert.ok(res.error?.message?.includes('18 años') || res.error?.message?.includes('COPPA'));
    });

    it('should reject registration if edad is explicitly below 18', async () => {
      const res = await authService.signUp({
        email: 'minor_edad@example.com',
        password: 'password123',
        nombre: 'Menor',
        apellido: 'Edad',
        edad: 16,
        legal_accepted: true,
      });

      assert.strictEqual(res.success, false);
      assert.ok(res.error?.message?.includes('18 años'));
    });

    it('should reject registration if legal terms are rejected', async () => {
      const res = await authService.signUp({
        email: 'no_terms@example.com',
        password: 'password123',
        nombre: 'NoTerms',
        apellido: 'User',
        edad: 25,
        legal_accepted: false,
      });

      assert.strictEqual(res.success, false);
      assert.ok(res.error?.message?.includes('Términos y Condiciones'));
    });
  });

  describe('3. CAN-SPAM Compliance & Tattoo Hub Branding in Emails', () => {
    it('should contain Tattoo Hub branding, physical address and unsubscribe notice', () => {
      const html = renderMailTemplate('Hola me gustaria cotizar un tatuaje minimalista', '');
      
      // Branding
      assert.ok(html.includes('TATTOO HUB'), 'Email must feature Tattoo Hub branding');
      assert.ok(!html.includes('TooTienda'), 'Email must not contain obsolete TooTienda branding');
      
      // CAN-SPAM requirements: Physical postal address
      assert.ok(html.includes('Calle 50, PH Plaza Global'), 'Email must contain valid physical address');
      assert.ok(html.includes('Ciudad de Panamá'), 'Email must state physical city/country');
      
      // CAN-SPAM requirements: Explanatory note & Opt-out / Privacy contact
      assert.ok(html.includes('privacy@tattoohub.art'), 'Email must contain privacy contact link');
      assert.ok(html.includes('CAN-SPAM'), 'Email footer must confirm CAN-SPAM compliance');
    });
  });

  describe('4. HTTP Endpoint Security & Rate Limiting (TH-11)', () => {
    let server: any;
    let baseUrl: string;

    it('should boot server and enforce rate limiting on repeated auth requests', async () => {
      const { app } = await import('../src/app');
      await new Promise<void>((resolve) => {
        server = app.listen(0, () => {
          const addr = server.address() as { port: number };
          baseUrl = `http://127.0.0.1:${addr.port}`;
          resolve();
        });
      });

      try {
        // Fire 22 requests to /login to trigger the 20-req limit
        let triggered429 = false;
        let lastResponseStatus = 200;
        let lastResponseBody: any = null;

        for (let i = 0; i < 22; i++) {
          const res = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-test-rate-limit': 'true',
            },
            body: JSON.stringify({ email: 'test@example.com', password: 'badpassword' }),
          });
          lastResponseStatus = res.status;
          if (res.status === 429) {
            triggered429 = true;
            lastResponseBody = await res.json();
            break;
          }
        }

        assert.strictEqual(triggered429, true, 'Rate limiter must trigger HTTP 429 after 20 attempts');
        assert.ok(
          lastResponseBody?.error?.message?.includes('Demasiados intentos'),
          'Rate limit message must inform user in Spanish'
        );
      } finally {
        if (server) {
          await new Promise<void>((resolve) => server.close(() => resolve()));
        }
      }
    });
  });
});
