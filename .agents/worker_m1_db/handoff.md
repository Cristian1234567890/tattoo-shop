# Milestone 1 Handoff Report: Database Provisioning

**Worker**: `worker_m1_db`  
**Milestone**: Milestone 1 - Database Provisioning  
**Target Path**: `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\backend\migrations\01_init.sql`  
**Date**: 2026-09-23  

---

## 1. Observation

1. **Initial Database State**:
   - Querying `list_tables` on Supabase project `mftthukphffirdcoqprz` prior to migration returned empty schema: `{"tables":[]}`.
   - PostgREST endpoint `https://mftthukphffirdcoqprz.supabase.co/rest/v1/` returned Swagger specification with `DEFINITIONS: []`.
   
2. **File Artifact Created**:
   - Location: `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\backend\migrations\01_init.sql`
   - Content: Complete DDL script provisioning PostgreSQL extensions, tables `public.tatuadores_data` and `public.user_subscription`, automatic `updated_at` trigger, 10 RLS policies, and storage bucket `user_profile` with 5 storage policies.

3. **Applied Migration**:
   - Migration `01_init` was submitted and applied against remote Supabase database `mftthukphffirdcoqprz`.
   - Tool response: `{"result":{"content":[{"type":"text","text":"{\"success\":true}"}]},"jsonrpc":"2.0","id":2}`.

4. **Post-Migration Verification Outputs**:
   - `list_tables` output:
     ```json
     {"tables":[{"name":"public.tatuadores_data","rls_enabled":true,"rows":0},{"name":"public.user_subscription","rls_enabled":true,"rows":0}]}
     ```
   - Information schema columns query:
     - `tatuadores_data`: `id` (uuid, PK, NOT NULL), `data` (jsonb, NOT NULL, DEFAULT `'{}'::jsonb`), `created_at` (timestamptz, NOT NULL), `updated_at` (timestamptz, NOT NULL).
     - `user_subscription`: `id` (uuid, PK, NOT NULL), `product_id` (text, NOT NULL), `subscription_id` (text, NOT NULL), `created_at` (timestamptz, NOT NULL), `updated_at` (timestamptz, NOT NULL).
   - RLS policies verified on `public.tatuadores_data` and `public.user_subscription` (10 total):
     - `Public read for tatuadores_data` (SELECT, public)
     - `Users can insert own tatuador data` (INSERT, authenticated)
     - `Users can update own tatuador data` (UPDATE, authenticated)
     - `Users can delete own tatuador data` (DELETE, authenticated)
     - `Service role full access on tatuadores_data` (ALL, service_role)
     - `Users can read own subscription` (SELECT, authenticated)
     - `Users can insert own subscription` (INSERT, authenticated)
     - `Users can update own subscription` (UPDATE, authenticated)
     - `Users can delete own subscription` (DELETE, authenticated)
     - `Service role full access on user_subscription` (ALL, service_role)
   - Triggers verified:
     - `set_updated_at_tatuadores_data` on `public.tatuadores_data`
     - `set_updated_at_user_subscription` on `public.user_subscription`
   - Storage bucket verified:
     - Bucket `user_profile` in `storage.buckets` (`public: true`, `file_size_limit: 52428800`, allowed mime types: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`, `image/gif`).
     - 5 storage policies on `storage.objects` for `user_profile` (public SELECT, authenticated INSERT/UPDATE/DELETE scoped to `${auth.uid()}/*`, and service_role full bypass).

5. **Client & REST Verification**:
   - `[REST] GET /rest/v1/tatuadores_data (ANON_KEY)`: Status 200, `[]`
   - `[REST] GET /rest/v1/tatuadores_data (SERVICE_ROLE_KEY)`: Status 200, `[]`
   - `[REST] GET /rest/v1/user_subscription (SERVICE_ROLE_KEY)`: Status 200, `[]`
   - `[REST] GET /storage/v1/bucket/user_profile (SERVICE_ROLE_KEY)`: Status 200, JSON matching bucket metadata
   - `@supabase/supabase-js` client queries against `tatuadores_data`, `user_subscription`, and `storage.from('user_profile').list()` all succeeded without errors.

---

## 2. Logic Chain

1. **Schema Design**:
   - The reference backend (`backend/backend/auth.js:63-64` and `tattoo.js:9`) stores artist profile attributes in table `tatuadores_data` under `{ id, data }`. Primary key `id` references `auth.users(id)` with cascading deletion.
   - The reference backend (`backend/backend/user-subscription.js:10,28`) binds PayPal subscription IDs to users via table `user_subscription` with columns `id`, `product_id`, and `subscription_id`.
   - The reference backend (`backend/backend/auth.js:126`) uploads avatars to Supabase storage bucket `user_profile` under `${userId}/profile.png`.
   - Therefore, the migration was written to create both tables, foreign keys referencing `auth.users(id) ON DELETE CASCADE`, indexes on primary keys, foreign keys, and JSONB GIN index on `data` for fast querying.

2. **Security & RLS**:
   - `tatuadores_data` requires public read so that unauthenticated visitors on the landing page and clients browsing the catalog can view tattoo artist profiles (`GET /gettatto`).
   - Mutations (`INSERT`, `UPDATE`, `DELETE`) on `tatuadores_data` and `user_subscription` are restricted to `auth.uid() = id`, ensuring users can only modify their own profiles or subscriptions.
   - `service_role` is granted full administrative access across all tables and storage to allow server-side backend operations (e.g. registration webhooks, administration).

3. **Storage Configuration**:
   - Bucket `user_profile` is configured with `public = true` and allowed MIME types for images to support direct public avatar image resolution.
   - Policies ensure authenticated users can only write to their own namespace `auth.uid()/*`.

---

## 3. Caveats

- Direct IPv6 connections to `db.mftthukphffirdcoqprz.supabase.co:5432` from local host networks without IPv6 route directly to Supabase's connection pooler or REST/MCP interface. All migrations and client interactions must use the HTTPS REST/Storage API endpoints or Supavisor pooler URLs.
- The `user_subscription` table is protected by RLS; clients cannot read other users' subscription status, and unauthenticated visitors cannot read subscriptions.

---

## 4. Conclusion

Milestone 1 (Database Provisioning) is 100% complete:
- The DDL migration file `v2/backend/migrations/01_init.sql` is created and self-contained.
- The remote Supabase database `mftthukphffirdcoqprz` has been successfully provisioned with tables `public.tatuadores_data`, `public.user_subscription`, and storage bucket `user_profile`.
- Row Level Security (RLS) is enabled and verified with 10 database policies and 5 storage policies.
- Automated triggers maintain `updated_at` timestamps on row updates.
- End-to-end verification via `@supabase/supabase-js` and PostgREST HTTP queries passed with HTTP 200 OK.

---

## 5. Verification Method

To independently verify the provisioned database and migration:

1. **Verify Migration File**:
   Inspect `v2/backend/migrations/01_init.sql`.

2. **Execute Independent Verification Script**:
   Run the test script located at:
   ```powershell
   node c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\worker_m1_db\verify.js
   ```
   **Expected Output**:
   ```
   === VERIFYING SUPABASE REST API ===
   [REST] GET /rest/v1/tatuadores_data (ANON_KEY): 200 []
   [REST] GET /rest/v1/tatuadores_data (SERVICE_ROLE_KEY): 200 []
   [REST] GET /rest/v1/user_subscription (SERVICE_ROLE_KEY): 200 []
   [REST] GET /storage/v1/bucket/user_profile (SERVICE_ROLE_KEY): 200 ...
   === VERIFYING SUPABASE JS CLIENT ===
   [@supabase/supabase-js] tatuadores_data select: []
   [@supabase/supabase-js] user_subscription select: []
   [@supabase/supabase-js] storage.getBucket("user_profile"): ...
   [@supabase/supabase-js] storage.from("user_profile").list(): []
   ALL VERIFICATIONS PASSED SUCCESSFULLY (200 OK)!
   ```

3. **Verify Table Existence via Supabase MCP Tool**:
   Call MCP tool `list_tables` with `project_id: "mftthukphffirdcoqprz"`.
   Returns:
   `{"tables":[{"name":"public.tatuadores_data","rls_enabled":true,"rows":0},{"name":"public.user_subscription","rls_enabled":true,"rows":0}]}`.
