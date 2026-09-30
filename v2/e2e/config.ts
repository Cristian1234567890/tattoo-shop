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

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadBackendEnv(): Record<string, string> {
  const envMap: Record<string, string> = {};
  const envPath = path.resolve(__dirname, '../backend/.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim();
        envMap[key] = val;
      }
    }
  }
  return envMap;
}

const backendEnv = loadBackendEnv();

export const CONFIG: TestConfig = {
  baseUrl: process.env.API_URL || 'http://localhost:8080',
  frontendDir: process.env.FRONTEND_DIR || path.resolve(__dirname, '../frontend'),
  backendDir: process.env.BACKEND_DIR || path.resolve(__dirname, '../backend'),
  supabaseUrl: backendEnv.SUPABASE_URL || 'https://mftthukphffirdcoqprz.supabase.co',
  supabaseAnonKey: backendEnv.ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxOTY0ODcsImV4cCI6MjEwNTc3MjQ4N30.m1Vv_bbOlYcWZMX0j5_og12eeQt3vAQIiYHos_o7vos',
  supabaseServiceRoleKey: backendEnv.SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE5NjQ4NywiZXhwIjoyMTA1NzcyNDg3fQ.Q4VTaLcphMgsPltdtScZgoz0QKBuZprf18vjguqpadA',
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
