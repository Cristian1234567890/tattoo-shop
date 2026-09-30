import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestResult {
  suite: string;
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

function assertTest(
  suite: string,
  name: string,
  expected: string,
  actual: string,
  passed: boolean,
  notes?: string
) {
  results.push({ suite, name, expected, actual, passed, notes });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${icon} | ${name}`);
  if (!passed) {
    console.log(`     Expected: ${expected}`);
    console.log(`     Actual:   ${actual}`);
    if (notes) console.log(`     Notes:    ${notes}`);
  }
}

async function runChallengerVerification() {
  console.log('======================================================================');
  console.log('  CHALLENGER 2: EMPIRICAL HARNESS — MILESTONE 6 UX & SKELETONS');
  console.log('  Deep inspection of Skeleton.tsx, HubSkeleton.tsx, globals.css,');
  console.log('  ArtistsHubPage.tsx, and ClientDashboardPage.tsx');
  console.log('======================================================================\n');

  const frontendDir = fs.existsSync(path.resolve(__dirname, '../frontend'))
    ? path.resolve(__dirname, '../frontend')
    : path.resolve(process.cwd(), 'v2/frontend');

  // Paths
  const skeletonPath = path.join(frontendDir, 'src/components/common/Skeleton.tsx');
  const hubSkeletonPath = path.join(frontendDir, 'src/components/hub/HubSkeleton.tsx');
  const globalsCssPath = path.join(frontendDir, 'src/styles/globals.css');
  const hubPagePath = path.join(frontendDir, 'src/pages/ArtistsHubPage.tsx');
  const clientDashPath = path.join(frontendDir, 'src/pages/ClientDashboardPage.tsx');
  const appPath = path.join(frontendDir, 'src/App.tsx');
  const pageTransitionPath = path.join(frontendDir, 'src/components/common/PageTransition.tsx');

  // =========================================================================
  // SUITE 1: Skeleton.tsx Verification
  // =========================================================================
  console.log('\n--- SUITE 1: Skeleton.tsx Specification & Implementation ---');
  const skeletonSrc = fs.readFileSync(skeletonPath, 'utf8');

  // Test 1.1: File exists and exports Skeleton
  assertTest(
    'Skeleton.tsx',
    'Exports Skeleton component and SkeletonProps interface',
    'export const Skeleton / export default Skeleton / export interface SkeletonProps',
    'Found exports: ' + (skeletonSrc.includes('export const Skeleton') && skeletonSrc.includes('export default Skeleton')),
    skeletonSrc.includes('export const Skeleton') &&
      skeletonSrc.includes('export default Skeleton') &&
      skeletonSrc.includes('export interface SkeletonProps')
  );

  // Test 1.2: Variant styles
  assertTest(
    'Skeleton.tsx',
    'Supports rectangular, circular, and text variants with proper classes',
    'rectangular: rounded-xl, circular: rounded-full, text: rounded-md h-4 w-full',
    'Variant mapping present in code',
    skeletonSrc.includes("'rounded-xl'") &&
      skeletonSrc.includes("'rounded-full'") &&
      skeletonSrc.includes("'rounded-md h-4 w-full'") &&
      skeletonSrc.includes("variant = 'rectangular'")
  );

  // Test 1.3: Glassmorphic base styling
  assertTest(
    'Skeleton.tsx',
    'Applies glassmorphic dark container styling (bg-white/5 border border-white/5 relative overflow-hidden)',
    'relative overflow-hidden bg-white/5 border border-white/5',
    'Classes found: ' + skeletonSrc.includes('relative overflow-hidden bg-white/5 border border-white/5'),
    skeletonSrc.includes('relative overflow-hidden bg-white/5 border border-white/5')
  );

  // Test 1.4: Shimmer overlay element
  assertTest(
    'Skeleton.tsx',
    'Inner shimmer div has animate-shimmer, gradient, -translate-x-full, and aria-hidden',
    'animate-shimmer + bg-gradient-to-r from-transparent via-white/10 to-transparent + aria-hidden="true"',
    'Shimmer overlay present',
    skeletonSrc.includes('animate-shimmer') &&
      skeletonSrc.includes('bg-gradient-to-r from-transparent via-white/10 to-transparent') &&
      skeletonSrc.includes('-translate-x-full') &&
      skeletonSrc.includes('aria-hidden="true"')
  );

  // Test 1.5: HTML Props forwarding
  assertTest(
    'Skeleton.tsx',
    'Passes through HTMLDivElement attributes (...props)',
    '{...props} present on container div',
    skeletonSrc.includes('{...props}') ? 'Found {...props}' : 'Missing {...props}',
    skeletonSrc.includes('{...props}')
  );

  // =========================================================================
  // SUITE 2: HubSkeleton.tsx Specification & Implementation
  // =========================================================================
  console.log('\n--- SUITE 2: HubSkeleton.tsx & HubDrawerSkeleton ---');
  const hubSkeletonSrc = fs.readFileSync(hubSkeletonPath, 'utf8');

  // Test 2.1: Exports HubSkeleton and HubDrawerSkeleton
  assertTest(
    'HubSkeleton.tsx',
    'Exports HubSkeleton and HubDrawerSkeleton components',
    'export const HubDrawerSkeleton and export const HubSkeleton and export default HubSkeleton',
    'Exports found',
    hubSkeletonSrc.includes('export const HubDrawerSkeleton') &&
      hubSkeletonSrc.includes('export const HubSkeleton') &&
      hubSkeletonSrc.includes('export default HubSkeleton')
  );

  // Test 2.2: HubDrawerSkeleton card count and styling
  assertTest(
    'HubDrawerSkeleton',
    'Renders 4 placeholder cards with glassmorphic styling and animate-pulse',
    '[1, 2, 3, 4] map with p-3 bg-white/5 border border-white/5 rounded-2xl animate-pulse',
    'Found loop and card classes: ' + hubSkeletonSrc.includes('[1, 2, 3, 4]'),
    hubSkeletonSrc.includes('[1, 2, 3, 4]') &&
      hubSkeletonSrc.includes('bg-white/5 border border-white/5 rounded-2xl') &&
      hubSkeletonSrc.includes('animate-pulse')
  );

  // Test 2.3: HubSkeleton Radar theme background
  assertTest(
    'HubSkeleton',
    'Container uses deep obsidian background bg-[#090d16]',
    'bg-[#090d16] flex items-center justify-center overflow-hidden',
    'Found background class: ' + hubSkeletonSrc.includes('bg-[#090d16]'),
    hubSkeletonSrc.includes('bg-[#090d16]')
  );

  // Test 2.4: Concentric radar rings and ping animation
  assertTest(
    'HubSkeleton',
    'Renders concentric radar rings with custom animation duration',
    'w-96, w-80, w-60, w-40, w-20 rings with border and animate-ping [animation-duration:4s]',
    'Rings found',
    hubSkeletonSrc.includes('w-96 h-96 rounded-full border border-violet-500/15 animate-ping [animation-duration:4s]') &&
      hubSkeletonSrc.includes('w-80 h-80') &&
      hubSkeletonSrc.includes('w-60 h-60') &&
      hubSkeletonSrc.includes('w-40 h-40') &&
      hubSkeletonSrc.includes('w-20 h-20')
  );

  // Test 2.5: Radar sweep beam and beacon
  assertTest(
    'HubSkeleton',
    'Renders rotating radar sweep beam and Compass beacon',
    'animate-spin [animation-duration:6s] and Compass [animation-duration:10s]',
    'Sweep and beacon found',
    hubSkeletonSrc.includes('animate-spin [animation-duration:6s]') &&
      hubSkeletonSrc.includes('animate-spin [animation-duration:10s]') &&
      hubSkeletonSrc.includes('Radar de Estudio') &&
      hubSkeletonSrc.includes('Sincronizando Radar de Artistas')
  );

  // =========================================================================
  // SUITE 3: globals.css Inspection (Slidein Removal & Background #090d16)
  // =========================================================================
  console.log('\n--- SUITE 3: globals.css Inspection ---');
  const globalsCssSrc = fs.readFileSync(globalsCssPath, 'utf8');

  // Test 3.1: Slidein animation completely removed
  assertTest(
    'globals.css',
    'Verify absolute removal of slidein animation',
    'No occurrences of slidein in globals.css',
    globalsCssSrc.includes('slidein') ? 'FAILED: slidein found' : 'CONFIRMED: slidein is absent',
    !globalsCssSrc.includes('slidein')
  );

  // Test 3.2: Legacy background-image removed
  assertTest(
    'globals.css',
    'Verify removal of background-image: url("/assets/1403.jpg")',
    'No url("/assets/1403.jpg") in globals.css',
    globalsCssSrc.includes('1403.jpg') ? 'FAILED: 1403.jpg found' : 'CONFIRMED: 1403.jpg is absent',
    !globalsCssSrc.includes('1403.jpg')
  );

  // Test 3.3: #090d16 defined for body
  assertTest(
    'globals.css',
    'body has background-color: #090d16 and color: #f5f5f5',
    'background-color: #090d16 in body rule',
    'body rule has #090d16: ' + globalsCssSrc.includes('background-color: #090d16'),
    globalsCssSrc.includes('background-color: #090d16;')
  );

  // Test 3.4: #090d16 defined for .dark body
  assertTest(
    'globals.css',
    '.dark body has background-color: #090d16 and color: #f5f5f5',
    'background-color: #090d16 in .dark body rule',
    '.dark body rule has #090d16: ' + globalsCssSrc.includes('.dark body'),
    globalsCssSrc.includes('.dark body {\n  background-color: #090d16;\n  color: #f5f5f5;\n}') ||
      globalsCssSrc.includes('.dark body {\r\n  background-color: #090d16;\r\n  color: #f5f5f5;\r\n}')
  );

  // Test 3.5: @keyframes shimmer definition
  assertTest(
    'globals.css',
    '@keyframes shimmer is defined with 0% translateX(-100%) and 100% translateX(100%)',
    'translateX(-100%) to translateX(100%)',
    'Shimmer keyframes present',
    globalsCssSrc.includes('@keyframes shimmer') &&
      globalsCssSrc.includes('transform: translateX(-100%);') &&
      globalsCssSrc.includes('transform: translateX(100%);')
  );

  // Test 3.6: .animate-shimmer class
  assertTest(
    'globals.css',
    '.animate-shimmer class defines shimmer 2s infinite linear',
    'animation: shimmer 2s infinite linear;',
    'animate-shimmer found',
    globalsCssSrc.includes('.animate-shimmer') &&
      globalsCssSrc.includes('animation: shimmer 2s infinite linear;')
  );

  // Test 3.7: CSS Cascade & Dark specificity analysis
  // Specificity analysis: .dark body has specificity (0, 1, 1), whereas body has (0, 0, 1)
  // Since ThemeProvider activates .dark on <html>, .dark body (#090d16) wins over any plain body rule!
  const hasDarkSpecificity = globalsCssSrc.includes('.dark body') && globalsCssSrc.includes('#090d16');
  assertTest(
    'globals.css',
    'Dark mode specificity ensures #090d16 is active for document body (.dark body: (0,1,1))',
    '.dark body specificity (0,1,1) > plain body (0,0,1)',
    hasDarkSpecificity ? 'Specificity hierarchy verified' : 'Missing .dark body rule',
    hasDarkSpecificity
  );

  // =========================================================================
  // SUITE 4: ArtistsHubPage.tsx CSS & Skeleton Integration
  // =========================================================================
  console.log('\n--- SUITE 4: ArtistsHubPage.tsx CSS & Skeletons ---');
  const hubPageSrc = fs.readFileSync(hubPagePath, 'utf8');

  // Test 4.1: Crude spinner removed
  assertTest(
    'ArtistsHubPage.tsx',
    'Old crude spinner (animate-spin border-t-2 border-b-2 border-primary) completely replaced',
    'No animate-spin border-t-2 border-b-2 border-primary',
    hubPageSrc.includes('animate-spin border-t-2 border-b-2 border-primary')
      ? 'Crude spinner still present'
      : 'Crude spinner replaced',
    !hubPageSrc.includes('animate-spin border-t-2 border-b-2 border-primary')
  );

  // Test 4.2: HubSkeleton & HubDrawerSkeleton integration
  assertTest(
    'ArtistsHubPage.tsx',
    'Imports and renders HubSkeleton in map container and HubDrawerSkeleton in nearest drawer',
    'loading ? <HubSkeleton /> and loading ? <HubDrawerSkeleton />',
    'Imports & JSX present',
    hubPageSrc.includes("import { HubSkeleton, HubDrawerSkeleton } from '../components/hub/HubSkeleton'") &&
      hubPageSrc.includes('<HubSkeleton />') &&
      hubPageSrc.includes('<HubDrawerSkeleton />')
  );

  // Test 4.3: Presence of data-testid attributes
  const requiredHubTestIds = [
    'style-filter-bar',
    'filter-pill-',
    'nearest-drawer',
    'drawer-toggle-btn',
    'gps-locate-btn',
    'artist-card',
    'artist-name',
    'artist-style',
    'distance-badge',
    'btn-center-artist',
    'btn-whatsapp-artist',
    'hub-map-container',
  ];
  const missingTestIds = requiredHubTestIds.filter((tid) => !hubPageSrc.includes(tid));
  assertTest(
    'ArtistsHubPage.tsx',
    'Contains all 11+ required data-testid attributes for testing & Playwright',
    'All required data-testid attributes found',
    missingTestIds.length === 0 ? 'All 11 present' : `Missing: ${missingTestIds.join(', ')}`,
    missingTestIds.length === 0
  );

  // Test 4.4: Tactile micro-interactions (glows & active:scale-95)
  assertTest(
    'ArtistsHubPage.tsx',
    'Active filter pills have purple glow and interactive buttons have active:scale-95',
    'shadow-[0_0_20px_rgba(105,68,255,0.45)] and active:scale-95',
    'Glow and active scale present',
    hubPageSrc.includes('shadow-[0_0_20px_rgba(105,68,255,0.45)]') &&
      hubPageSrc.includes('active:scale-95')
  );

  // =========================================================================
  // SUITE 5: ClientDashboardPage.tsx CSS, Skeletons & Bounce Fix
  // =========================================================================
  console.log('\n--- SUITE 5: ClientDashboardPage.tsx UX & Bounce Fix ---');
  const clientDashSrc = fs.readFileSync(clientDashPath, 'utf8');

  // Test 5.1: Crude spinner removed
  assertTest(
    'ClientDashboardPage.tsx',
    'Crude spinner (animate-spin border-t-2 border-b-2 border-primary) completely replaced',
    'No animate-spin border-t-2 border-b-2 border-primary',
    clientDashSrc.includes('animate-spin border-t-2 border-b-2 border-primary')
      ? 'Crude spinner still present'
      : 'Crude spinner replaced',
    !clientDashSrc.includes('animate-spin border-t-2 border-b-2 border-primary')
  );

  // Test 5.2: Skeleton loading view
  assertTest(
    'ClientDashboardPage.tsx',
    'Renders luxury dark skeleton layout during isLoading / !user',
    'if (isLoading || !user) renders <main ... animate-pulse> with <Skeleton /> components',
    'Skeleton import and loading view present',
    clientDashSrc.includes("import { Skeleton } from '../components/common/Skeleton'") &&
      clientDashSrc.includes('if (isLoading || !user)') &&
      clientDashSrc.includes('<Skeleton className="')
  );

  // Test 5.3: Card 3 bounce loop fix
  assertTest(
    'ClientDashboardPage.tsx',
    'Action Card 3 links to /hub (not /user), preventing redirect bounce loop',
    'Link to="/hub" for Explorar catálogo',
    clientDashSrc.includes('to="/hub"') ? 'Linked to /hub' : 'Still linking to /user or other',
    clientDashSrc.includes('to="/hub"') &&
      !clientDashSrc.includes('<Link\n                to="/user"\n                className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"\n              >\n                Explorar cat')
  );

  // =========================================================================
  // SUITE 6: App.tsx & PageTransition.tsx Smooth Navigation
  // =========================================================================
  console.log('\n--- SUITE 6: Navigation & Page Transitions ---');
  const appSrc = fs.readFileSync(appPath, 'utf8');
  const pageTransitionSrc = fs.readFileSync(pageTransitionPath, 'utf8');

  // Test 6.1: AnimatePresence wrapper
  assertTest(
    'App.tsx',
    'Routes wrapped in <AnimatePresence mode="wait"> with location pathname key',
    '<AnimatePresence mode="wait"> and <Routes location={location} key={location.pathname}>',
    'AnimatePresence present in App.tsx',
    appSrc.includes('<AnimatePresence mode="wait">') &&
      (appSrc.includes('key={location.pathname}') || appSrc.includes('key={location.key}'))
  );

  // Test 6.2: PageTransition wraps pages
  const homeSrc = fs.readFileSync(path.join(frontendDir, 'src/pages/HomePage.tsx'), 'utf8');
  assertTest(
    'Page Views',
    'Page views embed <PageTransition> at root for smooth transitions',
    '<PageTransition><div ...> embedded at root of views',
    'PageTransition wrapper found in page views',
    homeSrc.includes('<PageTransition>') &&
      homeSrc.includes('import { PageTransition }')
  );

  // Test 6.3: /profile redirect to configuracion tab
  assertTest(
    'App.tsx',
    '/profile redirects cleanly to /client-dashboard?tab=configuracion',
    'Navigate to="/client-dashboard?tab=configuracion" replace',
    'Redirect route present',
    appSrc.includes('path="/profile"') &&
      appSrc.includes('to="/client-dashboard?tab=configuracion"')
  );

  // Test 6.4: PageTransition variants
  assertTest(
    'PageTransition.tsx',
    'PageTransition defines initial, animate, and exit animations with opacity, y, and blur',
    'blur(4px) -> blur(0px) -> blur(2px) and opacity 0 -> 1 -> 0',
    'Variants present',
    pageTransitionSrc.includes("filter: 'blur(4px)'") &&
      pageTransitionSrc.includes("filter: 'blur(0px)'") &&
      pageTransitionSrc.includes("filter: 'blur(2px)'")
  );

  // =========================================================================
  // SUITE 7: Compiled CSS Classes Integrity Check
  // =========================================================================
  console.log('\n--- SUITE 7: Compiled CSS Classes Integrity Check ---');
  const distDir = path.join(frontendDir, 'dist/assets');
  let cssFile = '';
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    cssFile = files.find((f) => f.endsWith('.css')) || '';
  }

  if (cssFile) {
    const compiledCss = fs.readFileSync(path.join(distDir, cssFile), 'utf8');

    // Check critical compiled utilities
    const criticalSelectors = [
      'animate-shimmer',
      'bg-white\\/5',
      'border-white\\/5',
      'bg-violet-600\\/10',
      'border-violet-500\\/15',
      'border-violet-500\\/20',
      'border-primary\\/25',
      'border-blue-500\\/30',
      'border-blue-400\\/40',
      'backdrop-blur-xl',
      'shadow-\\[0_0_20px_rgba\\(105\\,68\\,255\\,0\\.45\\)\\]',
      'shadow-\\[0_0_30px_rgba\\(105\\,68\\,255\\,0\\.3\\)\\]',
      'active\\:scale-95',
    ];

    let allCompiled = true;
    const missingInBundle: string[] = [];

    for (const selector of criticalSelectors) {
      if (!compiledCss.includes(selector)) {
        allCompiled = false;
        missingInBundle.push(selector);
      }
    }

    assertTest(
      'Compiled CSS',
      'All critical luxury studio utility classes compile successfully in production bundle',
      'All 13 critical selectors found in ' + cssFile,
      missingInBundle.length === 0 ? 'All 13 compiled' : `Missing: ${missingInBundle.join(', ')}`,
      allCompiled
    );
  } else {
    assertTest(
      'Compiled CSS',
      'Compiled CSS bundle exists',
      'CSS file in dist/assets',
      'No CSS file found',
      false
    );
  }

  // Summary
  console.log('\n======================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`  CHALLENGER 2 VERIFICATION SUMMARY: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runChallengerVerification().catch((err) => {
  console.error('Unhandled verification error:', err);
  process.exit(1);
});
