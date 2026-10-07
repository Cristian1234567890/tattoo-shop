import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

const issueData = {
  summary: "🎨 UI/UX: Rediseño del Footer según Stitch Atelier (Eliminación de GitHub y Selector de Tema)",
  description: `h2. Contexto & Requerimiento del Usuario
Alinear el componente Footer con el diseño de Stitch Atelier según la captura oficial de referencia:
1. *Eliminación de Enlace a GitHub:* Suprimir la sección/ícono que enlaza al repositorio externo de GitHub.
2. *Eliminación de ThemeSwitch (Modo Claro/Oscuro):* Retirar el selector de modo claro/oscuro para consolidar la estética dark atelier permanente.
3. *Estructura a 4 Columnas:*
   - *Columna 1 (Marca):* Imagotipo Tattoo Hub + Descripción del espacio digital independiente + Indicador "DIRECTORIO EN EXPANSIÓN CONSTANTE".
   - *Columna 2 (Sobre Nosotros):* Declaración de misión local + Enlace interactivo "Manifiesto del Taller →".
   - *Columna 3 (Explorar):* Explorar Mapa, Portafolios & Estilos, Herramientas de Estudio, Planes y Membresías.
   - *Columna 4 (Legal & Taller):* Términos y Condiciones, Política de Privacidad, Guía de Higiene y Cuidados.
4. *Barra Inferior:* Copyright © 2026 Tattoo Hub + Insignia fija "DARK ATELIER EDITION".`,
  issuetype: { name: "Task" }
};

async function createIssue() {
  const payload = {
    fields: {
      project: { key: "TH" },
      summary: issueData.summary,
      description: issueData.description,
      issuetype: issueData.issuetype
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
  console.log(`[Jira] Ticket creado exitosamente: ${created.key}`);
  return created.key;
}

async function sendDiscordNotification(key, color, stateName, titlePrefix) {
  const payload = {
    content: "@everyone",
    embeds: [
      {
        title: `${titlePrefix} ${key}: ${issueData.summary}`,
        description: `Se ha registrado el requerimiento de rediseño del Footer según Stitch Atelier.\n\n**Estado:** ${stateName}\n**Alcance:** Eliminación de enlaces externos (GitHub), eliminación de ThemeSwitch, nueva cuadrícula con Manifiesto y badge permanente Dark Atelier.`,
        color: color,
        url: `${config.host}/browse/${key}`,
        fields: [
          { name: "Ticket", value: `[${key}](${config.host}/browse/${key})`, inline: true },
          { name: "Ambiente", value: "Staging / Local", inline: true },
          { name: "Prioridad", value: "P1 - UI/UX Stitch", inline: true }
        ],
        footer: { text: "Antigravity Engineering Orchestrator • Sprint 4" },
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
  // Obtener transiciones disponibles
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
  } else {
    console.warn(`[Jira] Transición directa: ${res.status}`);
  }
}

async function main() {
  const key = await createIssue();
  // Notificación Azul: Backlog
  await sendDiscordNotification(key, 0x3B82F6, "Backlog (Azul)", "🟦 [BACKLOG]");
  // Transicionar a Desarrollo
  await transitionToInProgress(key);
  // Notificación Amarillo: Desarrollo
  await sendDiscordNotification(key, 0xEAB308, "En Desarrollo (Amarillo)", "🟨 [DESARROLLO]");

  fs.writeFileSync(
    path.resolve(__dirname, '../config/sprint4_key.json'),
    JSON.stringify({ key }, null, 2),
    'utf8'
  );
}

main().catch(err => {
  console.error("Error en flujo Jira Sprint 4:", err);
  process.exit(1);
});
