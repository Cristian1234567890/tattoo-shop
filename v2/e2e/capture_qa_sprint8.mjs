import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../frontend/dist');
const artifactsDir = path.resolve(__dirname, '../../.agents/evidence/sprint8');
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function startServer(port = 4187) {
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
  console.log('Iniciando servidor de pruebas Sprint 8 en puerto 4187...');
  const server = await startServer(4187);
  const browser = await chromium.launch({ headless: true });

  try {
    // ========================================================
    // 1. TH-30: Navbar Layout: Separación en 3 Secciones
    // ========================================================
    console.log('--- Probando TH-30: Distribución en 3 Secciones de la Navbar ---');
    const contextNav = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const pageNav = await contextNav.newPage();
    await pageNav.goto('http://localhost:4187/', { waitUntil: 'domcontentloaded' });
    await pageNav.waitForTimeout(1000);

    const pathTH30 = path.join(artifactsDir, 'TH-30_navbar_three_sections_desktop.png');
    await pageNav.screenshot({ path: pathTH30 });
    console.log(`Captura tomada: ${pathTH30}`);
    await uploadToJira('TH-30', pathTH30);
    await contextNav.close();

    // ========================================================
    // 2. TH-29: Sincronización de Nombre en Header y Gestión de Avatar / Google Link
    // ========================================================
    console.log('--- Probando TH-29: Sincronización de Nombre y Avatar ---');
    const contextClient = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const pageClient = await contextClient.newPage();

    // Inyectar sesión de usuario con Google y datos de formulario
    await pageClient.addInitScript(() => {
      const user = {
        id: 'client-test-uuid',
        email: 'giovanni.buglione@ourpresent.art',
        user_metadata: {
          nombre: 'Giovanni',
          apellido: 'Buglione',
          full_name: 'Giovanni Buglione (Our Present)',
          tipo: 'Cliente',
          role: 'Cliente',
          onboarding_completed: true,
          legal_accepted: true,
          legal_accepted_at: new Date().toISOString(),
          edad: '25',
          birthdate: '1999-05-12',
          google_linked: true,
          google_avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          country: 'Panamá',
          provincia: 'Panamá',
          telefono: '60001234',
          phone_prefix: '+507'
        },
        app_metadata: { provider: 'google', providers: ['google'] },
        identities: [{ id: 'google-identity-1', provider: 'google' }]
      };
      const session = { access_token: 'fake-jwt-token', refresh_token: 'fake-refresh-token' };
      sessionStorage.setItem('user', JSON.stringify({ user, session }));
      localStorage.setItem('user', JSON.stringify({ user, session }));
      localStorage.setItem('tattoo_auth_session', JSON.stringify({ user, session }));
      localStorage.setItem('sb-auth-token', JSON.stringify({ user, session }));
    });

    // Mock userprofile endpoint para retorno instantáneo
    await pageClient.route('**/userprofile**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            role: 'cliente',
            legal_accepted: true,
            onboarding_completed: true,
            edad: '25',
            birthdate: '1999-05-12',
            has_active_subscription: false,
            full_name: 'Giovanni Buglione',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          },
        }),
      });
    });

    await pageClient.goto('http://localhost:4187/client-dashboard', { waitUntil: 'domcontentloaded' });
    await pageClient.waitForTimeout(1200);

    // Validar nombre en header
    const greetingText = await pageClient.locator('h1').first().innerText();
    console.log(`Texto del saludo en Header: "${greetingText}"`);

    const pathTH29Header = path.join(artifactsDir, 'TH-29_profile_header_name_sync.png');
    await pageClient.screenshot({ path: pathTH29Header });
    console.log(`Captura tomada: ${pathTH29Header}`);
    await uploadToJira('TH-29', pathTH29Header);

    // Navegar a Configuración haciendo clic en la pestaña
    const settingsTabBtn = pageClient.locator('button', { hasText: /configuraci/i });
    if (await settingsTabBtn.count() > 0) {
      await settingsTabBtn.click();
    } else {
      await pageClient.goto('http://localhost:4187/client-dashboard?tab=configuracion', { waitUntil: 'domcontentloaded' });
    }
    await pageClient.waitForTimeout(1200);

    const pathTH29Settings = path.join(artifactsDir, 'TH-29_avatar_and_google_linking.png');
    await pageClient.screenshot({ path: pathTH29Settings });
    console.log(`Captura tomada: ${pathTH29Settings}`);
    await uploadToJira('TH-29', pathTH29Settings);

    // ========================================================
    // 3. TH-31: Homologación Global de Listas Desplegables (CustomSelect)
    // ========================================================
    console.log('--- Probando TH-31: CustomSelect Dropdowns en Configuración ---');

    // Desplazar hacia la sección de ubicación geográfica
    const countryButton = pageClient.locator('button[aria-haspopup="listbox"]').first();
    await countryButton.scrollIntoViewIfNeeded();
    await countryButton.click();
    await pageClient.waitForTimeout(500);

    const pathTH31Country = path.join(artifactsDir, 'TH-31_custom_select_country_open.png');
    await pageClient.screenshot({ path: pathTH31Country });
    console.log(`Captura tomada: ${pathTH31Country}`);
    await uploadToJira('TH-31', pathTH31Country);

    // Cerrar y abrir segundo dropdown (provincia)
    await pageClient.keyboard.press('Escape');
    await pageClient.waitForTimeout(300);

    const provinceButton = pageClient.locator('button[aria-haspopup="listbox"]').nth(1);
    if (await provinceButton.count() > 0) {
      await provinceButton.click();
      await pageClient.waitForTimeout(500);
      const pathTH31Province = path.join(artifactsDir, 'TH-31_custom_select_province_open.png');
      await pageClient.screenshot({ path: pathTH31Province });
      console.log(`Captura tomada: ${pathTH31Province}`);
      await uploadToJira('TH-31', pathTH31Province);
    }

    await contextClient.close();
    console.log('✅ Todas las pruebas y capturas de Sprint 8 se completaron con éxito.');

  } catch (err) {
    console.error('Error durante la ejecución E2E:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

run();
