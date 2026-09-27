import { createClient } from '@supabase/supabase-js';

// We fall back to the known project URL if environment variable is missing
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://mftthukphffirdcoqprz.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxOTY0ODcsImV4cCI6MjEwNTc3MjQ4N30.m1Vv_bbOlYcWZMX0j5_og12eeQt3vAQIiYHos_o7vos';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
