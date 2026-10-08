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
    summary: "📍 Geo/UX: Solicitud Proactiva de Geolocalización al Ingresar y Detección de Artistas Cercanos",
    description: `h2. Requerimiento de Geolocalización
1. Solicitar permisos de geolocalización al cliente mediante navigator.geolocation al ingresar a la plataforma o vista de exploración de artistas/mapa.
2. Centrar mapa y ordenar estudios/tatuadores según proximidad física al cliente.
3. Fallback amigable si el usuario deniega o su dispositivo no soporta geolocalización.`
  },
  {
    summary: "📱 Mobile UX: Corrección de Scroll Táctil, Filtros Horizontales y Listado en Mapa / Artists Hub",
    description: `h2. Requerimiento Mobile en Artists Hub / Mapa
1. El scroll vertical en móviles está bloqueado o atrapado por eventos del mapa impidiendo ver estudios y artistas cercanos.
2. Los filtros horizontales de estilos de tatuaje deben permitir desplazamiento táctil suave (overflow-x-auto, scrollbar oculta o estilizada).
3. Asegurar que el contenedor del drawer de lista y tarjeta de estudio permita scroll fluido en pantallas táctiles pequeñas.`
  },
  {
    summary: "📜 Auth/UX: Desbloqueo y Corrección de Scroll en Modal de Términos y Condiciones de Registro",
    description: `h2. Requerimiento Modal de Términos
1. En registro, el scroll desplaza la pantalla de fondo en lugar de la ventana emergente de Términos y Condiciones.
2. Al ser el texto corto o no registrar el scroll interno, el botón 'He leído y Acepto los Términos' queda permanentemente deshabilitado.
3. Bloquear scroll del body (background scroll lock) al abrir modal, permitir scroll táctil interno fluido (overscroll-behavior: contain) y habilitar el botón inmediatamente si el contenido cabe en la ventana o tras llegar al final.`
  }
];

async function sendDiscordNotification(key, summary, color, stateName, titlePrefix) {
  const payload = {
    content: "@everyone",
    embeds: [
      {
        title: `${titlePrefix} ${key}: ${summary}`,
        description: `Se ha registrado y actualizado la tarea en Jira.\n\n**Estado:** ${stateName}\n**Proyecto:** Tattoo Hub (TH)`,
        color: color,
        url: `${config.host}/browse/${key}`,
        fields: [
          { name: "Ticket", value: `[${key}](${config.host}/browse/${key})`, inline: true },
          { name: "Prioridad", value: "P0 - Core UX & Mobile Experience", inline: true }
        ],
        footer: { text: "Antigravity Engineering Orchestrator • Sprint 7" },
        timestamp: new Date().toISOString()
      }
    ]
  };

  await fetch(DISCORD_JIRA_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function transitionToInProgress(key) {
  const resMeta = await fetch(`${config.host}/rest/api/2/issue/${key}/transitions`, {
    headers: { 'Authorization': authHeader }
  });
  const dataMeta = await resMeta.json();
  const inProgressTransition = dataMeta.transitions?.find(t => 
    t.name.toLowerCase().includes('desarrollo') || 
    t.name.toLowerCase().includes('progress') ||
    t.name.toLowerCase().includes('curso') ||
    t.id === "21"
  );

  const transitionId = inProgressTransition ? inProgressTransition.id : "21";

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

async function run() {
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
    console.log(`[Jira] Ticket creado: ${key} -> ${t.summary}`);

    // 1. Notificación Azul: Backlog
    await sendDiscordNotification(key, t.summary, 0x3B82F6, "Backlog (Azul)", "🟦 [BACKLOG]");

    // 2. Transición a En curso
    await transitionToInProgress(key);

    // 3. Notificación Amarillo: En Desarrollo
    await sendDiscordNotification(key, t.summary, 0xEAB308, "En Desarrollo (Amarillo)", "🟨 [DESARROLLO]");
  }
}

run();
