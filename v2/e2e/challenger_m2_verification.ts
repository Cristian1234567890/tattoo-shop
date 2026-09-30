/**
 * Challenger 1: Empirical Adversarial Verification Suite for Milestone 2
 * Focus: Contact & WhatsApp Integration
 * 
 * Verifies:
 * 1. formatWhatsAppUrl contract & stress test (digits stripping, prefixes, wa.me/<digits> format)
 * 2. InternationalPhoneInput component contract & structure
 * 3. ArtistProfilePage dual-mode view & WhatsApp action button
 * 4. ArtistCard WhatsApp button integration
 * 5. Backend migration 06 & single-artist lookup route
 * 6. Adversarial edge-case analysis & bug detection
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, '../frontend');
const BACKEND_DIR = path.resolve(__dirname, '../backend');

// Dynamic import of whatsapp utility
const { formatWhatsAppUrl, cleanPhoneDigits } = await import(
  '../frontend/src/utils/whatsapp.ts'
);

interface TestResult {
  id: string;
  suite: string;
  name: string;
  passed: boolean;
  actual: any;
  expected: any;
  error?: string;
}

const results: TestResult[] = [];

function recordTest(
  id: string,
  suite: string,
  name: string,
  passed: boolean,
  actual: any,
  expected: any,
  error?: string
) {
  results.push({ id, suite, name, passed, actual, expected, error });
  const status = passed ? '✓ PASS' : '✗ FAIL';
  console.log(`  ${status} [${id}] ${name}`);
  if (!passed) {
    console.error(`      Actual:   ${JSON.stringify(actual)}`);
    console.error(`      Expected: ${JSON.stringify(expected)}`);
    if (error) console.error(`      Error:    ${error}`);
  }
}

console.log('=============================================================');
console.log('  CHALLENGER 1: MILESTONE 2 EMPIRICAL VERIFICATION HARNESS');
console.log('=============================================================\n');

// ---------------------------------------------------------------------------
// SUITE 1: formatWhatsAppUrl Contract & Stress Testing
// ---------------------------------------------------------------------------
console.log('[Suite 1: formatWhatsAppUrl & cleanPhoneDigits]');

const waTestCases = [
  { id: 'WA-01', name: 'International prefix with spaces & dash (+507 6000-1111)', input: ['+507 6000-1111'], expected: 'https://wa.me/50760001111' },
  { id: 'WA-02', name: 'Local 8 digits without prefix (60001111) -> prepends 507', input: ['60001111'], expected: 'https://wa.me/50760001111' },
  { id: 'WA-03', name: 'Local 8 digits with hyphen (6000-1111)', input: ['6000-1111'], expected: 'https://wa.me/50760001111' },
  { id: 'WA-04', name: 'Local 7 digits Panama landline (2601111)', input: ['2601111'], expected: 'https://wa.me/5072601111' },
  { id: 'WA-05', name: 'Spaces & dashes in foreign number (+57 300-123-4567)', input: ['+57 300-123-4567'], expected: 'https://wa.me/573001234567' },
  { id: 'WA-06', name: 'Special characters & symbols (+507 (6000)-1111!@#)', input: ['+507 (6000)-1111!@#'], expected: 'https://wa.me/50760001111' },
  { id: 'WA-07', name: 'Leading 00 international prefix (0034 612 345 678)', input: ['0034 612 345 678'], expected: 'https://wa.me/34612345678' },
  { id: 'WA-08', name: 'Null phone number -> returns empty string', input: [null], expected: '' },
  { id: 'WA-09', name: 'Undefined phone number -> returns empty string', input: [undefined], expected: '' },
  { id: 'WA-10', name: 'Empty string phone number -> returns empty string', input: [''], expected: '' },
  { id: 'WA-11', name: 'Whitespace only phone number -> returns empty string', input: ['     '], expected: '' },
  { id: 'WA-12', name: 'Only non-digit symbols -> returns empty string', input: ['++--==!!@@'], expected: '' },
  { id: 'WA-13', name: 'Custom prefix parameter: 52 for 8 digits', input: ['12345678', '52'], expected: 'https://wa.me/5212345678' },
  { id: 'WA-14', name: 'Custom prefix with plus: +57 for 8 digits', input: ['12345678', '+57'], expected: 'https://wa.me/5712345678' },
  { id: 'WA-15', name: 'Message encoding in query string', input: ['+507 6000-1111', '507', 'Hola! Cotización'], expected: 'https://wa.me/50760001111?text=Hola!%20Cotizaci%C3%B3n' },
  { id: 'WA-16', name: 'wa.me strict format assertion', input: ['+507 6000-1111'], expectedFormat: /^https:\/\/wa\.me\/\d+$/ },
];

for (const tc of waTestCases) {
  const actual = formatWhatsAppUrl(...(tc.input as [any, any?, any?]));
  const passed = tc.expectedFormat ? tc.expectedFormat.test(actual) : actual === tc.expected;
  recordTest(tc.id, 'formatWhatsAppUrl', tc.name, passed, actual, tc.expected || tc.expectedFormat);
}

// ---------------------------------------------------------------------------
// SUITE 2: InternationalPhoneInput Component Inspection
// ---------------------------------------------------------------------------
console.log('\n[Suite 2: InternationalPhoneInput Component]');

const phoneInputPath = path.resolve(FRONTEND_DIR, 'src/components/common/InternationalPhoneInput.tsx');
const phoneInputExists = fs.existsSync(phoneInputPath);
recordTest('PHONE-01', 'InternationalPhoneInput', 'Component file exists at common/InternationalPhoneInput.tsx', phoneInputExists, phoneInputExists, true);

if (phoneInputExists) {
  const phoneSrc = fs.readFileSync(phoneInputPath, 'utf-8');

  recordTest('PHONE-02', 'InternationalPhoneInput', 'Exposes country prefix <select>', phoneSrc.includes('<select'), true, true);
  recordTest('PHONE-03', 'InternationalPhoneInput', 'Select has aria-label="Código de país"', phoneSrc.includes('aria-label="Código de país"'), true, true);
  recordTest('PHONE-04', 'InternationalPhoneInput', 'Renders input type="tel"', phoneSrc.includes('type="tel"'), true, true);
  recordTest('PHONE-05', 'InternationalPhoneInput', 'Defaults id to "phone" and uses id prop', phoneSrc.includes('id = \'phone\'') && phoneSrc.includes('id={id}'), true, true);
  recordTest('PHONE-06', 'InternationalPhoneInput', 'Includes Panama dial code +507', phoneSrc.includes("'+507'"), true, true);
  recordTest('PHONE-07', 'InternationalPhoneInput', 'Includes Colombia dial code +57', phoneSrc.includes("'+57'"), true, true);
  recordTest('PHONE-08', 'InternationalPhoneInput', 'Includes Mexico dial code +52', phoneSrc.includes("'+52'"), true, true);
  recordTest('PHONE-09', 'InternationalPhoneInput', 'Includes USA dial code +1', phoneSrc.includes("'+1'"), true, true);
  recordTest('PHONE-10', 'InternationalPhoneInput', 'Includes Spain dial code +34', phoneSrc.includes("'+34'"), true, true);
  recordTest('PHONE-11', 'InternationalPhoneInput', 'onChange returns prefix, nationalNumber, fullE164', phoneSrc.includes('onChange(newPrefix, cleanNumber, full)') || phoneSrc.includes('onChange(normalizedPrefix, sanitized, full)'), true, true);
}

// ---------------------------------------------------------------------------
// SUITE 3: ArtistProfilePage.tsx Dual-Mode & WhatsApp Link
// ---------------------------------------------------------------------------
console.log('\n[Suite 3: ArtistProfilePage.tsx Integration]');

const artistProfilePath = path.resolve(FRONTEND_DIR, 'src/pages/ArtistProfilePage.tsx');
const artistProfileExists = fs.existsSync(artistProfilePath);
recordTest('PROFILE-01', 'ArtistProfilePage', 'ArtistProfilePage.tsx exists', artistProfileExists, artistProfileExists, true);

if (artistProfileExists) {
  const profileSrc = fs.readFileSync(artistProfilePath, 'utf-8');

  recordTest('PROFILE-02', 'ArtistProfilePage', 'Imports formatWhatsAppUrl utility', profileSrc.includes('formatWhatsAppUrl'), true, true);
  recordTest('PROFILE-03', 'ArtistProfilePage', 'Embeds InternationalPhoneInput in Edit View', profileSrc.includes('<InternationalPhoneInput'), true, true);
  recordTest('PROFILE-04', 'ArtistProfilePage', 'Renders WhatsApp button with id="whatsapp-btn"', profileSrc.includes('id="whatsapp-btn"'), true, true);
  recordTest('PROFILE-05', 'ArtistProfilePage', 'Renders live WhatsApp preview with wa.me/<numero>', profileSrc.includes('wa.me/'), true, true);
  recordTest('PROFILE-06', 'ArtistProfilePage', 'Fetches single artist data via /gettatto/:id', profileSrc.includes('/gettatto/${id}'), true, true);
  
  // ADVERSARIAL CHECK: Does Public View pass waUrl or formatWhatsAppUrl(artist.telefono)?
  const usesWaUrlDirectly = profileSrc.includes('href={waUrl}');
  const usesFormatWithTelefonoOnly = profileSrc.includes('href={formatWhatsAppUrl(artist.telefono)}');
  recordTest(
    'PROFILE-ADV-01',
    'ArtistProfilePage (Adversarial)',
    'Uses waUrl for href instead of recomputing without prefix/fallback',
    usesWaUrlDirectly,
    usesWaUrlDirectly ? 'href={waUrl}' : 'href={formatWhatsAppUrl(artist.telefono)}',
    'href={waUrl}',
    usesFormatWithTelefonoOnly
      ? 'POTENTIAL_DEFECT: line 374 uses href={formatWhatsAppUrl(artist.telefono)} instead of href={waUrl}, causing empty href if only whatsapp_number is populated, or defaulting to +507 for international numbers.'
      : undefined
  );
}

// ---------------------------------------------------------------------------
// SUITE 4: ArtistCard.tsx WhatsApp Button
// ---------------------------------------------------------------------------
console.log('\n[Suite 4: ArtistCard.tsx WhatsApp Button]');

const artistCardPath = path.resolve(FRONTEND_DIR, 'src/components/dashboard/ArtistCard.tsx');
const artistCardExists = fs.existsSync(artistCardPath);
recordTest('CARD-01', 'ArtistCard', 'ArtistCard.tsx exists', artistCardExists, artistCardExists, true);

if (artistCardExists) {
  const cardSrc = fs.readFileSync(artistCardPath, 'utf-8');

  recordTest('CARD-02', 'ArtistCard', 'Renders WhatsApp link with id="whatsapp-btn"', cardSrc.includes('id="whatsapp-btn"'), true, true);
  recordTest('CARD-03', 'ArtistCard', 'Constructs WhatsApp URL using formatWhatsAppUrl', cardSrc.includes('formatWhatsAppUrl(cardData.telefono)'), true, true);
  recordTest('CARD-04', 'ArtistCard', 'Target is _blank with rel="noopener noreferrer"', cardSrc.includes('target="_blank"') && cardSrc.includes('rel="noopener noreferrer"'), true, true);
}

// ---------------------------------------------------------------------------
// SUITE 5: Backend Migration 06 & GET /gettatto/:id
// ---------------------------------------------------------------------------
console.log('\n[Suite 5: Backend Schema & Routes]');

const migrationPath = path.resolve(BACKEND_DIR, 'migrations/06_contact_whatsapp.sql');
const migrationExists = fs.existsSync(migrationPath);
recordTest('BACKEND-01', 'Backend Schema', 'Migration 06_contact_whatsapp.sql exists', migrationExists, migrationExists, true);

if (migrationExists) {
  const migSrc = fs.readFileSync(migrationPath, 'utf-8');
  recordTest('BACKEND-02', 'Backend Schema', 'Migration adds country column', migSrc.includes('country'), true, true);
  recordTest('BACKEND-03', 'Backend Schema', 'Migration adds city column', migSrc.includes('city'), true, true);
  recordTest('BACKEND-04', 'Backend Schema', 'Migration adds phone_prefix column', migSrc.includes('phone_prefix'), true, true);
  recordTest('BACKEND-05', 'Backend Schema', 'Migration adds whatsapp_number column', migSrc.includes('whatsapp_number'), true, true);
}

const routesPath = path.resolve(BACKEND_DIR, 'src/routes/tattoo.routes.ts');
if (fs.existsSync(routesPath)) {
  const routesSrc = fs.readFileSync(routesPath, 'utf-8');
  recordTest('BACKEND-06', 'Backend Routes', 'Declares GET /gettatto/:id endpoint', routesSrc.includes("router.get('/gettatto/:id'"), true, true);
}

const servicePath = path.resolve(BACKEND_DIR, 'src/services/tattoo.service.ts');
if (fs.existsSync(servicePath)) {
  const serviceSrc = fs.readFileSync(servicePath, 'utf-8');
  recordTest('BACKEND-07', 'Backend Service', 'Implements getTattoById method with maybeSingle()', serviceSrc.includes('getTattoById') && serviceSrc.includes('maybeSingle()'), true, true);
}

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log('\n=============================================================');
console.log('  CHALLENGER 1: MILESTONE 2 TEST SUMMARY');
console.log('=============================================================');

const passedCount = results.filter(r => r.passed).length;
const totalCount = results.length;
const failedCount = totalCount - passedCount;

console.log(`Total tests executed : ${totalCount}`);
console.log(`Tests passed          : ${passedCount}`);
console.log(`Tests failed          : ${failedCount}`);

if (failedCount > 0) {
  console.log('\nFailed Tests:');
  for (const f of results.filter(r => !r.passed)) {
    console.log(`  - [${f.id}] ${f.name} (${f.error || 'Assertion failed'})`);
  }
}

console.log('=============================================================\n');
