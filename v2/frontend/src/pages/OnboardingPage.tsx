import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OnboardingModal } from '../components/auth/OnboardingModal';
import { PageTransition } from '../components/common/PageTransition';

export const OnboardingPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      const meta = user.user_metadata || {};
      const normalizedRole = (meta.tipo || meta.role || '').toLowerCase();
      const hasValidRole = normalizedRole === 'cliente' || normalizedRole === 'tatuador';
      
      const hasCompletedOnboarding = 
        meta.onboarding_completed === true &&
        meta.legal_accepted === true && 
        Boolean(meta.birthdate || meta.edad) &&
        hasValidRole;

      // Smart redirect if they already completed onboarding
      if (hasCompletedOnboarding) {
        if (normalizedRole === 'tatuador') {
          navigate('/artist-dashboard', { replace: true });
        } else if (normalizedRole === 'cliente') {
          navigate('/client-dashboard', { replace: true });
        } else {
          navigate('/hub', { replace: true });
        }
      }
    } else if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-900 relative p-4 md:p-8 flex items-center justify-center">
        {/* Onboarding modal handles the actual UI */}
        {user && (
          <OnboardingModal
            isOpen={true}
            user={user}
            onCompleted={() => {
              // The component will naturally re-evaluate the useEffect 
              // above and navigate to the correct dashboard once state updates
            }}
          />
        )}
      </div>
    </PageTransition>
  );
};
