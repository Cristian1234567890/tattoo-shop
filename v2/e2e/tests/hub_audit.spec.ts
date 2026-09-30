import { test, expect } from '@playwright/test';

test.describe('Artists Hub (/hub) Headless CI Audit', () => {
  test.beforeEach(async ({ context }) => {
    // Ensure geolocation permissions and coordinates for Panama City are active
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 8.9824, longitude: -79.5199 });
  });

  test('Test 1: Navigation to /hub, HTTP 200, Leaflet map container attaches', async ({ page }) => {
    const response = await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);

    // Verify URL
    await expect(page).toHaveURL(/\/hub/);

    // Verify map container attaches and renders Leaflet
    const mapWrapper = page.locator('[data-testid="hub-map-container"]');
    await expect(mapWrapper).toBeVisible({ timeout: 15000 });

    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible({ timeout: 15000 });

    // Verify essential UI controls are present
    await expect(page.locator('[data-testid="style-filter-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="nearest-drawer"]')).toBeVisible();
  });

  test('Test 2: Geolocation permission and user location indicator / centering', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });

    // Wait for the map to attach
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 });

    // The page automatically triggers requestUserLocation on mount.
    // Also, clicking the GPS button triggers re-centering.
    const gpsBtn = page.locator('[data-testid="gps-locate-btn"]');
    await expect(gpsBtn).toBeVisible();
    await gpsBtn.click();

    // Verify the pulsing user GPS marker is rendered on the Leaflet map
    const userMarker = page.locator('.user-gps-marker');
    await expect(userMarker).toBeVisible({ timeout: 10000 });

    // Verify GPS button reflects active location state
    await expect(gpsBtn).toHaveClass(/bg-blue-600/);
  });

  test('Test 3: Style filter buttons dynamically filter displayed artists and update visual state', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });

    // Wait for drawer and initial artist cards to populate
    await expect(page.locator('[data-testid="nearest-drawer"]')).toBeVisible({ timeout: 15000 });
    const cards = page.locator('[data-testid="artist-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const initialCount = await cards.count();
    expect(initialCount).toBeGreaterThan(0);

    const stylesToTest = [
      { name: 'Realismo', slug: 'realismo', pattern: /realis/i },
      { name: 'Tradicional', slug: 'tradicional', pattern: /tradicional/i },
      { name: 'Blackwork', slug: 'blackwork', pattern: /black/i },
      { name: 'Minimalista', slug: 'minimalista', pattern: /minimal|line/i },
      { name: 'Neotradicional', slug: 'neotradicional', pattern: /neotrad/i },
    ];

    for (const style of stylesToTest) {
      const pill = page.locator(`[data-testid="filter-pill-${style.slug}"]`);
      await expect(pill).toBeVisible();
      await pill.click();

      // Verify active visual state (bg-primary class)
      await expect(pill).toHaveClass(/bg-primary/);

      // Verify drawer cards reflect the filtered style (or empty notice if none match)
      const currentCards = page.locator('[data-testid="artist-card"]');
      const count = await currentCards.count();
      if (count > 0) {
        const firstStyleText = await currentCards.first().locator('[data-testid="artist-style"]').innerText();
        expect(firstStyleText).toMatch(style.pattern);
      }
    }

    // Reset back to "All" and verify list returns to full count
    const allPill = page.locator('[data-testid="filter-pill-all"]');
    await allPill.click();
    await expect(allPill).toHaveClass(/bg-primary/);
    await expect(cards).toHaveCount(initialCount);
  });

  test('Test 4: Nearest artists drawer renders artist cards with distance badge, artist styles, and WhatsApp link', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });

    // Ensure drawer is open
    const drawer = page.locator('[data-testid="nearest-drawer"]');
    await expect(drawer).toBeVisible({ timeout: 15000 });

    // Locate artist cards
    const cards = drawer.locator('[data-testid="artist-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Verify card content
    const firstCard = cards.first();
    const artistName = firstCard.locator('[data-testid="artist-name"]');
    await expect(artistName).toBeVisible();
    const nameText = await artistName.innerText();
    expect(nameText.trim().length).toBeGreaterThan(0);

    const artistStyle = firstCard.locator('[data-testid="artist-style"]');
    await expect(artistStyle).toBeVisible();
    const styleText = await artistStyle.innerText();
    expect(styleText.trim().length).toBeGreaterThan(0);

    // Verify distance badge exists with "km" unit
    const distanceBadge = firstCard.locator('[data-testid="distance-badge"]');
    await expect(distanceBadge).toBeVisible();
    await expect(distanceBadge).toContainText('km');

    // Verify "Centrar" button exists and is clickable
    const centerBtn = firstCard.locator('[data-testid="btn-center-artist"]');
    await expect(centerBtn).toBeVisible();
    await centerBtn.click();

    // Verify WhatsApp button is formatted with https://wa.me/
    const whatsappBtn = firstCard.locator('[data-testid="btn-whatsapp-artist"]');
    await expect(whatsappBtn).toBeVisible();
    const href = await whatsappBtn.getAttribute('href');
    expect(href).toMatch(/^https:\/\/wa\.me\/\d+/);
  });
});
