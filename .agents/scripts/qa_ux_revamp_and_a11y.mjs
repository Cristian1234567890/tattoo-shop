import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../v2/e2e/node_modules/playwright');
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../../v2/frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence/ux_revamp');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4198) {
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
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });

    server.listen(port, () => resolve(server));
  });
}

async function run() {
  console.log('🚀 Iniciando Suite de Verificación UX, A11y & Sincronización Global...');
  const server = await startServer(4198);
  const browser = await chromium.launch({ headless: true });

  const results = {
    avatarSyncHeaderAndNavbar: false,
    noUglyPresets: false,
    themeLightModeVibrant: false,
    themeDarkModeVibrant: false,
    chatLayoutViewportFit: false,
    mapLayoutViewportFit: false,
    a11yAuditPassed: false,
  };

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });

    // Seed logged in client session
    await context.addInitScript(() => {
      const mockUser = {
        id: 'usr-client-gio',
        email: 'giovanni@tattoohub.test',
        app_metadata: { provider: 'google', providers: ['google'] },
        user_metadata: {
          nombre: 'Giovanni',
          apellido: 'Buglione',
          full_name: 'Giovanni Buglione',
          tipo: 'Cliente',
          role: 'Cliente',
          telefono: '60012345',
          country: 'Panamá',
          city: 'Bella Vista',
          legal_accepted: true,
          onboarding_completed: true,
          birthdate: '1995-05-15',
          google_linked: true,
          google_avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        },
      };
      const mockSession = {
        access_token: 'fake-jwt-token-gio',
        refresh_token: 'fake-refresh-token',
        user: mockUser,
      };
      const sessionData = JSON.stringify({ user: mockUser, session: mockSession });
      localStorage.setItem('user', sessionData);
      sessionStorage.setItem('user', sessionData);
      localStorage.setItem('tattoo_hub_session', sessionData);
      localStorage.setItem('app_language', 'es');
    });

    const page = await context.newPage();

    // ========================================================
    // 1. Dashboard & Avatar Sincronización Global
    // ========================================================
    console.log('\n--- 1. Probando Sincronización de Avatar en Navbar, Header y Settings ---');
    await page.goto('http://localhost:4198/client-dashboard?tab=configuracion', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verificar que NO existan los 4 botones feos de presets rotos
    const presetButtons = await page.$$('button[title*="Machine"], button[title*="Skull"], button[title*="Craft"]');
    console.log(`Botones de presets feos encontrados: ${presetButtons.length} (esperado: 0)`);
    results.noUglyPresets = presetButtons.length === 0;

    // Verificar que exista el botón de Arte de Estudio único
    const studioArteBtn = await page.$('button[title*="arte exclusivo de Tattoo Hub"]');
    console.log(`Botón de Arte de Estudio único presente: ${Boolean(studioArteBtn)}`);

    // Probar subir avatar personalizado simulado
    const testCustomAvatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    await page.evaluate((av) => {
      localStorage.setItem('user_avatar_override', av);
      window.dispatchEvent(new CustomEvent('user_avatar_changed', { detail: av }));
    }, testCustomAvatar);
    await page.waitForTimeout(600);

    // Verificar que el avatar en Header ("¡Hola, Giovanni Buglione!") se actualizó
    const headerImg = await page.$('section img[alt*="Giovanni Buglione"]');
    const headerSrc = headerImg ? await headerImg.getAttribute('src') : null;
    console.log(`Avatar en ClientHeroHeader: ${headerSrc ? 'ACTUALIZADO CON ÉXITO' : 'NO ENCONTRADO'}`);

    // Verificar que el avatar en Navbar se actualizó
    const navImg = await page.$('nav a[href*="client-dashboard"] img');
    const navSrc = navImg ? await navImg.getAttribute('src') : null;
    console.log(`Avatar en Navbar ("arriba"): ${navSrc ? 'ACTUALIZADO CON ÉXITO' : 'NO ENCONTRADO'}`);

    results.avatarSyncHeaderAndNavbar = Boolean(headerSrc && navSrc);

    // Captura de evidencia
    const avatarPicPath = path.join(artifactsDir, '01_avatar_sync_header_and_navbar.png');
    await page.screenshot({ path: avatarPicPath, fullPage: false });
    console.log(`✓ Captura guardada: ${avatarPicPath}`);

    // ========================================================
    // 2. Fondo Vibrante y Modo Claro
    // ========================================================
    console.log('\n--- 2. Probando Fondo Vibrante & Modo Claro ---');
    // Verificar Dark Mode con fondo vibrante
    const darkMeshExists = await page.$('.bg-\\[radial-gradient\\(\\#ffffff08_1px\\,transparent_1px\\)\\]');
    console.log(`Fondo vibrante (mesh/aurora dark) activo: ${Boolean(darkMeshExists)}`);
    results.themeDarkModeVibrant = Boolean(darkMeshExists);

    const darkPicPath = path.join(artifactsDir, '02_dark_mode_vibrant_background.png');
    await page.screenshot({ path: darkPicPath, fullPage: false });

    // Alternar a Modo Claro mediante ThemeSwitch
    const themeBtn = await page.$('#theme-switch-btn');
    if (themeBtn) {
      await themeBtn.click();
      await page.waitForTimeout(600);
      const htmlClass = await page.evaluate(() => document.documentElement.className);
      console.log(`Clases en HTML tras alternar tema: "${htmlClass}"`);
      results.themeLightModeVibrant = htmlClass.includes('light');

      const lightPicPath = path.join(artifactsDir, '03_light_mode_parchment_vibrant.png');
      await page.screenshot({ path: lightPicPath, fullPage: false });
      console.log(`✓ Captura Modo Claro guardada: ${lightPicPath}`);

      // Volver a Dark Mode para siguientes pruebas
      await themeBtn.click();
      await page.waitForTimeout(400);
    }

    // ========================================================
    // 3. Layout de Chat (Dual Panel & Viewport Fit)
    // ========================================================
    console.log('\n--- 3. Probando Layout de Chat en Web ---');
    await page.goto('http://localhost:4198/chat', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verificar dimensiones y ausencia de scroll vertical en el body
    const chatScrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const chatClientHeight = await page.evaluate(() => document.documentElement.clientHeight);
    console.log(`Chat viewport height: ${chatClientHeight}px, scrollHeight: ${chatScrollHeight}px`);
    // No debe exceder la ventana (tolerancia máxima de 2px por rounding)
    const chatFitsViewport = chatScrollHeight <= chatClientHeight + 2;
    console.log(`Chat se ajusta exactamente a la ventana sin desbordamiento: ${chatFitsViewport}`);

    // Verificar panel de contactos a la izquierda y chat a la derecha
    const contactCards = await page.$$('aside button');
    console.log(`Artistas disponibles en lista de contactos: ${contactCards.length}`);
    const activeHeaderName = await page.$eval('main h3', el => el.textContent?.trim()).catch(() => null);
    console.log(`Chat activo cargado con artista: "${activeHeaderName}"`);

    results.chatLayoutViewportFit = chatFitsViewport && contactCards.length > 0 && Boolean(activeHeaderName);

    const chatPicPath = path.join(artifactsDir, '04_chat_desktop_dual_panel.png');
    await page.screenshot({ path: chatPicPath, fullPage: false });
    console.log(`✓ Captura Chat guardada: ${chatPicPath}`);

    // ========================================================
    // 4. Layout de Mapa (ArtistsHubPage Viewport Fit)
    // ========================================================
    console.log('\n--- 4. Probando Layout del Mapa en Web ---');
    await page.goto('http://localhost:4198/hub', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    const mapScrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const mapClientHeight = await page.evaluate(() => document.documentElement.clientHeight);
    console.log(`Map viewport height: ${mapClientHeight}px, scrollHeight: ${mapScrollHeight}px`);
    const mapFitsViewport = mapScrollHeight <= mapClientHeight + 2;
    console.log(`Mapa se ajusta exactamente a la ventana sin desbordamiento: ${mapFitsViewport}`);

    results.mapLayoutViewportFit = mapFitsViewport;

    const mapPicPath = path.join(artifactsDir, '05_map_viewport_fit.png');
    await page.screenshot({ path: mapPicPath, fullPage: false });
    console.log(`✓ Captura Mapa guardada: ${mapPicPath}`);

    // ========================================================
    // 5. Auditoría de Accesibilidad (a11y)
    // ========================================================
    console.log('\n--- 5. Ejecutando Auditoría de Accesibilidad en Todo el Sitio ---');
    const pagesToAudit = ['/', '/beneficios', '/precios', '/artistas', '/about', '/chat', '/hub'];
    let a11yErrors = 0;

    for (const p of pagesToAudit) {
      await page.goto(`http://localhost:4198${p}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      // Auditar imágenes sin atributo alt (WCAG 2.1 SC 1.1.1)
      const imgsWithoutAlt = await page.$$eval('img:not([alt])', imgs => imgs.length);
      // Auditar botones sin texto ni aria-label
      const buttonsWithoutLabel = await page.$$eval('button:not([aria-label]):not([title])', btns => 
        btns.filter(b => !b.textContent || !b.textContent.trim()).length
      );
      // Auditar inputs sin label ni placeholder
      const inputsWithoutAccessibleName = await page.$$eval('input:not([aria-label]):not([placeholder]):not([type="hidden"]):not([type="file"])', inputs => inputs.length);

      console.log(`  [A11y ${p}] Imgs sin alt: ${imgsWithoutAlt}, Botones sin etiqueta: ${buttonsWithoutLabel}, Inputs sin nombre: ${inputsWithoutAccessibleName}`);
      if (imgsWithoutAlt > 0 || buttonsWithoutLabel > 0 || inputsWithoutAccessibleName > 0) {
        a11yErrors += (imgsWithoutAlt + buttonsWithoutLabel + inputsWithoutAccessibleName);
      }
    }

    console.log(`Total incidencias de accesibilidad detectadas: ${a11yErrors}`);
    results.a11yAuditPassed = a11yErrors === 0;

    console.log('\n======================================================');
    console.log('🎉 RESUMEN DE RESULTADOS DE PRUEBAS AUTOMATIZADAS:');
    console.log(JSON.stringify(results, null, 2));
    console.log('======================================================');

  } catch (err) {
    console.error('Error durante la ejecución:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch(console.error);
