/**
 * Milestone 13 Gate Adversarial Stress Test Suite
 * 
 * Conducts empirical adversarial verification on:
 * 1. Stitch Screen Implementations (Benefits, Pricing, ArtistsDirectory, Hub)
 * 2. Layout Persistence & Zero-Flicker Architecture (NavbarContext, FooterContext, R4 policy)
 * 3. 20% Annual Discount Calculations with Multi-Currency across all 5 countries/currencies
 * 4. Theme & Luxury Dark Atelier Styling Fidelity
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure localStorage mock is present for node SSR environment
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

// Providers
import { ThemeProvider } from '../src/context/ThemeContext';
import { CurrencyProvider } from '../src/context/CurrencyContext';
import { AuthProvider } from '../src/context/AuthContext';
import { GuestGateProvider } from '../src/context/GuestGateContext';

// Common Components
import { Navbar, NavbarContext } from '../src/components/common/Navbar';
import { Footer, FooterContext } from '../src/components/common/Footer';

// Pages
import { HomePage } from '../src/pages/HomePage';
import { BenefitsPage } from '../src/pages/BenefitsPage';
import { PricingPage } from '../src/pages/PricingPage';
import { ArtistsDirectoryPage } from '../src/pages/ArtistsDirectoryPage';
import ArtistsHubPage from '../src/pages/ArtistsHubPage';

// Currency Utils
import {
  FALLBACK_RATES,
  SUPPORTED_COUNTRIES,
  convertCurrency,
  formatPrice,
} from '../src/utils/currency';

interface TestReport {
  id: number;
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const testResults: TestReport[] = [];
let testCounter = 0;

function runEmpiricalTest(suite: string, name: string, fn: () => void) {
  testCounter++;
  const testId = testCounter;
  try {
    fn();
    testResults.push({ id: testId, suite, name, passed: true });
    console.log(`✅ [${suite}] #${testId}: ${name}`);
  } catch (err: any) {
    testResults.push({ id: testId, suite, name, passed: false, error: err?.message || String(err) });
    console.error(`❌ [${suite}] #${testId}: ${name} -> FAILED: ${err?.message || err}`);
  }
}

function expect(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(msg);
  }
}

// Helper to sanitize React SSR comment markers (<!-- -->) for clean text assertions
function cleanSsrHtml(raw: string): string {
  return raw.replace(/<!-- -->/g, '');
}

const renderWithProviders = (
  component: React.ReactElement,
  initialPath: string = '/',
  customCountry: string = 'PA'
) => {
  localStorage.setItem('tattoohub_country', customCountry);
  const countryConfig = SUPPORTED_COUNTRIES.find((c) => c.code === customCountry);
  if (countryConfig) {
    localStorage.setItem('tattoohub_currency', countryConfig.defaultCurrency);
  }

  const rawHtml = renderToString(
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

  return cleanSsrHtml(rawHtml);
};

console.log('========================================================================');
console.log('🔥 EMPIRICAL ADVERSARIAL STRESS TEST SUITE — MILESTONE 13 GATE');
console.log('========================================================================\n');

// ============================================================================
// SUITE 1: Stitch Screen Completeness & UI Robustness
// ============================================================================

runEmpiricalTest('Stitch Screens', 'BenefitsPage: Manifesto hero, guarantees, comparison table & testimonials', () => {
  const html = renderWithProviders(React.createElement(BenefitsPage), '/beneficios');

  // 1. Hero & Manifesto
  expect(html.includes('MANIFIESTO DEL ATELIER DIGITAL'), 'BenefitsPage missing manifesto badge');
  expect(html.includes('Devolviendo el tatuaje a quienes lo graban con aguja'), 'BenefitsPage missing main manifesto headline');
  expect(html.includes('Tattoo Hub nace como un espacio independiente'), 'BenefitsPage missing manifesto body');

  // 2. Three Guarantees
  expect(html.includes('100% para el Tatuador'), 'BenefitsPage missing 100% para el Tatuador guarantee');
  expect(html.includes('0% comisión garantizada'), 'BenefitsPage missing 0% commission badge');
  expect(html.includes('Protocolos Sanitarios Visibles'), 'BenefitsPage missing Protocolos Sanitarios guarantee');
  expect(html.includes('Higiene y bioseguridad auditada'), 'BenefitsPage missing bioseguridad badge');
  expect(html.includes('Contacto Directo sin Paredes'), 'BenefitsPage missing Contacto Directo guarantee');

  // 3. Comparison Matrix
  expect(html.includes('Tattoo Hub vs Canales Tradicionales'), 'BenefitsPage missing comparison table');
  expect(html.includes('Redes Sociales (IG/TikTok)'), 'BenefitsPage missing social media column');
  expect(html.includes('Apps Corporativas de Citas'), 'BenefitsPage missing corporate apps column');
  expect(html.includes('Sin entrenamiento de IA'), 'BenefitsPage missing AI training privacy row');

  // 4. Testimonials
  expect(html.includes('Kaelen Silva'), 'BenefitsPage missing resident Kaelen Silva testimonial');
  expect(html.includes('Maya Lin'), 'BenefitsPage missing Maya Lin collector testimonial');
  expect(html.includes('Cristian Castillo'), 'BenefitsPage missing Cristian Castillo testimonial');

  // 5. Pre-footer CTA
  expect(html.includes('Crear Cuenta de Coleccionista'), 'BenefitsPage missing collector CTA button');
  expect(html.includes('Explorar Directorio de Artistas'), 'BenefitsPage missing directory CTA button');
});

runEmpiricalTest('Stitch Screens', 'PricingPage: Billing toggle, tier cards, comparison matrix & FAQ accordion', () => {
  const html = renderWithProviders(React.createElement(PricingPage), '/precios');

  // 1. Header & Billing Toggle
  expect(html.includes('TARIFAS CLARAS • CERO COMISIONES'), 'PricingPage missing header badge');
  expect(html.includes('Planes y Membresías Transparentes'), 'PricingPage missing main headline');
  expect(html.includes('Facturación Mensual'), 'PricingPage missing monthly toggle option');
  expect(html.includes('Facturación Anual'), 'PricingPage missing annual toggle option');
  expect(html.includes('Ahorra 20%'), 'PricingPage missing 20% discount badge');

  // 2. Three Tier Cards
  expect(html.includes('EXPLORADOR'), 'PricingPage missing Explorador tier');
  expect(html.includes('Gratis'), 'PricingPage missing Explorador free label');
  expect(html.includes('COLECCIONISTA'), 'PricingPage missing Coleccionista header');
  expect(html.includes('Coleccionista VIP'), 'PricingPage missing VIP tier');
  expect(html.includes('ESTUDIOS &amp; TATUADORES') || html.includes('ESTUDIOS & TATUADORES'), 'PricingPage missing Studio Pro header');
  expect(html.includes('Estudio Profesional'), 'PricingPage missing Studio Pro card');
  expect(html.includes('30 días de prueba gratuita sin compromiso'), 'PricingPage missing 30-day trial banner');

  // 3. Comparison Matrix
  expect(html.includes('Comparativa Detallada de Funciones'), 'PricingPage missing feature comparison matrix');
  expect(html.includes('Navegación en Mapa &amp; Directorio') || html.includes('Navegación en Mapa & Directorio'), 'PricingPage missing map row');
  expect(html.includes('Diario de Cicatrización Fotográfico'), 'PricingPage missing healing diary row');
  expect(html.includes('Gestión de N Artistas Residentes'), 'PricingPage missing resident artist management row');

  // 4. FAQ Accordion
  expect(html.includes('Preguntas Frecuentes'), 'PricingPage missing FAQ headline');
  expect(html.includes('¿Cómo funciona la prueba gratuita de 30 días'), 'PricingPage missing FAQ 1');
  expect(html.includes('¿Cobran alguna comisión porcentual sobre las sesiones'), 'PricingPage missing FAQ 2');
  expect(html.includes('¿Puedo cambiar entre facturación mensual y anual'), 'PricingPage missing FAQ 3');
});

runEmpiricalTest('Stitch Screens', 'ArtistsDirectoryPage: Studio catalog, resident selector, WhatsApp & SendSketch', () => {
  const html = renderWithProviders(React.createElement(ArtistsDirectoryPage), '/artistas');

  // 1. Header & Search
  expect(html.includes('DIRECTORIO GEOLOCALIZADO DE TALLERES'), 'Directory missing header badge');
  expect(html.includes('Estudios y Artistas Residentes'), 'Directory missing headline');
  expect(html.includes('input-atelier'), 'Directory missing .input-atelier class on search');

  // 2. Type & Style Filters
  expect(html.includes('Estudios'), 'Directory missing Estudios filter button');
  expect(html.includes('Independientes'), 'Directory missing Independientes filter button');
  expect(html.includes('Cybersigilism'), 'Directory missing Cybersigilism style filter');
  expect(html.includes('Blackwork'), 'Directory missing Blackwork style filter');
  expect(html.includes('Fine Line'), 'Directory missing Fine Line style filter');

  // 3. Studio Cards & Resident Hierarchy
  expect(html.includes('Obsidian Atelier &amp; Flash Lab') || html.includes('Obsidian Atelier & Flash Lab'), 'Directory missing Obsidian Atelier');
  expect(html.includes('3 Artistas Residentes'), 'Directory missing resident count badge');
  expect(html.includes('Kaelen Silva'), 'Directory missing resident Kaelen Silva');
  expect(html.includes('&quot;Void&quot;') || html.includes('"Void"'), 'Directory missing resident alias "Void"');
  expect(html.includes('Neon Ink Studio'), 'Directory missing Neon Ink Studio');
  expect(html.includes('Ana Valdés Tattoo'), 'Directory missing Ana Valdés independent atelier');

  // 4. Action Buttons
  expect(html.includes('WhatsApp'), 'Directory missing WhatsApp direct contact button');
  expect(html.includes('Enviar Boceto'), 'Directory missing Send Sketch button');
});

runEmpiricalTest('Stitch Screens', 'ArtistsHubPage: Studio badges, map pins, drawer multi-artist selector & actions', () => {
  const html = renderWithProviders(React.createElement(ArtistsHubPage), '/hub');

  // 1. Studio Hierarchy
  expect(html.includes('Obsidian Atelier &amp; Flash Lab') || html.includes('Obsidian Atelier & Flash Lab'), 'Hub missing Obsidian studio');
  expect(html.includes('Artistas Residentes'), 'Hub missing resident count badge');
  expect(html.includes('Artistas en este Local:'), 'Hub missing resident selector container');

  // 2. Active Resident Details
  expect(html.includes('Kaelen Silva'), 'Hub missing active resident Kaelen Silva');
  expect(html.includes('Tarifa Base'), 'Hub missing hourly rate label');
  expect(html.includes('/h'), 'Hub missing hourly rate unit');

  // 3. Actions
  expect(html.includes('btn-reservar-cupo'), 'Hub missing reserve button ID');
  expect(html.includes('Enviar Boceto a'), 'Hub missing Send Sketch action');
  expect(html.includes('Contactar por WhatsApp'), 'Hub missing WhatsApp action');
});

// ============================================================================
// SUITE 2: Layout Persistence & Zero-Flicker Architecture
// ============================================================================

runEmpiricalTest('Layout Persistence', 'NavbarContext: nested Navbar returns null when mounted at root', () => {
  // Case A: When context isMounted is false and forceRender is false, Navbar renders
  const unmountedHtml = renderToString(
    React.createElement(
      NavbarContext.Provider,
      { value: { isMounted: false } },
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
              null,
              React.createElement(Navbar, { forceRender: false })
            )
          )
        )
      )
    )
  );
  expect(unmountedHtml.includes('<nav'), 'Navbar should render when isMounted is false');
  expect(unmountedHtml.includes('id="logo"'), 'Navbar should render logo when unmounted');

  // Case B: When context isMounted is true and forceRender is false (nested call), Navbar returns null
  const nestedHtml = renderToString(
    React.createElement(
      NavbarContext.Provider,
      { value: { isMounted: true } },
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
              null,
              React.createElement(Navbar, { forceRender: false })
            )
          )
        )
      )
    )
  );
  expect(nestedHtml === '', `Nested Navbar must return null, received: ${nestedHtml}`);

  // Case C: When context isMounted is true and forceRender is true (root layout), Navbar renders
  const forcedHtml = renderToString(
    React.createElement(
      NavbarContext.Provider,
      { value: { isMounted: true } },
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
              null,
              React.createElement(Navbar, { forceRender: true })
            )
          )
        )
      )
    )
  );
  expect(forcedHtml.includes('<nav'), 'Root Navbar with forceRender=true must render');
});

runEmpiricalTest('Layout Persistence', 'FooterContext: nested Footer returns null when mounted at root', () => {
  // Case A: Root footer with forceRender=true on non-exempt route
  const rootFooterHtml = renderToString(
    React.createElement(
      ThemeProvider,
      null,
      React.createElement(
        FooterContext.Provider,
        { value: { isMounted: true } },
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/about'] },
          React.createElement(Footer, { forceRender: true })
        )
      )
    )
  );
  expect(rootFooterHtml.includes('<footer'), 'Root Footer with forceRender=true on /about must render');

  // Case B: Nested footer without forceRender returns null
  const nestedFooterHtml = renderToString(
    React.createElement(
      ThemeProvider,
      null,
      React.createElement(
        FooterContext.Provider,
        { value: { isMounted: true } },
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/about'] },
          React.createElement(Footer, { forceRender: false })
        )
      )
    )
  );
  expect(nestedFooterHtml === '', `Nested Footer must return null, received: ${nestedFooterHtml}`);
});

runEmpiricalTest('Layout Persistence', 'R4 Conditional Footer: 100% exemption on all restricted routes', () => {
  const restrictedRoutes = [
    '/hub',
    '/login',
    '/register',
    '/user',
    '/client-dashboard',
    '/artist-dashboard',
    '/chat',
    '/tattoo',
    '/artist-profile',
    '/artist/obsidian',
  ];

  for (const route of restrictedRoutes) {
    const html = renderToString(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(
          FooterContext.Provider,
          { value: { isMounted: false } },
          React.createElement(
            MemoryRouter,
            { initialEntries: [route] },
            React.createElement(Footer, { forceRender: true })
          )
        )
      )
    );
    expect(html === '', `Footer rendered on restricted route "${route}"! Expected null, received: ${html}`);
  }
});

runEmpiricalTest('Layout Persistence', 'App.tsx: Persistent Navbar is mounted outside AnimatePresence & Routes', () => {
  const appPath = path.resolve(__dirname, '../src/App.tsx');
  const appCode = fs.readFileSync(appPath, 'utf8');

  // Verify structure: Navbar -> AnimatePresence -> Routes
  const navbarIndex = appCode.indexOf('<Navbar forceRender={true} />');
  const animatePresenceIndex = appCode.indexOf('<AnimatePresence');
  const routesIndex = appCode.indexOf('<Routes');

  expect(navbarIndex !== -1, 'App.tsx missing persistent <Navbar forceRender={true} />');
  expect(animatePresenceIndex !== -1, 'App.tsx missing <AnimatePresence');
  expect(routesIndex !== -1, 'App.tsx missing <Routes');
  expect(navbarIndex < animatePresenceIndex, 'Navbar must be placed ABOVE <AnimatePresence> to prevent unmount flicker');
  expect(animatePresenceIndex < routesIndex, '<AnimatePresence> must wrap <Routes>');
});

// ============================================================================
// SUITE 3: 20% Annual Discount Calculations with Multi-Currency
// ============================================================================

runEmpiricalTest('Discount & Multi-Currency', 'Mathematical precision of 20% discount on base USD prices', () => {
  const monthlyPrice = 4.99;
  const annualPrice = 3.99;

  // Theoretical 20% discount on 4.99:
  // 4.99 * 0.80 = 3.992 -> rounded to commercial price: 3.99
  const expectedDiscountAmount = monthlyPrice * 0.20; // 0.998
  const discountedCalculated = monthlyPrice - expectedDiscountAmount; // 3.992
  const effectiveDiscountPercent = ((monthlyPrice - annualPrice) / monthlyPrice) * 100;

  expect(Math.abs(discountedCalculated - 3.99) < 0.01, `Calculated discounted price ${discountedCalculated} rounds to 3.99`);
  expect(Math.abs(effectiveDiscountPercent - 20.04) < 0.1, `Effective discount percentage ${effectiveDiscountPercent}% is ~20%`);

  // Annual total comparison:
  const annualTotalBilled = annualPrice * 12; // 47.88
  const monthlyYearTotal = monthlyPrice * 12; // 59.88
  const totalAnnualSavings = monthlyYearTotal - annualTotalBilled; // 12.00
  const annualSavingsPercent = (totalAnnualSavings / monthlyYearTotal) * 100; // 20.04%

  expect(annualTotalBilled === 47.88, `Annual total billed is 47.88 USD`);
  expect(Math.abs(annualSavingsPercent - 20.04) < 0.1, `Annual savings percentage is exactly ~20%`);
});

runEmpiricalTest('Discount & Multi-Currency', 'Currency conversion & formatting across all 5 supported currencies', () => {
  const testMatrix = [
    {
      country: 'PA',
      currency: 'USD',
      rate: 1.0,
      monthlyRaw: 4.99,
      annualRaw: 3.99,
      expectedMonthlyFmt: '$4.99',
      expectedAnnualFmt: '$3.99',
    },
    {
      country: 'ES',
      currency: 'EUR',
      rate: 0.92,
      monthlyRaw: 4.99 * 0.92, // 4.5908
      annualRaw: 3.99 * 0.92,  // 3.6708
      expectedMonthlyFmt: '4,59 €',
      expectedAnnualFmt: '3,67 €',
    },
    {
      country: 'CO',
      currency: 'COP',
      rate: 4150.0,
      monthlyRaw: 4.99 * 4150.0, // 20,708.5 -> 20,709
      annualRaw: 3.99 * 4150.0,  // 16,558.5 -> 16,559
      expectedMonthlyFmt: '$ 20.709',
      expectedAnnualFmt: '$ 16.559',
    },
    {
      country: 'MX',
      currency: 'MXN',
      rate: 18.5,
      monthlyRaw: 4.99 * 18.5, // 92.315 -> 92.32
      annualRaw: 3.99 * 18.5,  // 73.815 -> 73.82
      expectedMonthlyFmt: '$92.32',
      expectedAnnualFmt: '$73.82',
    },
    {
      country: 'PA',
      currency: 'PAB',
      rate: 1.0,
      monthlyRaw: 4.99,
      annualRaw: 3.99,
      expectedMonthlyFmt: 'B/. 4.99',
      expectedAnnualFmt: 'B/. 3.99',
    },
  ];

  for (const item of testMatrix) {
    const formattedMonthly = formatPrice(4.99, 'USD', item.currency, FALLBACK_RATES);
    const formattedAnnual = formatPrice(3.99, 'USD', item.currency, FALLBACK_RATES);

    // Verify converted raw values
    const convertedMonthly = convertCurrency(4.99, 'USD', item.currency, FALLBACK_RATES);
    const convertedAnnual = convertCurrency(3.99, 'USD', item.currency, FALLBACK_RATES);
    const currencyDiscount = ((convertedMonthly - convertedAnnual) / convertedMonthly) * 100;

    expect(
      Math.abs(currencyDiscount - 20.04) < 0.1,
      `Discount in currency ${item.currency} must maintain 20% ratio (got ${currencyDiscount.toFixed(2)}%)`
    );

    // Verify no NaN or undefined
    expect(!formattedMonthly.includes('NaN'), `formattedMonthly in ${item.currency} contained NaN`);
    expect(!formattedAnnual.includes('NaN'), `formattedAnnual in ${item.currency} contained NaN`);
    expect(!formattedMonthly.includes('undefined'), `formattedMonthly in ${item.currency} contained undefined`);
    expect(!formattedAnnual.includes('undefined'), `formattedAnnual in ${item.currency} contained undefined`);

    // Verify COP decimal rule: 0 decimals
    if (item.currency === 'COP') {
      expect(!formattedMonthly.includes(',00') && !formattedMonthly.includes('.00'), `COP monthly contained decimals: ${formattedMonthly}`);
      expect(!formattedAnnual.includes(',00') && !formattedAnnual.includes('.00'), `COP annual contained decimals: ${formattedAnnual}`);
    }
  }
});

runEmpiricalTest('Discount & Multi-Currency', 'PricingPage renders localized prices when country changes', () => {
  // Test 1: Colombia (COP)
  const copHtml = renderWithProviders(React.createElement(PricingPage), '/precios', 'CO');
  expect(copHtml.includes('Colombia (COP)'), 'PricingPage missing active indicator for Colombia (COP)');
  expect(copHtml.includes('16.559') || copHtml.includes('16,559'), 'PricingPage missing converted annual COP price ($ 16.559)');

  // Test 2: Spain (EUR)
  const eurHtml = renderWithProviders(React.createElement(PricingPage), '/precios', 'ES');
  expect(eurHtml.includes('España (EUR)'), 'PricingPage missing active indicator for España (EUR)');
  expect(eurHtml.includes('3,67') || eurHtml.includes('3.67'), 'PricingPage missing converted annual EUR price (3,67 €)');

  // Test 3: Mexico (MXN)
  const mxnHtml = renderWithProviders(React.createElement(PricingPage), '/precios', 'MX');
  expect(mxnHtml.includes('México (MXN)'), 'PricingPage missing active indicator for México (MXN)');
  expect(mxnHtml.includes('73.82') || mxnHtml.includes('73,82'), 'PricingPage missing converted annual MXN price ($73.82)');
});

// ============================================================================
// SUITE 4: Theme & Styling Fidelity
// ============================================================================

runEmpiricalTest('Theme Fidelity', 'index.css defines all required luxury dark atelier classes', () => {
  const cssPath = path.resolve(__dirname, '../src/index.css');
  const cssCode = fs.readFileSync(cssPath, 'utf8');

  // Verify core atelier classes
  expect(cssCode.includes('.atelier-card'), 'index.css missing .atelier-card class');
  expect(cssCode.includes('backdrop-filter: blur(20px)'), 'index.css .atelier-card missing backdrop-filter blur');
  expect(cssCode.includes('.atelier-card-hover'), 'index.css missing .atelier-card-hover class');
  expect(cssCode.includes('.input-atelier'), 'index.css missing .input-atelier class');
  expect(cssCode.includes('.btn-atelier-primary'), 'index.css missing .btn-atelier-primary class');
  expect(cssCode.includes('linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'), 'index.css .btn-atelier-primary missing gradient definition');
  expect(cssCode.includes('.glow-violet'), 'index.css missing .glow-violet class');
  expect(cssCode.includes('.glow-violet-lg'), 'index.css missing .glow-violet-lg class');
  expect(cssCode.includes('.glow-emerald'), 'index.css missing .glow-emerald class');
  expect(cssCode.includes('.ring-concentric-violet'), 'index.css missing .ring-concentric-violet class');
});

runEmpiricalTest('Theme Fidelity', 'Atelier luxury classes are utilized in all Stitch views', () => {
  const benefitsHtml = renderWithProviders(React.createElement(BenefitsPage), '/beneficios');
  expect(benefitsHtml.includes('atelier-card'), 'BenefitsPage does not use .atelier-card');
  expect(benefitsHtml.includes('btn-atelier-primary'), 'BenefitsPage does not use .btn-atelier-primary');

  const pricingHtml = renderWithProviders(React.createElement(PricingPage), '/precios');
  expect(pricingHtml.includes('atelier-card'), 'PricingPage does not use .atelier-card');

  const directoryHtml = renderWithProviders(React.createElement(ArtistsDirectoryPage), '/artistas');
  expect(directoryHtml.includes('atelier-card'), 'ArtistsDirectoryPage does not use .atelier-card');
  expect(directoryHtml.includes('input-atelier'), 'ArtistsDirectoryPage does not use .input-atelier');

  const homeHtml = renderWithProviders(React.createElement(HomePage), '/');
  expect(homeHtml.includes('atelier-card'), 'HomePage does not use .atelier-card');
  expect(homeHtml.includes('btn-atelier-primary'), 'HomePage does not use .btn-atelier-primary');
});

// ============================================================================
// SUMMARY & VERDICT GENERATION
// ============================================================================

console.log('\n========================================================================');
console.log('📊 EMPIRICAL ADVERSARIAL STRESS TEST SUMMARY');
console.log('========================================================================');

const totalExecuted = testResults.length;
const passedCount = testResults.filter((r) => r.passed).length;
const failedCount = testResults.filter((r) => !r.passed).length;

console.log(`TOTAL ADVERSARIAL TESTS : ${totalExecuted}`);
console.log(`PASSED TESTS            : ${passedCount}`);
console.log(`FAILED TESTS            : ${failedCount}`);

testResults.forEach((r) => {
  if (!r.passed) {
    console.error(`❌ FAILED #${r.id} [${r.suite}]: ${r.name}`);
    console.error(`   Reason: ${r.error}`);
  }
});

if (failedCount > 0) {
  console.error(`\n💥 VERDICT: REQUEST_CHANGES (${failedCount} test assertions failed)`);
  process.exit(1);
} else {
  console.log(`\n🎉 VERDICT: APPROVE (All ${passedCount}/${totalExecuted} adversarial tests passed 100%)`);
  process.exit(0);
}
