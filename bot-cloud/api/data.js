import { getDb } from './_lib/firebase.js';
import { requireAuth } from './_lib/security.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Requiere autenticación
  const caller = await requireAuth(req, res);
  if (!caller) return;

  try {
    const db = getDb();

    // 1. Obtener incidentes de Sentry
    const sentrySnap = await db.collection('sentry_incidents').orderBy('timestamp', 'desc').limit(20).get();
    const sentryIncidents = [];
    sentrySnap.forEach(doc => sentryIncidents.push({ id: doc.id, ...doc.data() }));

    // 2. Obtener historial de comandos de Discord
    const cmdSnap = await db.collection('bot_commands').orderBy('executedAt', 'desc').limit(20).get();
    const botCommands = [];
    cmdSnap.forEach(doc => botCommands.push({ id: doc.id, ...doc.data() }));

    // 3. Obtener cola de tareas
    const taskSnap = await db.collection('task_queue').orderBy('createdAt', 'desc').limit(20).get();
    const tasks = [];
    taskSnap.forEach(doc => tasks.push({ id: doc.id, ...doc.data() }));

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      incidents: sentryIncidents,
      commands: botCommands,
      tasks: tasks
    });
  } catch (err) {
    console.error("[Data Error]", err);
    return res.status(500).json({ error: 'Error fetching Firestore data', details: err.message });
  }
}
