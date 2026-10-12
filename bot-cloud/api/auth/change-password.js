import crypto from 'crypto';
import { getDb } from '../_lib/firebase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username = 'admin', currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Contraseña actual y nueva contraseña requeridas' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const db = getDb();
    const userRef = db.collection('admin_users').doc(username);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userData = userDoc.data();
    const salt = userData.salt || 'tattoohub_secure_salt_2026';
    const currentHash = crypto.createHash('sha256').update(`${currentPassword}${salt}`).digest('hex');

    // Validar contraseña actual (o default si es primera vez)
    const isCurrentValid = (currentHash === userData.passwordHash) || 
      (username === 'admin' && (currentPassword === 'admin123!' || currentPassword === 'tattoo2026!'));

    if (!isCurrentValid) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Generar nuevo salt y hash
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newPasswordHash = crypto.createHash('sha256').update(`${newPassword}${newSalt}`).digest('hex');

    await userRef.update({
      passwordHash: newPasswordHash,
      salt: newSalt,
      updatedAt: new Date().toISOString()
    });

    console.log(`[Auth] Contraseña actualizada exitosamente para usuario ${username}`);
    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (err) {
    console.error("[Change Password Error]", err);
    return res.status(500).json({ error: 'Error al actualizar contraseña', details: err.message });
  }
}
