import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

const tickets = [
  {
    summary: "☁️ DevOps/Infra: Arquitectura Serverless de Bot de Discord en Vercel (Discord HTTP Interactions)",
    description: `h2. Objetivo y Alcance
Migrar el bot de Discord de un daemon persistente local (WebSockets) a una arquitectura Serverless en Vercel basada en Discord HTTP Interactions API.

h3. Requerimientos Técnicos
1. Endpoint HTTPS /api/discord/interactions en Vercel Serverless.
2. Validación de firma criptográfica ed25519 (X-Signature-Ed25519 y X-Signature-Timestamp) usando el Public Key de Discord Developer Portal.
3. Manejo de PING (Type 1 -> PONG) y Slash Commands (Type 2).
4. Eliminación de la dependencia de procesos en background en la máquina local del Product Owner.`
  },
  {
    summary: "🔥 DB/Infra: Integración de Firebase Firestore para el Bot (Cola de Tareas, Logs & Telemetría)",
    description: `h2. Objetivo y Alcance
Implementar Firebase Firestore como base de datos NoSQL dedicada para el ecosistema del bot, cola de tareas de Antigravity y auditoría, preservando Supabase 100% exclusivo para el core de Tattoo Hub.

h3. Requerimientos Técnicos
1. Configuración de Firebase Admin SDK con Service Account credentials.
2. Definición de colecciones NoSQL:
   - bot_commands: Historial de comandos ejecutados desde Discord.
   - task_queue: Cola de tareas para Antigravity y PO.
   - sentry_incidents: Registro histórico y estado de excepciones de Sentry.
   - admin_users / admin_logs: Credenciales seguras y auditoría de accesos.
3. Garantizar segregación estricta: Cero impacto o saturación en Supabase.`
  },
  {
    summary: "🔐 Auth/UI: Panel Web Aislado en Vercel con Acceso Seguro (Usuario & Contraseña)",
    description: `h2. Objetivo y Alcance
Crear una aplicación web independiente desplegada en Vercel protegida mediante credenciales (Usuario y Contraseña) para supervisar el bot y la actividad operativa.

h3. Requerimientos Técnicos
1. Pantalla de login segura con autenticación basada en credenciales (sesión con token JWT / HttpOnly Cookie o Firebase Auth).
2. Protección de rutas contra accesos no autorizados.
3. Dashboard administrativo:
   - Monitor de estado del bot y servicios en tiempo real.
   - Feed en vivo de errores e incidentes de Sentry.
   - Visualizador de comandos de Discord y cola de tareas.
   - Registro de eventos y auditoría.`
  },
  {
    summary: "🚨 Sentry/Webhook: Enrutador de Alertas Sentry hacia Discord (#errores) y Persistencia en Firestore",
    description: `h2. Objetivo y Alcance
Establecer un webhook en Vercel que reciba las alertas de error de Sentry en tiempo real y las reenvíe a Discord con alertas ricas y persistencia en Firestore.

h3. Requerimientos Técnicos
1. Endpoint /api/sentry/webhook en Vercel.
2. Parseo de eventos, stack trace, nivel de severidad y tags de Sentry.
3. Despacho automático de embeds a Discord en el canal #errores (o fallback #alertas-agentes) con mención @everyone.
4. Almacenamiento del incidente en la colección sentry_incidents de Firestore.`
  },
  {
    summary: "🤖 Discord/Sync: Registro de Slash Commands y Desacople del Daemon Local",
    description: `h2. Objetivo y Alcance
Registrar los comandos Slash en Discord (/plan, /dashboard, /crear, /bug, /soporte, /sentry, /instruccion, /status) para interactuar vía HTTP directamente con Jira y Vercel, permitiendo apagar el proceso local en la máquina.

h3. Requerimientos Técnicos
1. Script de registro de Application (Slash) Commands en la API REST de Discord.
2. Integración directa de respuestas rápidas (< 3 segundos) con deferred interactions si se requiere consultar Jira.
3. Verificación de flujo end-to-end desde Discord hacia Jira y Firebase.
4. Parada y desmantelamiento del daemon local en la máquina del PO.`
  }
];

async function sendDiscordNotification(key, summary, color, stateName, titlePrefix) {
  const payload = {
    content: "@everyone",
    embeds: [
      {
        title: `${titlePrefix} ${key}: ${summary}`,
        description: `Se ha registrado una nueva tarea en Jira para la Arquitectura Serverless & Firebase.\n\n**Estado:** ${stateName}\n**Proyecto:** Tattoo Hub (TH)`,
        color: color,
        url: `${config.host}/browse/${key}`,
        fields: [
          { name: "Ticket", value: `[${key}](${config.host}/browse/${key})`, inline: true },
          { name: "Módulo", value: "Bot Cloud & Firebase / Vercel", inline: true }
        ],
        footer: { text: "Antigravity Engineering Orchestrator • Serverless Cloud Bot" },
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
  console.log(`[Jira] Iniciando creación de ${tickets.length} tickets para la fase Serverless Bot & Firebase...`);
  for (const t of tickets) {
    const payload = {
      fields: {
        project: { key: "TH" },
        summary: t.summary,
        description: t.description,
        issuetype: { name: "Task" }
      }
    };

    const res = await fetch(`${config.host}/rest/api/2/issue`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error(`Error creando ticket ${t.summary}:`, await res.text());
      continue;
    }

    const created = await res.json();
    const key = created.key;
    console.log(`[Jira] Ticket creado exitosamente: ${key} -> ${t.summary}`);

    // Notificación Azul en Discord: Backlog
    await sendDiscordNotification(key, t.summary, 0x3B82F6, "Tareas por hacer (Backlog)", "🟦 [NUEVO TICKET]");
  }
}

run();
