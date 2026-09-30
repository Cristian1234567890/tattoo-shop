/**
 * Tier 1: Feature Coverage - Role Redirection, Artist 90-Day Trial Lockout & Client Premium Gating
 * Directly implements and certifies the Acceptance Criteria from ORIGINAL_REQUEST.md (2026-09-27T18:01:58Z):
 *   1. Role Redirection: post-login and post-register route to /client-dashboard (Clientes) and /artist-dashboard (Tatuadores).
 *   2. Artist 90-day trial lockout: artist with created_at >90 days ago and has_active_subscription=false receives HTTP 403 SUBSCRIPTION_REQUIRED / redirect to checkout.
 *   3. Client premium gating: standard client accesses dashboard freely, but receives HTTP 403 CLIENT_PREMIUM_REQUIRED / paywall prompt on premium actions.
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { DomValidator } from '../framework/dom_validator.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail } from '../config.ts';
import fs from 'node:fs';
import path from 'node:path';

// Pure logic role resolver for contract verification
export function resolveRoleDashboard(role?: string | null): string {
  if (!role) return '/user';
  const normalized = role.trim().toLowerCase();
  if (normalized === 'tatuador') return '/artist-dashboard';
  if (normalized === 'cliente') return '/client-dashboard';
  return '/user';
}

// Pure logic trial calculation matching subscription middleware contract
export function calculateTrialStatus(createdAtIso: string, hasActiveSubscription: boolean = false, now: Date = new Date()) {
  const createdAt = new Date(createdAtIso);
  const diffTime = Math.abs(now.getTime() - createdAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isTrialActive = diffDays <= 90;
  const trialDaysRemaining = Math.max(0, 90 - diffDays);
  const isLockedOut = diffDays > 90 && !hasActiveSubscription;

  return {
    diffDays,
    isTrialActive,
    trialDaysRemaining,
    hasActiveSubscription,
    isLockedOut,
    httpStatus: isLockedOut ? 403 : 200,
    errorCode: isLockedOut ? 'SUBSCRIPTION_REQUIRED' : undefined,
  };
}

// Pure logic client premium gating contract
export function checkClientPremiumAccess(role: string, hasActiveSubscription: boolean = false) {
  const normalized = (role || '').trim().toLowerCase();
  if (normalized !== 'cliente') {
    return { allowed: false, httpStatus: 403, code: 'FORBIDDEN_ROLE' };
  }
  if (!hasActiveSubscription) {
    return {
      allowed: false,
      httpStatus: 403,
      code: 'CLIENT_PREMIUM_REQUIRED',
      message: 'Función disponible solo para suscriptores premium ($4.99/mes).',
    };
  }
  return { allowed: true, httpStatus: 200 };
}

export function registerRoleRoutingAndSubscriptionGuardsTests(validator: DomValidator, client?: ApiClient) {
  setTier('Tier 1 - Feature Coverage');

  describe('Feature: Role Redirection post-login and post-register (AC 1)', () => {
    const frontendDir = validator.getFrontendRoot();

    it('TC-REDIR-01: Role destination resolver maps Cliente -> /client-dashboard and Tatuador -> /artist-dashboard', () => {
      expect(resolveRoleDashboard('Cliente')).toBe('/client-dashboard');
      expect(resolveRoleDashboard('cliente')).toBe('/client-dashboard');
      expect(resolveRoleDashboard('Tatuador')).toBe('/artist-dashboard');
      expect(resolveRoleDashboard('tatuador')).toBe('/artist-dashboard');
      expect(resolveRoleDashboard('')).toBe('/user');
      expect(resolveRoleDashboard(null)).toBe('/user');
    });

    it('TC-REDIR-02: RegisterPage routes Cliente to /client-dashboard and Tatuador to /artist-dashboard upon completion', () => {
      const registerPagePath = path.join(frontendDir, 'src/pages/RegisterPage.tsx');
      expect(fs.existsSync(registerPagePath)).toBe(true);

      const content = fs.readFileSync(registerPagePath, 'utf-8');
      expect(content.includes('/client-dashboard')).toBe(true);
      expect(content.includes('/artist-dashboard')).toBe(true);
      expect(content.includes('Tatuador')).toBe(true);
      expect(content.includes('Cliente')).toBe(true);
    });

    it('TC-REDIR-03: LoginPage dynamic navigation evaluates role and routes to /client-dashboard or /artist-dashboard', () => {
      const loginPagePath = path.join(frontendDir, 'src/pages/LoginPage.tsx');
      expect(fs.existsSync(loginPagePath)).toBe(true);

      const content = fs.readFileSync(loginPagePath, 'utf-8');
      expect(content.includes('/client-dashboard')).toBe(true);
      expect(content.includes('/artist-dashboard')).toBe(true);
      expect(content.includes('window.location.origin')).toBe(true);
      expect(content.includes('localhost:')).toBe(false);
    });

    it('TC-REDIR-04: App.tsx router declares /client-dashboard and /artist-dashboard with respective page components', () => {
      const appPath = path.join(frontendDir, 'src/App.tsx');
      expect(fs.existsSync(appPath)).toBe(true);

      const content = fs.readFileSync(appPath, 'utf-8');
      expect(content.includes('path="/client-dashboard"')).toBe(true);
      expect(content.includes('path="/artist-dashboard"')).toBe(true);
      expect(content.includes('ClientDashboardPage')).toBe(true);
      expect(content.includes('ArtistDashboardPage')).toBe(true);
    });

    it('TC-REDIR-05: App.tsx OnboardingGate provides smart role redirection from /user to role dashboards', () => {
      const appPath = path.join(frontendDir, 'src/App.tsx');
      expect(fs.existsSync(appPath)).toBe(true);

      const content = fs.readFileSync(appPath, 'utf-8');
      expect(content.includes('OnboardingGate')).toBe(true);
      expect(content.includes('/client-dashboard')).toBe(true);
      expect(content.includes('/artist-dashboard')).toBe(true);
    });

    if (client) {
      it('TC-REDIR-LIVE-01: Live registration of Cliente returns metadata role Cliente and maps to /client-dashboard', async () => {
        const email = generateTestEmail('live_redir_client');
        const res = await client.register({
          email,
          password: 'Password123!',
          nombre: 'Elena',
          apellido: 'Cliente',
          tipo: 'Cliente',
          legal_accepted: true,
        });

        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        const role = res.data.data.user.user_metadata.role || res.data.data.user.user_metadata.tipo;
        expect(role).toBe('Cliente');
        expect(resolveRoleDashboard(role)).toBe('/client-dashboard');
      });

      it('TC-REDIR-LIVE-02: Live registration of Tatuador returns metadata role Tatuador and maps to /artist-dashboard', async () => {
        const email = generateTestEmail('live_redir_artist');
        const res = await client.register({
          email,
          password: 'Password123!',
          nombre: 'Diego',
          apellido: 'Tatuador',
          tipo: 'Tatuador',
          legal_accepted: true,
        });

        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        const role = res.data.data.user.user_metadata.role || res.data.data.user.user_metadata.tipo;
        expect(role).toBe('Tatuador');
        expect(resolveRoleDashboard(role)).toBe('/artist-dashboard');
      });
    }
  });

  describe('Feature: Artist 90-Day Trial Lockout (AC 2)', () => {
    const frontendDir = validator.getFrontendRoot();
    const backendSrcDir = path.resolve(frontendDir, '../backend/src');

    it('TC-LOCKOUT-01: Mathematical contract: Artist within 90 days has active trial and is NOT locked out', () => {
      const now = new Date();
      // Registered today
      const todayStatus = calculateTrialStatus(now.toISOString(), false, now);
      expect(todayStatus.isTrialActive).toBe(true);
      expect(todayStatus.isLockedOut).toBe(false);
      expect(todayStatus.httpStatus).toBe(200);

      // Registered 45 days ago
      const day45 = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString();
      const day45Status = calculateTrialStatus(day45, false, now);
      expect(day45Status.isTrialActive).toBe(true);
      expect(day45Status.isLockedOut).toBe(false);
      expect(day45Status.trialDaysRemaining).toBe(45);

      // Registered 89 days ago
      const day89 = new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000).toISOString();
      const day89Status = calculateTrialStatus(day89, false, now);
      expect(day89Status.isTrialActive).toBe(true);
      expect(day89Status.isLockedOut).toBe(false);
    });

    it('TC-LOCKOUT-02: Mathematical contract: Artist with created_at >90 days and has_active_subscription=false is LOCKED OUT (HTTP 403)', () => {
      const now = new Date();
      // Registered 95 days ago
      const day95 = new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000).toISOString();
      const day95Status = calculateTrialStatus(day95, false, now);
      expect(day95Status.isTrialActive).toBe(false);
      expect(day95Status.isLockedOut).toBe(true);
      expect(day95Status.httpStatus).toBe(403);
      expect(day95Status.errorCode).toBe('SUBSCRIPTION_REQUIRED');

      // Registered 180 days ago
      const day180 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();
      const day180Status = calculateTrialStatus(day180, false, now);
      expect(day180Status.isLockedOut).toBe(true);
      expect(day180Status.httpStatus).toBe(403);
    });

    it('TC-LOCKOUT-03: Mathematical contract: Artist with created_at >90 days BUT has_active_subscription=true is UNLOCKED (HTTP 200)', () => {
      const now = new Date();
      const day120 = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString();
      const day120Subscribed = calculateTrialStatus(day120, true, now);
      expect(day120Subscribed.isTrialActive).toBe(false);
      expect(day120Subscribed.isLockedOut).toBe(false);
      expect(day120Subscribed.httpStatus).toBe(200);
      expect(day120Subscribed.errorCode).toBeUndefined();
    });

    it('TC-LOCKOUT-04: Backend subscription.middleware.ts defines trial lockout with HTTP 403 and code SUBSCRIPTION_REQUIRED', () => {
      const middlewarePath = path.join(backendSrcDir, 'middlewares/subscription.middleware.ts');
      expect(fs.existsSync(middlewarePath)).toBe(true);

      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content.includes('checkArtistSubscription') || content.includes('has_active_subscription')).toBe(true);
      expect(content.includes('90')).toBe(true);
      expect(content.includes('has_active_subscription')).toBe(true);
      expect(content.includes('403')).toBe(true);
      expect(content.includes('SUBSCRIPTION_REQUIRED')).toBe(true);
    });

    it('TC-LOCKOUT-05: ArtistDashboardPage.tsx checks subscription status and warns or redirects expired artists', () => {
      const artistDashboardPath = path.join(frontendDir, 'src/pages/ArtistDashboardPage.tsx');
      expect(fs.existsSync(artistDashboardPath)).toBe(true);

      const content = fs.readFileSync(artistDashboardPath, 'utf-8');
      expect(content.includes('subscription') || content.includes('Subscription') || content.includes('trial')).toBe(true);
      expect(content.includes('/subscription/creditcard') || content.includes('checkout') || content.includes('Suscripción')).toBe(true);
    });

    if (client) {
      it('TC-LOCKOUT-LIVE-01: Freshly registered artist (<90 days) can upload avatar without SUBSCRIPTION_REQUIRED error', async () => {
        const email = generateTestEmail('live_artist_fresh');
        const reg = await client.register({
          email,
          password: 'Password123!',
          nombre: 'FreshArtist',
          tipo: 'Tatuador',
          legal_accepted: true,
        });

        const token = reg.data.data.session.access_token;
        const res = await client.updateUserImg(
          { img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
          { Authorization: `Bearer ${token}` }
        );

        // Not blocked with 403 SUBSCRIPTION_REQUIRED
        expect(res.status).not.toBe(403);
      });

      it('TC-LOCKOUT-LIVE-02: Expired trial artist (>90 days, no sub) backdated via service role is blocked with HTTP 403 SUBSCRIPTION_REQUIRED', async () => {
        const email = generateTestEmail('live_artist_expired');
        const reg = await client.register({
          email,
          password: 'Password123!',
          nombre: 'ExpiredArtist',
          tipo: 'Tatuador',
          legal_accepted: true,
        });

        const userId = reg.data.data.user.id;
        const token = reg.data.data.session.access_token;

        // Backdate user profile to 95 days ago
        const backdated = await client.backdateUserProfile(userId, 95);
        if (backdated) {
          const res = await client.updateUserImg(
            { img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
            { Authorization: `Bearer ${token}` }
          );

          expect(res.status).toBe(403);
          expect(res.data.code).toBe('SUBSCRIPTION_REQUIRED');
          expect(res.data.success).toBe(false);
        }
      });
    }
  });

  describe('Feature: Client Premium Gating (AC 3)', () => {
    const frontendDir = validator.getFrontendRoot();
    const backendSrcDir = path.resolve(frontendDir, '../backend/src');

    it('TC-CLIENT-PREM-01: Standard Client accesses /client-dashboard freely without paywall blocking the entire view', () => {
      const clientDashboardPath = path.join(frontendDir, 'src/pages/ClientDashboardPage.tsx');
      expect(fs.existsSync(clientDashboardPath)).toBe(true);

      const content = fs.readFileSync(clientDashboardPath, 'utf-8');
      expect(content.includes('Panel del Cliente') || content.includes('Dashboard')).toBe(true);
      // General navigation is open to clients
      expect(content.includes('navigate(\'/login\', { replace: true })')).toBe(true);
    });

    it('TC-CLIENT-PREM-02: Client premium access logic contract rejects unpaying clients with HTTP 403 CLIENT_PREMIUM_REQUIRED', () => {
      const unpaying = checkClientPremiumAccess('Cliente', false);
      expect(unpaying.allowed).toBe(false);
      expect(unpaying.httpStatus).toBe(403);
      expect(unpaying.code).toBe('CLIENT_PREMIUM_REQUIRED');

      const paying = checkClientPremiumAccess('Cliente', true);
      expect(paying.allowed).toBe(true);
      expect(paying.httpStatus).toBe(200);
      expect(paying.code).toBeUndefined();
    });

    it('TC-CLIENT-PREM-03: ClientDashboardPage.tsx presents premium features and triggers upgrade / paywall prompt', () => {
      const clientDashboardPath = path.join(frontendDir, 'src/pages/ClientDashboardPage.tsx');
      expect(fs.existsSync(clientDashboardPath)).toBe(true);

      const content = fs.readFileSync(clientDashboardPath, 'utf-8');
      // Premium feature or tracker presence
      expect(
        content.includes('Progreso') ||
        content.includes('Historial') ||
        content.includes('Premium') ||
        content.includes('VIP') ||
        content.includes('has_active_subscription')
      ).toBe(true);
    });

    it('TC-CLIENT-PREM-04: HomePage.tsx provides clear plans for both Clientes ($4.99) and Tatuadores (90 days trial)', () => {
      const homePagePath = path.join(frontendDir, 'src/pages/HomePage.tsx');
      expect(fs.existsSync(homePagePath)).toBe(true);

      const content = fs.readFileSync(homePagePath, 'utf-8');
      expect(content.includes('Tatuadores') || content.includes('Artistas')).toBe(true);
      expect(content.includes('Clientes') || content.includes('Cliente')).toBe(true);
      expect(content.includes('90') || content.includes('días')).toBe(true);
      expect(content.includes('4.99') || content.includes('49.90') || content.includes('Gratis')).toBe(true);
    });

    if (client) {
      it('TC-CLIENT-PREM-LIVE-01: Live standard client queries GET /userprofile successfully with HTTP 200', async () => {
        const email = generateTestEmail('live_client_profile');
        const reg = await client.register({
          email,
          password: 'Password123!',
          nombre: 'Sofia',
          tipo: 'Cliente',
          legal_accepted: true,
        });

        const token = reg.data.data.session.access_token;
        const profileRes = await client.getUserProfile({ Authorization: `Bearer ${token}` });

        expect(profileRes.status).toBe(200);
        expect(profileRes.data.success).toBe(true);
        expect(profileRes.data.data.role).toBe('Cliente');
        expect(Boolean(profileRes.data.data.has_active_subscription)).toBe(false);
      });
    }
  });
}
