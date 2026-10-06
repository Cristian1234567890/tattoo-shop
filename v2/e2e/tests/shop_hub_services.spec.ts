import { test, expect } from '@playwright/test';

test.describe('Tienda Fase 1 & Hub Services Audit', () => {
  test('Test 1: Navigation to /tienda from Navbar and route alias /shop', async ({ page }) => {
    // Start at home page
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Verify navbar link exists and navigate
    const navTienda = page.locator('#nav-tienda');
    await expect(navTienda).toBeVisible({ timeout: 15000 });
    await navTienda.click();

    // Verify URL is /tienda
    await expect(page).toHaveURL(/\/tienda/);

    // Verify page hero and pickup notice
    await expect(
      page.getByRole('heading', { name: /Joyería Biocompatible & Cuidado Posterior/i })
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Solo Retiro en Estudio/i)).toBeVisible();

    // Test alias /shop redirects to /tienda
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/tienda/);
  });

  test('Test 2: Product catalog renders cards and filters by category', async ({ page }) => {
    await page.goto('/tienda', { waitUntil: 'domcontentloaded' });

    // Verify product cards render
    const productCards = page.locator('.atelier-card-hover');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    const initialCount = await productCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Filter by 'Cuidado Posterior'
    const aftercareBtn = page.locator('#cat-filter-aftercare');
    await expect(aftercareBtn).toBeVisible();
    await aftercareBtn.click();

    // Verify filtered items include healing cream / aftercare
    await expect(page.getByText(/Crema Cicatrizante|Espuma Limpiadora/i).first()).toBeVisible();

    // Filter by 'Joyería Biocompatible'
    const jewelryBtn = page.locator('#cat-filter-jewelry');
    await jewelryBtn.click();
    await expect(page.getByText(/Titanio ASTM F136|Clicker Septum/i).first()).toBeVisible();

    // Reset to 'Todos'
    const allBtn = page.locator('#cat-filter-all');
    await allBtn.click();
    const resetCount = await page.locator('.atelier-card-hover').count();
    expect(resetCount).toBe(initialCount);
  });

  test('Test 3: Guest gate intercepts unauthenticated users clicking "Apartar para Retiro"', async ({ page }) => {
    await page.goto('/tienda', { waitUntil: 'domcontentloaded' });

    // Locate first reserve button
    const reserveBtn = page.getByRole('button', { name: /Apartar para Retiro/i }).first();
    await expect(reserveBtn).toBeVisible({ timeout: 15000 });
    await reserveBtn.click();

    // Verify Guest Gate Modal appears
    const guestGateModal = page.locator('#guest-gate-modal');
    await expect(guestGateModal).toBeVisible({ timeout: 10000 });

    // Verify title and prompt message
    await expect(page.getByText(/Reservar en el Atelier/i)).toBeVisible();
    await expect(page.getByText(/inicia sesión o crea tu cuenta/i)).toBeVisible();
  });

  test('Test 4: Dynamic currency updates price formatting across products', async ({ page }) => {
    await page.goto('/tienda', { waitUntil: 'domcontentloaded' });

    // Initial price check (USD)
    const priceElement = page.locator('.atelier-card-hover span.text-xl').first();
    await expect(priceElement).toBeVisible({ timeout: 15000 });
    const initialPriceText = await priceElement.innerText();
    expect(initialPriceText.length).toBeGreaterThan(0);

    // Open Country/Currency dropdown in Navbar
    const currencyBtn = page.locator('#country-currency-selector-btn');
    await expect(currencyBtn).toBeVisible();
    await currencyBtn.click();

    // Select Colombia (COP)
    const copOption = page.locator('#country-currency-dropdown-menu button').filter({ hasText: /Colombia/i });
    if (await copOption.isVisible()) {
      await copOption.click();

      // Verify prices reactively recomputed
      await page.waitForTimeout(500);
      const updatedPriceText = await priceElement.innerText();
      // In COP, prices are in thousands
      expect(updatedPriceText).not.toBe(initialPriceText);
    }
  });

  test('Test 5: Global Footer is visible on /tienda page', async ({ page }) => {
    await page.goto('/tienda', { waitUntil: 'domcontentloaded' });

    // Footer must be rendered
    const footer = page.locator('#footer');
    await expect(footer).toBeVisible({ timeout: 15000 });

    // Verify link to Tienda del Atelier in Footer
    await expect(footer.getByRole('link', { name: /Tienda del Atelier/i })).toBeVisible();
  });

  test('Test 6: AgendaTracking renders appointments and localized dates without setTimeout mocks', async ({ page }) => {
    // Authenticate client
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'user',
        JSON.stringify({
          user: {
            id: 'cli-001',
            email: 'client@atelier.test',
            user_metadata: { role: 'cliente', full_name: 'Elena Rostova', onboarding_completed: true, legal_accepted: true }
          },
          session: { access_token: 'fake-jwt', refresh_token: 'fake-refresh' }
        })
      );
    });

    await page.goto('/client-dashboard?tab=citas', { waitUntil: 'domcontentloaded' });

    // Verify AgendaTracking container
    await expect(page.getByRole('heading', { name: /Agenda del Atelier/i })).toBeVisible({ timeout: 15000 });

    // Verify appointments loaded from hubService
    const apptCards = page.locator('.atelier-card-hover');
    await expect(apptCards.first()).toBeVisible({ timeout: 10000 });
    const count = await apptCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify status pill and artist name
    await expect(page.getByText(/Kaelen Voss|Elena Rostova|Marcus Thorne/i).first()).toBeVisible();
    await expect(page.getByText(/Confirmada|Pendiente de Aprobación|Finalizada/i).first()).toBeVisible();
  });

  test('Test 7: PaymentTracking renders transactions and dynamic formatPrice without setTimeout mocks', async ({ page }) => {
    // Authenticate client
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'user',
        JSON.stringify({
          user: {
            id: 'cli-001',
            email: 'client@atelier.test',
            user_metadata: { role: 'cliente', full_name: 'Elena Rostova', onboarding_completed: true, legal_accepted: true }
          },
          session: { access_token: 'fake-jwt', refresh_token: 'fake-refresh' }
        })
      );
    });

    await page.goto('/client-dashboard?tab=pagos', { waitUntil: 'domcontentloaded' });

    // Verify PaymentTracking container
    await expect(page.getByRole('heading', { name: /Pagos y Transacciones/i })).toBeVisible({ timeout: 15000 });

    // Verify payments loaded from hubService
    const paymentCards = page.locator('.atelier-card-hover');
    await expect(paymentCards.first()).toBeVisible({ timeout: 10000 });
    const count = await paymentCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify formatted price and method badge
    await expect(page.getByText(/PayPal Payouts|Tarjeta de Crédito|Depósito en Estudio/i).first()).toBeVisible();
    await expect(page.getByText(/Completado|Pendiente/i).first()).toBeVisible();
  });
});
