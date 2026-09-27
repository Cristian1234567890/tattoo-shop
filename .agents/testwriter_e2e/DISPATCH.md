## 2026-09-23T23:37:41Z
<USER_REQUEST>
You are testwriter_e2e, a specialized test authoring agent for the E2E Testing Track.
Working directory: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\testwriter_e2e

MANDATORY: Read ORIGINAL_REQUEST.md at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\ORIGINAL_REQUEST.md
and PROJECT.md at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\PROJECT.md
and Spec Miner report at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\specminer_api_survey\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your task (Milestone 4 - E2E Testing Track):
1. Design and build the opaque-box, requirement-driven E2E test suite in:
   c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\e2e
2. Structure the test suite across 4 systematic tiers:
   - Tier 1: Feature Coverage (>=5 test cases per feature for all 14 endpoints and key frontend user interactions).
   - Tier 2: Boundary & Corner Cases (missing headers, invalid types, oversized base64 images, invalid credentials, duplicate user registration).
   - Tier 3: Cross-Feature Combinations (register -> login -> MFA -> update profile -> query catalog -> send email inquiry).
   - Tier 4: Real-World Scenarios (complete customer quote workflow; complete artist onboarding and subscription check).
3. Provide an executable test runner (e.g. `run_tests.js` or `run_tests.ts` or `run_tests.ps1`) that can be executed with a single command, testing against `http://localhost:8080`, outputting structured pass/fail results.
4. Include frontend build and DOM structural assertions (verifying that `npm run build` succeeds in `v2/frontend` and inspecting build artifacts/DOM elements).
5. Generate `TEST_INFRA.md` and `TEST_READY.md` in `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\e2e` following the project templates.
6. Exclusive file ownership: `v2/e2e/*`
7. Write your handoff report to:
   c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\testwriter_e2e\handoff.md
8. Message the orchestrator when completed.
</USER_REQUEST>
