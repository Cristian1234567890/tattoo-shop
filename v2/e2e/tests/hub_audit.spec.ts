import { test, expect } from '@playwright/test';

test.describe('Artists Hub (/hub) Stitch Studio Hierarchy & Map Audit', () => {
  test('Test 1: Navigation to /hub, HTTP 200, Map container attaches and studio pins render', async ({ page }) => {
    const response = await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);

    // Verify URL
    await expect(page).toHaveURL(/\/hub/);

    // Verify map container attaches and renders dark luxury background
    const mapWrapper = page.locator('[data-testid="hub-map-container"]');
    await expect(mapWrapper).toBeVisible({ timeout: 15000 });

    // Verify studio pins are rendered on map
    const pins = page.locator('[data-testid="studio-pin"]');
    await expect(pins.first()).toBeVisible({ timeout: 10000 });
    const pinCount = await pins.count();
    expect(pinCount).toBeGreaterThanOrEqual(3);

    // Verify studio drawer is present
    await expect(page.locator('[data-testid="studio-drawer"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
  });

  test('Test 2: Studio Pins display multi-artist badge and selecting pin activates studio', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });

    // Verify multi-artist badge on Obsidian Atelier (3 Artistas)
    const obsidianPin = page.locator('[data-testid="studio-pin"][data-studio-id="obsidian"]');
    await expect(obsidianPin).toBeVisible({ timeout: 10000 });
    await expect(obsidianPin).toContainText('3');
    await expect(obsidianPin).toContainText('Artistas');

    // Click on another studio pin (e.g. Neon Ink Studio)
    const neonPin = page.locator('[data-testid="studio-pin"][data-studio-id="neon-ink"]');
    await expect(neonPin).toBeVisible();
    await neonPin.click();

    // Verify Drawer updates active studio title to Neon Ink Studio
    const drawer = page.locator('[data-testid="studio-drawer"]');
    await expect(drawer.getByText(/Neon Ink Studio/i).first()).toBeVisible({ timeout: 8000 });
    await expect(drawer.getByText(/2 Artistas Residentes/i).first()).toBeVisible();
  });

  test('Test 3: Search input and type filters dynamically filter studios', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });

    // 1. Filter by "Estudios"
    const studioFilterBtn = page.locator('[data-testid="filter-type-studio"]');
    await expect(studioFilterBtn).toBeVisible();
    await studioFilterBtn.click();

    // Studio pins should be visible
    const pins = page.locator('[data-testid="studio-pin"]');
    const studioCount = await pins.count();
    expect(studioCount).toBeGreaterThan(0);

    // 2. Filter by "Independientes"
    const indepFilterBtn = page.locator('[data-testid="filter-type-independent"]');
    await indepFilterBtn.click();
    await expect(page.locator('[data-testid="studio-pin"][data-studio-id="ana-valdes"]')).toBeVisible();

    // 3. Reset to "Todos"
    const allFilterBtn = page.locator('[data-testid="filter-type-all"]');
    await allFilterBtn.click();

    // 4. Test Search input
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('Chiriquí');
    await expect(page.locator('[data-testid="studio-pin"][data-studio-id="neon-ink"]')).toBeVisible();
    await expect(page.locator('[data-testid="studio-pin"][data-studio-id="obsidian"]')).not.toBeVisible();

    // Clear search
    await searchInput.fill('');
    await expect(page.locator('[data-testid="studio-pin"][data-studio-id="obsidian"]')).toBeVisible();
  });

  test('Test 4: Studio -> Resident Artists Hierarchy (Multi-artist selector, specialties, and dynamic rates)', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });

    const drawer = page.locator('[data-testid="studio-drawer"]');
    await expect(drawer).toBeVisible({ timeout: 15000 });

    // Verify Obsidian studio has 3 resident artists
    await expect(drawer.getByText(/3 Artistas Residentes/i).first()).toBeVisible();

    // Verify resident avatar buttons
    const residentPills = drawer.locator('[data-testid="resident-artist-pill"]');
    const residentCount = await residentPills.count();
    expect(residentCount).toBeGreaterThanOrEqual(3);

    // Initial resident should be Kaelen
    await expect(drawer.getByText(/Kaelen Silva/i).first()).toBeVisible();
    await expect(drawer.getByText(/Void/i).first()).toBeVisible();
    await expect(drawer.getByText(/Tarifa Base/i).first()).toBeVisible();

    // Switch to Maya Lin (Thorne)
    const mayaPill = drawer.locator('[data-testid="resident-artist-pill"][data-resident-id="artist-maya"]');
    await expect(mayaPill).toBeVisible();
    await mayaPill.click();

    // Active details should update to Maya Lin
    await expect(drawer.getByText(/Maya Lin/i).first()).toBeVisible();
    await expect(drawer.getByText(/Thorne/i).first()).toBeVisible();
    await expect(drawer.getByText(/Ornamental|Dotwork|Botánico/i).first()).toBeVisible();

    // Verify flash designs render with dynamic formatted prices
    const flashItems = drawer.locator('[data-testid="flash-card-item"]');
    await expect(flashItems.first()).toBeVisible({ timeout: 8000 });
    const flashCount = await flashItems.count();
    expect(flashCount).toBeGreaterThan(0);
  });

  test('Test 5: Guest Gate intercepts unauthenticated actions (WhatsApp, Send Sketch, Flash Reserve)', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });

    const drawer = page.locator('[data-testid="studio-drawer"]');
    await expect(drawer).toBeVisible({ timeout: 15000 });

    // 1. Intercept Reserve Flash / Cupo
    const reserveBtn = drawer.locator('[data-testid="btn-reservar-flash"]');
    await expect(reserveBtn).toBeVisible();
    await reserveBtn.click();

    const guestGateModal = page.locator('#guest-gate-modal');
    await expect(guestGateModal).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#guest-gate-register-btn')).toBeVisible();
    await expect(page.locator('#guest-gate-login-btn')).toBeVisible();

    // Dismiss guest gate modal
    const closeBtn = page.locator('button[aria-label="Cerrar modal de invitados"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(guestGateModal).not.toBeVisible();

    // 2. Intercept Send Sketch
    const sketchBtn = drawer.locator('[data-testid="btn-enviar-boceto"]');
    await expect(sketchBtn).toBeVisible();
    await sketchBtn.click();
    await expect(guestGateModal).toBeVisible({ timeout: 8000 });
    await closeBtn.click();
    await expect(guestGateModal).not.toBeVisible();

    // 3. Intercept WhatsApp Direct
    const whatsappBtn = drawer.locator('[data-testid="btn-whatsapp-direct"]');
    await expect(whatsappBtn).toBeVisible();
    await whatsappBtn.click();
    await expect(guestGateModal).toBeVisible({ timeout: 8000 });
    await closeBtn.click();
    await expect(guestGateModal).not.toBeVisible();
  });

  test('Test 6: Fullscreen layout verification - global Footer is HIDDEN on /hub per R4', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });

    // Verify footer is absent
    const footer = page.locator('#footer');
    await expect(footer).not.toBeVisible();
  });
});
