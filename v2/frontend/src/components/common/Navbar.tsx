import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="menu flex justify-between items-center bg-white dark:bg-gray-900 font-sans text-xl py-2 px-4 md:px-8 shadow-md transition-colors z-50">
      <div className="start flex items-center">
        <Link to="/" id="logo" className="flex items-center gap-3 no-underline">
          <img
            src="/assets/Tattoo Machine Rotary.png"
            alt="TooTienda Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 id="title" className="text-xl md:text-2xl font-bold italic text-black dark:text-white">
            TooTienda
          </h1>
        </Link>
      </div>

      <div className="center hidden md:flex items-center gap-6">
        <a
          id="presentacion"
          href="/#beneficios"
          className="text-black dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors text-base font-medium px-3 py-1 rounded"
        >
          Beneficios
        </a>
        <a
          id="presentacion"
          href="/#precios"
          className="text-black dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors text-base font-medium px-3 py-1 rounded"
        >
          Precios
        </a>
        <a
          id="presentacion"
          href="/#sobre-nosotros"
          className="text-black dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors text-base font-medium px-3 py-1 rounded"
        >
          Sobre Nosotros
        </a>
      </div>

      <div className="end flex items-center gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link
              to="/user"
              className="text-sm font-semibold text-primary dark:text-indigo-400 hover:underline"
            >
              Feed / Artistas
            </Link>
            <Link
              to={user?.user_metadata?.tipo === 'Tatuador' ? '/tattoo' : '/profile'}
              className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:underline"
            >
              Mi Perfil
            </Link>
            <button
              onClick={() => logout()}
              id="log-out"
              className="text-sm font-semibold bg-black text-white hover:bg-white hover:text-black border-2 border-black dark:border-white py-1.5 px-4 rounded-md transition-all cursor-pointer"
            >
              Salir
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login">
              <button
                id="log-in"
                className="text-sm md:text-base font-medium text-black dark:text-white bg-white dark:bg-transparent border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black py-2 px-4 rounded-lg transition-all cursor-pointer"
              >
                Iniciar Sesión
              </button>
            </Link>
            <Link to="/register">
              <button
                id="log-out"
                className="text-sm md:text-base font-medium text-white bg-black hover:bg-white hover:text-black border-2 border-black dark:border-gray-300 py-2 px-4 rounded-lg transition-all cursor-pointer shadow"
              >
                Registrarse
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
