/**
 * Tier 1: Feature Coverage - Milestone 4: Contact & WhatsApp Integration
 * Covers Features 8, 9, 10, 11, 12, 13 from PROJECT.md Feature Inventory:
 *   - Feature 8: Database migration 06_contact_whatsapp.sql
 *   - Feature 9: Backend contact sync & lookup GET /gettatto/:id
 *   - Feature 10: InternationalPhoneInput component
 *   - Feature 11: Dynamic WhatsApp URL generator (whatsapp.ts)
 *   - Feature 12: Dual-Mode ArtistProfilePage (Public view with WhatsApp button vs Edit view)
 *   - Feature 13: ArtistCard WhatsApp integration (id="whatsapp-btn")
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { DomValidator } from '../framework/dom_validator.ts';
import { formatWhatsAppUrl, cleanPhoneDigits } from '../../frontend/src/utils/whatsapp.ts';
import fs from 'node:fs';
import path from 'node:path';

export function registerM4ContactWhatsAppTests(validator: DomValidator) {
  setTier('Tier 1 - Feature Coverage');
  const frontendDir = validator.getFrontendRoot();
  const backendDir = path.resolve(frontendDir, '../backend');

  // =========================================================================
  // Feature 8 & 9: Database Migration 06 & Backend Services
  // =========================================================================
  describe('Features 8 & 9: Database Migration 06 & Backend Contact Sync (06_contact_whatsapp.sql)', () => {
    const migrationPath = path.join(backendDir, 'migrations/06_contact_whatsapp.sql');
    const userServicePath = path.join(backendDir, 'src/services/user.service.ts');
    const tattooRoutesPath = path.join(backendDir, 'src/routes/tattoo.routes.ts');
    const tattooServicePath = path.join(backendDir, 'src/services/tattoo.service.ts');

    it('TC-M4-DB-01: Migration file 06_contact_whatsapp.sql exists in backend/migrations/', () => {
      expect(fs.existsSync(migrationPath)).toBe(true);
    });

    it('TC-M4-DB-02: Migration adds country, city, phone_prefix, whatsapp_number to user_profiles', () => {
      const sql = fs.readFileSync(migrationPath, 'utf-8');
      expect(sql).toContain('user_profiles');
      expect(sql).toContain('country');
      expect(sql).toContain('city');
      expect(sql).toContain('phone_prefix');
      expect(sql).toContain('whatsapp_number');
    });

    it('TC-M4-DB-03: Migration creates performance indexes on country and city for fast regional queries', () => {
      const sql = fs.readFileSync(migrationPath, 'utf-8');
      expect(sql).toContain('idx_user_profiles_country');
      expect(sql).toContain('idx_user_profiles_city');
    });

    it('TC-M4-BACK-01: user.service.ts persists country, city, phone_prefix, whatsapp_number in updateProfile', () => {
      expect(fs.existsSync(userServicePath)).toBe(true);
      const content = fs.readFileSync(userServicePath, 'utf-8');
      expect(content).toContain('country');
      expect(content).toContain('city');
      expect(content).toContain('phone_prefix');
      expect(content).toContain('whatsapp_number');
    });

    it('TC-M4-BACK-02: tattoo.routes.ts declares GET /gettatto/:id endpoint', () => {
      expect(fs.existsSync(tattooRoutesPath)).toBe(true);
      const content = fs.readFileSync(tattooRoutesPath, 'utf-8');
      expect(content).toContain("'/gettatto/:id'");
    });

    it('TC-M4-BACK-03: tattoo.service.ts implements getTattoById method querying single artist', () => {
      expect(fs.existsSync(tattooServicePath)).toBe(true);
      const content = fs.readFileSync(tattooServicePath, 'utf-8');
      expect(content).toContain('getTattoById');
      expect(content).toContain('id');
    });
  });

  // =========================================================================
  // Feature 10: InternationalPhoneInput Component
  // =========================================================================
  describe('Feature 10: InternationalPhoneInput Component (InternationalPhoneInput.tsx)', () => {
    const phoneInputPath = path.join(frontendDir, 'src/components/common/InternationalPhoneInput.tsx');

    it('TC-M4-PHONE-01: Component file exists at src/components/common/InternationalPhoneInput.tsx', () => {
      expect(fs.existsSync(phoneInputPath)).toBe(true);
    });

    it('TC-M4-PHONE-02: Exposes country prefix <select> with aria-label="Código de país"', () => {
      const content = fs.readFileSync(phoneInputPath, 'utf-8');
      expect(content).toContain('<select');
      expect(content).toContain('aria-label="Código de país"');
    });

    it('TC-M4-PHONE-03: Dropdown includes Latin American & European dial codes (+507, +57, +52, +1, +34)', () => {
      const content = fs.readFileSync(phoneInputPath, 'utf-8');
      expect(content).toContain('+507'); // Panama
      expect(content).toContain('+57');  // Colombia
      expect(content).toContain('+52');  // Mexico
      expect(content).toContain('+1');   // USA
      expect(content).toContain('+34');  // Spain
    });

    it('TC-M4-PHONE-04: Renders input type="tel" preserving default id="phone"', () => {
      const content = fs.readFileSync(phoneInputPath, 'utf-8');
      expect(content).toContain('type="tel"');
      expect(content).toContain('id = \'phone\'');
    });

    it('TC-M4-PHONE-05: onChange callback emits prefix, nationalNumber, and combined fullE164', () => {
      const content = fs.readFileSync(phoneInputPath, 'utf-8');
      expect(content).toContain('onChange: (prefix: string, nationalNumber: string, fullE164: string) => void');
      expect(content).toContain('cleanNumber');
    });
  });

  // =========================================================================
  // Feature 11: Dynamic WhatsApp URL Generator (whatsapp.ts)
  // =========================================================================
  describe('Feature 11: Dynamic WhatsApp URL Generator (whatsapp.ts)', () => {
    it('TC-M4-WA-01: cleanPhoneDigits strips non-numeric characters and removes leading 00', () => {
      expect(cleanPhoneDigits('+507 6000-1111')).toBe('50760001111');
      expect(cleanPhoneDigits('0034 612 345 678')).toBe('34612345678');
      expect(cleanPhoneDigits('')).toBe('');
      expect(cleanPhoneDigits(null)).toBe('');
      expect(cleanPhoneDigits(undefined)).toBe('');
    });

    it('TC-M4-WA-02: formatWhatsAppUrl generates standard https://wa.me/<digits> URL', () => {
      const url = formatWhatsAppUrl('+507 6000-1111');
      expect(url).toBe('https://wa.me/50760001111');
      expect(/^https:\/\/wa\.me\/\d+$/.test(url)).toBe(true);
    });

    it('TC-M4-WA-03: formatWhatsAppUrl prepends defaultPrefix 507 to 8-digit national number', () => {
      const url = formatWhatsAppUrl('60001111');
      expect(url).toBe('https://wa.me/50760001111');
    });

    it('TC-M4-WA-04: formatWhatsAppUrl handles international numbers with foreign prefixes (+57, +34, +1)', () => {
      expect(formatWhatsAppUrl('+57 300 123 4567')).toBe('https://wa.me/573001234567');
      expect(formatWhatsAppUrl('+34 612 345 678')).toBe('https://wa.me/34612345678');
      expect(formatWhatsAppUrl('+1 555 123 4567')).toBe('https://wa.me/15551234567');
    });

    it('TC-M4-WA-05: formatWhatsAppUrl supports URL-encoded pre-filled message in query string', () => {
      const url = formatWhatsAppUrl('+507 6000-1111', '507', 'Hola! Cotización');
      expect(url).toBe('https://wa.me/50760001111?text=Hola!%20Cotizaci%C3%B3n');
    });

    it('TC-M4-WA-06: formatWhatsAppUrl returns empty string for empty, null, or symbol-only inputs', () => {
      expect(formatWhatsAppUrl('')).toBe('');
      expect(formatWhatsAppUrl(null)).toBe('');
      expect(formatWhatsAppUrl(undefined)).toBe('');
      expect(formatWhatsAppUrl('   ')).toBe('');
      expect(formatWhatsAppUrl('++--==')).toBe('');
    });
  });

  // =========================================================================
  // Feature 12 & 13: Dual-Mode ArtistProfilePage & ArtistCard WhatsApp Button
  // =========================================================================
  describe('Features 12 & 13: Dual-Mode ArtistProfilePage & ArtistCard WhatsApp Integration', () => {
    const profilePagePath = path.join(frontendDir, 'src/pages/ArtistProfilePage.tsx');
    const artistCardPath = path.join(frontendDir, 'src/components/dashboard/ArtistCard.tsx');

    it('TC-M4-PROF-01: ArtistProfilePage.tsx exists and imports formatWhatsAppUrl', () => {
      expect(fs.existsSync(profilePagePath)).toBe(true);
      const content = fs.readFileSync(profilePagePath, 'utf-8');
      expect(content).toContain("import { formatWhatsAppUrl } from '../utils/whatsapp';");
    });

    it('TC-M4-PROF-02: ArtistProfilePage.tsx differentiates public view (/artist/:id) vs edit view', () => {
      const content = fs.readFileSync(profilePagePath, 'utf-8');
      expect(content).toContain('useParams<{ id?: string }>()');
      expect(content).toContain('isPublicView');
    });

    it('TC-M4-PROF-03: In public view, ArtistProfilePage renders prominent WhatsApp button with id="whatsapp-btn"', () => {
      const content = fs.readFileSync(profilePagePath, 'utf-8');
      expect(content).toContain('id="whatsapp-btn"');
      expect(content).toContain('href={waUrl}');
      expect(content).toContain('target="_blank"');
      expect(content).toContain('rel="noopener noreferrer"');
    });

    it('TC-M4-PROF-04: In edit view, ArtistProfilePage embeds InternationalPhoneInput component', () => {
      const content = fs.readFileSync(profilePagePath, 'utf-8');
      expect(content).toContain('<InternationalPhoneInput');
      expect(content).toContain('phone_prefix');
      expect(content).toContain('whatsapp_number');
    });

    it('TC-M4-CARD-01: ArtistCard.tsx renders direct WhatsApp button with id="whatsapp-btn"', () => {
      expect(fs.existsSync(artistCardPath)).toBe(true);
      const content = fs.readFileSync(artistCardPath, 'utf-8');
      expect(content).toContain('id="whatsapp-btn"');
    });

    it('TC-M4-CARD-02: ArtistCard.tsx formats WhatsApp URL using formatWhatsAppUrl and opens in safe new tab', () => {
      const content = fs.readFileSync(artistCardPath, 'utf-8');
      expect(content).toContain('formatWhatsAppUrl');
      expect(content).toContain('target="_blank"');
      expect(content).toContain('rel="noopener noreferrer"');
    });

    it('TC-M4-CARD-03: ArtistCard.tsx conditionally renders WhatsApp button when telefono or whatsapp_number is present', () => {
      const content = fs.readFileSync(artistCardPath, 'utf-8');
      expect(content).toContain('cardData.telefono || cardData.whatsapp_number');
      expect(content).toContain('id="whatsapp-btn"');
    });
  });
}
