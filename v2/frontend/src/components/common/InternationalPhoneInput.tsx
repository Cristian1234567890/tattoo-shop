import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CountryPrefixOption {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRY_PREFIXES: CountryPrefixOption[] = [
  { code: '+507', name: 'Panamá', flag: '🇵🇦' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+52', name: 'México', flag: '🇲🇽' },
  { code: '+1', name: 'EE.UU. / Canadá', flag: '🇺🇸' },
  { code: '+34', name: 'España', flag: '🇪🇸' },
  { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+51', name: 'Perú', flag: '🇵🇪' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+55', name: 'Brasil', flag: '🇧🇷' },
];

export interface InternationalPhoneInputProps {
  prefix: string;
  phoneNumber: string;
  onChange: (prefix: string, nationalNumber: string, fullE164: string) => void;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
  prefix = '+507',
  phoneNumber = '',
  onChange,
  id = 'phone',
  name = 'phone',
  required = false,
  disabled = false,
  placeholder = '6000-0000',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize prefix to ensure leading '+'
  const normalizedPrefix = prefix.startsWith('+') ? prefix : `+${prefix}`;
  const selectedCountry = COUNTRY_PREFIXES.find((c) => c.code === normalizedPrefix) || COUNTRY_PREFIXES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPrefix = (newPrefix: string) => {
    setIsOpen(false);
    const cleanNumber = phoneNumber.trim();
    const full = cleanNumber ? `${newPrefix} ${cleanNumber}` : '';
    onChange(newPrefix, cleanNumber, full);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const sanitized = rawVal.replace(/[^\d\s\-()]/g, '');
    const cleanNumber = sanitized.trim();
    const full = cleanNumber ? `${normalizedPrefix} ${cleanNumber}` : '';
    onChange(normalizedPrefix, sanitized, full);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center rounded-xl border border-zinc-800 bg-[#121217] focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500 transition overflow-visible ${className}`}
    >
      {/* Custom Prefix Dropdown Trigger */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="flex items-center gap-1.5 px-3 py-3 bg-zinc-900/90 border-r border-zinc-800 text-sm font-semibold text-violet-300 hover:text-white transition cursor-pointer select-none rounded-l-xl disabled:cursor-not-allowed"
        >
          <span className="text-base shrink-0">{selectedCountry.flag}</span>
          <span className="font-mono text-xs">{selectedCountry.code}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-violet-400' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            role="listbox"
            tabIndex={-1}
            className="absolute top-full left-0 z-50 w-60 mt-1 bg-[#121217] border border-zinc-800/90 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 scrollbar-thin scrollbar-thumb-zinc-700"
          >
            {COUNTRY_PREFIXES.map((country) => {
              const isSelected = country.code === normalizedPrefix;
              return (
                <div
                  key={country.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectPrefix(country.code)}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-violet-600/20 text-violet-300 font-semibold'
                      : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base shrink-0">{country.flag}</span>
                    <span className="truncate">{country.name}</span>
                    <span className="font-mono text-zinc-500">({country.code})</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0 ml-2" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Phone Number Input */}
      <input
        type="tel"
        id={id}
        name={name}
        value={phoneNumber}
        onChange={handleNumberChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-transparent text-white placeholder-zinc-600 focus:outline-none text-sm"
      />
    </div>
  );
};
