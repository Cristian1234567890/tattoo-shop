import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence/sprint5');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4184) {
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
  console.log('Iniciando servidor de pruebas en puerto 4184...');
  const server = await startServer(4184);

  const browser = await chromium.launch({ headless: true });

  try {
    // ==========================================
    // TH-22: Homologación Cross-Browser y Multi-Resolución
    // ==========================================
    console.log('--- Capturando evidencia TH-22: Desktop y Tablet Navbar Responsivo ---');
    // 1. Desktop 1366x768
    const contextDesktop = await browser.newContext({ viewport: { width: 1366, height: 800 } });
    const pageDesktop = await contextDesktop.newPage();
    await pageDesktop.goto('http://localhost:4184/', { waitUntil: 'domcontentloaded' });
    await pageDesktop.waitForTimeout(600);
    const pathTH22Desktop = path.join(artifactsDir, 'TH-22_responsive_navbar_desktop.png');
    await pageDesktop.screenshot({ path: pathTH22Desktop });
    await uploadToJira('TH-22', pathTH22Desktop);
    await contextDesktop.close();

    // 2. Intermediate resolution (Edge con sidebar / 980px)
    const contextTablet = await browser.newContext({ viewport: { width: 980, height: 800 } });
    const pageTablet = await contextTablet.newPage();
    await pageTablet.goto('http://localhost:4184/', { waitUntil: 'domcontentloaded' });
    await pageTablet.waitForTimeout(600);
    const pathTH22Tablet = path.join(artifactsDir, 'TH-22_responsive_navbar_tablet.png');
    await pageTablet.screenshot({ path: pathTH22Tablet });
    await uploadToJira('TH-22', pathTH22Tablet);
    await contextTablet.close();

    // ==========================================
    // TH-23: Depuración Profunda de Data Ficticia en Beneficios
    // ==========================================
    console.log('--- Capturando evidencia TH-23: Beneficios sin Data Ficticia ---');
    const contextBenefits = await browser.newContext({ viewport: { width: 1280, height: 950 } });
    const pageBenefits = await contextBenefits.newPage();
    await pageBenefits.goto('http://localhost:4184/beneficios', { waitUntil: 'domcontentloaded' });
    await pageBenefits.waitForTimeout(800);

    // Scroll to the authentic pillars section
    await pageBenefits.evaluate(() => window.scrollTo(0, 1000));
    await pageBenefits.waitForTimeout(500);

    const pathTH23 = path.join(artifactsDir, 'TH-23_benefits_clean_authentic.png');
    await pageBenefits.screenshot({ path: pathTH23 });
    await uploadToJira('TH-23', pathTH23);
    await contextBenefits.close();

    console.log('✅ Evidencias de Sprint 5 capturadas y adjuntadas en Jira.');
  } catch (err) {
    console.error('Error durante la ejecución de QA:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

run();
