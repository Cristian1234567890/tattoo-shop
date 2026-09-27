import React from 'react';
import { ThemeSwitch } from './ThemeSwitch';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto">
      <div
        id="footer"
        className="flex flex-col md:flex-row items-center justify-between text-center font-sans text-xs bg-[rgba(3,3,44,0.96)] text-white py-6 px-8 gap-4"
      >
        <div id="github" className="flex items-center">
          <a
            href="https://github.com/Cristian1234567890/tattoo-shop-react"
            target="_blank"
            rel="noopener noreferrer"
            title="Repositorio de GitHub"
          >
            <img
              src="/assets/GitHub White.png"
              alt="GitHub"
              className="w-8 h-8 hover:opacity-80 transition-opacity"
            />
          </a>
        </div>

        <div id="copyright" className="text-center space-y-1">
          <p className="font-semibold">Copyright © 2023</p>
          <p className="font-bold text-gray-300 pt-1">Founders:</p>
          <p className="text-gray-300">Giovanni Buglione (Frontend)</p>
          <p className="text-gray-300">Cristian Castillo (Backend)</p>
          <p className="text-gray-300">Luis Lopez (Backend)</p>
        </div>

        <div id="theme-switch-container">
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  );
};
