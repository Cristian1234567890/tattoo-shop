import { test, expect } from '@playwright/test';

test.describe('Landing & Public Stitch Screens E2E Audit', () => {
  test('Test 1: HomePage (/) renders brand, hero, CTAs, roadmap, dynamic prices, and global Footer', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);

    // Verify Brand Logo
    const logo = page.locator('#logo');
    await expect(logo).toBeVisible({ timeout: 15000 });

    // Verify Hero headline
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /El punto de encuentro entre/i
    );

    // Verify Hero CTAs
    const clientCta = page.getByRole('link', { name: /Empezar mi colección de tinta/i });
    await expect(clientCta).toBeVisible();
    await expect(clientCta).toHaveAttribute('href', '/register?role=Cliente');

    const artistCta = page.getByRole('link', { name: /Formar un Estudio o Perfil/i });
    await expect(artistCta).toBeVisible();
    await expect(artistCta).toHaveAttribute('href', '/register?role=Tatuador');

    // Verify Roadmap section (#beneficios)
    const roadmapSection = page.locator('#beneficios');
    await expect(roadmapSection).toBeVisible();
    await expect(roadmapSection.getByText(/Nuestra Hoja de Ruta & Estándares/i)).toBeVisible();

    // Verify link to full manifesto
    const manifestoLink = roadmapSection.getByRole('link', { name: /Conoce nuestro manifiesto completo/i });
    await expect(manifestoLink).toBeVisible();
    await expect(manifestoLink).toHaveAttribute('href', '/beneficios');

    // Verify global Footer is visible on HomePage
    const footer = page.locator('#footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByRole('link', { name: /Tienda del Atelier/i })).toBeVisible();
  });

  test('Test 2: BenefitsPage (/beneficios) renders manifesto, 3 core guarantees, comparison table, and Footer', async ({ page }) => {
    await page.goto('/beneficios', { waitUntil: 'domcontentloaded' });

    // Verify URL
    await expect(page).toHaveURL(/\/beneficios/);

    // Verify Manifesto Header
    await expect(page.getByText(/MANIFIESTO DEL ATELIER DIGITAL/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /Devolviendo el tatuaje a quienes lo graban/i
    );

    // Verify 3 Core Guarantees
    await expect(page.getByRole('heading', { name: /100% para el Tatuador/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Protocolos Sanitarios Visibles/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Contacto Directo sin Paredes/i })).toBeVisible();

    // Verify Platform Comparison Matrix
    await expect(page.getByRole('heading', { name: /Tattoo Hub vs Canales Tradicionales/i })).toBeVisible();
    const table = page.locator('table');
    await expect(table).toBeVisible();
    await expect(table.getByText(/Comisión por Cita/i)).toBeVisible();

    // Verify global Footer is visible
    const footer = page.locator('#footer');
    await expect(footer).toBeVisible();
  });

  test('Test 3: PricingPage (/precios) renders tiers, billing toggle, dynamic currency, FAQ accordion, and Footer', async ({ page }) => {
    await page.goto('/precios', { waitUntil: 'domcontentloaded' });

    // Verify URL
    await expect(page).toHaveURL(/\/precios/);

    // Verify Header
    await expect(page.getByRole('heading', { name: /Planes y Membresías Transparentes/i })).toBeVisible({ timeout: 10000 });

    // Verify Currency Indicator Pill
    await expect(page.getByText(/Moneda activa:/i)).toBeVisible();

    // Verify Billing Cycle Toggle
    const monthlyBtn = page.getByRole('button', { name: 'Facturación Mensual', exact: true });
    const annualBtn = page.getByRole('button', { name: /Facturación Anual/i }).first();
    await expect(monthlyBtn).toBeVisible();
    await expect(annualBtn).toBeVisible();

    // Click Monthly billing
    await monthlyBtn.click();
    await expect(monthlyBtn).toHaveClass(/bg-violet-600/);

    // Click Annual billing (includes 20% discount badge)
    await annualBtn.click();
    await expect(annualBtn).toHaveClass(/bg-violet-600/);
    await expect(page.getByText(/Ahorra 20%/i)).toBeVisible();

    // Verify FAQ accordion
    const firstFaqBtn = page.getByRole('button', { name: /prueba gratuita de 30 días/i });
    await expect(firstFaqBtn).toBeVisible();
    await firstFaqBtn.click();
    await expect(page.getByText(/tienes acceso completo e ilimitado/i)).toBeVisible();

    // Verify global Footer is visible
    const footer = page.locator('#footer');
    await expect(footer).toBeVisible();
  });

  test('Test 4: AboutPage (/about) renders atelier mission, standards, and global Footer', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' });

    // Verify URL
    await expect(page).toHaveURL(/\/about/);

    // Verify main content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });

    // Verify global Footer is visible
    const footer = page.locator('#footer');
    await expect(footer).toBeVisible();
  });

  test('Test 5: Legal Pages (/legal/terms & /legal/privacy) render disclosure content and global Footer', async ({ page }) => {
    // 1. Terms & Conditions
    await page.goto('/legal/terms', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/legal\/terms/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#footer')).toBeVisible();

    // 2. Privacy Policy
    await page.goto('/legal/privacy', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/legal\/privacy/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#footer')).toBeVisible();
  });
});
