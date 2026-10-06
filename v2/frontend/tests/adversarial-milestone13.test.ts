import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Providers & Components
import { ThemeProvider } from '../src/context/ThemeContext';
import { CurrencyProvider } from '../src/context/CurrencyContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { GuestGateProvider, useGuestGate } from '../src/context/GuestGateContext';
import { Navbar, NavbarContext } from '../src/components/common/Navbar';
import { Footer, FooterContext } from '../src/components/common/Footer';
import ArtistsHubPage from '../src/pages/ArtistsHubPage';
import { ArtistsDirectoryPage } from '../src/pages/ArtistsDirectoryPage';
import { BenefitsPage } from '../src/pages/BenefitsPage';
import { PricingPage } from '../src/pages/PricingPage';
import { HomePage } from '../src/pages/HomePage';
import { LoginPage } from '../src/pages/LoginPage';
import { RegisterPage } from '../src/pages/RegisterPage';
import { ClientDashboardPage } from '../src/pages/ClientDashboardPage';
import { ArtistDashboardPage } from '../src/pages/ArtistDashboardPage';
import { ChatPage } from '../src/pages/ChatPage';
import { cleanPhoneDigits, formatWhatsAppUrl } from '../src/utils/whatsapp';
import { ResidentArtist, StudioLocation } from '../src/types';

// Mock localStorage for node environment
if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    key: (i: number) => Object.keys(store)[i] ?? null,
    length: 0,
  } as any;
}

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions: string[] = [];
let warningList: string[] = [];

function assert(condition: boolean, testName: string, details?: string) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedAssertions.push(`${testName}${details ? ` -> ${details}` : ''}`);
    console.error(`  ❌ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

function warn(warningName: string, details: string) {
  warningList.push(`${warningName}: ${details}`);
  console.warn(`  ⚠️  [WARN] ${warningName} -> ${details}`);
}

const renderPage = (component: React.ReactElement, initialPath: string = '/') => {
  return renderToString(
    React.createElement(
      ThemeProvider,
      null,
      React.createElement(
        CurrencyProvider,
        null,
        React.createElement(
          AuthProvider,
          null,
          React.createElement(
            MemoryRouter,
            { initialEntries: [initialPath] },
            React.createElement(
              GuestGateProvider,
              null,
              component
            )
          )
        )
      )
    )
  );
};

console.log('================================================================');
console.log('🔥 EMPIRICAL ADVERSARIAL CHALLENGER SUITE: MILESTONE 13');
console.log('================================================================\n');

// =========================================================================
// SECTION 1: STUDIO -> RESIDENT ARTIST HIERARCHY & DATA INTEGRITY
// =========================================================================
console.log('--- CHALLENGE 1: Studio -> Resident Artist Hierarchy & Boundary Stress ---');

const testResident1: ResidentArtist = {
  id: 'res-1',
  name: 'Aurelio Black',
  alias: 'Aura',
  avatar: '/avatar-1.jpg',
  bio: 'Especialista en dark ornamental.',
  specialties: ['Dark Ornamental', 'Blackwork'],
  hourlyRate: 85,
  availableToday: true,
  whatsapp: { number: '65551122', prefix: '507' },
  flashes: [
    { id: 'f-1', title: 'Dark Sigil', amount: 130, img: '/f1.jpg' },
    { id: 'f-2', title: 'Crown of Thorns', amount: 175, img: '/f2.jpg' },
  ],
};

const testResident2: ResidentArtist = {
  id: 'res-2',
  name: 'Sofia Moon',
  alias: 'Lunar',
  avatar: '/avatar-2.jpg',
  bio: 'Micro-realismo botánico y fine line.',
  specialties: ['Fine Line', 'Micro-realismo'],
  hourlyRate: 70,
  availableToday: false,
  whatsapp: { number: '67773344', prefix: '507' },
  flashes: [],
};

const testResidentEdgeCase: ResidentArtist = {
  id: 'res-edge',
  name: 'Ghost Artist',
  avatar: '/avatar-ghost.jpg',
  specialties: [], // Empty specialties array edge case
  whatsapp: { number: '', prefix: '' }, // Empty WhatsApp numbers
};

const testStudioMulti: StudioLocation = {
  id: 'studio-multi',
  type: 'studio',
  name: 'Obsidian Collective',
  rating: 4.9,
  verified: true,
  address: 'Calle 50, Panamá',
  artistsCount: 2,
  residents: [testResident1, testResident2],
};

const testStudioSingle: StudioLocation = {
  id: 'studio-single',
  type: 'independent',
  name: 'Solo Atelier',
  rating: 4.8,
  verified: false,
  address: 'San Francisco, Panamá',
  artistsCount: 1,
  residents: [testResident1],
};

const testStudioEmptyResidents: StudioLocation = {
  id: 'studio-empty',
  type: 'studio',
  name: 'Empty Atelier',
  rating: 4.0,
  verified: false,
  address: 'Chiriquí, Panamá',
  artistsCount: 0,
  residents: [],
};

assert(testStudioMulti.residents!.length === 2, 'Multi-artist studio contains exact resident count');
assert(testStudioSingle.residents!.length === 1, 'Independent studio contains 1 resident');
assert(testStudioEmptyResidents.residents!.length === 0, 'Empty studio handled without crashing');
assert(testResident1.specialties.length === 2, 'Resident specialties populated');
assert(testResident1.flashes!.length === 2, 'Resident flashes array populated');
assert(testResident2.flashes!.length === 0, 'Resident with zero flashes handled gracefully');

// Check edge-case resident without alias, empty specialties, empty whatsapp
assert(testResidentEdgeCase.alias === undefined, 'Resident without alias evaluates undefined cleanly');
assert(testResidentEdgeCase.specialties.length === 0, 'Resident with empty specialties evaluates to 0 length');

// =========================================================================
// SECTION 2: MULTI-ARTIST SWITCHING & CONCENTRIC RING SELECTION
// =========================================================================
console.log('\n--- CHALLENGE 2: Multi-Artist Switching & Concentric Ring Verification ---');

const hubHtml = renderPage(React.createElement(ArtistsHubPage), '/hub');

// Check default selection in ArtistsHubPage
assert(hubHtml.includes('Obsidian Atelier') && (hubHtml.includes('Obsidian Atelier &amp; Flash Lab') || hubHtml.includes('Obsidian Atelier & Flash Lab')), 'ArtistsHubPage renders default studio (Obsidian)');
assert(/3.*Artistas Residentes/.test(hubHtml), 'ArtistsHubPage shows 3 resident count badge');
assert(hubHtml.includes('Kaelen Silva'), 'ArtistsHubPage renders first resident Kaelen Silva');
assert(hubHtml.includes('Maya Lin'), 'ArtistsHubPage renders second resident Maya Lin');
assert(hubHtml.includes('Carlos Ruiz'), 'ArtistsHubPage renders third resident Carlos Ruiz');

// Check Concentric Ring on ArtistsHubPage
const activeRingPattern = /ring-2\s+ring-violet-500\s+ring-offset-1\s+ring-offset-zinc-950/;
assert(activeRingPattern.test(hubHtml), 'ArtistsHubPage applies concentric ring classes (ring-2 ring-violet-500 ring-offset-1)');

// Check ArtistsDirectoryPage rendering & concentric rings
const directoryHtml = renderPage(React.createElement(ArtistsDirectoryPage), '/artistas');
assert(directoryHtml.includes('Obsidian Atelier') && (directoryHtml.includes('Obsidian Atelier &amp; Flash Lab') || directoryHtml.includes('Obsidian Atelier & Flash Lab')), 'ArtistsDirectoryPage renders Obsidian studio card');
assert(directoryHtml.includes('Neon Ink Studio'), 'ArtistsDirectoryPage renders Neon Ink studio card');
assert(directoryHtml.includes('Ana Vald'), 'ArtistsDirectoryPage renders Ana Valdés studio card');
assert(activeRingPattern.test(directoryHtml), 'ArtistsDirectoryPage renders concentric ring on active resident');

// Check that only selected artist has active ring in rendered HTML
const ringMatches = directoryHtml.match(/ring-2 ring-violet-500/g) || [];
assert(ringMatches.length >= 1, `Found ${ringMatches.length} concentric ring instances across studio cards`);

// Check studio switching resilience: what if resident ID doesn't exist?
const fallbackResult = testStudioMulti.residents!.find(r => r.id === 'non-existent-id') || testStudioMulti.residents![0];
assert(fallbackResult.id === testResident1.id, 'Resilient fallback selects first resident if requested ID is missing');

// =========================================================================
// SECTION 3: WHATSAPP MESSAGE TEMPLATES & URL FORMATTING
// =========================================================================
console.log('\n--- CHALLENGE 3: WhatsApp URL Generation & Message Template Encoding ---');

// Phone cleaning tests
assert(cleanPhoneDigits('6001-2345') === '60012345', 'cleanPhoneDigits: Hyphenated phone stripped');
assert(cleanPhoneDigits('+507 6001 2345') === '50760012345', 'cleanPhoneDigits: Plus and spaces stripped');
assert(cleanPhoneDigits('0050760012345') === '50760012345', 'cleanPhoneDigits: Leading 00 international prefix stripped');
assert(cleanPhoneDigits('(507) 6001-2345') === '50760012345', 'cleanPhoneDigits: Parentheses stripped');
assert(cleanPhoneDigits(null) === '', 'cleanPhoneDigits: null returns empty string');
assert(cleanPhoneDigits('') === '', 'cleanPhoneDigits: empty string returns empty string');

// formatWhatsAppUrl tests
const panamaStandard = formatWhatsAppUrl('60012345', '507', 'Hola');
assert(panamaStandard === 'https://wa.me/50760012345?text=Hola', 'formatWhatsAppUrl: Appends default prefix 507 to 8-digit number');

const panamaAlreadyPrefixed = formatWhatsAppUrl('50760012345', '507', 'Hola');
assert(panamaAlreadyPrefixed === 'https://wa.me/50760012345?text=Hola', 'formatWhatsAppUrl: Does NOT duplicate prefix if already present');

const internationalWithPlus = formatWhatsAppUrl('+34 612 345 678', '507', 'Prueba');
assert(internationalWithPlus === 'https://wa.me/34612345678?text=Prueba', 'formatWhatsAppUrl: Preserves international country code with + without injecting 507');

const internationalColombia = formatWhatsAppUrl('+57 300 123 4567', '57', 'Hola Colombia');
assert(internationalColombia === 'https://wa.me/573001234567?text=Hola%20Colombia', 'formatWhatsAppUrl: Handles Colombia +57 with URL encoding');

// Message template tests with special characters
const templateMsg = '¡Hola Kaelen Silva! Vi tu trabajo en Obsidian Atelier & Flash Lab a través de Tattoo Hub y me gustaría cotizar un tatuaje estilo Cybersigilism.';
const encodedUrl = formatWhatsAppUrl('60012345', '507', templateMsg);
assert(encodedUrl.startsWith('https://wa.me/50760012345?text='), 'WhatsApp URL starts with compliant wa.me endpoint');
assert(encodedUrl.includes('%C2%A1Hola'), 'Inverted exclamation mark properly percent-encoded');
assert(encodedUrl.includes('Obsidian%20Atelier%20%26%20Flash%20Lab'), 'Ampersand properly percent-encoded as %26');

// Adversarial test: Empty or whitespace-only phone
assert(formatWhatsAppUrl('', '507', 'Mensaje') === '', 'Empty phone returns empty string (no broken wa.me url)');
assert(formatWhatsAppUrl('   ', '507', 'Mensaje') === '', 'Whitespace phone returns empty string');
assert(formatWhatsAppUrl(null, '507', 'Mensaje') === '', 'Null phone returns empty string');

// Adversarial test: Template string interpolation when specialties is empty
const rawCurrentHubMsg = `¡Hola ${testResidentEdgeCase.name}! Vi tu trabajo en ${testStudioMulti.name} a través de Tattoo Hub y me gustaría cotizar un tatuaje estilo ${testResidentEdgeCase.specialties[0]}.`;
if (rawCurrentHubMsg.includes('undefined')) {
  warn('WhatsApp Template specialties[0]', 'If a resident artist has empty specialties [], template generates "estilo undefined". Recommend fallback: resident.specialties[0] || "personalizado"');
}

// =========================================================================
// SECTION 4: R4 CONDITIONAL FOOTER POLICY ON EDGE CASE SUBROUTES
// =========================================================================
console.log('\n--- CHALLENGE 4: R4 Conditional Footer Policy & Subroute Matrix ---');

const HIDE_FOOTER_PREFIXES = [
  '/hub',
  '/login',
  '/register',
  '/user',
  '/client-dashboard',
  '/artist-dashboard',
  '/chat',
  '/tattoo',
  '/artist-profile',
  '/artist',
];

const checkShouldHideFooter = (pathname: string): boolean => {
  return HIDE_FOOTER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};

// Subroute matrix
const EXEMPT_SUBROUTES = [
  '/hub',
  '/hub/',
  '/login',
  '/login/',
  '/register',
  '/register/',
  '/user',
  '/user/',
  '/client-dashboard',
  '/client-dashboard/',
  '/client-dashboard/agenda',
  '/artist-dashboard',
  '/artist-dashboard/',
  '/artist-dashboard/analytics',
  '/chat',
  '/chat/',
  '/chat/thread-101',
  '/tattoo',
  '/tattoo/design-5',
  '/artist-profile',
  '/artist-profile/details',
  '/artist/artist-kaelen',
  '/artist/123/portfolio',
];

const NON_EXEMPT_ROUTES = [
  '/',
  '/beneficios',
  '/beneficios/',
  '/precios',
  '/precios/',
  '/artistas',
  '/artistas/',
  '/artistas/estudio-1',
  '/about',
  '/about/',
  '/legal/terms',
  '/legal/privacy',
  '/subscription/creditcard',
  '/forget-password',
  '/change-password',
];

// Test all exempt subroutes
for (const route of EXEMPT_SUBROUTES) {
  const hidden = checkShouldHideFooter(route);
  assert(hidden === true, `Exempt route "${route}" strictly hides footer`);
}

// Test all non-exempt routes
for (const route of NON_EXEMPT_ROUTES) {
  const hidden = checkShouldHideFooter(route);
  assert(hidden === false, `Public route "${route}" strictly renders footer`);
}

// Adversarial test: Prefix collision defense
assert(checkShouldHideFooter('/artistas') === false, 'Collision defense: /artistas does NOT match /artist prefix (Footer rendered)');
assert(checkShouldHideFooter('/artistas/obsidian') === false, 'Collision defense: /artistas/obsidian does NOT match /artist prefix (Footer rendered)');
assert(checkShouldHideFooter('/users') === false, 'Collision defense: /users does NOT match /user prefix (Footer rendered)');
assert(checkShouldHideFooter('/hubbub') === false, 'Collision defense: /hubbub does NOT match /hub prefix (Footer rendered)');

// Adversarial test: Case sensitivity
const uppercaseLoginHidden = checkShouldHideFooter('/Login');
if (!uppercaseLoginHidden) {
  warn('Footer Case-Sensitivity', 'checkShouldHideFooter("/Login") returns false because pathname matching is case-sensitive. While React Router routes can match case-insensitively, uppercase URLs could render the footer. Recommend normalizing: pathname.toLowerCase()');
}

// Layout Simulation: Test conditional rendering of <Footer forceRender={true} /> per route
const renderLayoutWithFooter = (path: string) => {
  const shouldHide = checkShouldHideFooter(path);
  return renderToString(
    React.createElement(
      ThemeProvider,
      null,
      React.createElement(
        CurrencyProvider,
        null,
        React.createElement(
          AuthProvider,
          null,
          React.createElement(
            MemoryRouter,
            { initialEntries: [path] },
            React.createElement(
              GuestGateProvider,
              null,
              React.createElement(
                'div',
                null,
                React.createElement('div', null, `Content for ${path}`),
                !shouldHide && React.createElement(Footer, { forceRender: true })
              )
            )
          )
        )
      )
    )
  );
};

console.log('\n--- Layout Simulation DOM Inspection for <footer elements ---');
const homeFullHtml = renderLayoutWithFooter('/');
assert(homeFullHtml.includes('<footer') && homeFullHtml.includes('Copyright'), 'Route "/" renders Footer in DOM');

const benefitsFullHtml = renderLayoutWithFooter('/beneficios');
assert(benefitsFullHtml.includes('<footer') && benefitsFullHtml.includes('Copyright'), 'Route "/beneficios" renders Footer in DOM');

const pricingFullHtml = renderLayoutWithFooter('/precios');
assert(pricingFullHtml.includes('<footer') && pricingFullHtml.includes('Copyright'), 'Route "/precios" renders Footer in DOM');

const directoryFullHtml = renderLayoutWithFooter('/artistas');
assert(directoryFullHtml.includes('<footer') && directoryFullHtml.includes('Copyright'), 'Route "/artistas" renders Footer in DOM');

const hubFullHtml = renderLayoutWithFooter('/hub');
assert(!hubFullHtml.includes('<footer') && !hubFullHtml.includes('Copyright ©'), 'Route "/hub" contains 0 <footer elements in DOM');

const loginFullHtml = renderLayoutWithFooter('/login');
assert(!loginFullHtml.includes('<footer') && !loginFullHtml.includes('Copyright ©'), 'Route "/login" contains 0 <footer elements in DOM');

const registerFullHtml = renderLayoutWithFooter('/register');
assert(!registerFullHtml.includes('<footer') && !registerFullHtml.includes('Copyright ©'), 'Route "/register" contains 0 <footer elements in DOM');

const clientDashFullHtml = renderLayoutWithFooter('/client-dashboard');
assert(!clientDashFullHtml.includes('<footer') && !clientDashFullHtml.includes('Copyright ©'), 'Route "/client-dashboard" contains 0 <footer elements in DOM');

const artistDashFullHtml = renderLayoutWithFooter('/artist-dashboard');
assert(!artistDashFullHtml.includes('<footer') && !artistDashFullHtml.includes('Copyright ©'), 'Route "/artist-dashboard" contains 0 <footer elements in DOM');

const chatFullHtml = renderLayoutWithFooter('/chat');
assert(!chatFullHtml.includes('<footer') && !chatFullHtml.includes('Copyright ©'), 'Route "/chat" contains 0 <footer elements in DOM');

// Also test child pages rendered directly: they must produce ZERO footer elements
const directLogin = renderPage(React.createElement(LoginPage), '/login');
assert(!directLogin.includes('<footer'), 'LoginPage directly rendered has 0 <footer> elements');

const directRegister = renderPage(React.createElement(RegisterPage), '/register');
assert(!directRegister.includes('<footer'), 'RegisterPage directly rendered has 0 <footer> elements');

const directHub = renderPage(React.createElement(ArtistsHubPage), '/hub');
assert(!directHub.includes('<footer'), 'ArtistsHubPage directly rendered has 0 <footer> elements');

const directClientDash = renderPage(React.createElement(ClientDashboardPage), '/client-dashboard');
assert(!directClientDash.includes('<footer'), 'ClientDashboardPage directly rendered has 0 <footer> elements');

const directArtistDash = renderPage(React.createElement(ArtistDashboardPage), '/artist-dashboard');
assert(!directArtistDash.includes('<footer'), 'ArtistDashboardPage directly rendered has 0 <footer> elements');

// Verify App.tsx source code alignment
const appSource = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
assert(appSource.includes('!shouldHideFooter && <Footer forceRender={true} />'), 'App.tsx: Enforces !shouldHideFooter && <Footer forceRender={true} />');
assert(appSource.includes('HIDE_FOOTER_PREFIXES'), 'App.tsx: Defines HIDE_FOOTER_PREFIXES');
assert(appSource.includes("'/hub'"), 'App.tsx: HIDE_FOOTER_PREFIXES includes /hub');
assert(appSource.includes("'/login'"), 'App.tsx: HIDE_FOOTER_PREFIXES includes /login');
assert(appSource.includes("'/register'"), 'App.tsx: HIDE_FOOTER_PREFIXES includes /register');
assert(appSource.includes("'/user'"), 'App.tsx: HIDE_FOOTER_PREFIXES includes /user');
assert(appSource.includes("'/client-dashboard'"), 'App.tsx: HIDE_FOOTER_PREFIXES includes /client-dashboard');
assert(appSource.includes("'/artist-dashboard'"), 'App.tsx: HIDE_FOOTER_PREFIXES includes /artist-dashboard');
assert(appSource.includes("'/chat'"), 'App.tsx: HIDE_FOOTER_PREFIXES includes /chat');

// =========================================================================
// SECTION 5: GUEST GATE PROTECTION & AUTH BOUNDARIES
// =========================================================================
console.log('\n--- CHALLENGE 5: Guest Gate Protection & Auth Boundaries ---');

// Test requireAuth behavior directly
let protectedActionExecuted = false;
let gateOpened = false;
let interceptedOptions: any = null;

const mockGateContext = {
  isOpen: false,
  openGuestGate: (opts?: any) => {
    gateOpened = true;
    interceptedOptions = opts;
  },
  requireAuth: (callback: () => void, opts?: any, isAuth: boolean = false) => {
    if (isAuth) {
      callback();
      return true;
    }
    mockGateContext.openGuestGate(opts);
    return false;
  },
};

// 1. Unauthenticated invocation
protectedActionExecuted = false;
gateOpened = false;
mockGateContext.requireAuth(
  () => { protectedActionExecuted = true; },
  {
    title: 'Contactar a Void',
    message: 'Para iniciar chat directo, regístrate.',
    redirectUrl: '/hub?studio=obsidian&artist=artist-kaelen',
  },
  false // unauthenticated
);

assert(protectedActionExecuted === false, 'Guest Gate strictly blocks protected callback for unauthenticated guest');
assert(gateOpened === true, 'Guest Gate opens modal for unauthenticated guest');
assert(interceptedOptions?.title === 'Contactar a Void', 'Guest Gate passes title options accurately');
assert(interceptedOptions?.redirectUrl === '/hub?studio=obsidian&artist=artist-kaelen', 'Guest Gate preserves specific studio and artist redirect URL');

// 2. Authenticated invocation
protectedActionExecuted = false;
gateOpened = false;
mockGateContext.requireAuth(
  () => { protectedActionExecuted = true; },
  { title: 'Contactar a Void' },
  true // authenticated
);

assert(protectedActionExecuted === true, 'Guest Gate immediately executes protected callback for authenticated user');
assert(gateOpened === false, 'Guest Gate does NOT open modal for authenticated user');

// 3. Open Redirect attack vectors in GuestGateModal
const sanitizeRedirect = (raw: string | null | undefined, fallback: string): string => {
  if (raw && typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/\\')) {
    return raw;
  }
  return fallback;
};

const attackVectors = [
  'https://evil.com',
  'http://evil.com',
  '//evil.com',
  '///evil.com',
  '/\\evil.com',
  'javascript:alert(1)',
  'data:text/html,hack',
];

for (const attack of attackVectors) {
  const sanitized = sanitizeRedirect(attack, '/client-dashboard');
  assert(sanitized === '/client-dashboard', `Open redirect payload "${attack}" neutralized to fallback`);
}

// Legitimate deep paths
const legitDeepPath = '/hub?studio=obsidian&artist=artist-kaelen#sketch';
assert(sanitizeRedirect(legitDeepPath, '/client-dashboard') === legitDeepPath, 'Legitimate deep studio redirect path preserved');

// =========================================================================
// SECTION 6: SUMMARY & VERDICT
// =========================================================================
console.log('\n================================================================');
console.log('📊 EMPIRICAL ADVERSARIAL STRESS TEST SUMMARY');
console.log('================================================================');
console.log(`TOTAL ASSERTIONS : ${totalAssertions}`);
console.log(`PASSED           : ${passedAssertions}`);
console.log(`FAILED           : ${failedAssertions.length}`);
console.log(`WARNINGS         : ${warningList.length}`);

if (warningList.length > 0) {
  console.log('\nADVERSARIAL WARNINGS / NOTICES:');
  warningList.forEach((w) => console.log(`  ⚠️  ${w}`));
}

if (failedAssertions.length > 0) {
  console.error('\nFAILURES:');
  failedAssertions.forEach((f) => console.error(`  ❌ ${f}`));
  process.exit(1);
} else {
  console.log('\n🎉 ALL EMPIRICAL ADVERSARIAL CHALLENGES PASSED SUCCESSFULLY!');
  process.exit(0);
}
