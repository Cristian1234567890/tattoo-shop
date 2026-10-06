import {
  SUPPORTED_COUNTRIES,
  FALLBACK_CURRENCIES,
  FALLBACK_RATES,
  findCountryConfig,
  getLocaleForCurrency,
  convertCurrency,
  parsePriceInput,
  formatCurrencyNumber,
  formatPrice,
} from '../src/utils/currency';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('--- RUNNING CURRENCY UNIT TESTS ---\n');

// Test 1: Supported Countries verification
assert(SUPPORTED_COUNTRIES.length === 5, 'Must support exactly 5 countries (PA, CO, ES, US, MX)');
const expectedCodes = ['PA', 'CO', 'ES', 'US', 'MX'];
expectedCodes.forEach((code) => {
  const found = findCountryConfig(code);
  assert(Boolean(found && found.code === code), `Country ${code} exists in configuration`);
});

// Test 2: Country configuration lookups
const panama = findCountryConfig('Panamá');
assert(panama.code === 'PA' && panama.defaultCurrency === 'USD', 'Panamá resolves to PA with USD default');
const colombia = findCountryConfig('Colombia');
assert(colombia.code === 'CO' && colombia.defaultCurrency === 'COP', 'Colombia resolves to CO with COP default');
const spain = findCountryConfig('España');
assert(spain.code === 'ES' && spain.defaultCurrency === 'EUR', 'España resolves to ES with EUR default');
const mexico = findCountryConfig('México');
assert(mexico.code === 'MX' && mexico.defaultCurrency === 'MXN', 'México resolves to MX with MXN default');
const us = findCountryConfig('Estados Unidos');
assert(us.code === 'US' && us.defaultCurrency === 'USD', 'Estados Unidos resolves to US with USD default');

// Test 3: Currency conversions with fallback rates
// Base rate: 1 USD = 4150 COP
const convertedCop = convertCurrency(10, 'USD', 'COP', FALLBACK_RATES);
assert(convertedCop === 41500, `10 USD converts to 41,500 COP (received ${convertedCop})`);

// 1 USD = 0.92 EUR -> 100 USD = 92 EUR
const convertedEur = convertCurrency(100, 'USD', 'EUR', FALLBACK_RATES);
assert(convertedEur === 92, `100 USD converts to 92 EUR (received ${convertedEur})`);

// 1 USD = 18.5 MXN -> 10 USD = 185 MXN
const convertedMxn = convertCurrency(10, 'USD', 'MXN', FALLBACK_RATES);
assert(convertedMxn === 185, `10 USD converts to 185 MXN (received ${convertedMxn})`);

// 100 EUR to USD: 92 EUR / 0.92 = 100 USD
const convertedBack = convertCurrency(92, 'EUR', 'USD', FALLBACK_RATES);
assert(Math.round(convertedBack) === 100, `92 EUR converts back to 100 USD (received ${convertedBack})`);

// Test 4: String input parsing
const parsedHourly = parsePriceInput('$80/h');
assert(parsedHourly.amount === 80 && parsedHourly.unit === '/h', 'Parsed "$80/h" to amount 80 and unit "/h"');

const parsedPlan = parsePriceInput('$4.99/mes');
assert(parsedPlan.amount === 4.99 && parsedPlan.unit === '/mes', 'Parsed "$4.99/mes" to amount 4.99 and unit "/mes"');

const parsedEuro = parsePriceInput('€90/h');
assert(parsedEuro.amount === 90 && parsedEuro.detectedCurrency === 'EUR' && parsedEuro.unit === '/h', 'Parsed "€90/h" to 90 EUR /h');

// Test 5: Dynamic price formatting
// USD formatting
const formattedUsd = formatPrice(4.99, 'USD', 'USD', FALLBACK_RATES);
assert(formattedUsd.includes('4.99') || formattedUsd.includes('4,99'), `USD formatted correctly: ${formattedUsd}`);

// EUR formatting
const formattedEur = formatPrice(100, 'USD', 'EUR', FALLBACK_RATES);
assert(formattedEur.includes('92') && (formattedEur.includes('€') || formattedEur.includes('EUR')), `EUR formatted correctly: ${formattedEur}`);

// COP formatting (0 decimal places)
const formattedCop = formatPrice(1, 'USD', 'COP', FALLBACK_RATES);
assert(formattedCop.includes('4') && formattedCop.includes('150') && !formattedCop.includes('.00'), `COP formatted with 0 decimals: ${formattedCop}`);

// Unit preservation
const formattedWithUnit = formatPrice('$80/h', 'USD', 'USD', FALLBACK_RATES);
assert(formattedWithUnit.endsWith('/h'), `Hourly unit preserved: ${formattedWithUnit}`);

console.log('\n--- ALL CURRENCY TESTS PASSED SUCCESSFULLY! ---');
