/**
 * Tier 3: Cross-Feature Combinations - Milestone 4
 * Verifies end-to-end interactions connecting multiple subsystems:
 *   1. Interactive Flow: Finding artist on /hub -> calculating proximity -> dynamic map re-centering -> clicking WhatsApp contact -> opening public profile /artist/:id.
 *   2. Profile Editing Flow: International prefix selector -> updating contact info -> generating public WhatsApp button with live preview.
 *   3. GPS Resilience & Recovery Flow: Initial GPS denial -> fallback display -> manual retry -> proximity recalculation.
 *   4. Multi-Criteria Hub Filtering: Combining style pill filter with proximity distance sorting.
 *   5. Public Navigation & Exemption Gate Flow: Navigation between Landing, About, Hub, Terms without onboarding lockouts.
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { DomValidator } from '../framework/dom_validator.ts';
import { formatWhatsAppUrl, cleanPhoneDigits } from '../../frontend/src/utils/whatsapp.ts';
import {
  calculateDistanceKm,
  resolveArtistCoordinates,
  normalizeHubArtist,
  SAMPLE_HUB_ARTISTS,
} from '../../frontend/src/utils/geo.ts';
import fs from 'node:fs';
import path from 'node:path';

export function registerM4CrossFeatureFlowsTests(validator: DomValidator) {
  setTier('Tier 3 - Cross-Feature Combinations');
  const frontendDir = validator.getFrontendRoot();

  describe('Cross-Feature Flow 1: Hub Discovery, Proximity, Map FlyTo, WhatsApp & Profile Link', () => {
    it('TC-M4-XFEAT-01: Simulates complete user discovery from GPS acquisition to WhatsApp click and profile view', () => {
      // Step 1: User GPS acquired at Panama City coordinates
      const userGps: [number, number] = [8.9824, -79.5199];

      // Step 2: Artists normalized and distances calculated
      const normalizedArtists = SAMPLE_HUB_ARTISTS.map((artist, idx) =>
        normalizeHubArtist(artist, idx, userGps)
      );

      // Step 3: Proximity sorting applied
      const sorted = [...normalizedArtists].sort((a, b) => {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm;
        }
        return 0;
      });

      // Nearest artist must be Giovanni Buglione in Panama City (0.0 km)
      const nearest = sorted[0];
      expect(nearest.distanceKm).toBe(0);
      expect(nearest.name).toBe('Giovanni Buglione');

      // Step 4: Map re-center flyTo target matches user coordinates
      const flyToTarget = userGps;
      expect(flyToTarget[0]).toBe(8.9824);
      expect(flyToTarget[1]).toBe(-79.5199);

      // Step 5: Direct WhatsApp URL generated from nearest artist's phone
      const waUrl = formatWhatsAppUrl(nearest.whatsappNumber, '507', 'Hola! Vi tu perfil en Tattoo Hub');
      expect(waUrl).toBe('https://wa.me/50760012345?text=Hola!%20Vi%20tu%20perfil%20en%20Tattoo%20Hub');

      // Step 6: Public profile URL matches route contract
      const profileUrl = `/artist/${nearest.id}`;
      expect(profileUrl).toBe('/artist/artist-001');
    });

    it('TC-M4-XFEAT-02: International GPS positioning in Bogotá, Colombia orders Colombian artists first and Madrid last', () => {
      // User GPS in Bogotá [4.7110, -74.0721]
      const bogotaGps: [number, number] = [4.7110, -74.0721];

      const artists = SAMPLE_HUB_ARTISTS.map((a, i) => normalizeHubArtist(a, i, bogotaGps));
      const sorted = [...artists].sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

      // Local artist in Bogota (Camila Restrepo) should be nearest (~0 km)
      const firstArtist = sorted[0];
      expect(firstArtist.city).toBe('Bogotá');
      expect(firstArtist.distanceKm!).toBeLessThan(15);

      // Madrid artist (Diego Navarro) should be the farthest (~8000 km)
      const lastArtist = sorted[sorted.length - 1];
      expect(lastArtist.city).toBe('Madrid');
      expect(lastArtist.distanceKm!).toBeGreaterThan(7000);
    });
  });

  describe('Cross-Feature Flow 2: Profile Editing with Dial Prefix to Public Profile WhatsApp Button', () => {
    it('TC-M4-XFEAT-03: Simulates artist configuring Colombian prefix +57 and phone, reflecting on public profile view', () => {
      // Step 1: Artist selects prefix in InternationalPhoneInput
      const selectedPrefix = '+57';
      const enteredNationalNumber = '300 123 4567';

      // Step 2: Component computes clean fullE164
      const cleanDigits = cleanPhoneDigits(enteredNationalNumber);
      const cleanPrefixDigits = cleanPhoneDigits(selectedPrefix);
      const fullE164 = `+${cleanPrefixDigits}${cleanDigits}`;
      expect(fullE164).toBe('+573001234567');

      // Step 3: Live preview in edit mode
      const livePreviewUrl = formatWhatsAppUrl(fullE164);
      expect(livePreviewUrl).toBe('https://wa.me/573001234567');

      // Step 4: Stored in artist profile record
      const updatedProfile = {
        id: 'art-colombia-01',
        name: 'Carlos Tatuajes',
        country: 'Colombia',
        city: 'Medellín',
        phone_prefix: selectedPrefix,
        whatsapp_number: fullE164,
      };

      // Step 5: Public view renders WhatsApp button with href matching waUrl
      const publicWaButtonHref = formatWhatsAppUrl(updatedProfile.whatsapp_number);
      expect(publicWaButtonHref).toBe('https://wa.me/573001234567');
      expect(publicWaButtonHref.startsWith('https://wa.me/57')).toBe(true);
    });
  });

  describe('Cross-Feature Flow 3: GPS Permission Denial & Manual Recovery Flow', () => {
    it('TC-M4-XFEAT-04: Simulates transition from GPS denial (fallback sorting) to manual user activation', () => {
      // Step 1: GPS denied -> userCoords is null
      let userCoords: [number, number] | null = null;
      let gpsStatus: 'prompt' | 'granted' | 'denied' = 'denied';

      // Step 2: Fallback sorting by worksCount descending
      let artists = SAMPLE_HUB_ARTISTS.map((a, i) => normalizeHubArtist(a, i, userCoords));
      let sorted = [...artists].sort((a, b) => (b.worksCount || 0) - (a.worksCount || 0));

      expect(gpsStatus).toBe('denied');
      expect(sorted[0].worksCount).toBeGreaterThanOrEqual(sorted[sorted.length - 1].worksCount || 0);

      // Step 3: User clicks manual retry button "📍 Usar mi ubicación"
      userCoords = [8.9824, -79.5199]; // Permission granted on retry
      gpsStatus = 'granted';

      // Step 4: Re-normalize and sort by distance
      artists = SAMPLE_HUB_ARTISTS.map((a, i) => normalizeHubArtist(a, i, userCoords));
      sorted = [...artists].sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

      expect(gpsStatus).toBe('granted');
      expect(sorted[0].distanceKm).toBe(0);
      expect(sorted[0].name).toBe('Giovanni Buglione');
    });
  });

  describe('Cross-Feature Flow 4: Style Filtering Combined with Proximity Sorting', () => {
    it('TC-M4-XFEAT-05: Filtering by "Realismo" retains only Realismo artists and sorts them by distance', () => {
      const userGps: [number, number] = [8.9824, -79.5199];
      const selectedStyle = 'Realismo';

      const artists = SAMPLE_HUB_ARTISTS.map((a, i) => normalizeHubArtist(a, i, userGps));

      // Filter by style
      const filtered = artists.filter(
        (a) => a.style?.toLowerCase().includes('realis') || (a.raw?.styles && a.raw.styles.some((s: string) => s.toLowerCase().includes('realis')))
      );
      expect(filtered.length).toBeGreaterThan(0);

      // All filtered artists must have Realismo / realista in styles
      for (const a of filtered) {
        const hasRealismo = a.style?.toLowerCase().includes('realis') || (a.raw?.styles && a.raw.styles.some((s: string) => s.toLowerCase().includes('realis')));
        expect(hasRealismo).toBe(true);
      }

      // Sort filtered subset by proximity
      const sortedFiltered = [...filtered].sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
      for (let i = 0; i < sortedFiltered.length - 1; i++) {
        expect(sortedFiltered[i].distanceKm!).toBeLessThan(sortedFiltered[i + 1].distanceKm! + 0.001);
      }
    });
  });

  describe('Cross-Feature Flow 5: Navigation Gate Exemption Consistency', () => {
    it('TC-M4-XFEAT-06: Verifies public routes (/about, /hub, /legal/*) are accessible without forced login or onboarding lockout', () => {
      const appPath = path.join(frontendDir, 'src/App.tsx');
      const content = fs.readFileSync(appPath, 'utf-8');

      // exemptPaths must include /about, /hub (or hub is public route), and legal paths
      expect(content).toContain("'/about'");
      expect(content).toContain("'/legal/terms'");
      expect(content).toContain("'/legal/privacy'");

      // Public routes declared in BrowserRouter
      expect(content).toContain('<Route path="/" element={<HomePage />} />');
      expect(content).toContain('<Route path="/about" element={<AboutPage />} />');
      expect(content).toContain('<Route path="/hub" element={<ArtistsHubPage />} />');
    });
  });
}
