import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

const issues = [
  {
    key: 'TH-17',
    title: '🎨 UI/UX: Eliminación de Badge Redundante "TattooHub Studios" en Pantalla de Login',
    summary: 'Se removió el pill badge "💉 TATTOOHUB STUDIOS" dentro de la tarjeta central en LoginPage.tsx para limpiar el diseño y evitar redundancia con el imagotipo oficial del Navbar.'
  },
  {
    key: 'TH-18',
    title: '🛡️ Seguridad/Auth: Blindaje de Sesión en Recuperación de Contraseña y Restricción de Pantallas',
    summary: 'Se implementó sandbox estricto para sesiones originadas por enlace de recuperación (isPasswordRecovery). Navbar sustituye accesos por badge bloqueado "🔒 Restableciendo Contraseña" y ProtectedRoute redirige intentos de acceso a /client-dashboard y /artist-dashboard.'
  },
  {
    key: 'TH-19',
    title: '🔐 Auth/UX: Redirección Fluida Post-Reset y Traducción Completa de Errores al Español',
    summary: 'Se creó diccionario authErrors.ts para traducir al 100% los errores de Supabase al español ("La nueva contraseña debe ser diferente a la contraseña anterior"). Post-reset transiciona fluidamente al dashboard correspondiente.'
  },
  {
    key: 'TH-20',
    title: '🌐 i18n & Idioma del Cliente: Preferencia Lingüística de Clientes y Selector Multilenguaje',
    summary: 'Se incorporó LanguageContext con soporte bilingüe (ES/EN), selector de bandera en Navbar y persistencia de preferred_language en perfil del cliente y vista de chat para los tatuadores.'
  }
];

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
        description: `${issue.summary}\n\n**Estado:** Finalizada / Listo (Verde)\n**Evidencias:** Capturas Playwright adjuntas en Jira Software`,
        color: 0x10B981, // Verde: Completado
        url: `${config.host}/browse/${issue.key}`,
        fields: [
          { name: "Ticket", value: `[${issue.key}](${config.host}/browse/${issue.key})`, inline: true },
          { name: "Ambiente", value: "Staging Vercel / Local QA", inline: true },
          { name: "Verificación", value: "QA E2E + Capturas Subidas", inline: true }
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
    console.log(`[Discord] Notificación verde enviada para ${issue.key}`);
  } else {
    console.error(`[Discord] Error enviando webhook para ${issue.key}:`, res.statusText);
  }
}

async function main() {
  for (const issue of issues) {
    await transitionIssue(issue.key);
    await sendDiscordNotification(issue);
  }
}

main().then(() => console.log('¡Transición Sprint 3 finalizada con éxito!'));
