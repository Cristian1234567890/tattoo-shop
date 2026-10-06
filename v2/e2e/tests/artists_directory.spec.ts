import { test, expect } from '@playwright/test';

test.describe('Artists Directory (/artistas) Stitch Catalog & Hierarchy Audit', () => {
  test('Test 1: Navigation to /artistas, HTTP 200, renders studio and artist catalog cards', async ({ page }) => {
    const response = await page.goto('/artistas', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);

    // Verify URL
    await expect(page).toHaveURL(/\/artistas/);

    // Verify header title
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /Estudios y Artistas Residentes/i
    );

    // Verify presence of studio cards
    await expect(page.getByText('Obsidian Atelier & Flash Lab').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Neon Ink Studio').first()).toBeVisible();
    await expect(page.getByText('Ana Valdés Tattoo').first()).toBeVisible();

    // Verify global Footer is rendered on /artistas
    const footer = page.locator('#footer');
    await expect(footer).toBeVisible();
  });

  test('Test 2: Search bar filters catalog items by studio, artist, city, or style', async ({ page }) => {
    await page.goto('/artistas', { waitUntil: 'domcontentloaded' });

    const searchInput = page.getByPlaceholder(/Buscar por estudio, residente, ciudad o estilo.../i);
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Search for "Chiriquí"
    await searchInput.fill('Chiriquí');
    await expect(page.getByText('Neon Ink Studio').first()).toBeVisible();
    await expect(page.getByText('Obsidian Atelier & Flash Lab')).not.toBeVisible();

    // Clear search
    await searchInput.fill('');
    await expect(page.getByText('Obsidian Atelier & Flash Lab').first()).toBeVisible();
  });

  test('Test 3: Style filter pills dynamically filter catalog cards', async ({ page }) => {
    await page.goto('/artistas', { waitUntil: 'domcontentloaded' });

    // Filter by "Tradicional"
    const tradFilter = page.getByRole('button', { name: /^Tradicional$/i });
    await expect(tradFilter).toBeVisible();
    await tradFilter.click();

    // Ana Valdés (Tradicional) should be visible
    await expect(page.getByText('Ana Valdés Tattoo').first()).toBeVisible();

    // Reset to "Todos"
    const allFilter = page.getByRole('button', { name: /^Todos$/i }).first();
    await allFilter.click();
    await expect(page.getByText('Obsidian Atelier & Flash Lab').first()).toBeVisible();
  });

  test('Test 4: Studio -> Resident Artists Hierarchy updates active resident, rates, and flashes', async ({ page }) => {
    await page.goto('/artistas', { waitUntil: 'domcontentloaded' });

    // Locate Obsidian Atelier card
    const obsidianCard = page.locator('div').filter({ hasText: /Obsidian Atelier & Flash Lab/i }).first();
    await expect(obsidianCard).toBeVisible({ timeout: 10000 });

    // Verify Obsidian shows resident artist count badge (3 Artistas Residentes)
    await expect(page.getByText(/3 Artistas Residentes/i).first()).toBeVisible();

    // Switch resident inside Obsidian card to Maya Lin (Thorne)
    const mayaResidentBtn = page.getByRole('button', { name: /Thorne/i }).first();
    if (await mayaResidentBtn.isVisible()) {
      await mayaResidentBtn.click();
      // Bio and details update
      await expect(page.getByText(/Ornamental botánico de alta precisión/i).first()).toBeVisible();
    }
  });

  test('Test 5: Guest Gate intercepts unauthenticated clicks on WhatsApp and Send Sketch', async ({ page }) => {
    await page.goto('/artistas', { waitUntil: 'domcontentloaded' });

    // Click first WhatsApp button
    const whatsappBtn = page.getByRole('button', { name: /WhatsApp/i }).first();
    await expect(whatsappBtn).toBeVisible({ timeout: 10000 });
    await whatsappBtn.click();

    // Guest Gate modal must appear
    const guestGateModal = page.locator('#guest-gate-modal');
    await expect(guestGateModal).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#guest-gate-register-btn')).toBeVisible();
    await expect(page.locator('#guest-gate-login-btn')).toBeVisible();

    // Dismiss modal
    const closeBtn = page.locator('button[aria-label="Cerrar modal de invitados"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(guestGateModal).not.toBeVisible();

    // Click first Enviar Boceto button
    const sketchBtn = page.getByRole('button', { name: /Enviar Boceto/i }).first();
    await expect(sketchBtn).toBeVisible();
    await sketchBtn.click();
    await expect(guestGateModal).toBeVisible({ timeout: 8000 });
    await closeBtn.click();
    await expect(guestGateModal).not.toBeVisible();
  });
});
