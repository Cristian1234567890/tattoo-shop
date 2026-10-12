import crypto from 'crypto';
import { getDb } from './_lib/firebase.js';
import { requireAdmin } from './_lib/security.js';

const ALLOWED_ROLES = ['Admin', 'Agent', 'Operator', 'Viewer'];

export default async function handler(req, res) {
  // Solo los usuarios con rol Admin pueden gestionar usuarios y roles
  const caller = await requireAdmin(req, res);
  if (!caller) return;

  const db = getDb();

  // ==========================================
  // GET: Listar todos los usuarios y subusuarios
  // ==========================================
  if (req.method === 'GET') {
    try {
      const snap = await db.collection('admin_users').get();
      const users = [];

      snap.forEach(doc => {
        const data = doc.data();
        users.push({
          username: data.username || doc.id,
          name: data.name || data.username || doc.id,
          role: data.role || 'Viewer',
          apiKey: data.apiKey || null,
          active: data.active !== false,
          twoFactorEnabled: !!data.twoFactorEnabled,
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null
        });
      });

      return res.status(200).json({ success: true, users });
    } catch (err) {
      console.error("[Users GET Error]", err);
      return res.status(500).json({ error: 'Error al obtener usuarios', details: err.message });
    }
  }

  // ==========================================
  // POST: Crear nuevo subusuario con rol y API Key
  // ==========================================
  if (req.method === 'POST') {
    const { username, name, password, role = 'Viewer' } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Nombre de usuario y contraseña requeridos' });
    }

    const cleanUser = username.trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,30}$/.test(cleanUser)) {
      return res.status(400).json({ 
        error: 'El nombre de usuario debe tener entre 3 y 30 caracteres alfanuméricos (letras, números, _, -, .)' 
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ 
        error: `Rol no válido. Roles permitidos: ${ALLOWED_ROLES.join(', ')}` 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    try {
      const userRef = db.collection('admin_users').doc(cleanUser);
      const doc = await userRef.get();

      if (doc.exists) {
        return res.status(409).json({ error: `El usuario '${cleanUser}' ya existe` });
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = crypto.createHash('sha256').update(`${password}${salt}`).digest('hex');
      const apiKey = `th_${role.toLowerCase()}_${crypto.randomBytes(24).toString('hex')}`;

      const newUserDoc = {
        username: cleanUser,
        name: name ? name.trim() : cleanUser,
        role: role,
        apiKey: apiKey,
        passwordHash: passwordHash,
        salt: salt,
        active: true,
        twoFactorEnabled: false,
        createdBy: caller.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await userRef.set(newUserDoc);

      return res.status(201).json({
        success: true,
        message: `Usuario '${cleanUser}' creado exitosamente con rol ${role}`,
        user: {
          username: cleanUser,
          name: newUserDoc.name,
          role: role,
          apiKey: apiKey,
          active: true,
          twoFactorEnabled: false
        }
      });
    } catch (err) {
      console.error("[Users POST Error]", err);
      return res.status(500).json({ error: 'Error al registrar nuevo usuario', details: err.message });
    }
  }

  // ==========================================
  // PUT: Modificar usuario existente o regenerar API Key
  // ==========================================
  if (req.method === 'PUT') {
    const { username, name, role, active, resetPassword, regenerateApiKey } = req.body || {};

    if (!username) {
      return res.status(400).json({ error: 'Nombre de usuario requerido' });
    }

    const cleanUser = username.trim().toLowerCase();

    try {
      const userRef = db.collection('admin_users').doc(cleanUser);
      const doc = await userRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: `Usuario '${cleanUser}' no encontrado` });
      }

      const updates = {
        updatedAt: new Date().toISOString(),
        updatedBy: caller.username
      };

      if (name !== undefined) updates.name = name.trim();
      if (role && ALLOWED_ROLES.includes(role)) updates.role = role;
      if (typeof active === 'boolean') updates.active = active;

      if (regenerateApiKey) {
        const currentRole = role || doc.data().role || 'viewer';
        updates.apiKey = `th_${currentRole.toLowerCase()}_${crypto.randomBytes(24).toString('hex')}`;
      }

      if (resetPassword) {
        if (resetPassword.length < 6) {
          return res.status(400).json({ error: 'La nueva contraseña debe tener mínimo 6 caracteres' });
        }
        const newSalt = crypto.randomBytes(16).toString('hex');
        updates.passwordHash = crypto.createHash('sha256').update(`${resetPassword}${newSalt}`).digest('hex');
        updates.salt = newSalt;
      }

      await userRef.update(updates);

      return res.status(200).json({
        success: true,
        message: `Usuario '${cleanUser}' actualizado exitosamente`,
        apiKey: updates.apiKey || doc.data().apiKey
      });
    } catch (err) {
      console.error("[Users PUT Error]", err);
      return res.status(500).json({ error: 'Error al actualizar usuario', details: err.message });
    }
  }

  // ==========================================
  // DELETE: Eliminar un subusuario
  // ==========================================
  if (req.method === 'DELETE') {
    const targetUser = (req.query?.username || req.body?.username || '').trim().toLowerCase();

    if (!targetUser) {
      return res.status(400).json({ error: 'Nombre de usuario a eliminar requerido' });
    }

    if (targetUser === caller.username.toLowerCase()) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta de Administrador' });
    }

    try {
      const userRef = db.collection('admin_users').doc(targetUser);
      const doc = await userRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: `Usuario '${targetUser}' no encontrado` });
      }

      await userRef.delete();

      return res.status(200).json({
        success: true,
        message: `Usuario '${targetUser}' eliminado exitosamente`
      });
    } catch (err) {
      console.error("[Users DELETE Error]", err);
      return res.status(500).json({ error: 'Error al eliminar usuario', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
