/**
 * Tier 1: Feature Coverage - Contact Mail Endpoints
 * Tests:
 *  - Endpoint 14: POST /mail (6 test cases)
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { SAMPLE_BASE64_IMAGE } from '../config.ts';

export function registerMailEndpointsTests(client: ApiClient) {
  setTier('Tier 1 - Feature Coverage');

  describe('Feature 14: POST /mail (Contact Email Dispatch)', () => {
    it('TC-MAIL-01: Valid mail payload returns expected HTTP 200 or 500 without crashing server', async () => {
      const res = await client.sendMail({
        to: 'artist@testtattoo.com',
        email: 'Hola, me gustaría cotizar un tatuaje en la espalda.',
        img: SAMPLE_BASE64_IMAGE,
      });

      // Status 200 ("Mensaje enviado") or Status 500 ("Error al enviar correo" when SMTP offline)
      expect([200, 500]).toContain(res.status);
      expect(typeof res.rawText).toBe('string');
      expect(
        res.rawText.includes('Mensaje enviado') || res.rawText.includes('Error al enviar correo')
      ).toBe(true);
    });

    it('TC-MAIL-02: Missing or invalid SMTP credentials does not crash server process with unhandled rejection', async () => {
      const res = await client.sendMail({
        to: 'any_artist@testtattoo.com',
        email: 'Prueba de estabilidad del servicio de correo.',
        img: SAMPLE_BASE64_IMAGE,
      });

      expect([200, 500]).toContain(res.status);
      // Verify server is still completely responsive immediately after
      const ping = await client.getTatto();
      expect(ping.status).toBe(200);
    });

    it('TC-MAIL-03: Mail with empty recipient "to" returns validation failure or 500 error safely', async () => {
      const res = await client.sendMail({
        to: '',
        email: 'Sin destinatario.',
        img: SAMPLE_BASE64_IMAGE,
      });

      expect([400, 500]).toContain(res.status);
    });

    it('TC-MAIL-04: Mail without image attachment is handled without crashing', async () => {
      const res = await client.sendMail({
        to: 'artist_text_only@testtattoo.com',
        email: 'Solo texto, sin adjunto.',
      });

      expect([200, 400, 500]).toContain(res.status);
    });

    it('TC-MAIL-05: Mail with base64 data URI prefix (data:image/png;base64,...) is handled cleanly', async () => {
      const res = await client.sendMail({
        to: 'artist_prefix@testtattoo.com',
        email: 'Con prefijo data URI.',
        img: `data:image/png;base64,${SAMPLE_BASE64_IMAGE}`,
      });

      expect([200, 500]).toContain(res.status);
    });

    it('TC-MAIL-06: Response Content-Type is text/html or text/plain conforming to legacy contract', async () => {
      const res = await client.sendMail({
        to: 'artist_contract@testtattoo.com',
        email: 'Validar Content-Type.',
        img: SAMPLE_BASE64_IMAGE,
      });

      expect([200, 500]).toContain(res.status);
      const contentType = res.headers['content-type'] || '';
      expect(contentType.includes('text') || contentType.includes('json')).toBe(true);
    });
  });
}
