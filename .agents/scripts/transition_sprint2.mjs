import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

const issues = [
  {
    key: 'TH-13',
    title: '🎨 UI/UX: Rediseño de Página de Inicio de Sesión según Stitch Atelier',
    summary: 'Se implementó la fidelidad estética Atelier de Stitch (proyecto 986799955938082969, pantalla 4c9e9cf87fae4da6ab55569ffdbb99c4): halo neón violeta, credenciales oscurecidas, modo Turnstile no interactivo sin banners de prueba y flujo de acceso fluido.'
  },
  {
    key: 'TH-14',
    title: '🏛️ Institucional: Depuración de Sobre Nosotros (Misión, Visión, Estrategia de Mercado y Feedback)',
    summary: 'Se eliminaron todas las métricas ficticias (+5,200 artistas, etc.). La vista ahora presenta estrictamente Misión, Visión, los 4 pilares de Estrategia de Mercado y el Buzón de Feedback directo.'
  },
  {
    key: 'TH-15',
    title: '🌍 Registro: Catálogo Completo de Países y Prefijo Telefónico Reactivo Dinámico',
    summary: 'Se integró el catálogo global con banderas, códigos ISO y prefijos internacionales en un selector personalizado. El prefijo telefónico reacciona en tiempo real según el país seleccionado.'
  },
  {
    key: 'TH-16',
    title: '✉️📱 Seguridad/Auth: Flujo de Verificación Doble de Correo Electrónico y Teléfono (OTP)',
    summary: 'Se implementó modal modal de doble factor previo al registro definitivo: confirmación de código de correo de 6 dígitos + verificación por SMS para certificar líneas móviles y prevenir cuentas fraudulentas.'
  }
];

async function transitionIssue(key) {
  const res = await fetch(`${config.host}/rest/api/2/issue/${key}/transitions`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transition: { id: "41" } // 41 = Listo / Finalizada
    })
  });
  if (res.ok) {
    console.log(`[Jira] ${key} transicionado exitosamente a Listo (Finalizada)`);
  } else {
    console.error(`[Jira] Error al transicionar ${key}:`, res.status, await res.text());
  }
}

async function sendDiscordNotification(issue) {
  const payload = {
    content: "@everyone",
    embeds: [
      {
        title: `✅ [COMPLETADO] ${issue.key}: ${issue.title}`,
        description: `${issue.summary}\n\n**Estado:** Finalizada / Listo\n**Evidencias:** Capturas Playwright adjuntas en Jira Software`,
        color: 0x10B981, // Verde: Completado
        url: `${config.host}/browse/${issue.key}`,
        fields: [
          { name: "Ticket", value: `[${issue.key}](${config.host}/browse/${issue.key})`, inline: true },
          { name: "Ambiente", value: "Staging Vercel / Local QA", inline: true },
          { name: "Verificación", value: "QA E2E + Capturas Subidas", inline: true }
        ],
        footer: { text: "Antigravity Engineering Orchestrator • Sprint 2" },
        timestamp: new Date().toISOString()
      }
    ]
  };

  const res = await fetch(DISCORD_JIRA_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    console.log(`[Discord] Notificación verde enviada para ${issue.key}`);
  } else {
    console.error(`[Discord] Error enviando webhook para ${issue.key}:`, res.statusText);
  }
}

async function main() {
  for (const issue of issues) {
    await transitionIssue(issue.key);
    await sendDiscordNotification(issue);
  }
}

main().then(() => console.log('¡Transición de tickets y notificaciones finalizadas!'));
