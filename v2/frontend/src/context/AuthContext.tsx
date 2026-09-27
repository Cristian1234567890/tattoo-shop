import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session, UserMetadata } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { user: User; session: Session }) => void;
  logout: () => Promise<void>;
  updateUserMetadata: (metadata: Partial<UserMetadata>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const stored = api.getStoredSession();
    if (stored?.user && stored?.session) {
      setUser(stored.user);
      setSession(stored.session);
    }
    setIsLoading(false);
  }, []);

  const login = (data: { user: User; session: Session }) => {
    setUser(data.user);
    setSession(data.session);
    api.setStoredSession(data);
  };

  const logout = async () => {
    try {
      if (session?.access_token) {
        await api.logout();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setSession(null);
      api.clearStoredSession();
    }
  };

  const updateUserMetadata = (metadata: Partial<UserMetadata>) => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      user_metadata: {
        ...user.user_metadata,
        ...metadata,
      },
    };
    setUser(updatedUser);
    if (session) {
      api.setStoredSession({ user: updatedUser, session });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user && !!session,
        isLoading,
        login,
        logout,
        updateUserMetadata,
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
