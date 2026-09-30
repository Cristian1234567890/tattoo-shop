import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import { Menu, X, Sparkles, DollarSign, Compass, Info, User, LogOut, LogIn, UserPlus } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

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
                <a
                  id="presentacion"
                  href="/#beneficios"
                  className="px-3.5 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Beneficios
                </a>
                <a
                  id="presentacion"
                  href="/#precios"
                  className="px-3.5 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Precios
                </a>
              </>
            )}
            <Link
              to="/hub"
              className="px-3.5 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Explorar Mapa
            </Link>
            <Link
              to="/about"
              className="px-3.5 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Sobre Nosotros
            </Link>
          </div>

          {/* Desktop Auth / User Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={isArtist ? '/artist-dashboard' : '/client-dashboard'}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all"
                >
                  {isArtist ? 'Panel Artista' : 'Mi Panel'}
                </Link>
                <button
                  onClick={() => logout()}
                  id="log-out"
                  className="px-4 py-1.5 rounded-full text-sm font-semibold bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-300 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <button
                    id="log-in"
                    className="px-5 py-2 rounded-full text-sm font-medium text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-sm hover:shadow-lg"
                  >
                    Iniciar Sesión
                  </button>
                </Link>
                <Link to="/register">
                  <button
                    id="log-out"
                    className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 border border-violet-400/30 transition-all cursor-pointer"
                  >
                    Registrarse
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
        <div className="md:hidden bg-gray-950/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {/* Only show Beneficios & Precios if NOT authenticated with VIP */}
            {(!isAuthenticated || !hasVip) && (
              <>
                <a
                  id="presentacion"
                  href="/#beneficios"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  Beneficios
                </a>
                <a
                  id="presentacion"
                  href="/#precios"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <DollarSign className="w-5 h-5 text-indigo-400" />
                  Precios
                </a>
              </>
            )}
            <Link
              to="/hub"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Compass className="w-5 h-5 text-emerald-400" />
              Explorar Mapa
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Info className="w-5 h-5 text-sky-400" />
              Sobre Nosotros
            </Link>
          </div>

          <div className="pt-3 border-t border-white/10">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={isArtist ? '/artist-dashboard' : '/client-dashboard'}
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full text-sm font-semibold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30"
                >
                  <User className="w-4 h-4" />
                  {isArtist ? 'Panel Artista' : 'Mi Panel'}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link to="/login" onClick={closeMenu} className="w-full">
                  <button
                    className="w-full py-2.5 px-4 rounded-full text-sm font-medium text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Iniciar Sesión
                  </button>
                </Link>
                <Link to="/register" onClick={closeMenu} className="w-full">
                  <button
                    className="w-full py-2.5 px-4 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/20 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Registrarse
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
