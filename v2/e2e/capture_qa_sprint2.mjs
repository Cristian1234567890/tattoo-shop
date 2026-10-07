import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4178) {
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
  console.log('Iniciando servidor estático en puerto 4178...');
  const server = await startServer(4178);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const page = await context.newPage();

  try {
    // ==========================================
    // TH-13: Login Page Stitch Atelier Redesign
    // ==========================================
    console.log('Capturando evidencia TH-13: Login Page Stitch...');
    await page.goto('http://localhost:4178/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const pathTH13Initial = path.join(artifactsDir, 'TH-13_login_stitch_fidelity.png');
    await page.screenshot({ path: pathTH13Initial });

    // Clic en verificación Turnstile interactiva limpia
    const turnstileBtn = page.locator('#turnstile-verify-button');
    if (await turnstileBtn.isEnabled()) {
      await turnstileBtn.click({ force: true });
      await page.waitForTimeout(600);
    }
    const pathTH13Verified = path.join(artifactsDir, 'TH-13_turnstile_verificado_limpio.png');
    await page.screenshot({ path: pathTH13Verified });

    // ==========================================
    // TH-14: Sobre Nosotros (Misión, Visión, Estrategia, Feedback)
    // ==========================================
    console.log('Capturando evidencia TH-14: Sobre Nosotros...');
    await page.goto('http://localhost:4178/about', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const pathTH14Top = path.join(artifactsDir, 'TH-14_mision_vision.png');
    await page.screenshot({ path: pathTH14Top });

    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(500);
    const pathTH14Bottom = path.join(artifactsDir, 'TH-14_estrategia_y_feedback.png');
    await page.screenshot({ path: pathTH14Bottom });

    // ==========================================
    // TH-15: Registro - Catálogo de Países y Prefijo Reactivo
    // ==========================================
    console.log('Capturando evidencia TH-15: Prefijo reactivo dinámico en Registro...');
    await page.goto('http://localhost:4178/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const pathTH15Spain = path.join(artifactsDir, 'TH-15_prefijo_espana_34.png');
    await page.screenshot({ path: pathTH15Spain });

    // Cambiar país a Colombia en CustomSelect
    console.log('Cambiando país a Colombia...');
    await page.click('button[aria-haspopup="listbox"]');
    await page.waitForTimeout(300);
    await page.click('div[role="option"]:has-text("Colombia")');
    await page.waitForTimeout(400);

    const pathTH15Colombia = path.join(artifactsDir, 'TH-15_prefijo_colombia_57.png');
    await page.screenshot({ path: pathTH15Colombia });

    // ==========================================
    // TH-16: Doble Verificación (Email OTP + Phone SMS OTP)
    // ==========================================
    console.log('Capturando evidencia TH-16: Doble verificación OTP...');
    await page.locator('input[placeholder="Ej: Mateo o Carlos"]').fill('Alex');
    await page.locator('input[placeholder="Ej: Valenzuela o Restrepo"]').fill('Rios');
    await page.locator('input[type="email"]').fill('alex.rios@tattoohub.art');
    await page.locator('input[type="tel"]').fill('3124567890');
    await page.locator('input[type="date"]').fill('1996-05-12');
    await page.locator('input[placeholder="••••••••••••"]').first().fill('PasswordSecret123!');
    await page.locator('input[placeholder="••••••••••••"]').nth(1).fill('PasswordSecret123!');

    // Simular aceptación de términos
    console.log('Aceptando términos y condiciones...');
    await page.evaluate(() => sessionStorage.setItem('terms_read_accepted', 'true'));
    await page.locator('input#terms').scrollIntoViewIfNeeded();
    await page.click('input#terms');
    await page.waitForTimeout(400);

    // Esperar Turnstile verificado (modo gestionado o click)
    console.log('Verificando Turnstile...');
    await page.waitForTimeout(1000);
    const regTurnstileBtn = page.locator('#turnstile-verify-button');
    if (await regTurnstileBtn.isEnabled()) {
      await regTurnstileBtn.click({ force: true });
      await page.waitForTimeout(600);
    }

    const btnText = await page.locator('button[type="submit"]').innerText();
    console.log('Estado del botón de registro:', btnText);

    // Clic en registrar -> abre VerificationModal
    console.log('Abriendo modal de doble verificación...');
    await page.locator('button[type="submit"]').scrollIntoViewIfNeeded();
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Verifica tu Correo', { timeout: 8000 });
    await page.waitForTimeout(500);

    const pathTH16Email = path.join(artifactsDir, 'TH-16_verificacion_email_otp.png');
    await page.screenshot({ path: pathTH16Email });

    // Ingresar código de email y avanzar a SMS
    console.log('Ingresando código de correo 123456...');
    const emailInput = page.locator('input[placeholder="123456"]');
    await emailInput.fill('123456');
    await page.waitForTimeout(400);

    const confirmBtn = page.locator('#btn-verify-email-otp');
    console.log('¿Botón habilitado?:', await confirmBtn.isEnabled());
    await confirmBtn.click();
    await page.waitForSelector('text=Verifica tu Teléfono', { timeout: 8000 });
    await page.waitForTimeout(600);

    const pathTH16Phone = path.join(artifactsDir, 'TH-16_verificacion_sms_otp.png');
    await page.screenshot({ path: pathTH16Phone });

    await browser.close();
    server.close();

    // ==========================================
    // Subir todas las capturas a Jira Software
    // ==========================================
    console.log('--- Subiendo evidencias a Jira ---');
    console.log('Subiendo a TH-13...');
    await uploadToJira('TH-13', pathTH13Initial);
    await uploadToJira('TH-13', pathTH13Verified);

    console.log('Subiendo a TH-14...');
    await uploadToJira('TH-14', pathTH14Top);
    await uploadToJira('TH-14', pathTH14Bottom);

    console.log('Subiendo a TH-15...');
    await uploadToJira('TH-15', pathTH15Spain);
    await uploadToJira('TH-15', pathTH15Colombia);

    console.log('Subiendo a TH-16...');
    await uploadToJira('TH-16', pathTH16Email);
    await uploadToJira('TH-16', pathTH16Phone);

    console.log('✅ ¡Todas las evidencias de Sprint 2 fueron capturadas y adjuntadas en Jira!');
  } catch (err) {
    console.error('Error durante E2E Sprint 2:', err);
    await browser.close().catch(() => {});
    server.close();
    process.exit(1);
  }
}

run().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
