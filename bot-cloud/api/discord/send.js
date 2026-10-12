import { getDb } from '../_lib/firebase.js';
import { requireAuth } from '../_lib/security.js';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_ERROR_WEBHOOK = process.env.DISCORD_ERROR_WEBHOOK;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Enforce authenticating with JWT Bearer or X-API-Key
  const caller = await requireAuth(req, res);
  if (!caller) return;

  if (caller.role === 'Viewer') {
    return res.status(403).json({ error: 'El rol Viewer tiene permisos de solo lectura' });
  }

  const { channel = 'alertas', message, title, mentionEveryone = false, color = 0x3b82f6 } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'El contenido del mensaje es requerido' });
  }

  const payload = {
    content: mentionEveryone ? "@everyone" : undefined,
    embeds: [
      {
        title: title || "📢 COMUNICADO DESDE EL PANEL DE CONTROL OPS",
        description: message,
        color: typeof color === 'string' ? parseInt(color.replace('#', ''), 16) : color,
        footer: { text: `Despachado por @${caller.username} (${caller.role}) • Tattoo Hub Ops` },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    if (DISCORD_ERROR_WEBHOOK) {
      const hookRes = await fetch(DISCORD_ERROR_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!hookRes.ok) {
        console.warn("[Discord Send] Webhook retornó:", hookRes.status, await hookRes.text());
      }
    }

    // Registrar en Firestore con auditoría de usuario
    const db = getDb();
    await db.collection('bot_commands').add({
      command: `/panel-broadcast`,
      user: `${caller.username} (${caller.role})`,
      channel: channel,
      message: message,
      executedAt: new Date().toISOString(),
      status: 'DISPATCHED'
    });

    return res.status(200).json({
      success: true,
      message: 'Mensaje despachado exitosamente a Discord',
      sender: caller.username
    });
  } catch (err) {
    console.error("[Discord Send Error]", err);
    return res.status(500).json({ error: 'Error al enviar a Discord', details: err.message });
  }
}
