/**
 * Challenger 2: Empirical Re-verification Test for Milestone 2 Remediation
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, '../frontend');

const { formatWhatsAppUrl, cleanPhoneDigits } = await import(
  '../frontend/src/utils/whatsapp.ts'
);

let failures = 0;
let passed = 0;

function assert(condition: boolean, desc: string, details?: any) {
  if (condition) {
    console.log(`  ✓ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    if (details) console.error(`    Details:`, details);
    failures++;
  }
}

console.log('=============================================================');
console.log('  CHALLENGER 2: MILESTONE 2 RE-VERIFICATION HARNESS');
console.log('=============================================================\n');

// 1. Inspect ArtistProfilePage.tsx
console.log('[Check 1: ArtistProfilePage.tsx Code & Bindings]');
const profileSrc = fs.readFileSync(path.resolve(FRONTEND_DIR, 'src/pages/ArtistProfilePage.tsx'), 'utf-8');

assert(profileSrc.includes("const artistPhone = artist.telefono || artist.whatsapp_number || '';"),
  'ArtistProfilePage evaluates artist.telefono || artist.whatsapp_number');
assert(profileSrc.includes("const artistPrefix = artist.phone_prefix || '507';"),
  'ArtistProfilePage evaluates artist.phone_prefix with 507 fallback');
assert(profileSrc.includes("const waUrl = formatWhatsAppUrl(artistPhone, artistPrefix);"),
  'ArtistProfilePage computes waUrl with artistPhone and artistPrefix');
assert(profileSrc.includes('href={waUrl}'),
  'ArtistProfilePage line 373 binds href={waUrl} directly');
assert(!profileSrc.includes('href={formatWhatsAppUrl(artist.telefono)}'),
  'ArtistProfilePage no longer contains bypass href={formatWhatsAppUrl(artist.telefono)}');

// Simulate ArtistProfilePage link evaluation logic
function evaluateProfileWaUrl(artist: { telefono?: string; whatsapp_number?: string; phone_prefix?: string }) {
  const artistPhone = artist.telefono || artist.whatsapp_number || '';
  const artistPrefix = artist.phone_prefix || '507';
  return formatWhatsAppUrl(artistPhone, artistPrefix);
}

assert(evaluateProfileWaUrl({ whatsapp_number: '60012345', phone_prefix: '+507' }) === 'https://wa.me/50760012345',
  'Profile logic with whatsapp_number only (+507) produces valid wa.me link');
assert(evaluateProfileWaUrl({ telefono: '87654321', phone_prefix: '+57' }) === 'https://wa.me/5787654321',
  'Profile logic with 8-digit phone and Colombian prefix +57 produces valid wa.me link');
assert(evaluateProfileWaUrl({ whatsapp_number: '+57 300 123 4567', phone_prefix: '+57' }) === 'https://wa.me/573001234567',
  'Profile logic with full international phone (+57 300 123 4567) produces valid wa.me link');
assert(evaluateProfileWaUrl({ whatsapp_number: '+55 11 99999-8888', phone_prefix: '+55' }) === 'https://wa.me/5511999998888',
  'Profile logic with full Brazilian phone (+55 11 99999-8888) produces valid wa.me link');
assert(evaluateProfileWaUrl({}) === '',
  'Profile logic with no phone returns empty string (guard hides button)');

// 2. Inspect ArtistCard.tsx
console.log('\n[Check 2: ArtistCard.tsx Code & Evaluation]');
const cardSrc = fs.readFileSync(path.resolve(FRONTEND_DIR, 'src/components/dashboard/ArtistCard.tsx'), 'utf-8');

assert(cardSrc.includes('const phone = cardData.telefono || cardData.whatsapp_number;'),
  'ArtistCard evaluates cardData.telefono || cardData.whatsapp_number');
assert(cardSrc.includes("const prefix = cardData.phone_prefix || '507';"),
  'ArtistCard evaluates cardData.phone_prefix || \'507\'');
assert(cardSrc.includes('href={formatWhatsAppUrl(phone, prefix) || formatWhatsAppUrl(cardData.telefono)}'),
  'ArtistCard passes phone and prefix to formatWhatsAppUrl');
assert(cardSrc.includes('whatsapp_number?: string;'),
  'ArtistCard type definition includes optional whatsapp_number');
assert(cardSrc.includes('phone_prefix?: string;'),
  'ArtistCard type definition includes optional phone_prefix');

// Simulate ArtistCard evaluation logic
function evaluateCardLink(cardData: { telefono?: string; whatsapp_number?: string; phone_prefix?: string }) {
  const phone = cardData.telefono || cardData.whatsapp_number;
  const prefix = cardData.phone_prefix || '507';
  return phone ? (formatWhatsAppUrl(phone, prefix) || formatWhatsAppUrl(cardData.telefono)) : null;
}

assert(evaluateCardLink({ whatsapp_number: '60012345' }) === 'https://wa.me/50760012345',
  'Card logic with whatsapp_number only produces valid wa.me link with default 507');
assert(evaluateCardLink({ whatsapp_number: '87654321', phone_prefix: '+57' }) === 'https://wa.me/5787654321',
  'Card logic with 8-digit phone and Colombian prefix +57 produces valid wa.me link');
assert(evaluateCardLink({ telefono: '+34 612 345 678', phone_prefix: '+34' }) === 'https://wa.me/34612345678',
  'Card logic with full Spanish international number (+34 612 345 678) produces valid wa.me link');
assert(evaluateCardLink({}) === null,
  'Card logic with neither telefono nor whatsapp_number returns null (no button rendered)');

console.log('\n=============================================================');
console.log(`Results: ${passed} passed, ${failures} failed.`);
console.log('=============================================================');

if (failures > 0) {
  process.exit(1);
}
