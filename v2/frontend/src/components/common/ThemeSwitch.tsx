import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeSwitch: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      id="theme-switch-btn"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer shadow-sm border ${
        isDark
          ? 'bg-zinc-900/90 hover:bg-zinc-800 text-amber-300 border-amber-500/30 hover:border-amber-400/50 shadow-amber-500/5'
          : 'bg-white hover:bg-zinc-50 text-amber-600 border-amber-500/40 hover:border-amber-500 shadow-md'
      }`}
      title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
      aria-label={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
      aria-pressed={isDark}
    >
      <span className="relative flex items-center justify-center w-4 h-4">
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-amber-400 transition-transform duration-300 rotate-0" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 transition-transform duration-300 rotate-180" />
        )}
      </span>
      <span className="hidden 2xl:inline font-mono uppercase text-[10px] tracking-wider">
        {isDark ? 'Oscuro' : 'Claro'}
      </span>
    </button>
  );
};
