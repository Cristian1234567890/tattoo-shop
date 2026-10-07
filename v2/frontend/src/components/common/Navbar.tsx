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
} from 'lucide-react';

export const NavbarContext = React.createContext<{ isMounted: boolean }>({ isMounted: false });

export interface NavbarProps {
  forceRender?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ forceRender = false }) => {
  const context = React.useContext(NavbarContext);
  if (context.isMounted && !forceRender) {
    return null;
  }

  const { isAuthenticated, isPasswordRecovery, user, logout } = useAuth();
  const { country, currency, countryInfo, setCountry } = useCurrency();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setCurrencyDropdownOpen(false);
    setLanguageDropdownOpen(false);
  };

  const isRecoveryMode =
    isPasswordRecovery ||
    (typeof window !== 'undefined' && window.location.pathname === '/change-password');

  const isArtist =
    user?.user_metadata?.tipo === 'Tatuador' || user?.user_metadata?.role === 'Tatuador';

  const hasVip = Boolean(user?.user_metadata?.has_active_subscription);

  return (
    <nav className="bg-gray-950/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 transition-all font-sans text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" id="logo" onClick={closeMenu} className="flex items-center gap-2 no-underline">
              <Logo size="md" />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* Only show Beneficios & Precios if NOT authenticated with VIP */}
            {(!isAuthenticated || !hasVip) && (
              <>
                <Link
                  id="nav-beneficios"
                  to="/beneficios"
                  className="px-3.5 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {t('nav.benefits')}
                </Link>
                <Link
                  id="nav-precios"
                  to="/precios"
                  className="px-3.5 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {t('nav.pricing')}
                </Link>
              </>
            )}
            <Link
              id="nav-artistas"
              to="/artistas"
              className="px-3.5 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {t('nav.artists')}
            </Link>
            <Link
              id="nav-tienda"
              to="/tienda"
              className="px-3.5 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {t('nav.shop')}
            </Link>
            <Link
              to="/hub"
              className="px-3.5 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {t('nav.explore_map')}
            </Link>
            <Link
              to="/about"
              className="px-3.5 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {t('nav.about')}
            </Link>
          </div>

          {/* Desktop Right Actions: Country/Currency Selector + Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Country & Currency Selector Dropdown */}
            <div className="relative">
              <button
                id="country-currency-selector-btn"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
                aria-label="Seleccionar País y Moneda"
              >
                <span className="text-base leading-none">{countryInfo.flag}</span>
                <span>{countryInfo.code}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-violet-400 font-bold">{currency}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {currencyDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCurrencyDropdownOpen(false)}
                  />
                  <div
                    id="country-currency-dropdown-menu"
                    className="absolute right-0 mt-2 w-64 bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80 mb-1 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-violet-400" />
                      País & Divisa Activa
                    </div>
                    <div className="space-y-1">
                      {SUPPORTED_COUNTRIES.map((c) => {
                        const isSelected = country === c.code;
                        return (
                          <button
                            key={c.code}
                            onClick={() => {
                              setCountry(c.code);
                              setCurrencyDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-violet-600/20 text-white border border-violet-500/40'
                                : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{c.flag}</span>
                              <div className="text-left">
                                <p className="font-semibold leading-tight">{c.name}</p>
                                <p className="text-[10px] text-zinc-400">
                                  Moneda: {c.defaultCurrency}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-violet-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                id="language-selector-btn"
                onClick={() => {
                  setLanguageDropdownOpen(!languageDropdownOpen);
                  setCurrencyDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
                aria-label="Seleccionar Idioma"
              >
                <Languages className="w-3.5 h-3.5 text-violet-400" />
                <span className="uppercase font-bold">{language}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {languageDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLanguageDropdownOpen(false)}
                  />
                  <div
                    id="language-dropdown-menu"
                    className="absolute right-0 mt-2 w-44 bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80 mb-1 flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-violet-400" />
                      Idioma
                    </div>
                    <div className="space-y-1">
                      {LANGUAGE_OPTIONS.map((opt) => {
                        const isSelected = language === opt.code;
                        return (
                          <button
                            key={opt.code}
                            onClick={() => {
                              setLanguage(opt.code);
                              setLanguageDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-violet-600/20 text-white border border-violet-500/40'
                                : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{opt.flag}</span>
                              <span className="font-semibold">{opt.name}</span>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-violet-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Auth Actions */}
            {isRecoveryMode ? (
              <div
                id="recovery-lock-badge"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{t('nav.recovering_password')}</span>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={isArtist ? '/artist-dashboard' : '/client-dashboard'}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all"
                >
                  {isArtist ? t('nav.artist_panel') : t('nav.my_panel')}
                </Link>
                <button
                  onClick={() => logout()}
                  id="log-out"
                  className="px-4 py-1.5 rounded-full text-sm font-semibold bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-300 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <button
                    id="log-in"
                    className="px-5 py-2 rounded-full text-sm font-medium text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-sm hover:shadow-lg"
                  >
                    {t('nav.login')}
                  </button>
                </Link>
                <Link to="/register">
                  <button
                    id="nav-register"
                    className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 border border-violet-400/30 transition-all cursor-pointer"
                  >
                    {t('nav.register')}
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-950/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {(!isAuthenticated || !hasVip) && (
              <>
                <Link
                  id="mobile-beneficios"
                  to="/beneficios"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  {t('nav.benefits')}
                </Link>
                <Link
                  id="mobile-precios"
                  to="/precios"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <DollarSign className="w-5 h-5 text-indigo-400" />
                  {t('nav.pricing')}
                </Link>
              </>
            )}
            <Link
              id="mobile-artistas"
              to="/artistas"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <User className="w-5 h-5 text-fuchsia-400" />
              {t('nav.artists')}
            </Link>
            <Link
              id="mobile-tienda"
              to="/tienda"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              {t('nav.shop')}
            </Link>
            <Link
              to="/hub"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Compass className="w-5 h-5 text-emerald-400" />
              {t('nav.explore_map')}
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Info className="w-5 h-5 text-sky-400" />
              {t('nav.about')}
            </Link>
          </div>

          {/* Mobile Language Selector */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-violet-400" /> Idioma
              </span>
              <span className="text-xs text-violet-400 font-bold uppercase">
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
                        ? 'bg-violet-600/30 text-white border border-violet-500/50 font-bold'
                        : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{opt.flag}</span>
                      <span>{opt.name}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Country & Currency Selector */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-violet-400" /> País & Divisa
              </span>
              <span className="text-xs text-violet-400 font-bold">
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
                        ? 'bg-violet-600/30 text-white border border-violet-500/50 font-bold'
                        : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 shrink-0">
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
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full text-sm font-semibold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30"
                >
                  <User className="w-4 h-4" />
                  {isArtist ? t('nav.artist_panel') : t('nav.my_panel')}
                </Link>
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
                    className="w-full py-2.5 px-4 rounded-full text-sm font-medium text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    {t('nav.login')}
                  </button>
                </Link>
                <Link to="/register" onClick={closeMenu} className="w-full">
                  <button
                    className="w-full py-2.5 px-4 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/20 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    {t('nav.register')}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
