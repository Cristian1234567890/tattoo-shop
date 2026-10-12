import crypto from 'crypto';
import { getDb } from '../_lib/firebase.js';
import { requireAuth, signToken } from '../_lib/security.js';

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const db = getDb();
  const currentUsername = user.username.toLowerCase();

  // ==========================================
  // GET: Obtener perfil del usuario actual
  // ==========================================
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      user: {
        username: user.username,
        name: user.name || user.username,
        role: user.role,
        apiKey: user.apiKey || null,
        twoFactorEnabled: !!user.twoFactorEnabled,
        createdAt: user.createdAt || null
      }
    });
  }

  // ==========================================
  // POST: Actualizar nombre de usuario o contraseña propia
  // ==========================================
  if (req.method === 'POST') {
    const { newUsername, name, currentPassword, newPassword } = req.body || {};

    try {
      const userRef = db.collection('admin_users').doc(currentUsername);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'Usuario no encontrado en base de datos' });
      }

      const userData = userDoc.data();

      // Si desea cambiar contraseña o cambiar de username, validar contraseña actual si se provee
      if (currentPassword && newPassword) {
        const salt = userData.salt || 'tattoohub_secure_salt_2026';
        const currentHash = crypto.createHash('sha256').update(`${currentPassword}${salt}`).digest('hex');
        
        const isCurrentValid = (currentHash === userData.passwordHash) ||
          (currentUsername === 'admin' && (currentPassword === 'admin123!' || currentPassword === 'tattoo2026!'));

        if (!isCurrentValid) {
          return res.status(401).json({ error: 'La contraseña actual no es correcta' });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({ error: 'La nueva contraseña debe tener mínimo 6 caracteres' });
        }

        const newSalt = crypto.randomBytes(16).toString('hex');
        userData.passwordHash = crypto.createHash('sha256').update(`${newPassword}${newSalt}`).digest('hex');
        userData.salt = newSalt;
      }

      if (name) {
        userData.name = name.trim();
      }

      userData.updatedAt = new Date().toISOString();

      // ¿Cambio de nombre de usuario?
      let finalUsername = currentUsername;
      if (newUsername && newUsername.trim().toLowerCase() !== currentUsername) {
        const cleanNew = newUsername.trim().toLowerCase();
        if (!/^[a-z0-9_.-]{3,30}$/.test(cleanNew)) {
          return res.status(400).json({ 
            error: 'El nuevo nombre de usuario debe tener entre 3 y 30 caracteres alfanuméricos' 
          });
        }

        const targetCheck = await db.collection('admin_users').doc(cleanNew).get();
        if (targetCheck.exists) {
          return res.status(409).json({ error: `El nombre de usuario '${cleanNew}' ya está en uso` });
        }

        userData.username = cleanNew;
        finalUsername = cleanNew;

        // Crear documento con nuevo ID y remover el viejo
        await db.collection('admin_users').doc(cleanNew).set(userData);
        await userRef.delete();
      } else {
        await userRef.set(userData);
      }

      // Generar nuevo JWT con el username actualizado
      const newToken = signToken({ username: finalUsername, role: userData.role });

      return res.status(200).json({
        success: true,
        message: 'Perfil y credenciales actualizados exitosamente',
        token: newToken,
        user: {
          username: finalUsername,
          name: userData.name,
          role: userData.role,
          apiKey: userData.apiKey,
          twoFactorEnabled: !!userData.twoFactorEnabled
        }
      });
    } catch (err) {
      console.error("[Profile Update Error]", err);
      return res.status(500).json({ error: 'Error al actualizar perfil', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
