import crypto from 'crypto';
import { getDb } from './_lib/firebase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  // 1. Verificación contra variables de entorno
  const envUser = process.env.ADMIN_USER || 'admin';
  const envPass = process.env.ADMIN_PASSWORD;

  if (envPass && username === envUser && password === envPass) {
    return res.status(200).json({
      success: true,
      token: 'session_token_' + Date.now(),
      user: { username: envUser, role: 'Owner' }
    });
  }

  // 2. Verificación contra Firestore
  try {
    const db = getDb();
    const userDoc = await db.collection('admin_users').doc(username).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      const salt = userData.salt || 'tattoohub_secure_salt_2026';
      const hash = crypto.createHash('sha256').update(`${password}${salt}`).digest('hex');

      if (hash === userData.passwordHash) {
        return res.status(200).json({
          success: true,
          token: 'session_token_' + Date.now(),
          user: { username: userData.username, role: userData.role }
        });
      }
    }
  } catch (err) {
    console.error("[Auth Error]", err);
  }

  // 3. Fallback de emergencia inicial
  if (username === 'admin' && (password === 'admin123!' || password === 'tattoo2026!')) {
    return res.status(200).json({
      success: true,
      token: 'session_token_' + Date.now(),
      user: { username: 'admin', role: 'Default Owner' }
    });
  }

  return res.status(401).json({ error: 'Credenciales inválidas' });
}
