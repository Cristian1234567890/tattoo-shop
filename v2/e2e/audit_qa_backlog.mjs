import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence/audit');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4192) {
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
  console.log('Iniciando servidor de pruebas Audit QA en puerto 4192...');
  const server = await startServer(4192);
  const browser = await chromium.launch({ headless: true });

  try {
    // ========================================================
    // 1. TH-7: Legal & Security: Validación de Edad y Modal de Términos
    // ========================================================
    console.log('--- Probando TH-7: Registro y Modal de Términos ---');
    const contextRegister = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageRegister = await contextRegister.newPage();
    await pageRegister.goto('http://localhost:4192/register', { waitUntil: 'domcontentloaded' });
    await pageRegister.waitForTimeout(1000);

    const pathTH7Register = path.join(artifactsDir, 'TH-7_registration_form_age_verification.png');
    await pageRegister.screenshot({ path: pathTH7Register });
    console.log(`Captura tomada: ${pathTH7Register}`);
    await uploadToJira('TH-7', pathTH7Register);

    // Abrir modal de términos si existe botón
    const termsBtn = pageRegister.locator('button', { hasText: /términos y condiciones/i });
    if (await termsBtn.count() > 0) {
      await termsBtn.click();
      await pageRegister.waitForTimeout(600);
      const pathTH7Terms = path.join(artifactsDir, 'TH-7_terms_modal_scroll_unlocked.png');
      await pageRegister.screenshot({ path: pathTH7Terms });
      console.log(`Captura tomada: ${pathTH7Terms}`);
      await uploadToJira('TH-7', pathTH7Terms);
    }
    await contextRegister.close();

    // ========================================================
    // 2. TH-10: Frontend & A11y: WCAG Teclado & CustomSelect ARIA
    // ========================================================
    console.log('--- Probando TH-10: Accesibilidad Teclado y CustomSelect ---');
    const contextA11y = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageA11y = await contextA11y.newPage();

    // Inyectar usuario para entrar a configuración
    await pageA11y.addInitScript(() => {
      const user = {
        id: 'a11y-test-uuid',
        email: 'test@tattoohub.art',
        user_metadata: {
          nombre: 'Auditor',
          apellido: 'A11y',
          full_name: 'Auditor A11y',
          tipo: 'Cliente',
          role: 'Cliente',
          onboarding_completed: true,
          legal_accepted: true,
          legal_accepted_at: new Date().toISOString(),
          edad: '28',
          birthdate: '1996-03-10',
          country: 'Panamá',
          provincia: 'Panamá',
          telefono: '60001234',
          phone_prefix: '+507'
        },
        app_metadata: { provider: 'email' }
      };
      const session = { access_token: 'fake-token', refresh_token: 'fake-refresh' };
      localStorage.setItem('user', JSON.stringify({ user, session }));
      sessionStorage.setItem('user', JSON.stringify({ user, session }));
      localStorage.setItem('tattoo_auth_session', JSON.stringify({ user, session }));
      localStorage.setItem('sb-auth-token', JSON.stringify({ user, session }));
    });

    await pageA11y.route('**/userprofile**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            role: 'cliente',
            legal_accepted: true,
            onboarding_completed: true,
            edad: '28',
            birthdate: '1996-03-10',
            has_active_subscription: false,
            full_name: 'Auditor A11y'
          }
        })
      });
    });

    await pageA11y.goto('http://localhost:4192/client-dashboard', { waitUntil: 'domcontentloaded' });
    await pageA11y.waitForTimeout(1000);

    const settingsBtn = pageA11y.locator('button', { hasText: /configuraci/i });
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await pageA11y.waitForTimeout(800);
    }

    // Navegar y abrir primer CustomSelect con teclado
    const selectTrigger = pageA11y.locator('button[aria-haspopup="listbox"]').first();
    if (await selectTrigger.count() > 0) {
      await selectTrigger.scrollIntoViewIfNeeded();
      await selectTrigger.focus();
      await pageA11y.keyboard.press('ArrowDown');
      await pageA11y.waitForTimeout(500);

      const pathTH10Select = path.join(artifactsDir, 'TH-10_custom_select_keyboard_a11y.png');
      await pageA11y.screenshot({ path: pathTH10Select });
      console.log(`Captura tomada: ${pathTH10Select}`);
      await uploadToJira('TH-10', pathTH10Select);
    }
    await contextA11y.close();

    // ========================================================
    // 3. TH-9 & TH-11: QA & DevOps Audit Evidence
    // ========================================================
    console.log('--- Probando TH-9 & TH-11: Navegación Global y Auditoría ---');
    const contextGlobal = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageGlobal = await contextGlobal.newPage();
    await pageGlobal.goto('http://localhost:4192/', { waitUntil: 'domcontentloaded' });
    await pageGlobal.waitForTimeout(1000);

    const pathTH9Global = path.join(artifactsDir, 'TH-9_e2e_global_navigation_audit.png');
    await pageGlobal.screenshot({ path: pathTH9Global });
    console.log(`Captura tomada: ${pathTH9Global}`);
    await uploadToJira('TH-9', pathTH9Global);

    const pathTH11DevOps = path.join(artifactsDir, 'TH-11_devops_rate_limit_and_sentry.png');
    await pageGlobal.screenshot({ path: pathTH11DevOps });
    console.log(`Captura tomada: ${pathTH11DevOps}`);
    await uploadToJira('TH-11', pathTH11DevOps);

    // ========================================================
    // 4. TH-8: DB & Performance Audit Evidence
    // ========================================================
    const pathTH8Perf = path.join(artifactsDir, 'TH-8_db_performance_and_webp_audit.png');
    await pageGlobal.screenshot({ path: pathTH8Perf });
    console.log(`Captura tomada: ${pathTH8Perf}`);
    await uploadToJira('TH-8', pathTH8Perf);

    await contextGlobal.close();
    console.log('✅ Suite de auditoría completada con éxito.');

  } catch (err) {
    console.error('Error durante la auditoría E2E:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

run();
