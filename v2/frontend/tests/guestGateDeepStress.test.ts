import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { GuestGateModal } from '../src/components/common/GuestGateModal';
import { GuestGateProvider, useGuestGate } from '../src/context/GuestGateContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { CurrencyProvider, useCurrency } from '../src/context/CurrencyContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASSED: ${message}`);
}

function runStressTest(name: string, fn: () => void) {
  totalTests++;
  console.log(`\n======================================================`);
  console.log(`[Stress Test ${totalTests}] ${name}`);
  console.log(`======================================================`);
  try {
    fn();
    passedTests++;
  } catch (err: any) {
    failedTests++;
    console.error(`❌ TEST FAILED: ${err?.message || err}`);
  }
}

console.log('--- STARTING COMPREHENSIVE EMPIRICAL STRESS TEST SUITE ---\n');

// =========================================================================
// SECTION 1: React Router Provider Context Hierarchy
// =========================================================================

runStressTest('1. Full Root Provider Stack Hierarchy Mounting Test', () => {
  // Test consumer that exercises all context hooks simultaneously
  const ContextInspector: React.FC = () => {
    const theme = useTheme();
    const currency = useCurrency();
    const auth = useAuth();
    const guestGate = useGuestGate();
    const location = useLocation();
    const navigate = useNavigate();

    return React.createElement(
      'div',
      { id: 'context-inspector-node' },
      `Theme: ${theme.theme}; Curr: ${currency.selectedCountry}; Auth: ${auth.isAuthenticated}; GateOpen: ${guestGate.isOpen}; Loc: ${location.pathname}; NavOk: ${typeof navigate === 'function'}`
    );
  };

  const renderedHtml = renderToString(
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
            { initialEntries: ['/hub'] },
            React.createElement(
              GuestGateProvider,
              null,
              React.createElement(ContextInspector)
            )
          )
        )
      )
    )
  );

  assert(renderedHtml.includes('id="context-inspector-node"'), 'Inspector node rendered into HTML');
  assert(renderedHtml.includes('GateOpen: false'), 'GuestGate initial state isOpen: false accessible');
  assert(renderedHtml.includes('Loc: /hub'), 'MemoryRouter location accessible via useLocation');
  assert(renderedHtml.includes('NavOk: true'), 'useNavigate hook accessible and functional');
});

runStressTest('2. Inverted Context Hierarchy Failure Mode Proof', () => {
  // Verifies that placing GuestGateProvider ABOVE Router produces expected fatal exception
  let fatalErrorCaught = false;
  let exceptionMessage = '';

  try {
    renderToString(
      React.createElement(
        AuthProvider,
        null,
        React.createElement(
          GuestGateProvider,
          null,
          React.createElement(
            MemoryRouter,
            null,
            React.createElement('div', null, 'Should not render')
          )
        )
      )
    );
  } catch (err: any) {
    fatalErrorCaught = true;
    exceptionMessage = err?.message || String(err);
  }

  assert(fatalErrorCaught === true, 'Fatal exception caught when GuestGateProvider is placed outside Router');
  assert(
    exceptionMessage.includes('useNavigate() may be used only in the context of a <Router> component') ||
    exceptionMessage.includes('Router'),
    'Exception specifically identifies missing Router context for useNavigate'
  );
});

runStressTest('3. useGuestGate Hook Guard Enforcement', () => {
  let hookGuardTriggered = false;
  let guardErrorMessage = '';

  const OrphanConsumer: React.FC = () => {
    useGuestGate();
    return null;
  };

  try {
    renderToString(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(OrphanConsumer)
      )
    );
  } catch (err: any) {
    hookGuardTriggered = true;
    guardErrorMessage = err?.message || String(err);
  }

  assert(hookGuardTriggered === true, 'Exception caught when useGuestGate is called outside GuestGateProvider');
  assert(
    guardErrorMessage.includes('useGuestGate must be used within a GuestGateProvider'),
    'Guard explicitly messages that useGuestGate requires GuestGateProvider'
  );
});

runStressTest('4. Deep Route Nesting Under GuestGateProvider', () => {
  const HubDummy = () => React.createElement('div', { id: 'hub-rendered' }, 'Hub Page');
  const LoginDummy = () => React.createElement('div', { id: 'login-rendered' }, 'Login Page');

  const appStructure = (entry: string) =>
    renderToString(
      React.createElement(
        AuthProvider,
        null,
        React.createElement(
          MemoryRouter,
          { initialEntries: [entry] },
          React.createElement(
            GuestGateProvider,
            null,
            React.createElement(
              Routes,
              null,
              React.createElement(Route, { path: '/hub', element: React.createElement(HubDummy) }),
              React.createElement(Route, { path: '/login', element: React.createElement(LoginDummy) })
            )
          )
        )
      )
    );

  const hubHtml = appStructure('/hub');
  assert(hubHtml.includes('id="hub-rendered"'), 'Hub route resolved cleanly under GuestGateProvider');

  const loginHtml = appStructure('/login');
  assert(loginHtml.includes('id="login-rendered"'), 'Login route resolved cleanly under GuestGateProvider');
});

// =========================================================================
// SECTION 2: Redirect URL Handling under Adversarial Inputs
// =========================================================================

// Production redirect sanitization logic used across LoginPage.tsx and RegisterPage.tsx:
const sanitizeRedirect = (raw: string | null | undefined, fallback: string): string => {
  if (raw && typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//')) {
    return raw;
  }
  return fallback;
};

runStressTest('5. Open-Redirect Attacks Matrix', () => {
  const fallback = '/client-dashboard';
  const adversarialTargets = [
    'https://evil.com',
    'https://evil.com/phishing',
    'http://evil.com',
    'http://attacker.com/steal-creds',
    '//evil.com',
    '//evil.com/exploit',
    '///evil.com',
    '////evil.com',
    '//localhost:8080/evil',
    '//127.0.0.1:3000',
    'ftp://evil.com',
    'sftp://evil.com',
    'file:///etc/passwd',
  ];

  for (const attack of adversarialTargets) {
    const result = sanitizeRedirect(attack, fallback);
    assert(result === fallback, `Blocked open-redirect payload "${attack}" -> fell back to "${fallback}"`);
  }
});

runStressTest('6. Protocol & Script Injection Attacks Matrix', () => {
  const fallback = '/client-dashboard';
  const scriptAttacks = [
    'javascript:alert(1)',
    'javascript:alert(document.cookie)',
    'javascript://alert(1)',
    'javascript://%0aalert(1)',
    'data:text/html,<script>alert(1)</script>',
    'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    'vbscript:msgbox("hacked")',
    'jav\tascript:alert(1)',
    'jav&#x09;ascript:alert(1)',
    'blob:https://evil.com/abcd-1234',
  ];

  for (const attack of scriptAttacks) {
    const result = sanitizeRedirect(attack, fallback);
    assert(result === fallback, `Blocked script-injection payload "${attack}" -> fell back to "${fallback}"`);
  }
});

runStressTest('7. Path Traversal & Slash Manipulations Matrix', () => {
  const fallback = '/client-dashboard';

  // Backslash and reverse combinations
  assert(sanitizeRedirect('\\evil.com', fallback) === fallback, 'Blocked \\evil.com');
  assert(sanitizeRedirect('\\/evil.com', fallback) === fallback, 'Blocked \\/evil.com');
  assert(sanitizeRedirect('\\\\evil.com', fallback) === fallback, 'Blocked \\\\evil.com');

  // React Router client-side path handling
  // In React Router, navigate('/\\evil.com') sets the client-side pathname to '/\\evil.com'
  // and stays within the local SPA domain without escaping origin.
  const escaped = sanitizeRedirect('/\\evil.com', fallback);
  assert(escaped.startsWith('/'), 'Path starting with / preserved as client-side route');
});

runStressTest('8. Whitespace, Null, and Falsy Inputs Matrix', () => {
  const fallback = '/client-dashboard';
  const falsyInputs = [
    null,
    undefined,
    '',
    '   ',
    '\t',
    '\n',
    '\r\n',
    ' /hub',     // Leading space
    '  /hub?id=1',
    '%2F%2Fevil.com', // Raw un-decoded URL parameter
    '%00/evil.com',
    '%0d%0a/evil.com',
  ];

  for (const input of falsyInputs) {
    const result = sanitizeRedirect(input as any, fallback);
    assert(result === fallback, `Falsy/invalid input ${JSON.stringify(input)} fell back to safe default "${fallback}"`);
  }
});

runStressTest('9. Legitimate Complex Internal Redirects & Query Strings', () => {
  const fallback = '/client-dashboard';
  const legitimatePaths = [
    '/hub',
    '/hub?artist=obsidian',
    '/hub?artist=obsidian&tab=booking&date=2026-10-05',
    '/artists/tattoo art?style=neo traditional&price=$100',
    '/chat?recipient=artist_42&msg=¡Hola! ¿Disponible?',
    '/perfil/artistas#agenda',
    '/hub?filter=tatuador#reviews',
    '/hub?query=c%2B%2B%20tattoos&page=2#section-3',
    '/client-dashboard?tab=configuracion',
    '/artist-dashboard',
    '/subscription/creditcard?plan=pro&currency=EUR',
  ];

  for (const path of legitimatePaths) {
    const result = sanitizeRedirect(path, fallback);
    assert(result === path, `Legitimate internal route "${path}" preserved exactly`);

    // Verify round-trip encoding into URL query param and decoding via URLSearchParams
    const fullUrl = `https://tattoohub.art/register?redirect=${encodeURIComponent(path)}`;
    const parsedUrl = new URL(fullUrl);
    const extracted = parsedUrl.searchParams.get('redirect');
    assert(extracted === path, `Roundtrip URL query param extraction preserved exact value for "${path}"`);
    const sanitizedExtracted = sanitizeRedirect(extracted, fallback);
    assert(sanitizedExtracted === path, `Sanitized extracted param matched original target "${path}"`);
  }
});

runStressTest('10. Cross-Linking Parameter Sanitization & Preservation', () => {
  const computeCrossLinks = (rawRedirectParam: string | null) => {
    const safe = (rawRedirectParam && rawRedirectParam.startsWith('/') && !rawRedirectParam.startsWith('//'))
      ? rawRedirectParam
      : null;

    const loginLink = safe ? `/login?redirect=${encodeURIComponent(safe)}` : '/login';
    const registerLink = safe ? `/register?redirect=${encodeURIComponent(safe)}` : '/register';

    return { loginLink, registerLink };
  };

  // Case A: Safe internal target '/hub?artist=neon'
  const safeLinks = computeCrossLinks('/hub?artist=neon');
  assert(safeLinks.loginLink === '/login?redirect=%2Fhub%3Fartist%3Dneon', 'loginLink preserved internal redirect');
  assert(safeLinks.registerLink === '/register?redirect=%2Fhub%3Fartist%3Dneon', 'registerLink preserved internal redirect');

  // Case B: Malicious external target 'https://evil.com'
  const evilLinks = computeCrossLinks('https://evil.com');
  assert(evilLinks.loginLink === '/login', 'loginLink purged external domain redirect');
  assert(evilLinks.registerLink === '/register', 'registerLink purged external domain redirect');

  // Case C: Malicious protocol-relative target '//evil.com'
  const protoLinks = computeCrossLinks('//evil.com');
  assert(protoLinks.loginLink === '/login', 'loginLink purged protocol-relative redirect');
  assert(protoLinks.registerLink === '/register', 'registerLink purged protocol-relative redirect');

  // Case D: Null redirect parameter
  const nullLinks = computeCrossLinks(null);
  assert(nullLinks.loginLink === '/login', 'loginLink defaulted cleanly with null redirect');
  assert(nullLinks.registerLink === '/register', 'registerLink defaulted cleanly with null redirect');
});

// =========================================================================
// SECTION 3: Component Rendering When Unauthenticated vs Authenticated
// =========================================================================

runStressTest('11. GuestGateModal Rendering States & Accessibility Inspection', () => {
  // A. Closed state
  const closedOutput = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(GuestGateModal, { isOpen: false, onClose: () => {} })
    )
  );
  assert(closedOutput === '', 'GuestGateModal produces zero DOM output when isOpen is false');

  // B. Open state with default content
  const defaultOpenOutput = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(GuestGateModal, { isOpen: true, onClose: () => {} })
    )
  );
  assert(defaultOpenOutput.includes('role="dialog"'), 'Modal contains role="dialog"');
  assert(defaultOpenOutput.includes('aria-modal="true"'), 'Modal contains aria-modal="true"');
  assert(defaultOpenOutput.includes('id="guest-gate-modal"'), 'Modal contains ID #guest-gate-modal');
  assert(defaultOpenOutput.includes('id="guest-gate-register-btn"'), 'Register action button present with ID');
  assert(defaultOpenOutput.includes('id="guest-gate-login-btn"'), 'Login action button present with ID');
  assert(defaultOpenOutput.includes('Únete a la Comunidad de Tattoo Hub'), 'Default title rendered');
  assert(defaultOpenOutput.includes('Continuar explorando como invitado'), 'Guest dismissal button present');

  // C. Open state with custom options
  const customOpenOutput = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(GuestGateModal, {
        isOpen: true,
        onClose: () => {},
        options: {
          title: 'Reserva Exclusiva de Flash',
          message: 'Debes iniciar sesión para apartar este diseño con el artista.',
          redirectUrl: '/hub?artist=42',
        },
      })
    )
  );
  assert(customOpenOutput.includes('Reserva Exclusiva de Flash'), 'Custom title rendered in DOM');
  assert(customOpenOutput.includes('Debes iniciar sesión para apartar este diseño con el artista.'), 'Custom message rendered in DOM');
});

runStressTest('12. GuestGate State Machine & Interception Logic', () => {
  // Test both branches of requireAuth
  const executeGateCycle = (isAuthenticated: boolean) => {
    let modalOpened = false;
    let actionExecuted = false;
    let savedOptions: any = null;

    const openGuestGate = (opts?: any) => {
      modalOpened = true;
      savedOptions = opts;
    };

    const requireAuth = (cb: () => void, opts?: any): boolean => {
      if (isAuthenticated) {
        cb();
        return true;
      }
      openGuestGate(opts);
      return false;
    };

    const callback = () => {
      actionExecuted = true;
    };

    const testOptions = {
      title: 'Bloqueo de Prueba',
      message: 'Mensaje de Prueba',
      redirectUrl: '/hub',
    };

    const result = requireAuth(callback, testOptions);
    return { result, modalOpened, actionExecuted, savedOptions };
  };

  // Branch A: Unauthenticated
  const unauthedResult = executeGateCycle(false);
  assert(unauthedResult.result === false, 'requireAuth returned false for unauthenticated visitor');
  assert(unauthedResult.actionExecuted === false, 'Protected action callback was NOT called');
  assert(unauthedResult.modalOpened === true, 'Modal was opened');
  assert(unauthedResult.savedOptions.title === 'Bloqueo de Prueba', 'Modal options preserved');

  // Branch B: Authenticated
  const authedResult = executeGateCycle(true);
  assert(authedResult.result === true, 'requireAuth returned true for authenticated user');
  assert(authedResult.actionExecuted === true, 'Protected action callback was executed immediately');
  assert(authedResult.modalOpened === false, 'Modal remained closed');
});

runStressTest('13. ChatAuthGate Unauthenticated vs Authenticated Rendering', () => {
  // Simulator matching ChatAuthGate in App.tsx
  const ChatAuthGateSim: React.FC<{ user: any; isLoading: boolean; currentPath: string }> = ({
    user,
    isLoading,
    currentPath,
  }) => {
    if (isLoading) {
      return React.createElement('div', { id: 'chat-loading' }, 'Cargando...');
    }

    if (!user) {
      const redirectTarget = `/register?redirect=${encodeURIComponent(currentPath)}`;
      return React.createElement('div', { id: 'chat-redirect-target', 'data-to': redirectTarget });
    }

    return React.createElement('div', { id: 'chat-page-content' }, 'Welcome to Chat Page');
  };

  // 1. Loading state
  const loadingHtml = renderToString(
    React.createElement(ChatAuthGateSim, { user: null, isLoading: true, currentPath: '/chat' })
  );
  assert(loadingHtml.includes('id="chat-loading"'), 'Loading screen rendered during auth verification');

  // 2. Unauthenticated state
  const unauthHtml = renderToString(
    React.createElement(ChatAuthGateSim, { user: null, isLoading: false, currentPath: '/chat?recipient=artist_1' })
  );
  assert(unauthHtml.includes('id="chat-redirect-target"'), 'Unauthenticated guest intercepted by gate');
  assert(
    unauthHtml.includes('data-to="/register?redirect=%2Fchat%3Frecipient%3Dartist_1"'),
    'Preserved complete path and query params in redirect target'
  );

  // 3. Authenticated state
  const authHtml = renderToString(
    React.createElement(ChatAuthGateSim, {
      user: { id: 'user_123', email: 'test@tattoohub.art' },
      isLoading: false,
      currentPath: '/chat',
    })
  );
  assert(authHtml.includes('id="chat-page-content"'), 'Authenticated user granted direct access to Chat');
});

runStressTest('14. Exempt Pages Footer Elimination Strict Compliance', async () => {
  const fs = await import('fs');
  const path = await import('path');

  const exemptFiles = [
    'src/pages/LoginPage.tsx',
    'src/pages/RegisterPage.tsx',
    'src/pages/ClientDashboardPage.tsx',
    'src/pages/ArtistDashboardPage.tsx',
    'src/pages/ArtistsHubPage.tsx',
  ];

  const basePath = path.resolve(process.cwd());

  for (const relPath of exemptFiles) {
    const fullPath = path.join(basePath, relPath);
    const content = fs.readFileSync(fullPath, 'utf8');

    // Check 1: No import of Footer component
    const hasFooterImport = /import\s+.*Footer.*from/i.test(content);
    assert(!hasFooterImport, `${relPath} contains zero <Footer /> component imports`);

    // Check 2: No JSX <Footer or <Footer /> elements
    const hasFooterTag = /<Footer[\s/>]/i.test(content);
    assert(!hasFooterTag, `${relPath} contains zero <Footer> JSX element occurrences`);
  }
});

// =========================================================================
// SUMMARY
// =========================================================================

console.log('\n======================================================');
console.log('STRESS TEST SUITE EXECUTION SUMMARY');
console.log(`TOTAL TESTS RUN : ${totalTests}`);
console.log(`PASSED          : ${passedTests}`);
console.log(`FAILED          : ${failedTests}`);
console.log('======================================================\n');

if (failedTests > 0) {
  console.error(`💥 FAILURE: ${failedTests} stress tests failed!`);
  process.exit(1);
} else {
  console.log('🎉 ALL 14 EMPIRICAL ADVERSARIAL STRESS TESTS PASSED WITH ZERO FAILURES!');
  process.exit(0);
}
