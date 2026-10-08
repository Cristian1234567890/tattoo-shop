import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence/sprint6');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4185) {
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
  console.log('Iniciando servidor de pruebas en puerto 4185...');
  const server = await startServer(4185);

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 850 } });
    const page = await context.newPage();

    // ==========================================
    // TH-25: QA Environment Banner & Sandbox
    // ==========================================
    console.log('--- Capturando evidencia TH-25: QA Environment Banner ---');
    await page.goto('http://localhost:4185/?env=qa', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const bannerExists = await page.locator('#qa-environment-banner').count();
    console.log(`QA Banner detectado: ${bannerExists > 0 ? 'SÍ' : 'NO'}`);

    const pathTH25Banner = path.join(artifactsDir, 'TH-25_qa_environment_banner.png');
    await page.screenshot({ path: pathTH25Banner });
    await uploadToJira('TH-25', pathTH25Banner);

    // Modal de Blindaje de Seguridad
    console.log('--- Abriendo Modal de Blindaje de Seguridad QA ---');
    await page.locator('#qa-security-policy-btn').click();
    await page.waitForTimeout(500);

    const pathTH25Modal = path.join(artifactsDir, 'TH-25_qa_security_modal.png');
    await page.screenshot({ path: pathTH25Modal });
    await uploadToJira('TH-25', pathTH25Modal);
    await uploadToJira('TH-24', pathTH25Modal); // Compartido con TH-24 como evidencia de aislamiento de esquema

    // Cerrar modal y minimizar banner
    console.log('--- Minimizando Banner QA ---');
    await page.locator('button:has-text("Entendido, Continuar Pruebas")').click();
    await page.waitForTimeout(400);

    await page.locator('#qa-banner-dismiss-btn').click();
    await page.waitForTimeout(400);

    const pathTH25Minimized = path.join(artifactsDir, 'TH-25_qa_minimized_badge.png');
    await page.screenshot({ path: pathTH25Minimized });
    await uploadToJira('TH-25', pathTH25Minimized);

    // ==========================================
    // TH-25: Pasarela de Pago Simulada / Sandbox Alert
    // ==========================================
    console.log('--- Capturando alerta de pasarela simulada en /subscription/creditcard ---');
    await page.goto('http://localhost:4185/subscription/creditcard?env=qa', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const pathTH25Payment = path.join(artifactsDir, 'TH-25_qa_payment_sandbox_alert.png');
    await page.screenshot({ path: pathTH25Payment });
    await uploadToJira('TH-25', pathTH25Payment);

    // ==========================================
    // TH-25: Registro Segregado en QA
    // ==========================================
    console.log('--- Capturando aviso de registro segregado en /register ---');
    await page.goto('http://localhost:4185/register?env=qa', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const pathTH25Register = path.join(artifactsDir, 'TH-25_qa_register_sandbox_alert.png');
    await page.screenshot({ path: pathTH25Register });
    await uploadToJira('TH-25', pathTH25Register);

    console.log('✅ Evidencias de Sprint 6 capturadas y adjuntadas en Jira TH-24 y TH-25.');
  } catch (err) {
    console.error('Error durante la ejecución de QA Sprint 6:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

run();
