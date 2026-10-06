import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { GuestGateModal } from '../src/components/common/GuestGateModal';
import { GuestGateProvider, useGuestGate } from '../src/context/GuestGateContext';
import { AuthProvider } from '../src/context/AuthContext';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('=== RUNNING ADVERSARIAL GUEST GATE SUITE ===\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  console.log(`\n--- Test ${totalTests}: ${name} ---`);
  try {
    fn();
    passedTests++;
  } catch (err: any) {
    failedTests++;
    console.error(`Test "${name}" FAILED with error:`, err?.message || err);
  }
}

// -------------------------------------------------------------
// Category 1: Simulator Logic & Edge Cases
// -------------------------------------------------------------

runTest('Authenticated state seamlessly executes action without modal intercept', () => {
  let executed = false;
  let modalOpen = false;

  const requireAuth = (callback: () => void, isAuthed: boolean) => {
    if (isAuthed) {
      callback();
      return true;
    }
    modalOpen = true;
    return false;
  };

  const allowed = requireAuth(() => {
    executed = true;
  }, true);

  assert(allowed === true, 'requireAuth returns true for authenticated user');
  assert(executed === true, 'Action callback executed immediately');
  assert(modalOpen === false, 'Modal flag remains false');
});

runTest('Unauthenticated guest state triggers modal with proper message and redirect URL', () => {
  let executed = false;
  let modalOpen = false;
  let capturedOptions: any = null;

  const requireAuth = (callback: () => void, opts: any, isAuthed: boolean) => {
    if (isAuthed) {
      callback();
      return true;
    }
    modalOpen = true;
    capturedOptions = opts;
    return false;
  };

  const allowed = requireAuth(
    () => { executed = true; },
    {
      title: 'Reserva Exclusiva',
      message: 'Regístrate para reservar este diseño.',
      redirectUrl: '/artists/obsidian?tab=booking',
    },
    false
  );

  assert(allowed === false, 'requireAuth returns false for guest');
  assert(executed === false, 'Action callback was NOT executed');
  assert(modalOpen === true, 'Modal was opened');
  assert(capturedOptions.title === 'Reserva Exclusiva', 'Options title preserved');
  assert(capturedOptions.message === 'Regístrate para reservar este diseño.', 'Options message preserved');
  assert(capturedOptions.redirectUrl === '/artists/obsidian?tab=booking', 'Options redirectUrl preserved');
});

runTest('Redirect preservation in URL encoding (/register?redirect=...)', () => {
  const edgeCases = [
    {
      input: '/hub?artist=obsidian&flash=123',
      expected: '/register?redirect=%2Fhub%3Fartist%3Dobsidian%26flash%3D123',
    },
    {
      input: '/artists/tattoo art?style=neo traditional&price=$100',
      expected: '/register?redirect=%2Fartists%2Ftattoo%20art%3Fstyle%3Dneo%20traditional%26price%3D%24100',
    },
    {
      input: '/chat?recipient=artist_42&msg=¡Hola! ¿Disponible?',
      expected: '/register?redirect=%2Fchat%3Frecipient%3Dartist_42%26msg%3D%C2%A1Hola!%20%C2%BFDisponible%3F',
    },
    {
      input: '/perfil/artistas#agenda',
      expected: '/register?redirect=%2Fperfil%2Fartistas%23agenda',
    },
  ];

  for (const tc of edgeCases) {
    const encoded = `/register?redirect=${encodeURIComponent(tc.input)}`;
    assert(encoded === tc.expected, `Encoded "${tc.input}" matched expected "${tc.expected}"`);
    // Verify decoding roundtrip
    const decoded = decodeURIComponent(encoded.replace('/register?redirect=', ''));
    assert(decoded === tc.input, `Roundtrip decode preserved exact original URL "${tc.input}"`);
  }
});

// -------------------------------------------------------------
// Category 2: React Component Rendering & Router Context Edge Cases
// -------------------------------------------------------------

runTest('GuestGateModal renders successfully inside MemoryRouter when isOpen is false', () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ['/hub'] },
      React.createElement(GuestGateModal, { isOpen: false, onClose: () => {} })
    )
  );
  assert(html === '', 'GuestGateModal produces empty string when closed');
});

runTest('GuestGateModal renders properly with default options inside MemoryRouter when isOpen is true', () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ['/hub'] },
      React.createElement(GuestGateModal, {
        isOpen: true,
        onClose: () => {},
      })
    )
  );
  assert(html.includes('guest-gate-modal'), 'Modal element exists in DOM');
  assert(html.includes('Únete a la Comunidad de Tattoo Hub'), 'Default title is rendered');
  assert(html.includes('Crear Cuenta Gratuita'), 'Register button is rendered');
  assert(html.includes('Iniciar Sesión'), 'Login button is rendered');
});

runTest('GuestGateModal renders custom title and message inside MemoryRouter', () => {
  const customTitle = 'Custom Gate Title 12345';
  const customMessage = 'Custom Gate Message ABCDE';
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ['/hub'] },
      React.createElement(GuestGateModal, {
        isOpen: true,
        onClose: () => {},
        options: {
          title: customTitle,
          message: customMessage,
          redirectUrl: '/custom-target',
        },
      })
    )
  );
  assert(html.includes(customTitle), 'Custom title rendered in DOM');
  assert(html.includes(customMessage), 'Custom message rendered in DOM');
});

// -------------------------------------------------------------
// Category 3: Architecture & Context Boundary Stress Test
// -------------------------------------------------------------

runTest('Vulnerability Test: GuestGateModal rendered OUTSIDE of React Router context', () => {
  let threwRouterError = false;
  let errorMessage = '';

  try {
    // Attempting to render GuestGateModal outside of Router (e.g., MemoryRouter or BrowserRouter)
    renderToString(
      React.createElement(GuestGateModal, {
        isOpen: false,
        onClose: () => {},
      })
    );
  } catch (err: any) {
    threwRouterError = true;
    errorMessage = err?.message || String(err);
  }

  console.log(`Router context error caught: ${threwRouterError} (message: "${errorMessage}")`);
  assert(
    threwRouterError === true,
    'Expected GuestGateModal to throw when rendered outside of a <Router> because it calls useNavigate() and useLocation()'
  );
  assert(
    errorMessage.includes('useNavigate()') || errorMessage.includes('useLocation()') || errorMessage.includes('Router'),
    'Error message specifically indicates missing Router context'
  );
});

runTest('Vulnerability Test: App.tsx Architecture Verification - GuestGateProvider vs BrowserRouter', () => {
  // In App.tsx:
  // <AuthProvider>
  //   <GuestGateProvider>
  //     <BrowserRouter>
  //       ...
  //     </BrowserRouter>
  //   </GuestGateProvider>
  // </AuthProvider>
  //
  // Since GuestGateProvider renders <GuestGateModal /> directly:
  // <GuestGateContext.Provider value={value}>
  //   {children}
  //   <GuestGateModal isOpen={isOpen} onClose={closeGuestGate} options={options} />
  // </GuestGateContext.Provider>
  //
  // The GuestGateModal is evaluated OUTSIDE of BrowserRouter!
  
  let broke = false;
  let errorMsg = '';
  try {
    renderToString(
      React.createElement(
        AuthProvider,
        null,
        React.createElement(
          GuestGateProvider,
          null,
          React.createElement(MemoryRouter, null, React.createElement('div', null, 'App Content'))
        )
      )
    );
  } catch (err: any) {
    broke = true;
    errorMsg = err?.message || String(err);
    console.log('Rendering GuestGateProvider wrapping Router failed with:', errorMsg);
  }

  if (broke) {
    console.warn('⚠️ CRITICAL ARCHITECTURAL FLAW CONFIRMED:');
    console.warn(`Exact error caught: "${errorMsg}"`);
    console.warn('GuestGateProvider renders GuestGateModal, which invokes useNavigate() and useLocation().');
    console.warn('In App.tsx, GuestGateProvider is placed OUTSIDE of BrowserRouter.');
    console.warn('Therefore, at runtime in production/browser, mounting App will THROW A FATAL REACT ERROR and crash!');
  }

  assert(
    broke === true,
    'Confirmed that GuestGateProvider cannot wrap BrowserRouter when GuestGateModal calls useNavigate/useLocation'
  );
  assert(
    errorMsg.includes('useNavigate()') || errorMsg.includes('useLocation()') || errorMsg.includes('Router'),
    'Error specifically caused by React Router hook called outside Router'
  );
});

runTest('Verification of Required Fix: GuestGateProvider placed INSIDE Router renders cleanly', () => {
  let threw = false;
  let html = '';
  try {
    html = renderToString(
      React.createElement(
        AuthProvider,
        null,
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/'] },
          React.createElement(
            GuestGateProvider,
            null,
            React.createElement('div', null, 'App Content Under Safe Router Context')
          )
        )
      )
    );
  } catch (err: any) {
    threw = true;
    console.error('Failed to render GuestGateProvider inside Router:', err.message);
  }

  assert(threw === false, 'GuestGateProvider renders with zero errors when nested INSIDE Router');
  assert(html.includes('App Content Under Safe Router Context'), 'App content rendered successfully');
});

runTest('Post-Auth Redirect Resolution Logic: Validates redirect query param consumption', () => {
  // Simulator for how RegisterPage / LoginPage should handle destination
  const resolvePostAuthDestination = (searchString: string, defaultDashboard: string): string => {
    const params = new URLSearchParams(searchString);
    const redirectParam = params.get('redirect');
    if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
      return redirectParam;
    }
    return defaultDashboard;
  };

  const case1 = resolvePostAuthDestination('?redirect=%2Fhub', '/client-dashboard');
  assert(case1 === '/hub', 'Safe internal redirect target "/hub" preserved');

  const case2 = resolvePostAuthDestination('?redirect=%2Fchat%3Fartist%3D123', '/client-dashboard');
  assert(case2 === '/chat?artist=123', 'Safe internal redirect with query params preserved');

  const case3 = resolvePostAuthDestination('', '/client-dashboard');
  assert(case3 === '/client-dashboard', 'Default dashboard fallback when no redirect param present');

  // Security test against open redirect vulnerability
  const case4 = resolvePostAuthDestination('?redirect=https%3A%2F%2Fevil.com', '/client-dashboard');
  assert(case4 === '/client-dashboard', 'Prevent open redirect to external domain (https://evil.com)');

  const case5 = resolvePostAuthDestination('?redirect=%2F%2Fevil.com', '/client-dashboard');
  assert(case5 === '/client-dashboard', 'Prevent protocol-relative open redirect (//evil.com)');
});

console.log('\n=============================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('=============================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
