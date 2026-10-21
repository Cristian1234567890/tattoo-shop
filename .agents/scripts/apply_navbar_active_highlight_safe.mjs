import fs from 'fs';
import path from 'path';

const navbarPath = path.resolve('v2/frontend/src/components/common/Navbar.tsx');
let content = fs.readFileSync(navbarPath, 'utf8');

// Replace desktop links
const oldDesktopBeneficios = `                <Link
                  id="nav-beneficios"
                  to="/beneficios"
                  className="px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                >`;
const newDesktopBeneficios = `                <Link
                  id="nav-beneficios"
                  to="/beneficios"
                  className={getNavLinkClass('/beneficios')}
                >`;

const oldDesktopPrecios = `                <Link
                  id="nav-precios"
                  to="/precios"
                  className="px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                >`;
const newDesktopPrecios = `                <Link
                  id="nav-precios"
                  to="/precios"
                  className={getNavLinkClass('/precios')}
                >`;

const oldDesktopArtistas = `            <Link
              id="nav-artistas"
              to="/artistas"
              className="px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
            >`;
const newDesktopArtistas = `            <Link
              id="nav-artistas"
              to="/artistas"
              className={getNavLinkClass('/artistas')}
            >`;

const oldDesktopTienda = `            <Link
              id="nav-tienda"
              to="/tienda"
              className="px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
            >`;
const newDesktopTienda = `            <Link
              id="nav-tienda"
              to="/tienda"
              className={getNavLinkClass('/tienda')}
            >`;

const oldDesktopHub = `            <Link
              to="/hub"
              className="px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
            >`;
const newDesktopHub = `            <Link
              to="/hub"
              className={getNavLinkClass('/hub')}
            >`;

// Replace mobile links
const oldMobileBeneficios = `                <Link
                  id="mobile-beneficios"
                  to="/beneficios"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                >`;
const newMobileBeneficios = `                <Link
                  id="mobile-beneficios"
                  to="/beneficios"
                  onClick={closeMenu}
                  className={getMobileNavLinkClass('/beneficios')}
                >`;

const oldMobilePrecios = `                <Link
                  id="mobile-precios"
                  to="/precios"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                >`;
const newMobilePrecios = `                <Link
                  id="mobile-precios"
                  to="/precios"
                  onClick={closeMenu}
                  className={getMobileNavLinkClass('/precios')}
                >`;

const oldMobileArtistas = `            <Link
              id="mobile-artistas"
              to="/artistas"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >`;
const newMobileArtistas = `            <Link
              id="mobile-artistas"
              to="/artistas"
              onClick={closeMenu}
              className={getMobileNavLinkClass('/artistas')}
            >`;

const oldMobileTienda = `            <Link
              id="mobile-tienda"
              to="/tienda"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >`;
const newMobileTienda = `            <Link
              id="mobile-tienda"
              to="/tienda"
              onClick={closeMenu}
              className={getMobileNavLinkClass('/tienda')}
            >`;

const oldMobileHub = `            <Link
              to="/hub"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >`;
const newMobileHub = `            <Link
              to="/hub"
              onClick={closeMenu}
              className={getMobileNavLinkClass('/hub')}
            >`;

const oldMobileAbout = `            <Link
              to="/about"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >`;
const newMobileAbout = `            <Link
              to="/about"
              onClick={closeMenu}
              className={getMobileNavLinkClass('/about')}
            >`;

// Normalize CRLF to LF for matching, then execute
const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

const replacements = [
  [oldDesktopBeneficios, newDesktopBeneficios],
  [oldDesktopPrecios, newDesktopPrecios],
  [oldDesktopArtistas, newDesktopArtistas],
  [oldDesktopTienda, newDesktopTienda],
  [oldDesktopHub, newDesktopHub],
  [oldMobileBeneficios, newMobileBeneficios],
  [oldMobilePrecios, newMobilePrecios],
  [oldMobileArtistas, newMobileArtistas],
  [oldMobileTienda, newMobileTienda],
  [oldMobileHub, newMobileHub],
  [oldMobileAbout, newMobileAbout],
];

let replacedCount = 0;
for (const [oldStr, newStr] of replacements) {
  const normOld = oldStr.replace(/\r\n/g, '\n');
  const normNew = newStr.replace(/\r\n/g, '\n');
  if (norm.includes(normOld)) {
    norm = norm.replace(normOld, normNew);
    replacedCount++;
  } else {
    console.warn('Could not find target block:', normOld.slice(0, 40));
  }
}

if (isCRLF) {
  norm = norm.replace(/\n/g, '\r\n');
}

fs.writeFileSync(navbarPath, norm, 'utf8');
console.log(`Successfully replaced ${replacedCount} of ${replacements.length} link blocks in Navbar.tsx`);
