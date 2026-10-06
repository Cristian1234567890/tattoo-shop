import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { GuestGateModal } from '../components/common/GuestGateModal';

export interface GuestGateOptions {
  title?: string;
  message?: string;
  redirectUrl?: string;
}

export interface GuestGateContextType {
  isOpen: boolean;
  options: GuestGateOptions;
  openGuestGate: (options?: GuestGateOptions) => void;
  closeGuestGate: () => void;
  requireAuth: (callback: () => void, options?: GuestGateOptions) => boolean;
}

const GuestGateContext = createContext<GuestGateContextType | undefined>(undefined);

export const GuestGateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<GuestGateOptions>({});

  const openGuestGate = useCallback((opts?: GuestGateOptions) => {
    setOptions(opts || {});
    setIsOpen(true);
  }, []);

  const closeGuestGate = useCallback(() => {
    setIsOpen(false);
  }, []);

  const requireAuth = useCallback(
    (callback: () => void, opts?: GuestGateOptions): boolean => {
      if (isAuthenticated) {
        callback();
        return true;
      }
      openGuestGate(opts);
      return false;
    },
    [isAuthenticated, openGuestGate]
  );

  const value = useMemo<GuestGateContextType>(
    () => ({
      isOpen,
      options,
      openGuestGate,
      closeGuestGate,
      requireAuth,
    }),
    [isOpen, options, openGuestGate, closeGuestGate, requireAuth]
  );

  return (
    <GuestGateContext.Provider value={value}>
      {children}
      <GuestGateModal isOpen={isOpen} onClose={closeGuestGate} options={options} />
    </GuestGateContext.Provider>
  );
};

export const useGuestGate = (): GuestGateContextType => {
  const context = useContext(GuestGateContext);
  if (!context) {
    throw new Error('useGuestGate must be used within a GuestGateProvider');
  }
  return context;
};
