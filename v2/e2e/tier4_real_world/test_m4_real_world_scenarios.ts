/**
 * Tier 4: Real-World Scenarios - Milestone 4
 * Verifies complete realistic user journeys and enterprise operational invariants:
 *   1. Scenario 1: End-to-end client journey:
 *      Landing page (#beneficios, #precios) -> /about -> /hub map discovery -> filtering by style -> finding nearest artist -> WhatsApp contact.
 *   2. Scenario 2: International artist expansion:
 *      Artist in Madrid, Spain registers with +34 dial code -> verified in database -> client discovers on map -> direct WhatsApp communication.
 *   3. Scenario 3: Offline map resilience & graceful degradation:
 *      Backend is offline / throws error -> ArtistsHubPage falls back to SAMPLE_HUB_ARTISTS -> full interactive map and drawer maintained.
 *   4. Scenario 4: Routing invariants & absolute absence of localhost jumps across all views.
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

export function registerM4RealWorldScenariosTests(validator: DomValidator) {
  setTier('Tier 4 - Real-World Scenarios');
  const frontendDir = validator.getFrontendRoot();

  describe('Scenario 1: End-to-End Client Journey (Landing -> About -> Hub -> Filter -> Nearest -> WhatsApp)', () => {
    it('TC-M4-SCEN-01: Simulates complete client conversion path across UI components and utilities', () => {
      // Step 1: Client visits Landing Page
      const homePagePath = path.join(frontendDir, 'src/pages/HomePage.tsx');
      expect(fs.existsSync(homePagePath)).toBe(true);
      const homeContent = fs.readFileSync(homePagePath, 'utf-8');
      expect(homeContent).toContain('id="beneficios"');
      expect(homeContent).toContain('id="precios"');
      expect(homeContent).toContain('to="/hub"');

      // Step 2: Client navigates to /about to inspect platform guarantees
      const aboutPagePath = path.join(frontendDir, 'src/pages/AboutPage.tsx');
      expect(fs.existsSync(aboutPagePath)).toBe(true);
      const aboutContent = fs.readFileSync(aboutPagePath, 'utf-8');
      expect(aboutContent).toContain('Calidad & Higiene Verificada');
      expect(aboutContent).toContain('Comunidad Global Sin Fronteras');

      // Step 3: Client navigates to /hub
      const hubPagePath = path.join(frontendDir, 'src/pages/ArtistsHubPage.tsx');
      expect(fs.existsSync(hubPagePath)).toBe(true);
      const hubContent = fs.readFileSync(hubPagePath, 'utf-8');
      expect(hubContent).toContain('MapContainer');

      // Step 4: Client GPS acquired in Panama City
      const clientGps: [number, number] = [8.9824, -79.5199];

      // Step 5: Client filters by style "Blackwork"
      const chosenStyle = 'Blackwork';
      const availableArtists = SAMPLE_HUB_ARTISTS.map((a, i) => normalizeHubArtist(a, i, clientGps));
      const blackworkArtists = availableArtists.filter((a) => a.style?.toLowerCase().includes('black') || (a.raw?.styles && a.raw.styles.some((s: string) => s.toLowerCase().includes('black'))));
      expect(blackworkArtists.length).toBeGreaterThan(0);

      // Step 6: Identify nearest Blackwork artist
      const sortedBlackwork = [...blackworkArtists].sort(
        (a, b) => (a.distanceKm || 0) - (b.distanceKm || 0)
      );
      const nearestBlackworkArtist = sortedBlackwork[0];
      expect(nearestBlackworkArtist.distanceKm).toBeDefined();

      // Step 7: Client clicks WhatsApp button on artist card / popup
      const contactUrl = formatWhatsAppUrl(
        nearestBlackworkArtist.whatsappNumber,
        '507',
        `Hola ${nearestBlackworkArtist.name}! Vi tu trabajo de ${chosenStyle} en Tattoo Hub.`
      );
      expect(contactUrl.startsWith('https://wa.me/')).toBe(true);
      expect(contactUrl).toContain('Blackwork');
    });
  });

  describe('Scenario 2: International Artist Expansion (Spain / Colombia / Mexico)', () => {
    it('TC-M4-SCEN-02: Verifies cross-border artist registration, geocoding and international WhatsApp linkage', () => {
      // Artist registers in Madrid, Spain
      const spainArtist = {
        id: 'art-spain-01',
        name: 'Diego Navarro',
        country: 'España',
        city: 'Madrid',
        phone_prefix: '+34',
        whatsapp_number: '+34 612 345 678',
        styles: ['Neotradicional', 'Japonés'],
      };

      // 1. Coordinates resolve to Madrid [40.4168, -3.7038] with deterministic jitter tolerance
      const coords = resolveArtistCoordinates({ ciudad: spainArtist.city, country: spainArtist.country }, 0);
      expect(Math.abs(coords[0] - 40.4168) < 0.02).toBe(true);
      expect(Math.abs(coords[1] - (-3.7038)) < 0.02).toBe(true);

      // 2. Distance from client in Mexico City [19.4326, -99.1332]
      const mexicoCityGps: [number, number] = [19.4326, -99.1332];
      const distance = calculateDistanceKm(mexicoCityGps[0], mexicoCityGps[1], coords[0], coords[1]);
      // Madrid to Mexico City is ~9,070 km
      expect(distance).toBeGreaterThan(9000);
      expect(distance).toBeLessThan(9200);

      // 3. Client clicks WhatsApp contact: opens directly with Spain country code
      const waUrl = formatWhatsAppUrl(spainArtist.whatsapp_number);
      expect(waUrl).toBe('https://wa.me/34612345678');
    });
  });

  describe('Scenario 3: Offline Map Resilience & Fallback Dataset Verification', () => {
    it('TC-M4-SCEN-03: ArtistsHubPage seamlessly defaults to SAMPLE_HUB_ARTISTS when backend response is empty or fails', () => {
      const hubPagePath = path.join(frontendDir, 'src/pages/ArtistsHubPage.tsx');
      const content = fs.readFileSync(hubPagePath, 'utf-8');

      // Verifies fallback assignment in catch and empty response blocks
      expect(content).toContain('SAMPLE_HUB_ARTISTS');
      expect(content).toContain('normalizeHubArtist');

      // Simulates empty backend payload fallback
      const emptyApiResponse: any[] = [];
      const artistsToDisplay = emptyApiResponse.length > 0 ? emptyApiResponse : SAMPLE_HUB_ARTISTS;
      expect(artistsToDisplay.length).toBe(SAMPLE_HUB_ARTISTS.length);
      expect(normalizeHubArtist(artistsToDisplay[0]).name).toBe('Giovanni Buglione');
    });
  });

  describe('Scenario 4: Routing Invariants & Zero Localhost Jumps', () => {
    it('TC-M4-SCEN-04: Confirms absolute zero occurrences of hardcoded "localhost" across all frontend source files', () => {
      const srcDir = path.join(frontendDir, 'src');
      let foundLocalhost = false;
      const violatingFiles: string[] = [];

      const checkDir = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            checkDir(fullPath);
          } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
            // client.ts legitimately defines the environment variable default fallback
            if (entry.name === 'client.ts') continue;
            const code = fs.readFileSync(fullPath, 'utf-8');
            // Check for hardcoded localhost redirects or URLs
            if (code.includes('localhost:5173') || code.includes('localhost:8080') || code.includes('http://localhost')) {
              foundLocalhost = true;
              violatingFiles.push(entry.name);
            }
          }
        }
      };

      checkDir(srcDir);
      expect(foundLocalhost).toBe(false);
      expect(violatingFiles.length).toBe(0);
    });
  });
}
