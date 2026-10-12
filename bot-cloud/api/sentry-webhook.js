import { getDb } from './_lib/firebase.js';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_ERROR_WEBHOOK || "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const payload = req.body || {};
  console.log("[Sentry Webhook] Evento recibido:", payload.action || payload.event?.title || 'Unknown');

  // Extraer datos del evento de Sentry
  const event = payload.event || payload.data?.event || {};
  const issue = payload.data?.issue || {};

  const title = issue.title || event.title || event.message || 'Sentry Exception Detected';
  const message = issue.culprit || event.culprit || (typeof event.metadata?.value === 'string' ? event.metadata.value : 'Excepción capturada en runtime');
  const level = event.level || issue.level || 'error';
  const platform = event.platform || 'javascript/node';
  const environment = event.environment || 'staging';
  const issueUrl = issue.web_url || issue.permalink || 'https://sentry.io';
  const eventId = event.event_id || `sentry_${Date.now()}`;

  const incidentDoc = {
    id: eventId,
    event_id: eventId,
    title: title,
    message: message,
    level: level,
    platform: platform,
    environment: environment,
    url: issueUrl,
    timestamp: new Date().toISOString(),
    status: 'open',
    source: 'Sentry Webhook Gateway'
  };

  // 1. Guardar en Firestore (preservando Supabase intacto)
  try {
    const db = getDb();
    await db.collection('sentry_incidents').doc(eventId).set(incidentDoc);
    console.log(`[Firestore] Incidente ${eventId} guardado.`);
  } catch (dbErr) {
    console.error("[Firestore Error]", dbErr);
  }

  // 2. Despachar a Discord con mención @everyone
  const colorMap = {
    'fatal': 0x7f1d1d,
    'error': 0xef4444,
    'warning': 0xf59e0b,
    'info': 0x3b82f6
  };
  const embedColor = colorMap[level] || 0xef4444;

  const discordPayload = {
    content: "@everyone 🚨 **ALERTA CRÍTICA DE SENTRY**",
    embeds: [
      {
        title: `🚨 ${level.toUpperCase()}: ${title}`,
        description: `**Detalle:** ${message}\n\n**Ambiente:** \`${environment}\` | **Plataforma:** \`${platform}\``,
        color: embedColor,
        url: issueUrl,
        fields: [
          { name: "ID Evento", value: `\`${eventId}\``, inline: true },
          { name: "Estado", value: "Registrado en Firestore", inline: true },
          { name: "Enlace en Sentry", value: `[Ver Incidente](${issueUrl})`, inline: false }
        ],
        footer: { text: "Sentry Error Gateway • Tattoo Hub Serverless" },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });
    console.log("[Discord] Notificación de Sentry despachada.");
  } catch (dErr) {
    console.error("[Discord Webhook Error]", dErr);
  }

  return res.status(200).json({
    status: 'OK',
    recordedId: eventId,
    message: 'Incidente procesado y notificado exitosamente'
  });
}
