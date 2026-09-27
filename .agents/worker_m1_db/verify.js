const { createClient } = require('../../backend/backend/node_modules/@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = 'https://mftthukphffirdcoqprz.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxOTY0ODcsImV4cCI6MjEwNTc3MjQ4N30.m1Vv_bbOlYcWZMX0j5_og12eeQt3vAQIiYHos_o7vos';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE5NjQ4NywiZXhwIjoyMTA1NzcyNDg3fQ.Q4VTaLcphMgsPltdtScZgoz0QKBuZprf18vjguqpadA';

function httpGet(path, key) {
  return new Promise((resolve, reject) => {
    const req = https.request(SUPABASE_URL + path, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function verify() {
  console.log('=== VERIFYING SUPABASE REST API ===');

  // 1. REST tatuadores_data with ANON_KEY (public read test)
  const restTattooAnon = await httpGet('/rest/v1/tatuadores_data?select=*', ANON_KEY);
  console.log('[REST] GET /rest/v1/tatuadores_data (ANON_KEY):', restTattooAnon.status, restTattooAnon.data);
  if (restTattooAnon.status !== 200) throw new Error('tatuadores_data anon read failed: ' + restTattooAnon.status);

  // 2. REST tatuadores_data with SERVICE_ROLE_KEY
  const restTattooService = await httpGet('/rest/v1/tatuadores_data?select=*', SERVICE_ROLE_KEY);
  console.log('[REST] GET /rest/v1/tatuadores_data (SERVICE_ROLE_KEY):', restTattooService.status, restTattooService.data);
  if (restTattooService.status !== 200) throw new Error('tatuadores_data service read failed: ' + restTattooService.status);

  // 3. REST user_subscription with SERVICE_ROLE_KEY
  const restSubService = await httpGet('/rest/v1/user_subscription?select=*', SERVICE_ROLE_KEY);
  console.log('[REST] GET /rest/v1/user_subscription (SERVICE_ROLE_KEY):', restSubService.status, restSubService.data);
  if (restSubService.status !== 200) throw new Error('user_subscription service read failed: ' + restSubService.status);

  // 4. REST Storage Bucket user_profile
  const restBucket = await httpGet('/storage/v1/bucket/user_profile', SERVICE_ROLE_KEY);
  console.log('[REST] GET /storage/v1/bucket/user_profile (SERVICE_ROLE_KEY):', restBucket.status, restBucket.data);
  if (restBucket.status !== 200) throw new Error('user_profile bucket query failed: ' + restBucket.status);

  console.log('\n=== VERIFYING SUPABASE JS CLIENT ===');

  // Supabase Client with service_role key
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // Client query on tatuadores_data
  const { data: tattooData, error: tattooError } = await supabase.from('tatuadores_data').select('*');
  if (tattooError) throw new Error('supabase.from("tatuadores_data") error: ' + JSON.stringify(tattooError));
  console.log('[@supabase/supabase-js] tatuadores_data select:', tattooData);

  // Client query on user_subscription
  const { data: subData, error: subError } = await supabase.from('user_subscription').select('*');
  if (subError) throw new Error('supabase.from("user_subscription") error: ' + JSON.stringify(subError));
  console.log('[@supabase/supabase-js] user_subscription select:', subData);

  // Client query on storage
  const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('user_profile');
  if (bucketError) throw new Error('supabase.storage.getBucket("user_profile") error: ' + JSON.stringify(bucketError));
  console.log('[@supabase/supabase-js] storage.getBucket("user_profile"):', bucketData);

  const { data: fileList, error: fileListError } = await supabase.storage.from('user_profile').list();
  if (fileListError) throw new Error('supabase.storage.from("user_profile").list() error: ' + JSON.stringify(fileListError));
  console.log('[@supabase/supabase-js] storage.from("user_profile").list():', fileList);

  console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY (200 OK)!');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
