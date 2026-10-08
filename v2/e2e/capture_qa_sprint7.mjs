import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence/sprint7');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4186) {
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
          '.webp': 'image/webp'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });

    server.listen(port, () => resolve(server));
  });
}

async function uploadToJira(issueKey, filePath) {
  try {
    const configPath = path.resolve(__dirname, '../../.agents/config/jira.json');
    if (!fs.existsSync(configPath)) {
      console.warn('No jira.json found, skipping attachment upload');
      return;
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    formData.append('file', blob, fileName);

    const res = await fetch(`${config.host}/rest/api/2/issue/${issueKey}/attachments`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'X-Atlassian-Token': 'no-check'
      },
      body: formData
    });

    if (res.ok) {
      console.log(`[Jira Evidence] Captura ${fileName} adjuntada exitosamente a ${issueKey}`);
    } else {
      console.error(`[Jira Evidence] Error adjuntando a ${issueKey}:`, res.status, await res.text());
    }
  } catch (err) {
    console.error(`[Jira Evidence] Excepción subiendo a Jira:`, err.message);
  }
}

async function run() {
  console.log('Iniciando servidor de pruebas Sprint 7 en puerto 4186...');
  const server = await startServer(4186);
  const browser = await chromium.launch({ headless: true });

  try {
    // ========================================================
    // 1. TH-26: Solicitud Proactiva de Geolocalización al Ingresar
    // ========================================================
    console.log('--- Probando TH-26: Prompt de Geolocalización al Ingresar ---');
    const contextGeo = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      geolocation: { latitude: 8.9824, longitude: -79.5199 },
      permissions: ['geolocation']
    });
    const pageGeo = await contextGeo.newPage();
    await pageGeo.goto('http://localhost:4186/', { waitUntil: 'domcontentloaded' });
    await pageGeo.waitForTimeout(1200);

    const geoBannerCount = await pageGeo.locator('#geolocation-consent-banner').count();
    console.log(`Banner de geolocalización presente: ${geoBannerCount > 0 ? 'SÍ' : 'NO'}`);

    const pathTH26Prompt = path.join(artifactsDir, 'TH-26_geolocation_prompt_entry.png');
    await pageGeo.screenshot({ path: pathTH26Prompt });
    await uploadToJira('TH-26', pathTH26Prompt);

    // Click Permitir Ubicación
    if (geoBannerCount > 0) {
      await pageGeo.locator('#geo-allow-btn').click();
      await pageGeo.waitForTimeout(400);
    }

    // Navegar a /hub y verificar mapa geolocalizado
    await pageGeo.goto('http://localhost:4186/hub', { waitUntil: 'domcontentloaded' });
    await pageGeo.waitForTimeout(1200);

    const pathTH26Hub = path.join(artifactsDir, 'TH-26_artists_hub_geolocated.png');
    await pageGeo.screenshot({ path: pathTH26Hub });
    await uploadToJira('TH-26', pathTH26Hub);
    await contextGeo.close();

    // ========================================================
    // 2. TH-27: Mobile UX: Scroll Táctil, Filtros Horizontales y Listado en Mapa
    // ========================================================
    console.log('--- Probando TH-27: Scroll Móvil en Artists Hub ---');
    const contextMobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      geolocation: { latitude: 8.9824, longitude: -79.5199 },
      permissions: ['geolocation']
    });
    const pageMobile = await contextMobile.newPage();
    await pageMobile.goto('http://localhost:4186/hub', { waitUntil: 'domcontentloaded' });
    await pageMobile.waitForTimeout(1000);

    // Scroll horizontal en filtros de estilos
    const filterContainer = pageMobile.locator('#hub-style-filters-container');
    await filterContainer.evaluate((el) => {
      el.scrollLeft = 120;
    });
    await pageMobile.waitForTimeout(400);
    const pathTH27Horizontal = path.join(artifactsDir, 'TH-27_mobile_horizontal_filters.png');
    await pageMobile.screenshot({ path: pathTH27Horizontal });
    await uploadToJira('TH-27', pathTH27Horizontal);

    // Scroll vertical del drawer hacia abajo (para ver otros locales y artistas)
    const drawerScrollable = pageMobile.locator('#hub-drawer-scrollable-content');
    await drawerScrollable.evaluate((el) => {
      el.scrollTop = 550;
    });
    await pageMobile.waitForTimeout(600);

    const pathTH27Scrolled = path.join(artifactsDir, 'TH-27_mobile_drawer_scrolled_nearby_studios.png');
    await pageMobile.screenshot({ path: pathTH27Scrolled });
    await uploadToJira('TH-27', pathTH27Scrolled);
    await contextMobile.close();

    // ========================================================
    // 3. TH-28: Desbloqueo y Corrección de Scroll en Modal de Términos
    // ========================================================
    console.log('--- Probando TH-28: Modal de Términos en Registro Móvil ---');
    const contextTerms = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    const pageTerms = await contextTerms.newPage();
    await pageTerms.goto('http://localhost:4186/register', { waitUntil: 'domcontentloaded' });
    await pageTerms.waitForTimeout(800);

    // Abrir modal de términos mediante el span interactivo
    const termsTrigger = pageTerms.locator('span:has-text("Términos, Condiciones")').first();
    await termsTrigger.click();
    await pageTerms.waitForTimeout(600);

    const pathTH28Open = path.join(artifactsDir, 'TH-28_terms_modal_open_body_locked.png');
    await pageTerms.screenshot({ path: pathTH28Open });
    await uploadToJira('TH-28', pathTH28Open);

    // Probar auto-scroll / checkbox para habilitar aceptación
    await pageTerms.locator('#terms-manual-agree-checkbox').click();
    await pageTerms.waitForTimeout(300);

    const pathTH28Enabled = path.join(artifactsDir, 'TH-28_terms_modal_enabled_button.png');
    await pageTerms.screenshot({ path: pathTH28Enabled });
    await uploadToJira('TH-28', pathTH28Enabled);

    // Confirmar y verificar cierre y checkbox marcado en formulario de registro
    await pageTerms.locator('#terms-accept-confirm-btn').click();
    await pageTerms.waitForTimeout(500);

    const pathTH28Accepted = path.join(artifactsDir, 'TH-28_register_terms_accepted_checkbox.png');
    await pageTerms.screenshot({ path: pathTH28Accepted });
    await uploadToJira('TH-28', pathTH28Accepted);
    await contextTerms.close();

    console.log('✅ Evidencias de Sprint 7 capturadas y adjuntadas en Jira TH-26, TH-27, TH-28.');
  } catch (err) {
    console.error('Error durante la ejecución de QA Sprint 7:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

run();
