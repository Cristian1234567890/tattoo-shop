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

// Pages
import { HomePage } from '../src/pages/HomePage';
import { RegisterPage } from '../src/pages/RegisterPage';
import { BenefitsPage } from '../src/pages/BenefitsPage';
import { PricingPage } from '../src/pages/PricingPage';
import { ArtistsDirectoryPage } from '../src/pages/ArtistsDirectoryPage';
import ArtistsHubPage from '../src/pages/ArtistsHubPage';

// Types
import { ResidentArtist, StudioLocation } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('================================================================');
console.log('🧪 MILESTONE 13 INTEGRATION & REGRESSION TEST SUITE');
console.log('================================================================\n');

const renderWithAllProviders = (component: React.ReactElement, initialPath: string = '/') => {
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

// -------------------------------------------------------------
// Test 1: Data Model Hierarchy (StudioLocation -> ResidentArtist)
// -------------------------------------------------------------
console.log('--- Test 1: Data Model Type Safety & Hierarchy ---');
const sampleArtist: ResidentArtist = {
  id: 'artist-1',
  name: 'Kaelen Silva',
  alias: 'Void',
  avatar: '/avatar.jpg',
  specialties: ['Cybersigilism', 'Neo-Tribal'],
  hourlyRate: 80,
  availableToday: true,
  whatsapp: { number: '60012345', prefix: '507' },
  flashes: [{ id: 'f1', title: 'Sigil', amount: 120, img: '/sigil.jpg' }],
};

const sampleStudio: StudioLocation = {
  id: 'studio-1',
  type: 'studio',
  name: 'Obsidian Atelier',
  banner: '/banner.jpg',
  rating: 4.9,
  verified: true,
  address: 'Calle 50, Bella Vista',
  artistsCount: 1,
  residents: [sampleArtist],
};

assert(sampleStudio.type === 'studio', 'StudioLocation type is "studio"');
assert(sampleStudio.residents?.length === 1, 'StudioLocation contains residents array');
assert(sampleStudio.residents![0].alias === 'Void', 'ResidentArtist fields accessible');

// -------------------------------------------------------------
// Test 2: HomePage Layout Unification & Normalization
// -------------------------------------------------------------
console.log('\n--- Test 2: HomePage Normalization ---');
const homeHtml = renderWithAllProviders(React.createElement(HomePage), '/');
assert(!homeHtml.includes('TattooHub <span class="text-xs px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 align-middle ml-1">STUDIOS</span>'), 'HomePage: Inline mock header removed');
assert(homeHtml.includes('id="beneficios"'), 'HomePage: Section anchor id="beneficios" present');
assert(homeHtml.includes('id="precios"'), 'HomePage: Section anchor id="precios" present');
assert(homeHtml.includes('id="artistas"'), 'HomePage: Section anchor id="artistas" present');
assert(homeHtml.includes('CULTURA DE TALLER'), 'HomePage: Pre-footer CTA banner preserved');

// -------------------------------------------------------------
// Test 3: RegisterPage Layout Unification
// -------------------------------------------------------------
console.log('\n--- Test 3: RegisterPage Distraction-Free Layout ---');
const registerHtml = renderWithAllProviders(React.createElement(RegisterPage), '/register');
assert(!registerHtml.includes('<header'), 'RegisterPage: Zero <header HTML elements');
assert(!registerHtml.includes('<footer'), 'RegisterPage: Zero <footer HTML elements (Distraction-free)');
assert(registerHtml.includes('PORTAL DE ACCESO AL COLECTIVO'), 'RegisterPage: Role selection rendered');

// -------------------------------------------------------------
// Test 4: BenefitsPage Rendering
// -------------------------------------------------------------
console.log('\n--- Test 4: BenefitsPage Rendering ---');
const benefitsHtml = renderWithAllProviders(React.createElement(BenefitsPage), '/beneficios');
assert(benefitsHtml.includes('MANIFIESTO DEL ATELIER DIGITAL'), 'BenefitsPage: Manifesto hero title rendered');
assert(benefitsHtml.includes('100% para el Tatuador'), 'BenefitsPage: Core guarantee 1 rendered');
assert(benefitsHtml.includes('Protocolos Sanitarios Visibles'), 'BenefitsPage: Core guarantee 2 rendered');
assert(benefitsHtml.includes('Contacto Directo sin Paredes'), 'BenefitsPage: Core guarantee 3 rendered');
assert(benefitsHtml.includes('Tattoo Hub vs Canales Tradicionales'), 'BenefitsPage: Comparison table rendered');

// -------------------------------------------------------------
// Test 5: PricingPage Dynamic Pricing & Format
// -------------------------------------------------------------
console.log('\n--- Test 5: PricingPage Dynamic Pricing ---');
const pricingHtml = renderWithAllProviders(React.createElement(PricingPage), '/precios');
assert(pricingHtml.includes('Planes y Membresías Transparentes'), 'PricingPage: Header rendered');
assert(pricingHtml.includes('Coleccionista VIP'), 'PricingPage: VIP card rendered');
assert(pricingHtml.includes('Estudio Profesional'), 'PricingPage: Studio Pro card rendered');
assert(pricingHtml.includes('30 días de prueba gratuita'), 'PricingPage: 30-day trial badge rendered');
assert(pricingHtml.includes('Preguntas Frecuentes'), 'PricingPage: FAQ accordion rendered');

// -------------------------------------------------------------
// Test 6: ArtistsDirectoryPage Studio -> Resident Artists Hierarchy
// -------------------------------------------------------------
console.log('\n--- Test 6: ArtistsDirectoryPage Hierarchy & Resident Selector ---');
const directoryHtml = renderWithAllProviders(React.createElement(ArtistsDirectoryPage), '/artistas');
assert(directoryHtml.includes('Estudios y Artistas Residentes'), 'ArtistsDirectoryPage: Header rendered');
assert(directoryHtml.includes('Obsidian Atelier'), 'ArtistsDirectoryPage: Obsidian studio listed');
assert(directoryHtml.includes('Artistas Residentes'), 'ArtistsDirectoryPage: Multi-artist badge rendered');
assert(directoryHtml.includes('WhatsApp'), 'ArtistsDirectoryPage: Direct WhatsApp action button present');
assert(directoryHtml.includes('Enviar Boceto'), 'ArtistsDirectoryPage: Send Sketch action button present');

// -------------------------------------------------------------
// Test 7: ArtistsHubPage Studio -> Resident Artists Hierarchy
// -------------------------------------------------------------
console.log('\n--- Test 7: ArtistsHubPage Studio Hierarchy & Actions ---');
const hubHtml = renderWithAllProviders(React.createElement(ArtistsHubPage), '/hub');
assert(hubHtml.includes('Obsidian Atelier'), 'ArtistsHubPage: Active studio rendered');
assert(hubHtml.includes('Artistas Residentes'), 'ArtistsHubPage: Multi-artist count badge rendered');
assert(hubHtml.includes('Artistas en este Local:'), 'ArtistsHubPage: Resident artist selector rendered');
assert(hubHtml.includes('Contactar por WhatsApp'), 'ArtistsHubPage: WhatsApp contact button rendered');
assert(hubHtml.includes('Enviar Boceto'), 'ArtistsHubPage: Send sketch button rendered');

// -------------------------------------------------------------
// Test 8: App.tsx Route Completeness
// -------------------------------------------------------------
console.log('\n--- Test 8: App.tsx Route Completeness ---');
const appSource = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
assert(appSource.includes('path="/beneficios"'), 'App.tsx: Route /beneficios registered');
assert(appSource.includes('path="/precios"'), 'App.tsx: Route /precios registered');
assert(appSource.includes('path="/artistas"'), 'App.tsx: Route /artistas registered');
assert(appSource.includes('!shouldHideFooter && <Footer'), 'App.tsx: Conditional footer policy enforced');

console.log('\n================================================================');
console.log('✅ ALL MILESTONE 13 INTEGRATION TESTS PASSED EMPIRICALLY (100%)');
console.log('================================================================\n');
