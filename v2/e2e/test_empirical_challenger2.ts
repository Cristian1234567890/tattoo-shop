import { ApiClient } from './framework/api_client.ts';
import { generateTestEmail, SAMPLE_BASE64_IMAGE, CONFIG } from './config.ts';
import { supabaseAdmin } from '../backend/src/config/supabase.ts';

interface VerificationResult {
  step: string;
  expected: string;
  actual: string;
  passed: boolean;
  details?: any;
}

const results: VerificationResult[] = [];

function record(step: string, expected: string, actual: string, passed: boolean, details?: any) {
  results.push({ step, expected, actual, passed, details });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${mark} | ${step}`);
  console.log(`   Expected: ${expected}`);
  console.log(`   Actual:   ${actual}`);
  if (details) console.log(`   Details:  ${JSON.stringify(details)}`);
}

async function runEmpiricalVerification() {
  const client = new ApiClient(CONFIG.baseUrl);
  console.log('======================================================================');
  console.log('  CHALLENGER 2: EMPIRICAL VERIFICATION HARNESS');
  console.log('  Subscription Enforcement, 90-Day Boundaries & Premium Gating');
  console.log('======================================================================\n');

  // =========================================================================
  // TEST SUITE 1: Artist 90-Day Trial Mathematical Boundaries
  // =========================================================================
  console.log('--- TEST SUITE 1: Artist 90-Day Trial Mathematical Boundaries ---');
  const artistEmail = generateTestEmail('artist_boundary');
  const password = 'Password123!';

  const regArtist = await client.register({
    email: artistEmail,
    password,
    nombre: 'BoundaryArtist',
    apellido: 'Test',
    tipo: 'Tatuador',
    legal_accepted: true,
  });

  const artistId = regArtist.data.data.user.id;
  const artistToken = regArtist.data.data.session.access_token;
  const artistAuth = { Authorization: `Bearer ${artistToken}` };

  // Case 1.1: Day 89 Allowed (diffDays = 89)
  console.log('\n[Case 1.1] Testing Day 89 Boundary (diffDays = 89)...');
  await client.backdateUserProfile(artistId, 88.5);
  const day89Profile = await client.getUserProfile(artistAuth);
  const day89ImgRes = await client.updateUserImg({ imageData: SAMPLE_BASE64_IMAGE }, artistAuth);
  
  record(
    'Artist Day 89: GET /userprofile trial status (diffDays=89)',
    'is_trial_active=true, trial_expired=false, trial_days_remaining=1',
    `is_trial_active=${day89Profile.data?.data?.is_trial_active}, trial_expired=${day89Profile.data?.data?.trial_expired}, remaining=${day89Profile.data?.data?.trial_days_remaining}`,
    day89Profile.status === 200 &&
      day89Profile.data?.data?.is_trial_active === true &&
      day89Profile.data?.data?.trial_expired === false &&
      day89Profile.data?.data?.trial_days_remaining === 1
  );

  record(
    'Artist Day 89: POST /updateuserimg (Commercial Feature Access)',
    'HTTP 200 (allowed)',
    `HTTP ${day89ImgRes.status}`,
    day89ImgRes.status === 200
  );

  // Case 1.2: Day 90 Exact Boundary Allowed (diffDays = 90)
  console.log('\n[Case 1.2] Testing Day 90 Exact Boundary (diffDays = 90)...');
  await client.backdateUserProfile(artistId, 89.5);
  const day90Profile = await client.getUserProfile(artistAuth);
  const day90ImgRes = await client.updateUserImg({ imageData: SAMPLE_BASE64_IMAGE }, artistAuth);

  record(
    'Artist Day 90: GET /userprofile trial status (Exact Boundary diffDays=90)',
    'is_trial_active=true, trial_expired=false, trial_days_remaining=0',
    `is_trial_active=${day90Profile.data?.data?.is_trial_active}, trial_expired=${day90Profile.data?.data?.trial_expired}, remaining=${day90Profile.data?.data?.trial_days_remaining}`,
    day90Profile.status === 200 &&
      day90Profile.data?.data?.is_trial_active === true &&
      day90Profile.data?.data?.trial_expired === false &&
      day90Profile.data?.data?.trial_days_remaining === 0
  );

  record(
    'Artist Day 90: POST /updateuserimg (Exact Boundary Commercial Access)',
    'HTTP 200 (allowed)',
    `HTTP ${day90ImgRes.status}`,
    day90ImgRes.status === 200
  );

  // Case 1.3: Day 91 First Expired Day Blocked (diffDays = 91, HTTP 403 SUBSCRIPTION_REQUIRED)
  console.log('\n[Case 1.3] Testing Day 91 Lockout Boundary (diffDays = 91)...');
  await client.backdateUserProfile(artistId, 91);
  const day91Profile = await client.getUserProfile(artistAuth);
  const day91ImgRes = await client.updateUserImg({ imageData: SAMPLE_BASE64_IMAGE }, artistAuth);

  record(
    'Artist Day 91: GET /userprofile trial status (Expired Lockout)',
    'is_trial_active=false, trial_expired=true, trial_days_remaining=0',
    `is_trial_active=${day91Profile.data?.data?.is_trial_active}, trial_expired=${day91Profile.data?.data?.trial_expired}, remaining=${day91Profile.data?.data?.trial_days_remaining}`,
    day91Profile.status === 200 &&
      day91Profile.data?.data?.is_trial_active === false &&
      day91Profile.data?.data?.trial_expired === true &&
      day91Profile.data?.data?.trial_days_remaining === 0
  );

  record(
    'Artist Day 91: POST /updateuserimg (Commercial Feature Lockout)',
    'HTTP 403, code=SUBSCRIPTION_REQUIRED, trial_expired=true',
    `HTTP ${day91ImgRes.status}, code=${day91ImgRes.data?.code}, trial_expired=${day91ImgRes.data?.trial_expired}`,
    day91ImgRes.status === 403 &&
      day91ImgRes.data?.code === 'SUBSCRIPTION_REQUIRED' &&
      day91ImgRes.data?.trial_expired === true
  );

  // Case 1.4: Day 91 With Active Subscription Allowed
  console.log('\n[Case 1.4] Testing Day 91 with Active Subscription...');
  // Activate subscription via insertUserSubscription (checkout simulation)
  const artistSubRes = await client.insertUserSubscription(
    {
      id: artistId,
      product_id: 'prod_artist_annual',
      subscription_id: 'sub_artist_12345',
    },
    artistAuth
  );

  const day91SubProfile = await client.getUserProfile(artistAuth);
  const day91SubImgRes = await client.updateUserImg({ imageData: SAMPLE_BASE64_IMAGE }, artistAuth);

  record(
    'Artist Day 91 + Subscription: GET /userprofile',
    'has_active_subscription=true, trial_expired=false',
    `has_active_subscription=${day91SubProfile.data?.data?.has_active_subscription}, trial_expired=${day91SubProfile.data?.data?.trial_expired}`,
    day91SubProfile.status === 200 &&
      day91SubProfile.data?.data?.has_active_subscription === true &&
      day91SubProfile.data?.data?.trial_expired === false
  );

  record(
    'Artist Day 91 + Subscription: POST /updateuserimg (Commercial Access Restored)',
    'HTTP 200 (allowed with active subscription)',
    `HTTP ${day91SubImgRes.status}`,
    day91SubImgRes.status === 200
  );

  // =========================================================================
  // TEST SUITE 2: Client Premium Gating
  // =========================================================================
  console.log('\n--- TEST SUITE 2: Client Premium Gating ---');
  const clientEmail = generateTestEmail('client_gating');

  const regClient = await client.register({
    email: clientEmail,
    password,
    nombre: 'PremiumGate',
    apellido: 'Client',
    tipo: 'Cliente',
    legal_accepted: true,
  });

  const clientId = regClient.data.data.user.id;
  const clientToken = regClient.data.data.session.access_token;
  const clientAuth = { Authorization: `Bearer ${clientToken}` };

  // Case 2.1: Standard Client General Platform Access Unhindered
  console.log('\n[Case 2.1] Testing Standard Client General Access...');
  const clientProfileRes = await client.getUserProfile(clientAuth);
  const clientCatalogRes = await client.getTatto(clientAuth);

  record(
    'Client Standard: GET /userprofile general access',
    'HTTP 200, role=Cliente, has_active_subscription=false',
    `HTTP ${clientProfileRes.status}, role=${clientProfileRes.data?.data?.role}, sub=${clientProfileRes.data?.data?.has_active_subscription}`,
    clientProfileRes.status === 200 &&
      clientProfileRes.data?.data?.role === 'Cliente' &&
      clientProfileRes.data?.data?.has_active_subscription === false
  );

  record(
    'Client Standard: GET /gettatto catalog view',
    'HTTP 200 (unrestricted public/client access)',
    `HTTP ${clientCatalogRes.status}`,
    clientCatalogRes.status === 200
  );

  // Case 2.2: Standard Client Blocked on Premium Endpoints (HTTP 403 CLIENT_PREMIUM_REQUIRED)
  console.log('\n[Case 2.2] Testing Standard Client Premium Action Block...');
  const premActionRes1 = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: { tattooId: 'tat_001', notes: 'Healing test' },
    headers: clientAuth,
  });

  const premActionRes2 = await client.request('/client/tattoo-progress', {
    method: 'POST',
    body: { tattooId: 'tat_001', notes: 'Healing test' },
    headers: clientAuth,
  });

  record(
    'Client Standard: POST /api/client/tattoo-progress without subscription',
    'HTTP 403, code=CLIENT_PREMIUM_REQUIRED',
    `HTTP ${premActionRes1.status}, code=${premActionRes1.data?.code}`,
    premActionRes1.status === 403 && premActionRes1.data?.code === 'CLIENT_PREMIUM_REQUIRED'
  );

  record(
    'Client Standard: POST /client/tattoo-progress without subscription',
    'HTTP 403, code=CLIENT_PREMIUM_REQUIRED',
    `HTTP ${premActionRes2.status}, code=${premActionRes2.data?.code}`,
    premActionRes2.status === 403 && premActionRes2.data?.code === 'CLIENT_PREMIUM_REQUIRED'
  );

  // Case 2.3: Client Subscription Activation & Premium Unlocked
  console.log('\n[Case 2.3] Testing Client Subscription Activation & Unlocked Premium...');
  const clientSubRes = await client.insertUserSubscription(
    {
      id: clientId,
      product_id: 'prod_client_monthly',
      subscription_id: 'sub_client_99999',
    },
    clientAuth
  );

  record(
    'Client Checkout: POST /usersubscription activation',
    'HTTP 200, success=true',
    `HTTP ${clientSubRes.status}, success=${clientSubRes.data?.success}`,
    clientSubRes.status === 200 && clientSubRes.data?.success === true
  );

  // Verify premium actions allowed after subscription
  const premUnlockedRes1 = await client.request('/api/client/tattoo-progress', {
    method: 'POST',
    body: { tattooId: 'tat_001', notes: 'Healing day 4, looks great!' },
    headers: clientAuth,
  });

  const premUnlockedRes2 = await client.request('/client/tattoo-progress', {
    method: 'POST',
    body: { tattooId: 'tat_001', notes: 'Healing day 4, looks great!' },
    headers: clientAuth,
  });

  record(
    'Client Premium: POST /api/client/tattoo-progress with subscription',
    'HTTP 200, success=true',
    `HTTP ${premUnlockedRes1.status}, success=${premUnlockedRes1.data?.success}`,
    premUnlockedRes1.status === 200 && premUnlockedRes1.data?.success === true
  );

  record(
    'Client Premium: POST /client/tattoo-progress with subscription',
    'HTTP 200, success=true',
    `HTTP ${premUnlockedRes2.status}, success=${premUnlockedRes2.data?.success}`,
    premUnlockedRes2.status === 200 && premUnlockedRes2.data?.success === true
  );

  // =========================================================================
  // TEST SUITE 3: Database Verification (PostgreSQL / Supabase persistence)
  // =========================================================================
  console.log('\n--- TEST SUITE 3: Database Direct Persistence Verification ---');
  // Verify client record in public.user_profiles
  const { data: dbProfile, error: dbProfileErr } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', clientId)
    .single();

  record(
    'DB Check: public.user_profiles has_active_subscription flag',
    'has_active_subscription=true, paypal_subscription_id=sub_client_99999',
    `has_active_subscription=${dbProfile?.has_active_subscription}, paypal_sub=${dbProfile?.paypal_subscription_id}`,
    !dbProfileErr &&
      dbProfile?.has_active_subscription === true &&
      dbProfile?.paypal_subscription_id === 'sub_client_99999'
  );

  // Verify client record in public.user_subscription
  const { data: dbSub, error: dbSubErr } = await supabaseAdmin
    .from('user_subscription')
    .select('*')
    .eq('id', clientId);

  record(
    'DB Check: public.user_subscription table records',
    'Row exists with product_id=prod_client_monthly, subscription_id=sub_client_99999',
    `found ${dbSub?.length || 0} rows, subscription_id=${dbSub?.[0]?.subscription_id}`,
    !dbSubErr &&
      Array.isArray(dbSub) &&
      dbSub.length > 0 &&
      dbSub[0].subscription_id === 'sub_client_99999'
  );

  // =========================================================================
  // SUMMARY
  // =========================================================================
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  console.log('\n======================================================================');
  console.log(`  EMPIRICAL VERIFICATION HARNESS SUMMARY: ${passedCount}/${total} PASSED`);
  console.log('======================================================================');

  if (failedCount > 0) {
    console.error(`\n❌ VERDICT: REJECT (${failedCount} checks failed)`);
    process.exit(1);
  } else {
    console.log('\n✅ VERDICT: APPROVE (100% of mathematical boundaries and guards certified)');
    process.exit(0);
  }
}

runEmpiricalVerification().catch((err) => {
  console.error('Fatal Harness Failure:', err);
  process.exit(1);
});
