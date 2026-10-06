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

// Import providers needed for rendering
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { CurrencyProvider } from '../src/context/CurrencyContext';
import { GuestGateProvider } from '../src/context/GuestGateContext';

// Import target pages
import { LoginPage } from '../src/pages/LoginPage';
import { RegisterPage } from '../src/pages/RegisterPage';
import { ClientDashboardPage } from '../src/pages/ClientDashboardPage';
import { ArtistDashboardPage } from '../src/pages/ArtistDashboardPage';
import ArtistsHubPage from '../src/pages/ArtistsHubPage';
import { ChatPage } from '../src/pages/ChatPage';

// Import a known non-exempt page for positive oracle verification
import { AboutPage } from '../src/pages/AboutPage';
import { Footer } from '../src/components/common/Footer';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('================================================================');
console.log('🔍 EMPIRICAL FOOTER EXEMPTION & ROUTE COMPLIANCE SUITE');
console.log('================================================================\n');

// ORACLE VALIDATION: Verify Footer component signature
const renderedFooterHtml = renderToString(
  React.createElement(
    ThemeProvider,
    null,
    React.createElement(
      CurrencyProvider,
      null,
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Footer)
      )
    )
  )
);
assert(
  renderedFooterHtml.includes('<footer') && renderedFooterHtml.includes('Tattoo Hub'),
  'Oracle verified: <Footer /> component renders recognizable <footer and Tattoo Hub branding'
);

// TEST 1: Oracle verification on non-exempt page (AboutPage)
const aboutHtml = renderToString(
  React.createElement(
    MemoryRouter,
    null,
    React.createElement(
      ThemeProvider,
      null,
      React.createElement(
        CurrencyProvider,
        null,
        React.createElement(
          AuthProvider,
          null,
          React.createElement(AboutPage)
        )
      )
    )
  )
);
assert(
  aboutHtml.includes('<footer') && aboutHtml.includes('Tattoo Hub'),
  'Oracle verified: Non-exempt AboutPage renders <Footer /> as expected'
);

// TEST 2: Static Source Code AST & Content Inspection for all 6 Exempt Pages
const exemptPages = [
  { name: 'LoginPage.tsx', path: path.resolve(__dirname, '../src/pages/LoginPage.tsx') },
  { name: 'RegisterPage.tsx', path: path.resolve(__dirname, '../src/pages/RegisterPage.tsx') },
  { name: 'ClientDashboardPage.tsx', path: path.resolve(__dirname, '../src/pages/ClientDashboardPage.tsx') },
  { name: 'ArtistDashboardPage.tsx', path: path.resolve(__dirname, '../src/pages/ArtistDashboardPage.tsx') },
  { name: 'ArtistsHubPage.tsx', path: path.resolve(__dirname, '../src/pages/ArtistsHubPage.tsx') },
  { name: 'ChatPage.tsx', path: path.resolve(__dirname, '../src/pages/ChatPage.tsx') },
];

for (const page of exemptPages) {
  const content = fs.readFileSync(page.path, 'utf8');
  
  // 1. Verify no import of Footer component
  const hasFooterImport = /import\s+.*Footer.*from/i.test(content);
  assert(!hasFooterImport, `${page.name}: Zero imports of Footer component`);

  // 2. Verify no JSX <Footer element
  const hasFooterJsx = /<Footer[\s\/>]/i.test(content);
  assert(!hasFooterJsx, `${page.name}: Zero <Footer /> JSX elements in source code`);

  // 3. Verify no raw <footer> element
  const hasRawFooter = /<footer[\s>]/i.test(content);
  assert(!hasRawFooter, `${page.name}: Zero raw <footer> HTML elements in source code`);
}

// TEST 3: Empirical Runtime Rendering of Exempt Pages
const renderWithProviders = (component: React.ReactElement, initialPath: string = '/') => {
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

// 3.1 LoginPage Render Verification
const loginHtml = renderWithProviders(React.createElement(LoginPage), '/login');
assert(!loginHtml.includes('<footer'), 'LoginPage rendered DOM: Zero <footer elements');
assert(!loginHtml.includes('Tattoo Hub. Todos los derechos reservados'), 'LoginPage rendered DOM: Zero Footer copyright text');

// 3.2 RegisterPage Render Verification
const registerHtml = renderWithProviders(React.createElement(RegisterPage), '/register');
assert(!registerHtml.includes('<footer'), 'RegisterPage rendered DOM: Zero <footer elements');
assert(!registerHtml.includes('Tattoo Hub. Todos los derechos reservados'), 'RegisterPage rendered DOM: Zero Footer copyright text');

// 3.3 ArtistsHubPage Render Verification
const hubHtml = renderWithProviders(React.createElement(ArtistsHubPage), '/hub');
assert(!hubHtml.includes('<footer'), 'ArtistsHubPage rendered DOM: Zero <footer elements');
assert(!hubHtml.includes('Tattoo Hub. Todos los derechos reservados'), 'ArtistsHubPage rendered DOM: Zero Footer copyright text');

// 3.4 ChatPage Render Verification
const chatHtml = renderWithProviders(React.createElement(ChatPage), '/chat');
assert(!chatHtml.includes('<footer'), 'ChatPage rendered DOM: Zero <footer elements');
assert(!chatHtml.includes('Tattoo Hub. Todos los derechos reservados'), 'ChatPage rendered DOM: Zero Footer copyright text');

// 3.5 ClientDashboardPage Render Verification (Skeleton / Unauth or Auth state)
const clientDashHtml = renderWithProviders(React.createElement(ClientDashboardPage), '/client-dashboard');
assert(!clientDashHtml.includes('<footer'), 'ClientDashboardPage rendered DOM: Zero <footer elements');
assert(!clientDashHtml.includes('Tattoo Hub. Todos los derechos reservados'), 'ClientDashboardPage rendered DOM: Zero Footer copyright text');

// 3.6 ArtistDashboardPage Render Verification
const artistDashHtml = renderWithProviders(React.createElement(ArtistDashboardPage), '/artist-dashboard');
assert(!artistDashHtml.includes('<footer'), 'ArtistDashboardPage rendered DOM: Zero <footer elements');
assert(!artistDashHtml.includes('Tattoo Hub. Todos los derechos reservados'), 'ArtistDashboardPage rendered DOM: Zero Footer copyright text');

// TEST 4: App.tsx Architecture Verification - R4 Conditional Footer
const appContent = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
const hasUnconditionalFooter = /<Routes[\s\S]*?<\/Routes>\s*<\/AnimatePresence>\s*<\/div>\s*<Footer\s*\/>/i.test(appContent);
assert(!hasUnconditionalFooter, 'App.tsx: No unconditional <Footer /> wrapping routes');
assert(appContent.includes('!shouldHideFooter && <Footer'), 'App.tsx: Strictly guards <Footer /> with !shouldHideFooter');
assert(appContent.includes('HIDE_FOOTER_PREFIXES'), 'App.tsx: Defines HIDE_FOOTER_PREFIXES per approved R4 policy');

console.log('\n================================================================');
console.log('✅ ALL FOOTER EXEMPTION TESTS PASSED EMPIRICALLY (100%)');
console.log('================================================================\n');
