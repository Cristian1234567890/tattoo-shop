import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';

export const FooterContext = React.createContext<{ isMounted: boolean }>({ isMounted: false });

const EXEMPT_FOOTER_ROUTES = [
  '/hub',
  '/login',
  '/register',
  '/user',
  '/client-dashboard',
  '/artist-dashboard',
  '/chat',
  '/tattoo',
  '/artist-profile',
  '/artist',
];

export interface FooterProps {
  forceRender?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ forceRender = false }) => {
  const context = React.useContext(FooterContext);
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // If a top-level layout is managing the footer, skip nested duplicate footer calls
  if (context.isMounted && !forceRender) {
    return null;
  }

  // R4 Layout Exemption Check
  const isExempt = EXEMPT_FOOTER_ROUTES.some(
    (path) => location.pathname === path || location.pathname.startsWith(path + '/')
  );
  if (isExempt) return null;

  return (
    <footer className="mt-auto bg-[#07090e] border-t border-white/5 text-zinc-400 font-sans selection:bg-violet-500/30">
      <div id="footer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Main 4-column Grid matching Stitch Atelier reference */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12 mb-14">
          {/* Column 1: Brand & Independent Directory */}
          <div className="space-y-4">
            <Link to="/" className="inline-block no-underline">
              <Logo size="md" />
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed font-normal">
              Tattoo Hub es un espacio digital concebido para el arte del tatuaje independiente: facilitando el encuentro entre entusiastas, coleccionistas y artistas dedicados a la aguja y la tinta.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
              <span>DIRECTORIO EN EXPANSIÓN CONSTANTE</span>
            </div>
          </div>

          {/* Column 2: Sobre Nosotros & Manifiesto */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base tracking-tight">
              Sobre Nosotros
            </h4>
            <p className="text-sm text-zinc-400 leading-relaxed font-normal">
              Nacimos con la premisa de devolver el foco a los estudios locales y al valor artístico de cada pieza, creando una alternativa clara y profesional a las redes sociales saturadas de ruido publicitario.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors pt-1 group"
            >
              <span>Manifiesto del Taller</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* Column 3: Explorar */}
          <div>
            <h4 className="text-white font-bold text-base tracking-tight mb-4">
              Explorar
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/hub" className="text-zinc-400 hover:text-white transition-colors">
                  Explorar Mapa
                </Link>
              </li>
              <li>
                <Link to="/artistas" className="text-zinc-400 hover:text-white transition-colors">
                  Portafolios & Estilos
                </Link>
              </li>
              <li>
                <Link to="/beneficios" className="text-zinc-400 hover:text-white transition-colors">
                  Herramientas de Estudio
                </Link>
              </li>
              <li>
                <Link to="/precios" className="text-zinc-400 hover:text-white transition-colors">
                  Planes y Membresías
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Taller */}
          <div>
            <h4 className="text-white font-bold text-base tracking-tight mb-4">
              Legal & Taller
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/legal/terms" className="text-zinc-400 hover:text-white transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="text-zinc-400 hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/about#cuidados" className="text-zinc-400 hover:text-white transition-colors">
                  Guía de Higiene y Cuidados
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Dark Atelier Edition Pill */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p className="font-medium text-zinc-400 text-center sm:text-left">
            © {currentYear} Tattoo Hub. Todos los derechos reservados.
          </p>

          <div
            id="dark-atelier-edition-badge"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/70 text-[11px] font-bold text-zinc-300 tracking-wider shadow-sm"
          >
            <span className="w-2 h-2 rounded-full border border-violet-400 inline-block" />
            <span>DARK ATELIER EDITION</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
