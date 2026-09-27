/**
 * Test Suite Configuration & Constants
 * Tattoo Shop V2 Modernization - E2E Testing Track
 */

export interface TestConfig {
  baseUrl: string;
  frontendDir: string;
  backendDir: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  requestTimeoutMs: number;
  verbose: boolean;
}

export const CONFIG: TestConfig = {
  baseUrl: process.env.API_URL || 'http://localhost:8080',
  frontendDir: process.env.FRONTEND_DIR || '../frontend',
  backendDir: process.env.BACKEND_DIR || '../backend',
  supabaseUrl: process.env.SUPABASE_URL || 'https://mftthukphffirdcoqprz.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxOTY0ODcsImV4cCI6MjEwNTc3MjQ4N30.m1Vv_bbOlYcWZMX0j5_og12eeQt3vAQIiYHos_o7vos',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE5NjQ4NywiZXhwIjoyMTA1NzcyNDg3fQ.Q4VTaLcphMgsPltdtScZgoz0QKBuZprf18vjguqpadA',
  requestTimeoutMs: 15000,
  verbose: process.argv.includes('--verbose') || false,
};

// 1x1 transparent PNG in base64
export const SAMPLE_BASE64_IMAGE =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Sample data generator for clean, non-colliding test fixtures
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${random}@testtattoo.com`;
}
