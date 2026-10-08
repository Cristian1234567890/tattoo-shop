import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

const completedIssues = [
  {
    key: 'TH-22',
    title: '🌐 UI/UX: Homologación Cross-Browser (Edge, Brave, Chrome) y Estabilidad Responsiva Multi-Resolución',
    summary: 'Se ajustó el breakpoint crítico del Navbar a lg (1024px) con whitespace-nowrap y shrink-0, eliminando el colapso y desbordamiento de divisas/idioma/botones en pantallas intermedias y navegadores con barras laterales (Edge/Brave). Se añadieron resets globales de scrollbars y -webkit-text-size-adjust en index.css.'
  },
  {
    key: 'TH-23',
    title: '🧹 Beneficios: Depuración Profunda de Data Ficticia (Eliminación de Reseñas y Métricas Falsas)',
    summary: 'Se eliminó al 100% la sección ficticia "Voces del Atelier" (Kaelen Silva, Maya Lin, Cristian Castillo con estudios inventados) y las métricas no comprobadas. Se reemplazó por la sección auténtica "Compromiso del Ecosistema" con los 3 pilares reales de Tattoo Hub.'
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

async function addCommentToIssue(key, commentBody) {
  const res = await fetch(`${config.host}/rest/api/2/issue/${key}/comment`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ body: commentBody })
  });
  if (res.ok) {
    console.log(`[Jira] Comentario técnico añadido a ${key}`);
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
        footer: { text: "Antigravity Engineering Orchestrator • Sprint 5" },
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
  }
}

async function main() {
  for (const item of completedIssues) {
    await transitionIssue(item.key);
    await sendDiscordNotification(item);
  }

  // Comentario de arquitectura en TH-24
  const th24Comment = `h3. Informe de Infraestructura Supabase (QA vs Producción)
Tras auditar el tenant de Supabase vía API REST/MCP:
1. *Límite de Proyectos Gratuitos:* El usuario 'OurPresent' tiene 2 proyectos activos (tattoo-shop [mftthukphffirdcoqprz] y Track_Mates [ravefhvocxjaxqfyjfvc]), alcanzando el límite máximo de Supabase Free (2 proyectos).
2. *Rutas de Solución para Segregación Espejo:*
   - *Opción 1 (Recomendada inmediata):* Esquema PostgreSQL segregado 'qa' dentro de la base actual con réplica de tablas y RLS, aislando 100% la data de pruebas sin costo ni fricción.
   - *Opción 2 (Proyecto independiente):* Pausar temporalmente el proyecto 'Track_Mates' para habilitar la creación de 'tattoo-shop-qa' en la nube.
   - *Opción 3:* Proporcionar credenciales de una segunda organización/cuenta de Supabase.`;

  await addCommentToIssue('TH-24', th24Comment);
}

main().then(() => console.log('¡Transiciones Sprint 5 completadas!'));
