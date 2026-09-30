import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
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

export const OnboardingGate: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoading || !user) return;

    // Public / Legal pages exempt from redirection
    const exemptPaths = ['/about', '/legal/terms', '/legal/privacy', '/login', '/register', '/forget-password', '/change-password', '/chat'];
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

export const AnimatedAppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/hub" element={<ArtistsHubPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/legal/terms" element={<TermsAndConditions />} />
        <Route path="/legal/privacy" element={<PrivacyPolicy />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/user" element={<DashboardPage />} />
        <Route path="/client-dashboard" element={<ClientDashboardPage />} />
        <Route path="/artist-dashboard" element={<ArtistDashboardPage />} />
        {/* /profile cleanly redirects to /client-dashboard?tab=configuracion */}
        <Route
          path="/profile"
          element={<Navigate to="/client-dashboard?tab=configuracion" replace />}
        />
        <Route path="/tattoo" element={<ArtistProfilePage />} />
        <Route path="/artist-profile" element={<ArtistProfilePage />} />
        <Route path="/artist/:id" element={<ArtistProfilePage />} />
        <Route path="/subscription/creditcard" element={<CreditCardPage />} />
        <Route path="/forget-password" element={<ForgotPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <OnboardingGate />
          <AnimatedAppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
