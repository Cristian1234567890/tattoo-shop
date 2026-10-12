import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.resolve(__dirname, '../config/firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error("Service account file not found at:", serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testConnection() {
  console.log("Probando conexión con Firebase Firestore (tattoo-hub-bot)...");
  const testRef = db.collection('bot_system_health').doc('connectivity_test');
  await testRef.set({
    status: 'ONLINE',
    connectedAt: new Date().toISOString(),
    service: 'Antigravity Discord & Sentry Orchestrator',
    environment: 'Staging / Cloud'
  });

  const doc = await testRef.get();
  console.log("Documento leído exitosamente de Firestore:", doc.data());
  console.log("✅ Conexión con Firebase Firestore verificada al 100%!");
}

testConnection().catch(err => {
  console.error("❌ Error conectando a Firebase Firestore:", err);
  process.exit(1);
});
