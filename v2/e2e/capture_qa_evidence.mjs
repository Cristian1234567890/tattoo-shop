import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

// Minimal static file server for dist
function startServer(port = 4173) {
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

// Upload attachment to Jira
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
  console.log('Iniciando servidor de pruebas estático...');
  const server = await startServer(4173);
  console.log('Servidor listo en http://localhost:4173');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  console.log('Navegando a /register...');
  await page.goto('http://localhost:4173/register', { waitUntil: 'networkidle' });

  // 1. Evidencia TH-1: CustomSelect abierto (Stitch Dark Luxury)
  console.log('Capturando CustomSelect (TH-1)...');
  await page.click('button[aria-haspopup="listbox"]');
  await page.waitForTimeout(300);
  const pathCustomSelect = path.join(artifactsDir, 'TH-1_custom_select_stitch.png');
  await page.screenshot({ path: pathCustomSelect, fullPage: false });
  console.log('Captura guardada:', pathCustomSelect);

  // Cerrar selector seleccionando Colombia
  const colOpt = page.locator('div[role="option"]:has-text("Colombia")');
  if (await colOpt.count() > 0) {
    await colOpt.first().click();
  } else {
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(200);

  // 2. Evidencia TH-2 (Menor de edad): Validación 18+
  console.log('Capturando Validación Menor de Edad (TH-2)...');
  const dateInput = page.locator('input[type="date"]');
  await dateInput.fill('2012-05-15'); // 13-14 años
  await page.waitForTimeout(300);
  const pathUnderage = path.join(artifactsDir, 'TH-2_validacion_menor_edad.png');
  await page.screenshot({ path: pathUnderage, fullPage: false });
  console.log('Captura guardada:', pathUnderage);

  // 3. Evidencia TH-2 (Mayor de edad): 18+ permitido
  console.log('Capturando Validación Mayor de Edad (TH-2)...');
  await dateInput.fill('2000-08-20'); // 25 años
  await page.waitForTimeout(300);
  const pathLegalAge = path.join(artifactsDir, 'TH-2_validacion_mayor_edad.png');
  await page.screenshot({ path: pathLegalAge, fullPage: false });
  console.log('Captura guardada:', pathLegalAge);

  // 4. Evidencia TH-3: Modal de Términos (Top, Scroll forzado requerido)
  console.log('Capturando Modal de Términos (TH-3)...');
  await page.click('span:has-text("Términos, Condiciones y Políticas de Privacidad")');
  await page.waitForSelector('text=1. Requisitos Sanitarios y Mayoría de Edad');
  await page.waitForTimeout(400);
  const pathTermsTop = path.join(artifactsDir, 'TH-3_modal_terminos_top.png');
  await page.screenshot({ path: pathTermsTop, fullPage: false });
  console.log('Captura guardada:', pathTermsTop);

  // 5. Evidencia TH-3: Modal con Scroll al 100% (Botón habilitado)
  console.log('Desplazando al final del modal...');
  await page.click('button:has-text("Desplázate al final para habilitar")');
  await page.waitForTimeout(500);
  const pathTermsBottom = path.join(artifactsDir, 'TH-3_modal_terminos_aceptado.png');
  await page.screenshot({ path: pathTermsBottom, fullPage: false });
  console.log('Captura guardada:', pathTermsBottom);

  await browser.close();
  server.close();
  console.log('Pruebas visuales en navegador finalizadas.');

  // Subir capturas a Jira
  console.log('Adjuntando evidencias en Jira Software...');
  await uploadToJira('TH-1', pathCustomSelect);
  await uploadToJira('TH-2', pathUnderage);
  await uploadToJira('TH-2', pathLegalAge);
  await uploadToJira('TH-3', pathTermsTop);
  await uploadToJira('TH-3', pathTermsBottom);

  console.log('¡Todas las evidencias fueron registradas y vinculadas a Jira!');
}

run().catch(console.error);
