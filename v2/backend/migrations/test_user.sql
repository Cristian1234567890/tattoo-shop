INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, app_metadata, user_metadata, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'test_tatuador@tattooshop.com', crypt('Tattoo123!', gen_salt('bf')), now(), NULL, now(), '{"provider":"email","providers":["email"]}', '{"role":"tatuador","full_name":"Test Tatuador","onboarding_completed":true,"legal_accepted":true}', now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (id, role, full_name, is_verified, created_at, updated_at, legal_accepted, onboarding_completed, subscription_status)
VALUES
('11111111-1111-1111-1111-111111111111', 'tatuador', 'Test Tatuador', true, now(), now(), true, true, 'active')
ON CONFLICT (id) DO UPDATE SET role = 'tatuador';
