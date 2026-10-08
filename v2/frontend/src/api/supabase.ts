import { createClient } from '@supabase/supabase-js';

// We fall back to the known project URL if environment variable is missing
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://mftthukphffirdcoqprz.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxOTY0ODcsImV4cCI6MjEwNTc3MjQ4N30.m1Vv_bbOlYcWZMX0j5_og12eeQt3vAQIiYHos_o7vos';

/**
 * Detects whether the current frontend runtime is running in QA / Staging sandbox.
 * True for Vercel Staging deployments, domains with staging/qa, or explicit env=qa param.
 */
export const isQaEnvironment = (): boolean => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (
      host.includes('staging') ||
      host.includes('qa') ||
      search.includes('env=qa') ||
      sessionStorage.getItem('tattoo_env') === 'qa'
    ) {
      return true;
    }
  }
  const mode = (import.meta as any).env?.MODE;
  const appEnv = (import.meta as any).env?.VITE_APP_ENV;
  return mode === 'staging' || mode === 'qa' || appEnv === 'staging' || appEnv === 'qa';
};

export const activeSchema = isQaEnvironment() ? 'qa' : 'public';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: activeSchema,
  },
});
