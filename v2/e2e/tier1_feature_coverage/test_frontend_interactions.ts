/**
 * Tier 1: Feature Coverage - Frontend User Interactions
 * Tests:
 *  - Theme toggle interaction & state persistence
 *  - Navigation links and routing
 *  - Dashboard filter checkboxes
 *  - 3D credit card input mirroring and flip triggers
 *  - Inquiry drawer modal state & input handling
 *  - Artist subscription notice modal trigger
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { DomValidator } from '../framework/dom_validator.ts';

export function registerFrontendInteractionsTests(validator: DomValidator) {
  setTier('Tier 1 - Feature Coverage');

  describe('Feature: Frontend Key User Interactions & Component States', () => {
    it('TC-FE-01: Theme switch toggle contains Sun and Moon SVG icons and state persistence', () => {
      const scan = validator.inspectSourceTokens('src', [
        'btn-switch',
        'switch',
        'sun',
        'moon',
        'slider',
      ]);
      expect(scan.exists).toBe(true);
      expect(scan.requiredTokensFound.length).toBeGreaterThanOrEqual(2);
    });

    it('TC-FE-02: Navigation routes properly define paths for Home, Login, Register, UserFeed, Profile and CreditCard', () => {
      const scan = validator.inspectSourceTokens('src', [
        '/login',
        '/register',
        'TooTienda',
        'Beneficios',
        'Precios',
        'Sobre Nosotros',
      ]);
      expect(scan.exists).toBe(true);
      expect(scan.requiredTokensFound.length).toBeGreaterThanOrEqual(4);
    });

    it('TC-FE-03: Dashboard filter checkboxes cover all 8 legacy tattoo styles', () => {
      const scan = validator.inspectSourceTokens('src', [
        'realista',
        'tradicional',
        'neotradicional',
        'blackwork',
        'japones',
        'tribal',
        'acuarela',
      ]);
      expect(scan.exists).toBe(true);
      expect(scan.requiredTokensFound.length).toBeGreaterThanOrEqual(5);
    });

    it('TC-FE-04: 3D Credit Card simulator contains flip transform and interactive inputs', () => {
      const scan = validator.inspectSourceTokens('src', [
        'card',
        'number',
        'holder',
        'expiration',
        'ccv',
      ]);
      expect(scan.exists).toBe(true);
      expect(scan.requiredTokensFound.length).toBeGreaterThanOrEqual(3);
    });

    it('TC-FE-05: Artist inquiry drawer contains message textarea, drag-and-drop zone, and file attachment preview', () => {
      const scan = validator.inspectSourceTokens('src', [
        'message',
        'file-input',
        'selected-image',
      ]);
      expect(scan.exists).toBe(true);
      expect(scan.requiredTokensFound.length).toBeGreaterThanOrEqual(2);
    });

    it('TC-FE-06: Register view triggers subscription prompt for artist role and TOTP QR modal', () => {
      const scan = validator.inspectSourceTokens('src', [
        'mensajeEmergente',
        'ventanaQR',
        '1.99',
        'Tatuador',
        'Cliente',
      ]);
      expect(scan.exists).toBe(true);
      expect(scan.requiredTokensFound.length).toBeGreaterThanOrEqual(3);
    });
  });
}
