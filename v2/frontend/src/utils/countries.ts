export interface CountryData {
  value: string;
  label: string;
  flag: string;
  code: string;
  dialCode: string;
  placeholder: string;
}

export const COUNTRIES: CountryData[] = [
  // Iberoamérica & Principales
  { value: 'España', label: 'España', flag: '🇪🇸', code: 'ES', dialCode: '+34', placeholder: '612 345 678' },
  { value: 'Colombia', label: 'Colombia', flag: '🇨🇴', code: 'CO', dialCode: '+57', placeholder: '300 123 4567' },
  { value: 'México', label: 'México', flag: '🇲🇽', code: 'MX', dialCode: '+52', placeholder: '55 1234 5678' },
  { value: 'Estados Unidos', label: 'Estados Unidos', flag: '🇺🇸', code: 'US', dialCode: '+1', placeholder: '202 555 0123' },
  { value: 'Argentina', label: 'Argentina', flag: '🇦🇷', code: 'AR', dialCode: '+54', placeholder: '11 1234 5678' },
  { value: 'Chile', label: 'Chile', flag: '🇨🇱', code: 'CL', dialCode: '+56', placeholder: '9 1234 5678' },
  { value: 'Perú', label: 'Perú', flag: '🇵🇪', code: 'PE', dialCode: '+51', placeholder: '912 345 678' },
  { value: 'Panamá', label: 'Panamá', flag: '🇵🇦', code: 'PA', dialCode: '+507', placeholder: '6123 4567' },
  { value: 'Costa Rica', label: 'Costa Rica', flag: '🇨🇷', code: 'CR', dialCode: '+506', placeholder: '8123 4567' },
  { value: 'Ecuador', label: 'Ecuador', flag: '🇪🇨', code: 'EC', dialCode: '+593', placeholder: '99 123 4567' },
  { value: 'Uruguay', label: 'Uruguay', flag: '🇺🇾', code: 'UY', dialCode: '+598', placeholder: '91 234 567' },
  { value: 'Paraguay', label: 'Paraguay', flag: '🇵🇾', code: 'PY', dialCode: '+595', placeholder: '981 123456' },
  { value: 'Bolivia', label: 'Bolivia', flag: '🇧🇴', code: 'BO', dialCode: '+591', placeholder: '7123 4567' },
  { value: 'República Dominicana', label: 'República Dominicana', flag: '🇩🇴', code: 'DO', dialCode: '+1-809', placeholder: '809 123 4567' },
  { value: 'Guatemala', label: 'Guatemala', flag: '🇬🇹', code: 'GT', dialCode: '+502', placeholder: '5123 4567' },
  { value: 'Honduras', label: 'Honduras', flag: '🇭🇳', code: 'HN', dialCode: '+504', placeholder: '9123 4567' },
  { value: 'El Salvador', label: 'El Salvador', flag: '🇸🇻', code: 'SV', dialCode: '+503', placeholder: '7123 4567' },
  { value: 'Nicaragua', label: 'Nicaragua', flag: '🇳🇮', code: 'NI', dialCode: '+505', placeholder: '8123 4567' },
  { value: 'Puerto Rico', label: 'Puerto Rico', flag: '🇵🇷', code: 'PR', dialCode: '+1-787', placeholder: '787 123 4567' },
  { value: 'Venezuela', label: 'Venezuela', flag: '🇻🇪', code: 'VE', dialCode: '+58', placeholder: '412 123 4567' },
  { value: 'Brasil', label: 'Brasil', flag: '🇧🇷', code: 'BR', dialCode: '+55', placeholder: '11 91234 5678' },
  { value: 'Portugal', label: 'Portugal', flag: '🇵🇹', code: 'PT', dialCode: '+351', placeholder: '912 345 678' },

  // Europa
  { value: 'Reino Unido', label: 'Reino Unido', flag: '🇬🇧', code: 'GB', dialCode: '+44', placeholder: '7123 456789' },
  { value: 'Alemania', label: 'Alemania', flag: '🇩🇪', code: 'DE', dialCode: '+49', placeholder: '151 12345678' },
  { value: 'Francia', label: 'Francia', flag: '🇫🇷', code: 'FR', dialCode: '+33', placeholder: '6 12 34 56 78' },
  { value: 'Italia', label: 'Italia', flag: '🇮🇹', code: 'IT', dialCode: '+39', placeholder: '312 345 6789' },
  { value: 'Suiza', label: 'Suiza', flag: '🇨🇭', code: 'CH', dialCode: '+41', placeholder: '78 123 45 67' },
  { value: 'Países Bajos', label: 'Países Bajos', flag: '🇳🇱', code: 'NL', dialCode: '+31', placeholder: '6 12345678' },
  { value: 'Bélgica', label: 'Bélgica', flag: '🇧🇪', code: 'BE', dialCode: '+32', placeholder: '470 12 34 56' },
  { value: 'Suecia', label: 'Suecia', flag: '🇸🇪', code: 'SE', dialCode: '+46', placeholder: '70 123 45 67' },
  { value: 'Noruega', label: 'Noruega', flag: '🇳🇴', code: 'NO', dialCode: '+47', placeholder: '412 34 567' },
  { value: 'Dinamarca', label: 'Dinamarca', flag: '🇩🇰', code: 'DK', dialCode: '+45', placeholder: '20 12 34 56' },
  { value: 'Finlandia', label: 'Finlandia', flag: '🇫🇮', code: 'FI', dialCode: '+358', placeholder: '40 123 4567' },
  { value: 'Irlanda', label: 'Irlanda', flag: '🇮🇪', code: 'IE', dialCode: '+353', placeholder: '85 123 4567' },
  { value: 'Austria', label: 'Austria', flag: '🇦🇹', code: 'AT', dialCode: '+43', placeholder: '664 1234567' },
  { value: 'Polonia', label: 'Polonia', flag: '🇵🇱', code: 'PL', dialCode: '+48', placeholder: '512 345 678' },
  { value: 'República Checa', label: 'República Checa', flag: '🇨🇿', code: 'CZ', dialCode: '+420', placeholder: '601 123 456' },
  { value: 'Grecia', label: 'Grecia', flag: '🇬🇷', code: 'GR', dialCode: '+30', placeholder: '691 234 5678' },

  // América del Norte & Asia / Oceanía
  { value: 'Canadá', label: 'Canadá', flag: '🇨🇦', code: 'CA', dialCode: '+1', placeholder: '416 555 0123' },
  { value: 'Japón', label: 'Japón', flag: '🇯🇵', code: 'JP', dialCode: '+81', placeholder: '90 1234 5678' },
  { value: 'Corea del Sur', label: 'Corea del Sur', flag: '🇰🇷', code: 'KR', dialCode: '+82', placeholder: '10 1234 5678' },
  { value: 'Australia', label: 'Australia', flag: '🇦🇺', code: 'AU', dialCode: '+61', placeholder: '412 345 678' },
  { value: 'Nueva Zelanda', label: 'Nueva Zelanda', flag: '🇳🇿', code: 'NZ', dialCode: '+64', placeholder: '21 123 4567' },
  { value: 'Singapur', label: 'Singapur', flag: '🇸🇬', code: 'SG', dialCode: '+65', placeholder: '8123 4567' },
  { value: 'Israel', label: 'Israel', flag: '🇮🇱', code: 'IL', dialCode: '+972', placeholder: '50 123 4567' },
  { value: 'Emiratos Árabes Unidos', label: 'Emiratos Árabes Unidos', flag: '🇦🇪', code: 'AE', dialCode: '+971', placeholder: '50 123 4567' },
  { value: 'Sudáfrica', label: 'Sudáfrica', flag: '🇿🇦', code: 'ZA', dialCode: '+27', placeholder: '71 123 4567' }
];

export const getCountryByName = (name: string): CountryData => {
  return COUNTRIES.find((c) => c.value === name) || COUNTRIES[0];
};

export const getCountryByCode = (code: string): CountryData => {
  return COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase()) || COUNTRIES[0];
};
