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
    summary: "🎨 UI/UX: Implementación Integral de Modo Claro Global y Corrección de Fondos Duros",
    description: `h2. Objetivo y Alcance
El modo claro debe transformar completamente la aplicación a un tema claro auténtico (paleta pergamino atelier de lujo), eliminando fondos oscuros hardcodeados (#0B0B0E, #090d16) en todas las páginas públicas y privadas, garantizando tipografías y contrastes accesibles WCAG 2.1 AA.

h3. Requerimientos Técnicos
1. Reemplazar clases duras bg-[#0B0B0E] y bg-[#090d16] por variables/clases dinámicas adaptables al tema en BenefitsPage, PricingPage, ArtistsDirectoryPage, ShopPage, HomePage, AboutPage, LoginPage y RegisterPage.
2. Refinar index.css para que html.light aplique fondo parchment claro (#f8fafc), textos oscuros legibles (#0f172a / #334155) y tarjetas con fondos blancos (#ffffff) y bordes sutiles (#e2e8f0).
3. Asegurar que botones primarios y acentos conserven su texto de alto contraste sin inversión errónea.`
  },
  {
    summary: "🧭 Navbar/UX: Rediseño Espacioso, Descongestión de Opciones y Menú de Usuario Unificado",
    description: `h2. Objetivo y Alcance
El Navbar superior presenta saturación horizontal de elementos fijos que colisionan en resoluciones estándar (1024px-1440px). Se debe descongestionar la barra, aprovechar los espacios y unificar acciones en menús interactivos elegantes.

h3. Requerimientos Técnicos
1. Eliminar caracteres erróneos o separadores que colisionan junto al logo.
2. Unificar las opciones de usuario autenticado (Mi Panel, Switch de Rol, Modo de Tema y Cerrar Sesión) dentro de un User Dropdown elegante anclado al Avatar.
3. Compactar los selectores de Moneda y Lenguaje en un grupo limpio para evitar ocupación excesiva de ancho.
4. Ocultar o colapsar el badge redundante de SANDBOX QA en pantallas medianas donde ya existe el banner superior de ambiente.`
  },
  {
    summary: "💳 Precios/UX: Adaptación de Plan Gratuito para Clientes con Sesión y Separación de Toggles",
    description: `h2. Objetivo y Alcance
En la vista de Precios (/precios), un usuario con sesión iniciada ya posee la cuenta Explorador gratuita, por lo que no debe mostrarse el CTA 'Empezar Gratis'. Asimismo, los controles de Moneda y Facturación Anual/Mensual están colisionando visualmente sin margen.

h3. Requerimientos Técnicos
1. Si el usuario está autenticado como Cliente sin suscripción VIP, la tarjeta 'Explorador' debe reflejar 'Tu Plan Actual' y el botón debe indicar 'Plan Activo' deshabilitado o enlace a su dashboard.
2. Separar verticalmente el indicador de Moneda Activa y el selector de Facturación Mensual/Anual con espaciado adecuado (flex-col con gap).
3. Proporcionar llamadas a la acción claras hacia el plan Coleccionista VIP o Estudio Profesional.`
  },
  {
    summary: "🔄 Roles/Multi-Perfil: Arquitectura de Switch Tatuador ↔ Cliente y Doble Facturación Diferenciada",
    description: `h2. Objetivo y Alcance
Un artista del tatuaje puede desear utilizar Tattoo Hub como coleccionista/cliente para buscar otros artistas, agendar citas y tener una suscripción de cliente independiente de su suscripción de estudio.

h3. Requerimientos Técnicos
1. Diseñar el flujo de Switch de Contexto de Rol (Tatuador ↔ Cliente) en la interfaz para permitir alternar la experiencia sin cerrar sesión.
2. Registrar el diseño de base de datos en Supabase para soportar múltiples perfiles o roles asignados a un mismo UUID de autenticación.
3. Especificar la arquitectura de doble facturación (Stripe/PayPal Customer IDs separados para membresía de Estudio Pro vs membresía Coleccionista VIP).`
  },
  {
    summary: "🖥️ Auditoría Visual & Backlog: Detección y Registro de Elementos Apretados en Todas las Vistas",
    description: `h2. Objetivo y Alcance
Inspeccionar mediante navegador automatizado todas las páginas del portal (/beneficios, /precios, /artistas, /tienda, /about, /hub, /login, /client-dashboard) para identificar elementos comprimidos o con espaciados deficientes, documentándolos con capturas en el backlog.

h3. Requerimientos Técnicos
1. Ejecutar recorrido con subagente de navegación en los endpoints principales.
2. Capturar evidencias de áreas con padding/margin reducido y registrar los hallazgos en el backlog de diseño.
3. Corregir inmediatamente los espaciados críticos y verificar fluidez visual en modo claro y oscuro.`
  }
];

async function sendDiscordNotification(key, summary, color, stateName, titlePrefix) {
  const payload = {
    embeds: [
      {
        title: `${titlePrefix} ${key}: ${summary}`,
        description: `Se ha registrado una nueva tarea en Jira para la optimización de UX, Modo Claro y Multi-Perfil.\n\n**Estado:** ${stateName}\n**Proyecto:** Tattoo Hub (TH)`,
        color: color,
        url: `${config.host}/browse/${key}`,
        fields: [
          { name: "Ticket", value: `[${key}](${config.host}/browse/${key})`, inline: true },
          { name: "Sprint", value: "Sprint 11 - UX, Light Mode & Roles", inline: true }
        ],
        footer: { text: "Antigravity Engineering Orchestrator • Backlog Hub" },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    await fetch(DISCORD_JIRA_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Error enviando notificación a Discord:", err.message);
  }
}

async function run() {
  console.log(`[Jira] Creando ${tickets.length} tickets en Jira y notificando a Discord...`);
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

    await sendDiscordNotification(key, t.summary, 0x3B82F6, "Tareas por hacer (Backlog)", "🟦 [NUEVO TICKET]");
  }
}

run().catch(console.error);
