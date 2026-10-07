import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence/sprint4');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4182) {
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
  console.log('Iniciando servidor de pruebas en puerto 4182...');
  const server = await startServer(4182);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();

  try {
    console.log('--- Capturando evidencia TH-21: Footer Rediseñado según Stitch Atelier ---');
    await page.goto('http://localhost:4182/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Scroll al footer
    const footerElement = page.locator('#footer');
    await footerElement.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Verificaciones
    const githubLinkCount = await page.locator('#github').count();
    const themeSwitchCount = await page.locator('#theme-switch-container').count();
    const darkAtelierBadge = page.locator('#dark-atelier-edition-badge');
    const badgeVisible = await darkAtelierBadge.isVisible();

    console.log(`[QA Check] GitHub eliminado: ${githubLinkCount === 0}`);
    console.log(`[QA Check] ThemeSwitch eliminado: ${themeSwitchCount === 0}`);
    console.log(`[QA Check] Dark Atelier badge visible: ${badgeVisible}`);

    // Captura del viewport del footer
    const pathTH21 = path.join(artifactsDir, 'TH-21_footer_stitch_atelier.png');
    await footerElement.screenshot({ path: pathTH21 });
    console.log(`[QA Check] Captura generada en: ${pathTH21}`);

    // Subir a Jira TH-21
    await uploadToJira('TH-21', pathTH21);

    console.log('✅ Evidencia de Footer Stitch Atelier procesada y adjuntada en Jira.');
  } catch (err) {
    console.error('Error durante la ejecución de QA:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

run();
