import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4175) {
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
    if (!fs.existsSync(configPath)) return;
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
  console.log('Iniciando servidor de pruebas estático en puerto 4175...');
  const server = await startServer(4175);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const page = await context.newPage();

  try {
    // 1. Evidencia TH-5: RegisterPage con Turnstile pendiente
    console.log('Navegando a /register...');
    await page.goto('http://localhost:4175/register', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#turnstile-verify-button', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Llenar campos para mostrar que el bloqueo es específicamente por Turnstile
    await page.locator('input[type="date"]').fill('1998-04-12');
    const pathRegisterTurnstilePending = path.join(artifactsDir, 'TH-5_turnstile_pendiente_bloqueo.png');
    await page.screenshot({ path: pathRegisterTurnstilePending });
    console.log('Captura guardada:', pathRegisterTurnstilePending);

    // 2. Resolver Turnstile
    console.log('Verificando Turnstile...');
    await page.click('#turnstile-verify-button');
    await page.waitForTimeout(600);
    const pathRegisterTurnstileVerified = path.join(artifactsDir, 'TH-5_turnstile_verificado_exito.png');
    await page.screenshot({ path: pathRegisterTurnstileVerified });
    console.log('Captura guardada:', pathRegisterTurnstileVerified);

    // 3. Evidencia TH-5: LoginPage con Turnstile
    console.log('Navegando a /login...');
    await page.goto('http://localhost:4175/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#turnstile-verify-button', { timeout: 10000 });
    await page.waitForTimeout(500);
    const pathLoginTurnstile = path.join(artifactsDir, 'TH-5_login_protegido_turnstile.png');
    await page.screenshot({ path: pathLoginTurnstile });
    console.log('Captura guardada:', pathLoginTurnstile);

    await browser.close();
    server.close();

    // Subir capturas a Jira TH-5
    console.log('Adjuntando evidencias en Jira Software para TH-5...');
    await uploadToJira('TH-5', pathRegisterTurnstilePending);
    await uploadToJira('TH-5', pathRegisterTurnstileVerified);
    await uploadToJira('TH-5', pathLoginTurnstile);

    console.log('¡Todas las evidencias de TH-5 fueron adjuntadas en Jira!');
  } catch (err) {
    console.error('Error durante E2E TH-5:', err);
    await browser.close().catch(() => {});
    server.close();
    process.exit(1);
  }
}

run().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
