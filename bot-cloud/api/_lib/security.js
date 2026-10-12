import jwt from 'jsonwebtoken';
import { getDb } from './firebase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tattoohub_super_secure_jwt_secret_2026';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Autentica una petición HTTP.
 * Soporta:
 *  - Modo estricto para agentes: X-API-Key + Bearer Token + X-Username requeridos al mismo tiempo.
 *  - Modo estándar: Bearer Token, API Key o Cookie de sesión.
 */
export async function authenticateRequest(req, { strict = false } = {}) {
  const authHeader = req.headers['authorization'];
  const apiKeyHeader = req.headers['x-api-key'];
  const userHeader = req.headers['x-username'] || req.headers['x-user-id'];
  const cookieHeader = req.headers['cookie'];
  const tokenQuery = req.query?.token;

  const db = getDb();

  // Extraer token Bearer si existe
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (cookieHeader) {
    const match = cookieHeader.match(/session_token=([^;]+)/);
    if (match) token = match[1];
  } else if (tokenQuery) {
    token = tokenQuery;
  }

  // 1. Modo Estricto (Requerido para llamadas de Agentes Externos Seguros)
  if (strict) {
    if (!apiKeyHeader || !token || !userHeader) {
      return { 
        error: 'Autenticación Estricta requerida: Se deben proveer los headers X-API-Key, Authorization: Bearer <token>, y X-Username', 
        status: 401 
      };
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.username) {
      return { error: 'Bearer Token JWT inválido o expirado', status: 401 };
    }

    const userDoc = await db.collection('admin_users').doc(decoded.username).get();
    if (!userDoc.exists || !userDoc.data().active) {
      return { error: 'Usuario asociado al token inactivo o inexistente', status: 401 };
    }

    const userData = userDoc.data();

    // Validar coincidencia de API Key
    if (userData.apiKey !== apiKeyHeader.trim()) {
      return { error: 'El header X-API-Key no coincide con las credenciales del usuario', status: 403 };
    }

    // Validar coincidencia de X-Username
    if (userData.username.toLowerCase() !== userHeader.trim().toLowerCase()) {
      return { error: 'El header X-Username no coincide con el usuario autenticado', status: 403 };
    }

    return { user: userData, authMethod: 'STRICT_MULTI_FACTOR' };
  }

  // 2. Si se suministran API Key y Bearer juntos (modo híbrido)
  if (apiKeyHeader && token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.username) {
      const userDoc = await db.collection('admin_users').doc(decoded.username).get();
      if (userDoc.exists && userDoc.data().active) {
        const userData = userDoc.data();
        if (userData.apiKey === apiKeyHeader.trim()) {
          if (userHeader && userHeader.trim().toLowerCase() !== userData.username.toLowerCase()) {
            return { error: 'Header X-Username no coincide con el usuario', status: 403 };
          }
          return { user: userData, authMethod: 'API_KEY_AND_BEARER' };
        }
      }
    }
  }

  // 3. Autenticación solo por API Key
  if (apiKeyHeader) {
    const snap = await db.collection('admin_users')
      .where('apiKey', '==', apiKeyHeader.trim())
      .where('active', '==', true)
      .limit(1)
      .get();

    if (!snap.empty) {
      const userData = snap.docs[0].data();
      if (userHeader && userHeader.trim().toLowerCase() !== userData.username.toLowerCase()) {
        return { error: 'Header X-Username no coincide con la API Key provista', status: 403 };
      }
      return { user: userData, authMethod: 'API_KEY' };
    }
    return { error: 'API Key inválida o revocada', status: 401 };
  }

  // 4. Autenticación por Bearer Token (JWT)
  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.username) {
      const userDoc = await db.collection('admin_users').doc(decoded.username).get();
      if (userDoc.exists && userDoc.data().active) {
        const userData = userDoc.data();
        if (userHeader && userHeader.trim().toLowerCase() !== userData.username.toLowerCase()) {
          return { error: 'Header X-Username no coincide con el token de sesión', status: 403 };
        }
        return { user: userData, authMethod: 'JWT_BEARER' };
      }
    }

    // Compatibilidad retroactiva con tokens simples de sesión inicial
    if (token.startsWith('session_token_')) {
      const snap = await db.collection('admin_users').where('active', '==', true).limit(1).get();
      if (!snap.empty) {
        return { user: snap.docs[0].data(), authMethod: 'LEGACY_SESSION' };
      }
    }

    return { error: 'Token de autorización expirado o inválido', status: 401 };
  }

  return { error: 'Se requiere autenticación mediante Bearer Token o X-API-Key', status: 401 };
}

export async function requireAdmin(req, res) {
  const auth = await authenticateRequest(req);
  if (auth.error) {
    res.status(auth.status || 401).json({ error: auth.error });
    return null;
  }

  if (auth.user.role !== 'Admin') {
    res.status(403).json({ 
      error: 'Acceso denegado: Se requiere rol Admin para realizar esta acción',
      currentRole: auth.user.role 
    });
    return null;
  }

  return auth.user;
}

export async function requireAuth(req, res, options = {}) {
  const auth = await authenticateRequest(req, options);
  if (auth.error) {
    res.status(auth.status || 401).json({ error: auth.error });
    return null;
  }
  return auth.user;
}
