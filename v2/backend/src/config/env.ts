import dotenv from 'dotenv';
import path from 'path';

// Force load local .env with override: true so ambient OS environment variables
// (e.g. from previous projects or system global env) do not collide
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

export interface Environment {
  PORT: number;
  NODE_ENV: string;
  SUPABASE_URL: string;
  ANON_KEY: string;
  SERVICE_ROLE_KEY: string;
  PAYPAL_KEY: string;
  PAYPAL_ID: string;
  EMAIL: string;
  PASSW: string;
}

const defaultSupabaseUrl = 'https://mftthukphffirdcoqprz.supabase.co';
const defaultAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxOTY0ODcsImV4cCI6MjEwNTc3MjQ4N30.m1Vv_bbOlYcWZMX0j5_og12eeQt3vAQIiYHos_o7vos';
const defaultServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE5NjQ4NywiZXhwIjoyMTA1NzcyNDg3fQ.Q4VTaLcphMgsPltdtScZgoz0QKBuZprf18vjguqpadA';

export const env: Environment = {
  PORT: parseInt(process.env.PORT || '8080', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL || process.env.SUPABASEURL || defaultSupabaseUrl,
  ANON_KEY: process.env.ANON_KEY || process.env.SUPABASEKEY || defaultAnonKey,
  SERVICE_ROLE_KEY:
    process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || defaultServiceRoleKey,
  PAYPAL_KEY: process.env.PAYPAL_KEY || process.env.PAYPALKEY || 'pendiente',
  PAYPAL_ID: process.env.PAYPAL_ID || process.env.PAYPALID || 'pendiente',
  EMAIL: process.env.EMAIL || 'dummy@gmail.com',
  PASSW: process.env.PASSW || 'dummy_pass',
};
