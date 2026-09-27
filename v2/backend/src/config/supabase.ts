import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// Anon client for public & user auth operations
export const supabaseAnon: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

// Service role client with administrative privileges
export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${env.SERVICE_ROLE_KEY}`,
        apikey: env.SERVICE_ROLE_KEY,
      },
    },
  }
);

// Scoped client factory for per-request user context
export function createScopedClient(token?: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
  });
}
