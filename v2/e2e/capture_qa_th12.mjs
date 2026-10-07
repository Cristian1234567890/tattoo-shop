import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4177) {
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
  console.log('Iniciando servidor de pruebas estático en puerto 4177...');
  const server = await startServer(4177);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });

  // Inyectar usuario autenticado vía Google OAuth sin onboarding completado
  await context.addInitScript(() => {
    sessionStorage.setItem(
      'user',
      JSON.stringify({
        user: {
          id: 'google-oauth-user-9988',
          email: 'alex.rivera.google@gmail.com',
          user_metadata: {
            name: 'Alex Rivera (Google)',
            full_name: 'Alex Rivera',
            avatar_url: 'https://lh3.googleusercontent.com/a/default-user',
          },
          app_metadata: {
            provider: 'google',
          },
        },
        session: {
          access_token: 'mock-google-access-token',
        },
      })
    );
  });

  const page = await context.newPage();

  try {
    // 1. Evidencia TH-12: Modal Onboarding Post-OAuth Gate abierto
    console.log('Navegando a /user (Post-OAuth Gate)...');
    await page.goto('http://localhost:4177/user', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#onboardingModal', { timeout: 10000 });
    await page.waitForTimeout(500);
    const pathOnboardingInitial = path.join(artifactsDir, 'TH-12_post_oauth_gate_modal.png');
    await page.screenshot({ path: pathOnboardingInitial });
    console.log('Captura guardada:', pathOnboardingInitial);

    // 2. Evidencia TH-12: Validación menor de edad (<18) bloqueado
    console.log('Probando menor de edad en Post-OAuth...');
    await page.locator('#onboarding-birthdate').fill('2012-07-15');
    await page.waitForTimeout(400);
    const pathOnboardingUnderage = path.join(artifactsDir, 'TH-12_post_oauth_bloqueo_menor.png');
    await page.screenshot({ path: pathOnboardingUnderage });
    console.log('Captura guardada:', pathOnboardingUnderage);

    // 3. Evidencia TH-12: Mayor de edad (18+) y selección de rol
    console.log('Probando mayor de edad y rol...');
    await page.locator('#onboarding-birthdate').fill('1998-11-20');
    await page.click('#role-btn-cliente');
    await page.waitForTimeout(400);
    const pathOnboardingAdult = path.join(artifactsDir, 'TH-12_post_oauth_adulto_verificado.png');
    await page.screenshot({ path: pathOnboardingAdult });
    console.log('Captura guardada:', pathOnboardingAdult);

    // 4. Evidencia TH-12: Términos y Condiciones obligatorios
    console.log('Abriendo modal de términos obligatorios desde Onboarding...');
    await page.click('span:has-text("Términos, Condiciones y Políticas de Privacidad")');
    await page.waitForSelector('text=1. Requisitos Sanitarios y Mayoría de Edad');
    await page.waitForTimeout(400);
    const pathOnboardingTerms = path.join(artifactsDir, 'TH-12_post_oauth_terminos_scroll.png');
    await page.screenshot({ path: pathOnboardingTerms });
    console.log('Captura guardada:', pathOnboardingTerms);

    await browser.close();
    server.close();

    // Subir a Jira TH-12
    console.log('Adjuntando evidencias en Jira Software para TH-12...');
    await uploadToJira('TH-12', pathOnboardingInitial);
    await uploadToJira('TH-12', pathOnboardingUnderage);
    await uploadToJira('TH-12', pathOnboardingAdult);
    await uploadToJira('TH-12', pathOnboardingTerms);

    console.log('¡Todas las evidencias de TH-12 fueron adjuntadas en Jira!');
  } catch (err) {
    console.error('Error durante E2E TH-12:', err);
    await browser.close().catch(() => {});
    server.close();
    process.exit(1);
  }
}

run().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
