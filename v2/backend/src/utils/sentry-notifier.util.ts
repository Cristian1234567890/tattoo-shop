import * as Sentry from '@sentry/node';

const FALLBACK_DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1557427496411078757/PZEAT8aJH8L6rAYsi-rkGZCIIh9-qcHuf1UXj_BAthmDZMewJtiPPFSx4GGF8kATxMgL";

export interface SentryErrorInfo {
  message: string;
  stack?: string;
  path?: string;
  method?: string;
  source?: string;
  environment?: string;
}

export async function reportSentryErrorToDiscord(info: SentryErrorInfo): Promise<void> {
  const payload = {
    message: info.message,
    stack: info.stack,
    path: info.path || 'N/A',
    method: info.method || 'GET',
    source: info.source || 'v2/backend',
    environment: process.env.NODE_ENV || 'staging'
  };

  // 1. Intentar enviar a través del Bot IPC local (puerto 3890)
  try {
    const res = await fetch('http://127.0.0.1:3890/sentry-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return;
  } catch {
    // Si el bot local está apagado, enviar directamente al webhook de Discord
  }

  // 2. Fallback directo al webhook oficial de Discord
  try {
    const embed = {
      title: "🚨 [SENTRY ALERT] Excepción Detectada en Staging",
      description: `**Mensaje:** \`${payload.message}\`\n**Ambiente:** \`${payload.environment}\`\n**Origen:** \`${payload.source}\``,
      color: 0xe74c3c,
      fields: [
        { name: "📍 Endpoint", value: `\`${payload.path}\` (${payload.method})`, inline: true },
        { name: "🕒 Fecha", value: new Date().toLocaleString('es-CO'), inline: true },
        { name: "🔍 Stack", value: `\`\`\`javascript\n${(payload.stack || 'Sin stack trace').substring(0, 500)}\n\`\`\``, inline: false }
      ],
      footer: { text: "Sentry Alert Webhook" },
      timestamp: new Date().toISOString()
    };

    await fetch(FALLBACK_DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: "@everyone", embeds: [embed] })
    });
  } catch (webhookErr) {
    console.error('[Sentry Notifier] Error enviando webhook de fallback:', webhookErr);
  }
}
