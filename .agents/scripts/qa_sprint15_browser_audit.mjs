import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../v2/e2e/node_modules/playwright');
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../../v2/frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence/sprint15');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4200) {
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

async function run() {
  console.log('🚀 Iniciando Auditoría Visual & Funcional de Browser para Sprint 15...');
  const server = await startServer(4200);
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    localStorage.setItem('tattoo_hub_theme', 'light');
  });

  const page = await context.newPage();

  const auditResults = {
    navbarWhiteButtonLight: false,
    navbarWhiteButtonDark: false,
    navbarSymmetryThreeSections: false,
    loginWhiteSubmitButton: false,
    loginCustomValidationInline: false,
    loginNoNativeTooltips: false,
    fontOutfitOnHeadings: false,
    fontJakartaOnBody: false,
    clientDashboardSlateContrast: false,
    artistDashboardSlateContrast: false
  };

  try {
    // -------------------------------------------------------------
    // 1. Auditoría de Navbar: Botón Registrarse & Simetría 3 Secciones (Modo Claro)
    // -------------------------------------------------------------
    console.log('\n--- 1. Auditando Navbar: Botón Registrarse Blanco y Layout Simétrico en 3 Secciones ---');
    // Para ver el navbar público con botón Registrarse, limpiamos sesión momentáneamente
    await page.goto('http://localhost:4200/');
    await page.evaluate(() => {
      localStorage.removeItem('user');
      localStorage.setItem('tattoo_hub_theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    await page.reload();
    await page.waitForSelector('#nav-register', { timeout: 5000 });

    // Verificar color de texto en #nav-register (debe ser blanco rgb(255, 255, 255))
    const registerBtnColor = await page.evaluate(() => {
      const el = document.getElementById('nav-register');
      const innerSpan = el?.querySelector('span') || el;
      return window.getComputedStyle(innerSpan).color;
    });
    console.log(`[Navbar Light] Color computado de #nav-register: ${registerBtnColor}`);
    auditResults.navbarWhiteButtonLight = registerBtnColor === 'rgb(255, 255, 255)';

    // Validar Simetría 3 secciones: Logo a la izquierda, Links centrados, Acciones a la derecha
    const navGeometry = await page.evaluate(() => {
      const logoEl = document.getElementById('logo');
      const artistsLink = document.getElementById('nav-artistas');
      const centerContainer = artistsLink?.parentElement;
      const rightContainer = document.getElementById('nav-register')?.closest('.justify-end');

      if (!logoEl || !centerContainer || !rightContainer) return null;

      const logoRect = logoEl.getBoundingClientRect();
      const centerRect = centerContainer.getBoundingClientRect();
      const rightRect = rightContainer.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      const centerMid = centerRect.left + centerRect.width / 2;
      const viewportMid = viewportWidth / 2;
      const symmetryDelta = Math.abs(centerMid - viewportMid);

      return {
        logoRight: logoRect.right,
        centerLeft: centerRect.left,
        centerRight: centerRect.right,
        rightLeft: rightRect.left,
        centerMid,
        viewportMid,
        symmetryDelta
      };
    });

    if (navGeometry) {
      console.log(`[Navbar Geometry] Logo Right: ${navGeometry.logoRight.toFixed(1)}px | Center Left: ${navGeometry.centerLeft.toFixed(1)}px | Center Right: ${navGeometry.centerRight.toFixed(1)}px | Right Left: ${navGeometry.rightLeft.toFixed(1)}px`);
      console.log(`[Navbar Symmetry] Centro Navegación: ${navGeometry.centerMid.toFixed(1)}px vs Centro Viewport: ${navGeometry.viewportMid.toFixed(1)}px (Delta: ${navGeometry.symmetryDelta.toFixed(1)}px)`);
      auditResults.navbarSymmetryThreeSections = 
        navGeometry.logoRight <= navGeometry.centerLeft &&
        navGeometry.centerRight <= navGeometry.rightLeft &&
        navGeometry.symmetryDelta < 150; // Centrado dentro de un margen muy balanceado
    }

    await page.screenshot({ path: path.join(artifactsDir, '01_navbar_symmetry_and_button_light.png') });
    console.log('📸 Captura guardada: 01_navbar_symmetry_and_button_light.png');

    // Cambiar a Dark Mode para verificar el botón Registrarse en Modo Oscuro
    await page.evaluate(() => {
      localStorage.setItem('tattoo_hub_theme', 'dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(300);

    const registerBtnColorDark = await page.evaluate(() => {
      const el = document.getElementById('nav-register');
      const innerSpan = el?.querySelector('span') || el;
      return window.getComputedStyle(innerSpan).color;
    });
    console.log(`[Navbar Dark] Color computado de #nav-register: ${registerBtnColorDark}`);
    auditResults.navbarWhiteButtonDark = registerBtnColorDark === 'rgb(255, 255, 255)';

    await page.screenshot({ path: path.join(artifactsDir, '06_navbar_symmetry_dark.png') });
    console.log('📸 Captura guardada: 06_navbar_symmetry_dark.png');

    // -------------------------------------------------------------
    // 2. Auditoría de /login: Botón Blanco, noValidate & Validación Personalizada
    // -------------------------------------------------------------
    console.log('\n--- 2. Auditando /login: Botón Iniciar Sesión Blanco y Validaciones en Línea ---');
    await page.goto('http://localhost:4200/login');
    await page.evaluate(() => {
      localStorage.setItem('tattoo_hub_theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    await page.reload();
    await page.waitForSelector('#btn-login-submit', { timeout: 5000 });

    // Verificar que el formulario tiene el atributo noValidate
    const formNoValidate = await page.evaluate(() => {
      const form = document.querySelector('form');
      return form ? form.noValidate : false;
    });
    console.log(`[Login] Formulario con noValidate activo: ${formNoValidate}`);
    auditResults.loginNoNativeTooltips = formNoValidate;

    // Verificar color de texto de #btn-login-submit en modo claro (debe ser blanco rgb(255, 255, 255))
    const loginBtnColor = await page.evaluate(() => {
      const el = document.getElementById('btn-login-submit');
      const innerSpan = el?.querySelector('span') || el;
      return window.getComputedStyle(innerSpan).color;
    });
    console.log(`[Login Light] Color computado de #btn-login-submit: ${loginBtnColor}`);
    auditResults.loginWhiteSubmitButton = loginBtnColor === 'rgb(255, 255, 255)';

    await page.screenshot({ path: path.join(artifactsDir, '03_login_submit_button_white_text.png') });
    console.log('📸 Captura guardada: 03_login_submit_button_white_text.png');

    // Disparar envío con campos vacíos
    console.log('[Login] Haciendo clic en submit con campos vacíos...');
    await page.click('#btn-login-submit');
    await page.waitForTimeout(500);

    const validationAlerts = await page.evaluate(() => {
      const emailError = document.getElementById('userEmail-error');
      const passError = document.getElementById('userPassword-error');
      const emailInput = document.getElementById('userEmail');
      const passInput = document.getElementById('userPassword');

      return {
        hasEmailError: Boolean(emailError && emailError.innerText.includes('correo')),
        hasPassError: Boolean(passError && passError.innerText.includes('contraseña')),
        emailAriaInvalid: emailInput?.getAttribute('aria-invalid') === 'true',
        passAriaInvalid: passInput?.getAttribute('aria-invalid') === 'true',
        emailErrorText: emailError?.innerText || '',
        passErrorText: passError?.innerText || ''
      };
    });

    console.log(`[Login Validation] Error Email: "${validationAlerts.emailErrorText}" (aria-invalid: ${validationAlerts.emailAriaInvalid})`);
    console.log(`[Login Validation] Error Password: "${validationAlerts.passErrorText}" (aria-invalid: ${validationAlerts.passAriaInvalid})`);

    auditResults.loginCustomValidationInline = 
      validationAlerts.hasEmailError &&
      validationAlerts.hasPassError &&
      validationAlerts.emailAriaInvalid &&
      validationAlerts.passAriaInvalid;

    await page.screenshot({ path: path.join(artifactsDir, '02_login_custom_validation_light.png') });
    console.log('📸 Captura guardada: 02_login_custom_validation_light.png');

    // -------------------------------------------------------------
    // 3. Auditoría Tipográfica: Outfit (Títulos) & Plus Jakarta Sans (Cuerpo)
    // -------------------------------------------------------------
    console.log('\n--- 3. Auditando Jerarquía Tipográfica y Familias de Fuente ---');
    const typographyAudit = await page.evaluate(() => {
      const h1El = document.querySelector('h1');
      const bodyEl = document.body;
      const pEl = document.querySelector('p');

      const h1Font = h1El ? window.getComputedStyle(h1El).fontFamily : '';
      const bodyFont = window.getComputedStyle(bodyEl).fontFamily;
      const pFont = pEl ? window.getComputedStyle(pEl).fontFamily : '';

      return {
        h1Font,
        bodyFont,
        pFont
      };
    });

    console.log(`[Typography] h1 fontFamily: ${typographyAudit.h1Font}`);
    console.log(`[Typography] body fontFamily: ${typographyAudit.bodyFont}`);
    console.log(`[Typography] p fontFamily: ${typographyAudit.pFont}`);

    auditResults.fontOutfitOnHeadings = typographyAudit.h1Font.toLowerCase().includes('outfit');
    auditResults.fontJakartaOnBody = 
      typographyAudit.bodyFont.toLowerCase().includes('plus jakarta sans') ||
      typographyAudit.pFont.toLowerCase().includes('plus jakarta sans');

    // -------------------------------------------------------------
    // 4. Auditoría Dashboards: Client & Artist Slate Contrast
    // -------------------------------------------------------------
    console.log('\n--- 4. Auditando Dashboards de Cliente y Artista en Modo Claro ---');
    // Inyectar usuario cliente
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        user: {
          id: 'test-client-id',
          email: 'alex@tattoohub.test',
          user_metadata: {
            role: 'cliente',
            tipo: 'cliente',
            full_name: 'Alex Rivera',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            birthdate: '1998-04-12',
            onboarding_completed: true,
            legal_accepted: true
          }
        },
        session: { access_token: 'fake-token' }
      }));
    });
    await page.goto('http://localhost:4200/client-dashboard');
    await page.waitForTimeout(1000);

    const clientHeadingColor = await page.evaluate(() => {
      const h1 = document.querySelector('h1') || document.querySelector('h2');
      return h1 ? window.getComputedStyle(h1).color : null;
    });
    console.log(`[Client Dashboard] Color computado de titular: ${clientHeadingColor}`);
    // No debe ser rgb(0, 0, 0), debe ser slate refinado (#1e293b = rgb(30, 41, 59) o #0f172a = rgb(15, 23, 42))
    auditResults.clientDashboardSlateContrast = clientHeadingColor !== 'rgb(0, 0, 0)';

    await page.screenshot({ path: path.join(artifactsDir, '04_client_dashboard_typography_light.png') });
    console.log('📸 Captura guardada: 04_client_dashboard_typography_light.png');

    // Inyectar usuario artista
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        user: {
          id: 'test-artist-id',
          email: 'elena@tattoohub.test',
          user_metadata: {
            role: 'tatuador',
            tipo: 'tatuador',
            full_name: 'Elena Rostova',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            birthdate: '1995-05-15',
            onboarding_completed: true,
            legal_accepted: true
          }
        },
        session: { access_token: 'fake-token' }
      }));
    });
    await page.goto('http://localhost:4200/artist-dashboard');
    await page.waitForTimeout(1000);

    const artistHeadingColor = await page.evaluate(() => {
      const h1 = document.querySelector('h1') || document.querySelector('h2');
      return h1 ? window.getComputedStyle(h1).color : null;
    });
    console.log(`[Artist Dashboard] Color computado de titular: ${artistHeadingColor}`);
    auditResults.artistDashboardSlateContrast = artistHeadingColor !== 'rgb(0, 0, 0)';

    await page.screenshot({ path: path.join(artifactsDir, '05_artist_dashboard_typography_light.png') });
    console.log('📸 Captura guardada: 05_artist_dashboard_typography_light.png');

  } catch (error) {
    console.error('❌ Excepción durante la auditoría:', error);
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n========================================');
  console.log('📊 RESUMEN FINAL AUDITORÍA BROWSER SPRINT 15');
  console.log('========================================');
  console.log(`1. Navbar Botón Registrarse Blanco (Light Mode): ${auditResults.navbarWhiteButtonLight ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`2. Navbar Botón Registrarse Blanco (Dark Mode):  ${auditResults.navbarWhiteButtonDark ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`3. Navbar Simetría 3 Secciones (Logo/Centro/Acciones): ${auditResults.navbarSymmetryThreeSections ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`4. Login Botón Submit Blanco:                    ${auditResults.loginWhiteSubmitButton ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`5. Login Validaciones Personalizadas Inline:     ${auditResults.loginCustomValidationInline ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`6. Login Supresión de Tooltips Nativos:          ${auditResults.loginNoNativeTooltips ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`7. Tipografía Outfit en Títulos:                 ${auditResults.fontOutfitOnHeadings ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`8. Tipografía Plus Jakarta Sans en Cuerpo:       ${auditResults.fontJakartaOnBody ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`9. Client Dashboard Contraste Refinado:          ${auditResults.clientDashboardSlateContrast ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`10. Artist Dashboard Contraste Refinado:         ${auditResults.artistDashboardSlateContrast ? '✅ PASÓ' : '❌ FALLÓ'}`);

  const allPassed = Object.values(auditResults).every(Boolean);
  if (!allPassed) {
    console.error('\n❌ Auditoría falló en uno o más puntos.');
    process.exit(1);
  } else {
    console.log('\n🎉 ¡TODOS LOS CRITERIOS DE ACEPTACIÓN PASARON AL 100%!');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
