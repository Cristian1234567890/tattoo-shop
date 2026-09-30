/**
 * Tier 2: Boundary & Corner Cases - Milestone 4
 * Verifies robust error resilience and edge cases:
 *   1. Phone formatting boundaries:
 *      - International codes (+57, +34, 00, +1, +52)
 *      - Local numbers (7-digit vs 8-digit)
 *      - Dashes, spaces, parentheses, symbols (+507 (6000)-1111!@#)
 *      - Null, undefined, empty, whitespace-only, symbol-only inputs
 *      - Number already with prefix (prevent double-prefixing)
 *      - Message encoding with special characters and accents
 *   2. Geolocation & Haversine boundaries:
 *      - Accented vs unaccented city names for 9+ cities (Bogotá, Medellín, Panamá, Colón, Chiriquí, etc.)
 *      - Case-insensitivity and whitespace trimming
 *      - Address substring extraction
 *      - Unknown cities falling back to DEFAULT_COORDINATES
 *      - Identical coordinates (0.0 km)
 *      - Antipodal points and North-South pole distances (~20,015 km)
 *      - NaN, null, and undefined coordinates handling without throwing
 *      - Marker jitter dispersion (< 0.05 deg delta)
 *   3. Missing / corrupt artist fields:
 *      - Null coordinates, missing data, missing styles
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { formatWhatsAppUrl, cleanPhoneDigits } from '../../frontend/src/utils/whatsapp.ts';
import {
  calculateDistanceKm,
  resolveArtistCoordinates,
  DEFAULT_COORDINATES,
  normalizeHubArtist,
} from '../../frontend/src/utils/geo.ts';

export function registerM4BoundaryCasesTests() {
  setTier('Tier 2 - Boundary & Corner Cases');

  // =========================================================================
  // Suite 1: Phone Formatting Boundaries & Corner Cases
  // =========================================================================
  describe('Boundary Cases: Phone Formatting & WhatsApp Generation', () => {
    it('TC-M4-BND-WA-01: Formats international Colombian mobile (+57 300-123-4567) to wa.me/573001234567', () => {
      expect(formatWhatsAppUrl('+57 300-123-4567')).toBe('https://wa.me/573001234567');
    });

    it('TC-M4-BND-WA-02: Formats Spanish mobile with leading 00 (0034 612 345 678) to wa.me/34612345678', () => {
      expect(formatWhatsAppUrl('0034 612 345 678')).toBe('https://wa.me/34612345678');
    });

    it('TC-M4-BND-WA-03: Formats US 10-digit number with plus (+1 (555) 234-5678) to wa.me/15552345678', () => {
      expect(formatWhatsAppUrl('+1 (555) 234-5678')).toBe('https://wa.me/15552345678');
    });

    it('TC-M4-BND-WA-04: Mexican number with defaultPrefix override (5512345678, defaultPrefix="52")', () => {
      expect(formatWhatsAppUrl('5512345678', '52')).toBe('https://wa.me/525512345678');
    });

    it('TC-M4-BND-WA-05: Local Panama 8-digit mobile (6000-1111) and 7-digit landline (260-1111) prepend 507', () => {
      expect(formatWhatsAppUrl('6000-1111')).toBe('https://wa.me/50760001111');
      expect(formatWhatsAppUrl('260-1111')).toBe('https://wa.me/5072601111');
    });

    it('TC-M4-BND-WA-06: Special characters and non-numeric symbols are stripped cleanly', () => {
      expect(formatWhatsAppUrl('+507 (6000)-1111!@#$%^&*')).toBe('https://wa.me/50760001111');
    });

    it('TC-M4-BND-WA-07: Prevents double-prefixing when number already contains country code without plus', () => {
      // 50760001111 already starts with 507, should not become 50750760001111
      expect(formatWhatsAppUrl('50760001111')).toBe('https://wa.me/50760001111');
    });

    it('TC-M4-BND-WA-08: Corrupt inputs (null, undefined, empty, spaces, only symbols) return empty string', () => {
      expect(formatWhatsAppUrl(null)).toBe('');
      expect(formatWhatsAppUrl(undefined)).toBe('');
      expect(formatWhatsAppUrl('')).toBe('');
      expect(formatWhatsAppUrl('       ')).toBe('');
      expect(formatWhatsAppUrl('++--==!@#')).toBe('');
    });

    it('TC-M4-BND-WA-09: Pre-filled message with Spanish accents and question marks is properly URL-encoded', () => {
      const url = formatWhatsAppUrl('+57 300 123 4567', '57', '¡Hola! ¿Cuánto cuesta un tatuaje?');
      expect(url).toBe('https://wa.me/573001234567?text=%C2%A1Hola!%20%C2%BFCu%C3%A1nto%20cuesta%20un%20tatuaje%3F');
    });
  });

  // =========================================================================
  // Suite 2: Geolocation & Haversine Boundaries
  // =========================================================================
  describe('Boundary Cases: Geolocation, Haversine Formula & Coordinate Resolution', () => {
    it('TC-M4-BND-GEO-01: Known distance: Panama City to David is 325.9 km (within ±2 km)', () => {
      const dist = calculateDistanceKm(8.9824, -79.5199, 8.4273, -82.4312);
      expect(Math.abs(dist - 325.9) < 2.0).toBe(true);
    });

    it('TC-M4-BND-GEO-02: Known distance: Bogotá to Medellín is 238.6 km (within ±2 km)', () => {
      const dist = calculateDistanceKm(4.7110, -74.0721, 6.2442, -75.5812);
      expect(Math.abs(dist - 238.6) < 2.0).toBe(true);
    });

    it('TC-M4-BND-GEO-03: Identical coordinates return exactly 0.0 km', () => {
      expect(calculateDistanceKm(8.9824, -79.5199, 8.9824, -79.5199)).toBe(0);
    });

    it('TC-M4-BND-GEO-04: Degenerate coordinates (NaN, undefined) return 0 without throwing runtime exceptions', () => {
      expect(calculateDistanceKm(NaN, -79.5199, 8.4273, -82.4312)).toBe(0);
      expect(calculateDistanceKm(8.9824, NaN, 8.4273, -82.4312)).toBe(0);
      expect(calculateDistanceKm(undefined as any, 0, 0, 0)).toBe(0);
    });

    it('TC-M4-BND-GEO-05: Antipodal points on equator produce approximately 20,015 km (half Earth circumference)', () => {
      const antipodalDist = calculateDistanceKm(0, 0, 0, 180);
      expect(Math.abs(antipodalDist - 20015.1) < 10.0).toBe(true);
    });

    it('TC-M4-BND-GEO-06: North Pole [90, 0] to South Pole [-90, 0] produces ~20,015 km', () => {
      const poleDist = calculateDistanceKm(90, 0, -90, 0);
      expect(Math.abs(poleDist - 20015.1) < 10.0).toBe(true);
    });

    it('TC-M4-BND-GEO-07: Diacritic-insensitive matching: 9+ accented cities match unaccented equivalents', () => {
      const cityPairs = [
        ['Bogotá', 'bogota'],
        ['Medellín', 'medellin'],
        ['Panamá', 'panama'],
        ['Colón', 'colon'],
        ['Chiriquí', 'chiriqui'],
        ['Arraiján', 'arraijan'],
        ['Chitré', 'chitre'],
        ['Penonomé', 'penonome'],
        ['México', 'mexico'],
      ];

      for (const [accented, plain] of cityPairs) {
        const c1 = resolveArtistCoordinates({ ciudad: accented }, 0);
        const c2 = resolveArtistCoordinates({ ciudad: plain }, 0);
        expect(c1[0]).toBe(c2[0]);
        expect(c1[1]).toBe(c2[1]);
      }
    });

    it('TC-M4-BND-GEO-08: Case-insensitivity and leading/trailing whitespace tolerance', () => {
      const c1 = resolveArtistCoordinates({ ciudad: '  mEdElLíN  ' }, 0);
      const c2 = resolveArtistCoordinates({ ciudad: 'medellin' }, 0);
      expect(c1[0]).toBe(c2[0]);
      expect(c1[1]).toBe(c2[1]);
    });

    it('TC-M4-BND-GEO-09: Resolves city from compound address string via substring search', () => {
      const coords = resolveArtistCoordinates({ direccion: 'Avenida Balboa, Bella Vista, Ciudad de Panamá' }, 0);
      expect(Math.abs(coords[0] - 8.9824) < 0.02).toBe(true);
      expect(Math.abs(coords[1] - (-79.5199)) < 0.02).toBe(true);
    });

    it('TC-M4-BND-GEO-10: Unknown, null, or empty artist defaults to DEFAULT_COORDINATES with deterministic jitter', () => {
      const coords = resolveArtistCoordinates({ ciudad: 'Atlantis' }, 0);
      expect(Math.abs(coords[0] - DEFAULT_COORDINATES[0]) < 0.05).toBe(true);
      expect(Math.abs(coords[1] - DEFAULT_COORDINATES[1]) < 0.05).toBe(true);
    });

    it('TC-M4-BND-GEO-11: Deterministic jitter separates co-located markers to prevent complete stacking', () => {
      const c0 = resolveArtistCoordinates({ ciudad: 'Atlantis' }, 0);
      const c1 = resolveArtistCoordinates({ ciudad: 'Atlantis' }, 1);
      const c2 = resolveArtistCoordinates({ ciudad: 'Atlantis' }, 2);
      expect(c0[0] !== c1[0] || c0[1] !== c1[1]).toBe(true);
      expect(c1[0] !== c2[0] || c1[1] !== c2[1]).toBe(true);
    });
  });

  // =========================================================================
  // Suite 3: Missing / Empty Artist Fields Normalization
  // =========================================================================
  describe('Boundary Cases: Missing & Null Artist Fields Normalization', () => {
    it('TC-M4-BND-ART-01: normalizeHubArtist safely populates missing fields without throwing', () => {
      const corruptArtist = {
        id: null,
        data: null,
        nombre: undefined,
        ciudad: null,
        whatsapp_number: undefined,
      };

      const normalized = normalizeHubArtist(corruptArtist, 5);
      expect(normalized.id).toBeDefined();
      expect(normalized.name).toBe('Tatuador Profesional');
      expect(normalized.city).toBe('Ciudad de Panamá');
      expect(normalized.whatsappNumber).toBe('');
      expect(typeof normalized.style).toBe('string');
    });
  });
}
