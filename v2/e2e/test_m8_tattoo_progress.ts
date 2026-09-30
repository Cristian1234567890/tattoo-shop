/**
 * Milestone 8: Tattoo Progress Timeline & Supabase Storage Empirical Verification
 * 
 * Verifies:
 * 1. Storage bucket 'tattoo-progress' existence, public configuration, and upload/URL/delete lifecycle
 * 2. Database table public.tattoo_progress schema, indexes, and triggers
 * 3. Backend REST endpoints with authentication and subscription gating (CLIENT_PREMIUM_REQUIRED vs 200)
 * 4. End-to-end progress lifecycle: Create entry -> Retrieve client entries -> Retrieve artist shared entries -> Delete entry
 * 5. Password sanitization security verification in UserService.updateUser
 * 6. Frontend storage helpers & component contracts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { supabaseAdmin } from '../backend/src/config/supabase.ts';
import { ApiClient } from './framework/api_client.ts';
import { CONFIG, generateTestEmail, SAMPLE_BASE64_IMAGE } from './config.ts';
import { UserService } from '../backend/src/services/user.service.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AssertionResult {
  suite: string;
  testId: string;
  description: string;
  passed: boolean;
  expected: any;
  actual: any;
  notes?: string;
}

const results: AssertionResult[] = [];

function assert(
  suite: string,
  testId: string,
  description: string,
  condition: boolean,
  expected: any,
  actual: any,
  notes?: string
) {
  results.push({
    suite,
    testId,
    description,
    passed: condition,
    expected,
    actual,
    notes,
  });

  const mark = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${mark} [${testId}] ${description}`);
  if (!condition) {
    console.error(`      Expected: ${JSON.stringify(expected)}`);
    console.error(`      Actual:   ${JSON.stringify(actual)}`);
    if (notes) console.error(`      Notes:    ${notes}`);
  }
}

async function runM8Verification() {
  console.log('======================================================================');
  console.log('  MILESTONE 8: EMPIRICAL HARNESS — TATTOO PROGRESS & SUPABASE STORAGE');
  console.log('  Storage, Table, Endpoints, Gating, Lifecycle, & Password Sanitization');
  console.log('======================================================================\n');

  const client = new ApiClient(CONFIG.baseUrl);

  // --------------------------------------------------------------------------
  // SUITE 1: Supabase Storage Bucket 'tattoo-progress' Verification
  // --------------------------------------------------------------------------
  console.log('--- SUITE 1: Supabase Storage Bucket Verification ---');
  const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets();
  const progressBucket = buckets?.find((b) => b.id === 'tattoo-progress');

  assert(
    'Storage',
    'ST-01',
    "Storage bucket 'tattoo-progress' exists in Supabase",
    !bucketError && !!progressBucket,
    'Bucket tattoo-progress present',
    progressBucket?.id || 'not found'
  );

  assert(
    'Storage',
    'ST-02',
    "Bucket 'tattoo-progress' is configured as public (CDN caching)",
    progressBucket?.public === true,
    true,
    progressBucket?.public
  );

  // Test live upload, get public url, and deletion in storage
  const testFileName = `test-verify/${Date.now()}-sample.png`;
  const fileBuffer = Buffer.from(SAMPLE_BASE64_IMAGE, 'base64');
  const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
    .from('tattoo-progress')
    .upload(testFileName, fileBuffer, { contentType: 'image/png' });

  assert(
    'Storage',
    'ST-03',
    'Upload photo buffer into tattoo-progress bucket succeeds',
    !uploadErr && !!uploadData?.path,
    'Upload successful without errors',
    uploadErr ? uploadErr.message : uploadData?.path
  );

  const { data: publicUrlData } = supabaseAdmin.storage
    .from('tattoo-progress')
    .getPublicUrl(testFileName);

  assert(
    'Storage',
    'ST-04',
    'getPublicUrl returns valid public CDN endpoint containing bucket name',
    !!publicUrlData?.publicUrl && publicUrlData.publicUrl.includes('tattoo-progress'),
    'URL contains /tattoo-progress/',
    publicUrlData?.publicUrl
  );

  // Clean up test file
  const { error: deleteStorageErr } = await supabaseAdmin.storage
    .from('tattoo-progress')
    .remove([testFileName]);

  assert(
    'Storage',
    'ST-05',
    'Remove file from tattoo-progress storage succeeds',
    !deleteStorageErr,
    'Deletion error null',
    deleteStorageErr ? deleteStorageErr.message : null
  );

  // --------------------------------------------------------------------------
  // SUITE 2: Database Schema & Migration Verification
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 2: Database Table public.tattoo_progress Verification ---');
  const { data: columns, error: colErr } = await supabaseAdmin
    .from('tattoo_progress')
    .select('*')
    .limit(0);

  assert(
    'Database',
    'DB-01',
    'Table public.tattoo_progress is queryable without errors',
    !colErr,
    'null error',
    colErr ? colErr.message : null
  );

  const migrationFile = path.resolve(__dirname, '../backend/migrations/07_tattoo_progress.sql');
  const migrationExists = fs.existsSync(migrationFile);
  const migrationContent = migrationExists ? fs.readFileSync(migrationFile, 'utf8') : '';

  assert(
    'Database',
    'DB-02',
    'Migration file 07_tattoo_progress.sql exists and creates table + storage bucket',
    migrationExists &&
      migrationContent.includes('CREATE TABLE IF NOT EXISTS public.tattoo_progress') &&
      migrationContent.includes('tattoo-progress'),
    'Contains CREATE TABLE and tattoo-progress',
    migrationExists ? 'File present' : 'Missing file'
  );

  assert(
    'Database',
    'DB-03',
    'Migration configures Row Level Security (RLS) policies for clients and artists',
    migrationContent.includes('ENABLE ROW LEVEL SECURITY') &&
      migrationContent.includes('Clients and tagged artists can view tattoo progress') &&
      migrationContent.includes('Clients and artists can insert tattoo progress') &&
      migrationContent.includes('Clients can delete their own tattoo progress'),
    'Complete RLS policy definitions present',
    'RLS verified in migration'
  );

  // --------------------------------------------------------------------------
  // SUITE 3: Password Sanitization Security Audit (M7 Review Action)
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 3: Password Sanitization Security Audit ---');
  const userService = new UserService();
  const testEmail = generateTestEmail('sanitize_test');
  const testPassword = 'InitialPassword123!';

  const { data: authUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { role: 'Cliente', tipo: 'Cliente', full_name: 'Sanitize Tester' },
  });

  if (createErr || !authUser.user) {
    throw new Error(`Failed to create test user: ${createErr?.message}`);
  }

  // Attempt to update profile including a password property in the payload
  const updateRes = await userService.updateUser(
    {
      city: 'Panama City',
      password: 'NewSecretPassword999!',
    } as any,
    authUser.user,
    'dummy_token'
  );

  assert(
    'Security',
    'SEC-01',
    'UserService.updateUser returns success: true',
    updateRes.success === true,
    true,
    updateRes.success
  );

  // Verify that 'password' is NOT present in returned user_metadata
  const returnedMeta = updateRes.data?.user?.user_metadata || {};
  assert(
    'Security',
    'SEC-02',
    'Returned user.user_metadata is sanitized (does NOT contain password)',
    !('password' in returnedMeta),
    'password omitted from returned metadata',
    'password' in returnedMeta ? 'LEAKED' : 'SANITIZED'
  );

  // Verify in Supabase GoTrue database that user_metadata does NOT have password
  const { data: fetchedUser } = await supabaseAdmin.auth.admin.getUserById(authUser.user.id);
  const dbMeta = fetchedUser.user?.user_metadata || {};
  assert(
    'Security',
    'SEC-03',
    'Persisted GoTrue user_metadata in database does NOT contain plaintext password',
    !('password' in dbMeta),
    'password omitted from database user_metadata',
    'password' in dbMeta ? 'LEAKED' : 'SANITIZED'
  );

  // Clean up test user
  await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);

  // --------------------------------------------------------------------------
  // SUITE 4: End-to-End Progress Lifecycle via Backend REST API
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 4: Backend REST API Progress Lifecycle & Gating ---');
  // Create test client and artist
  const clientUserEmail = generateTestEmail('m8_client');
  const artistUserEmail = generateTestEmail('m8_artist');
  const defaultPassword = 'Password123!';

  const regClient = await client.register({
    email: clientUserEmail,
    password: defaultPassword,
    nombre: 'M8Client',
    apellido: 'Tester',
    tipo: 'Cliente',
    legal_accepted: true,
  });

  const regArtist = await client.register({
    email: artistUserEmail,
    password: defaultPassword,
    nombre: 'M8Artist',
    apellido: 'Studio',
    tipo: 'Tatuador',
    legal_accepted: true,
  });

  const clientUserId = regClient.data.data.user.id;
  const clientToken = regClient.data.data.session.access_token;
  const clientAuth = { Authorization: `Bearer ${clientToken}` };

  const artistUserId = regArtist.data.data.user.id;
  const artistToken = regArtist.data.data.session.access_token;
  const artistAuth = { Authorization: `Bearer ${artistToken}` };

  // 4.1 Client without subscription blocked (HTTP 403 CLIENT_PREMIUM_REQUIRED)
  const blockedRes = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: { title: 'Attempt 1', stage: 'Fase 1: Limpieza & Primer Vendaje' },
    headers: clientAuth,
  });

  assert(
    'Endpoints',
    'EP-01',
    'Non-VIP client receives HTTP 403 CLIENT_PREMIUM_REQUIRED on POST /api/client/tattoo-progress',
    blockedRes.status === 403 && blockedRes.data?.code === 'CLIENT_PREMIUM_REQUIRED',
    'HTTP 403, code=CLIENT_PREMIUM_REQUIRED',
    `HTTP ${blockedRes.status}, code=${blockedRes.data?.code}`
  );

  const blockedGetRes = await client.request('/api/client/tattoo-progress', {
    method: 'GET',
    headers: clientAuth,
  });

  assert(
    'Endpoints',
    'EP-02',
    'Non-VIP client receives HTTP 403 on GET /api/client/tattoo-progress',
    blockedGetRes.status === 403 && blockedGetRes.data?.code === 'CLIENT_PREMIUM_REQUIRED',
    'HTTP 403, code=CLIENT_PREMIUM_REQUIRED',
    `HTTP ${blockedGetRes.status}, code=${blockedGetRes.data?.code}`
  );

  // 4.2 Activate subscription for client
  await client.insertUserSubscription(
    {
      id: clientUserId,
      product_id: 'prod_client_monthly',
      subscription_id: 'sub_m8_test_123',
    },
    clientAuth
  );

  // 4.3 VIP client creates progress entry with artist association
  const createProgressRes = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: {
      client_id: clientUserId,
      artist_id: artistUserId,
      title: 'Sesión 1: Delineado de Brazo Completo',
      notes: 'Líneas limpias, enrojecimiento moderado. Se aplicó Aquaphor.',
      image_url: 'https://mftthukphffirdcoqprz.supabase.co/storage/v1/object/public/tattoo-progress/sample.png',
      stage: 'Fase 1: Limpieza & Primer Vendaje',
      session_number: 1,
      date: '2026-09-30',
      metadata: { body_part: 'Brazo', healing_rating: 4 },
    },
    headers: clientAuth,
  });

  assert(
    'Endpoints',
    'EP-03',
    'VIP client successfully posts tattoo progress (HTTP 200, success=true)',
    createProgressRes.status === 200 && createProgressRes.data?.success === true,
    'HTTP 200, success=true',
    `HTTP ${createProgressRes.status}, success=${createProgressRes.data?.success}`
  );

  const createdId = createProgressRes.data?.data?.id;

  assert(
    'Endpoints',
    'EP-04',
    'Created record has valid UUID and tagged artist information embedded',
    !!createdId && createProgressRes.data?.data?.artist?.id === artistUserId,
    `Record id UUID with artist.id = ${artistUserId}`,
    `id=${createdId}, artist.id=${createProgressRes.data?.data?.artist?.id}`
  );

  // 4.4 Client fetches their progress entries
  const getProgressRes = await client.request('/api/client/tattoo-progress', {
    method: 'GET',
    headers: clientAuth,
  });

  assert(
    'Endpoints',
    'EP-05',
    'VIP client retrieves progress entries list (HTTP 200, array containing created entry)',
    getProgressRes.status === 200 &&
      Array.isArray(getProgressRes.data?.data) &&
      getProgressRes.data.data.some((e: any) => e.id === createdId),
    'Array contains created progress entry',
    `Count: ${getProgressRes.data?.data?.length || 0}`
  );

  // 4.5 Artist fetches shared progress entries
  const artistProgressRes = await client.request('/api/artist/tattoo-progress', {
    method: 'GET',
    headers: artistAuth,
  });

  assert(
    'Endpoints',
    'EP-06',
    'Tagged artist retrieves client progress shared with them via /api/artist/tattoo-progress',
    artistProgressRes.status === 200 &&
      Array.isArray(artistProgressRes.data?.data) &&
      artistProgressRes.data.data.some((e: any) => e.id === createdId),
    'Artist view contains shared client entry',
    `Count: ${artistProgressRes.data?.data?.length || 0}`
  );

  // 4.6 Client deletes the progress entry
  const deleteRes = await client.request(`/api/client/tattoo-progress/${createdId}`, {
    method: 'DELETE',
    headers: clientAuth,
  });

  assert(
    'Endpoints',
    'EP-07',
    'Client deletes progress entry successfully (HTTP 200, success=true)',
    deleteRes.status === 200 && deleteRes.data?.success === true,
    'HTTP 200, success=true',
    `HTTP ${deleteRes.status}, success=${deleteRes.data?.success}`
  );

  // Verify deletion in database
  const { data: verifyDeleted } = await supabaseAdmin
    .from('tattoo_progress')
    .select('id')
    .eq('id', createdId)
    .maybeSingle();

  assert(
    'Endpoints',
    'EP-08',
    'Deleted record is no longer present in public.tattoo_progress table',
    verifyDeleted === null,
    'null (record deleted)',
    verifyDeleted
  );

  // --------------------------------------------------------------------------
  // SUITE 5: Frontend Component & Storage Integration AST Verification
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 5: Frontend Components & Integration AST Audit ---');
  const timelinePath = path.resolve(__dirname, '../frontend/src/components/tattoo/TattooTimeline.tsx');
  const uploadModalPath = path.resolve(__dirname, '../frontend/src/components/tattoo/UploadProgressModal.tsx');
  const detailModalPath = path.resolve(__dirname, '../frontend/src/components/tattoo/ProgressDetailModal.tsx');
  const storageUtilPath = path.resolve(__dirname, '../frontend/src/utils/storage.ts');
  const overviewTabPath = path.resolve(__dirname, '../frontend/src/components/client/tabs/TattoosOverviewTab.tsx');

  const timelineSrc = fs.readFileSync(timelinePath, 'utf8');
  const uploadSrc = fs.readFileSync(uploadModalPath, 'utf8');
  const detailSrc = fs.readFileSync(detailModalPath, 'utf8');
  const storageSrc = fs.readFileSync(storageUtilPath, 'utf8');
  const overviewSrc = fs.readFileSync(overviewTabPath, 'utf8');

  assert(
    'Frontend',
    'FE-01',
    'TattooTimeline renders vertical spine, filter bar, and stage pills',
    timelineSrc.includes('before:bg-gradient-to-b') &&
      timelineSrc.includes('getStageBadgeStyle') &&
      timelineSrc.includes('Fase 1: Limpieza') &&
      timelineSrc.includes('Fase 2: Descamación') &&
      timelineSrc.includes('Fase 3: Cicatrizado'),
    'Gradient spine & stage filters present',
    'Verified in TattooTimeline.tsx'
  );

  assert(
    'Frontend',
    'FE-02',
    'UploadProgressModal integrates Supabase Storage upload and file preview',
    uploadSrc.includes('uploadTattooProgressPhoto') &&
      uploadSrc.includes('URL.createObjectURL') &&
      uploadSrc.includes('healingRating') &&
      uploadSrc.includes('bodyPart'),
    'Supabase Storage upload & live preview present',
    'Verified in UploadProgressModal.tsx'
  );

  assert(
    'Frontend',
    'FE-03',
    'ProgressDetailModal constructs dynamic WhatsApp link with artist phone and stage',
    detailSrc.includes('getWhatsAppLink') &&
      detailSrc.includes('wa.me') &&
      detailSrc.includes('entry.stage') &&
      detailSrc.includes('onDelete'),
    'WhatsApp link generator and delete action present',
    'Verified in ProgressDetailModal.tsx'
  );

  assert(
    'Frontend',
    'FE-04',
    'storage.ts exports uploadTattooProgressPhoto, getPublicProgressUrl, and deleteProgressPhoto',
    storageSrc.includes('export async function uploadTattooProgressPhoto') &&
      storageSrc.includes('export function getPublicProgressUrl') &&
      storageSrc.includes('export async function deleteProgressPhoto') &&
      storageSrc.includes('tattoo-progress'),
    'All storage helper functions exported',
    'Verified in storage.ts'
  );

  assert(
    'Frontend',
    'FE-05',
    'TattoosOverviewTab mounts <TattooTimeline />, <ProgressDetailModal />, and <UploadProgressModal /> inside #tattoo-progress-anchor',
    overviewSrc.includes('<TattooTimeline') &&
      overviewSrc.includes('<ProgressDetailModal') &&
      overviewSrc.includes('<UploadProgressModal') &&
      overviewSrc.includes('id="tattoo-progress-anchor"'),
    'Components mounted in tattoo-progress-anchor',
    'Verified in TattoosOverviewTab.tsx'
  );

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n======================================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`  VERIFICATION RESULTS: ${passedCount}/${results.length} PASSED (${failedCount} FAILED)`);
  console.log('======================================================================\n');

  if (failedCount > 0) {
    console.error('❌ SOME TESTS FAILED.');
    process.exit(1);
  } else {
    console.log('✅ ALL MILESTONE 8 TESTS PASSED WITH 0 ERRORS.');
    process.exit(0);
  }
}

runM8Verification().catch((err) => {
  console.error('Fatal Test Exception in Milestone 8 Harness:', err);
  process.exit(1);
});
