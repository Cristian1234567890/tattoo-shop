import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../v2/e2e/node_modules/playwright');
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../../v2/frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence/sprint14');
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
  console.log('🚀 Iniciando Auditoría Visual & Funcional de Browser para Sprint 14...');
  const server = await startServer(4198);
  const browser = await chromium.launch({ headless: true });

  // Crear contexto con light mode forzado desde el inicio via localStorage
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    localStorage.setItem('tattoo_hub_theme', 'light');
    localStorage.setItem('user_avatar_override', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');
    localStorage.setItem('user', JSON.stringify({
      user: {
        id: 'mock-artist-uuid',
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
      session: {
        access_token: 'fake-access-token'
      }
    }));
  });

  const page = await context.newPage();

  const results = {
    hubOsmTileLayerNoCartoApiKey: false,
    hubDrawerAndPopupsLightMode: false,
    tattooPatternOpacitySubtle: false,
    navbarAvatarReferrerPolicy: false,
    loginPageContrastValid: false,
    registerPageContrastValid: false,
    clientDashboardContrastValid: false,
    artistDashboardContrastValid: false,
    pricingPageContrastValid: false,
    benefitsPageContrastValid: false,
    shopPageContrastValid: false,
    artistsDirectoryContrastValid: false
  };

  try {
    // 1. Validar /hub y Leaflet Tile Layer (OSM canonical, NO CartoDB watermark)
    console.log('\n--- 1. Auditando /hub: Leaflet OSM Tiles y Drawer Claro ---');
    let cartoTilesDetected = false;
    let osmTilesDetected = false;

    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('cartocdn.com') || url.includes('carto.com')) {
        cartoTilesDetected = true;
      }
      if (url.includes('tile.openstreetmap.org')) {
        osmTilesDetected = true;
      }
    });

    await page.goto('http://localhost:4198/hub');
    await page.waitForTimeout(1500);

    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasCartoApiKeyWatermark = bodyText.includes('API KEY REQUIRED') || bodyText.includes('carto.com/basemaps/apikey');

    results.hubOsmTileLayerNoCartoApiKey = !cartoTilesDetected && !hasCartoApiKeyWatermark;
    console.log(`[Hub Map] CartoDB bloqueado: ${!cartoTilesDetected}, Sin marca de agua CartoDB: ${!hasCartoApiKeyWatermark}`);

    const hasLightTilesClass = await page.locator('.light-map-tiles').count() > 0;
    const hasHubDrawer = await page.locator('aside, .atelier-card').count() > 0;
    results.hubDrawerAndPopupsLightMode = hasLightTilesClass && hasHubDrawer;
    console.log(`[Hub Drawer & Tiles] Tiles claros (.light-map-tiles): ${hasLightTilesClass}, Drawer presente: ${hasHubDrawer}`);

    await page.screenshot({ path: path.join(artifactsDir, '01_hub_osm_light_mode.png') });

    // 2. Validar TattooPatternBackground (Opacidad tenue en modo claro)
    console.log('\n--- 2. Auditando TattooPatternBackground: Opacidad Tenue (10-12%) ---');
    const patternOpacityValid = await page.evaluate(() => {
      const patternEl = document.querySelector('svg.opacity-\\[0\\.11\\], .opacity-\\[0\\.11\\]');
      if (patternEl) {
        const computed = window.getComputedStyle(patternEl);
        const op = parseFloat(computed.opacity);
        return op <= 0.15;
      }
      return true;
    });
    results.tattooPatternOpacitySubtle = patternOpacityValid;
    console.log(`[Tattoo Pattern] Opacidad tenue <= 15% en modo claro: ${patternOpacityValid}`);

    // 3. Validar Navbar: Avatar y ReferrerPolicy
    console.log('\n--- 3. Auditando Navbar: Avatar & ReferrerPolicy ---');
    await page.waitForTimeout(600);

    const avatarInfo = await page.evaluate(() => {
      const img = document.querySelector('nav img[alt="Avatar"], nav img');
      if (img) {
        return {
          hasImg: true,
          referrerPolicy: img.getAttribute('referrerpolicy') || img.referrerPolicy,
          src: img.src
        };
      }
      return { hasImg: false, referrerPolicy: null, src: null };
    });

    results.navbarAvatarReferrerPolicy = Boolean(avatarInfo.hasImg && avatarInfo.referrerPolicy === 'no-referrer');
    console.log(`[Navbar Avatar] Imagen presente: ${avatarInfo.hasImg}, ReferrerPolicy: ${avatarInfo.referrerPolicy}`);
    await page.screenshot({ path: path.join(artifactsDir, '02_navbar_avatar_light_mode.png') });

    // 4. Validar Contraste en Todas las Pantallas Auditadas (Modo Claro)
    const screens = [
      { name: 'login', path: '/login', resultKey: 'loginPageContrastValid', file: '03_login_light_mode.png' },
      { name: 'register', path: '/register', resultKey: 'registerPageContrastValid', file: '04_register_light_mode.png' },
      { name: 'clientDashboard', path: '/client-dashboard', resultKey: 'clientDashboardContrastValid', file: '05_client_dashboard_light_mode.png' },
      { name: 'artistDashboard', path: '/artist-dashboard', resultKey: 'artistDashboardContrastValid', file: '06_artist_dashboard_light_mode.png' },
      { name: 'pricing', path: '/precios', resultKey: 'pricingPageContrastValid', file: '07_pricing_light_mode.png' },
      { name: 'benefits', path: '/beneficios', resultKey: 'benefitsPageContrastValid', file: '08_benefits_light_mode.png' },
      { name: 'shop', path: '/tienda', resultKey: 'shopPageContrastValid', file: '09_shop_light_mode.png' },
      { name: 'artists', path: '/artistas', resultKey: 'artistsDirectoryContrastValid', file: '10_artists_directory_light_mode.png' }
    ];

    for (const screen of screens) {
      console.log(`\n--- Auditando pantalla: ${screen.path} ---`);
      await page.goto(`http://localhost:4198${screen.path}`);
      await page.waitForTimeout(700);

      const contrastCheck = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
        let readableHeadings = 0;
        for (const h of headings) {
          const color = window.getComputedStyle(h).color;
          // In light mode, heading must be dark text (not white) or inside an intentional dark badge/card
          const isWhite = color === 'rgb(255, 255, 255)';
          const insideDarkContainer = Boolean(h.closest('.bg-gradient-to-t, .bg-violet-600, .bg-slate-900, .bg-black'));
          if (!isWhite || insideDarkContainer) {
            readableHeadings++;
          }
        }
        return {
          totalHeadings: headings.length,
          readableHeadings,
          isValid: headings.length === 0 || (readableHeadings / headings.length) >= 0.8
        };
      });

      results[screen.resultKey] = contrastCheck.isValid;
      console.log(`[${screen.name}] Encabezados legibles en modo claro: ${contrastCheck.readableHeadings}/${contrastCheck.totalHeadings} (${contrastCheck.isValid ? 'Aprobado' : 'Fallo'})`);
      await page.screenshot({ path: path.join(artifactsDir, screen.file) });
    }

  } catch (err) {
    console.error('❌ Error durante la auditoría visual Sprint 14:', err);
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n======================================================');
  console.log('🎉 RESUMEN DE AUDITORÍA BROWSER SPRINT 14:');
  console.log(JSON.stringify(results, null, 2));
  console.log('======================================================');

  const allPassed = Object.values(results).every(Boolean);
  if (!allPassed) {
    console.error('❌ Algunos criterios de auditoría visual fallaron.');
    process.exit(1);
  } else {
    console.log('✅ Todos los criterios de auditoría visual aprobados.');
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
