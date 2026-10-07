import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4174) {
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
  console.log('Iniciando servidor de pruebas estático en puerto 4174...');
  const server = await startServer(4174);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // 1. Evidencia TH-4: ForgotPasswordPage vista inicial
  console.log('Navegando a /forget-password...');
  await page.goto('http://localhost:4174/forget-password', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const pathForgotInitial = path.join(artifactsDir, 'TH-4_recuperar_password_form.png');
  await page.screenshot({ path: pathForgotInitial });
  console.log('Captura guardada:', pathForgotInitial);

  // 2. Evidencia TH-4: ForgotPasswordPage correo completado
  const emailInput = page.locator('#recovery-email');
  await emailInput.fill('developer.test@tattoohub.com');
  await page.waitForTimeout(300);
  const pathForgotFilled = path.join(artifactsDir, 'TH-4_recuperar_password_input.png');
  await page.screenshot({ path: pathForgotFilled });
  console.log('Captura guardada:', pathForgotFilled);

  // 3. Evidencia TH-4: ChangePasswordPage vista
  console.log('Navegando a /change-password...');
  await page.goto('http://localhost:4174/change-password', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const pathChangeInitial = path.join(artifactsDir, 'TH-4_nueva_password_formulario.png');
  await page.screenshot({ path: pathChangeInitial });
  console.log('Captura guardada:', pathChangeInitial);

  // 4. Evidencia TH-4: ChangePasswordPage validación contraseñas
  await page.locator('#new-password').fill('SuperSecret123!');
  await page.locator('#confirm-new-password').fill('SuperSecret123!');
  await page.waitForTimeout(300);
  const pathChangeMatching = path.join(artifactsDir, 'TH-4_nueva_password_coincidencia.png');
  await page.screenshot({ path: pathChangeMatching });
  console.log('Captura guardada:', pathChangeMatching);

  await browser.close();
  server.close();

  // Adjuntar a Jira TH-4
  console.log('Adjuntando evidencias en Jira Software para TH-4...');
  await uploadToJira('TH-4', pathForgotInitial);
  await uploadToJira('TH-4', pathForgotFilled);
  await uploadToJira('TH-4', pathChangeInitial);
  await uploadToJira('TH-4', pathChangeMatching);

  console.log('¡Todas las evidencias de TH-4 fueron adjuntadas en Jira!');
}

run().catch(console.error);
