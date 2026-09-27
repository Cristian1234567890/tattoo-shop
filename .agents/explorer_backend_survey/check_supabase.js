const path = require('path');
const supabasePath = path.resolve(__dirname, '../../backend/backend/node_modules/@supabase/supabase-js');
const { createClient } = require(supabasePath);

const SUPABASE_URL = 'https://mftthukphffirdcoqprz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE5NjQ4NywiZXhwIjoyMTA1NzcyNDg3fQ.Q4VTaLcphMgsPltdtScZgoz0QKBuZprf18vjguqpadA';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function check() {
  console.log('Testing connection to Supabase...');
  try {
    const { data: buckets, error: bError } = await supabase.storage.listBuckets();
    console.log('Buckets:', buckets, 'Error:', bError);

    const { data: tData, error: tError } = await supabase.from('tatuadores_data').select('*').limit(5);
    console.log('tatuadores_data:', tData, 'Error:', tError);

    const { data: sData, error: sError } = await supabase.from('user_subscription').select('*').limit(5);
    console.log('user_subscription:', sData, 'Error:', sError);
  } catch (err) {
    console.error('Exception:', err);
  }
}

check();
