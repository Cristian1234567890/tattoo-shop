import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

const sprintIssues = [
  {
    summary: "🌐 UI/UX: Homologación Cross-Browser (Edge, Brave, Chrome) y Estabilidad Responsiva Multi-Resolución",
    description: `h2. Requerimiento
Homologar el renderizado visual y comportamientos de layout entre los navegadores Microsoft Edge, Brave Browser y Google Chrome.
Resolver el colapso y desbordamiento de botones y opciones en resoluciones intermedias (768px a 1150px) y laptops:
1. Normalización CSS global con prefijos de renderizado (-webkit-backdrop-filter, -webkit-text-size-adjust, font fallbacks robustos).
2. Ajuste de breakpoints de Navbar para evitar colapso de divisas, idioma y botones de autenticación.
3. Tratamiento de escudos de Brave y barras laterales de Edge sin distorsión de contenedores.`,
    color: 0x3B82F6
  },
  {
    summary: "🧹 Beneficios: Depuración Profunda de Data Ficticia (Eliminación de Reseñas y Métricas Falsas)",
    description: `h2. Requerimiento
Depurar al 100% la data simulada en la página de Beneficios (/beneficios):
1. Eliminar la sección "Voces del Atelier: La Comunidad Opina" que contiene nombres ficticios (Kaelen Silva, Maya Lin, Cristian Castillo con estudios inventados).
2. Eliminar métricas y afirmaciones falsas ("miles de coleccionistas") en el bloque pre-footer.
3. Reemplazar por pilares auténticos del ecosistema y buzón abierto de feedback de la comunidad para sugerencias directas.`,
    color: 0x3B82F6
  },
  {
    summary: "🗄️ Infra/DevOps: Estrategia y Configuración de Ambientes Separados Supabase (QA vs Producción)",
    description: `h2. Requerimiento
Establecer la segregación y arquitectura entre ambiente de QA y Producción en Supabase:
1. Auditoría del tenant Supabase: identificación del límite de 2 proyectos gratuitos (tattoo-shop y Track_Mates).
2. Definición de la estrategia de espejo (aislamiento por esquema PostgreSQL 'qa' vs proyecto dedicado).
3. Configuración de variables de entorno frontend/backend (.env.staging / .env.production) para desacoplar datos de prueba de datos reales.`,
    color: 0x3B82F6
  }
];

async function createAndNotifyIssue(issueData) {
  const payload = {
    fields: {
      project: { key: "TH" },
      summary: issueData.summary,
      description: issueData.description,
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
    const errText = await res.text();
    throw new Error(`Error creando ticket: ${res.status} - ${errText}`);
  }

  const created = await res.json();
  const key = created.key;
  console.log(`[Jira] Ticket creado: ${key}`);

  // 1. Notificación Azul: Backlog
  await sendDiscordNotification(key, issueData.summary, 0x3B82F6, "Backlog (Azul)", "🟦 [BACKLOG]");

  // 2. Transición a Desarrollo
  await transitionToInProgress(key);

  // 3. Notificación Amarillo: Desarrollo
  await sendDiscordNotification(key, issueData.summary, 0xEAB308, "En Desarrollo (Amarillo)", "🟨 [DESARROLLO]");

  return key;
}

async function sendDiscordNotification(key, summary, color, stateName, titlePrefix) {
  const payload = {
    content: "@everyone",
    embeds: [
      {
        title: `${titlePrefix} ${key}: ${summary}`,
        description: `Se ha iniciado el procesamiento del requerimiento.\n\n**Estado:** ${stateName}\n**Proyecto:** Tattoo Hub (TH)`,
        color: color,
        url: `${config.host}/browse/${key}`,
        fields: [
          { name: "Ticket", value: `[${key}](${config.host}/browse/${key})`, inline: true },
          { name: "Ambiente", value: "Staging / Local QA", inline: true },
          { name: "Prioridad", value: "P1", inline: true }
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
    console.log(`[Discord] Notificación enviada (${stateName}) para ${key}`);
  } else {
    console.error(`[Discord] Error enviando webhook para ${key}:`, res.statusText);
  }
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
    t.id === "21" || t.id === "11"
  );

  const transitionId = inProgressTransition ? inProgressTransition.id : "21";

  const res = await fetch(`${config.host}/rest/api/2/issue/${key}/transitions`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transition: { id: transitionId }
    })
  });

  if (res.ok) {
    console.log(`[Jira] Ticket ${key} transicionado a En Desarrollo (${transitionId})`);
  }
}

async function main() {
  const createdKeys = [];
  for (const item of sprintIssues) {
    const k = await createAndNotifyIssue(item);
    createdKeys.push(k);
  }
  fs.writeFileSync(
    path.resolve(__dirname, '../config/sprint5_keys.json'),
    JSON.stringify({ keys: createdKeys }, null, 2),
    'utf8'
  );
  console.log("Sprint 5 tickets creados y notificados:", createdKeys);
}

main().catch(err => {
  console.error("Error en flujo Jira Sprint 5:", err);
  process.exit(1);
});
