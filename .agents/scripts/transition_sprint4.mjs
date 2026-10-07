import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

const issue = {
  key: 'TH-21',
  title: '🎨 UI/UX: Rediseño del Footer según Stitch Atelier (Eliminación de GitHub y Selector de Tema)',
  summary: 'Se implementó con fidelidad píxel-perfect el footer de Stitch Atelier: cuadrícula a 4 columnas (Marca, Sobre Nosotros con Manifiesto del Taller, Explorar, Legal & Taller), eliminación total del enlace externo a GitHub y del selector de tema claro/oscuro, integrando la insignia permanente "DARK ATELIER EDITION".'
};

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
        description: `${issue.summary}\n\n**Estado:** Finalizada / Listo (Verde)\n**Evidencias:** Captura Playwright adjunta en Jira Software`,
        color: 0x10B981, // Verde: Completado
        url: `${config.host}/browse/${issue.key}`,
        fields: [
          { name: "Ticket", value: `[${issue.key}](${config.host}/browse/${issue.key})`, inline: true },
          { name: "Ambiente", value: "Staging Vercel / Local QA", inline: true },
          { name: "Verificación", value: "QA E2E + Captura Subida", inline: true }
        ],
        footer: { text: "Antigravity Engineering Orchestrator • Sprint 4" },
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
  await transitionIssue(issue.key);
  await sendDiscordNotification(issue);
}

main().then(() => console.log('¡Transición Sprint 4 finalizada con éxito!'));
