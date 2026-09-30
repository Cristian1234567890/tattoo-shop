/**
 * Challenger 1: Empirical Adversarial Stress Test Suite for Milestone 8
 * 
 * Focus:
 * 1. Dual-route Parity & Strict HTTP Method Gating
 * 2. Auth & Premium Subscription Barriers (401 / 403 / 200)
 * 3. Malformed & Adversarial Payloads (Empty strings, bad UUIDs, non-existent FKs, spoofed client_id)
 * 4. Multi-Tenant Cross-Access & Isolation (Client A vs Client B, Artist X vs Artist Y)
 * 5. Automatic Storage Cascade Cleanup on Record Deletion
 * 6. Database Cascade (ON DELETE CASCADE client, ON DELETE SET NULL artist)
 * 7. Storage RLS Security & Directory Path Boundary Checks
 */

import { ApiClient } from './framework/api_client.ts';
import { CONFIG, generateTestEmail, SAMPLE_BASE64_IMAGE } from './config.ts';
import { supabaseAdmin, createScopedClient } from '../backend/src/config/supabase.ts';

interface TestCaseResult {
  id: string;
  category: string;
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: any;
}

const results: TestCaseResult[] = [];

function record(
  id: string,
  category: string,
  description: string,
  passed: boolean,
  expected: string,
  actual: string,
  details?: any
) {
  results.push({ id, category, description, passed, expected, actual, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${id}] [${category}] ${description}`);
  if (!passed) {
    console.error(`      Expected: ${expected}`);
    console.error(`      Actual:   ${actual}`);
    if (details) console.error(`      Details:  ${JSON.stringify(details)}`);
  }
}

async function runAdversarialHarness() {
  console.log('========================================================================');
  console.log('  CHALLENGER 1: EMPIRICAL ADVERSARIAL STRESS TEST — MILESTONE 8');
  console.log('  Backend Routes, Subscription Gating, Payloads, Isolation & Storage');
  console.log('========================================================================\n');

  const client = new ApiClient(CONFIG.baseUrl);
  const password = 'Password123!';

  async function registerAndAuth(email: string, pass: string, name: string, tipo: 'Cliente' | 'Tatuador') {
    const reg = await client.register({
      email,
      password: pass,
      nombre: name,
      apellido: 'Tester',
      tipo,
      legal_accepted: true,
    });
    let token = reg.data?.data?.session?.access_token || reg.data?.session?.access_token;
    let userId = reg.data?.data?.user?.id || reg.data?.user?.id;
    if (!token) {
      const loginRes = await client.login({ email, password: pass });
      token = loginRes.data?.data?.session?.access_token || loginRes.data?.session?.access_token;
      userId = userId || loginRes.data?.data?.user?.id || loginRes.data?.user?.id;
    }
    return {
      userId,
      token,
      auth: { Authorization: `Bearer ${token}` },
    };
  }

  // Provision Test Entities
  console.log('--- Provisioning Test Entities ---');
  // Client A (Non-VIP initially)
  const clientA = await registerAndAuth(generateTestEmail('adv_client_a'), password, 'ClientA', 'Cliente');
  const clientAId = clientA.userId;
  const clientAToken = clientA.token;
  const clientAAuth = clientA.auth;

  // Client B (Non-VIP initially)
  const clientB = await registerAndAuth(generateTestEmail('adv_client_b'), password, 'ClientB', 'Cliente');
  const clientBId = clientB.userId;
  const clientBToken = clientB.token;
  const clientBAuth = clientB.auth;

  // Artist X
  const artistX = await registerAndAuth(generateTestEmail('adv_artist_x'), password, 'ArtistX', 'Tatuador');
  const artistXId = artistX.userId;
  const artistXToken = artistX.token;
  const artistXAuth = artistX.auth;

  // Artist Y
  const artistY = await registerAndAuth(generateTestEmail('adv_artist_y'), password, 'ArtistY', 'Tatuador');
  const artistYId = artistY.userId;
  const artistYToken = artistY.token;
  const artistYAuth = artistY.auth;

  // =========================================================================
  // CATEGORY 1: Unauthenticated Requests (HTTP 401 Unauthorized)
  // =========================================================================
  console.log('\n--- CATEGORY 1: Unauthenticated Requests ---');
  const unauthEndpoints = [
    { method: 'GET', path: '/api/client/tattoo-progress' },
    { method: 'GET', path: '/client/tattoo-progress' },
    { method: 'POST', path: '/api/client/tattoo-progress' },
    { method: 'POST', path: '/client/tattoo-progress' },
    { method: 'DELETE', path: '/api/client/tattoo-progress/00000000-0000-0000-0000-000000000000' },
    { method: 'DELETE', path: '/client/tattoo-progress/00000000-0000-0000-0000-000000000000' },
    { method: 'GET', path: '/api/artist/tattoo-progress' },
    { method: 'GET', path: '/artist/tattoo-progress' },
  ];

  let unauthIdx = 1;
  for (const ep of unauthEndpoints) {
    const resNoToken = await client.request(ep.path, { method: ep.method });
    record(
      `UNAUTH-0${unauthIdx++}`,
      'Authentication',
      `Missing token on ${ep.method} ${ep.path} rejected with 401`,
      resNoToken.status === 401,
      'HTTP 401',
      `HTTP ${resNoToken.status}`
    );

    const resBadToken = await client.request(ep.path, {
      method: ep.method,
      headers: { Authorization: 'Bearer totally.invalid.jwt.token' },
    });
    record(
      `UNAUTH-0${unauthIdx++}`,
      'Authentication',
      `Invalid token on ${ep.method} ${ep.path} rejected with 401`,
      resBadToken.status === 401,
      'HTTP 401',
      `HTTP ${resBadToken.status}`
    );
  }

  // =========================================================================
  // CATEGORY 2: Non-VIP Client Gating (HTTP 403 CLIENT_PREMIUM_REQUIRED)
  // =========================================================================
  console.log('\n--- CATEGORY 2: Non-VIP Client Gating ---');
  const nonVipClientEndpoints = [
    { method: 'POST', path: '/api/client/tattoo-progress', body: { title: 'Non-VIP attempt' } },
    { method: 'POST', path: '/client/tattoo-progress', body: { title: 'Non-VIP attempt' } },
    { method: 'GET', path: '/api/client/tattoo-progress' },
    { method: 'GET', path: '/client/tattoo-progress' },
    { method: 'DELETE', path: '/api/client/tattoo-progress/00000000-0000-0000-0000-000000000000' },
    { method: 'DELETE', path: '/client/tattoo-progress/00000000-0000-0000-0000-000000000000' },
  ];

  let nonVipIdx = 1;
  for (const ep of nonVipClientEndpoints) {
    const res = await client.request(ep.path, {
      method: ep.method,
      body: ep.body,
      headers: clientAAuth,
    });
    record(
      `NONVIP-0${nonVipIdx++}`,
      'Subscription Gating',
      `Non-VIP client receives 403 on ${ep.method} ${ep.path}`,
      res.status === 403 && res.data?.code === 'CLIENT_PREMIUM_REQUIRED',
      'HTTP 403, code=CLIENT_PREMIUM_REQUIRED',
      `HTTP ${res.status}, code=${res.data?.code}`
    );
  }

  // =========================================================================
  // CATEGORY 3: VIP Client Upgrades & Allowed Endpoints (HTTP 200)
  // =========================================================================
  console.log('\n--- CATEGORY 3: VIP Client Access & Dual-Route Parity ---');
  // Upgrade Client A and Client B to VIP
  await client.insertUserSubscription(
    { id: clientAId, product_id: 'prod_client_monthly', subscription_id: 'sub_client_a_vip' },
    clientAAuth
  );
  await client.insertUserSubscription(
    { id: clientBId, product_id: 'prod_client_monthly', subscription_id: 'sub_client_b_vip' },
    clientBAuth
  );

  // VIP Client A creates progress via /api/client/tattoo-progress
  const postApiRes = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: { title: 'API Path Test', stage: 'Fase 1: Limpieza & Primer Vendaje' },
    headers: clientAAuth,
  });
  record(
    'VIP-01',
    'VIP Access',
    'VIP Client POST /api/client/tattoo-progress returns HTTP 200 success=true',
    postApiRes.status === 200 && postApiRes.data?.success === true,
    'HTTP 200, success=true',
    `HTTP ${postApiRes.status}, success=${postApiRes.data?.success}`
  );

  // VIP Client A creates progress via legacy alias /client/tattoo-progress
  const postAliasRes = await client.request('/client/tattoo-progress', {
    method: 'POST',
    body: { title: 'Legacy Alias Path Test', stage: 'Fase 2: Descamación' },
    headers: clientAAuth,
  });
  record(
    'VIP-02',
    'VIP Access',
    'VIP Client POST /client/tattoo-progress (alias) returns HTTP 200 success=true',
    postAliasRes.status === 200 && postAliasRes.data?.success === true,
    'HTTP 200, success=true',
    `HTTP ${postAliasRes.status}, success=${postAliasRes.data?.success}`
  );

  // GET via both paths
  const getApiRes = await client.request('/api/client/tattoo-progress', {
    method: 'GET',
    headers: clientAAuth,
  });
  record(
    'VIP-03',
    'VIP Access',
    'VIP Client GET /api/client/tattoo-progress returns HTTP 200 array',
    getApiRes.status === 200 && Array.isArray(getApiRes.data?.data) && getApiRes.data.data.length >= 2,
    'HTTP 200, array length >= 2',
    `HTTP ${getApiRes.status}, count=${getApiRes.data?.data?.length}`
  );

  const getAliasRes = await client.request('/client/tattoo-progress', {
    method: 'GET',
    headers: clientAAuth,
  });
  record(
    'VIP-04',
    'VIP Access',
    'VIP Client GET /client/tattoo-progress (alias) returns identical records',
    getAliasRes.status === 200 &&
      Array.isArray(getAliasRes.data?.data) &&
      getAliasRes.data.data.length === getApiRes.data.data.length,
    `HTTP 200, count=${getApiRes.data?.data?.length}`,
    `HTTP ${getAliasRes.status}, count=${getAliasRes.data?.data?.length}`
  );

  // =========================================================================
  // CATEGORY 4: Adversarial Payloads & Edge Cases
  // =========================================================================
  console.log('\n--- CATEGORY 4: Adversarial Payloads & Input Validation ---');

  // Case 4.1: Empty body {} -> Sensible defaults applied without crash
  const emptyBodyRes = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: {},
    headers: clientAAuth,
  });
  record(
    'PAYLOAD-01',
    'Input Validation',
    'Empty body {} succeeds with default title, stage, date, session_number',
    emptyBodyRes.status === 200 &&
      emptyBodyRes.data?.data?.title === 'Progreso de Tatuaje' &&
      emptyBodyRes.data?.data?.stage === 'Fase 1: Limpieza & Primer Vendaje' &&
      emptyBodyRes.data?.data?.session_number === 1 &&
      emptyBodyRes.data?.data?.artist_id === null,
    'Defaults applied, artist_id=null',
    `title="${emptyBodyRes.data?.data?.title}", stage="${emptyBodyRes.data?.data?.stage}", artist_id=${emptyBodyRes.data?.data?.artist_id}`
  );

  // Case 4.2: Empty string artist_id: "" -> Converted to null, no UUID syntax error 22P02
  const emptyArtistRes = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: { title: 'Empty String Artist', artist_id: '' },
    headers: clientAAuth,
  });
  record(
    'PAYLOAD-02',
    'Input Validation',
    'Empty string artist_id ("") is sanitized to null without database 22P02 error',
    emptyArtistRes.status === 200 && emptyArtistRes.data?.data?.artist_id === null,
    'HTTP 200, artist_id=null',
    `HTTP ${emptyArtistRes.status}, artist_id=${emptyArtistRes.data?.data?.artist_id}`
  );

  // Case 4.3: Whitespace string artist_id: "   " -> Converted to null
  const whitespaceArtistRes = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: { title: 'Whitespace Artist', artist_id: '   ' },
    headers: clientAAuth,
  });
  record(
    'PAYLOAD-03',
    'Input Validation',
    'Whitespace string artist_id ("   ") is sanitized to null',
    whitespaceArtistRes.status === 200 && whitespaceArtistRes.data?.data?.artist_id === null,
    'HTTP 200, artist_id=null',
    `HTTP ${whitespaceArtistRes.status}, artist_id=${whitespaceArtistRes.data?.data?.artist_id}`
  );

  // Case 4.4: Malformed UUID string artist_id: "invalid-uuid-format" -> Rejected with HTTP 400
  const malformedUuidRes = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: { title: 'Bad UUID', artist_id: 'not-a-valid-uuid' },
    headers: clientAAuth,
  });
  record(
    'PAYLOAD-04',
    'Input Validation',
    'Malformed UUID artist_id returns HTTP 400 with clean error message',
    malformedUuidRes.status === 400 && malformedUuidRes.data?.success === false,
    'HTTP 400, success=false',
    `HTTP ${malformedUuidRes.status}, error=${malformedUuidRes.data?.error?.message}`
  );

  // Case 4.5: Non-existent UUID artist_id: "00000000-0000-0000-0000-000000000000" -> FK violation HTTP 400
  const nonExistentUuidRes = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: { title: 'Non-existent FK', artist_id: '00000000-0000-0000-0000-000000000000' },
    headers: clientAAuth,
  });
  record(
    'PAYLOAD-05',
    'Input Validation',
    'Non-existent foreign key artist_id returns HTTP 400 FK error',
    nonExistentUuidRes.status === 400 && nonExistentUuidRes.data?.success === false,
    'HTTP 400, success=false',
    `HTTP ${nonExistentUuidRes.status}, error=${nonExistentUuidRes.data?.error?.message}`
  );

  // Case 4.6: Client ID spoofing attempt -> client_id in body must NOT override session user id
  const spoofAttemptRes = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: {
      client_id: clientBId, // Maliciously spoofing Client B's ID
      title: 'Spoof Attempt Entry',
    },
    headers: clientAAuth, // Authenticated as Client A
  });
  const savedRecordId = spoofAttemptRes.data?.data?.id;
  const { data: dbSpoofCheck } = await supabaseAdmin
    .from('tattoo_progress')
    .select('client_id')
    .eq('id', savedRecordId)
    .single();

  record(
    'PAYLOAD-06',
    'Security & Integrity',
    'client_id spoof attempt in body is ignored; record is strictly bound to req.user.id',
    spoofAttemptRes.status === 200 && dbSpoofCheck?.client_id === clientAId,
    `Bound to authenticated user (${clientAId})`,
    `Actual client_id=${dbSpoofCheck?.client_id}`
  );

  // Case 4.7: Invalid session_number ("not-a-number") -> gracefully defaults to 1
  const invalidSessionRes = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: { title: 'Invalid Session', session_number: 'invalid_number' },
    headers: clientAAuth,
  });
  record(
    'PAYLOAD-07',
    'Input Validation',
    'Non-numeric session_number gracefully defaults to 1',
    invalidSessionRes.status === 200 && invalidSessionRes.data?.data?.session_number === 1,
    'session_number=1',
    `session_number=${invalidSessionRes.data?.data?.session_number}`
  );

  // Case 4.8: Complex nested JSONB metadata
  const complexMetaRes = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: {
      title: 'Complex Metadata Entry',
      metadata: {
        body_part: 'Antebrazo',
        needle_types: ['3RL', '7M1'],
        ink_brand: 'Dynamic Triple Black',
        care_schedule: { morning: 'Wash + Aquaphor', night: 'Wash only' },
      },
    },
    headers: clientAAuth,
  });
  record(
    'PAYLOAD-08',
    'JSONB Support',
    'Rich nested JSONB metadata preserved accurately',
    complexMetaRes.status === 200 &&
      complexMetaRes.data?.data?.metadata?.care_schedule?.morning === 'Wash + Aquaphor',
    'Nested JSONB matches',
    `morning="${complexMetaRes.data?.data?.metadata?.care_schedule?.morning}"`
  );

  // =========================================================================
  // CATEGORY 5: Multi-Tenant Data Isolation & Cross-Access Prevention
  // =========================================================================
  console.log('\n--- CATEGORY 5: Multi-Tenant Isolation ---');

  // Client B creates a progress entry tagged with Artist X
  const clientBEntryRes = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: {
      artist_id: artistXId,
      title: 'Client B Secret Tattoo',
      notes: 'Confidential progress',
    },
    headers: clientBAuth,
  });
  const clientBEntryId = clientBEntryRes.data?.data?.id;

  // 5.1 Client A attempts to delete Client B's progress entry -> HTTP 400 / forbidden
  const crossDeleteRes = await client.request(`/api/client/tattoo-progress/${clientBEntryId}`, {
    method: 'DELETE',
    headers: clientAAuth,
  });
  record(
    'ISOLATION-01',
    'Multi-Tenant Isolation',
    'Client A cannot delete Client B progress entry (400 "Registro no encontrado o sin permisos")',
    crossDeleteRes.status === 400 && crossDeleteRes.data?.success === false,
    'HTTP 400, success=false',
    `HTTP ${crossDeleteRes.status}, msg=${crossDeleteRes.data?.error?.message}`
  );

  // Verify Client B entry was NOT deleted by Client A
  const { data: entryStillExists } = await supabaseAdmin
    .from('tattoo_progress')
    .select('id')
    .eq('id', clientBEntryId)
    .single();
  record(
    'ISOLATION-02',
    'Multi-Tenant Isolation',
    'Target record remains intact after unauthorized cross-tenant delete attempt',
    entryStillExists?.id === clientBEntryId,
    `Record ${clientBEntryId} intact`,
    `Found: ${entryStillExists?.id}`
  );

  // 5.2 Client A lists their entries -> MUST NOT contain Client B's entry
  const clientAListRes = await client.request('/api/client/tattoo-progress', {
    method: 'GET',
    headers: clientAAuth,
  });
  const clientAEntries = clientAListRes.data?.data || [];
  const leakedToClientA = clientAEntries.some((e: any) => e.id === clientBEntryId);
  record(
    'ISOLATION-03',
    'Multi-Tenant Isolation',
    "Client A cannot view Client B entries in GET /api/client/tattoo-progress",
    clientAListRes.status === 200 && !leakedToClientA,
    'Entry not found in Client A list',
    leakedToClientA ? 'LEAKED' : 'ISOLATED'
  );

  // 5.3 Artist X views shared entries -> SHOULD contain Client B's entry
  const artistXSharedRes = await client.request('/api/artist/tattoo-progress', {
    method: 'GET',
    headers: artistXAuth,
  });
  const artistXEntries = artistXSharedRes.data?.data || [];
  const foundInArtistX = artistXEntries.some((e: any) => e.id === clientBEntryId);
  record(
    'ISOLATION-04',
    'Artist Sharing',
    'Tagged Artist X can view Client B shared progress entry',
    artistXSharedRes.status === 200 && foundInArtistX,
    'Found in Artist X shared list',
    foundInArtistX ? 'FOUND' : 'MISSING'
  );

  // 5.4 Artist Y views shared entries -> MUST NOT contain Client B's entry (tagged to Artist X)
  const artistYSharedRes = await client.request('/api/artist/tattoo-progress', {
    method: 'GET',
    headers: artistYAuth,
  });
  const artistYEntries = artistYSharedRes.data?.data || [];
  const leakedToArtistY = artistYEntries.some((e: any) => e.id === clientBEntryId);
  record(
    'ISOLATION-05',
    'Artist Sharing',
    'Untagged Artist Y cannot view progress entry tagged exclusively to Artist X',
    artistYSharedRes.status === 200 && !leakedToArtistY,
    'Entry not found in Artist Y list',
    leakedToArtistY ? 'LEAKED' : 'ISOLATED'
  );

  // =========================================================================
  // CATEGORY 6: Storage Lifecycle & Automatic Cleanup on Deletion
  // =========================================================================
  console.log('\n--- CATEGORY 6: Automatic Storage Cleanup ---');
  // Upload a file directly into clientA's subfolder
  const storageFilePath = `${clientAId}/test-auto-clean-${Date.now()}.png`;
  const fileBuf = Buffer.from(SAMPLE_BASE64_IMAGE, 'base64');
  await supabaseAdmin.storage
    .from('tattoo-progress')
    .upload(storageFilePath, fileBuf, { contentType: 'image/png' });

  // Create progress record with metadata.storage_path
  const entryWithStorageRes = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: {
      title: 'Entry with Auto-Cleanup Storage File',
      image_url: `https://mftthukphffirdcoqprz.supabase.co/storage/v1/object/public/tattoo-progress/${storageFilePath}`,
      metadata: { storage_path: storageFilePath },
    },
    headers: clientAAuth,
  });
  const entryWithStorageId = entryWithStorageRes.data?.data?.id;

  // Confirm storage file exists
  const { data: beforeFiles } = await supabaseAdmin.storage
    .from('tattoo-progress')
    .list(clientAId);
  const fileExistedBefore = beforeFiles?.some((f) => storageFilePath.endsWith(f.name));
  record(
    'STORAGE-01',
    'Storage Lifecycle',
    'File uploaded to Supabase Storage before deletion test',
    fileExistedBefore === true,
    'File exists in bucket',
    fileExistedBefore ? 'EXISTS' : 'NOT FOUND'
  );

  // Client deletes entry via backend API
  const deleteWithStorageRes = await client.request(
    `/api/client/tattoo-progress/${entryWithStorageId}`,
    {
      method: 'DELETE',
      headers: clientAAuth,
    }
  );
  record(
    'STORAGE-02',
    'Storage Lifecycle',
    'DELETE /api/client/tattoo-progress/:id returns HTTP 200 success=true',
    deleteWithStorageRes.status === 200 && deleteWithStorageRes.data?.success === true,
    'HTTP 200, success=true',
    `HTTP ${deleteWithStorageRes.status}`
  );

  // Verify file was purged from Supabase Storage automatically!
  const { data: afterFiles } = await supabaseAdmin.storage
    .from('tattoo-progress')
    .list(clientAId);
  const fileStillExistsAfter = afterFiles?.some((f) => storageFilePath.endsWith(f.name));
  record(
    'STORAGE-03',
    'Storage Lifecycle',
    'File in Supabase Storage automatically purged upon progress record deletion',
    fileStillExistsAfter === false,
    'File purged (does not exist)',
    fileStillExistsAfter ? 'STILL_EXISTS (LEAK)' : 'PURGED_CLEANLY'
  );

  // =========================================================================
  // CATEGORY 7: Database Foreign Key Constraints (CASCADE & SET NULL)
  // =========================================================================
  console.log('\n--- CATEGORY 7: Database Cascade & SET NULL Constraints ---');

  // 7.1 Test ON DELETE CASCADE on client_id
  console.log('Testing ON DELETE CASCADE on client_id...');
  const cascadeClient = await registerAndAuth(
    generateTestEmail('cascade_client'),
    password,
    'CascadeClient',
    'Cliente'
  );
  const cascadeClientId = cascadeClient.userId;
  const cascadeAuth = cascadeClient.auth;

  await client.insertUserSubscription(
    { id: cascadeClientId, product_id: 'prod_client_monthly', subscription_id: 'sub_cascade' },
    cascadeAuth
  );

  // Create 2 entries for cascade client
  const e1 = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: { title: 'Cascade 1' },
    headers: cascadeAuth,
  });
  const e2 = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: { title: 'Cascade 2' },
    headers: cascadeAuth,
  });
  const e1Id = e1.data?.data?.id;
  const e2Id = e2.data?.data?.id;

  // Delete user profile directly (mimicking account termination)
  await supabaseAdmin.from('user_profiles').delete().eq('id', cascadeClientId);
  await supabaseAdmin.auth.admin.deleteUser(cascadeClientId);

  // Verify tattoo_progress entries were cascaded
  const { data: cascadedEntries } = await supabaseAdmin
    .from('tattoo_progress')
    .select('id')
    .in('id', [e1Id, e2Id]);

  record(
    'CASCADE-01',
    'Database Constraints',
    'Deleting user_profile triggers ON DELETE CASCADE on public.tattoo_progress',
    cascadedEntries?.length === 0,
    '0 rows remaining (cascaded)',
    `${cascadedEntries?.length || 0} rows found`
  );

  // 7.2 Test ON DELETE SET NULL on artist_id
  console.log('Testing ON DELETE SET NULL on artist_id...');
  const tempArtist = await registerAndAuth(
    generateTestEmail('temp_artist'),
    password,
    'TempArtist',
    'Tatuador'
  );
  const tempArtistId = tempArtist.userId;

  // Client A creates progress tagged with temp artist
  const taggedEntryRes = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: {
      artist_id: tempArtistId,
      title: 'Tagged to Temp Artist',
    },
    headers: clientAAuth,
  });
  const taggedEntryId = taggedEntryRes.data?.data?.id;

  // Delete temp artist
  await supabaseAdmin.from('user_profiles').delete().eq('id', tempArtistId);
  await supabaseAdmin.auth.admin.deleteUser(tempArtistId);

  // Check tagged entry: should STILL exist, with artist_id set to NULL
  const { data: setNullEntry } = await supabaseAdmin
    .from('tattoo_progress')
    .select('id, client_id, artist_id')
    .eq('id', taggedEntryId)
    .single();

  record(
    'CASCADE-02',
    'Database Constraints',
    'Deleting artist triggers ON DELETE SET NULL; entry preserved with artist_id=null',
    setNullEntry?.id === taggedEntryId && setNullEntry?.artist_id === null,
    `Entry preserved, artist_id=null`,
    `id=${setNullEntry?.id}, artist_id=${setNullEntry?.artist_id}`
  );

  // =========================================================================
  // CATEGORY 8: Storage RLS Security & Directory Boundary Policies
  // =========================================================================
  console.log('\n--- CATEGORY 8: Storage RLS Directory Boundaries ---');

  // 8.1 Anonymous (unauthenticated) upload blocked by RLS
  const anonClient = createScopedClient(); // Unauthenticated client
  const anonUploadRes = await anonClient.storage
    .from('tattoo-progress')
    .upload(`anon-test-${Date.now()}.png`, fileBuf, { contentType: 'image/png' });
  record(
    'STOR-RLS-01',
    'Storage Security',
    'Anonymous upload to tattoo-progress bucket rejected by RLS',
    anonUploadRes.error !== null,
    'RLS policy violation error',
    anonUploadRes.error ? anonUploadRes.error.message : 'UNPROTECTED_UPLOAD'
  );

  // 8.2 Client A trying to upload into Client B folder using Client A's JWT token
  const clientAScoped = createScopedClient(clientAToken);
  const crossUploadPath = `${clientBId}/malicious-injected-${Date.now()}.png`;
  const crossUploadRes = await clientAScoped.storage
    .from('tattoo-progress')
    .upload(crossUploadPath, fileBuf, { contentType: 'image/png' });
  record(
    'STOR-RLS-02',
    'Storage Security',
    "Client A cannot upload to Client B's folder (RLS check on folder prefix)",
    crossUploadRes.error !== null,
    'RLS policy violation error',
    crossUploadRes.error ? crossUploadRes.error.message : 'UNPROTECTED_CROSS_UPLOAD'
  );

  // 8.3 Client A uploading to their own folder (${clientAId}/*) succeeds
  const legitUploadPath = `${clientAId}/legit-upload-${Date.now()}.png`;
  const legitUploadRes = await clientAScoped.storage
    .from('tattoo-progress')
    .upload(legitUploadPath, fileBuf, { contentType: 'image/png' });
  record(
    'STOR-RLS-03',
    'Storage Security',
    "Client A uploading to their own folder (${auth.uid()}/*) succeeds under RLS",
    legitUploadRes.error === null && !!legitUploadRes.data?.path,
    'Upload success',
    legitUploadRes.error ? legitUploadRes.error.message : legitUploadRes.data?.path
  );

  // 8.4 Client B trying to delete Client A's legitimate file using Client B's JWT token
  const clientBScoped = createScopedClient(clientBToken);
  const crossDeleteStorageRes = await clientBScoped.storage
    .from('tattoo-progress')
    .remove([legitUploadPath]);
  // Verify file was NOT removed
  const { data: legitCheck } = await supabaseAdmin.storage
    .from('tattoo-progress')
    .list(clientAId);
  const legitStillHere = legitCheck?.some((f) => legitUploadPath.endsWith(f.name));
  record(
    'STOR-RLS-04',
    'Storage Security',
    "Client B cannot delete Client A's file from storage bucket",
    legitStillHere === true,
    'File remains intact (unauthorized delete blocked)',
    legitStillHere ? 'INTACT' : 'DELETED_UNAUTHORIZED'
  );

  // Clean up legitimate test file
  await supabaseAdmin.storage.from('tattoo-progress').remove([legitUploadPath]);

  // Clean up test accounts
  await supabaseAdmin.auth.admin.deleteUser(clientAId);
  await supabaseAdmin.auth.admin.deleteUser(clientBId);
  await supabaseAdmin.auth.admin.deleteUser(artistXId);
  await supabaseAdmin.auth.admin.deleteUser(artistYId);

  // =========================================================================
  // SUMMARY & VERDICT
  // =========================================================================
  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = totalTests - passedTests;

  console.log('\n========================================================================');
  console.log(`  ADVERSARIAL STRESS TEST SUMMARY: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('========================================================================');

  if (failedTests > 0) {
    console.error(`\n❌ VERDICT: REJECT (${failedTests} adversarial tests failed)`);
    process.exit(1);
  } else {
    console.log(`\n✅ VERDICT: APPROVE (All ${totalTests} adversarial stress tests passed)`);
    process.exit(0);
  }
}

runAdversarialHarness().catch((err) => {
  console.error('Fatal Harness Failure:', err);
  process.exit(1);
});
