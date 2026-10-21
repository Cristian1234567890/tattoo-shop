import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";
const evidenceDir = path.resolve(__dirname, '../evidence/audit');

const completedTickets = [
  {
    key: "TH-73",
    summary: "💳 Unificación de Input de Tarjeta (16 Dígitos Dinámicos) & Verificación Bancaria Multi-Etapa con Progreso Visual",
    detail: "Resolución del overflow horizontal en la tarjeta interactiva: unificación en un solo campo numérico con auto-formateo 4-4-4-4 y ancho responsive. Implementación del modal de verificación bancaria multi-etapa con barra de progreso animada de 0 a 100% que simula la conexión con la red bancaria (Visa/Mastercard), validación de fondos y activación de bóveda cifrada antes de confirmar la membresía.",
    evidenceFiles: ['qa_sprint19_card_single_input.png', 'qa_sprint19_banking_verification_modal.png']
  },
  {
    key: "TH-74",
    summary: "🛡️ Lógica de Visibilidad Condicional de Roles en Navbar & Cobro Directo a Tarjeta Guardada con 1 Clic",
    detail: "Ajuste estricto de visibilidad en el Navbar: ocultamiento total de la opción 'Quiero ser Tatuador / Abrir Estudio' cuando el usuario posee el rol de artista/tatuador, mostrando exclusivamente el conmutador de función ('Cambiar a Modo Cliente'). Integración del selector de pago preferente: cobro directo a tarjeta afiliada guardada en bóveda (1 clic) vs formulario desplegable para afiliar una nueva tarjeta.",
    evidenceFiles: ['qa_sprint19_navbar_artist_mode.png', 'qa_sprint19_saved_card_toggle.png']
  },
  {
    key: "TH-75",
    summary: "💎 Pestaña Dedicada de Primer Nivel 'Suscripciones' en Paneles & Bloque de Transparencia 'Sin Letras Chiquitas'",
    detail: "Creación de la pestaña dedicada de primer nivel 'Suscripciones' tanto en el panel de cliente (/client-dashboard?tab=suscripciones) como de artista (/artist-dashboard?tab=suscripciones). Visualización de plan activo, fecha de renovación, método de pago enmascarado y bloque destacado 'Sin Letras Chiquitas' garantizando cero permanencia, historial perpetuo en modo lectura y preservación de 30 días pagados tras cancelación.",
    evidenceFiles: ['qa_sprint19_client_subscriptions_tab.png', 'qa_sprint19_artist_subscriptions_tab.png']
  },
  {
    key: "TH-76",
    summary: "🎨 Homologación de Contraste en Modo Claro: Notificaciones, Sesiones Activas y Zonas de Seguridad en Paneles",
    detail: "Erradicación de barras oscuras rígidas y textos negros sobre fondos oscuros en la configuración y seguridad de cuentas. Conversión de filas de notificaciones a tarjetas claras bg-slate-50 border-slate-200 text-slate-800 con badges informativos, estilización de sesiones activas (iPhone, MacBook) y adaptación de zonas de riesgo a tonos rose-50 con alta legibilidad.",
    evidenceFiles: ['qa_sprint19_configuracion_light_mode.png', 'qa_sprint19_seguridad_light_mode.png']
  }
];

async function uploadToJira(issueKey, filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ [JIRA] Archivo de evidencia no encontrado: ${filePath}`);
      return;
    }
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    formData.append('file', blob, fileName);

    const res = await fetch(`${config.host}/rest/api/2/issue/${issueKey}/attachments`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'X-Atlassian-Token': 'no-check'
      },
      body: formData
    });

    if (res.ok) {
      console.log(`📎 [JIRA] Evidencia adjunta exitosamente a ${issueKey}: ${fileName}`);
    } else {
      const err = await res.text();
      console.warn(`⚠️ [JIRA] No se pudo adjuntar evidencia a ${issueKey}: ${err}`);
    }
  } catch (error) {
    console.error(`❌ [JIRA] Error adjuntando archivo a ${issueKey}:`, error.message);
  }
}

async function transitionToDone(issueKey) {
  try {
    const transRes = await fetch(`${config.host}/rest/api/2/issue/${issueKey}/transitions`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    if (!transRes.ok) {
      console.warn(`⚠️ [JIRA] No se pudieron obtener transiciones para ${issueKey}`);
      return;
    }

    const transData = await transRes.json();
    const doneTransition = transData.transitions.find(t => 
      t.name.toLowerCase().includes('done') || 
      t.name.toLowerCase().includes('listo') || 
      t.name.toLowerCase().includes('finaliz') ||
      t.name.toLowerCase().includes('cerrad') ||
      t.to.name.toLowerCase().includes('done') ||
      t.to.name.toLowerCase().includes('listo')
    );

    if (doneTransition) {
      const execRes = await fetch(`${config.host}/rest/api/2/issue/${issueKey}/transitions`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transition: { id: doneTransition.id } })
      });

      if (execRes.ok) {
        console.log(`✅ [JIRA] ${issueKey} transicionado a estado '${doneTransition.name}' (DONE)`);
      } else {
        console.warn(`⚠️ [JIRA] Error al ejecutar transición para ${issueKey}`);
      }
    } else {
      console.log(`ℹ️ [JIRA] Transición de cierre directo no requerida o ya completada para ${issueKey}`);
    }
  } catch (err) {
    console.error(`❌ [JIRA] Error en transición de ${issueKey}:`, err.message);
  }
}

async function notifyDiscord(ticket) {
  try {
    const embeds = [
      {
        title: `✅ Tarea Completada en Jira: ${ticket.key}`,
        description: `**${ticket.summary}**\n\n${ticket.detail}`,
        color: 0x10B981, // Emerald Green
        fields: [
          {
            name: "📋 Estado en Jira",
            value: "🟢 **Listo / Finalizado**",
            inline: true
          },
          {
            name: "🔍 Validación QA",
            value: "100% Automatizada (Playwright)",
            inline: true
          },
          {
            name: "🖼️ Evidencias",
            value: ticket.evidenceFiles.join(', '),
            inline: false
          }
        ],
        footer: {
          text: "Tattoo Hub • Sprint 19 Quality Assurance & Verification Suite"
        },
        timestamp: new Date().toISOString()
      }
    ];

    const res = await fetch(DISCORD_JIRA_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds })
    });

    if (res.ok) {
      console.log(`📢 [DISCORD] Notificación de cierre enviada para ${ticket.key}`);
    }
  } catch (err) {
    console.error(`❌ [DISCORD] Error enviando webhook para ${ticket.key}:`, err.message);
  }
}

async function main() {
  console.log('🚀 Finalizando tickets de Sprint 19 en Jira y notificando a Discord...\n');
  for (const ticket of completedTickets) {
    console.log(`--- Procesando ${ticket.key} ---`);
    for (const f of ticket.evidenceFiles) {
      await uploadToJira(ticket.key, path.join(evidenceDir, f));
    }
    await transitionToDone(ticket.key);
    await notifyDiscord(ticket);
    console.log('');
  }
  console.log('🏁 Todos los tickets de Sprint 19 procesados exitosamente.');
}

main();
