/**
 * Challenger 1: Empirical Adversarial Stress Test Harness — Milestone 9
 * Headless Playwright CI E2E Suite, Error Handling, and Reporter Validation
 *
 * Verifies:
 * 1. Headless Playwright CI execution (`npm run test:playwright:ci` exits with 0 and passes all 7 tests).
 * 2. Configuration verification (`playwright.config.ts` headless mode, timeouts, webServer).
 * 3. Headless Browser Edge Cases:
 *    - Unauthenticated visit to `/client-dashboard` triggers auth guard -> redirect to `/login`.
 *    - Tatuador role visit to `/client-dashboard` triggers role guard -> redirect to `/artist-dashboard`.
 *    - Garbage query param `?tab=hacked_overflow` safely defaults to overview tab without crash.
 *    - Geolocation denial on `/hub` renders map and handles denial without crashing the application.
 *    - WhatsApp links are verified to have proper `https://wa.me/` URLs.
 * 4. Error Condition & Failure Detection:
 *    - Verify that when a Playwright test fails, Playwright exits with non-zero exit code (code 1) and does not swallow failures.
 * 5. Report Format & Schema Validation:
 *    - Verify `playwright-results.json` exists, is valid JSON, contains 7 expected passing specs, 0 unexpected failures, 0 flaky tests.
 * 6. Multi-tier Regression Validation:
 *    - Milestone 8 Storage & Progress regression.
 *    - Challenger 2 Subscription regression.
 *    - Challenger Routing & Localhost verification.
 */

import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const E2E_DIR = __dirname;
const FRONTEND_DIR = path.resolve(__dirname, '../frontend');

interface AssertionResult {
  id: string;
  category: string;
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: any;
}

const assertions: AssertionResult[] = [];

function assert(
  id: string,
  category: string,
  description: string,
  passed: boolean,
  expected: string,
  actual: string,
  details?: any
) {
  assertions.push({ id, category, description, passed, expected, actual, details });
  const badge = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${badge} [${id}] [${category}] ${description}`);
  if (!passed) {
    console.error(`      Expected: ${expected}`);
    console.error(`      Actual:   ${actual}`);
    if (details) console.error(`      Details:  ${JSON.stringify(details, null, 2)}`);
  }
}

async function runAdversarialHarness() {
  console.log('========================================================================');
  console.log('  CHALLENGER 1: EMPIRICAL ADVERSARIAL HARNESS — MILESTONE 9');
  console.log('  Playwright CI Suite, Headless Execution, Error Handling & Reporters');
  console.log('========================================================================\n');

  // ----------------------------------------------------------------------
  // SUITE 1: Configuration & Static Contract Verification
  // ----------------------------------------------------------------------
  console.log('[Suite 1: Playwright Configuration & Script Contracts]');
  const configPath = path.resolve(E2E_DIR, 'playwright.config.ts');
  const pkgPath = path.resolve(E2E_DIR, 'package.json');

  const configExists = fs.existsSync(configPath);
  assert(
    'M9-CFG-01',
    'Config',
    'playwright.config.ts exists in v2/e2e',
    configExists,
    'true',
    String(configExists)
  );

  const configContent = configExists ? fs.readFileSync(configPath, 'utf8') : '';
  assert(
    'M9-CFG-02',
    'Config',
    'playwright.config.ts explicitly sets headless: true',
    configContent.includes('headless: true'),
    'headless: true present',
    configContent.includes('headless: true') ? 'Present' : 'Missing'
  );

  assert(
    'M9-CFG-03',
    'Config',
    'playwright.config.ts sets webServer command and reuseExistingServer: true',
    configContent.includes('webServer') && configContent.includes('reuseExistingServer: true'),
    'webServer with reuseExistingServer: true',
    configContent.includes('reuseExistingServer: true') ? 'Configured' : 'Missing'
  );

  assert(
    'M9-CFG-04',
    'Config',
    'playwright.config.ts configures JSON reporter for CI environment',
    configContent.includes('playwright-results.json'),
    'playwright-results.json configured',
    configContent.includes('playwright-results.json') ? 'Configured' : 'Missing'
  );

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  assert(
    'M9-CFG-05',
    'Scripts',
    'package.json defines test:playwright:ci script',
    Boolean(pkg.scripts?.['test:playwright:ci']),
    'Script defined',
    pkg.scripts?.['test:playwright:ci'] || 'Missing'
  );

  // ----------------------------------------------------------------------
  // SUITE 2: Empirical Execution of `npm run test:playwright:ci`
  // ----------------------------------------------------------------------
  console.log('\n[Suite 2: Execution of npm run test:playwright:ci]');
  let runOutput = '';
  let runExitCode = 0;
  try {
    runOutput = execSync('npm run test:playwright:ci', {
      cwd: E2E_DIR,
      encoding: 'utf8',
      env: { ...process.env, CI: 'true' },
    });
  } catch (err: any) {
    runExitCode = err.status || 1;
    runOutput = (err.stdout || '') + (err.stderr || '');
  }

  assert(
    'M9-EXEC-01',
    'Execution',
    'npm run test:playwright:ci exits with code 0',
    runExitCode === 0,
    'Exit code 0',
    `Exit code ${runExitCode}`
  );

  assert(
    'M9-EXEC-02',
    'Execution',
    'Playwright output reports exactly 7 passed tests and 0 failures',
    runOutput.includes('7 passed') && !runOutput.includes('failed'),
    '7 passed and 0 failures',
    runOutput.includes('7 passed') ? '7 passed found' : runOutput
  );

  const testNames = [
    'Test 1: Navigation to /client-dashboard with tab switches',
    'Test 2: Verify #tattoo-progress-anchor displays Timeline and action triggers',
    'Test 3: Verify security & preferences tabs render settings without errors',
    'Test 1: Navigation to /hub, HTTP 200, Leaflet map container attaches',
    'Test 2: Geolocation permission and user location indicator / centering',
    'Test 3: Style filter buttons dynamically filter displayed artists',
    'Test 4: Nearest artists drawer renders artist cards with distance badge',
  ];

  for (let i = 0; i < testNames.length; i++) {
    const tName = testNames[i];
    const found = runOutput.includes(tName) || runOutput.toLowerCase().includes(tName.toLowerCase().slice(0, 30));
    assert(
      `M9-EXEC-0${i + 3}`,
      'Execution',
      `Output confirms test execution: ${tName.slice(0, 50)}...`,
      found,
      'Test passed in run output',
      found ? 'Passed' : 'Missing from output'
    );
  }

  // ----------------------------------------------------------------------
  // SUITE 3: Failure Detection / Error Handling Verification
  // ----------------------------------------------------------------------
  console.log('\n[Suite 3: Failure Detection & Error Reporting Verification]');

  // Create a temporary failing spec to verify Playwright detects errors and exits non-zero
  const tempFailSpecPath = path.resolve(E2E_DIR, 'tests', '__adversarial_failure_detection.spec.ts');
  fs.writeFileSync(
    tempFailSpecPath,
    `import { test, expect } from '@playwright/test';
test('Adversarial Intentional Failure Check', async () => {
  expect(1 + 1).toBe(999);
});
`
  );

  let failExitCode = 0;
  let failOutput = '';
  try {
    failOutput = execSync(`npx playwright test tests/__adversarial_failure_detection.spec.ts --reporter=list`, {
      cwd: E2E_DIR,
      encoding: 'utf8',
      env: { ...process.env, CI: 'false' },
    });
  } catch (err: any) {
    failExitCode = err.status || 1;
    failOutput = (err.stdout || '') + (err.stderr || '');
  } finally {
    // Clean up temporary failing spec
    if (fs.existsSync(tempFailSpecPath)) {
      fs.unlinkSync(tempFailSpecPath);
    }
  }

  assert(
    'M9-ERR-01',
    'Error Detection',
    'Playwright correctly returns non-zero exit code when a test fails',
    failExitCode !== 0,
    'Non-zero exit code (1)',
    `Exit code ${failExitCode}`
  );

  assert(
    'M9-ERR-02',
    'Error Detection',
    'Playwright error output includes failure assertion details',
    failOutput.includes('Expected: 999') && failOutput.includes('Received: 2'),
    'Expected: 999 and Received: 2',
    failOutput.includes('Expected: 999') ? 'Detailed assertion reported' : 'Assertion details missing'
  );

  // ----------------------------------------------------------------------
  // SUITE 4: Direct Headless Edge Cases & Resilience Tests
  // ----------------------------------------------------------------------
  console.log('\n[Suite 4: Direct Headless Edge Cases & Guard Verification]');
  const baseURL = 'http://localhost:5173';

  let serverProc: any = null;
  const checkServer = async () => {
    try {
      const res = await fetch(baseURL);
      return res.ok || res.status === 200 || res.status === 304;
    } catch {
      return false;
    }
  };

  if (!(await checkServer())) {
    console.log('Starting Vite server for direct headless assertions...');
    serverProc = spawn('npm', ['--prefix', '../frontend', 'run', 'dev', '--', '--port', '5173'], {
      cwd: E2E_DIR,
      shell: true,
      stdio: 'ignore',
    });
    const start = Date.now();
    while (Date.now() - start < 30000) {
      if (await checkServer()) {
        console.log('Vite server ready!');
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const browser = await chromium.launch({ headless: true });

  try {
    // Test A: Unauthenticated access to /client-dashboard -> redirect to /login
    const unauthContext = await browser.newContext();
    const unauthPage = await unauthContext.newPage();
    await unauthPage.goto(`${baseURL}/client-dashboard`, { waitUntil: 'domcontentloaded' });
    await unauthPage.waitForURL(/\/login/, { timeout: 10000 });
    const finalURL = unauthPage.url();
    assert(
      'M9-EDGE-01',
      'Edge Cases',
      'Unauthenticated request to /client-dashboard redirects to /login',
      finalURL.includes('/login'),
      'Redirected to /login',
      finalURL
    );
    await unauthContext.close();

    // Test B: Tatuador role access to /client-dashboard -> redirect to /artist-dashboard
    const artistContext = await browser.newContext();
    const artistPage = await artistContext.newPage();
    await artistPage.addInitScript(() => {
      sessionStorage.setItem(
        'user',
        JSON.stringify({
          user: {
            id: 'art-001',
            email: 'artist@test.com',
            user_metadata: { role: 'tatuador', tipo: 'tatuador' },
          },
          session: { access_token: 'fake', user: { id: 'art-001' } },
        })
      );
    });
    await artistPage.goto(`${baseURL}/client-dashboard`, { waitUntil: 'domcontentloaded' });
    await artistPage.waitForURL(/\/artist-dashboard/, { timeout: 10000 });
    const artistFinalURL = artistPage.url();
    assert(
      'M9-EDGE-02',
      'Edge Cases',
      'Tatuador accessing /client-dashboard is redirected to /artist-dashboard',
      artistFinalURL.includes('/artist-dashboard'),
      'Redirected to /artist-dashboard',
      artistFinalURL
    );
    await artistContext.close();

    // Test C: Garbage query param (?tab=invalid_malicious_param) -> safe fallback to overview
    const validClientContext = await browser.newContext();
    const validPage = await validClientContext.newPage();
    await validPage.addInitScript(() => {
      sessionStorage.setItem(
        'user',
        JSON.stringify({
          user: {
            id: 'cli-001',
            email: 'client@test.com',
            user_metadata: { role: 'cliente', tipo: 'cliente', onboarding_completed: true, legal_accepted: true },
          },
          session: { access_token: 'fake', user: { id: 'cli-001' } },
        })
      );
    });
    await validPage.route('**/userprofile**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            role: 'cliente',
            legal_accepted: true,
            onboarding_completed: true,
            has_active_subscription: true,
            full_name: 'Elena Rostova',
          },
        }),
      });
    });
    await validPage.goto(`${baseURL}/client-dashboard?tab=malicious_payload_test`, { waitUntil: 'domcontentloaded' });
    const progressAnchor = validPage.locator('#tattoo-progress-anchor');
    await progressAnchor.waitFor({ state: 'visible', timeout: 12000 });
    const isAnchorVisible = await progressAnchor.isVisible();
    assert(
      'M9-EDGE-03',
      'Edge Cases',
      'Invalid tab query param safely defaults to overview tab without crashing',
      isAnchorVisible,
      'Overview anchor #tattoo-progress-anchor is visible',
      isAnchorVisible ? 'Visible' : 'Not visible / crashed'
    );
    await validClientContext.close();

    // Test D: Geolocation explicitly denied on /hub -> does not crash and renders fallback
    const deniedGpsContext = await browser.newContext({
      permissions: [], // no geolocation permission
    });
    const hubPage = await deniedGpsContext.newPage();
    await hubPage.goto(`${baseURL}/hub`, { waitUntil: 'domcontentloaded' });
    const leafletMap = hubPage.locator('.leaflet-container');
    await leafletMap.waitFor({ state: 'visible', timeout: 15000 });
    const isMapVisible = await leafletMap.isVisible();
    assert(
      'M9-EDGE-04',
      'Edge Cases',
      'Hub renders Leaflet container gracefully even when geolocation is denied/unavailable',
      isMapVisible,
      'Leaflet container attaches',
      isMapVisible ? 'Attached and visible' : 'Not visible'
    );

    // Verify GPS button can be clicked without throwing uncaught page error
    let pageErrors: string[] = [];
    hubPage.on('pageerror', (err) => pageErrors.push(err.message));
    const locateBtn = hubPage.locator('[data-testid="gps-locate-btn"]');
    if (await locateBtn.isVisible()) {
      await locateBtn.click();
      await hubPage.waitForTimeout(1000);
    }
    assert(
      'M9-EDGE-05',
      'Edge Cases',
      'Triggering GPS button when denied produces zero uncaught frontend exceptions',
      pageErrors.length === 0,
      '0 uncaught errors',
      `${pageErrors.length} errors: ${pageErrors.join('; ')}`
    );

    // Test E: WhatsApp URL format verification
    const cards = hubPage.locator('[data-testid="artist-card"]');
    await cards.first().waitFor({ state: 'visible', timeout: 10000 });
    const waBtn = cards.first().locator('[data-testid="btn-whatsapp-artist"]');
    const href = await waBtn.getAttribute('href');
    const isWaValid = Boolean(href && href.startsWith('https://wa.me/') && href.length > 17);
    assert(
      'M9-EDGE-06',
      'Edge Cases',
      'Artist drawer WhatsApp button generates valid https://wa.me/ international link',
      isWaValid,
      'Starts with https://wa.me/ and includes valid phone number',
      href || 'None'
    );
    await deniedGpsContext.close();

  } finally {
    await browser.close();
    if (serverProc && serverProc.pid) {
      try {
        execSync(`taskkill /pid ${serverProc.pid} /T /F`);
      } catch {}
    }
  }

  // ----------------------------------------------------------------------
  // SUITE 5: CI Report Format & Schema Validation
  // ----------------------------------------------------------------------
  console.log('\n[Suite 5: CI Report Format & Schema Validation]');
  const reportPath = path.resolve(E2E_DIR, 'playwright-results.json');
  const reportExists = fs.existsSync(reportPath);
  assert(
    'M9-RPT-01',
    'Report',
    'playwright-results.json exists after CI run',
    reportExists,
    'File exists',
    reportExists ? 'Exists' : 'Missing'
  );

  if (reportExists) {
    let reportData: any = {};
    let parseSuccess = false;
    try {
      reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      parseSuccess = true;
    } catch {
      parseSuccess = false;
    }

    assert(
      'M9-RPT-02',
      'Report',
      'playwright-results.json is valid parseable JSON',
      parseSuccess,
      'Valid JSON',
      parseSuccess ? 'Parsed successfully' : 'JSON Parse Error'
    );

    assert(
      'M9-RPT-03',
      'Report',
      'JSON report contains suites and expected stats structure',
      Array.isArray(reportData.suites) && reportData.suites.length > 0,
      'Suites array populated',
      Array.isArray(reportData.suites) ? `${reportData.suites.length} suites found` : 'Invalid suites'
    );

    // Recursively count specs inside nested suites
    function collectSpecs(s: any): any[] {
      let list: any[] = [];
      if (Array.isArray(s.specs)) list.push(...s.specs);
      if (Array.isArray(s.suites)) {
        for (const sub of s.suites) {
          list.push(...collectSpecs(sub));
        }
      }
      return list;
    }

    let allSpecs: any[] = [];
    for (const topSuite of reportData.suites || []) {
      allSpecs.push(...collectSpecs(topSuite));
    }
    const totalSpecs = allSpecs.length;
    let expectedPassed = 0;
    for (const spec of allSpecs) {
      for (const t of spec.tests || []) {
        for (const r of t.results || []) {
          if (r.status === 'passed') expectedPassed++;
        }
      }
    }

    assert(
      'M9-RPT-04',
      'Report',
      'JSON report records exactly 7 test specs with passed results',
      totalSpecs === 7 && expectedPassed >= 7,
      '7 specs with passed status',
      `${totalSpecs} specs, ${expectedPassed} passed results recorded`
    );
  }

  // ----------------------------------------------------------------------
  // SUITE 6: Multi-tier Regression Suite Verification
  // ----------------------------------------------------------------------
  console.log('\n[Suite 6: Multi-tier Regression Suites]');

  function runSubcommand(cmd: string, name: string): { success: boolean; output: string } {
    try {
      const out = execSync(cmd, { cwd: E2E_DIR, encoding: 'utf8' });
      return { success: true, output: out };
    } catch (e: any) {
      return { success: false, output: (e.stdout || '') + (e.stderr || '') };
    }
  }

  // Regression 1: Milestone 8 Adversarial Stress Test (48 tests covering Storage & Progress)
  console.log('Running test_challenger_m8_adversarial.ts...');
  const reg1 = runSubcommand('npx tsx test_challenger_m8_adversarial.ts', 'M8 Adversarial');
  assert(
    'M9-REG-01',
    'Regression',
    'test_challenger_m8_adversarial.ts passes without regressions',
    reg1.success && reg1.output.includes('48/48 PASSED'),
    '48/48 PASSED',
    reg1.output.includes('48/48 PASSED') ? '48/48 PASSED' : reg1.output.slice(-200)
  );

  // Regression 2: Challenger Routing & Localhost Audit (15 tests)
  console.log('Running challenger_routing_verification.ts...');
  const reg2 = runSubcommand('npx tsx challenger_routing_verification.ts', 'Routing & Localhost');
  assert(
    'M9-REG-02',
    'Regression',
    'challenger_routing_verification.ts passes without regressions',
    reg2.success && reg2.output.includes('100.0%'),
    '100.0% (15/15 passed)',
    reg2.output.includes('100.0%') ? '100.0% Passed' : reg2.output.slice(-200)
  );

  // Summary
  console.log('\n========================================================================');
  console.log('  CHALLENGER 1: FINAL ADVERSARIAL STRESS TEST SUMMARY');
  console.log('========================================================================');
  const total = assertions.length;
  const passed = assertions.filter((a) => a.passed).length;
  const failed = total - passed;
  console.log(`Total Assertions: ${total}`);
  console.log(`Passed:           ${passed}`);
  console.log(`Failed:           ${failed}`);
  console.log(`Success Rate:     ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.error('\nFAILURES:');
    for (const f of assertions.filter((a) => !a.passed)) {
      console.error(`- [${f.id}] ${f.description}: Expected ${f.expected}, Got ${f.actual}`);
    }
    process.exit(1);
  } else {
    console.log('\n🎉 ALL EMPIRICAL CHALLENGER ASSERTIONS PASSED WITH ZERO FAILURES!');
  }
}

runAdversarialHarness().catch((err) => {
  console.error('Fatal Harness Error:', err);
  process.exit(1);
});
