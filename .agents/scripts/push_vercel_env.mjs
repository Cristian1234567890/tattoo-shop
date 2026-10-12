import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.resolve(__dirname, '../config/firebase-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
const base64ServiceAccount = Buffer.from(JSON.stringify(serviceAccount)).toString('base64');

const botConfigPath = path.resolve(__dirname, '../config/bot.json');
const botConfig = JSON.parse(fs.readFileSync(botConfigPath, 'utf8'));

const envVars = [
  { name: 'DISCORD_CLIENT_ID', value: botConfig.CLIENT_ID },
  { name: 'DISCORD_BOT_TOKEN', value: botConfig.DISCORD_BOT_TOKEN },
  { name: 'FIREBASE_PROJECT_ID', value: serviceAccount.project_id },
  { name: 'FIREBASE_CLIENT_EMAIL', value: serviceAccount.client_email },
  { name: 'FIREBASE_SERVICE_ACCOUNT_BASE64', value: base64ServiceAccount },
  { name: 'ADMIN_USER', value: 'admin' },
  { name: 'ADMIN_PASSWORD', value: 'admin123!' },
  { name: 'DISCORD_ERROR_WEBHOOK', value: 'https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf' }
];

const botCloudDir = path.resolve(__dirname, '../../bot-cloud');

for (const env of envVars) {
  try {
    console.log(`[Vercel Env] Agregando ${env.name}...`);
    // Usamos Write-Output para pipar a vercel env add en production y preview
    const cmd = `Write-Output "${env.value}" | vercel env add ${env.name} production`;
    execSync(cmd, { cwd: botCloudDir, shell: 'powershell.exe', stdio: 'inherit' });
    console.log(`✓ ${env.name} agregado`);
  } catch (err) {
    console.warn(`Aviso agregando ${env.name}:`, err.message);
  }
}

console.log("\n🎉 Todas las variables de entorno de producción han sido configuradas en Vercel!");
