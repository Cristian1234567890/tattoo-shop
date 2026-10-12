const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, '../config/firebase-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(`${password}${salt}`).digest('hex');
}

function generateApiKey(prefix = 'th_live') {
  return `${prefix}_${crypto.randomBytes(24).toString('hex')}`;
}

async function seedUsers() {
  console.log("🚀 Creando y actualizando usuarios con roles y API Keys en Firestore...");

  // 1. Usuario Product Owner (Admin)
  const saltGiovanni = crypto.randomBytes(16).toString('hex');
  const giovanniApiKey = generateApiKey('th_admin_gio');
  await db.collection('admin_users').doc('giovanni').set({
    username: 'giovanni',
    displayName: 'Giovanni (Product Owner)',
    role: 'Admin',
    email: 'giovanni@tattoohub.com',
    passwordHash: hashPassword('Tattoo2026!PO', saltGiovanni),
    salt: saltGiovanni,
    apiKey: giovanniApiKey,
    permissions: ['all', 'manage_users', 'manage_discord', 'create_jira', 'view_telemetry', 'manage_keys'],
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true
  });
  console.log(`✅ Usuario 'giovanni' creado como Admin. API Key: ${giovanniApiKey}`);

  // 2. Usuario Agente Autónomo (Agent)
  const saltAgent = crypto.randomBytes(16).toString('hex');
  const agentApiKey = generateApiKey('th_agent_auto');
  await db.collection('admin_users').doc('antigravity_agent').set({
    username: 'antigravity_agent',
    displayName: 'Antigravity Autonomous Agent',
    role: 'Agent',
    email: 'agent@antigravity.ai',
    passwordHash: hashPassword('AgentSec2026!Key', saltAgent),
    salt: saltAgent,
    apiKey: agentApiKey,
    permissions: ['create_jira', 'update_jira', 'post_discord', 'read_telemetry', 'report_sentry'],
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true
  });
  console.log(`✅ Usuario 'antigravity_agent' creado como Agent. API Key: ${agentApiKey}`);

  // 3. Actualizar usuario 'admin' existente con API Key y rol Admin
  const adminDoc = await db.collection('admin_users').doc('admin').get();
  const saltAdmin = adminDoc.exists && adminDoc.data().salt ? adminDoc.data().salt : crypto.randomBytes(16).toString('hex');
  const adminApiKey = generateApiKey('th_admin_root');
  
  await db.collection('admin_users').doc('admin').set({
    username: 'admin',
    displayName: 'Administrador Maestro',
    role: 'Admin',
    email: 'admin@tattoohub.com',
    passwordHash: adminDoc.exists && adminDoc.data().passwordHash ? adminDoc.data().passwordHash : hashPassword('admin123!', saltAdmin),
    salt: saltAdmin,
    apiKey: adminApiKey,
    permissions: ['all', 'manage_users', 'manage_discord', 'create_jira', 'view_telemetry', 'manage_keys'],
    twoFactorEnabled: adminDoc.exists ? !!adminDoc.data().twoFactorEnabled : false,
    twoFactorSecret: adminDoc.exists ? adminDoc.data().twoFactorSecret : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true
  }, { merge: true });
  console.log(`✅ Usuario 'admin' actualizado con API Key: ${adminApiKey}`);

  console.log("\n🎉 Usuarios, Roles y API Keys creados exitosamente en Firebase Firestore!");
}

seedUsers().catch(err => {
  console.error("❌ Error poblando usuarios:", err);
  process.exit(1);
});
