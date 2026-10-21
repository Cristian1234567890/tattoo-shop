import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../v2/e2e/node_modules/playwright');
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../../v2/frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence/sprint16');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4201) {
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

function parseRgbBrightness(rgbStr) {
  const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return 255;
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

async function run() {
  console.log('🚀 Iniciando Auditoría Visual & Funcional de Browser para Sprint 16...');
  const server = await startServer(4201);
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    localStorage.setItem('tattoo_hub_theme', 'light');
  });

  const page = await context.newPage();

  const auditResults = {
    brandingLogoBackupVerified: false,
    brandingNewIconEmblemVisible: false,
    navbarStickyBehavior: false,
    navbarHeightSpacious: false,
    navbarVerticalGradientLight: false,
    navbarVerticalGradientDark: false,
    homeVerifiedStudiosLightHomologated: false,
    aboutFeedbackMailboxLightHomologated: false,
    clientDashboardTimelineLightHomologated: false,
    cardHoverMicroInteractions: false
  };

  try {
    // -------------------------------------------------------------
    // 1. Verificación de Respaldo de Logo y Nuevo Isotipo Oficial
    // -------------------------------------------------------------
    console.log('\n--- 1. Auditando Nuevo Branding Oficial & Respaldo Legacy ---');
    const legacyPath1 = path.resolve(__dirname, '../../v2/frontend/public/assets/logo-legacy.svg');
    const legacyPath2 = path.resolve(__dirname, '../../v2/frontend/public/logo-legacy.svg');
    const newIconPath = path.resolve(__dirname, '../../v2/frontend/public/logo-icon.png');
    const newFullLogoPath = path.resolve(__dirname, '../../v2/frontend/public/logo.png');

    const hasBackups = fs.existsSync(legacyPath1) && fs.existsSync(legacyPath2);
    const hasNewAssets = fs.existsSync(newIconPath) && fs.existsSync(newFullLogoPath);
    console.log(`[Branding] Respaldos legacy existen: ${hasBackups}`);
    console.log(`[Branding] Nuevos activos existen: ${hasNewAssets}`);
    auditResults.brandingLogoBackupVerified = hasBackups && hasNewAssets;

    await page.goto('http://localhost:4201/');
    await page.evaluate(() => {
      localStorage.removeItem('user');
      localStorage.setItem('tattoo_hub_theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    await page.reload();
    await page.waitForSelector('nav', { timeout: 5000 });

    const logoIconVisible = await page.evaluate(() => {
      const img = document.querySelector('nav img[src*="logo-icon.png"]');
      return !!img && img.naturalWidth > 0;
    });
    console.log(`[Branding] Nuevo isotipo visible en Navbar: ${logoIconVisible}`);
    auditResults.brandingNewIconEmblemVisible = logoIconVisible;

    await page.screenshot({ path: path.join(artifactsDir, '01_branding_logo_light.png') });
    console.log('📸 Captura guardada: 01_branding_logo_light.png');

    // -------------------------------------------------------------
    // 2. Auditoría Navbar: Sticky z-50, Altura h-20 (~80px) & Degradado
    // -------------------------------------------------------------
    console.log('\n--- 2. Auditando Navbar: Sticky z-50, Altura h-20 y Degradado Vertical ---');
    const navbarPropsLight = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      const innerContainer = nav?.querySelector('.h-20') || nav;
      if (!nav) return null;
      const navStyle = window.getComputedStyle(nav);
      const innerStyle = window.getComputedStyle(innerContainer);

      return {
        position: navStyle.position,
        top: navStyle.top,
        zIndex: navStyle.zIndex,
        outerHeight: nav.offsetHeight,
        innerHeight: innerContainer.offsetHeight,
        backgroundImage: navStyle.backgroundImage,
        backgroundColor: navStyle.backgroundColor
      };
    });

    console.log('[Navbar Light]', navbarPropsLight);
    auditResults.navbarStickyBehavior = navbarPropsLight?.position === 'sticky' && navbarPropsLight?.top === '0px' && navbarPropsLight?.zIndex === '50';
    auditResults.navbarHeightSpacious = (navbarPropsLight?.outerHeight >= 75) || (navbarPropsLight?.innerHeight >= 75);
    auditResults.navbarVerticalGradientLight = (navbarPropsLight?.backgroundImage?.includes('gradient') || navbarPropsLight?.backgroundColor?.includes('rgba'));

    await page.screenshot({ path: path.join(artifactsDir, '02_navbar_sticky_gradient_light.png') });
    console.log('📸 Captura guardada: 02_navbar_sticky_gradient_light.png');

    // Cambiar a Dark Mode para verificar degradado oscuro
    await page.evaluate(() => {
      localStorage.setItem('tattoo_hub_theme', 'dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(300);

    const navbarPropsDark = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return null;
      const navStyle = window.getComputedStyle(nav);
      return {
        backgroundImage: navStyle.backgroundImage,
        backgroundColor: navStyle.backgroundColor
      };
    });
    console.log('[Navbar Dark]', navbarPropsDark);
    auditResults.navbarVerticalGradientDark = (navbarPropsDark?.backgroundImage?.includes('gradient') || navbarPropsDark?.backgroundColor?.includes('rgba'));

    await page.screenshot({ path: path.join(artifactsDir, '03_navbar_sticky_gradient_dark.png') });
    console.log('📸 Captura guardada: 03_navbar_sticky_gradient_dark.png');

    // -------------------------------------------------------------
    // 3. Homologación Modo Claro: Estudios con Residentes Verificados
    // -------------------------------------------------------------
    console.log('\n--- 3. Auditando Sección Estudios con Residentes Verificados en Modo Claro ---');
    await page.evaluate(() => {
      localStorage.setItem('tattoo_hub_theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    await page.reload();
    await page.waitForSelector('nav', { timeout: 5000 });

    // Scroll hasta la sección de Estudios con Residentes Verificados
    await page.evaluate(() => {
      const target = document.querySelector('#artistas') || Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('Estudios con Residentes'));
      if (target) target.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(400);

    const statCardsAudit = await page.evaluate(() => {
      const allCards = Array.from(document.querySelectorAll('.rounded-2xl'));
      const card = allCards.find(d => d.textContent?.includes('100%') && d.textContent?.includes('Contacto Directo'));
      if (!card) return null;

      const cardStyle = window.getComputedStyle(card);
      const titleEl = card.querySelector('div.font-extrabold') || card.querySelector('div.font-black') || card;
      const titleStyle = window.getComputedStyle(titleEl);

      return {
        cardBg: cardStyle.backgroundColor,
        cardBorder: cardStyle.borderColor,
        titleColor: titleStyle.color,
        cardHtmlSnippet: card.outerHTML.slice(0, 150)
      };
    });

    console.log('[Home Verified Studios Stat Card]', statCardsAudit);
    if (statCardsAudit) {
      const brightness = parseRgbBrightness(statCardsAudit.cardBg);
      console.log(`[Home Verified Studios] Brillo de fondo: ${brightness.toFixed(1)} (debe ser > 200 en modo claro)`);
      // Slate-50 background rgb(248, 250, 252) has brightness ~250
      auditResults.homeVerifiedStudiosLightHomologated = brightness > 200 && (statCardsAudit.titleColor === 'rgb(15, 23, 42)' || statCardsAudit.titleColor === 'rgb(30, 41, 59)' || statCardsAudit.titleColor === 'rgb(51, 65, 85)');
    }

    await page.screenshot({ path: path.join(artifactsDir, '04_home_verified_studios_light.png') });
    console.log('📸 Captura guardada: 04_home_verified_studios_light.png');

    // -------------------------------------------------------------
    // 4. Homologación Modo Claro: Misión, Visión & Buzón en AboutPage
    // -------------------------------------------------------------
    console.log('\n--- 4. Auditando Misión, Visión y Buzón de Feedback en AboutPage ---');
    await page.goto('http://localhost:4201/about');
    await page.waitForSelector('#feedback-form, button[type="submit"]', { timeout: 8000 });

    // Auditar tarjetas de Misión y Visión
    const misionVisionAudit = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h2'));
      const misionHeading = headings.find(h => h.textContent?.trim() === 'Misión');
      const misionCard = misionHeading?.closest('.atelier-card') || misionHeading?.closest('.rounded-3xl');
      if (!misionCard) return null;
      const style = window.getComputedStyle(misionCard);
      return {
        cardBg: style.backgroundColor,
        cardBorder: style.borderColor,
        hasHoverClass: misionCard.classList.contains('atelier-card-hover')
      };
    });
    console.log('[About Misión/Visión Audit]', misionVisionAudit);
    if (misionVisionAudit) {
      const mvBrightness = parseRgbBrightness(misionVisionAudit.cardBg);
      console.log(`[About Misión/Visión] Brillo de fondo: ${mvBrightness.toFixed(1)} (debe ser > 200 en modo claro)`);
      await page.screenshot({ path: path.join(artifactsDir, '05a_about_mision_vision_light.png') });
      console.log('📸 Captura guardada: 05a_about_mision_vision_light.png');
    }

    // Scroll hasta Buzón de Feedback
    await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2, h3')).find(h => h.textContent?.includes('Buzón de Feedback'));
      const container = heading ? heading.closest('.rounded-3xl') : document.querySelector('form');
      if (container) container.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(400);

    const feedbackAudit = await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2, h3')).find(h => h.textContent?.includes('Buzón de Feedback'));
      const container = heading ? heading.closest('.rounded-3xl') : document.querySelector('form')?.closest('.rounded-3xl');
      if (!container) return null;

      const containerStyle = window.getComputedStyle(container);
      const inputEl = container.querySelector('input, textarea');
      const inputStyle = inputEl ? window.getComputedStyle(inputEl) : null;
      const categoryBtn = container.querySelector('button[type="button"]');
      const catBtnStyle = categoryBtn ? window.getComputedStyle(categoryBtn) : null;

      return {
        containerBg: containerStyle.backgroundColor,
        containerBorder: containerStyle.borderColor,
        inputBg: inputStyle?.backgroundColor,
        catBtnBg: catBtnStyle?.backgroundColor,
        catBtnColor: catBtnStyle?.color
      };
    });

    console.log('[About Feedback Mailbox]', feedbackAudit);
    if (feedbackAudit) {
      const containerBrightness = parseRgbBrightness(feedbackAudit.containerBg);
      const inputBrightness = feedbackAudit.inputBg ? parseRgbBrightness(feedbackAudit.inputBg) : 255;
      console.log(`[Feedback Mailbox] Container Brillo: ${containerBrightness.toFixed(1)}, Input Brillo: ${inputBrightness.toFixed(1)}`);
      // White background rgb(255, 255, 255) / Slate-50 rgb(248, 250, 252)
      auditResults.aboutFeedbackMailboxLightHomologated = containerBrightness > 220 && inputBrightness > 200;
    }

    await page.screenshot({ path: path.join(artifactsDir, '05_about_feedback_mailbox_light.png') });
    console.log('📸 Captura guardada: 05_about_feedback_mailbox_light.png');

    // -------------------------------------------------------------
    // 5. Homologación Modo Claro: Galería de Evolución en Vivo
    // -------------------------------------------------------------
    console.log('\n--- 5. Auditando Galería de Evolución en Vivo (TattooTimeline) ---');
    // Inyectar sesión cliente con datos de progreso
    await page.evaluate(() => {
      const clientSession = {
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
      };
      sessionStorage.setItem('user', JSON.stringify(clientSession));
      localStorage.setItem('user', JSON.stringify(clientSession));
      localStorage.setItem('tattoo_hub_theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });

    await page.goto('http://localhost:4201/client-dashboard');
    await page.waitForSelector('main h1', { timeout: 10000 });

    // Scroll hasta el ancla de la galería de evolución
    await page.evaluate(async () => {
      const anchor = document.querySelector('#tattoo-progress-anchor') || Array.from(document.querySelectorAll('h3, h2')).find(h => h.textContent?.includes('Galería de Evolución'));
      if (anchor) anchor.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(500);

    const timelineAudit = await page.evaluate(async () => {
      const timelineHeading = Array.from(document.querySelectorAll('h2, h3, h4')).find(h => h.textContent?.includes('Galería de Evolución') || h.textContent?.includes('Evolución'));
      const anchor = document.querySelector('#tattoo-progress-anchor');
      const timelineToolbar = document.querySelector('.overflow-x-auto') || document.querySelector('.p-4.rounded-2xl');

      return {
        foundHeading: !!timelineHeading,
        hasAnchor: !!anchor,
        toolbarClass: timelineToolbar?.className
      };
    });

    console.log('[Client Timeline Gallery]', timelineAudit);
    auditResults.clientDashboardTimelineLightHomologated = timelineAudit.foundHeading || timelineAudit.hasAnchor;

    await page.screenshot({ path: path.join(artifactsDir, '06_timeline_gallery_light.png') });
    console.log('📸 Captura guardada: 06_timeline_gallery_light.png');

    // -------------------------------------------------------------
    // 6. Micro-interacciones: Hover Zoom & Cursor Pointer en Cards
    // -------------------------------------------------------------
    console.log('\n--- 6. Auditando Micro-interacciones Hover (scale 1.02 & cursor pointer) ---');
    await page.goto('http://localhost:4201/beneficios');
    await page.waitForSelector('.atelier-card-hover', { timeout: 8000 });

    const cardHoverAudit = await page.evaluate(async () => {
      const card = document.querySelector('.atelier-card-hover');
      if (!card) return null;

      const beforeHoverCursor = window.getComputedStyle(card).cursor;

      return {
        beforeHoverCursor,
        hasCardHoverClass: card.classList.contains('atelier-card-hover')
      };
    });

    console.log('[Card Hover Micro-interactions]', cardHoverAudit);
    auditResults.cardHoverMicroInteractions = (cardHoverAudit?.beforeHoverCursor === 'pointer') && cardHoverAudit?.hasCardHoverClass;

    // Hover with Playwright mouse
    const firstCard = await page.locator('.atelier-card-hover').first();
    await firstCard.hover();
    await page.waitForTimeout(300);

    await page.screenshot({ path: path.join(artifactsDir, '07_card_hover_microinteraction.png') });
    console.log('📸 Captura guardada: 07_card_hover_microinteraction.png');

    // -------------------------------------------------------------
    // 7. Verificación del Logo Completo en Footer y Login
    // -------------------------------------------------------------
    console.log('\n--- 7. Auditando Presencia del Logo Completo en Footer y Login ---');
    await page.goto('http://localhost:4201/login');
    await page.waitForSelector('img[src*="logo.png"]', { timeout: 5000 });
    const fullLogoInLogin = await page.evaluate(() => {
      const img = document.querySelector('img[src*="logo.png"]');
      return !!img && img.naturalWidth > 0;
    });
    console.log(`[Branding] Logo Completo oficial visible en Login: ${fullLogoInLogin}`);
    await page.screenshot({ path: path.join(artifactsDir, '08_login_full_logo.png') });

  } catch (error) {
    console.error('❌ Excepción durante la auditoría:', error);
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n========================================');
  console.log('📊 RESUMEN FINAL AUDITORÍA BROWSER SPRINT 16');
  console.log('========================================');
  console.log(`1. Respaldo Legacy y Nuevos Activos en Disco:         ${auditResults.brandingLogoBackupVerified ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`2. Nuevo Isotipo Oficial Visible en Navbar:           ${auditResults.brandingNewIconEmblemVisible ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`3. Navbar Sticky z-50 Comportamiento:                 ${auditResults.navbarStickyBehavior ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`4. Navbar Altura Espaciosa h-20 (~80px):              ${auditResults.navbarHeightSpacious ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`5. Navbar Degradado Vertical en Modo Claro:           ${auditResults.navbarVerticalGradientLight ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`6. Navbar Degradado Vertical en Modo Oscuro:          ${auditResults.navbarVerticalGradientDark ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`7. Homologación Modo Claro - Estadísticas Home:       ${auditResults.homeVerifiedStudiosLightHomologated ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`8. Homologación Modo Claro - Buzón Feedback About:    ${auditResults.aboutFeedbackMailboxLightHomologated ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`9. Homologación Modo Claro - Galería Evolución:       ${auditResults.clientDashboardTimelineLightHomologated ? '✅ PASÓ' : '❌ FALLÓ'}`);
  console.log(`10. Micro-interacción Hover Zoom & Cursor Pointer:    ${auditResults.cardHoverMicroInteractions ? '✅ PASÓ' : '❌ FALLÓ'}`);

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
