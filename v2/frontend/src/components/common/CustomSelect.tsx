import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  flag?: string;
  code?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecciona una opción',
  className = '',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="block text-sm font-medium text-white mb-2">{label}</label>}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between px-4 py-3 bg-[#121217] border rounded-xl text-left transition-all duration-200 outline-none cursor-pointer ${
          isOpen
            ? 'border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.25)] ring-1 ring-violet-500'
            : 'border-zinc-800 hover:border-zinc-700 focus:border-violet-500'
        }`}
      >
        <span className="flex items-center gap-3 text-sm truncate">
          {selectedOption ? (
            <>
              {selectedOption.flag && <span className="text-base shrink-0">{selectedOption.flag}</span>}
              <span className="text-white font-medium">{selectedOption.label}</span>
              {selectedOption.code && <span className="text-xs text-zinc-500 uppercase">({selectedOption.code})</span>}
            </>
          ) : (
            <span className="text-zinc-500">{placeholder}</span>
          )}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-violet-400' : ''
          }`}
        />
      </button>

      {/* Custom Dropdown List */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 w-full mt-2 bg-[#121217] border border-zinc-800/90 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 scrollbar-thin scrollbar-thumb-zinc-700"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-3 text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-violet-600/15 text-violet-300 font-semibold'
                    : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  {option.flag && <span className="text-base shrink-0">{option.flag}</span>}
                  <span className="truncate">{option.label}</span>
                  {option.code && <span className="text-[11px] text-zinc-500 uppercase">{option.code}</span>}
                </div>

                {isSelected && <Check className="w-4 h-4 text-violet-400 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
