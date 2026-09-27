/**
 * Tier 4: Real-World Scenarios - Security & Session Invalidation
 * Verifies that after logging out, previous session tokens cannot be reused to access protected endpoints.
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail } from '../config.ts';

export function registerSecurityInvalidationScenarioTests(client: ApiClient) {
  setTier('Tier 4 - Real-World Scenarios');

  describe('Scenario 3: Security & Session Invalidation Protocol', () => {
    it('TC-SCEN-03: Revoked session tokens are rejected on protected endpoints following logout', async () => {
      const email = generateTestEmail('security_user');
      const password = 'SecurePassword123!';

      // 1. Register & login
      const reg = await client.register({
        email,
        password,
        nombre: 'Security',
        apellido: 'Test',
        tipo: 'Cliente',
      });
      expect(reg.status).toBe(200);

      const loginRes = await client.login({ email, password });
      expect(loginRes.status).toBe(200);
      const token = loginRes.data.data.session.access_token;
      const refresh = loginRes.data.data.session.refresh_token;

      const authHeaders = {
        Authorization: `Bearer ${token}`,
        refresh_token: refresh,
      };

      // 2. Perform authenticated action before logout (should succeed)
      const preLogout = await client.updateUser({ nombre: 'PreLogout' }, authHeaders);
      expect(preLogout.status).toBe(200);

      // 3. Issue logout
      const logoutRes = await client.logout(authHeaders);
      expect(logoutRes.status).toBe(200);

      // 4. Attempt to use old token after logout (should fail or require re-auth)
      const postLogout = await client.enroll(authHeaders);
      expect(postLogout.status >= 400 || (postLogout.data && postLogout.data.success === false)).toBe(true);

      // 5. Re-authenticate to obtain valid new session
      const reLogin = await client.login({ email, password });
      expect(reLogin.status).toBe(200);
      expect(reLogin.data.success).toBe(true);
      const newToken = reLogin.data.data.session.access_token;
      expect(newToken).toBeDefined();
    });
  });
}
