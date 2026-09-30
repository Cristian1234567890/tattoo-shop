import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeSwitch } from './ThemeSwitch';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-gray-950 border-t border-white/10 text-gray-400 font-sans">
      <div id="footer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="inline-block">
              <Logo size="md" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              La plataforma global para conectar estudios, artistas del tatuaje y coleccionistas en un ecosistema transparente, seguro y profesional.
            </p>
            <div id="github" className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/Cristian1234567890/tattoo-shop-react"
                target="_blank"
                rel="noopener noreferrer"
                title="Repositorio de GitHub"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all"
              >
                <img
                  src="/assets/GitHub White.png"
                  alt="GitHub"
                  className="w-5 h-5 hover:opacity-80 transition-opacity"
                />
              </a>
            </div>
          </div>

          {/* Column 2: Explorar */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Explorar
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/hub" className="hover:text-white transition-colors">
                  Explorar Mapa
                </Link>
              </li>
              <li>
                <a href="/#beneficios" className="hover:text-white transition-colors">
                  Beneficios
                </a>
              </li>
              <li>
                <a href="/#precios" className="hover:text-white transition-colors">
                  Precios & Membresías
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Empresa */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Compañía
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link to="/register?role=Tatuador" className="hover:text-white transition-colors">
                  Para Tatuadores
                </Link>
              </li>
              <li>
                <Link to="/register?role=Cliente" className="hover:text-white transition-colors">
                  Para Clientes
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Ajustes */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm mb-6">
              <li>
                <Link to="/legal/terms" className="hover:text-white transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
            <div id="theme-switch-container" className="flex items-center gap-2 pt-2">
              <ThemeSwitch />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <div id="copyright" className="text-center md:text-left space-y-1">
            <p className="font-medium text-gray-400">
              Copyright © {currentYear} Tattoo Hub. Todos los derechos reservados.
            </p>
            <p className="text-gray-500">
              Desarrollado por Giovanni Buglione, Cristian Castillo y Luis Lopez.
            </p>
          </div>
          <div className="text-gray-500">
            Plataforma internacional de arte corporal
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
