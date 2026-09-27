## 2026-09-23T23:37:41Z
You are worker_m1_db, a specialized implementation worker.
Working directory: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\worker_m1_db

MANDATORY: Read ORIGINAL_REQUEST.md at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\ORIGINAL_REQUEST.md
and PROJECT.md at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\PROJECT.md
and Spec Miner report at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\specminer_api_survey\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your task (Milestone 1 - Database Provisioning):
1. Create the migrations directory: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\backend\migrations
2. Write the complete PostgreSQL DDL migration file `01_init.sql` containing:
   - Table `public.tatuadores_data` (id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, data JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
   - Table `public.user_subscription` (id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, product_id TEXT, subscription_id TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
   - Indexes and RLS policies (allowing public read on tatuadores_data, authenticated operations, etc.)
   - Creation of Storage bucket `user_profile` in `storage.buckets` if not exists, with public read access
3. Apply the migration against the Supabase database:
   - SUPABASE_URL: https://mftthukphffirdcoqprz.supabase.co
   - SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE5NjQ4NywiZXhwIjoyMTA1NzcyNDg3fQ.Q4VTaLcphMgsPltdtScZgoz0QKBuZprf18vjguqpadA
   You can run a Node script with @supabase/supabase-js or use fetch / pg / Supabase REST to apply the SQL and verify.
4. Verify by querying the tables and storage bucket using Supabase client to confirm tables and buckets exist and return 200 OK without errors.
5. Exclusive file ownership: `v2/backend/migrations/*`
6. Write your handoff report to:
   c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\worker_m1_db\handoff.md
7. Message the orchestrator when completed.
