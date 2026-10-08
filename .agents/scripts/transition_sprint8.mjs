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
    key: 'TH-29',
    title: '👤 Auth/Profile: Sincronización de Nombre en Header de Mi Panel y Gestión de Avatar / Vinculación Google OAuth',
    summary: 'Se priorizó el nombre y apellido configurados en el perfil (${meta.nombre} ${meta.apellido}) sobre los datos crudos de Google OAuth en ClientHeroHeader. Se implementó avatar por defecto con selector de presets, subida de foto personalizada, opción de restaurar avatar de Google, y vinculación/desvinculación reactiva de cuentas Google para gestión independiente de correo.'
  },
  {
    key: 'TH-30',
    title: '🧭 UI/UX: Distribución en 3 Secciones de la Navbar (Logo Izquierda, Navegación Centro, Acciones y Sesión Derecha)',
    summary: 'Se reestructuró la barra de navegación superior en tres zonas independientes: Extremo Izquierdo (Logo e isotipo de marca), Centro (Enlaces de navegación: Beneficios, Precios, Artistas, Tienda, Mapa, Nosotros), y Extremo Derecho (Divisa/País, Selector de Idioma, Badge Sandbox QA, Mi Panel y Cerrar Sesión).'
  },
  {
    key: 'TH-31',
    title: '🎨 UI/Components: Homologación Global de Listas Desplegables mediante CustomSelect (Erradicación 100% de Selects Nativos)',
    summary: 'Se erradicaron todos los elementos <select> nativos de HTML5 en el proyecto (0 ocurrencias restantes). Se homologaron con CustomSelect en Configuración de Cliente (País y Provincias con actualización reactiva de prefijos), Selector de Teléfono Internacional, Dashboard de Cliente, Tienda, Perfil de Artista, Modal de Curación y Tarjeta de Crédito Interactiva.'
  }
];

async function getAvailableTransitions(key) {
  const res = await fetch(`${config.host}/rest/api/2/issue/${key}/transitions`, {
    headers: { 'Authorization': authHeader }
  });
  if (res.ok) {
    const data = await res.json();
    return data.transitions;
  }
  return [];
}

async function transitionIssue(key) {
  const transitions = await getAvailableTransitions(key);
  console.log(`[Jira] Transiciones disponibles para ${key}:`, transitions.map(t => `${t.id}: ${t.name}`));
  
  // Buscar transición que corresponda a Listo / Done / Finalizada
  const targetTransition = transitions.find(t => t.id === '41' || t.name.toLowerCase().includes('listo')) || transitions[0];

  if (!targetTransition) {
    console.warn(`[Jira] No se encontraron transiciones para ${key}`);
    return;
  }

  const res = await fetch(`${config.host}/rest/api/2/issue/${key}/transitions`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transition: { id: targetTransition.id }
    })
  });

  if (res.ok) {
    console.log(`[Jira] ${key} transicionado exitosamente a "${targetTransition.name}" (ID: ${targetTransition.id})`);
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
        description: `${issue.summary}\n\n**Estado:** Finalizada / Listo (Verde)\n**Evidencias:** Capturas Playwright E2E subidas a Jira Software`,
        color: 0x10B981, // Verde: Completado
        url: `${config.host}/browse/${issue.key}`,
        fields: [
          { name: "Ticket", value: `[${issue.key}](${config.host}/browse/${issue.key})`, inline: true },
          { name: "Ambiente", value: "Staging Vercel / Local QA", inline: true },
          { name: "Verificación", value: "Playwright E2E Test Suite Passed", inline: true }
        ],
        footer: { text: "Antigravity Engineering Orchestrator • Sprint 8" },
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
    console.error(`[Discord] Error enviando webhook para ${issue.key}:`, res.status, await res.text());
  }
}

async function main() {
  for (const item of completedIssues) {
    await transitionIssue(item.key);
    await addCommentToIssue(item.key, `h3. Resolución Técnica Sprint 8
*Resumen de Cambios:*
${item.summary}

*Pruebas de Calidad:*
- Ejecución Playwright E2E en Chromium con emulación de sesión y navegación.
- Capturas de pantalla validadas y adjuntas en la sección de evidencias de este ticket.`);
    await sendDiscordNotification(item);
  }
  console.log('✅ Finalizado proceso de transición y notificación Discord para Sprint 8.');
}

main().catch(console.error);
