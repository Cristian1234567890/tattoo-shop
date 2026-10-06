/**
 * Currency and Location Utility Functions
 * Supports Panama (PA), Colombia (CO), Spain (ES), United States (US), Mexico (MX)
 * Dynamically formats and converts USD, PAB, EUR, COP, MXN.
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate_to_usd: number;
  country: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CountryConfig {
  code: string;
  name: string;
  defaultCurrency: string;
  flag: string;
  locale: string;
}

export const SUPPORTED_COUNTRIES: CountryConfig[] = [
  { code: 'PA', name: 'Panamá', defaultCurrency: 'USD', flag: '🇵🇦', locale: 'es-PA' },
  { code: 'CO', name: 'Colombia', defaultCurrency: 'COP', flag: '🇨🇴', locale: 'es-CO' },
  { code: 'ES', name: 'España', defaultCurrency: 'EUR', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'US', name: 'Estados Unidos', defaultCurrency: 'USD', flag: '🇺🇸', locale: 'en-US' },
  { code: 'MX', name: 'México', defaultCurrency: 'MXN', flag: '🇲🇽', locale: 'es-MX' },
];

export const FALLBACK_CURRENCIES: Currency[] = [
  {
    code: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    rate_to_usd: 1.0,
    country: 'Estados Unidos',
    is_active: true,
  },
  {
    code: 'PAB',
    name: 'Balboa Panameño',
    symbol: 'B/.',
    rate_to_usd: 1.0,
    country: 'Panamá',
    is_active: true,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    rate_to_usd: 0.92,
    country: 'España',
    is_active: true,
  },
  {
    code: 'COP',
    name: 'Peso Colombiano',
    symbol: '$',
    rate_to_usd: 4150.0,
    country: 'Colombia',
    is_active: true,
  },
  {
    code: 'MXN',
    name: 'Peso Mexicano',
    symbol: '$',
    rate_to_usd: 18.5,
    country: 'México',
    is_active: true,
  },
];

export const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  PAB: 1.0,
  EUR: 0.92,
  COP: 4150.0,
  MXN: 18.5,
};

export const STORAGE_KEY_COUNTRY = 'tattoohub_country';
export const STORAGE_KEY_CURRENCY = 'tattoohub_currency';

export function getStoredCountry(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_COUNTRY) || 'PA';
  } catch {
    return 'PA';
  }
}

export function getStoredCurrency(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_CURRENCY) || 'USD';
  } catch {
    return 'USD';
  }
}

export function findCountryConfig(countryCodeOrName: string): CountryConfig {
  const normalized = (countryCodeOrName || '').trim().toLowerCase();
  const found = SUPPORTED_COUNTRIES.find(
    (c) =>
      c.code.toLowerCase() === normalized ||
      c.name.toLowerCase() === normalized
  );
  return found || SUPPORTED_COUNTRIES[0];
}

export function getLocaleForCurrency(currencyCode: string): string {
  const code = (currencyCode || 'USD').toUpperCase();
  switch (code) {
    case 'COP':
      return 'es-CO';
    case 'EUR':
      return 'es-ES';
    case 'MXN':
      return 'es-MX';
    case 'PAB':
      return 'es-PA';
    case 'USD':
    default:
      return 'en-US';
  }
}

/**
 * Converts an amount from one currency to another using exchange rates relative to USD.
 * Formula: 1 USD = rate units of target currency.
 */
export function convertCurrency(
  amount: number,
  fromCurrency = 'USD',
  toCurrency = 'USD',
  rates: Record<string, number> = FALLBACK_RATES
): number {
  if (isNaN(amount) || amount === 0) return 0;

  const fromCode = (fromCurrency || 'USD').toUpperCase();
  const toCode = (toCurrency || 'USD').toUpperCase();

  if (fromCode === toCode) return amount;

  const fromRate = rates[fromCode] ?? FALLBACK_RATES[fromCode] ?? 1.0;
  const toRate = rates[toCode] ?? FALLBACK_RATES[toCode] ?? 1.0;

  // Convert source amount to USD first
  const usdAmount = fromCode === 'USD' ? amount : amount / fromRate;

  // Convert USD to target currency
  const converted = toCode === 'USD' ? usdAmount : usdAmount * toRate;

  return converted;
}

/**
 * Parses numeric value, currency hints, and unit suffixes from strings like "$80/h", "$120", "4.99/mes".
 */
export function parsePriceInput(input: number | string): {
  amount: number;
  detectedCurrency?: string;
  unit?: string;
} {
  if (typeof input === 'number') {
    return { amount: input };
  }

  const str = String(input).trim();
  let detectedCurrency: string | undefined = undefined;
  if (str.includes('€') || str.toUpperCase().includes('EUR')) detectedCurrency = 'EUR';
  else if (str.includes('B/.') || str.toUpperCase().includes('PAB')) detectedCurrency = 'PAB';
  else if (str.toUpperCase().includes('COP')) detectedCurrency = 'COP';
  else if (str.toUpperCase().includes('MXN')) detectedCurrency = 'MXN';
  else if (str.includes('$') || str.toUpperCase().includes('USD')) detectedCurrency = 'USD';

  // Check unit suffixes like /h, /mes, /mo, /año, /year
  let unit: string | undefined = undefined;
  const unitMatch = str.match(/(\/(?:h|mes|mo|año|year|semana|día|session|sesión))/i);
  if (unitMatch) {
    unit = unitMatch[1];
  }

  // Extract numeric part (e.g., "80", "4.99", "4,150")
  const cleaned = str.replace(/[^0-9.,]/g, '').replace(/,/g, '');
  const parsed = parseFloat(cleaned);

  return {
    amount: isNaN(parsed) ? 0 : parsed,
    detectedCurrency,
    unit,
  };
}

/**
 * Formats a numeric currency value using Intl.NumberFormat according to currency and locale conventions.
 */
export function formatCurrencyNumber(
  amount: number,
  currencyCode = 'USD',
  options?: { showCode?: boolean; locale?: string }
): string {
  const currencyUpper = (currencyCode || 'USD').toUpperCase();
  const locale = options?.locale || getLocaleForCurrency(currencyUpper);
  const isZeroDecimal = currencyUpper === 'COP';

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyUpper,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  });

  let formatted = formatter.format(amount).replace(/\u00a0/g, ' ');

  if (options?.showCode && !formatted.includes(currencyUpper)) {
    return `${formatted} ${currencyUpper}`;
  }

  return formatted;
}

/**
 * High-level dynamic price formatting function.
 * Accepts numeric or string amounts, converts from source currency (default USD)
 * to target currency, and formats according to active currency standards.
 */
export function formatPrice(
  amount: number | string,
  fromCurrency = 'USD',
  toCurrency?: string,
  rates?: Record<string, number>,
  options?: { showCode?: boolean; unit?: string }
): string {
  const parsed = parsePriceInput(amount);
  const effectiveFrom = parsed.detectedCurrency || fromCurrency || 'USD';
  const effectiveTo = (toCurrency || getStoredCurrency() || 'USD').toUpperCase();
  const effectiveUnit = options?.unit || parsed.unit || '';

  const converted = convertCurrency(
    parsed.amount,
    effectiveFrom,
    effectiveTo,
    rates || FALLBACK_RATES
  );

  const formatted = formatCurrencyNumber(converted, effectiveTo, {
    showCode: options?.showCode,
  });

  return `${formatted}${effectiveUnit}`;
}
