/**
 * Tier 1: Feature Coverage - Milestone 4: Branding, Header, Mobile Nav, Framer Motion, AboutPage, Footer, and i18n
 * Covers Features 1, 2, 3, 4, 5, 6, 7 from PROJECT.md Feature Inventory:
 *   - Feature 1: Pure SVG Logo (Logo.tsx, logo.svg, favicon, "Tattoo Hub" title)
 *   - Feature 2 & 3: Transparent Header, floating action buttons, and responsive mobile drawer menu (Navbar.tsx)
 *   - Feature 4: Framer Motion scroll animations on Hero, Benefits (#beneficios), and Pricing (#precios) in HomePage.tsx
 *   - Feature 5: Independent /about route (AboutPage.tsx) and exemptPaths in OnboardingGate
 *   - Feature 6: Depurated dark footer (Footer.tsx) with links to /about, /hub, /legal/*, and mission statement
 *   - Feature 7: Full internationalization (zero occurrences of "Panamá", "PTY", or "TooTienda" in frontend user copy)
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { DomValidator } from '../framework/dom_validator.ts';
import fs from 'node:fs';
import path from 'node:path';

export function registerM4BrandingUiI18nTests(validator: DomValidator) {
  setTier('Tier 1 - Feature Coverage');
  const frontendDir = validator.getFrontendRoot();

  // =========================================================================
  // Feature 1: Pure SVG Logo & Favicon
  // =========================================================================
  describe('Feature 1: Pure SVG Logo (Logo.tsx, logo.svg, favicon, title)', () => {
    const logoTsxPath = path.join(frontendDir, 'src/components/common/Logo.tsx');
    const logoSvgPublicPath = path.join(frontendDir, 'public/assets/logo.svg');
    const indexHtmlPath = path.join(frontendDir, 'index.html');

    it('TC-M4-LOGO-01: Logo.tsx exists and defines Logo component with configurable props', () => {
      expect(fs.existsSync(logoTsxPath)).toBe(true);
      const content = fs.readFileSync(logoTsxPath, 'utf-8');
      expect(content).toContain('export interface LogoProps');
      expect(content).toContain('showText?: boolean');
      expect(content).toContain("size?: 'sm' | 'md' | 'lg'");
      expect(content).toContain('export const Logo: React.FC<LogoProps>');
    });

    it('TC-M4-LOGO-02: Logo.tsx renders pure vector SVG element with viewBox, xmlns, and accessibility label', () => {
      const content = fs.readFileSync(logoTsxPath, 'utf-8');
      expect(content).toContain('<svg');
      expect(content).toContain('viewBox="0 0 120 120"');
      expect(content).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(content).toContain('aria-label="Tattoo Hub Logo Emblem"');
    });

    it('TC-M4-LOGO-03: Logo.tsx SVG contains tattoo machine components (plate, rotary motor, braces, grip, needle tip)', () => {
      const content = fs.readFileSync(logoTsxPath, 'utf-8');
      expect(content).toContain('id="logoPrimaryGrad"');
      expect(content).toContain('id="logoAccentGrad"');
      expect(content).toContain('id="logoGlow"');
      // Outer plate
      expect(content).toContain('fill="url(#logoDarkPlate)"');
      // Rotary motor
      expect(content).toContain('cx="60" cy="38"');
      // Machine grip
      expect(content).toContain('rx="3"');
      // Needle tip
      expect(content).toContain('d="M57 84 L63 84 L60 102 Z"');
    });

    it('TC-M4-LOGO-04: Logo.tsx renders brand typography "Tattoo" and gradient "Hub" conditioned on showText', () => {
      const content = fs.readFileSync(logoTsxPath, 'utf-8');
      expect(content).toContain('{showText && (');
      expect(content).toContain('Tattoo');
      expect(content).toContain('Hub');
      expect(content).toContain('bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-500');
    });

    it('TC-M4-LOGO-05: Standalone favicon logo.svg exists in public assets directory and is valid SVG', () => {
      expect(fs.existsSync(logoSvgPublicPath)).toBe(true);
      const svgContent = fs.readFileSync(logoSvgPublicPath, 'utf-8');
      expect(svgContent.startsWith('<svg')).toBe(true);
      expect(svgContent).toContain('viewBox="0 0 120 120"');
      expect(svgContent).toContain('</svg>');
    });

    it('TC-M4-LOGO-06: index.html configures favicon link to logo.svg and sets page title to "Tattoo Hub"', () => {
      expect(fs.existsSync(indexHtmlPath)).toBe(true);
      const htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
      expect(htmlContent).toContain('<link rel="icon" type="image/svg+xml" href="/assets/logo.svg" />');
      expect(htmlContent).toContain('<title>Tattoo Hub</title>');
    });
  });

  // =========================================================================
  // Feature 2 & 3: Transparent Header, Floating Action Buttons & Mobile Nav
  // =========================================================================
  describe('Features 2 & 3: Transparent Header, Floating Actions & Mobile Drawer (Navbar.tsx)', () => {
    const navbarPath = path.join(frontendDir, 'src/components/common/Navbar.tsx');

    it('TC-M4-NAV-01: Navbar.tsx implements transparent glassmorphic header classes', () => {
      expect(fs.existsSync(navbarPath)).toBe(true);
      const content = fs.readFileSync(navbarPath, 'utf-8');
      expect(content).toContain('bg-gray-950/40');
      expect(content).toContain('backdrop-blur-xl');
      expect(content).toContain('border-b border-white/10');
      expect(content).toContain('sticky top-0 z-50');
    });

    it('TC-M4-NAV-02: Navbar.tsx embeds Logo component linking to root "/" with id="logo"', () => {
      const content = fs.readFileSync(navbarPath, 'utf-8');
      expect(content).toContain('id="logo"');
      expect(content).toContain('<Logo size="md" />');
    });

    it('TC-M4-NAV-03: Desktop navigation contains direct links to #beneficios, #precios, /hub, and /about', () => {
      const content = fs.readFileSync(navbarPath, 'utf-8');
      expect(content).toContain('href="/#beneficios"');
      expect(content).toContain('href="/#precios"');
      expect(content).toContain('to="/hub"');
      expect(content).toContain('to="/about"');
      expect(content).toContain('Beneficios');
      expect(content).toContain('Precios');
      expect(content).toContain('Explorar Mapa');
      expect(content).toContain('Sobre Nosotros');
    });

    it('TC-M4-NAV-04: Desktop auth actions provide Iniciar Sesión (#log-in), Registrarse (#log-out), and role dashboard', () => {
      const content = fs.readFileSync(navbarPath, 'utf-8');
      expect(content).toContain('id="log-in"');
      expect(content).toContain('Iniciar Sesión');
      expect(content).toContain('Registrarse');
      expect(content).toContain("isArtist ? '/artist-dashboard' : '/client-dashboard'");
      expect(content).toContain("isArtist ? 'Panel Artista' : 'Mi Panel'");
    });

    it('TC-M4-NAV-05: Mobile navigation provides hamburger toggle button with aria-label="Abrir menú"', () => {
      const content = fs.readFileSync(navbarPath, 'utf-8');
      expect(content).toContain('aria-label="Abrir menú"');
      expect(content).toContain('setMobileMenuOpen(!mobileMenuOpen)');
      expect(content).toContain('mobileMenuOpen ? <X');
    });

    it('TC-M4-NAV-06: Mobile drawer menu renders distinct icons and accessible navigation links', () => {
      const content = fs.readFileSync(navbarPath, 'utf-8');
      expect(content).toContain('mobileMenuOpen && (');
      expect(content).toContain('Sparkles');
      expect(content).toContain('DollarSign');
      expect(content).toContain('Compass');
      expect(content).toContain('Info');
      expect(content).toContain('href="/#beneficios"');
      expect(content).toContain('href="/#precios"');
      expect(content).toContain('to="/hub"');
      expect(content).toContain('to="/about"');
    });
  });

  // =========================================================================
  // Feature 4: Framer Motion Scroll Animations
  // =========================================================================
  describe('Feature 4: Framer Motion Scroll Animations (HomePage.tsx)', () => {
    const homePagePath = path.join(frontendDir, 'src/pages/HomePage.tsx');

    it('TC-M4-ANIM-01: HomePage.tsx imports motion and Variants from framer-motion', () => {
      expect(fs.existsSync(homePagePath)).toBe(true);
      const content = fs.readFileSync(homePagePath, 'utf-8');
      expect(content).toContain("import { motion, Variants } from 'framer-motion';");
    });

    it('TC-M4-ANIM-02: Defines motion stagger container and item variants for coordinated animations', () => {
      const content = fs.readFileSync(homePagePath, 'utf-8');
      expect(content).toContain('const containerVariants: Variants = {');
      expect(content).toContain('staggerChildren: 0.15');
      expect(content).toContain('delayChildren: 0.1');
      expect(content).toContain('const itemVariants: Variants = {');
    });

    it('TC-M4-ANIM-03: Hero section animates entrance of badge, h1, paragraph, and CTA buttons', () => {
      const content = fs.readFileSync(homePagePath, 'utf-8');
      expect(content).toContain('variants={containerVariants}');
      expect(content).toContain('variants={itemVariants}');
      expect(content).toContain('Encuentra al Artista');
      expect(content).toContain('Explorar el Mapa');
      expect(content).toContain('Registrarme Gratis');
    });

    it('TC-M4-ANIM-04: Benefits section (#beneficios) triggers scroll reveals via whileInView with once: true', () => {
      const content = fs.readFileSync(homePagePath, 'utf-8');
      expect(content).toContain('id="beneficios"');
      expect(content).toContain('whileInView={{ opacity: 1, y: 0 }}');
      expect(content).toContain('viewport={{ once: true }}');
      expect(content).toContain('Estudios Verificados');
      expect(content).toContain('Chat Directo & Cotización');
      expect(content).toContain('Portafolios Interactivos');
    });

    it('TC-M4-ANIM-05: Pricing section (#precios) implements scroll reveals, monthly/annual toggle and cards', () => {
      const content = fs.readFileSync(homePagePath, 'utf-8');
      expect(content).toContain('id="precios"');
      expect(content).toContain('billingCycle');
      expect(content).toContain('setBillingCycle');
      expect(content).toContain('Mensual');
      expect(content).toContain('Anual');
      expect(content).toContain('Coleccionista VIP');
      expect(content).toContain('Estudio Profesional');
      expect(content).toContain('Para Tatuadores');
      expect(content).toContain('$4.99');
    });
  });

  // =========================================================================
  // Feature 5: Independent /about Route & exemptPaths
  // =========================================================================
  describe('Feature 5: Independent /about Route & OnboardingGate Exemption (AboutPage.tsx, App.tsx)', () => {
    const aboutPagePath = path.join(frontendDir, 'src/pages/AboutPage.tsx');
    const appPath = path.join(frontendDir, 'src/App.tsx');

    it('TC-M4-ABOUT-01: AboutPage.tsx component exists in src/pages/', () => {
      expect(fs.existsSync(aboutPagePath)).toBe(true);
    });

    it('TC-M4-ABOUT-02: App.tsx router declares /about route mapped to AboutPage element', () => {
      const content = fs.readFileSync(appPath, 'utf-8');
      expect(content).toContain('import { AboutPage } from \'./pages/AboutPage\';');
      expect(content).toContain('<Route path="/about" element={<AboutPage />} />');
    });

    it('TC-M4-ABOUT-03: OnboardingGate in App.tsx explicitly exempts /about from redirection', () => {
      const content = fs.readFileSync(appPath, 'utf-8');
      expect(content).toContain('const exemptPaths =');
      expect(content).toContain("'/about'");
      expect(content).toContain('exemptPaths.some((p) => location.pathname.startsWith(p))');
    });

    it('TC-M4-ABOUT-04: AboutPage.tsx renders Navbar, 4 core value pillars and Footer', () => {
      const content = fs.readFileSync(aboutPagePath, 'utf-8');
      expect(content).toContain('<Navbar />');
      expect(content).toContain('<Footer />');
      expect(content).toContain('Libertad Artística');
      expect(content).toContain('Calidad & Higiene Verificada');
      expect(content).toContain('Comunidad Global Sin Fronteras');
      expect(content).toContain('Trato Directo & Transparencia');
    });

    it('TC-M4-ABOUT-05: AboutPage.tsx displays global platform statistics', () => {
      const content = fs.readFileSync(aboutPagePath, 'utf-8');
      expect(content).toContain('+5,000');
      expect(content).toContain('120+');
      expect(content).toContain('+50,000');
      expect(content).toContain('99.4%');
    });
  });

  // =========================================================================
  // Feature 6: Depurated Dark Footer
  // =========================================================================
  describe('Feature 6: Depurated Dark Footer (Footer.tsx)', () => {
    const footerPath = path.join(frontendDir, 'src/components/common/Footer.tsx');

    it('TC-M4-FOOTER-01: Footer.tsx exists and applies dark container styling', () => {
      expect(fs.existsSync(footerPath)).toBe(true);
      const content = fs.readFileSync(footerPath, 'utf-8');
      expect(content).toContain('bg-gray-950');
      expect(content).toContain('border-t border-white/10');
      expect(content).toContain('text-gray-400');
    });

    it('TC-M4-FOOTER-02: Footer organizes navigation into 4 semantic columns', () => {
      const content = fs.readFileSync(footerPath, 'utf-8');
      expect(content).toContain('grid-cols-1 md:grid-cols-4');
      expect(content).toContain('Explorar');
      expect(content).toContain('Compañía');
      expect(content).toContain('Legal');
    });

    it('TC-M4-FOOTER-03: Footer renders links to /hub, /#beneficios, /#precios, /about, /legal/terms, /legal/privacy', () => {
      const content = fs.readFileSync(footerPath, 'utf-8');
      expect(content).toContain('to="/hub"');
      expect(content).toContain('href="/#beneficios"');
      expect(content).toContain('href="/#precios"');
      expect(content).toContain('to="/about"');
      expect(content).toContain('to="/legal/terms"');
      expect(content).toContain('to="/legal/privacy"');
    });

    it('TC-M4-FOOTER-04: Footer articulates official brand mission statement and international attribution', () => {
      const content = fs.readFileSync(footerPath, 'utf-8');
      expect(content).toContain('La plataforma global para conectar estudios, artistas del tatuaje y coleccionistas');
      expect(content).toContain('Plataforma internacional de arte corporal');
    });

    it('TC-M4-FOOTER-05: Preserves critical element IDs: #footer, #github, #theme-switch-container, #copyright', () => {
      const content = fs.readFileSync(footerPath, 'utf-8');
      expect(content).toContain('id="footer"');
      expect(content).toContain('id="github"');
      expect(content).toContain('id="theme-switch-container"');
      expect(content).toContain('id="copyright"');
    });
  });

  // =========================================================================
  // Feature 7: Full Internationalization & Text Generalization
  // =========================================================================
  describe('Feature 7: Full Internationalization (zero Panamá/PTY/TooTienda in user copy)', () => {
    it('TC-M4-I18N-01: Zero occurrences of deprecated brand name "TooTienda" in frontend source files', () => {
      const srcDir = path.join(frontendDir, 'src');
      let foundTooTienda = false;
      const walk = (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
          } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            if (content.toLowerCase().includes('tootienda')) {
              foundTooTienda = true;
            }
          }
        }
      };
      walk(srcDir);
      expect(foundTooTienda).toBe(false);
    });

    it('TC-M4-I18N-02: Zero occurrences of standalone airport/token "PTY" in frontend user copy', () => {
      const srcDir = path.join(frontendDir, 'src');
      let foundPty = false;
      const walk = (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
          } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            if (/\bPTY\b/.test(content)) {
              foundPty = true;
            }
          }
        }
      };
      walk(srcDir);
      expect(foundPty).toBe(false);
    });

    it('TC-M4-I18N-03: Landing page HomePage.tsx contains zero occurrences of "Panamá" or "Panama" in public copy', () => {
      const homePagePath = path.join(frontendDir, 'src/pages/HomePage.tsx');
      const content = fs.readFileSync(homePagePath, 'utf-8');
      expect(content.toLowerCase()).not.toContain('panamá');
      expect(content.toLowerCase()).not.toContain('panama');
    });

    it('TC-M4-I18N-04: AboutPage.tsx and Footer.tsx use global terminology and zero localized restrictions', () => {
      const aboutContent = fs.readFileSync(path.join(frontendDir, 'src/pages/AboutPage.tsx'), 'utf-8');
      const footerContent = fs.readFileSync(path.join(frontendDir, 'src/components/common/Footer.tsx'), 'utf-8');
      expect(aboutContent.toLowerCase()).not.toContain('panamá');
      expect(aboutContent.toLowerCase()).not.toContain('panama');
      expect(footerContent).toContain('Plataforma internacional de arte corporal');
    });

    it('TC-M4-I18N-05: Pricing and CTA copy uses standard currency symbol ($) and international terms', () => {
      const homeContent = fs.readFileSync(path.join(frontendDir, 'src/pages/HomePage.tsx'), 'utf-8');
      expect(homeContent).toContain('$4.99');
      expect(homeContent).toContain('$49.90');
      expect(homeContent).not.toContain('B/.'); // No Panamanian Balboas in public marketing copy
      expect(homeContent).not.toContain('Balboas');
    });
  });
}
