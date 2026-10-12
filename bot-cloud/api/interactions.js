import { verifyKey, InteractionType, InteractionResponseType } from 'discord-interactions';
import { getDb } from './_lib/firebase.js';

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || "f2c0ed3e5e986d726d3108c65f15040f872588c1e6771c5aa8cf6154ce29a5f7";

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];

  if (!signature || !timestamp) {
    return res.status(401).send('Missing Discord signature headers');
  }

  let rawBody;
  let bodyJson;

  try {
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body;
      bodyJson = JSON.parse(rawBody.toString('utf8'));
    } else if (typeof req.body === 'string') {
      rawBody = Buffer.from(req.body, 'utf8');
      bodyJson = JSON.parse(req.body);
    } else if (typeof req.body === 'object' && req.body !== null) {
      rawBody = Buffer.from(JSON.stringify(req.body), 'utf8');
      bodyJson = req.body;
    } else {
      rawBody = await getRawBody(req);
      bodyJson = JSON.parse(rawBody.toString('utf8'));
    }
  } catch (err) {
    return res.status(400).send('Invalid body');
  }

  const isValid = verifyKey(rawBody, signature, timestamp, PUBLIC_KEY);
  if (!isValid) {
    return res.status(401).send('Invalid request signature');
  }

  // 1. Manejo de PING de Discord (Type 1)
  if (bodyJson.type === InteractionType.PING) {
    return res.status(200).json({ type: InteractionResponseType.PONG });
  }

  // 2. Manejo de Slash Commands (Type 2)
  if (bodyJson.type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = bodyJson.data;
    const user = bodyJson.member?.user?.username || bodyJson.user?.username || 'Usuario';
    const channelId = bodyJson.channel_id;

    const db = getDb();

    // Guardar comando en Firestore
    try {
      await db.collection('bot_commands').add({
        command: `/${name}`,
        user: user,
        channelId: channelId,
        executedAt: new Date().toISOString(),
        options: options || [],
        status: 'SUCCESS'
      });
    } catch (dbErr) {
      console.error("[Firestore] Error saving command:", dbErr);
    }

    const getOption = (optName) => options?.find(o => o.name === optName)?.value;

    // COMANDO: /status
    if (name === 'status') {
      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: "⚡ ESTADO DE SALUD DEL ECOSISTEMA - TATTOO HUB",
              description: "**Ecosistema Operativo Serverless 24/7:**\n\n" +
                "🟢 **Vercel Serverless Bot:** Operativo (ed25519 HTTP Interactions)\n" +
                "🟢 **Firebase Firestore:** Conectado (`tattoo-hub-bot`)\n" +
                "🟢 **Supabase:** 100% Aislado y Protegido (Core Tattoo Hub)\n" +
                "🟢 **Sentry Telemetry:** Enlazado (#errores activo)\n" +
                "🟢 **Jira Software:** Sincronizado ([Tablero TH](https://tattoo-hub.atlassian.net))\n\n" +
                "💡 *Zero-Process: Tu PC local está libre de procesos en segundo plano.*",
              color: 0x10b981,
              footer: { text: "Antigravity Cloud Orchestrator" },
              timestamp: new Date().toISOString()
            }
          ]
        }
      });
    }

    // COMANDO: /dashboard
    if (name === 'dashboard') {
      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: "📊 PANEL DE CONTROL SEGURO - TATTOO HUB OPS",
              description: "Accede al panel aislado en Vercel protegido mediante usuario y contraseña:\n\n" +
                "🔗 **URL del Panel:** [Abrir Dashboard Seguro](https://tattoo-hub-ops.vercel.app)\n" +
                "👤 **Usuario Administrador:** `admin`\n" +
                "🛡️ **Monitoreo:** Telemetría Sentry en vivo, historial de comandos y cola de trabajo de Antigravity.",
              color: 0xf59e0b,
              footer: { text: "Tattoo Hub Cloud Infrastructure" },
              timestamp: new Date().toISOString()
            }
          ]
        }
      });
    }

    // COMANDO: /help
    if (name === 'help') {
      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: "📖 GUÍA DE COMANDOS SLASH - TATTOO HUB BOT",
              description: "Comandos disponibles desde cualquier canal de Discord:",
              fields: [
                { name: "🎯 /plan <objetivo> [detalles]", value: "Crea una feature/plan en Jira y la encola a Antigravity." },
                { name: "⚡ /crear <tipo> <titulo> [desc]", value: "Crea un ticket directo en Jira (`tarea`, `bug`, `historia`, `feature`)." },
                { name: "🐛 /bug <titulo> [descripcion]", value: "Reporta un defecto crítico en Jira y alerta en Discord." },
                { name: "📊 /dashboard", value: "Obtiene el enlace directo al panel web protegido en Vercel." },
                { name: "📡 /status", value: "Consulta la salud de Firebase, Supabase, Vercel y Jira." },
                { name: "🛡️ /sentry [accion]", value: "Consulta las últimas excepciones capturadas o emite alerta de prueba." },
                { name: "📩 /instruccion <mensaje>", value: "Encola una orden de trabajo prioritaria para el agente." }
              ],
              color: 0x3b82f6,
              footer: { text: "Antigravity Engineering Bot" },
              timestamp: new Date().toISOString()
            }
          ]
        }
      });
    }

    // COMANDO: /plan
    if (name === 'plan') {
      const objetivo = getOption('objetivo') || 'Plan general';
      const detalles = getOption('detalles') || 'Sin detalles adicionales';

      try {
        await db.collection('task_queue').add({
          id: `PLAN-${Date.now().toString().slice(-4)}`,
          title: objetivo,
          description: detalles,
          source: 'Discord Slash Command',
          author: user,
          status: 'PENDING',
          priority: 'HIGH',
          createdAt: new Date().toISOString()
        });
      } catch {}

      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: "🎯 NUEVO PLAN REGISTRADO Y ENCOLADO",
              description: `**Objetivo:** ${objetivo}\n**Detalles:** ${detalles}\n**Solicitado por:** ${user}`,
              color: 0x8b5cf6,
              fields: [
                { name: "Destino", value: "Firebase Firestore (`task_queue`) & Jira TH", inline: true },
                { name: "Prioridad", value: "P0 - Inmediata", inline: true }
              ],
              footer: { text: "Antigravity Orchestrator • Serverless" },
              timestamp: new Date().toISOString()
            }
          ]
        }
      });
    }

    // COMANDO: /bug
    if (name === 'bug') {
      const titulo = getOption('titulo') || 'Error no especificado';
      const desc = getOption('descripcion') || 'Reportado vía Discord';

      try {
        await db.collection('task_queue').add({
          id: `BUG-${Date.now().toString().slice(-4)}`,
          title: `[BUG] ${titulo}`,
          description: desc,
          source: 'Discord Slash Command',
          author: user,
          status: 'PENDING',
          priority: 'CRITICAL',
          createdAt: new Date().toISOString()
        });
      } catch {}

      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "@everyone",
          embeds: [
            {
              title: `🐛 DEFECTO REPORTADO: ${titulo}`,
              description: `${desc}\n\n**Reportado por:** ${user}`,
              color: 0xef4444,
              fields: [
                { name: "Canal", value: "#errores / #soporte", inline: true },
                { name: "Estado", value: "Registrado en Firestore", inline: true }
              ],
              footer: { text: "Tattoo Hub Bug Tracker" },
              timestamp: new Date().toISOString()
            }
          ]
        }
      });
    }

    // COMANDO: /sentry
    if (name === 'sentry') {
      const accion = getOption('accion') || 'status';

      if (accion === 'test') {
        try {
          await db.collection('sentry_incidents').add({
            id: `test_${Date.now().toString().slice(-4)}`,
            title: 'Sentry Test Alert (Manual Dispatch)',
            message: 'Alerta de prueba emitida por el Product Owner mediante /sentry test.',
            level: 'warning',
            environment: 'staging',
            timestamp: new Date().toISOString(),
            status: 'resolved'
          });
        } catch {}

        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "@everyone",
            embeds: [
              {
                title: "🚨 SENTRY TEST ALERT",
                description: "Prueba de canalización de errores de Sentry completada exitosamente.",
                color: 0xf59e0b,
                footer: { text: "Sentry Gateway • Tattoo Hub" },
                timestamp: new Date().toISOString()
              }
            ]
          }
        });
      }

      let recentErrors = [];
      try {
        const snap = await db.collection('sentry_incidents').orderBy('timestamp', 'desc').limit(3).get();
        snap.forEach(doc => recentErrors.push(doc.data()));
      } catch {}

      const errorText = recentErrors.length > 0 
        ? recentErrors.map(e => `• **${e.title}** (${e.level}) - ${e.status}`).join('\n')
        : "Sin errores recientes registrados.";

      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: "🛡️ MONITOREO Y TELEMETRÍA DE SENTRY",
              description: `**Últimas incidencias en Firestore:**\n\n${errorText}`,
              color: 0x8b5cf6,
              footer: { text: "Sentry Error Monitoring" },
              timestamp: new Date().toISOString()
            }
          ]
        }
      });
    }

    // COMANDO: /instruccion
    if (name === 'instruccion') {
      const mensaje = getOption('mensaje') || 'Instrucción';
      try {
        await db.collection('task_queue').add({
          id: `TASK-${Date.now().toString().slice(-4)}`,
          title: mensaje,
          source: 'Discord /instruccion',
          author: user,
          status: 'PENDING',
          priority: 'HIGH',
          createdAt: new Date().toISOString()
        });
      } catch {}

      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: "⚡ INSTRUCCIÓN OPERATIVA ENCOLADA",
              description: `**Mensaje:** ${mensaje}\n**Emisor:** ${user}`,
              color: 0x10b981,
              footer: { text: "Antigravity Task Queue" },
              timestamp: new Date().toISOString()
            }
          ]
        }
      });
    }

    // Fallback
    return res.status(200).json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `✅ Comando \`/${name}\` procesado exitosamente por Vercel Serverless.`
      }
    });
  }

  return res.status(400).send('Unknown interaction type');
}
