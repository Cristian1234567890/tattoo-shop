import { getDb } from './_lib/firebase.js';
import { requireAuth } from './_lib/security.js';

export default async function handler(req, res) {
  // Autenticación obligatoria mediante Bearer JWT o X-API-Key (+ validación X-Username)
  const caller = await requireAuth(req, res);
  if (!caller) return;

  const db = getDb();

  // ==========================================
  // GET: Obtener tareas encoladas
  // ==========================================
  if (req.method === 'GET') {
    try {
      const snap = await db.collection('task_queue').orderBy('createdAt', 'desc').limit(50).get();
      const tasks = [];
      snap.forEach(doc => tasks.push({ id: doc.id, ...doc.data() }));

      return res.status(200).json({
        success: true,
        count: tasks.length,
        tasks: tasks
      });
    } catch (err) {
      console.error("[Tasks GET Error]", err);
      return res.status(500).json({ error: 'Error al consultar cola de tareas', details: err.message });
    }
  }

  // ==========================================
  // POST: Crear una nueva tarea para Jira / Agente
  // ==========================================
  if (req.method === 'POST') {
    if (caller.role === 'Viewer') {
      return res.status(403).json({ error: 'El rol Viewer tiene permisos de solo lectura y no puede crear tareas' });
    }

    const { title, description, priority = 'HIGH', type = 'TASK', jiraProject = 'TH' } = req.body || {};

    if (!title) {
      return res.status(400).json({ error: 'El título de la tarea es obligatorio' });
    }

    const taskId = `${jiraProject}-${Date.now().toString().slice(-4)}`;
    const taskDoc = {
      id: taskId,
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority.toUpperCase(),
      type: type.toUpperCase(),
      status: 'QUEUED',
      source: caller.role === 'Agent' ? `Agent (${caller.username})` : `Ops Panel (${caller.username})`,
      createdBy: caller.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await db.collection('task_queue').doc(taskId).set(taskDoc);

      // Si hay webhook configurado, notificar opcionalmente en Discord
      const discordWebhook = process.env.DISCORD_ERROR_WEBHOOK;
      if (discordWebhook) {
        try {
          await fetch(discordWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              embeds: [{
                title: `📋 NUEVA TAREA CREADA: [${taskId}] ${taskDoc.title}`,
                description: taskDoc.description || 'Sin descripción adicional.',
                color: priority === 'CRITICAL' ? 0xef4444 : 0x3b82f6,
                fields: [
                  { name: "Prioridad", value: taskDoc.priority, inline: true },
                  { name: "Creado Por", value: `@${caller.username} (${caller.role})`, inline: true },
                  { name: "Estado", value: "Encolado para Agente / Jira", inline: true }
                ],
                footer: { text: "Tattoo Hub Ops • Task Dispatcher" },
                timestamp: new Date().toISOString()
              }]
            })
          });
        } catch (discErr) {
          console.warn("[Task Discord Notify Warning]", discErr.message);
        }
      }

      return res.status(201).json({
        success: true,
        message: `Tarea ${taskId} encolada exitosamente para ejecución`,
        task: taskDoc
      });
    } catch (err) {
      console.error("[Tasks POST Error]", err);
      return res.status(500).json({ error: 'Error al registrar tarea en Firestore', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
