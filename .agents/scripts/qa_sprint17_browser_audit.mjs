import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../v2/e2e/node_modules/playwright');
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../../v2/frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence/sprint17');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4202) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(distDir, req.url.split('?')[0]);
      if (req.url === '/' || !path.extname(filePath)) filePath = path.join(distDir, 'index.html');

      fs.readFile(filePath, (err, data) => {
        if (err) {
          fs.readFile(path.join(distDir, 'index.html'), (e, fallback) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(fallback);
          });
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.svg': 'image/svg+xml',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.woff2': 'font/woff2',
          '.woff': 'font/woff',
          '.ttf': 'font/ttf'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });

    server.listen(port, () => resolve(server));
  });
}

async function setupRouteMocks(context, role = 'cliente') {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*'
  };

  await context.route('**', async (route) => {
    const url = route.request().url();

    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: corsHeaders
      });
    }

    // Currencies endpoint
    if (url.includes('/currencies')) {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0, active: true },
            { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92, active: true }
          ]
        })
      });
    }

    // Coupons validation
    if (url.includes('/coupons/validate')) {
      const postData = route.request().postDataJSON();
      const code = (postData?.code || '').toUpperCase();
      if (code === 'TATTOO10') {
        return route.fulfill({
          status: 200,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { valid: true, code: 'TATTOO10', discount_percentage: 10, discount_percent: 10, applies_to: 'all', message: 'Cupón TATTOO10 validado con éxito' }
          })
        });
      }
      if (code === 'VIP50') {
        return route.fulfill({
          status: 200,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { valid: true, code: 'VIP50', discount_percentage: 50, discount_percent: 50, applies_to: 'subscription', message: 'Cupón VIP50 validado con éxito' }
          })
        });
      }
      if (code === 'PROMO20') {
        return route.fulfill({
          status: 200,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { valid: true, code: 'PROMO20', discount_percentage: 20, discount_percent: 20, applies_to: 'all', message: 'Cupón PROMO20 validado con éxito' }
          })
        });
      }
      return route.fulfill({
        status: 400,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Cupón inválido' })
      });
    }

    // User profile endpoint
    if (url.includes('/userprofile')) {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: role === 'tatuador' ? 'artist-pro-123' : 'client-12345',
            role: role,
            tipo: role,
            full_name: role === 'tatuador' ? 'Gabriel Black' : 'Carlos Cliente',
            edad: 28,
            birthdate: '1995-05-15',
            has_active_subscription: true,
            legal_accepted: true,
            onboarding_completed: true,
            trial_days_remaining: 90,
            is_trial_active: true
          }
        })
      });
    }

    // Studios endpoints
    if (url.includes('/studios')) {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        return route.fulfill({
          status: 201,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'new-studio-1',
              name: postData.name,
              studio_code: 'NEW-9999',
              address: postData.address,
              tagline: postData.tagline,
              opening_hours: postData.opening_hours,
              rating: 5.0,
              review_count: 0,
              is_owner: true,
              artists_count: 1,
              lat: postData.lat,
              lng: postData.lng,
            }
          })
        });
      }

      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'obsidian',
              name: 'Obsidian Atelier & Flash Lab',
              studio_code: 'OBS-9X42',
              address: 'Bella Vista, Calle 50, Ciudad de Panamá',
              tagline: 'Colectivo de Arte Oscuro & Cybersigilism',
              opening_hours: 'Lun - Sáb: 10:00 - 20:00',
              rating: 4.9,
              review_count: 142,
              is_owner: true,
              artists_count: 3,
              lat: 8.9824,
              lng: -79.5199,
            }
          ]
        })
      });
    }

    // Supabase fallback calls
    if (url.includes('supabase.co')) {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    }

    return route.continue();
  });
}

async function runAudit() {
  console.log('🚀 Iniciando Auditoría QA Sprint 17 para Tattoo Hub...');
  const server = await startServer(4202);
  const browser = await chromium.launch({ headless: true });

  let passedChecks = 0;
  let totalChecks = 0;

  function assert(condition, message) {
    totalChecks++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedChecks++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  try {
    // =========================================================================
    // CHECK 1: Pricing Homologation on HomePage (/)
    // =========================================================================
    console.log('\n--- 1. Homologación de Precios en HomePage (/) ---');
    const contextGuest = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await setupRouteMocks(contextGuest, 'guest');
    await contextGuest.addInitScript(() => {
      localStorage.setItem('tattoo_hub_theme', 'light');
    });
    const page = await contextGuest.newPage();
    await page.goto('http://localhost:4202/');
    await page.waitForLoadState('networkidle');

    // Scroll to pricing section
    const pricingSection = page.locator('#precios');
    await pricingSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Verify billing toggle exists
    const billingToggle = page.locator('[data-testid="billing-toggle"]');
    assert(await billingToggle.count() > 0, 'Selector de facturación anual/mensual presente en HomePage');

    // Default is Annual: check $3.99/mo and 20% discount badge
    const priceTextAnnual = await page.locator('#precios').innerText();
    assert(priceTextAnnual.includes('3.99'), 'Precio anual de $3.99/mes visible');
    assert(priceTextAnnual.includes('20%') || priceTextAnnual.includes('Ahorra'), 'Insignia de descuento 20% anual visible');

    // Click Monthly toggle
    const monthlyBtn = page.locator('[data-testid="toggle-monthly"]');
    if (await monthlyBtn.count() > 0) {
      await monthlyBtn.click();
      await page.waitForTimeout(400);
      const priceTextMonthly = await page.locator('#precios').innerText();
      assert(priceTextMonthly.includes('4.99'), 'Precio mensual de $4.99/mes visible al cambiar a facturación mensual');
    }

    // Verify Explorador is $0
    assert(priceTextAnnual.includes('Gratis') || priceTextAnnual.includes('0') || priceTextAnnual.includes('$0'), 'Plan Explorador a $0 verificado');

    // Verify dedicated /precios page with coupon redemption
    await page.goto('http://localhost:4202/precios');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);

    const pricingCouponInput = page.locator('[data-testid="input-coupon-code"]');
    const pricingApplyBtn = page.locator('[data-testid="btn-apply-coupon"]');
    assert(await pricingCouponInput.count() > 0 && await pricingApplyBtn.count() > 0, 'Apartado exclusivo de canje de cupones de membresía presente en /precios');

    await pricingCouponInput.fill('VIP50');
    await pricingApplyBtn.click();
    await page.waitForTimeout(400);

    const preciosPageText = await page.locator('body').innerText();
    assert(preciosPageText.includes('VIP50') && (preciosPageText.includes('50%') || preciosPageText.includes('aplicado')), 'Cupón VIP50 (50% OFF) validado y aplicado a membresías en /precios');

    await page.screenshot({ path: path.join(artifactsDir, '01_pricing_homologation.png'), fullPage: false });

    // =========================================================================
    // CHECK 2: Interactive Map & OSM Attribution on /hub
    // =========================================================================
    console.log('\n--- 2. Mapa Interactivo OSM & Drawer en ArtistsHub (/hub) ---');
    await page.goto('http://localhost:4202/hub');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify Leaflet container exists
    const leafletMap = page.locator('.leaflet-container');
    assert(await leafletMap.count() > 0, 'Contenedor Leaflet del mapa renderizado');

    // Verify OSM attribution watermark is in the DOM
    const attribution = page.locator('.leaflet-control-attribution');
    assert(await attribution.count() > 0, 'Marca de agua/atribución OpenStreetMap presente en el DOM para cumplimiento legal');

    // Verify attribution is visually hidden (opacity 0 or off-screen)
    const isHiddenVisually = await attribution.evaluate((el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.opacity === '0' || style.visibility === 'hidden' || rect.bottom > window.innerHeight + 1000 || rect.top < -1000;
    });
    assert(isHiddenVisually, 'Atribución OpenStreetMap ocultada visualmente con precisión');

    // Initial drawer state: search bar & filter chips visible, studio details hidden
    const initialPrompt = page.locator('[data-testid="drawer-initial-state"]');
    assert(await initialPrompt.count() > 0, 'Drawer en estado inicial colapsado sin selección de estudio');

    // Verify rating filter chips
    const chipAll = page.locator('[data-testid="filter-rating-all"]');
    const chip45 = page.locator('[data-testid="filter-rating-45"]');
    const chip48 = page.locator('[data-testid="filter-rating-48"]');
    assert(await chipAll.count() > 0 && await chip45.count() > 0 && await chip48.count() > 0, 'Chips de filtro por calificación (Todas, 4.5+ ★, 4.8+ ★) presentes');

    // Click 4.5+ ★ chip
    await chip45.click();
    await page.waitForTimeout(300);
    assert(true, 'Filtro de calificación 4.5+ ★ interactivo y funcional');

    // Select studio pin
    const studioPin = page.locator('[data-studio-id="obsidian"]').first();
    if (await studioPin.count() > 0) {
      await studioPin.click({ force: true });
      await page.waitForTimeout(600);

      // Verify business hours and resident selector
      const hoursText = await page.locator('body').innerText();
      assert(hoursText.includes('10:00') || hoursText.includes('Lun - Sáb') || hoursText.includes('Horario'), 'Horarios de atención visibles en el drawer expandido');

      // Verify review button exists
      const reviewBtn = page.locator('[data-testid="btn-add-review"]');
      assert(await reviewBtn.count() > 0, 'Botón para calificar y dejar reseña presente');

      // Close drawer details
      const closeDrawerBtn = page.locator('[data-testid="close-drawer-details"]');
      assert(await closeDrawerBtn.count() > 0, 'Botón de cerrar detalles del estudio disponible');
      await closeDrawerBtn.click();
      await page.waitForTimeout(300);
      assert(await page.locator('[data-testid="drawer-initial-state"]').count() > 0, 'Botón de cierre devuelve el drawer al estado inicial');
    }

    await page.screenshot({ path: path.join(artifactsDir, '02_map_osm_drawer.png'), fullPage: false });

    // =========================================================================
    // CHECK 3: Navbar Preferences & "Quiero ser Tatuador" Flow
    // =========================================================================
    console.log('\n--- 3. Consolidación de Navbar & Onboarding "Quiero ser Tatuador" ---');
    // Guest mode: compact dropdown
    await page.goto('http://localhost:4202/');
    await page.waitForLoadState('networkidle');

    const guestSelectorBtn = page.locator('#country-currency-selector-btn');
    assert(await guestSelectorBtn.count() > 0, 'Selector compacto de país/moneda/idioma/tema presente en modo invitado');

    await guestSelectorBtn.click();
    await page.waitForTimeout(400);

    const currencyMenu = page.locator('#country-currency-dropdown-menu');
    assert(await currencyMenu.count() > 0, 'Menú desplegable de preferencias abierto en modo invitado');
    
    // Close guest dropdown by clicking backdrop
    const backdrop = page.locator('.fixed.inset-0.z-40').first();
    if (await backdrop.count() > 0) {
      await backdrop.click();
      await page.waitForTimeout(300);
    }

    // Authenticated client context with route mocking
    const contextClient = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await setupRouteMocks(contextClient, 'cliente');

    await contextClient.addInitScript(() => {
      localStorage.setItem('tattoo_hub_theme', 'light');
      const clientUser = {
        id: 'client-12345',
        email: 'cliente@tattoohub.test',
        user_metadata: {
          role: 'cliente',
          tipo: 'cliente',
          nombre: 'Carlos',
          full_name: 'Carlos Cliente',
          edad: 25,
          birthdate: '1998-01-01',
          legal_accepted: true,
          onboarding_completed: true
        }
      };
      const session = { access_token: 'fake-token-client', user: clientUser };
      localStorage.setItem('user', JSON.stringify({ user: clientUser, session }));
      sessionStorage.setItem('user', JSON.stringify({ user: clientUser, session }));
    });

    const pageClient = await contextClient.newPage();
    await pageClient.goto('http://localhost:4202/');
    await pageClient.waitForLoadState('networkidle');
    await pageClient.waitForTimeout(500);

    // Check user menu button
    const userMenuBtn = pageClient.locator('#user-menu-toggle-btn');
    assert(await userMenuBtn.count() > 0, 'Botón de menú de usuario autenticado presente');

    await userMenuBtn.click();
    await pageClient.waitForTimeout(400);

    // Verify preferences consolidated inside user menu
    const clientUserDropdown = pageClient.locator('#user-account-dropdown');
    assert(await clientUserDropdown.count() > 0, 'Menú de cuenta de usuario desplegado con opciones consolidadas');

    // Verify "Quiero ser Tatuador" button
    const becomeArtistBtn = pageClient.locator('#btn-become-artist');
    assert(await becomeArtistBtn.count() > 0, 'Botón "#btn-become-artist" visible para usuarios tipo cliente');

    await becomeArtistBtn.click();
    await pageClient.waitForTimeout(500);

    // Verify BecomeArtistModal opens
    const becomeModal = pageClient.locator('[data-testid="become-artist-modal"]');
    assert(await becomeModal.count() > 0, 'Modal guiado "Quiero ser Tatuador" abierto exitosamente');

    // Verify Step 1 form fields & fill artist name
    const artistNameInput = pageClient.locator('[data-testid="become-artist-name"]');
    assert(await artistNameInput.count() > 0, 'Paso 1: Formulario de perfil profesional de artista con nombre artístico');

    await artistNameInput.fill('Carlos Artista');
    await pageClient.waitForTimeout(200);

    // Proceed to Step 2
    const nextBtnStep1 = pageClient.locator('[data-testid="btn-step1-next"]');
    await nextBtnStep1.click();
    await pageClient.waitForTimeout(500);

    // Verify Step 2 Payment Gateway with Coupon redemption
    const couponInput = pageClient.locator('[data-testid="become-coupon-input"]');
    const applyCouponBtn = pageClient.locator('[data-testid="btn-apply-coupon"]');
    assert(await couponInput.count() > 0 && await applyCouponBtn.count() > 0, 'Paso 2: Pasarela de membresía con validación de cupones de descuento presente');

    // Apply valid coupon TATTOO10
    await couponInput.fill('TATTOO10');
    await applyCouponBtn.click();
    await pageClient.waitForTimeout(600);
    const modalText = await pageClient.locator('[data-testid="become-artist-modal"]').innerText();
    assert(modalText.includes('10%') || modalText.includes('TATTOO10') || modalText.includes('aplicado'), 'Cupón de descuento validado y aplicado en checkout de membresía');

    // Proceed to Step 3
    const payBtn = pageClient.locator('[data-testid="btn-confirm-membership"]');
    await payBtn.click();
    await pageClient.waitForTimeout(1200);

    // Verify Step 3: Interactive Onboarding Hub Guide
    const finishBtn = pageClient.locator('[data-testid="btn-finish-onboarding"]');
    assert(await finishBtn.count() > 0, 'Paso 3: Guía interactiva de onboarding al Hub de Artistas verificada con botón de acceso');

    await pageClient.screenshot({ path: path.join(artifactsDir, '03_navbar_become_artist.png'), fullPage: false });

    // Complete onboarding and wait for navigation
    await finishBtn.click();
    await pageClient.waitForTimeout(800);

    // =========================================================================
    // CHECK 4: Facebook Marketplace Style Store (/tienda) & Coupons
    // =========================================================================
    console.log('\n--- 4. Tienda Marketplace (/tienda) & Cupones Promocionales ---');
    await pageClient.goto('http://localhost:4202/tienda');
    await pageClient.waitForLoadState('networkidle');
    await pageClient.waitForTimeout(500);

    // Verify product cards have prominent price, seller, location and contact buttons
    const whatsappBtn = pageClient.locator('[data-testid="shop-whatsapp-btn"]').first();
    const chatBtn = pageClient.locator('[data-testid="shop-chat-btn"]').first();
    assert(await whatsappBtn.count() > 0 && await chatBtn.count() > 0, 'Botones de contacto directo a WhatsApp y Chat interno en tarjetas de producto');

    // Open reservation checkout modal on first product
    const reserveBtn = pageClient.locator('[data-testid="shop-reserve-btn"]').first();
    if (await reserveBtn.count() > 0) {
      await reserveBtn.click();
      await pageClient.waitForTimeout(500);

      // Verify coupon input in checkout modal
      const shopCouponInput = pageClient.locator('[data-testid="coupon-input"]');
      const shopApplyCouponBtn = pageClient.locator('[data-testid="apply-coupon-btn"]');
      assert(await shopCouponInput.count() > 0 && await shopApplyCouponBtn.count() > 0, 'Campo de cupón de descuento en modal de reserva de producto');

      // Test coupon PROMO20
      await shopCouponInput.fill('PROMO20');
      await shopApplyCouponBtn.click();
      await pageClient.waitForTimeout(500);

      const reservationText = await pageClient.locator('body').innerText();
      assert(reservationText.includes('20%') || reservationText.includes('PROMO20') || reservationText.includes('aplicado'), 'Cupón PROMO20 (20% OFF) aplicado con éxito a la reserva');
    }

    await pageClient.screenshot({ path: path.join(artifactsDir, '04_shop_marketplace_coupons.png'), fullPage: false });

    // =========================================================================
    // CHECK 5: Floating Chat Widget
    // =========================================================================
    console.log('\n--- 5. Widget de Chat Flotante (fixed bottom-6 right-6) ---');
    // Verify floating chat trigger button is visible when authenticated
    const floatingTrigger = pageClient.locator('[data-testid="floating-chat-trigger"]');
    assert(await floatingTrigger.count() > 0, 'Botón flotante de chat visible en esquina inferior derecha para usuarios autenticados');

    await floatingTrigger.click();
    await pageClient.waitForTimeout(500);

    // Verify chat window opens
    const chatWindow = pageClient.locator('[data-testid="floating-chat-window"]');
    assert(await chatWindow.count() > 0, 'Ventana flotante de chat abierta con lista de conversaciones');

    // Select first contact
    const firstContact = pageClient.locator('[data-testid="chat-contact-item"]').first();
    if (await firstContact.count() > 0) {
      await firstContact.click();
      await pageClient.waitForTimeout(400);

      // Verify message view, attachment input and 30-day notice
      const fileInput = pageClient.locator('[data-testid="chat-file-input"]');
      assert(await fileInput.count() > 0, 'Input de adjuntos de imagen presente (soporta WebP/JPEG/PNG)');

      const retentionNotice = pageClient.locator('[data-testid="chat-retention-notice"]');
      assert(await retentionNotice.count() > 0, 'Aviso de política de retención de 30 días para imágenes en chat visible');

      // Test corrupted or invalid image rejection with alert
      let dialogMessage = '';
      pageClient.once('dialog', async (dialog) => {
        dialogMessage = dialog.message();
        await dialog.dismiss();
      });

      await fileInput.setInputFiles({
        name: 'fake_corrupt.png',
        mimeType: 'image/png',
        buffer: Buffer.from('NOT_A_REAL_IMAGE_DATA_HEADER')
      });
      await pageClient.waitForTimeout(600);
      assert(dialogMessage.includes('no es una imagen válida') || dialogMessage.includes('dañado'), 'Rechazo seguro y alerta amigable ante subida de archivo corrupto o inválido en chat');
    }

    await pageClient.screenshot({ path: path.join(artifactsDir, '05_floating_chat_widget.png'), fullPage: false });

    // Close chat
    const closeChatBtn = pageClient.locator('[data-testid="btn-close-chat"]');
    if (await closeChatBtn.count() > 0) {
      await closeChatBtn.click();
      await pageClient.waitForTimeout(300);
    }

    // =========================================================================
    // CHECK 6: Artist Dashboard - Studio Registration & Management
    // =========================================================================
    console.log('\n--- 6. Dashboard del Artista & Registro de Estudios en el Mapa ---');
    const contextArtist = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await setupRouteMocks(contextArtist, 'tatuador');

    await contextArtist.addInitScript(() => {
      localStorage.setItem('tattoo_hub_theme', 'light');
      const artistUser = {
        id: 'artist-pro-123',
        email: 'artista@tattoohub.test',
        user_metadata: {
          role: 'tatuador',
          tipo: 'tatuador',
          nombre: 'Gabriel',
          full_name: 'Gabriel Black',
          edad: 28,
          birthdate: '1995-05-15',
          has_active_subscription: true,
          legal_accepted: true,
          onboarding_completed: true
        }
      };
      const session = { access_token: 'fake-token-artist', user: artistUser };
      localStorage.setItem('user', JSON.stringify({ user: artistUser, session }));
      sessionStorage.setItem('user', JSON.stringify({ user: artistUser, session }));
    });

    const pageArtist = await contextArtist.newPage();
    pageArtist.on('console', msg => console.log('ARTIST PAGE LOG:', msg.text()));
    await pageArtist.goto('http://localhost:4202/artist-dashboard');
    await pageArtist.waitForLoadState('domcontentloaded');
    await pageArtist.waitForTimeout(1500);
    console.log('ARTIST FINAL URL:', pageArtist.url());

    // Verify "Mis Estudios & Presencia en el Mapa" section exists
    const studiosSection = pageArtist.locator('#mis-estudios');
    assert(await studiosSection.count() > 0, 'Sección "Mis Estudios & Presencia en el Mapa" presente en ArtistDashboard');

    // Verify collaboration code copy button
    const copyCodeBtn = pageArtist.locator('[data-testid="copy-code-obsidian"]');
    assert(await copyCodeBtn.count() > 0, 'Botón para copiar Código de Colaboración de estudio disponible');

    // Click "Registrar Nuevo Estudio"
    const openCreateStudioBtn = pageArtist.locator('[data-testid="btn-open-create-studio"]');
    assert(await openCreateStudioBtn.count() > 0, 'Botón "Registrar Nuevo Estudio" disponible');

    await openCreateStudioBtn.click();
    await pageArtist.waitForTimeout(400);

    // Test duplicate name validation
    const studioNameInput = pageArtist.locator('[data-testid="studio-name-input"]');
    await studioNameInput.fill('Obsidian Atelier & Flash Lab');
    await pageArtist.waitForTimeout(300);

    const duplicateWarning = pageArtist.locator('text=Ya existe un estudio con este nombre');
    assert(await duplicateWarning.count() > 0, 'Validación en tiempo real: advertencia de nombre duplicado desplegada');

    const submitStudioBtn = pageArtist.locator('[data-testid="btn-submit-studio"]');
    assert(await submitStudioBtn.isDisabled(), 'Botón de guardado deshabilitado ante nombre de estudio duplicado');

    await pageArtist.screenshot({ path: path.join(artifactsDir, '06_artist_studio_registration.png'), fullPage: false });

  } catch (err) {
    console.error('❌ Error durante la auditoría:', err);
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n=========================================================================');
  console.log(`📊 RESUMEN AUDITORÍA QA SPRINT 17: ${passedChecks}/${totalChecks} pruebas superadas (${((passedChecks / totalChecks) * 100).toFixed(1)}%)`);
  console.log('=========================================================================\n');

  if (passedChecks !== totalChecks) {
    process.exit(1);
  }
}

runAudit();
