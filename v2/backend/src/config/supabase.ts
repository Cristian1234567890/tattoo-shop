import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

export const isQaEnvironment = (): boolean => {
  return (
    process.env.NODE_ENV === 'staging' ||
    process.env.NODE_ENV === 'qa' ||
    process.env.APP_ENV === 'staging' ||
    process.env.APP_ENV === 'qa'
  );
};

export const activeSchema = isQaEnvironment() ? 'qa' : 'public';

// Anon client for public & user auth operations
export const supabaseAnon: SupabaseClient<any, any, any> = createClient(
  env.SUPABASE_URL,
  env.ANON_KEY,
  {
    db: {
      schema: activeSchema,
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

// Service role client with administrative privileges
export const supabaseAdmin: SupabaseClient<any, any, any> = createClient(
  env.SUPABASE_URL,
  env.SERVICE_ROLE_KEY,
  {
    db: {
      schema: activeSchema,
    },
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
export function createScopedClient(token?: string, schema: string = activeSchema): SupabaseClient<any, any, any> {
  return createClient(env.SUPABASE_URL, env.ANON_KEY, {
    db: {
      schema,
    },
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
