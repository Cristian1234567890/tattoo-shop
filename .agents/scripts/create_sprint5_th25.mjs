import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

const issueData = {
  summary: "🛡️ Seguridad/QA: Segregación de Usuarios de Acceso, Gate de QA y Blindaje de Features en Staging",
  description: `h2. Requerimiento de Seguridad y Control de Acceso
Implementar segregación de usuarios y blindaje en el ambiente de QA (Staging):
1. *Segregación de Usuarios en QA:* Identificación y etiquetado explícito de perfiles y sesiones creadas en QA (user_metadata.environment = 'qa' / 'is_qa_tester').
2. *Gate de Acceso QA:* Banner y modal restrictivo que advierte que el entorno es exclusivamente para datos ficticios y previene el uso de credenciales/datos reales de clientes o estudios.
3. *Blindaje de Features de Riesgo:* Desactivación o modo simulado para features críticas (pagos reales, notificaciones directas a clientes reales) para evitar brechas de seguridad y confusión.
4. *Espejo en Base de Datos:* Conexión y aislamiento con el esquema 'qa' en PostgreSQL.`
};

async function createIssue() {
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
        description: `Se ha iniciado el procesamiento del requerimiento de segregación de acceso y blindaje de features en QA.\n\n**Estado:** ${stateName}\n**Proyecto:** Tattoo Hub (TH)`,
        color: color,
        url: `${config.host}/browse/${key}`,
        fields: [
          { name: "Ticket", value: `[${key}](${config.host}/browse/${key})`, inline: true },
          { name: "Ambiente", value: "Staging / Local QA", inline: true },
          { name: "Prioridad", value: "P0 - Seguridad & Segregación", inline: true }
        ],
        footer: { text: "Antigravity Engineering Orchestrator • Sprint 6" },
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

createIssue().catch(err => {
  console.error("Error creando ticket TH-25:", err);
  process.exit(1);
});
