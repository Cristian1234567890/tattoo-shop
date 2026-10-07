import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session, UserMetadata } from '../types';
import { api } from '../api/client';
import { supabase } from '../api/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (isRecovery: boolean) => void;
  isLoading: boolean;
  login: (data: { user: User; session: Session }) => void;
  logout: () => Promise<void>;
  updateUserMetadata: (metadata: Partial<UserMetadata>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(() => {
    return (
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery') ||
      sessionStorage.getItem('is_password_recovery') === 'true'
    );
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const syncUserProfile = async (currentUser: User) => {
    try {
      const res = await api.getUserProfile();
      if (res.success && res.data) {
        updateUserMetadata({
          tipo: (res.data.role as any) || undefined,
          role: (res.data.role as any) || undefined,
          legal_accepted: res.data.legal_accepted,
          legal_accepted_at: res.data.legal_accepted_at || undefined,
          onboarding_completed: res.data.onboarding_completed,
          full_name: res.data.full_name || undefined,
          avatar_url: res.data.avatar_url || undefined,
          phone_number: res.data.phone_number || undefined,
          telefono: res.data.phone_number || undefined,
          has_active_subscription: Boolean(res.data.has_active_subscription),
          trial_days_remaining: res.data.trial_days_remaining,
          is_trial_active: res.data.is_trial_active,
          trial_expired: res.data.trial_expired,
          days_active: res.data.days_active,
        });
        return;
      }
    } catch {}

    // Fallback: direct Supabase query
    try {
      const { data: dbProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      if (dbProfile) {
        const createdAt = new Date(dbProfile.created_at || (currentUser as any).created_at || Date.now());
        const diffDays = Math.ceil(Math.abs(Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const hasSub = Boolean(dbProfile.has_active_subscription);
        const isArtist = (dbProfile.role || '').toLowerCase() === 'tatuador';

        updateUserMetadata({
          tipo: dbProfile.role || undefined,
          role: dbProfile.role || undefined,
          legal_accepted: dbProfile.legal_accepted,
          legal_accepted_at: dbProfile.legal_accepted_at || undefined,
          onboarding_completed: dbProfile.onboarding_completed,
          full_name: dbProfile.full_name || undefined,
          avatar_url: dbProfile.avatar_url || undefined,
          phone_number: dbProfile.phone_number || undefined,
          telefono: dbProfile.phone_number || undefined,
          has_active_subscription: hasSub,
          trial_days_remaining: isArtist ? Math.max(0, 90 - diffDays) : undefined,
          is_trial_active: isArtist ? diffDays <= 90 : undefined,
          trial_expired: isArtist ? diffDays > 90 && !hasSub : undefined,
          days_active: diffDays,
        });
      }
    } catch {}
  };

  const refreshProfile = async () => {
    if (user) {
      await syncUserProfile(user);
    }
  };

  useEffect(() => {
    // 1. Initialize session and sync profile before marking loading false
    const initSession = async () => {
      const stored = api.getStoredSession();
      if (stored?.user && stored?.session) {
        setUser(stored.user);
        setSession(stored.session);
        await syncUserProfile(stored.user);
      }

      try {
        const { data: { session: supaSession } } = await supabase.auth.getSession();
        if (supaSession?.user) {
          const authUser = supaSession.user as any;
          const authSession = supaSession as any;
          setUser(authUser);
          setSession(authSession);
          api.setStoredSession({ user: authUser, session: authSession });
          await syncUserProfile(authUser);
        }
      } catch {}

      setIsLoading(false);
    };

    initSession();

    // 3. Listen to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, supaSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        sessionStorage.setItem('is_password_recovery', 'true');
        if (supaSession?.user) {
          setUser(supaSession.user as any);
          setSession(supaSession as any);
        }
      } else if (supaSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        // Si no está en medio de recuperación, marcar sesión normal
        const isRec =
          window.location.hash.includes('type=recovery') ||
          sessionStorage.getItem('is_password_recovery') === 'true';
        if (isRec) {
          setIsPasswordRecovery(true);
        } else {
          setIsPasswordRecovery(false);
          sessionStorage.removeItem('is_password_recovery');
        }

        const authUser = supaSession.user as any;
        const authSession = supaSession as any;
        setUser(authUser);
        setSession(authSession);
        api.setStoredSession({ user: authUser, session: authSession });
        syncUserProfile(authUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setIsPasswordRecovery(false);
        sessionStorage.removeItem('is_password_recovery');
        api.clearStoredSession();
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = (data: { user: User; session: Session }) => {
    setIsPasswordRecovery(false);
    sessionStorage.removeItem('is_password_recovery');
    setUser(data.user);
    setSession(data.session);
    api.setStoredSession(data);
  };

  const logout = async () => {
    try {
      if (session?.access_token) {
        await api.logout().catch(() => {});
      }
      await supabase.auth.signOut().catch(() => {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setIsPasswordRecovery(false);
      sessionStorage.removeItem('is_password_recovery');
      api.clearStoredSession();
    }
  };

  const updateUserMetadata = (metadata: Partial<UserMetadata>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser: User = {
        ...prevUser,
        user_metadata: {
          ...prevUser.user_metadata,
          ...metadata,
        },
      };
      setSession((prevSession) => {
        if (prevSession) {
          api.setStoredSession({ user: updatedUser, session: prevSession });
        }
        return prevSession;
      });
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user && !!session && !isPasswordRecovery,
        isPasswordRecovery,
        setIsPasswordRecovery,
        isLoading,
        login,
        logout,
        updateUserMetadata,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
