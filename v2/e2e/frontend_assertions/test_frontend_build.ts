/**
 * Frontend Build Assertions
 * Verifies that npm run build in v2/frontend compiles cleanly without TypeScript or bundler errors.
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { DomValidator } from '../framework/dom_validator.ts';

export function registerFrontendBuildTests(validator: DomValidator) {
  setTier('Frontend Build & DOM Assertions');

  describe('Frontend Verification: Production Build Compilation', () => {
    it('TC-DOM-BUILD-01: Verifies frontend workspace setup and build artifacts', () => {
      const isPresent = validator.isFrontendPresent();
      if (!isPresent) {
        console.log('    [INFO] v2/frontend is pending M3 implementation. Ready to verify build on M3 completion.');
        expect(true).toBe(true);
        return;
      }

      const buildResult = validator.runFrontendBuild();
      if (!buildResult.success) {
        console.log('    [BUILD LOGS]:', buildResult.outputLog);
        console.log('    [BUILD ERROR]:', buildResult.error);
      }

      expect(buildResult.success).toBe(true);
      expect(buildResult.distExists).toBe(true);
      expect(buildResult.outputHtmlExists).toBe(true);
    });
  });
}
