import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

const issuesToStart = [
  {
    key: 'TH-7',
    title: '🛡️ AUDIT: Security & Legal (@Security_Legal_Agent)',
    description: 'Iniciando hardening de validación matemática estricta de mayoría de edad (18+ / COPPA) en Backend, actualización de compliance CAN-SPAM en correos transaccionales y blindaje de sesiones.'
  },
  {
    key: 'TH-11',
    title: '☁️ AUDIT: DevOps & FinOps (@DevOps_FinOps_Agent)',
    description: 'Iniciando implementación de Rate Limiting (express-rate-limit) en endpoints de autenticación (/login, /register, /verify2fa) para mitigación de ataques de fuerza bruta y control de cuotas/costes de API.'
  }
];

async function startIssue(item) {
  // Transicionar a "En curso" (ID: 21)
  const res = await fetch(`${config.host}/rest/api/2/issue/${item.key}/transitions`, {
    method: 'POST',
    headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ transition: { id: "21" } })
  });

  if (res.ok) {
    console.log(`[Jira] ${item.key} transicionado a "En curso"`);
  } else {
    console.log(`[Jira] Error al transicionar ${item.key}:`, res.status, await res.text());
  }

  // Notificar a Discord (Amarillo: En curso)
  const payload = {
    content: "@everyone",
    embeds: [
      {
        title: `🔄 [EN CURSO] ${item.key}: ${item.title}`,
        description: `${item.description}\n\n**Estado:** En curso (Amarillo)\n**Prioridad:** Alta`,
        color: 15844367, // Amarillo
        url: `${config.host}/browse/${item.key}`,
        fields: [
          { name: "Ticket", value: `[${item.key}](${config.host}/browse/${item.key})`, inline: true },
          { name: "Fase", value: "Fase 1 - Backlog Execution", inline: true }
        ],
        footer: { text: "Antigravity Engineering Orchestrator" },
        timestamp: new Date().toISOString()
      }
    ]
  };

  await fetch(DISCORD_JIRA_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

for (const issue of issuesToStart) {
  await startIssue(issue);
}
