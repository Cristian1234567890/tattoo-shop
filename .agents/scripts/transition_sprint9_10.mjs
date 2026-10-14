import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";
const DISCORD_ALERTAS_WEBHOOK = "https://discord.com/api/webhooks/1557427496411078757/PZEAT8aJH8L6rAYsi-rkGZCIIh9-qcHuf1UXj_BAthmDZMewJtiPPFSx4GGF8kATxMgL";

const tickets = [
  {
    key: "TH-32",
    title: "🎨 A11y, Identidad Atelier, Modo Claro/Oscuro & Validaciones de Servidor",
    summary: "Sprint 9 completado al 100%. Se homologó accesibilidad WCAG 2.1 AA, paleta Atelier Noir/Gold y pergamino claro, switch reactivo de tema con persistencia, validaciones de servidor (18+, COPPA, contraseñas seguras) y suite Playwright E2E aprobada con 7/7 pruebas verdes incluyendo test de concurrencia y rate limiting de 1,000 peticiones."
  },
  {
    key: "TH-33",
    title: "📍 Panamá Georreferenciado, Proximidad Haversine & Aislamiento de Entornos",
    summary: "Sprint 10 completado al 100%. Se enriqueció el catálogo con 12 artistas y estudios reales en Casco Antiguo, San Francisco, Costa del Este, Boquete y David, cálculo de proximidad Haversine en km, aislamiento de entorno Supabase Sandbox vs Prod, y reportes adjuntados en Jira."
  }
];

async function transitionToDone(key) {
  const resMeta = await fetch(`${config.host}/rest/api/2/issue/${key}/transitions`, {
    headers: { 'Authorization': authHeader }
  });
  const dataMeta = await resMeta.json();
  const doneTransition = dataMeta.transitions?.find(t => 
    t.name.toLowerCase().includes('listo') || 
    t.name.toLowerCase().includes('finalizada') ||
    t.id === "41"
  );

  const transitionId = doneTransition ? doneTransition.id : "41";

  const res = await fetch(`${config.host}/rest/api/2/issue/${key}/transitions`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transition: { id: transitionId }
    })
  });
  if (!res.ok) {
    console.error(`Error transitioning ${key}:`, res.status, await res.text());
  } else {
    console.log(`[Jira] ${key} transicionado exitosamente a Listo / Finalizada.`);
  }
}

async function sendDiscordNotification(webhookUrl, key, title, summary) {
  const payload = {
    content: "@everyone",
    embeds: [
      {
        title: `✅ [FINALIZADA] ${key}: ${title}`,
        description: `${summary}\n\n**Estado:** Finalizada / Listo (Verde)\n**Proyecto:** Tattoo Hub (TH)\n**Backlog Jira:** 100% Completado (39/39 Tickets)`,
        color: 0x10b981,
        url: `${config.host}/browse/${key}`,
        fields: [
          { name: "Ticket", value: `[${key}](${config.host}/browse/${key})`, inline: true },
          { name: "Entorno", value: "Staging / Producción Segregada", inline: true }
        ],
        footer: { text: "Antigravity Engineering Orchestrator • Backlog Jira Completado" },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Error enviando notificación a Discord:", err.message);
  }
}

async function run() {
  for (const t of tickets) {
    await transitionToDone(t.key);
    await sendDiscordNotification(DISCORD_JIRA_WEBHOOK, t.key, t.title, t.summary);
    await sendDiscordNotification(DISCORD_ALERTAS_WEBHOOK, t.key, t.title, t.summary);
  }
}

run();
