import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_COUNTRIES } from '../../utils/currency';
import { LANGUAGE_OPTIONS } from '../../utils/translations';
import { Logo } from './Logo';
import {
  Menu,
  X,
  Sparkles,
  DollarSign,
  Compass,
  Info,
  User,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
  Globe,
  Check,
  ShoppingBag,
  Languages,
  Lock,
  Sun,
  Moon,
} from 'lucide-react';
import { isQaEnvironment } from '../../api/supabase';
import { ThemeSwitch } from './ThemeSwitch';
import { useTheme } from '../../context/ThemeContext';
import { BecomeArtistModal } from '../auth/BecomeArtistModal';

export const NavbarContext = React.createContext<{ isMounted: boolean }>({ isMounted: false });

export interface NavbarProps {
  forceRender?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ forceRender = false }) => {
  const context = React.useContext(NavbarContext);
  if (context.isMounted && !forceRender) {
    return null;
  }

  const { isAuthenticated, isPasswordRecovery, user, logout, updateUserMetadata } = useAuth();
  const { country, currency, countryInfo, setCountry } = useCurrency();
  const { language, setLanguage, t } = useLanguage();
  const { isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [guestPreferencesOpen, setGuestPreferencesOpen] = useState(false);
  const [becomeArtistOpen, setBecomeArtistOpen] = useState(false);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setCurrencyDropdownOpen(false);
    setUserDropdownOpen(false);
    setGuestPreferencesOpen(false);
  };

  const handleSwitchRole = (targetRole: 'Cliente' | 'Tatuador') => {
    updateUserMetadata({
      tipo: targetRole,
      role: targetRole,
    });
    if (targetRole === 'Tatuador') {
      window.location.href = '/artist-dashboard';
    } else {
      window.location.href = '/client-dashboard';
    }
  };

  const isRecoveryMode =
    isPasswordRecovery ||
    (typeof window !== 'undefined' && window.location.pathname === '/change-password');

  const isArtist =
    user?.user_metadata?.tipo === 'Tatuador' || user?.user_metadata?.role === 'Tatuador';

  const hasVip = Boolean(user?.user_metadata?.has_active_subscription);

  const userCandidate =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.profile ||
    user?.user_metadata?.avatar ||
    (user as any)?.avatar_url ||
    (user as any)?.picture ||
    (user as any)?.identities?.[0]?.identity_data?.avatar_url ||
    (user as any)?.identities?.[0]?.identity_data?.picture ||
    '';

  const [navAvatar, setNavAvatar] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_avatar_override') || '';
    }
    return '';
  });
  const [avatarError, setAvatarError] = useState(false);

  React.useEffect(() => {
    const handleAvatarChange = (e: any) => {
      const newAv = e.detail || (typeof window !== 'undefined' ? localStorage.getItem('user_avatar_override') || '' : '');
      setNavAvatar(newAv);
      setAvatarError(false);
    };
    window.addEventListener('user_avatar_changed', handleAvatarChange);
    return () => window.removeEventListener('user_avatar_changed', handleAvatarChange);
  }, []);

  React.useEffect(() => {
    if (userCandidate) {
      setNavAvatar(userCandidate);
      setAvatarError(false);
    }
  }, [userCandidate]);

  const displayAvatar = navAvatar || userCandidate;

  React.useEffect(() => {
    setAvatarError(false);
  }, [displayAvatar]);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-b from-white/95 via-white/90 to-white/80 dark:from-zinc-950/95 dark:via-zinc-950/90 dark:to-zinc-950/80 dark:bg-gray-950/40 backdrop-blur-md backdrop-blur-xl border-b border-slate-200/60 dark:border-zinc-800/60 dark:border-white/10 shadow-sm dark:shadow-none transition-all duration-300 font-sans text-slate-900 dark:text-white">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 w-full gap-4 xl:gap-8 py-2">
          {/* Brand Logo (Left Section) */}
          <div className="flex items-center justify-start flex-1 min-w-[180px]">
            <Link to="/" id="logo" onClick={closeMenu} className="flex items-center gap-2 no-underline">
              <Logo size="md" />
            </Link>
          </div>

          {/* Desktop Navigation Links (Center Section - Perfectly Centered) */}
          <div className="hidden lg:flex items-center justify-center gap-2 xl:gap-4 shrink-0 px-4">
            {/* Only show Beneficios & Precios if NOT authenticated with VIP */}
            {(!isAuthenticated || !hasVip) && (
              <>
                <Link
                  id="nav-beneficios"
                  to="/beneficios"
                  className="px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                >
                  {t('nav.benefits')}
                </Link>
                <Link
                  id="nav-precios"
                  to="/precios"
                  className="px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                >
                  {t('nav.pricing')}
                </Link>
              </>
            )}
            <Link
              id="nav-artistas"
              to="/artistas"
              className="px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
            >
              {t('nav.artists')}
            </Link>
            <Link
              id="nav-tienda"
              to="/tienda"
              className="px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
            >
              {t('nav.shop')}
            </Link>
            <Link
              to="/hub"
              className="px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
            >
              {t('nav.explore_map')}
            </Link>

          </div>

          {/* Desktop Right Actions: Consolidated Preferences Dropdown (Guest) or User Menu with embedded preferences (Authenticated) */}
          <div className="hidden lg:flex items-center justify-end gap-2 xl:gap-3 flex-1 min-w-[280px]">
            {isRecoveryMode ? (
              <div
                id="recovery-lock-badge"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{t('nav.recovering_password')}</span>
              </div>
            ) : isAuthenticated ? (
              <div className="relative">
                <div className="flex items-center gap-1.5">
                  <Link
                    to={isArtist ? '/artist-dashboard' : '/client-dashboard'}
                    id="nav-user-panel-link"
                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all shadow-sm"
                    title="Ir a mi panel de control"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-800 border border-violet-400/50 flex items-center justify-center shrink-0 shadow-sm">
                      {displayAvatar && !avatarError ? (
                        <img
                          src={displayAvatar}
                          alt="Avatar"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <User className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                      )}
                    </div>
                    <span className="max-w-[85px] truncate font-medium">
                      {user?.user_metadata?.nombre || (isArtist ? 'Tatuador' : 'Cliente')}
                    </span>
                    <span className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30">
                      {isArtist ? 'Tatuador' : 'Cliente'}
                    </span>
                  </Link>

                  <button
                    id="user-menu-toggle-btn"
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setCurrencyDropdownOpen(false);
                    }}
                    aria-label="Abrir opciones de cuenta"
                    className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div
                      id="user-account-dropdown"
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-950/95 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2.5 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150 text-left"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800/80 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-800 border border-violet-500/40 shrink-0 flex items-center justify-center">
                            {displayAvatar && !avatarError ? (
                              <img
                                src={displayAvatar}
                                alt="Avatar"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onError={() => setAvatarError(true)}
                              />
                            ) : (
                              <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {user?.user_metadata?.full_name || user?.user_metadata?.nombre || user?.email}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">{user?.email}</p>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 dark:text-zinc-400">Rol activo:</span>
                          <span className="font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30">
                            {isArtist ? 'Tatuador Profesional' : 'Cliente Explorador'}
                          </span>
                        </div>
                        {hasVip && (
                          <div className="mt-1 flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 dark:text-zinc-400">Suscripción:</span>
                            <span className="font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              VIP Club Activo
                            </span>
                          </div>
                        )}
                        {isQaEnvironment() && (
                          <div className="mt-1 flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 dark:text-zinc-400">Entorno:</span>
                            <span className="font-bold text-amber-500 dark:text-amber-400">QA Sandbox</span>
                          </div>
                        )}
                      </div>

                      {/* Botón Quiero ser Tatuador / Abrir Estudio si es cliente */}
                      {!isArtist && (
                        <div className="px-1 py-1 mb-1.5">
                          <button
                            id="btn-become-artist"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setBecomeArtistOpen(true);
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-violet-700 dark:text-violet-300 hover:text-violet-900 dark:hover:text-white bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 transition-all cursor-pointer shadow-sm"
                          >
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-violet-500 animate-pulse" />
                              <span>Quiero ser Tatuador / Estudio</span>
                            </div>
                            <span className="text-[10px] bg-violet-500/20 px-1.5 py-0.5 rounded text-violet-600 dark:text-violet-300 font-bold uppercase">
                              Pro
                            </span>
                          </button>
                        </div>
                      )}

                      <div className="px-1 py-1 mb-2">
                        <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
                          Cambio Rápido de Función
                        </p>
                        <button
                          id="btn-switch-role"
                          onClick={() => {
                            handleSwitchRole(isArtist ? 'Cliente' : 'Tatuador');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                            <span>{isArtist ? 'Cambiar a Modo Cliente' : 'Cambiar a Modo Tatuador'}</span>
                          </div>
                          <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-300 font-semibold">Switch</span>
                        </button>
                      </div>

                      <div className="space-y-0.5 border-t border-slate-100 dark:border-zinc-800/80 pt-1.5">
                        <Link
                          to={isArtist ? '/artist-dashboard' : '/client-dashboard'}
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                          <span>{isArtist ? 'Mi Panel de Tatuador' : 'Mi Panel de Cliente'}</span>
                        </Link>
                        <Link
                          to={isArtist ? '/artist-dashboard?tab=agenda' : '/client-dashboard?tab=citas'}
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                          <Compass className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                          <span>{isArtist ? 'Mi Agenda & Citas' : 'Mis Citas Reservadas'}</span>
                        </Link>
                        <Link
                          to="/precios"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          <span>Facturación & Suscripciones</span>
                        </Link>
                      </div>

                      {/* Preferencias integradas en el menú de usuario autenticado */}
                      <div className="border-t border-slate-100 dark:border-zinc-800/80 mt-2 pt-2 px-1">
                        <p className="px-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                          Preferencias de Usuario
                        </p>
                        {/* Selector de País & Divisa */}
                        <div className="mb-2">
                          <button
                            onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition"
                          >
                            <span className="flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5 text-violet-500" />
                              <span>{countryInfo.flag} {countryInfo.name}</span>
                            </span>
                            <span className="font-bold text-violet-600 dark:text-violet-400">{currency}</span>
                          </button>
                          {currencyDropdownOpen && (
                            <div className="mt-1 space-y-1 p-1 bg-slate-50 dark:bg-zinc-900 rounded-lg max-h-36 overflow-y-auto">
                              {SUPPORTED_COUNTRIES.map((c) => (
                                <button
                                  key={c.code}
                                  onClick={() => {
                                    setCountry(c.code);
                                    setCurrencyDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-2 py-1 rounded text-[11px] ${
                                    country === c.code
                                      ? 'bg-violet-600/20 text-violet-600 font-bold'
                                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                                  }`}
                                >
                                  <span>{c.flag} {c.name}</span>
                                  <span>{c.defaultCurrency}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Selector de Idioma & Tema */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800/60">
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg">
                            {LANGUAGE_OPTIONS.map((opt) => (
                              <button
                                key={opt.code}
                                onClick={() => setLanguage(opt.code)}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  language === opt.code
                                    ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm'
                                    : 'text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {opt.flag} {opt.code.toUpperCase()}
                              </button>
                            ))}
                          </div>
                          <ThemeSwitch />
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-zinc-800/80 mt-2 pt-1.5">
                        <button
                          id="log-out"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                          <span>{t('nav.logout')}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Modo Invitado: Botón Único de Preferencias Compacto + Login / Registro */
              <div className="flex items-center gap-3">
                {/* Botón único desplegable con test IDs preservados */}
                <div className="relative">
                  <button
                    id="country-currency-selector-btn"
                    onClick={() => setGuestPreferencesOpen(!guestPreferencesOpen)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm shrink-0"
                    aria-label="Seleccionar País, Moneda, Idioma y Tema"
                  >
                    <span className="text-base leading-none">{countryInfo.flag}</span>
                    <span className="text-violet-600 dark:text-violet-400 font-bold">{currency}</span>
                    <span className="text-slate-300 dark:text-zinc-600 font-normal">·</span>
                    <span className="uppercase font-bold text-[11px] text-slate-600 dark:text-zinc-300">{language}</span>
                    <span className="text-slate-300 dark:text-zinc-600 font-normal">·</span>
                    {isDark ? (
                      <Moon className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${guestPreferencesOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {guestPreferencesOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setGuestPreferencesOpen(false)}
                      />
                      <div
                        id="country-currency-dropdown-menu"
                        className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-zinc-950/95 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150 text-slate-800 dark:text-zinc-200"
                      >
                        <div className="px-1 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-violet-400" /> Preferencias Regionales
                          </span>
                          <ThemeSwitch />
                        </div>

                        {/* País & Divisa */}
                        <p className="px-1 text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 mb-1">
                          País & Divisa Activa
                        </p>
                        <div className="space-y-1 mb-3 max-h-48 overflow-y-auto">
                          {SUPPORTED_COUNTRIES.map((c) => {
                            const isSelected = country === c.code;
                            return (
                              <button
                                key={c.code}
                                onClick={() => {
                                  setCountry(c.code);
                                  setGuestPreferencesOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-violet-600/20 text-violet-700 dark:text-white border border-violet-500/40 font-bold'
                                    : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{c.flag}</span>
                                  <div className="text-left">
                                    <p className="leading-tight">{c.name}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                                      {c.defaultCurrency}
                                    </p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-violet-500 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Idioma con selector compatible */}
                        <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                          <div className="flex items-center justify-between mb-1.5 px-1">
                            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                              <Languages className="w-3 h-3 text-violet-500" /> Idioma
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {LANGUAGE_OPTIONS.map((opt) => {
                              const isSelected = language === opt.code;
                              return (
                                <button
                                  key={opt.code}
                                  id="language-selector-btn"
                                  onClick={() => {
                                    setLanguage(opt.code);
                                    setGuestPreferencesOpen(false);
                                  }}
                                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-violet-600/20 text-violet-700 dark:text-white border border-violet-500/40 font-bold'
                                      : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <span>{opt.flag}</span>
                                    <span>{opt.name}</span>
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-500" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Login & Register Buttons */}
                <Link to="/login">
                  <button
                    id="log-in"
                    className="px-4 xl:px-5 py-2 rounded-full text-xs xl:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-gray-200 dark:hover:text-white dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    {t('nav.login')}
                  </button>
                </Link>
                <Link to="/register">
                  <button
                    id="nav-register"
                    className="keep-white-text px-4 xl:px-5 py-2 rounded-full text-xs xl:text-sm font-semibold !text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 border border-violet-400/30 transition-all cursor-pointer"
                  >
                    <span className="!text-white keep-white-text font-semibold">{t('nav.register')}</span>
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
              className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 text-slate-900 dark:text-white shadow-xl">
          <div className="space-y-1">
            {(!isAuthenticated || !hasVip) && (
              <>
                <Link
                  id="mobile-beneficios"
                  to="/beneficios"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                >
                  <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  {t('nav.benefits')}
                </Link>
                <Link
                  id="mobile-precios"
                  to="/precios"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                >
                  <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  {t('nav.pricing')}
                </Link>
              </>
            )}
            <Link
              id="mobile-artistas"
              to="/artistas"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >
              <User className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
              {t('nav.artists')}
            </Link>
            <Link
              id="mobile-tienda"
              to="/tienda"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              {t('nav.shop')}
            </Link>
            <Link
              to="/hub"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >
              <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {t('nav.explore_map')}
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >
              <Info className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              {t('nav.about')}
            </Link>
          </div>

          {/* Mobile Language Selector */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" /> Idioma
              </span>
              <span className="text-xs text-violet-600 dark:text-violet-400 font-bold uppercase">
                {language === 'es' ? '🇪🇸 Español' : '🇺🇸 English'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGE_OPTIONS.map((opt) => {
                const isSelected = language === opt.code;
                return (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      isSelected
                        ? 'bg-violet-600 text-white dark:bg-violet-600/30 dark:text-white border border-violet-500 font-bold shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:border-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{opt.flag}</span>
                      <span>{opt.name}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white dark:text-violet-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Theme Selector */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Tema Visual
            </span>
            <ThemeSwitch />
          </div>

          {/* Mobile Country & Currency Selector */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" /> País & Divisa
              </span>
              <span className="text-xs text-violet-600 dark:text-violet-400 font-bold">
                {countryInfo.flag} {countryInfo.code} ({currency})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_COUNTRIES.map((c) => {
                const isSelected = country === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCountry(c.code);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      isSelected
                        ? 'bg-violet-600 text-white dark:bg-violet-600/30 dark:text-white border border-violet-500 font-bold shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:border-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 shrink-0">
                      {c.defaultCurrency}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Auth Actions */}
          <div className="pt-3 border-t border-white/10">
            {isRecoveryMode ? (
              <div className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <Lock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{t('nav.recovering_password')}</span>
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={isArtist ? '/artist-dashboard' : '/client-dashboard'}
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-full text-sm font-semibold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 shadow-sm"
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-800 border border-indigo-400/50 flex items-center justify-center shrink-0">
                    {displayAvatar && !avatarError ? (
                      <img
                        src={displayAvatar}
                        alt="Avatar"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <span>{isArtist ? t('nav.artist_panel') : t('nav.my_panel')}</span>
                </Link>
                <button
                  id="mobile-btn-switch-role"
                  onClick={() => {
                    handleSwitchRole(isArtist ? 'Cliente' : 'Tatuador');
                    closeMenu();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isArtist ? 'Cambiar a Modo Cliente' : 'Cambiar a Modo Tatuador'}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link to="/login" onClick={closeMenu} className="w-full">
                  <button
                    id="mobile-nav-login"
                    className="w-full py-2.5 px-4 rounded-full text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-gray-200 dark:hover:text-white dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <LogIn className="w-4 h-4 text-slate-600 dark:text-gray-300" />
                    <span>{t('nav.login')}</span>
                  </button>
                </Link>
                <Link to="/register" onClick={closeMenu} className="w-full">
                  <button
                    id="mobile-nav-register"
                    className="keep-white-text w-full py-2.5 px-4 rounded-full text-xs sm:text-sm font-semibold !text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer border border-violet-400/30"
                  >
                    <UserPlus className="w-4 h-4 !text-white keep-white-text" />
                    <span className="!text-white keep-white-text font-semibold">{t('nav.register')}</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Convertirme en Tatuador / Abrir Estudio */}
      <BecomeArtistModal
        isOpen={becomeArtistOpen}
        onClose={() => setBecomeArtistOpen(false)}
      />
    </nav>
  );
};
