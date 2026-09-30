import { test, expect } from '@playwright/test';

const mockClientUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'client.e2e@tattoohub.test',
  user_metadata: {
    role: 'cliente',
    tipo: 'cliente',
    full_name: 'Elena Rostova',
    onboarding_completed: true,
    legal_accepted: true,
    legal_accepted_at: new Date().toISOString(),
    has_active_subscription: true,
  },
};

const mockClientSession = {
  access_token: 'fake-jwt-token-client-e2e',
  refresh_token: 'fake-refresh-token-client-e2e',
  user: mockClientUser,
};

test.describe('Client Dashboard & Storage Suite (/client-dashboard)', () => {
  test.beforeEach(async ({ page }) => {
    // Seed authenticated client session before page scripts execute
    await page.addInitScript(
      ({ user, session }) => {
        sessionStorage.setItem('user', JSON.stringify({ user, session }));
      },
      { user: mockClientUser, session: mockClientSession }
    );

    // Mock backend profile endpoint to maintain VIP client state
    await page.route('**/userprofile**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            role: 'cliente',
            legal_accepted: true,
            onboarding_completed: true,
            has_active_subscription: true,
            full_name: 'Elena Rostova',
          },
        }),
      });
    });

    // Mock client progress endpoint to supply realistic healing timeline records
    await page.route('**/api/client/tattoo-progress**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'prog-e2e-001',
                client_id: '00000000-0000-0000-0000-000000000001',
                title: 'Japanese Dragon Backpiece',
                stage: 'Fase 1: Limpieza & Primer Vendaje',
                image_url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28',
                notes: 'Primera sesión completada con éxito. Vendaje colocado con ungüento.',
                date: '2026-09-28',
                created_at: new Date().toISOString(),
                session_number: 1,
              },
            ],
          }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test('Test 1: Navigation to /client-dashboard with tab switches (?tab=overview, ?tab=configuracion, ?tab=seguridad)', async ({ page }) => {
    // 1. Initial navigation to overview tab
    const response = await page.goto('/client-dashboard?tab=overview', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);

    // Verify client dashboard loads and URL contains tab=overview
    await expect(page).toHaveURL(/client-dashboard.*tab=overview/);

    // Verify hero banner displays client information
    await expect(page.getByText('Elena Rostova').first()).toBeVisible({ timeout: 10000 });

    // 2. Switch to Configuración tab
    const configTabButton = page.getByRole('button', { name: /Configuración|Settings/i });
    await expect(configTabButton).toBeVisible();
    await configTabButton.click();

    // Verify URL updates with query param
    await expect(page).toHaveURL(/client-dashboard.*tab=configuracion/);

    // Verify configuration section content is rendered
    await expect(page.getByText(/Preferencias de Notificaciones|Notification Preferences/i).first()).toBeVisible({ timeout: 8000 });

    // 3. Switch to Seguridad tab
    const securityTabButton = page.getByRole('button', { name: /Seguridad|Security/i });
    await expect(securityTabButton).toBeVisible();
    await securityTabButton.click();

    // Verify URL updates with query param
    await expect(page).toHaveURL(/client-dashboard.*tab=seguridad/);

    // Verify security section content is rendered
    await expect(page.getByText(/Gestión de Contraseña|Password Management/i).first()).toBeVisible({ timeout: 8000 });

    // 4. Switch back to Overview tab
    const overviewTabButton = page.getByRole('button', { name: /Tatuajes & Galería|Tattoos & Gallery/i });
    await expect(overviewTabButton).toBeVisible();
    await overviewTabButton.click();

    await expect(page).toHaveURL(/client-dashboard.*tab=overview/);
    await expect(page.locator('#tattoo-progress-anchor')).toBeVisible({ timeout: 8000 });
  });

  test('Test 2: Verify #tattoo-progress-anchor displays Timeline and action triggers', async ({ page }) => {
    await page.goto('/client-dashboard?tab=overview', { waitUntil: 'domcontentloaded' });

    // Locate the tattoo progress gallery bridge anchor
    const progressAnchor = page.locator('#tattoo-progress-anchor');
    await expect(progressAnchor).toBeVisible({ timeout: 15000 });
    await progressAnchor.scrollIntoViewIfNeeded();

    // Verify title inside the progress section
    await expect(progressAnchor.getByText(/Galería de Evolución en Vivo|Live Progress Evolution Gallery/i).first()).toBeVisible();

    // Verify action trigger button (Subir Foto de Avance)
    const uploadTriggerBtn = progressAnchor.getByRole('button', { name: /Subir Foto/i }).first();
    await expect(uploadTriggerBtn).toBeVisible();

    // Verify timeline filters (Todas, Fase 1)
    await expect(progressAnchor.getByText(/Todas|All/i).first()).toBeVisible();
    await expect(progressAnchor.getByText(/Fase 1/i).first()).toBeVisible();

    // Click upload trigger to open the modal
    await uploadTriggerBtn.click();

    // Verify the UploadProgressModal appears with genuine heading
    const modalHeading = page.getByRole('heading', { name: /Registrar Avance del Tatuaje/i });
    await expect(modalHeading).toBeVisible({ timeout: 8000 });

    // Close the modal
    const closeBtn = page.locator('button[aria-label="Cerrar"]').first();
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Verify modal dismissed
    await expect(modalHeading).not.toBeVisible();
  });

  test('Test 3: Verify security & preferences tabs render settings without errors', async ({ page }) => {
    // 1. Check Preferences / Configuration Tab
    await page.goto('/client-dashboard?tab=configuracion', { waitUntil: 'domcontentloaded' });

    // Assert absence of crash overlays and presence of preferences title
    await expect(page.getByText(/Preferencias de Notificaciones|Notification Preferences/i).first()).toBeVisible({ timeout: 12000 });

    // Verify language selector options exist
    await expect(page.getByText('Español').first()).toBeVisible();
    await expect(page.getByText('English').first()).toBeVisible();

    // Verify profile save button exists
    const saveProfileBtn = page.getByRole('button', { name: /Guardar Cambios de Perfil|Save Profile/i }).first();
    await expect(saveProfileBtn).toBeVisible();

    // Verify notification save button exists
    const saveNotifBtn = page.getByRole('button', { name: /Guardar Preferencias de Notificaciones|Save Notification/i }).first();
    await expect(saveNotifBtn).toBeVisible();

    // 2. Check Security Tab
    await page.goto('/client-dashboard?tab=seguridad', { waitUntil: 'domcontentloaded' });

    // Verify Password Update Card
    await expect(page.getByText(/Gestión de Contraseña|Password Management/i).first()).toBeVisible({ timeout: 12000 });
    const passwordInputs = page.locator('input[type="password"]');
    const passwordInputCount = await passwordInputs.count();
    expect(passwordInputCount).toBeGreaterThanOrEqual(2);

    // Verify Active Sessions section
    await expect(page.getByText(/Revisión y Control de Sesiones Activas|Active Sessions/i).first()).toBeVisible();

    // Verify current device detection indicator
    await expect(page.getByText(/Este Dispositivo|Current Device/i).first()).toBeVisible();

    // Verify Account Privacy controls
    await expect(page.getByText(/Privacidad de la Cuenta|Account Privacy/i).first()).toBeVisible();
  });
});
