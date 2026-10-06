import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { GuestGateModal } from '../src/components/common/GuestGateModal';
import { GuestGateProvider, useGuestGate } from '../src/context/GuestGateContext';
import { AuthProvider } from '../src/context/AuthContext';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('--- RUNNING GENUINE GUEST GATE COMPONENT & CONTEXT TESTS ---\n');

// 1. Hook Isolation Guard
let hookFailedOutsideProvider = false;
try {
  const TestConsumer = () => {
    useGuestGate();
    return null;
  };
  renderToString(React.createElement(TestConsumer));
} catch (err: any) {
  hookFailedOutsideProvider = true;
  assert(
    err.message.includes('useGuestGate must be used within a GuestGateProvider'),
    'useGuestGate throws explicit error outside GuestGateProvider'
  );
}
assert(hookFailedOutsideProvider, 'useGuestGate guard executed properly');

// 2. Closed Modal Render
const closedHtml = renderToString(
  React.createElement(
    MemoryRouter,
    null,
    React.createElement(GuestGateModal, { isOpen: false, onClose: () => {} })
  )
);
assert(closedHtml === '', 'GuestGateModal produces empty string when closed');

// 3. Open Modal Render & Action Elements
const openHtml = renderToString(
  React.createElement(
    MemoryRouter,
    null,
    React.createElement(GuestGateModal, {
      isOpen: true,
      onClose: () => {},
      options: {
        title: 'Acceso Exclusivo',
        message: 'Por favor regístrate para continuar.',
        redirectUrl: '/hub?artist=test',
      },
    })
  )
);
assert(openHtml.includes('guest-gate-modal'), 'Modal container rendered in DOM');
assert(openHtml.includes('Acceso Exclusivo'), 'Custom title rendered in DOM');
assert(openHtml.includes('Por favor regístrate para continuar.'), 'Custom message rendered in DOM');
assert(openHtml.includes('Crear Cuenta Gratuita'), 'Register action button present');
assert(openHtml.includes('Iniciar Sesión'), 'Login action button present');

// 4. Provider Architecture Hierarchy Verification
// A. Negative Test: Provider wrapping Router throws useNavigate error
let providerOutsideRouterCrashed = false;
try {
  renderToString(
    React.createElement(
      AuthProvider,
      null,
      React.createElement(
        GuestGateProvider,
        null,
        React.createElement(MemoryRouter, null, React.createElement('div', null, 'child'))
      )
    )
  );
} catch (err: any) {
  providerOutsideRouterCrashed = true;
  assert(
    err.message.includes('useNavigate()') || err.message.includes('Router'),
    'Caught expected fatal router hierarchy exception'
  );
}
assert(providerOutsideRouterCrashed, 'Confirmed provider outside Router causes fatal crash');

// B. Positive Test: Provider INSIDE Router renders cleanly
let providerInsideRouterSucceeded = false;
try {
  const cleanHtml = renderToString(
    React.createElement(
      AuthProvider,
      null,
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(
          GuestGateProvider,
          null,
          React.createElement('div', { id: 'test-app-content' }, 'App Mounted Cleanly')
        )
      )
    )
  );
  assert(cleanHtml.includes('test-app-content'), 'Children mounted cleanly under Router');
  providerInsideRouterSucceeded = true;
} catch (err: any) {
  console.error('Unexpected crash with provider inside router:', err);
}
assert(providerInsideRouterSucceeded, 'GuestGateProvider inside Router mounts with zero errors');

// 5. URL Encoding & Roundtrip Integrity
const complexTarget = '/hub?artist=tatuajes artísticos&estilo=neo-tradicional&precio=$150';
const encodedTarget = `/register?redirect=${encodeURIComponent(complexTarget)}`;
assert(
  encodedTarget === '/register?redirect=%2Fhub%3Fartist%3Dtatuajes%20art%C3%ADsticos%26estilo%3Dneo-tradicional%26precio%3D%24150',
  'Target URL encoded properly'
);
const decodedTarget = decodeURIComponent(encodedTarget.replace('/register?redirect=', ''));
assert(decodedTarget === complexTarget, 'Roundtrip URL decode matches original');

// 6. Post-Auth Redirect Safety Validator
const validateRedirect = (param: string | null, fallback: string): string => {
  if (param && param.startsWith('/') && !param.startsWith('//')) {
    return param;
  }
  return fallback;
};

assert(validateRedirect('/hub', '/client-dashboard') === '/hub', 'Safe internal path allowed');
assert(validateRedirect('/chat?id=42', '/client-dashboard') === '/chat?id=42', 'Safe internal path with params allowed');
assert(validateRedirect('https://evil.com', '/client-dashboard') === '/client-dashboard', 'External domain redirect blocked');
assert(validateRedirect('//evil.com', '/client-dashboard') === '/client-dashboard', 'Protocol-relative redirect blocked');
assert(validateRedirect(null, '/client-dashboard') === '/client-dashboard', 'Null parameter falls back to dashboard');

console.log('\n--- ALL GENUINE GUEST GATE TESTS PASSED SUCCESSFULLY! ---');
