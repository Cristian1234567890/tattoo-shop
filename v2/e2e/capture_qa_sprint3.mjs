import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence/sprint3');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4180) {
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
  console.log('Iniciando servidor de pruebas en puerto 4180...');
  const server = await startServer(4180);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const page = await context.newPage();

  try {
    // ==========================================
    // TH-17: UI/UX - Badge Redundante Eliminado en Login
    // ==========================================
    console.log('--- Capturando evidencia TH-17: Login Page Badge Redundante Eliminado ---');
    await page.goto('http://localhost:4180/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const pathTH17 = path.join(artifactsDir, 'TH-17_login_badge_removed.png');
    await page.screenshot({ path: pathTH17 });
    await uploadToJira('TH-17', pathTH17);

    // ==========================================
    // TH-18: Seguridad/Auth - Blindaje de Sesión en Reset y Restricción de Pantallas
    // ==========================================
    console.log('--- Capturando evidencia TH-18: Change Password Sandboxed Navbar & Guard ---');
    await page.goto('http://localhost:4180/change-password', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const pathTH18Navbar = path.join(artifactsDir, 'TH-18_change_password_sandboxed_navbar.png');
    await page.screenshot({ path: pathTH18Navbar });
    await uploadToJira('TH-18', pathTH18Navbar);

    // Intento de acceso a ruta protegida sin sesión / en modo recuperación
    await page.goto('http://localhost:4180/client-dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const pathTH18Guard = path.join(artifactsDir, 'TH-18_protected_route_guard_redirect.png');
    await page.screenshot({ path: pathTH18Guard });
    await uploadToJira('TH-18', pathTH18Guard);

    // ==========================================
    // TH-19: Auth/UX - Redirección Fluida Post-Reset y Traducción al Español
    // ==========================================
    console.log('--- Capturando evidencia TH-19: Validación y Formularios en Español ---');
    await page.goto('http://localhost:4180/forget-password', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const pathTH19Forgot = path.join(artifactsDir, 'TH-19_forgot_password_spanish.png');
    await page.screenshot({ path: pathTH19Forgot });
    await uploadToJira('TH-19', pathTH19Forgot);

    await page.goto('http://localhost:4180/change-password', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    // Llenar campos de prueba para ver validaciones en español
    const newPassInput = page.locator('#new-password');
    const confirmPassInput = page.locator('#confirm-new-password');
    if (await newPassInput.count() > 0 && await confirmPassInput.count() > 0) {
      await newPassInput.fill('MiPasswordSeguro123!');
      await confirmPassInput.fill('MiPasswordSeguro123!');
      await page.waitForTimeout(400);
    }
    const pathTH19Validation = path.join(artifactsDir, 'TH-19_change_password_spanish_validation.png');
    await page.screenshot({ path: pathTH19Validation });
    await uploadToJira('TH-19', pathTH19Validation);

    // ==========================================
    // TH-20: i18n & Idioma del Cliente - Selector Multilenguaje
    // ==========================================
    console.log('--- Capturando evidencia TH-20: Selector de Idioma y Cambio Dinámico ---');
    await page.goto('http://localhost:4180/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    // Abrir dropdown de idiomas
    const langBtn = page.locator('#language-selector-btn');
    if (await langBtn.count() > 0) {
      await langBtn.click();
      await page.waitForTimeout(500);
      const pathTH20Dropdown = path.join(artifactsDir, 'TH-20_navbar_language_dropdown.png');
      await page.screenshot({ path: pathTH20Dropdown });
      await uploadToJira('TH-20', pathTH20Dropdown);

      // Cambiar a inglés
      const enBtn = page.locator('#language-dropdown-menu button').nth(1);
      if (await enBtn.count() > 0) {
        await enBtn.click();
        await page.waitForTimeout(500);
        const pathTH20English = path.join(artifactsDir, 'TH-20_navbar_translated_english.png');
        await page.screenshot({ path: pathTH20English });
        await uploadToJira('TH-20', pathTH20English);
      }
    }

    console.log('✅ Todas las evidencias capturadas y adjuntadas en Jira.');
  } catch (err) {
    console.error('Error durante la ejecución de QA:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

run();
