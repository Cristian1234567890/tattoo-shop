import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LanguageProvider } from './context/LanguageContext';
import { GeolocationProvider } from './context/GeolocationContext';
import { GuestGateProvider } from './context/GuestGateContext';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ArtistProfilePage } from './pages/ArtistProfilePage';
import { CreditCardPage } from './pages/CreditCardPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import ArtistsHubPage from './pages/ArtistsHubPage';
import { ChatPage } from './pages/ChatPage';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import { ClientDashboardPage } from './pages/ClientDashboardPage';
import { ArtistDashboardPage } from './pages/ArtistDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { BenefitsPage } from './pages/BenefitsPage';
import { PricingPage } from './pages/PricingPage';
import { ArtistsDirectoryPage } from './pages/ArtistsDirectoryPage';
import { ShopPage } from './pages/ShopPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { BecomeArtistPage } from './pages/BecomeArtistPage';
import { Navbar, NavbarContext } from './components/common/Navbar';
import { QaEnvironmentBanner } from './components/common/QaEnvironmentBanner';
import { Footer, FooterContext } from './components/common/Footer';
import { PageTransition } from './components/common/PageTransition';
import { TattooPatternBackground } from './components/common/TattooPatternBackground';
import { FloatingChatWidget } from './components/common/FloatingChatWidget';
import './index.css';

export const OnboardingGate: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoading || !user) return;

    // Public / Legal pages exempt from redirection
    const exemptPaths = [
      '/unete-como-tatuador',
      '/become-artist',
      '/hub',
      '/about',
      '/beneficios',
      '/precios',
      '/artistas',
      '/tienda',
      '/shop',
      '/legal/terms',
      '/legal/privacy',
      '/login',
      '/register',
      '/forget-password',
      '/change-password',
      '/chat',
      '/user',
      '/onboarding',
      '/subscription',
      '/unete-como-tatuador',
    ];
    if (exemptPaths.some((p) => location.pathname.startsWith(p))) {
      return;
    }

    const meta = user.user_metadata || {};
    const normalizedRole = (meta.tipo || meta.role || '').toLowerCase();
    const hasValidRole = normalizedRole === 'cliente' || normalizedRole === 'tatuador';
    const hasCompletedOnboarding =
      meta.onboarding_completed === true &&
      meta.legal_accepted === true &&
      Boolean(meta.birthdate || meta.edad) &&
      hasValidRole;

    // If user has not completed onboarding and tries direct URL manipulation to access protected views, redirect to /user
    if (!hasCompletedOnboarding && location.pathname !== '/user' && location.pathname !== '/onboarding') {
      navigate('/user', { replace: true });
      return;
    }

    // Smart role redirector when arriving at /user or /onboarding with completed onboarding
    if (hasCompletedOnboarding && (location.pathname === '/user' || location.pathname === '/onboarding')) {
      if (normalizedRole === 'tatuador') {
        navigate('/artist-dashboard', { replace: true });
      } else if (normalizedRole === 'cliente') {
        navigate('/client-dashboard', { replace: true });
      }
    }
  }, [user, isLoading, location.pathname, navigate]);

  return null;
};

const ChatAuthGate: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-zinc-400">
        Cargando...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/register?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return <ChatPage />;
};

export const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  requiredRole?: string;
}> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isPasswordRecovery, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-zinc-400">
        Cargando...
      </div>
    );
  }

  // Security Hardening: If user arrives via recovery link, restrict access to dashboards!
  if (isPasswordRecovery) {
    return <Navigate to="/change-password" replace />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  if (requiredRole) {
    const meta = user.user_metadata || {};
    const role = (meta.tipo || meta.role || '').toLowerCase();
    if (role && role !== requiredRole.toLowerCase()) {
      return (
        <Navigate
          to={role === 'tatuador' ? '/artist-dashboard' : '/client-dashboard'}
          replace
        />
      );
    }
  }

  return children;
};

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

export const AnimatedAppRoutes: React.FC = () => {
  const location = useLocation();
  const { isDark } = useTheme();
  const shouldHideFooter = HIDE_FOOTER_PREFIXES.some(
    (prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
  );
  const isFullScreenApp = location.pathname === '/chat' || location.pathname === '/hub';

  return (
    <NavbarContext.Provider value={{ isMounted: true }}>
      <FooterContext.Provider value={{ isMounted: true }}>
        <div
          className={`${
            isFullScreenApp ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'
          } flex flex-col font-sans transition-colors duration-300 relative selection:bg-amber-500/30 ${
            isDark ? 'bg-[#090d16] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
          }`}
        >
          {/* Vibrant Ambient Glows & Atmosphere */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            {isDark ? (
              <>
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px]" />
                <div className="absolute top-1/3 -right-40 w-[650px] h-[650px] bg-violet-600/10 rounded-full blur-[150px]" />
                <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-amber-600/5 rounded-full blur-[160px]" />
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
              </>
            ) : (
              <>
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-200/35 rounded-full blur-[140px]" />
                <div className="absolute top-1/3 -right-40 w-[650px] h-[650px] bg-indigo-200/25 rounded-full blur-[150px]" />
                <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-amber-100/50 rounded-full blur-[160px]" />
                <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:24px_24px] opacity-50" />
              </>
            )}
          </div>

          {/* Dynamic Tattoo Watermark Pattern (TH-46) */}
          <TattooPatternBackground />

          {/* Segregated QA Environment banner (only active on QA/Staging environments) */}
          <div className="relative z-50">
            <QaEnvironmentBanner />
          </div>

          {/* Persistent global Navbar: stays mounted across all routes without re-mounting flickering */}
          <div className="sticky top-0 z-50">
            <Navbar forceRender={true} />
          </div>

          {/* Animated Route Viewport */}
          <div className={`flex-1 flex flex-col w-full relative z-10 min-h-0 ${isFullScreenApp ? 'overflow-hidden' : ''}`}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* <Route path="/" element={<HomePage />} /> */}
                <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
                <Route path="/beneficios" element={<PageTransition><BenefitsPage /></PageTransition>} />
                <Route path="/precios" element={<PageTransition><PricingPage /></PageTransition>} />
                <Route path="/artistas" element={<PageTransition><ArtistsDirectoryPage /></PageTransition>} />
                <Route path="/tienda" element={<PageTransition><ShopPage /></PageTransition>} />
                <Route path="/shop" element={<Navigate to="/tienda" replace />} />
                {/* <Route path="/about" element={<AboutPage />} /> */}
                <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
                {/* <Route path="/hub" element={<ArtistsHubPage />} /> */}
                <Route path="/hub" element={<PageTransition><ArtistsHubPage /></PageTransition>} />
                <Route path="/chat" element={<PageTransition><ChatAuthGate /></PageTransition>} />
                <Route path="/legal/terms" element={<PageTransition><TermsAndConditions /></PageTransition>} />
                <Route path="/legal/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
                <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
                <Route path="/unete-como-tatuador" element={<PageTransition><BecomeArtistPage /></PageTransition>} />
                <Route path="/become-artist" element={<Navigate to="/unete-como-tatuador" replace />} />
                <Route path="/user" element={<PageTransition><OnboardingPage /></PageTransition>} />
                <Route path="/onboarding" element={<PageTransition><OnboardingPage /></PageTransition>} />
                <Route
                  path="/client-dashboard"
                  element={
                    <PageTransition>
                      <ProtectedRoute requiredRole="cliente">
                        <ClientDashboardPage />
                      </ProtectedRoute>
                    </PageTransition>
                  }
                />
                <Route
                  path="/artist-dashboard"
                  element={
                    <PageTransition>
                      <ProtectedRoute requiredRole="tatuador">
                        <ArtistDashboardPage />
                      </ProtectedRoute>
                    </PageTransition>
                  }
                />
                {/* /profile cleanly redirects to /client-dashboard?tab=configuracion */}
                <Route
                  path="/profile"
                  element={<Navigate to="/client-dashboard?tab=configuracion" replace />}
                />
                <Route path="/tattoo" element={<PageTransition><ArtistProfilePage /></PageTransition>} />
                <Route path="/artist-profile" element={<PageTransition><ArtistProfilePage /></PageTransition>} />
                <Route path="/artist/:id" element={<PageTransition><ArtistProfilePage /></PageTransition>} />
                <Route path="/subscription/creditcard" element={<PageTransition><CreditCardPage /></PageTransition>} />
                <Route path="/forget-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
                <Route path="/change-password" element={<PageTransition><ChangePasswordPage /></PageTransition>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </div>

          {/* Approved R4 Conditional Footer */}
          {!shouldHideFooter && <Footer forceRender={true} />}

          {/* Floating Chat Widget for Authenticated Users */}
          <FloatingChatWidget />
        </div>
      </FooterContext.Provider>
    </NavbarContext.Provider>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
            <GeolocationProvider>
              <BrowserRouter>
                <GuestGateProvider>
                  <OnboardingGate />
                  <AnimatedAppRoutes />
                </GuestGateProvider>
              </BrowserRouter>
            </GeolocationProvider>
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
