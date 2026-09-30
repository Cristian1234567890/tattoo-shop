import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeSwitch } from '../common/ThemeSwitch';

export const OffCanvasMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const metadata = user?.user_metadata;
  const displayName = metadata?.nombre
    ? `${metadata.nombre} ${metadata.apellido || ''}`
    : user?.email || 'Prueba Usuario';
  const profilePic = metadata?.profile || '/assets/Tattoo Machine Rotary.png';
  const isArtist = metadata?.tipo === 'Tatuador' || metadata?.role === 'Tatuador';
  const profileUrl = isArtist ? '/tattoo' : '/profile';
  const dashboardUrl = isArtist ? '/artist-dashboard' : '/client-dashboard';
  const dashboardLabel = isArtist ? '🎨 Panel de Artista' : '📊 Mi Panel (Cliente)';

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    navigate('/');
  };

  return (
    <div className="right">
      <button
        className="menu-toggle fixed top-5 right-5 z-50 bg-black/80 dark:bg-white/90 text-white dark:text-black w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xl hover:scale-105 transition cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Abrir menú de usuario"
      >
        ☰
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`menu fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Menú</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-black dark:hover:text-white text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="profile flex flex-col items-center gap-3 py-4">
            <img
              src={profilePic}
              alt="Perfil"
              id="menu-profile-pic"
              className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-primary"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/Tattoo Machine Rotary.png';
              }}
            />
            <div className="username text-center">
              <p id="name_tag" className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {displayName}
              </p>
              <span className="text-xs text-primary font-semibold uppercase px-2 py-0.5 bg-primary/10 rounded-full">
                {metadata?.tipo || 'Cliente'}
              </span>
            </div>
          </div>

          <hr className="my-4 border-gray-300 dark:border-gray-700" />

          <ul className="space-y-3">
            <li>
              <Link
                to={dashboardUrl}
                className="list flex items-center gap-3 text-base font-medium text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsOpen(false)}
              >
                {dashboardLabel}
              </Link>
            </li>
            <li>
              <Link
                to={profileUrl}
                className="list flex items-center gap-3 text-base font-medium text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                id="profile-link"
                onClick={() => setIsOpen(false)}
              >
                👤 Perfil
              </Link>
            </li>
            <li>
              <Link
                to="/hub"
                className="flex items-center gap-3 text-base font-medium text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsOpen(false)}
              >
                🗺️ Mapa de Artistas
              </Link>
            </li>
            <li>
              <Link
                to="/user"
                className="flex items-center gap-3 text-base font-medium text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsOpen(false)}
              >
                🎨 Explorar Tatuadores
              </Link>
            </li>
            <li>
              <Link
                to="/subscription/creditcard"
                className="flex items-center gap-3 text-base font-medium text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsOpen(false)}
              >
                💳 Suscripción
              </Link>
            </li>
          </ul>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tema
            </span>
            <ThemeSwitch />
          </div>

          <div id="logOut">
            <button
              onClick={handleLogout}
              className="logOut w-full text-center py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow transition cursor-pointer"
              id="logout"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
