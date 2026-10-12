import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

const completedTickets = [
  {
    key: "TH-34",
    title: "☁️ DevOps/Infra: Arquitectura Serverless de Bot de Discord en Vercel (Discord HTTP Interactions & Verification)",
    summary: "Se implementó la arquitectura Serverless HTTP Interactions para Discord en Vercel con validación ed25519 (X-Signature-Ed25519). Publicado en producción en https://tattoo-hub-ops.vercel.app/api/interactions."
  },
  {
    key: "TH-35",
    title: "🔥 DB/Infra: Integración de Firebase Firestore para el Bot (Cola de Tareas, Logs & Telemetría)",
    summary: "Se integró Firebase Admin SDK v13 y Cloud Firestore nativo bajo el proyecto 'tattoo-hub-bot'. Se inicializaron las colecciones bot_commands, task_queue, sentry_incidents y admin_users, manteniendo a Supabase 100% puro para Tattoo Hub."
  },
  {
    key: "TH-36",
    title: "🔐 Auth/UI: Panel Web Aislado en Vercel con Acceso Seguro (Usuario & Contraseña)",
    summary: "Se diseñó y desplegó el panel de control independiente en Vercel (https://tattoo-hub-ops.vercel.app) con autenticación por credenciales, telemetría de Sentry en tiempo real, registro de comandos de Discord y cola de tareas de Antigravity."
  },
  {
    key: "TH-37",
    title: "🚨 Sentry/Webhook: Enrutador de Alertas Sentry hacia Discord (#errores) y Persistencia en Firestore",
    summary: "Se implementó y verificó en vivo el endpoint https://tattoo-hub-ops.vercel.app/api/sentry-webhook. Recibe eventos de error de Sentry, los persiste en Firestore y los despacha a Discord con embed y @everyone."
  }
];

async function transitionToDone(key) {
  // Primero transition a In Progress si está en Backlog
  const resMeta = await fetch(`${config.host}/rest/api/2/issue/${key}/transitions`, {
    headers: { 'Authorization': authHeader }
  });
  const dataMeta = await resMeta.json();
  
  // Buscar transition a Listo / Finalizada / Done (ID 41 o 31)
  let doneTransition = dataMeta.transitions?.find(t => 
    t.name.toLowerCase().includes('listo') || 
    t.name.toLowerCase().includes('finalizada') ||
    t.name.toLowerCase().includes('done') ||
    t.id === "41" || t.id === "31"
  );

  // Si no está directamente accesible, pasar por In Progress (21)
  if (!doneTransition) {
    const inProgress = dataMeta.transitions?.find(t => t.id === "21" || t.name.toLowerCase().includes('progreso') || t.name.toLowerCase().includes('curso'));
    if (inProgress) {
      await fetch(`${config.host}/rest/api/2/issue/${key}/transitions`, {
        method: 'POST',
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ transition: { id: inProgress.id } })
      });
      // Volver a consultar
      const resMeta2 = await fetch(`${config.host}/rest/api/2/issue/${key}/transitions`, {
        headers: { 'Authorization': authHeader }
      });
      const dataMeta2 = await resMeta2.json();
      doneTransition = dataMeta2.transitions?.find(t => 
        t.name.toLowerCase().includes('listo') || 
        t.name.toLowerCase().includes('finalizada') ||
        t.id === "41"
      );
    }
  }

  const transitionId = doneTransition ? doneTransition.id : "41";

  await fetch(`${config.host}/rest/api/2/issue/${key}/transitions`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transition: { id: transitionId }
    })
  });
}

async function addComment(key, commentBody) {
  await fetch(`${config.host}/rest/api/2/issue/${key}/comment`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ body: commentBody })
  });
}

async function sendDiscordNotification(key, title, summary) {
  const payload = {
    content: "@everyone",
    embeds: [
      {
        title: `✅ [FINALIZADA] ${key}: ${title}`,
        description: `${summary}\n\n**Estado:** Finalizada / Listo (Verde)\n**Proyecto:** Tattoo Hub (TH)\n**Panel en Vivo:** [tattoo-hub-ops.vercel.app](https://tattoo-hub-ops.vercel.app)`,
        color: 0x10b981,
        url: `${config.host}/browse/${key}`,
        fields: [
          { name: "Ticket", value: `[${key}](${config.host}/browse/${key})`, inline: true },
          { name: "Infraestructura", value: "Vercel Serverless + Firebase Firestore", inline: true }
        ],
        footer: { text: "Antigravity Engineering Orchestrator • Serverless Cloud Complete" },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    await fetch(DISCORD_JIRA_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Error enviando notificación a Discord:", err.message);
  }
}

async function run() {
  for (const t of completedTickets) {
    console.log(`[Jira] Transicionando ${t.key} a Finalizada...`);
    await transitionToDone(t.key);
    await addComment(t.key, `h2. Implementación y Verificación Exitosa\n\n${t.summary}\n\n* *Despliegue Producción:* https://tattoo-hub-ops.vercel.app\n* *Interactions URL:* https://tattoo-hub-ops.vercel.app/api/interactions\n* *Sentry Webhook URL:* https://tattoo-hub-ops.vercel.app/api/sentry-webhook\n* *Persistencia:* Firebase Firestore ('tattoo-hub-bot')`);
    await sendDiscordNotification(t.key, t.title, t.summary);
    console.log(`✓ ${t.key} completado y notificado.`);
  }
}

run();
