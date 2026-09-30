import React from 'react';

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
  // Normalize prefix to ensure leading '+'
  const normalizedPrefix = prefix.startsWith('+') ? prefix : `+${prefix}`;

  const handlePrefixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPrefix = e.target.value;
    const cleanNumber = phoneNumber.trim();
    const full = cleanNumber ? `${newPrefix} ${cleanNumber}` : '';
    onChange(newPrefix, cleanNumber, full);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Allow digits, spaces, hyphens, and parentheses
    const sanitized = rawVal.replace(/[^\d\s\-()]/g, '');
    const cleanNumber = sanitized.trim();
    const full = cleanNumber ? `${normalizedPrefix} ${cleanNumber}` : '';
    onChange(normalizedPrefix, sanitized, full);
  };

  return (
    <div className={`flex items-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition overflow-hidden ${className}`}>
      <div className="relative flex items-center bg-gray-50 dark:bg-gray-700/50 border-r border-gray-300 dark:border-gray-700">
        <select
          value={normalizedPrefix}
          onChange={handlePrefixChange}
          disabled={disabled}
          aria-label="Código de país"
          className="appearance-none bg-transparent pl-3 pr-7 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
        >
          {COUNTRY_PREFIXES.map((country) => (
            <option
              key={country.code}
              value={country.code}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {country.flag} {country.code} ({country.name})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2 text-gray-400">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      <input
        type="tel"
        id={id}
        name={name}
        value={phoneNumber}
        onChange={handleNumberChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-base"
      />
    </div>
  );
};
