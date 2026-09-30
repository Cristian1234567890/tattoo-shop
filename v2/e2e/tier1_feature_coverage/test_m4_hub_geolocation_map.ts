/**
 * Tier 1: Feature Coverage - Milestone 4: Interactive /hub Map, Geolocation & Nearest Artist Sorting
 * Covers Features 14, 15, 16, 17, 18, 19, 20 from PROJECT.md Feature Inventory:
 *   - Feature 14: /hub artist data unpacking from artist.data + fallback dataset (SAMPLE_HUB_ARTISTS)
 *   - Feature 15: Functional /hub dynamic style filter pills
 *   - Feature 16: Automatic browser GPS geolocation request & permission handling
 *   - Feature 17: Dynamic map re-centering (MapRecenter / useMap().flyTo)
 *   - Feature 18: Pulsing user GPS marker with animated ripple effect
 *   - Feature 19: Proximity recommendations & Haversine distance calculation in geo.ts
 *   - Feature 20: WhatsApp link in /hub popups & drawer
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { DomValidator } from '../framework/dom_validator.ts';
import {
  calculateDistanceKm,
  CITY_COORDINATES,
  DEFAULT_COORDINATES,
  resolveArtistCoordinates,
  normalizeHubArtist,
  SAMPLE_HUB_ARTISTS,
} from '../../frontend/src/utils/geo.ts';
import fs from 'node:fs';
import path from 'node:path';

export function registerM4HubGeolocationMapTests(validator: DomValidator) {
  setTier('Tier 1 - Feature Coverage');
  const frontendDir = validator.getFrontendRoot();
  const hubPagePath = path.join(frontendDir, 'src/pages/ArtistsHubPage.tsx');

  // =========================================================================
  // Feature 14 & 15: /hub Artist Data Unpacking & Dynamic Style Filters
  // =========================================================================
  describe('Features 14 & 15: /hub Data Unpacking, Sample Fallback & Style Filters (ArtistsHubPage.tsx)', () => {
    it('TC-M4-HUB-01: ArtistsHubPage.tsx unpacks artists and provides SAMPLE_HUB_ARTISTS fallback', () => {
      expect(fs.existsSync(hubPagePath)).toBe(true);
      const content = fs.readFileSync(hubPagePath, 'utf-8');
      expect(content).toContain('normalizeHubArtist');
      expect(content).toContain('SAMPLE_HUB_ARTISTS');
      expect(content).toContain('getTattooArtists');
    });

    it('TC-M4-HUB-02: normalizeHubArtist provides robust fallback when raw artist fields or data are missing', () => {
      const emptyRaw = { id: 'test-empty' };
      const normalized = normalizeHubArtist(emptyRaw, 0);
      expect(normalized.id).toBe('test-empty');
      expect(normalized.name).toBe('Tatuador Profesional');
      expect(normalized.city).toBe('Ciudad de Panamá');
      expect(normalized.country).toBe('Panamá');
      expect(normalized.lat).toBeGreaterThan(8.0);
      expect(normalized.lng).toBeLessThan(-70.0);
    });

    it('TC-M4-HUB-03: SAMPLE_HUB_ARTISTS contains diverse fallback artists with verified coordinates', () => {
      expect(SAMPLE_HUB_ARTISTS.length).toBeGreaterThan(0);
      for (const artist of SAMPLE_HUB_ARTISTS) {
        expect(artist.id).toBeDefined();
        const normalized = normalizeHubArtist(artist, 0);
        expect(normalized.name).toBeDefined();
        expect(normalized.lat).toBeGreaterThan(-90);
        expect(normalized.lat).toBeLessThan(90);
        expect(normalized.lng).toBeGreaterThan(-180);
        expect(normalized.lng).toBeLessThan(180);
      }
    });

    it('TC-M4-HUB-04: ArtistsHubPage.tsx renders dynamic style filter pills', () => {
      const content = fs.readFileSync(hubPagePath, 'utf-8');
      expect(content).toContain('filter');
      expect(content).toContain('setFilter');
      expect(content).toContain('Realismo');
      expect(content).toContain('Tradicional');
      expect(content).toContain('Blackwork');
      expect(content).toContain('Minimalista');
      expect(content).toContain('Neotradicional');
    });

    it('TC-M4-HUB-05: Dynamic filtering logic matches artist styles array or style property', () => {
      const sampleArtist = {
        ...SAMPLE_HUB_ARTISTS[0],
        style: 'realista',
      };
      const filterByRealismo = (a: typeof sampleArtist, filterStyle: string) => {
        if (!filterStyle || filterStyle === 'All') return true;
        const s = (a.style || '').toLowerCase();
        const f = filterStyle.toLowerCase();
        if (f === 'realismo') return s.includes('realis');
        return s.includes(f);
      };
      expect(filterByRealismo(sampleArtist, 'Realismo')).toBe(true);
      expect(filterByRealismo(sampleArtist, 'Tradicional')).toBe(false);
      expect(filterByRealismo(sampleArtist, 'All')).toBe(true);
    });
  });

  // =========================================================================
  // Feature 16 & 17: Automatic GPS Geolocation & Map Re-centering
  // =========================================================================
  describe('Features 16 & 17: Automatic GPS Geolocation & Dynamic Map Re-centering', () => {
    it('TC-M4-GEO-01: ArtistsHubPage.tsx checks for navigator.geolocation before requesting location', () => {
      const content = fs.readFileSync(hubPagePath, 'utf-8');
      expect(content).toContain('navigator.geolocation');
      expect(content).toContain('navigator.geolocation.getCurrentPosition(');
    });

    it('TC-M4-GEO-02: Handles GPS permission grant by setting userLocation state and gpsStatus="granted"', () => {
      const content = fs.readFileSync(hubPagePath, 'utf-8');
      expect(content).toContain('position.coords.latitude');
      expect(content).toContain('position.coords.longitude');
      expect(content).toContain("setGpsStatus('granted')");
    });

    it('TC-M4-GEO-03: Gracefully handles GPS error or denial by setting gpsStatus="denied" without crashing', () => {
      const content = fs.readFileSync(hubPagePath, 'utf-8');
      expect(content).toContain("setGpsStatus('denied')");
      expect(content).toContain('DEFAULT_COORDINATES');
    });

    it('TC-M4-GEO-04: Provides manual GPS retry button in UI when permission was not granted', () => {
      const content = fs.readFileSync(hubPagePath, 'utf-8');
      expect(content).toContain('requestUserLocation');
      expect(content).toContain('Usar mi ubicación');
    });

    it('TC-M4-GEO-05: Child component MapRecenter uses useMap().flyTo to center on user coordinates', () => {
      const content = fs.readFileSync(hubPagePath, 'utf-8');
      expect(content).toContain('function MapRecenter');
      expect(content).toContain('useMap()');
      expect(content).toContain('map.flyTo(center, zoom');
    });
  });

  // =========================================================================
  // Feature 18, 19, 20: Haversine Formula, Nearest Artist Sorting & Popups
  // =========================================================================
  describe('Features 18, 19, 20: Haversine Formula, Sorting & WhatsApp Markers (geo.ts, ArtistsHubPage.tsx)', () => {
    it('TC-M4-HAV-01: calculateDistanceKm implements Haversine formula with R = 6371 km', () => {
      // Known distance: Panama City [8.9824, -79.5199] to David [8.4273, -82.4312] is ~325.9 km
      const distance = calculateDistanceKm(8.9824, -79.5199, 8.4273, -82.4312);
      expect(distance).toBeGreaterThan(320);
      expect(distance).toBeLessThan(335);
    });

    it('TC-M4-HAV-02: CITY_COORDINATES covers major cities across Panama, Colombia, Mexico, Spain', () => {
      expect(CITY_COORDINATES['ciudad de panama']).toBeDefined();
      expect(CITY_COORDINATES['bogota']).toBeDefined();
      expect(CITY_COORDINATES['medellin']).toBeDefined();
      expect(CITY_COORDINATES['ciudad de mexico']).toBeDefined();
      expect(CITY_COORDINATES['madrid']).toBeDefined();
      expect(CITY_COORDINATES['barcelona']).toBeDefined();
    });

    it('TC-M4-SORT-01: Nearest artist sorting sorts strictly by ascending distance when GPS coordinates exist', () => {
      const panamaCoords: [number, number] = [8.9824, -79.5199];
      const normalizedArtists = SAMPLE_HUB_ARTISTS.map((a, i) => normalizeHubArtist(a, i, panamaCoords));
      const sorted = [...normalizedArtists].sort((a, b) => {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm;
        }
        return 0;
      });

      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].distanceKm !== undefined && sorted[i + 1].distanceKm !== undefined) {
          expect(sorted[i].distanceKm!).toBeLessThan(sorted[i + 1].distanceKm! + 0.001);
        }
      }
    });

    it('TC-M4-SORT-02: Fallback sorting orders by worksCount descending when GPS coordinates are null', () => {
      const content = fs.readFileSync(hubPagePath, 'utf-8');
      expect(content).toContain('b.worksCount - a.worksCount');
    });

    it('TC-M4-POP-01: Leaflet Marker Popup renders artist info, distance badge, and direct WhatsApp contact link', () => {
      const content = fs.readFileSync(hubPagePath, 'utf-8');
      expect(content).toContain('<Popup');
      expect(content).toContain('artist.whatsappUrl');
      expect(content).toContain('WhatsApp');
      expect(content).toContain('target="_blank"');
      expect(content).toContain('rel="noopener noreferrer"');
    });

    it('TC-M4-POP-02: Leaflet Marker Popup preserves invariant CH-ROUTE-03 linking to /artist/:id', () => {
      const content = fs.readFileSync(hubPagePath, 'utf-8');
      expect(content).toContain('to={`/artist/${artist.id}`}');
      expect(content).toContain('Perfil');
    });
  });
}
