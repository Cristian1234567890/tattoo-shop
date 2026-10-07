import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
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
import { Navbar, NavbarContext } from './components/common/Navbar';
import { Footer, FooterContext } from './components/common/Footer';
import { PageTransition } from './components/common/PageTransition';
import './index.css';

export const OnboardingGate: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoading || !user) return;

    // Public / Legal pages exempt from redirection
    const exemptPaths = ['/about', '/beneficios', '/precios', '/artistas', '/tienda', '/shop', '/legal/terms', '/legal/privacy', '/login', '/register', '/forget-password', '/change-password', '/chat'];
    if (exemptPaths.some((p) => location.pathname.startsWith(p))) {
      return;
    }

    const meta = user.user_metadata || {};
    const normalizedRole = (meta.tipo || meta.role || '').toLowerCase();
    const hasValidRole = normalizedRole === 'cliente' || normalizedRole === 'tatuador';
    const hasCompletedOnboarding =
      meta.onboarding_completed === true &&
      meta.legal_accepted === true &&
      hasValidRole;

    // If user has not completed onboarding and tries direct URL manipulation to access protected views, redirect to /user
    if (!hasCompletedOnboarding && location.pathname !== '/user') {
      navigate('/user', { replace: true });
      return;
    }

    // Smart role redirector when arriving at /user with completed onboarding
    if (hasCompletedOnboarding && location.pathname === '/user') {
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
  const shouldHideFooter = HIDE_FOOTER_PREFIXES.some(
    (prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
  );

  return (
    <NavbarContext.Provider value={{ isMounted: true }}>
      <FooterContext.Provider value={{ isMounted: true }}>
        <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-violet-500/30">
          {/* Persistent global Navbar: stays mounted across all routes without re-mounting flickering */}
          <Navbar forceRender={true} />

          {/* Animated Route Viewport */}
          <div className="flex-1 flex flex-col w-full relative">
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
                <Route path="/user" element={<PageTransition><RegisterPage /></PageTransition>} />
                <Route path="/client-dashboard" element={<PageTransition><ClientDashboardPage /></PageTransition>} />
                <Route path="/artist-dashboard" element={<PageTransition><ArtistDashboardPage /></PageTransition>} />
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
        </div>
      </FooterContext.Provider>
    </NavbarContext.Provider>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <BrowserRouter>
            <GuestGateProvider>
              <OnboardingGate />
              <AnimatedAppRoutes />
            </GuestGateProvider>
          </BrowserRouter>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
};

export default App;
