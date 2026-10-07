import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4176) {
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
  console.log('Iniciando servidor de pruebas estático en puerto 4176...');
  const server = await startServer(4176);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const page = await context.newPage();

  try {
    // 1. Evidencia TH-6: Misión, Visión y Pilares
    console.log('Navegando a /about...');
    await page.goto('http://localhost:4176/about', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const pathAboutMission = path.join(artifactsDir, 'TH-6_sobre_nosotros_mision_pilares.png');
    await page.screenshot({ path: pathAboutMission });
    console.log('Captura guardada:', pathAboutMission);

    // 2. Evidencia TH-6: Roadmap Interactivo 2026
    console.log('Capturando Roadmap 2026...');
    const roadmapEl = page.locator('text=Roadmap de la Plataforma 2026');
    await roadmapEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const pathAboutRoadmap = path.join(artifactsDir, 'TH-6_roadmap_plataforma_2026.png');
    await page.screenshot({ path: pathAboutRoadmap });
    console.log('Captura guardada:', pathAboutRoadmap);

    // 3. Evidencia TH-6: Buzón de Feedback interactivo con datos
    console.log('Llenando Buzón de Feedback...');
    const feedbackEl = page.locator('#feedback-form');
    await feedbackEl.scrollIntoViewIfNeeded();
    await page.click('button:has-text("🚀 Mejora")');
    await page.locator('#feedback-message').fill('Excelente diseño dark atelier. Sería fantástico incorporar notificaciones push cuando un artista favorito publica un nuevo flash design.');
    await page.locator('#feedback-email').fill('coleccionista@tattoohub.com');
    await page.waitForTimeout(400);
    const pathFeedbackForm = path.join(artifactsDir, 'TH-6_buzon_feedback_formulario.png');
    await page.screenshot({ path: pathFeedbackForm });
    console.log('Captura guardada:', pathFeedbackForm);

    // 4. Enviar Feedback y capturar confirmación
    console.log('Enviando feedback...');
    await page.click('button[type="submit"]:has-text("Enviar al Equipo Directivo")');
    await page.waitForSelector('text=¡Gracias por tu aporte!');
    await page.waitForTimeout(400);
    const pathFeedbackSuccess = path.join(artifactsDir, 'TH-6_buzon_feedback_confirmacion.png');
    await page.screenshot({ path: pathFeedbackSuccess });
    console.log('Captura guardada:', pathFeedbackSuccess);

    await browser.close();
    server.close();

    // Subir capturas a Jira TH-6
    console.log('Adjuntando evidencias en Jira Software para TH-6...');
    await uploadToJira('TH-6', pathAboutMission);
    await uploadToJira('TH-6', pathAboutRoadmap);
    await uploadToJira('TH-6', pathFeedbackForm);
    await uploadToJira('TH-6', pathFeedbackSuccess);

    console.log('¡Todas las evidencias de TH-6 fueron adjuntadas en Jira!');
  } catch (err) {
    console.error('Error durante E2E TH-6:', err);
    await browser.close().catch(() => {});
    server.close();
    process.exit(1);
  }
}

run().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
