const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, '../config/firebase-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

async function initFirestore() {
  console.log("🚀 Inicializando colecciones en Firebase Firestore (tattoo-hub-bot)...");

  // 1. Colección: bot_system_health
  await db.collection('bot_system_health').doc('status').set({
    status: 'ONLINE',
    version: '3.0.0-serverless',
    platform: 'Vercel Serverless & Firebase Firestore',
    updatedAt: new Date().toISOString(),
    services: {
      discord: 'ACTIVE',
      sentry: 'ACTIVE',
      jira: 'CONNECTED',
      firebase: 'HEALTHY',
      supabase: 'ISOLATED_CORE'
    }
  });
  console.log("✅ bot_system_health inicializado.");

  // 2. Colección: admin_users (Usuario y contraseña para el panel web aislado)
  // Generamos un usuario administrador inicial
  const crypto = require('crypto');
  const salt = 'tattoohub_secure_salt_2026';
  const initialPasswordHash = crypto.createHash('sha256').update(`admin123!${salt}`).digest('hex');

  await db.collection('admin_users').doc('admin').set({
    username: 'admin',
    email: 'giovanni@tattoohub.com',
    role: 'Product Owner / Lead Engineer',
    passwordHash: initialPasswordHash,
    salt: salt,
    createdAt: new Date().toISOString(),
    active: true
  });
  console.log("✅ admin_users inicializado con usuario 'admin'.");

  // 3. Colección: sentry_incidents (Muestra inicial para telemetría)
  await db.collection('sentry_incidents').doc('init_probe').set({
    id: 'sentry_probe_01',
    event_id: 'probe-001',
    title: 'Sentry Telemetry Channel Verified',
    message: 'Canal de monitoreo de Sentry enlazado exitosamente con Firebase Firestore y Discord #errores.',
    level: 'info',
    platform: 'node / browser',
    environment: 'staging',
    timestamp: new Date().toISOString(),
    status: 'resolved',
    resolvedBy: 'Antigravity Orchestrator'
  });
  console.log("✅ sentry_incidents inicializado.");

  // 4. Colección: task_queue (Cola de tareas del PO)
  await db.collection('task_queue').doc('task_welcome').set({
    id: 'TASK-INIT-01',
    source: 'Discord / PO Inbox',
    title: 'Migración a Serverless Vercel & Firebase Firestore',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
    targetSystem: 'Vercel / Jira'
  });
  console.log("✅ task_queue inicializado.");

  // 5. Colección: bot_commands (Registro de actividad de comandos)
  await db.collection('bot_commands').doc('init_cmd').set({
    command: '/status',
    user: 'Product Owner',
    channel: 'discord-ops',
    executedAt: new Date().toISOString(),
    responseCode: 200,
    status: 'SUCCESS'
  });
  console.log("✅ bot_commands inicializado.");

  console.log("\n🎉 Todas las colecciones de Firestore han sido configuradas y pobladas exitosamente.");
}

initFirestore().catch(err => {
  console.error("❌ Error inicializando Firestore:", err);
  process.exit(1);
});
