import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
const parsed = dotenv.config({ path: envPath, override: true }).parsed;

const supabaseUrl = parsed.SUPABASE_URL || parsed.SUPABASEURL;
const supabaseKey = parsed.SERVICE_ROLE_KEY || parsed.SUPABASE_SERVICE_ROLE_KEY;

console.log('Targeting:', supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing keys in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser(email, password, fullName, role) {
  console.log('Setting up test user: ' + email + ' (' + role + ')');
  
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  let user = users?.find(u => u.email === email);
  
  if (!user) {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role, tipo: role, preferred_language: 'es' }
    });
    if (createError) {
      console.error('Error creating ' + email + ':', createError);
      return;
    }
    user = newUser.user;
    console.log('Created auth user ' + user.id);
  } else {
    console.log('User ' + email + ' already exists: ' + user.id);
  }

  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      role: role,
      full_name: fullName,
      is_test_account: true,
      is_verified: true,
      onboarding_completed: true,
      legal_accepted: true,
      legal_accepted_at: new Date().toISOString()
    });

  if (profileError) {
    console.error('Error upserting profile for ' + email + ':', profileError);
  } else {
    console.log('Successfully sandboxed ' + email + ' as test account.\n');
  }
}

async function main() {
  await createTestUser('tatuadortest2@tattooshop.com', 'TattooTest2026!Secure', 'Tatuador Test Hub', 'Tatuador');
  await createTestUser('clientetest@tattooshop.com', 'TattooTest2026!Secure', 'Cliente Test Hub', 'Cliente');
  console.log('Test users isolated successfully.');
}

main();
