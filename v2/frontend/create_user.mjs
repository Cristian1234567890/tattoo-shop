import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mftthukphffirdcoqprz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE5NjQ4NywiZXhwIjoyMTA1NzcyNDg3fQ.Q4VTaLcphMgsPltdtScZgoz0QKBuZprf18vjguqpadA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'tatuador_test_xyz@tattooshop.com',
    password: 'Tattoo12345!',
    email_confirm: true,
    user_metadata: {
      role: 'tatuador',
      full_name: 'Test Tatuador V2',
      onboarding_completed: true,
      legal_accepted: true
    }
  });
  
  if (error) {
    console.error('Error creating user:', error);
  } else {
    console.log('Test user created successfully:', data.user.id);
    
    // Also update profile manually if triggers are slow
    await supabase.from('user_profiles').upsert({
      id: data.user.id,
      role: 'tatuador',
      full_name: 'Test Tatuador V2',
      is_verified: true,
      legal_accepted: true,
      onboarding_completed: true,
      subscription_status: 'active'
    });
    console.log('Profile updated.');
  }
}
createTestUser();
