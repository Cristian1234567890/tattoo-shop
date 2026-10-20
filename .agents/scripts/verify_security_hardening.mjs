#!/usr/bin/env node
/**
 * Automated Security Hardening & OWASP 2025 Verification Script
 * Validates:
 * 1. .gitignore rules against sensitive credentials & environment files.
 * 2. Vercel frontend security headers configuration (v2/frontend/vercel.json).
 * 3. Express backend security headers middleware & live HTTP response headers.
 * 4. Cookie handling guidelines (HttpOnly, Secure, SameSite).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('================================================================');
console.log('  TATTOO HUB - SECURITY HARDENING & OWASP 2025 AUDIT SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. .gitignore Verification
// -----------------------------------------------------------------------------
console.log('--- 1. Testing .gitignore Rules for Credentials & Secrets ---');

const sensitivePathsToTest = [
  'firebase-service-account.json',
  '.agents/config/firebase-service-account.json',
  '.env',
  '.env.local',
  '.env.production',
  'v2/backend/.env',
  'v2/frontend/.env',
  'bot-cloud/.env',
  'private.key',
  'server.pem',
  'credentials.json',
  'secrets.json',
  'id_rsa',
  'id_ed25519',
  'AuthKey_test.p8',
];

for (const testPath of sensitivePathsToTest) {
  try {
    const res = execSync(`git check-ignore -v "${testPath}"`, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const matched = res.trim().length > 0;
    assert(matched, `Path "${testPath}" is correctly ignored by git (${res.trim().split('\t')[0]})`);
  } catch {
    assert(false, `Path "${testPath}" is NOT ignored by git!`);
  }
}

// -----------------------------------------------------------------------------
// 2. Frontend Security Headers in v2/frontend/vercel.json
// -----------------------------------------------------------------------------
console.log('\n--- 2. Testing Frontend Security Headers (v2/frontend/vercel.json) ---');

const vercelJsonPath = path.join(rootDir, 'v2/frontend/vercel.json');
assert(fs.existsSync(vercelJsonPath), 'v2/frontend/vercel.json exists');

if (fs.existsSync(vercelJsonPath)) {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
  const headerRules = vercelConfig.headers || [];
  assert(headerRules.length > 0, 'vercel.json contains headers configuration');

  const rootRule = headerRules.find((r) => r.source === '/(.*)');
  assert(!!rootRule, 'Headers apply to route pattern "/(.*)"');

  if (rootRule) {
    const headersMap = new Map();
    for (const h of rootRule.headers || []) {
      headersMap.set(h.key.toLowerCase(), h.value);
    }

    assert(
      headersMap.get('x-content-type-options') === 'nosniff',
      'X-Content-Type-Options is set to "nosniff"'
    );
    assert(
      headersMap.get('x-frame-options') === 'SAMEORIGIN',
      'X-Frame-Options is set to "SAMEORIGIN"'
    );
    assert(
      headersMap.get('referrer-policy') === 'strict-origin-when-cross-origin',
      'Referrer-Policy is set to "strict-origin-when-cross-origin"'
    );
    assert(
      headersMap.get('permissions-policy') === 'camera=(), microphone=(), geolocation=(self)',
      'Permissions-Policy is set to "camera=(), microphone=(), geolocation=(self)"'
    );
    assert(
      headersMap.get('strict-transport-security') ===
        'max-age=31536000; includeSubDomains; preload',
      'Strict-Transport-Security is set to "max-age=31536000; includeSubDomains; preload"'
    );
  }
}

// -----------------------------------------------------------------------------
// 3. Backend Security Headers Middleware & Live HTTP Response
// -----------------------------------------------------------------------------
console.log('\n--- 3. Testing Backend Security Headers & Server Hardening ---');

const backendAppPath = path.join(rootDir, 'v2/backend/src/app.ts');
const backendMiddlewarePath = path.join(
  rootDir,
  'v2/backend/src/middlewares/security.middleware.ts'
);

assert(fs.existsSync(backendAppPath), 'v2/backend/src/app.ts exists');
assert(fs.existsSync(backendMiddlewarePath), 'v2/backend/src/middlewares/security.middleware.ts exists');

if (fs.existsSync(backendAppPath) && fs.existsSync(backendMiddlewarePath)) {
  const appCode = fs.readFileSync(backendAppPath, 'utf8');
  const middlewareCode = fs.readFileSync(backendMiddlewarePath, 'utf8');

  assert(
    appCode.includes('securityHeadersMiddleware'),
    'v2/backend/src/app.ts mounts securityHeadersMiddleware'
  );
  assert(
    appCode.includes("app.disable('x-powered-by')"),
    "v2/backend/src/app.ts explicitly disables 'x-powered-by'"
  );

  assert(middlewareCode.includes('X-Content-Type-Options'), 'Middleware configures X-Content-Type-Options');
  assert(middlewareCode.includes('X-Frame-Options'), 'Middleware configures X-Frame-Options');
  assert(middlewareCode.includes('X-XSS-Protection'), 'Middleware configures X-XSS-Protection');
  assert(middlewareCode.includes('Strict-Transport-Security'), 'Middleware configures Strict-Transport-Security');
  assert(middlewareCode.includes('Referrer-Policy'), 'Middleware configures Referrer-Policy');
  assert(middlewareCode.includes('Permissions-Policy'), 'Middleware configures Permissions-Policy');
}

// Live Server HTTP Check
console.log('\n--- 4. Live Express Server HTTP Header Verification ---');

async function testLiveServer() {
  try {
    // Run live test using tsx to import the app
    const testRunnerScript = path.join(rootDir, 'v2/backend/tests/security_legal_devops.test.ts');
    assert(fs.existsSync(testRunnerScript), 'Backend security test file exists');

    const testOutput = execSync('npx tsx --test tests/security_legal_devops.test.ts', {
      cwd: path.join(rootDir, 'v2/backend'),
      encoding: 'utf8',
    });
    
    assert(
      testOutput.includes('5. HTTP Security Headers Hardening (OWASP 2025)'),
      'Live server security headers test suite executed'
    );
    assert(
      testOutput.includes('should return all required OWASP security headers and suppress X-Powered-By'),
      'Live server security headers verified via HTTP'
    );
  } catch (err) {
    assert(false, `Live backend test failed: ${err.message}`);
  }
}

await testLiveServer();

// -----------------------------------------------------------------------------
// 5. Cookie Handling Verification per cookie-debugging guidelines
// -----------------------------------------------------------------------------
console.log('\n--- 5. Testing Cookie Handling Guidelines (cookie-debugging) ---');

const cookieUtilPath = path.join(rootDir, 'v2/backend/src/utils/cookie.ts');
assert(fs.existsSync(cookieUtilPath), 'v2/backend/src/utils/cookie.ts utility exists');

if (fs.existsSync(cookieUtilPath)) {
  const cookieCode = fs.readFileSync(cookieUtilPath, 'utf8');

  assert(cookieCode.includes('httpOnly: true'), 'Cookie utility enforces httpOnly: true (XSS protection)');
  assert(
    cookieCode.includes('secure: isProduction'),
    'Cookie utility enforces secure: true in production (HTTPS)'
  );
  assert(
    cookieCode.includes("sameSite: 'lax'") || cookieCode.includes("sameSite: 'strict'"),
    'Cookie utility enforces SameSite=Lax/Strict (CSRF protection)'
  );
}

// -----------------------------------------------------------------------------
// Final Audit Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TOTAL CHECKS: ${totalTests}`);
console.log(`PASSED:       ${passedTests}`);
console.log(`FAILED:       ${failedTests}`);
console.log('================================================================');

if (failedTests > 0) {
  console.error('\n[FATAL] Security verification FAILED!');
  process.exit(1);
} else {
  console.log('\n[SUCCESS] All security hardening and OWASP 2025 verifications PASSED!');
  process.exit(0);
}
