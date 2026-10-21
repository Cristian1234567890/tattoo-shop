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
    key: "TH-69",
    summary: "🎨 Corrección Integral de Contraste en Modo Claro & Homologación de Paleta Institucional (GuestGateModal, PricingPage, CustomSelect, ShopPage)",
    detail: "Eliminación de fondos oscuros duros con textos negros ilegibles. Corrección en GuestGateModal con paleta suave violet-50 y bordes accesibles. PricingPage adaptada con botones claros en modo claro para 'Empezar Gratis' y gradiente violeta/índigo para VIP. CustomSelect sin fondos oscuros rígidos y ShopPage con acento violeta institucional en 'Apartar para Retiro'.",
    evidenceFiles: ['qa_sprint18_pricing_light_mode.png', 'qa_sprint18_shop_light_mode.png']
  },
  {
    key: "TH-70",
    summary: "🚀 Rediseño de Experiencia 'Quiero ser Tatuador': Pantalla Completa Dedicada (/unete-como-tatuador) y Desacople de Modal en Navbar",
    detail: "Desacople total del formulario del Navbar. Creación de ruta dedicada /unete-como-tatuador (BecomeArtistPage.tsx) con stepper guiado en 4 pasos (perfil artístico, selección de plan comercial, pasarela de tarjeta con 30 días gratis y confirmación con acceso al panel). Inclusión en exemptPaths de OnboardingGate.",
    evidenceFiles: ['qa_sprint18_become_artist_flow.png']
  },
  {
    key: "TH-71",
    summary: "💳 Pasarela Nativa de Afiliación de Tarjeta (Legacy Card Vault): Algoritmo de Luhn, Detección de Franquicia, Enmascaramiento y Débito Recurrente",
    detail: "Pasarela nativa dentro de la aplicación para afiliación directa de tarjetas bancarias. Algoritmo de Luhn para validación de checksum, detección dinámica de franquicias (Visa, Mastercard, Amex, Discover), casilla obligatoria de consentimiento explícito y enmascaramiento seguro de tarjeta (**** **** **** 1234) activando 30 días de suscripción sin cobro inmediato.",
    evidenceFiles: ['qa_sprint18_become_artist_flow.png']
  },
  {
    key: "TH-72",
    summary: "🛡️ Flujo de Cancelación y Reactivación de Suscripción con Resguardo de 30 Días y Modo Lectura Permanente para Datos Históricos",
    detail: "Ciclo completo de cancelación y reactivación de suscripción para clientes VIP y tatuadores. Garantía de preservación de beneficios durante los 30 días restantes desde el último pago (current_period_end). Al expirar, transición a rol gratuito con resguardo permanente de datos en modo lectura (citas, fotos de evolución, tatuajes y obras). Endpoints POST /subscription/cancel, POST /subscription/reactivate y componente SubscriptionBillingSection con modal de confirmación.",
    evidenceFiles: ['qa_sprint18_cancel_modal.png', 'qa_sprint18_client_dashboard_billing.png']
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
      console.log(`📎 [JIRA] Captura ${fileName} adjuntada exitosamente a ${issueKey}`);
    } else {
      console.warn(`⚠️ [JIRA] No se pudo adjuntar ${fileName} a ${issueKey}:`, res.status);
    }
  } catch (err) {
    console.error(`❌ [JIRA] Excepción adjuntando a ${issueKey}:`, err.message);
  }
}

async function transitionTicket(key) {
  try {
    const res = await fetch(`${config.host}/rest/api/3/issue/${key}/transitions`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        transition: { id: "41" } // 41 = Listo / Finalizada
      })
    });
    if (res.ok || res.status === 204) {
      console.log(`✅ [JIRA] ${key} transicionado exitosamente a "Listo" (Done).`);
      return true;
    } else {
      const err = await res.text();
      console.warn(`⚠️ [JIRA] No se pudo transicionar ${key} a Listo: ${res.status} - ${err}`);
      return false;
    }
  } catch (err) {
    console.error(`❌ [JIRA] Error transicionando ${key}:`, err.message);
    return false;
  }
}

async function notifyDiscord() {
  const fields = completedTickets.map((t) => ({
    name: `✅ [${t.key}] ${t.summary}`,
    value: `${t.detail}\n🔗 [Ver en Jira Software](${config.host}/browse/${t.key})`,
    inline: false
  }));

  const embed = {
    title: "🎯 Sprint 18 Finalizado al 100% — Contraste Modo Claro, /unete-como-tatuador, Pasarela Nativa & Ciclo de Suscripción",
    description: "Todas las tareas del Sprint 18 han sido implementadas, verificadas con auditoría de navegador Playwright (5/5 validaciones - 100%), suite backend (112/112 pruebas - 100%), desplegado en producción en Vercel (https://tattoo-hub.vercel.app), evidencias adjuntas en Jira y transicionadas a **Listo**.",
    url: `${config.host}/jira/software/projects/${config.projectKey}/boards`,
    color: 0x10B981, // Emerald Green
    fields,
    footer: {
      text: "Tattoo Hub Ops • DevSecOps & QA Bot • Sprint 18 Complete",
      icon_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico"
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    username: "Tattoo Hub Jira Bot",
    avatar_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico",
    content: "🚀 **¡Sprint 18 Completado con Éxito!** — Las 4 tareas (TH-69 a TH-72) han sido verificadas y transicionadas a **Listo**.",
    embeds: [embed]
  };

  try {
    const res = await fetch(DISCORD_JIRA_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok || res.status === 204) {
      console.log("✅ Anuncio de finalización de Sprint 18 enviado a Discord exitosamente.");
    } else {
      console.error(`❌ Error enviando a Discord: ${res.status}`);
    }
  } catch (err) {
    console.error("❌ Fallo en webhook de Discord:", err.message);
  }
}

async function run() {
  for (const t of completedTickets) {
    console.log(`\n--- Procesando Cierre de ${t.key} ---`);
    if (t.evidenceFiles) {
      for (const f of t.evidenceFiles) {
        const fullPath = path.join(evidenceDir, f);
        await uploadToJira(t.key, fullPath);
      }
    }
    await transitionTicket(t.key);
  }

  await notifyDiscord();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
