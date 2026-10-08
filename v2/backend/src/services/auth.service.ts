import { supabaseAnon, supabaseAdmin, createScopedClient } from '../config/supabase';
import { env } from '../config/env';
import { ApiResponse } from '../types/api.types';
import { SignInDTO, SignUpDTO, Verify2FADTO } from '../types/auth.types';

const defaultProfileUrl =
  'https://mftthukphffirdcoqprz.supabase.co/storage/v1/object/public/user_profile/tatto-default-profile.png';

// In-memory blacklist for immediately invalidated tokens upon logout
const revokedTokens = new Set<string>();

interface CachedSession {
  response: ApiResponse;
  timestamp: number;
}

const recentSessionCache = new Map<string, CachedSession>();
const inFlightLogins = new Map<string, Promise<ApiResponse>>();

function parseAuthHash(hashStr: string, user: any): any {
  try {
    const hash = hashStr.startsWith('#') ? hashStr.substring(1) : hashStr;
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (!accessToken || !refreshToken) return null;

    const expiresIn = params.get('expires_in') ? parseInt(params.get('expires_in')!, 10) : 3600;
    const expiresAt = params.get('expires_at')
      ? parseInt(params.get('expires_at')!, 10)
      : Math.floor(Date.now() / 1000) + expiresIn;

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      expires_at: expiresAt,
      token_type: params.get('token_type') || 'bearer',
      user,
    };
  } catch {
    return null;
  }
}

export function revokeToken(token?: string): void {
  if (token && typeof token === 'string') {
    revokedTokens.add(token.trim());
    recentSessionCache.clear();
  }
}

export function isTokenRevoked(token?: string): boolean {
  if (!token || typeof token !== 'string') return false;
  return revokedTokens.has(token.trim());
}

export class AuthService {
  async signIn(dto: SignInDTO): Promise<ApiResponse> {
    const rawEmail = typeof dto?.email === 'string' ? dto.email.trim() : '';
    const email = rawEmail.toLowerCase();
    const password = typeof dto?.password === 'string' ? dto.password : '';

    if (!email || !password) {
      return {
        success: false,
        error: { message: 'Email and password are required', status: 400 },
      };
    }

    const cacheKey = `${email}:::${password}`;

    // 1. Check recent session cache (valid for 10 seconds) to handle rapid duplicate logins
    const cached = recentSessionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 10000) {
      return JSON.parse(JSON.stringify(cached.response));
    }

    // 2. Coalesce concurrent in-flight requests for the same credentials
    const existingFlight = inFlightLogins.get(cacheKey);
    if (existingFlight) {
      const result = await existingFlight;
      return JSON.parse(JSON.stringify(result));
    }

    // 3. Perform login with single flight
    const loginPromise = (async () => {
      let data: any = null;
      let error: any = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        const client = createScopedClient();
        const res = await client.auth.signInWithPassword({
          email,
          password,
        });
        data = res.data;
        error = res.error;

        if (!error) break;

        const isRateLimit =
          error.status === 429 ||
          (error as any).code === 'over_request_rate_limit' ||
          (error as any).code === 'over_email_send_rate_limit' ||
          error.message?.toLowerCase().includes('rate') ||
          error.message?.toLowerCase().includes('too many');

        if (isRateLimit && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
          continue;
        }
        break;
      }

      if (error) {
        return { success: false, error };
      }

      const successRes: ApiResponse = {
        success: true,
        data,
        user: data?.user,
        session: data?.session,
      };

      recentSessionCache.set(cacheKey, {
        response: successRes,
        timestamp: Date.now(),
      });

      return successRes;
    })();

    inFlightLogins.set(cacheKey, loginPromise);
    try {
      return await loginPromise;
    } finally {
      inFlightLogins.delete(cacheKey);
    }
  }

  async signUp(dto: SignUpDTO): Promise<ApiResponse> {
    if (!dto || typeof dto !== 'object') {
      return {
        success: false,
        error: { message: 'Invalid registration payload' },
      };
    }

    const rawEmail = typeof dto.email === 'string' ? dto.email.trim() : '';
    const email = rawEmail.toLowerCase();
    const password = typeof dto.password === 'string' ? dto.password : '';
    const nombre = typeof dto.nombre === 'string' ? dto.nombre.trim() : '';
    const apellido = typeof dto.apellido === 'string' ? dto.apellido.trim() : '';
    const edad = dto.edad !== undefined ? String(dto.edad) : '';
    const tipo = typeof dto.tipo === 'string' ? dto.tipo.trim() : 'Cliente';
    const telefono = typeof dto.telefono === 'string' ? dto.telefono.trim() : '';
    const provincia = typeof dto.provincia === 'string' ? dto.provincia.trim() : '';
    const ciudad = typeof dto.ciudad === 'string' ? dto.ciudad.trim() : '';
    const direccion = typeof dto.direccion === 'string' ? dto.direccion.trim() : '';

    if (!email || !password || email.length === 0 || password.length === 0) {
      return {
        success: false,
        error: { message: 'Email and password are required' },
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: { message: 'Password should be at least 6 characters' },
      };
    }

    // Rejection if client explicitly rejects or provides falsy legal acceptance
    if (
      dto.legal_accepted === false ||
      String(dto.legal_accepted).toLowerCase() === 'false' ||
      (dto.legal_accepted as any) === null ||
      (dto.legal_accepted as any) === 0 ||
      String(dto.legal_accepted) === '0'
    ) {
      return {
        success: false,
        error: {
          message: 'Debes aceptar los Términos y Condiciones y la Política de Privacidad para registrarte',
          status: 400,
        },
      };
    }

    const legal_accepted = dto.legal_accepted === true || String(dto.legal_accepted) === 'true';
    const legal_accepted_at = legal_accepted
      ? (dto.legal_accepted_at || new Date().toISOString())
      : null;
    const onboarding_completed = legal_accepted;

    const targetSchema = (dto as any).environment === 'qa' || env.NODE_ENV === 'staging' ? 'qa' : 'public';
    const isQa = targetSchema === 'qa';

    const userMetadata = {
      nombre,
      apellido,
      edad,
      tipo,
      telefono,
      provincia,
      ciudad,
      direccion,
      profile: defaultProfileUrl,
      legal_accepted,
      legal_accepted_at,
      onboarding_completed,
      environment: targetSchema,
      is_qa_sandbox: isQa,
    };

    // Use admin.createUser with email_confirm: true to avoid public email rate-limiting
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: userMetadata,
    });

    if (createError) {
      if (
        createError.code === 'email_exists' ||
        createError.message?.toLowerCase().includes('already')
      ) {
        return {
          success: false,
          error: {
            ...createError,
            message: 'User already registered',
          },
        };
      }
      return { success: false, error: createError };
    }

    const user = createData.user;

    // Persist into user_profiles in target schema (qa vs public)
    if (user) {
      const profileData = {
        id: user.id,
        role: tipo,
        legal_accepted,
        legal_accepted_at,
        full_name: `${nombre} ${apellido}`.trim() || email.split('@')[0],
        avatar_url: defaultProfileUrl,
        phone_number: telefono || null,
        is_verified: false,
        onboarding_completed,
      };

      try {
        await supabaseAdmin.schema(targetSchema).from('user_profiles').upsert(profileData);
      } catch (errProfile: any) {
        console.warn('Note: user_profiles upsert in signUp:', errProfile?.message || errProfile);
      }
    }

    // Auto-create artist profile if role is Tatuador in target schema
    if (tipo === 'Tatuador' && user) {
      const data_to_insert = {
        email,
        nombre,
        apellido,
        work_type: '',
        telefono,
        provincia,
        ciudad,
        direccion,
        facebook: '',
        twitter: '',
        instagram: '',
        link: '',
        profile: defaultProfileUrl,
      };

      const { error: error_insert } = await supabaseAdmin
        .schema(targetSchema)
        .from('tatuadores_data')
        .upsert({ id: user.id, data: data_to_insert });

      if (error_insert) {
        return { success: false, error_insert };
      }
    }

    // Generate real access_token and refresh_token using authenticated admin link resolution
    let session: any = null;
    try {
      const linkRes = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });
      const actionLink = linkRes.data?.properties?.action_link;
      if (actionLink) {
        const linkFetch = await fetch(actionLink, {
          method: 'GET',
          redirect: 'manual',
          headers: {
            apikey: env.SERVICE_ROLE_KEY,
            Authorization: `Bearer ${env.SERVICE_ROLE_KEY}`,
          },
        });
        const loc = linkFetch.headers.get('location') || '';
        const hashIdx = loc.indexOf('#');
        if (hashIdx !== -1) {
          session = parseAuthHash(loc.substring(hashIdx), user);
        }
      }
    } catch {
      // Gracefully continue to fallback
    }

    // Fallback: If actionLink resolution did not produce a session, attempt direct password sign in
    if (!session) {
      try {
        const loginClient = createScopedClient();
        const loginRes = await loginClient.auth.signInWithPassword({ email, password });
        session = loginRes.data?.session ?? null;
      } catch (err: any) {
        // Fallback error ignored
      }
    }

    if (session) {
      const cacheKey = `${email}:::${password}`;
      const successRes: ApiResponse = {
        success: true,
        data: { user, session },
        user,
        session,
      };
      recentSessionCache.set(cacheKey, {
        response: successRes,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      data: {
        user,
        session,
      },
      user,
      session,
    };
  }

  async signOut(token?: string, refresh?: string): Promise<ApiResponse> {
    try {
      if (token) {
        revokeToken(token);
        const client = createScopedClient(token);
        if (refresh) {
          await client.auth
            .setSession({ access_token: token, refresh_token: refresh })
            .catch(() => {});
        }
        await client.auth.signOut().catch(() => {});
        await supabaseAdmin.auth.admin.signOut(token, 'global').catch(() => {});
      }
    } catch {
      // Gracefully handle signout
    }
    return { success: true };
  }

  async enroll2FA(token: string, refresh?: string): Promise<ApiResponse> {
    const client = createScopedClient(token);
    if (refresh) {
      await client.auth
        .setSession({ access_token: token, refresh_token: refresh })
        .catch(() => {});
    }

    const { data, error } = await client.auth.mfa.enroll({
      factorType: 'totp',
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  }

  async verify2FA(
    dto: Verify2FADTO,
    token: string,
    refresh?: string
  ): Promise<ApiResponse> {
    const { factorId, code } = dto || {};

    if (!factorId || typeof factorId !== 'string') {
      return {
        success: false,
        error: { message: 'Missing or invalid factorId' },
      };
    }

    if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code.trim())) {
      return {
        success: false,
        error: { message: 'Code must be a 6-digit numeric string' },
      };
    }

    const client = createScopedClient(token);
    if (refresh) {
      await client.auth
        .setSession({ access_token: token, refresh_token: refresh })
        .catch(() => {});
    }

    const { data, error } = await client.auth.mfa.challengeAndVerify({
      factorId: factorId.trim(),
      code: code.trim(),
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  }
}

export const authService = new AuthService();
