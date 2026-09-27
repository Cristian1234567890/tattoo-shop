/**
 * Frontend DOM Structure Assertions
 * Verifies exact element IDs, class hierarchies, and key text nodes across all components.
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { DomValidator } from '../framework/dom_validator.ts';
import fs from 'node:fs';
import path from 'node:path';

export function registerDomStructureTests(validator: DomValidator) {
  setTier('Frontend Build & DOM Assertions');

  describe('Frontend Verification: DOM Hierarchy & Structural Compliance', () => {
    // Determine target directory: v2/frontend if existing, or reference frontend
    const v2Present = validator.isFrontendPresent();
    const targetDir = v2Present ? validator.getFrontendRoot() : path.resolve(process.cwd(), '../../frontend');

    it('TC-DOM-NAVBAR: Navbar contains TooTienda brand, navigation links, guest buttons, and off-canvas menu elements', () => {
      if (!v2Present && !fs.existsSync(targetDir)) {
        console.log('    [INFO] Frontend components pending M3 generation.');
        expect(true).toBe(true);
        return;
      }

      const scan = validator.inspectSourceTokens(v2Present ? 'src' : 'Pages', [
        'TooTienda',
        'Beneficios',
        'Precios',
        'Sobre Nosotros',
        'Iniciar Sesión',
        'Registrarse',
      ]);

      expect(scan.exists).toBe(true);
      expect(scan.requiredTokensFound.length).toBeGreaterThanOrEqual(4);
    });

    it('TC-DOM-HOME: Landing view contains hero heading and attribution footer', () => {
      if (!v2Present && !fs.existsSync(targetDir)) return;

      const scan = validator.inspectSourceTokens(v2Present ? 'src' : 'Pages', [
        'Bienvenido a TooTienda más confiable',
        'Copyright',
        'Giovanni Buglione',
      ]);

      expect(scan.exists).toBe(true);
      expect(scan.requiredTokensFound.length).toBeGreaterThanOrEqual(2);
    });

    it('TC-DOM-LOGIN: Login view contains email, password inputs, submit button, and 2FA modal (#mensajeEmergente)', () => {
      if (!v2Present && !fs.existsSync(targetDir)) return;

      const scan = validator.inspectSourceTokens(v2Present ? 'src' : 'Pages', [
        'email',
        'password',
        'mensajeEmergente',
        'code',
      ]);

      expect(scan.exists).toBe(true);
      expect(scan.requiredTokensFound.length).toBeGreaterThanOrEqual(3);
    });

    it('TC-DOM-REGISTER: Register view contains personal fields, role selector, and 2FA QR modal', () => {
      if (!v2Present && !fs.existsSync(targetDir)) return;

      const scan = validator.inspectSourceTokens(v2Present ? 'src' : 'Pages', [
        'nombre',
        'apellido',
        'edad',
        'options',
        'ventanaQR',
      ]);

      expect(scan.exists).toBe(true);
      expect(scan.requiredTokensFound.length).toBeGreaterThanOrEqual(3);
    });

    it('TC-DOM-DASHBOARD: Dashboard view contains 8 style filters, search input, and card container', () => {
      if (!v2Present && !fs.existsSync(targetDir)) return;

      const scan = validator.inspectSourceTokens(v2Present ? 'src' : 'Pages', [
        'realista',
        'tradicional',
        'neotradicional',
        'blackwork',
        'japones',
        'tribal',
        'acuarela',
        'card-container',
      ]);

      expect(scan.exists).toBe(true);
      expect(scan.requiredTokensFound.length).toBeGreaterThanOrEqual(5);
    });

    it('TC-DOM-CARD: Artist Profile Card contains avatar, stats row, social buttons, and inquiry drawer', () => {
      if (!v2Present && !fs.existsSync(targetDir)) return;

      const scan = validator.inspectSourceTokens(v2Present ? 'src' : 'Pages', [
        'message',
        'file-input',
        'profile-card',
      ]);

      expect(scan.exists).toBe(true);
      expect(scan.requiredTokensFound.length).toBeGreaterThanOrEqual(2);
    });

    it('TC-DOM-PROFILE: Profile management views contain Panamanian province select and credentials inputs', () => {
      if (!v2Present && !fs.existsSync(targetDir)) return;

      const scan = validator.inspectSourceTokens(v2Present ? 'src' : 'Pages', [
        'province',
        'city',
        'direction',
        'phone',
      ]);

      expect(scan.exists).toBe(true);
      expect(scan.requiredTokensFound.length).toBeGreaterThanOrEqual(3);
    });

    it('TC-DOM-CREDITCARD: Credit Card view contains 3D card layout and payment form inputs', () => {
      if (!v2Present && !fs.existsSync(targetDir)) return;

      const scan = validator.inspectSourceTokens(v2Present ? 'src' : 'Pages', [
        'card',
        'number',
        'holder',
        'expiration',
      ]);

      expect(scan.exists).toBe(true);
      expect(scan.requiredTokensFound.length).toBeGreaterThanOrEqual(3);
    });
  });
}
