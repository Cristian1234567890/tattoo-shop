import { test, expect } from '@playwright/test';

test.describe('Auth, Gating, Currency & Conditional Footer Matrix Audit', () => {
  test('Test 1: RegisterPage (/register) renders distraction-free with zero Footer', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });

    // Verify URL
    await expect(page).toHaveURL(/\/register/);

    // Verify role selector headings
    await expect(page.getByRole('heading', { name: /Cliente/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Tatuador/i }).first()).toBeVisible();

    // Verify inputs
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();

    // Verify R4 policy: Footer MUST NOT be visible
    const footer = page.locator('#footer');
    await expect(footer).not.toBeVisible();
  });

  test('Test 2: LoginPage (/login) renders distraction-free with zero Footer', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // Verify URL
    await expect(page).toHaveURL(/\/login/);

    // Verify inputs
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Verify link to register
    await expect(page.getByRole('link', { name: /Registrarse/i }).first()).toBeVisible();

    // Verify R4 policy: Footer MUST NOT be visible
    const footer = page.locator('#footer');
    await expect(footer).not.toBeVisible();
  });

  test('Test 3: ForgotPasswordPage (/forget-password) renders recovery form', async ({ page }) => {
    await page.goto('/forget-password', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/forget-password/);
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Enviar/i })).toBeVisible();
  });

  test('Test 4: ChatAuthGate intercepts unauthenticated visits to /chat and redirects to /register', async ({ page }) => {
    await page.goto('/chat', { waitUntil: 'domcontentloaded' });

    // Must redirect to register with redirect param
    await expect(page).toHaveURL(/register\?redirect=.*chat/i, { timeout: 10000 });

    // Footer must remain hidden
    await expect(page.locator('#footer')).not.toBeVisible();
  });

  test('Test 5: Strict R4 Conditional Footer Matrix across all routes', async ({ page }) => {
    // 1. Mandatory HIDDEN Routes
    const hiddenRoutes = [
      '/hub',
      '/login',
      '/register',
      '/chat',
      '/client-dashboard',
      '/artist-dashboard',
    ];

    for (const route of hiddenRoutes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const footer = page.locator('#footer');
      await expect(footer).not.toBeVisible();
    }

    // 2. Mandatory VISIBLE Routes
    const visibleRoutes = [
      '/',
      '/beneficios',
      '/precios',
      '/artistas',
      '/tienda',
      '/about',
      '/legal/terms',
      '/legal/privacy',
    ];

    for (const route of visibleRoutes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const footer = page.locator('#footer');
      await expect(footer).toBeVisible();
    }
  });

  test('Test 6: Navbar Country & Currency Selector dynamically updates currency context', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const selectorBtn = page.locator('#country-currency-selector-btn');
    await expect(selectorBtn).toBeVisible({ timeout: 10000 });
    await selectorBtn.click();

    // Verify country dropdown menu appears
    const dropdown = page.locator('#country-currency-dropdown-menu');
    await expect(dropdown).toBeVisible({ timeout: 8000 });

    // Switch to Colombia (COP)
    const copOption = dropdown.getByRole('button', { name: /Colombia/i });
    if (await copOption.isVisible()) {
      await copOption.click();
      await expect(selectorBtn).toContainText('COP');
    }

    // Open dropdown again and switch to España (EUR)
    await selectorBtn.click();
    const eurOption = dropdown.getByRole('button', { name: /España/i });
    if (await eurOption.isVisible()) {
      await eurOption.click();
      await expect(selectorBtn).toContainText('EUR');
    }
  });

  test('Test 7: Responsive Mobile Drawer navigation toggles cleanly', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Locate hamburger toggle button
    const mobileToggleBtn = page.getByRole('button', { name: /Abrir menú principal|Menú/i });
    await expect(mobileToggleBtn).toBeVisible({ timeout: 10000 });
    await mobileToggleBtn.click();

    // Verify mobile menu drawer contains key navigation links
    await expect(page.locator('#mobile-tienda')).toBeVisible();
    await expect(page.locator('#mobile-artistas')).toBeVisible();

    // Close mobile menu
    await mobileToggleBtn.click();
  });
});
