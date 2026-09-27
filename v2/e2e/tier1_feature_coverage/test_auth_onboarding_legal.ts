/**
 * Tier 1: Feature Coverage - Dynamic Redirection, Legal Acceptance, Intercepted Onboarding & DB Persistence
 * Verifies Requirements R1, R2, R3, R4 from ORIGINAL_REQUEST.md.
 * Includes both DOM/static structural assertions and live network API verification.
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { DomValidator } from '../framework/dom_validator.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail } from '../config.ts';
import fs from 'node:fs';
import path from 'node:path';

export function registerAuthOnboardingLegalTests(validator: DomValidator, client?: ApiClient) {
  setTier('Tier 1 - Feature Coverage');

  describe('Feature: Post-login Redirections, Legal Acceptance & Onboarding (R1-R4)', () => {
    const frontendDir = validator.getFrontendRoot();
    const backendMigrationsDir = path.resolve(frontendDir, '../backend/migrations');
    const backendSrcDir = path.resolve(frontendDir, '../backend/src');

    // R1: Dynamic Origin Redirection
    it('TC-R1-REDIRECTION: Google OAuth and manual login redirect to /user using dynamic window.location.origin', () => {
      const loginPagePath = path.join(frontendDir, 'src/pages/LoginPage.tsx');
      expect(fs.existsSync(loginPagePath)).toBe(true);

      const loginContent = fs.readFileSync(loginPagePath, 'utf-8');

      // Must use window.location.origin dynamically for redirectTo
      expect(loginContent.includes('window.location.origin')).toBe(true);
      expect(loginContent.includes('/user')).toBe(true);

      // Must not redirect to /hub or have hardcoded localhost in OAuth redirect
      expect(loginContent.includes("redirectTo: window.location.origin + '/hub'")).toBe(false);
      expect(loginContent.includes("navigate('/hub')")).toBe(false);

      // Manual login OTP verification must also route to /user
      expect(loginContent).toMatch(/navigate\(['"]\/user['"]\)/);
    });

    // R2: Legal Acceptance in Manual Registration
    it('TC-R2-LEGAL-REGISTRATION: RegisterPage contains mandatory Terms & Privacy checkboxes and passes acceptance data', () => {
      const registerPagePath = path.join(frontendDir, 'src/pages/RegisterPage.tsx');
      expect(fs.existsSync(registerPagePath)).toBe(true);

      const registerContent = fs.readFileSync(registerPagePath, 'utf-8');

      // Must have state for terms and privacy
      expect(registerContent.includes('termsAccepted')).toBe(true);
      expect(registerContent.includes('privacyAccepted')).toBe(true);

      // Must include mandatory checkbox elements and legal links
      expect(registerContent.includes('termsCheckbox')).toBe(true);
      expect(registerContent.includes('privacyCheckbox')).toBe(true);
      expect(registerContent.includes('/legal/terms')).toBe(true);
      expect(registerContent.includes('/legal/privacy')).toBe(true);

      // Must validate that terms are accepted before submitting
      expect(registerContent).toMatch(/!termsAccepted\s*\|\|\s*!privacyAccepted/);

      // Must pass legal_accepted data to api.register
      expect(registerContent.includes('legal_accepted:')).toBe(true);
      expect(registerContent.includes('legal_accepted_at:')).toBe(true);
    });

    // R3: Intercepted Onboarding for Google Auth & Missing Profile
    it('TC-R3-INTERCEPTED-ONBOARDING: OnboardingModal requires role selection and mandatory legal acceptance', () => {
      const onboardingModalPath = path.join(frontendDir, 'src/components/auth/OnboardingModal.tsx');
      expect(fs.existsSync(onboardingModalPath)).toBe(true);

      const modalContent = fs.readFileSync(onboardingModalPath, 'utf-8');

      // Role selection for Cliente and Tatuador
      expect(modalContent.includes('Cliente')).toBe(true);
      expect(modalContent.includes('Tatuador')).toBe(true);

      // Mandatory legal checkboxes
      expect(modalContent.includes('onboardingTermsCheckbox')).toBe(true);
      expect(modalContent.includes('onboardingPrivacyCheckbox')).toBe(true);
      expect(modalContent.includes('/legal/terms')).toBe(true);
      expect(modalContent.includes('/legal/privacy')).toBe(true);

      // Submit requires both role and legal acceptance
      expect(modalContent).toMatch(/!role\s*\|\|\s*!termsAccepted\s*\|\|\s*!privacyAccepted/);

      // DashboardPage mounts OnboardingModal and checks onboarding status
      const dashboardPagePath = path.join(frontendDir, 'src/pages/DashboardPage.tsx');
      expect(fs.existsSync(dashboardPagePath)).toBe(true);

      const dashboardContent = fs.readFileSync(dashboardPagePath, 'utf-8');
      expect(dashboardContent.includes('OnboardingModal')).toBe(true);
      expect(dashboardContent.includes('onboarding_completed')).toBe(true);
      expect(dashboardContent.includes('legal_accepted')).toBe(true);
    });

    // R3: Global Route Protection Against Direct URL Manipulation
    it('TC-R3-GLOBAL-ONBOARDING-GATE: App routes are guarded by OnboardingGate preventing bypass via direct URL manipulation', () => {
      const appPath = path.join(frontendDir, 'src/App.tsx');
      expect(fs.existsSync(appPath)).toBe(true);

      const appContent = fs.readFileSync(appPath, 'utf-8');
      expect(appContent.includes('OnboardingGate')).toBe(true);
      expect(appContent.includes('hasCompletedOnboarding')).toBe(true);
      expect(appContent.includes('/legal/terms')).toBe(true);
      expect(appContent.includes('/legal/privacy')).toBe(true);
    });

    // R4: Database Persistence (public.user_profiles)
    it('TC-R4-DB-MIGRATION-SCHEMA: Supabase migration defines public.user_profiles with all required audit and role columns', () => {
      const migrationFile = path.join(backendMigrationsDir, '03_user_profiles.sql');
      expect(fs.existsSync(migrationFile)).toBe(true);

      const sqlContent = fs.readFileSync(migrationFile, 'utf-8');

      // Table public.user_profiles linked to auth.users
      expect(sqlContent.includes('public.user_profiles')).toBe(true);
      expect(sqlContent.includes('REFERENCES auth.users(id)')).toBe(true);

      // Required schema columns
      const requiredColumns = [
        'role',
        'legal_accepted',
        'legal_accepted_at',
        'full_name',
        'avatar_url',
        'phone_number',
        'is_verified',
        'onboarding_completed',
      ];

      for (const col of requiredColumns) {
        expect(sqlContent.toLowerCase().includes(col.toLowerCase())).toBe(true);
      }

      // RLS enabled and policies defined
      expect(sqlContent.includes('ENABLE ROW LEVEL SECURITY')).toBe(true);
      expect(sqlContent.includes('CREATE POLICY')).toBe(true);
    });

    // R4: Backend Service & Route Persistence
    it('TC-R4-BACKEND-PERSISTENCE: Backend auth and user services persist legal audit fields and role', () => {
      const authServicePath = path.join(backendSrcDir, 'services/auth.service.ts');
      const userServicePath = path.join(backendSrcDir, 'services/user.service.ts');
      const userRoutesPath = path.join(backendSrcDir, 'routes/user.routes.ts');

      expect(fs.existsSync(authServicePath)).toBe(true);
      expect(fs.existsSync(userServicePath)).toBe(true);
      expect(fs.existsSync(userRoutesPath)).toBe(true);

      const authContent = fs.readFileSync(authServicePath, 'utf-8');
      const userContent = fs.readFileSync(userServicePath, 'utf-8');
      const routesContent = fs.readFileSync(userRoutesPath, 'utf-8');

      // auth.service saves user_profiles on signUp
      expect(authContent.includes('user_profiles')).toBe(true);
      expect(authContent.includes('legal_accepted')).toBe(true);
      expect(authContent.includes('legal_accepted_at')).toBe(true);

      // user.service provides completeOnboarding and user_profiles sync
      expect(userContent.includes('completeOnboarding')).toBe(true);
      expect(userContent.includes('user_profiles')).toBe(true);

      // user routes register /complete-onboarding and /userprofile
      expect(routesContent.includes('/complete-onboarding')).toBe(true);
      expect(routesContent.includes('/userprofile')).toBe(true);
    });

    // Live API Deep Verification (when running against live backend)
    if (client) {
      it('TC-R2-LIVE-REJECT-NO-LEGAL: Registration explicitly rejecting legal terms is rejected with HTTP 400', async () => {
        const email = generateTestEmail('reject_legal');
        const res = await client.register({
          email,
          password: 'Password123!',
          nombre: 'Rebel',
          apellido: 'NoLegal',
          tipo: 'Cliente',
          legal_accepted: false,
        });

        expect(res.data.success).toBe(false);
        expect(res.data.error).toBeDefined();
        const msg = typeof res.data.error === 'object' ? res.data.error.message : res.data.error;
        expect(msg.toLowerCase().includes('términos') || msg.toLowerCase().includes('legal')).toBe(true);
      });

      it('TC-R2-LIVE-ACCEPT-LEGAL: Registration with legal acceptance sets audit timestamps and completed onboarding', async () => {
        const email = generateTestEmail('accept_legal');
        const res = await client.register({
          email,
          password: 'Password123!',
          nombre: 'Good',
          apellido: 'Citizen',
          tipo: 'Cliente',
          legal_accepted: true,
          legal_accepted_at: new Date().toISOString(),
        });

        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(res.data.data.user.user_metadata.legal_accepted).toBe(true);
        expect(res.data.data.user.user_metadata.legal_accepted_at).toBeDefined();
        expect(res.data.data.user.user_metadata.onboarding_completed).toBe(true);
      });

      it('TC-R3-LIVE-ONBOARDING-UNAUTHORIZED: POST /complete-onboarding without auth token returns HTTP 401', async () => {
        const res = await client.completeOnboarding({
          role: 'Cliente',
          legal_accepted: true,
        });
        expect(res.status).toBe(401);
      });

      it('TC-R3-LIVE-ONBOARDING-INVALID-ROLE: POST /complete-onboarding with invalid role is rejected with HTTP 400', async () => {
        const email = generateTestEmail('onb_bad_role');
        const reg = await client.register({
          email,
          password: 'Password123!',
          legal_accepted: true,
        });
        const token = reg.data.data.session.access_token;

        const res = await client.completeOnboarding(
          { role: 'Admin', legal_accepted: true },
          { Authorization: `Bearer ${token}` }
        );
        expect(res.data.success).toBe(false);
        const msg = typeof res.data.error === 'object' ? res.data.error.message : res.data.error;
        expect(msg.includes('Cliente o Tatuador')).toBe(true);
      });

      it('TC-R3-LIVE-ONBOARDING-REJECT-NO-TERMS: POST /complete-onboarding with legal_accepted: false is rejected', async () => {
        const email = generateTestEmail('onb_no_terms');
        const reg = await client.register({
          email,
          password: 'Password123!',
          legal_accepted: true,
        });
        const token = reg.data.data.session.access_token;

        const res = await client.completeOnboarding(
          { role: 'Cliente', legal_accepted: false },
          { Authorization: `Bearer ${token}` }
        );
        expect(res.data.success).toBe(false);
        const msg = typeof res.data.error === 'object' ? res.data.error.message : res.data.error;
        expect(msg.includes('Términos')).toBe(true);
      });

      it('TC-R3-LIVE-ONBOARDING-COMPLETE & TC-R4-LIVE-PROFILE-QUERY: Successfully completes onboarding and persists profile queryable via GET /userprofile', async () => {
        const email = generateTestEmail('onb_success');
        const reg = await client.register({
          email,
          password: 'Password123!',
          legal_accepted: true,
        });
        const token = reg.data.data.session.access_token;
        const legalTimestamp = new Date().toISOString();

        // Complete onboarding as Tatuador
        const onbRes = await client.completeOnboarding(
          {
            role: 'Tatuador',
            legal_accepted: true,
            legal_accepted_at: legalTimestamp,
            full_name: 'Artista Pro',
            phone_number: '+507 6888-9999',
          },
          { Authorization: `Bearer ${token}` }
        );

        expect(onbRes.status).toBe(200);
        expect(onbRes.data.success).toBe(true);
        expect(onbRes.data.data.profile.role).toBe('Tatuador');
        expect(onbRes.data.data.profile.legal_accepted).toBe(true);
        expect(onbRes.data.data.profile.onboarding_completed).toBe(true);

        // Verify profile query
        const profileRes = await client.getUserProfile({ Authorization: `Bearer ${token}` });
        expect(profileRes.status).toBe(200);
        expect(profileRes.data.success).toBe(true);
        expect(profileRes.data.data.role).toBe('Tatuador');
        expect(profileRes.data.data.legal_accepted).toBe(true);
        expect(profileRes.data.data.onboarding_completed).toBe(true);
        expect(profileRes.data.data.full_name).toBe('Artista Pro');
        expect(profileRes.data.data.phone_number).toBe('+507 6888-9999');
      });

      it('TC-R4-LIVE-PROFILE-UNAUTHORIZED: GET /userprofile without token is rejected with HTTP 401', async () => {
        const res = await client.getUserProfile();
        expect(res.status).toBe(401);
      });

      it('TC-R2-LIVE-REJECT-FALSY-LEGAL: Registration with null or zero legal_accepted is rejected with HTTP 400', async () => {
        const email = generateTestEmail('reject_falsy');
        const res = await client.register({
          email,
          password: 'Password123!',
          nombre: 'Null',
          apellido: 'Legal',
          tipo: 'Cliente',
          legal_accepted: null,
        });

        expect(res.data.success).toBe(false);
        expect(res.data.error).toBeDefined();
        const msg = typeof res.data.error === 'object' ? res.data.error.message : res.data.error;
        expect(msg.toLowerCase().includes('términos') || msg.toLowerCase().includes('legal')).toBe(true);
      });

      it('TC-R3-LIVE-ONBOARDING-IDEMPOTENCY: Repeated onboarding submissions succeed and preserve original legal audit timestamp', async () => {
        const email = generateTestEmail('onb_idempotent');
        const reg = await client.register({
          email,
          password: 'Password123!',
        });
        const token = reg.data.data.session.access_token;
        const initialTimestamp = '2026-01-01T12:00:00.000Z';

        // First onboarding submission
        const res1 = await client.completeOnboarding(
          {
            role: 'Cliente',
            legal_accepted: true,
            legal_accepted_at: initialTimestamp,
            full_name: 'Initial Name',
          },
          { Authorization: `Bearer ${token}` }
        );
        expect(res1.status).toBe(200);
        expect(res1.data.success).toBe(true);
        expect(res1.data.data.profile.legal_accepted_at).toBe(initialTimestamp);

        // Second onboarding submission (e.g. updating profile details)
        const laterTimestamp = '2026-09-27T12:00:00.000Z';
        const res2 = await client.completeOnboarding(
          {
            role: 'Cliente',
            legal_accepted: true,
            legal_accepted_at: laterTimestamp,
            full_name: 'Updated Name',
          },
          { Authorization: `Bearer ${token}` }
        );
        expect(res2.status).toBe(200);
        expect(res2.data.success).toBe(true);
        // Original acceptance audit timestamp must be preserved
        expect(res2.data.data.profile.legal_accepted_at).toBe(initialTimestamp);
      });

      it('TC-R4-LIVE-UPDATEUSER-SAFE-ROLE: Arbitrary role values passed to /updateuser are safely filtered without constraint errors', async () => {
        const email = generateTestEmail('update_safe_role');
        const reg = await client.register({
          email,
          password: 'Password123!',
          legal_accepted: true,
          tipo: 'Cliente',
        });
        const token = reg.data.data.session.access_token;

        const updateRes = await client.updateUser(
          { role: 'InvalidNonExistentRole', nombre: 'UpdatedNombre' },
          { Authorization: `Bearer ${token}` }
        );
        expect(updateRes.status).toBe(200);
        expect(updateRes.data.success).toBe(true);

        const profileRes = await client.getUserProfile({ Authorization: `Bearer ${token}` });
        expect(profileRes.status).toBe(200);
        expect(profileRes.data.success).toBe(true);
        // Role must not be set to 'InvalidNonExistentRole'
        expect(profileRes.data.data.role).not.toBe('InvalidNonExistentRole');
      });
    }
  });
}
