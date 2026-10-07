import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

const newTasks = [
  {
    summary: '🎨 UI/UX: Eliminación de Badge Redundante "TattooHub Studios" en Pantalla de Login',
    description: 'Eliminar el pill badge redundante 💉 TATTOOHUB STUDIOS dentro de la tarjeta central de autenticación en LoginPage.tsx ya que el isotipo/logotipo corporativo ya se renderiza en la barra de navegación superior.',
  },
  {
    summary: '🛡️ Seguridad/Auth: Blindaje de Sesión en Recuperación de Contraseña y Restricción de Pantallas',
    description: 'Prevenir que un usuario con token temporal de recuperación (type=recovery / PASSWORD_RECOVERY) pueda navegar a paneles protegidos (/client-dashboard, /artist-dashboard, /user). Enmascarar la Navbar para no mostrar "Mi Panel" ni "Salir" en modo recuperación y restringir accesos hasta completar el cambio de clave.',
  },
  {
    summary: '🔐 Auth/UX: Redirección Fluida Post-Reset y Traducción Completa de Errores al Español',
    description: 'Evitar el rebote innecesario a /login cuando el usuario ya tiene sesión activa post-actualización de clave. Traducir al español todos los mensajes de error devueltos por Supabase Auth (e.g. "New password should be different from the old password." -> "La nueva contraseña debe ser diferente a la anterior").',
  },
  {
    summary: '🌐 i18n & Idioma del Cliente: Preferencia Lingüística de Clientes y Selector Multilenguaje',
    description: 'Incorporar la propiedad de idioma preferido (Español, English, etc.) en el perfil del cliente para que los tatuadores conozcan el canal de comunicación adecuado, e integrar selector de idiomas en la plataforma y flujos de restablecimiento de contraseña.',
  }
];

async function createIssue(task) {
  const payload = {
    fields: {
      project: { key: 'TH' },
      summary: task.summary,
      description: task.description,
      issuetype: { id: '10003' } // Tarea
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

  if (res.ok) {
    const data = await res.json();
    console.log(`[Jira] Creada tarea ${data.key}: ${task.summary}`);
    return data.key;
  } else {
    console.error(`[Jira] Error al crear tarea:`, res.status, await res.text());
    return null;
  }
}

async function sendDiscordNotification(key, task, colorHex, statusText) {
  const payload = {
    content: "@everyone",
    embeds: [
      {
        title: `📌 [${statusText.toUpperCase()}] ${key}: ${task.summary}`,
        description: `${task.description}\n\n**Estado:** ${statusText}\n**Asignado:** Antigravity Engineering Orchestrator`,
        color: colorHex,
        url: `${config.host}/browse/${key}`,
        fields: [
          { name: "Ticket", value: `[${key}](${config.host}/browse/${key})`, inline: true },
          { name: "Prioridad", value: "P1 - Alta", inline: true },
          { name: "Módulo", value: "Auth, Seguridad & i18n", inline: true }
        ],
        footer: { text: "Antigravity Engineering Orchestrator • Sprint 3" },
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
    console.log(`[Discord] Notificación enviada para ${key} (${statusText})`);
  }
}

async function transitionIssue(key, transitionId) {
  await fetch(`${config.host}/rest/api/2/issue/${key}/transitions`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transition: { id: transitionId } // 21 = En curso
    })
  });
}

async function main() {
  const createdKeys = [];
  for (const task of newTasks) {
    const key = await createIssue(task);
    if (key) {
      createdKeys.push({ key, task });
      // 1. Notificación Azul (Backlog)
      await sendDiscordNotification(key, task, 0x3B82F6, "Tarea en Backlog");
      // 2. Transicionar a "En curso" (21)
      await transitionIssue(key, "21");
      // 3. Notificación Amarilla (Desarrollo)
      await sendDiscordNotification(key, task, 0xFBBF24, "Desarrollo");
    }
  }
  fs.writeFileSync('.agents/config/sprint3_keys.json', JSON.stringify(createdKeys, null, 2));
}

main().then(() => console.log('¡Tareas de Sprint 3 creadas y notificadas en Jira & Discord!'));
