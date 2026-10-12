import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let db = null;

export function getDb() {
  if (db) return db;

  if (getApps().length === 0) {
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      try {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
      } catch (err) {
        console.error("Error decoding FIREBASE_SERVICE_ACCOUNT_BASE64:", err);
      }
    }

    if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      } catch (err) {
        console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:", err);
      }
    }

    if (!serviceAccount && process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID || 'tattoo-hub-bot',
        client_email: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@tattoo-hub-bot.iam.gserviceaccount.com',
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      };
    }

    // Fallback local si existe archivo
    if (!serviceAccount) {
      try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const localPath = path.resolve(__dirname, '../../../.agents/config/firebase-service-account.json');
        if (fs.existsSync(localPath)) {
          serviceAccount = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        }
      } catch {}
    }

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log("[Firebase Admin] Inicializado exitosamente con Service Account.");
    } else {
      console.warn("⚠️ Firebase credentials not found in env, initializing default");
      initializeApp();
    }
  }

  db = getFirestore();
  return db;
}
