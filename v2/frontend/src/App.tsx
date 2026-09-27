import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientProfilePage } from './pages/ClientProfilePage';
import { ArtistProfilePage } from './pages/ArtistProfilePage';
import { CreditCardPage } from './pages/CreditCardPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import ArtistsHubPage from './pages/ArtistsHubPage';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import { useAuth } from './context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export const OnboardingGate: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoading || !user) return;

    // Public / Legal pages exempt from redirection
    const exemptPaths = ['/legal/terms', '/legal/privacy', '/login', '/register', '/forget-password', '/change-password'];
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
    }
  }, [user, isLoading, location.pathname, navigate]);

  return null;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <OnboardingGate />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/hub" element={<ArtistsHubPage />} />
            <Route path="/legal/terms" element={<TermsAndConditions />} />
            <Route path="/legal/privacy" element={<PrivacyPolicy />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/user" element={<DashboardPage />} />
            <Route path="/profile" element={<ClientProfilePage />} />
            <Route path="/tattoo" element={<ArtistProfilePage />} />
            <Route path="/artist-profile" element={<ArtistProfilePage />} />
            <Route path="/subscription/creditcard" element={<CreditCardPage />} />
            <Route path="/forget-password" element={<ForgotPasswordPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
