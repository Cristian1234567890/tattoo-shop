import React from 'react';
import { Link } from 'react-router-dom';

interface StyleFilterProps {
  selectedStyles: string[];
  onToggleStyle: (style: string) => void;
}

export const StyleFilter: React.FC<StyleFilterProps> = ({ selectedStyles, onToggleStyle }) => {
  const styles = [
    { id: 'realista', label: 'Realista' },
    { id: 'tradicional', label: 'Tradicional' },
    { id: 'neotradicional', label: 'Neotradicional' },
    { id: 'blackwork', label: 'Blackwork' },
    { id: 'botwork', label: 'Dotwork', value: 'dotwork' },
    { id: 'japones', label: 'Japonés' },
    { id: 'tribal', label: 'Tribal' },
    { id: 'acuarela', label: 'Acuarela' },
  ];

  return (
    <div className="column1 w-full md:w-64 bg-white/90 dark:bg-gray-800/95 p-6 rounded-xl shadow-lg backdrop-blur-sm">
      <div className="start flex items-center gap-3 mb-4">
        <Link to="/" id="logo" className="flex items-center gap-2 no-underline">
          <img
            src="/assets/Tattoo Machine Rotary.png"
            alt="Logo"
            className="w-8 h-8 object-contain"
          />
          <h1 id="title" className="text-xl font-bold italic text-black dark:text-white">
            TooTienda
          </h1>
        </Link>
      </div>

      <hr className="my-3 border-gray-300 dark:border-gray-600" />
      <p className="font-bold text-gray-700 dark:text-gray-200 uppercase text-sm tracking-wider">
        Filtros
      </p>
      <hr className="my-3 border-gray-300 dark:border-gray-600" />

      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 text-base">
        Tipo de tatuaje
      </h4>

      <div className="space-y-2">
        {styles.map((item) => {
          const val = item.value || item.id;
          const isChecked = selectedStyles.includes(val) || selectedStyles.includes(item.id);
          return (
            <div key={item.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={item.id}
                checked={isChecked}
                onChange={() => onToggleStyle(val)}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
              />
              <label
                htmlFor={item.id}
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
              >
                {item.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
