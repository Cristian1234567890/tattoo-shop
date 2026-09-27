const path = require('path');
const supabasePath = path.resolve(__dirname, '../../backend/backend/node_modules/@supabase/supabase-js');
const { createClient } = require(supabasePath);

const OLD_URL = 'https://unsftvudwxwbzwekokgr.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuc2Z0dnVkd3h3Ynp3ZWtva2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk2NDIwNDUsImV4cCI6MjAwNTIxODA0NX0._5Bn2xUpgN3vcijsWeZWYFHClrp9skIGx_NzCqXGDew';

const supabase = createClient(OLD_URL, OLD_KEY);

async function checkOld() {
  console.log('Testing connection to old Supabase...');
  try {
    const { data: buckets, error: bError } = await supabase.storage.listBuckets();
    console.log('Buckets:', buckets, 'Error:', bError);

    const { data: tData, error: tError } = await supabase.from('tatuadores_data').select('*').limit(3);
    console.log('tatuadores_data:', JSON.stringify(tData, null, 2), 'Error:', tError);

    const { data: sData, error: sError } = await supabase.from('user_subscription').select('*').limit(3);
    console.log('user_subscription:', JSON.stringify(sData, null, 2), 'Error:', sError);
  } catch (err) {
    console.error('Exception:', err);
  }
}

checkOld();
