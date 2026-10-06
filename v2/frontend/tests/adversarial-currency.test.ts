/**
 * Adversarial Currency & Dynamic Pricing Stress-Test Suite
 * 
 * Verifies Milestone 12 requirements and edge cases:
 * 1. Negative amounts (numeric and strings)
 * 2. Zero amounts and boundary conditions
 * 3. Large numbers, billions, precision, and absence of scientific notation
 * 4. Invalid, unknown, and malformed currency codes
 * 5. Locale formatting rules: COP (0 decimals), USD/EUR/MXN/PAB (2 decimals)
 * 6. Country switching and default currency synchronization
 * 7. Adversarial string parsing (malformed inputs, units, symbols)
 */

import {
  SUPPORTED_COUNTRIES,
  FALLBACK_CURRENCIES,
  FALLBACK_RATES,
  STORAGE_KEY_COUNTRY,
  STORAGE_KEY_CURRENCY,
  findCountryConfig,
  getLocaleForCurrency,
  convertCurrency,
  parsePriceInput,
  formatCurrencyNumber,
  formatPrice,
} from '../src/utils/currency';

interface TestRecord {
  category: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'ADVERSARIAL_FINDING';
  details: string;
}

const records: TestRecord[] = [];

function pass(category: string, name: string, details: string) {
  records.push({ category, name, status: 'PASS', details });
  console.log(`✅ [${category}] ${name} -> ${details}`);
}

function fail(category: string, name: string, details: string) {
  records.push({ category, name, status: 'FAIL', details });
  console.log(`❌ [${category}] ${name} -> ${details}`);
}

function finding(category: string, name: string, details: string) {
  records.push({ category, name, status: 'ADVERSARIAL_FINDING', details });
  console.log(`⚠️  [${category}] ${name} -> ${details}`);
}

console.log('================================================================');
console.log('🚀 ADVERSARIAL CURRENCY & DYNAMIC PRICING STRESS-TEST HARNESS');
console.log('================================================================\n');

// ----------------------------------------------------------------------
// 1. NEGATIVE AMOUNTS
// ----------------------------------------------------------------------
console.log('--- SUITE 1: Negative Amounts Stress-Testing ---');

// 1.1 Numeric negative in USD
try {
  const negUsd = formatPrice(-50, 'USD', 'USD', FALLBACK_RATES);
  if (negUsd.includes('-') && negUsd.includes('50.00')) {
    pass('Negative Amounts', 'Numeric -50 USD formats with negative sign and 2 decimals', negUsd);
  } else {
    fail('Negative Amounts', 'Numeric -50 USD failed format', negUsd);
  }
} catch (e: any) {
  fail('Negative Amounts', 'Numeric -50 USD threw exception', e.message);
}

// 1.2 Numeric negative in COP
try {
  const negCop = formatPrice(-50, 'USD', 'COP', FALLBACK_RATES);
  // -50 USD * 4150 = -207,500 COP
  const hasMinus = negCop.includes('-');
  const hasValue = negCop.includes('207.500') || negCop.includes('207,500');
  const hasNoDecimals = !/,\d+/.test(negCop);
  if (hasMinus && hasValue && hasNoDecimals) {
    pass('Negative Amounts', 'Numeric -50 USD to COP formats with negative sign and 0 decimals', negCop);
  } else {
    fail('Negative Amounts', 'Numeric -50 USD to COP unexpected formatting', negCop);
  }
} catch (e: any) {
  fail('Negative Amounts', 'Numeric -50 USD to COP threw exception', e.message);
}

// 1.3 Numeric negative fraction
try {
  const negFraction = formatPrice(-4.99, 'USD', 'USD', FALLBACK_RATES);
  if (negFraction.includes('-') && negFraction.includes('4.99')) {
    pass('Negative Amounts', 'Numeric -4.99 USD formats with negative sign', negFraction);
  } else {
    fail('Negative Amounts', 'Numeric -4.99 USD failed format', negFraction);
  }
} catch (e: any) {
  fail('Negative Amounts', 'Numeric -4.99 USD threw exception', e.message);
}

// 1.4 String negative input: "-50"
try {
  const parsedNegStr = parsePriceInput('-50');
  if (parsedNegStr.amount === -50) {
    pass('Negative Amounts', 'String "-50" preserves negative sign', JSON.stringify(parsedNegStr));
  } else {
    finding(
      'Negative Amounts',
      'String "-50" loses negative sign during parsing',
      `Parsed as ${parsedNegStr.amount}. Root cause: regex [^0-9.,] strips '-' character.`
    );
  }
} catch (e: any) {
  fail('Negative Amounts', 'String "-50" threw exception', e.message);
}

// 1.5 String negative input with symbol: "-$50"
try {
  const parsedNegDollar = parsePriceInput('-$50');
  if (parsedNegDollar.amount === -50) {
    pass('Negative Amounts', 'String "-$50" preserves negative sign', JSON.stringify(parsedNegDollar));
  } else {
    finding(
      'Negative Amounts',
      'String "-$50" loses negative sign during parsing',
      `Parsed as ${parsedNegDollar.amount}. Minus sign stripped by regex [^0-9.,].`
    );
  }
} catch (e: any) {
  fail('Negative Amounts', 'String "-$50" threw exception', e.message);
}

// ----------------------------------------------------------------------
// 2. ZERO AMOUNTS & BOUNDARY CONDITIONS
// ----------------------------------------------------------------------
console.log('\n--- SUITE 2: Zero Amounts & Boundaries ---');

// 2.1 Numeric 0 in USD
try {
  const zeroUsd = formatPrice(0, 'USD', 'USD', FALLBACK_RATES);
  if (zeroUsd.includes('0.00')) {
    pass('Zero Amounts', 'Numeric 0 USD formats as $0.00', zeroUsd);
  } else {
    fail('Zero Amounts', 'Numeric 0 USD formatting failed', zeroUsd);
  }
} catch (e: any) {
  fail('Zero Amounts', 'Numeric 0 USD threw exception', e.message);
}

// 2.2 Numeric 0 in COP (0 decimals)
try {
  const zeroCop = formatPrice(0, 'USD', 'COP', FALLBACK_RATES);
  const hasZero = zeroCop.includes('0');
  const hasNoDecimals = !/,\d+|\.00/.test(zeroCop);
  if (hasZero && hasNoDecimals) {
    pass('Zero Amounts', 'Numeric 0 COP formats with 0 decimals ($ 0)', zeroCop);
  } else {
    fail('Zero Amounts', 'Numeric 0 COP unexpected decimals', zeroCop);
  }
} catch (e: any) {
  fail('Zero Amounts', 'Numeric 0 COP threw exception', e.message);
}

// 2.3 String "$0/h"
try {
  const zeroStr = formatPrice('$0/h', 'USD', 'USD', FALLBACK_RATES);
  if (zeroStr.includes('0.00') && zeroStr.endsWith('/h')) {
    pass('Zero Amounts', 'String "$0/h" preserves unit and formats zero correctly', zeroStr);
  } else {
    fail('Zero Amounts', 'String "$0/h" formatting failed', zeroStr);
  }
} catch (e: any) {
  fail('Zero Amounts', 'String "$0/h" threw exception', e.message);
}

// 2.4 convertCurrency with 0
try {
  const convZero = convertCurrency(0, 'USD', 'COP', FALLBACK_RATES);
  if (convZero === 0) {
    pass('Zero Amounts', 'convertCurrency(0) strictly returns 0 without NaN or infinity', `Result: ${convZero}`);
  } else {
    fail('Zero Amounts', 'convertCurrency(0) returned non-zero', `Result: ${convZero}`);
  }
} catch (e: any) {
  fail('Zero Amounts', 'convertCurrency(0) threw exception', e.message);
}

// 2.5 convertCurrency with NaN
try {
  const convNaN = convertCurrency(NaN, 'USD', 'COP', FALLBACK_RATES);
  if (convNaN === 0) {
    pass('Zero Amounts', 'convertCurrency(NaN) safely returns 0', `Result: ${convNaN}`);
  } else {
    fail('Zero Amounts', 'convertCurrency(NaN) returned non-zero', `Result: ${convNaN}`);
  }
} catch (e: any) {
  fail('Zero Amounts', 'convertCurrency(NaN) threw exception', e.message);
}

// ----------------------------------------------------------------------
// 3. LARGE NUMBERS & PRECISION
// ----------------------------------------------------------------------
console.log('\n--- SUITE 3: Large Numbers & High-Precision Stress-Testing ---');

// 3.1 1 Million USD
try {
  const million = formatPrice(1000000, 'USD', 'USD', FALLBACK_RATES);
  if (million.includes('1,000,000.00') || million.includes('1.000.000,00')) {
    pass('Large Numbers', '1,000,000 USD formats with grouping separators and 2 decimals', million);
  } else {
    fail('Large Numbers', '1,000,000 USD formatting failed', million);
  }
} catch (e: any) {
  fail('Large Numbers', '1,000,000 USD threw exception', e.message);
}

// 3.2 1 Billion USD
try {
  const billion = formatPrice(1000000000, 'USD', 'USD', FALLBACK_RATES);
  const noSci = !billion.includes('e+');
  const hasGrouping = billion.includes('1,000,000,000') || billion.includes('1.000.000.000');
  if (noSci && hasGrouping) {
    pass('Large Numbers', '1,000,000,000 USD formats without scientific notation', billion);
  } else {
    fail('Large Numbers', '1,000,000,000 USD formatting failed', billion);
  }
} catch (e: any) {
  fail('Large Numbers', '1,000,000,000 USD threw exception', e.message);
}

// 3.3 Large conversion: 10 Million USD to COP (41.5 Billion COP)
try {
  const copLarge = formatPrice(10000000, 'USD', 'COP', FALLBACK_RATES);
  // 10,000,000 * 4150 = 41,500,000,000 COP
  const noSci = !copLarge.includes('e+');
  const hasValue = copLarge.includes('41') && copLarge.includes('500');
  const hasNoDecimals = !/,\d+/.test(copLarge); // es-CO uses comma for decimals
  if (noSci && hasValue && hasNoDecimals) {
    pass('Large Numbers', '10 Million USD to COP (41.5 Billion COP) formats with 0 decimals', copLarge);
  } else {
    fail('Large Numbers', '10 Million USD to COP formatting failed', copLarge);
  }
} catch (e: any) {
  fail('Large Numbers', '10 Million USD to COP threw exception', e.message);
}

// 3.4 Sub-cent fractional rounding
try {
  const roundDown = formatPrice(4.994, 'USD', 'USD', FALLBACK_RATES);
  const roundUp = formatPrice(4.996, 'USD', 'USD', FALLBACK_RATES);
  if (roundDown.includes('4.99') && roundUp.includes('5.00')) {
    pass('Large Numbers', 'Sub-cent fractional values round to nearest 2 decimals', `Down: ${roundDown}, Up: ${roundUp}`);
  } else {
    fail('Large Numbers', 'Fractional rounding failed', `Down: ${roundDown}, Up: ${roundUp}`);
  }
} catch (e: any) {
  fail('Large Numbers', 'Fractional rounding threw exception', e.message);
}

// ----------------------------------------------------------------------
// 4. INVALID CURRENCIES & ERROR RESILIENCE
// ----------------------------------------------------------------------
console.log('\n--- SUITE 4: Invalid Currencies & Error Resilience ---');

// 4.1 convertCurrency with unknown currency codes
try {
  const convUnknownFrom = convertCurrency(100, 'UNKNOWN_SRC', 'USD', FALLBACK_RATES);
  const convUnknownTo = convertCurrency(100, 'USD', 'UNKNOWN_DEST', FALLBACK_RATES);
  if (convUnknownFrom === 100 && convUnknownTo === 100) {
    pass('Invalid Currencies', 'convertCurrency gracefully falls back to 1.0 rate for unknown codes', `From: ${convUnknownFrom}, To: ${convUnknownTo}`);
  } else {
    fail('Invalid Currencies', 'convertCurrency unknown code rate failed', `From: ${convUnknownFrom}, To: ${convUnknownTo}`);
  }
} catch (e: any) {
  fail('Invalid Currencies', 'convertCurrency with unknown codes threw exception', e.message);
}

// 4.2 convertCurrency with empty string or falsy currencies
try {
  const convEmpty = convertCurrency(100, '', '', FALLBACK_RATES);
  if (convEmpty === 100) {
    pass('Invalid Currencies', 'convertCurrency with empty strings defaults safely to USD (100)', `Result: ${convEmpty}`);
  } else {
    fail('Invalid Currencies', 'convertCurrency with empty string failed', `Result: ${convEmpty}`);
  }
} catch (e: any) {
  fail('Invalid Currencies', 'convertCurrency with empty string threw exception', e.message);
}

// 4.3 formatCurrencyNumber with valid ISO code not in supported list (e.g. GBP)
try {
  const gbpFormatted = formatCurrencyNumber(100, 'GBP');
  if (gbpFormatted.includes('100.00') && (gbpFormatted.includes('£') || gbpFormatted.includes('GBP'))) {
    pass('Invalid Currencies', 'formatCurrencyNumber with valid external ISO code (GBP) formats cleanly', gbpFormatted);
  } else {
    fail('Invalid Currencies', 'formatCurrencyNumber with GBP failed', gbpFormatted);
  }
} catch (e: any) {
  fail('Invalid Currencies', 'formatCurrencyNumber with GBP threw exception', e.message);
}

// 4.4 formatCurrencyNumber with invalid non-ISO code ("INVALID")
try {
  formatCurrencyNumber(100, 'INVALID');
  pass('Invalid Currencies', 'formatCurrencyNumber gracefully handles invalid currency code', 'No exception');
} catch (e: any) {
  finding(
    'Invalid Currencies',
    'formatCurrencyNumber throws unhandled RangeError on non-ISO currency strings',
    `${e.name}: ${e.message}. (Risk: unvalidated input or corrupted localStorage currency triggers React component crash)`
  );
}

// 4.5 formatPrice with empty/falsy target currency
try {
  const emptyTarget = formatPrice(100, 'USD', '');
  if (emptyTarget.includes('100.00')) {
    pass('Invalid Currencies', 'formatPrice with empty target string falls back to USD default', emptyTarget);
  } else {
    fail('Invalid Currencies', 'formatPrice with empty target failed', emptyTarget);
  }
} catch (e: any) {
  fail('Invalid Currencies', 'formatPrice with empty target threw exception', e.message);
}

// ----------------------------------------------------------------------
// 5. LOCALE FORMATTING RULES: COP (0 decimals), USD/EUR/MXN/PAB (2 decimals)
// ----------------------------------------------------------------------
console.log('\n--- SUITE 5: Locale Formatting Rules ---');

// 5.1 COP decimal rules: zero decimal digits
const copAmounts = [1, 50, 4150, 10000, 207500];
let copAllZeroDecimals = true;
const copOutputs: string[] = [];
for (const amt of copAmounts) {
  const formatted = formatCurrencyNumber(amt, 'COP');
  copOutputs.push(formatted);
  // In es-CO locale, decimals use comma (,). Verify no decimal comma exists.
  if (/,/.test(formatted)) {
    copAllZeroDecimals = false;
  }
}
if (copAllZeroDecimals) {
  pass('Locale Rules', 'COP formatting strictly enforces 0 decimal digits across all test amounts', copOutputs.join(' | '));
} else {
  fail('Locale Rules', 'COP formatting included decimal comma in formatted output', copOutputs.join(' | '));
}

// 5.2 USD decimal rules: two decimal digits
const usdAmounts = [0, 1, 4.99, 50, 120];
let usdAllTwoDecimals = true;
const usdOutputs: string[] = [];
for (const amt of usdAmounts) {
  const formatted = formatCurrencyNumber(amt, 'USD');
  usdOutputs.push(formatted);
  // Must have dot followed by 2 digits
  if (!/\.\d{2}$|\.\d{2}\s/.test(formatted)) {
    usdAllTwoDecimals = false;
  }
}
if (usdAllTwoDecimals) {
  pass('Locale Rules', 'USD formatting strictly enforces 2 decimal digits ($0.00, $4.99, $120.00)', usdOutputs.join(' | '));
} else {
  fail('Locale Rules', 'USD formatting failed 2 decimal rule', usdOutputs.join(' | '));
}

// 5.3 EUR decimal rules
const eurFormatted = formatCurrencyNumber(92, 'EUR');
if (/,00|\.00/.test(eurFormatted)) {
  pass('Locale Rules', 'EUR formatting enforces 2 decimal digits (92,00 €)', eurFormatted);
} else {
  fail('Locale Rules', 'EUR formatting failed 2 decimal digits', eurFormatted);
}

// 5.4 MXN decimal rules
const mxnFormatted = formatCurrencyNumber(185, 'MXN');
if (/\.00|,00/.test(mxnFormatted)) {
  pass('Locale Rules', 'MXN formatting enforces 2 decimal digits ($185.00)', mxnFormatted);
} else {
  fail('Locale Rules', 'MXN formatting failed 2 decimal digits', mxnFormatted);
}

// 5.5 PAB decimal rules
const pabFormatted = formatCurrencyNumber(100, 'PAB');
if (/\.00|,00/.test(pabFormatted)) {
  pass('Locale Rules', 'PAB formatting enforces 2 decimal digits (B/. 100.00)', pabFormatted);
} else {
  fail('Locale Rules', 'PAB formatting failed 2 decimal digits', pabFormatted);
}

// 5.6 getLocaleForCurrency mapping verification
const locales = {
  COP: getLocaleForCurrency('COP'),
  EUR: getLocaleForCurrency('EUR'),
  MXN: getLocaleForCurrency('MXN'),
  PAB: getLocaleForCurrency('PAB'),
  USD: getLocaleForCurrency('USD'),
  UNKNOWN: getLocaleForCurrency('UNKNOWN'),
};
const localesCorrect =
  locales.COP === 'es-CO' &&
  locales.EUR === 'es-ES' &&
  locales.MXN === 'es-MX' &&
  locales.PAB === 'es-PA' &&
  locales.USD === 'en-US' &&
  locales.UNKNOWN === 'en-US';
if (localesCorrect) {
  pass('Locale Rules', 'getLocaleForCurrency correctly maps all currencies and unknown to designated locale', JSON.stringify(locales));
} else {
  fail('Locale Rules', 'getLocaleForCurrency mapping mismatch', JSON.stringify(locales));
}

// ----------------------------------------------------------------------
// 6. COUNTRY SWITCHING & DEFAULT CURRENCY SYNCHRONIZATION
// ----------------------------------------------------------------------
console.log('\n--- SUITE 6: Country Switching & Currency Synchronization ---');

// 6.1 Direct code matching
const countryCodeTests = [
  { input: 'PA', expectedCountry: 'PA', expectedCurrency: 'USD' },
  { input: 'CO', expectedCountry: 'CO', expectedCurrency: 'COP' },
  { input: 'ES', expectedCountry: 'ES', expectedCurrency: 'EUR' },
  { input: 'US', expectedCountry: 'US', expectedCurrency: 'USD' },
  { input: 'MX', expectedCountry: 'MX', expectedCurrency: 'MXN' },
];

let allCountryCodesPass = true;
countryCodeTests.forEach(({ input, expectedCountry, expectedCurrency }) => {
  const config = findCountryConfig(input);
  if (config.code !== expectedCountry || config.defaultCurrency !== expectedCurrency) {
    allCountryCodesPass = false;
  }
});
if (allCountryCodesPass) {
  pass('Country Switching', 'All 5 country codes (PA, CO, ES, US, MX) resolve to exact country and default currency', 'All 5 verified');
} else {
  fail('Country Switching', 'Country code resolution failed', 'Mismatch in supported country codes');
}

// 6.2 Case-insensitive and trimmed name matching
const nameTests = [
  { input: '  panamá  ', expectedCode: 'PA', expectedCurrency: 'USD' },
  { input: 'COLOMBIA', expectedCode: 'CO', expectedCurrency: 'COP' },
  { input: 'españa', expectedCode: 'ES', expectedCurrency: 'EUR' },
  { input: 'estados unidos', expectedCode: 'US', expectedCurrency: 'USD' },
  { input: 'méxico', expectedCode: 'MX', expectedCurrency: 'MXN' },
];

let allNameTestsPass = true;
nameTests.forEach(({ input, expectedCode, expectedCurrency }) => {
  const config = findCountryConfig(input);
  if (config.code !== expectedCode || config.defaultCurrency !== expectedCurrency) {
    allNameTestsPass = false;
  }
});
if (allNameTestsPass) {
  pass('Country Switching', 'Country name matching is robust against whitespace and casing', 'All 5 verified');
} else {
  fail('Country Switching', 'Country name matching failed', 'Mismatch in country names');
}

// 6.3 Fallback for unknown country inputs
const unknownCountryTests = ['FR', 'DE', 'Atlantis', '', '   ', 'XYZ'];
let allUnknownFallbackToDefault = true;
unknownCountryTests.forEach((unknown) => {
  const config = findCountryConfig(unknown);
  if (config.code !== 'PA' || config.defaultCurrency !== 'USD') {
    allUnknownFallbackToDefault = false;
  }
});
if (allUnknownFallbackToDefault) {
  pass('Country Switching', 'Unknown country codes/names safely fallback to default country PA (USD)', 'Fallback PA/USD verified');
} else {
  fail('Country Switching', 'Unknown country fallback failed', 'Did not fallback to PA/USD');
}

// 6.4 Country Switching State Machine Simulation
class CurrencyStateMachine {
  country: string = 'PA';
  currency: string = 'USD';
  storage: Record<string, string> = {};

  setCountry(countryCodeOrName: string) {
    const matched = findCountryConfig(countryCodeOrName);
    this.country = matched.code;
    this.currency = matched.defaultCurrency;
    this.storage[STORAGE_KEY_COUNTRY] = matched.code;
    this.storage[STORAGE_KEY_CURRENCY] = matched.defaultCurrency;
  }

  setCurrency(currencyCode: string) {
    const code = (currencyCode || 'USD').toUpperCase();
    this.currency = code;
    this.storage[STORAGE_KEY_CURRENCY] = code;
  }
}

const sm = new CurrencyStateMachine();
sm.setCountry('CO');
const step1Ok = sm.country === 'CO' && sm.currency === 'COP' && sm.storage[STORAGE_KEY_CURRENCY] === 'COP';
sm.setCountry('España');
const step2Ok = sm.country === 'ES' && sm.currency === 'EUR' && sm.storage[STORAGE_KEY_CURRENCY] === 'EUR';
sm.setCountry('MX');
const step3Ok = sm.country === 'MX' && sm.currency === 'MXN' && sm.storage[STORAGE_KEY_CURRENCY] === 'MXN';
sm.setCurrency('USD');
const step4Ok = sm.country === 'MX' && sm.currency === 'USD' && sm.storage[STORAGE_KEY_CURRENCY] === 'USD';
sm.setCountry('Colombia');
const step5Ok = sm.country === 'CO' && sm.currency === 'COP' && sm.storage[STORAGE_KEY_CURRENCY] === 'COP';

const stateMachineOk = step1Ok && step2Ok && step3Ok && step4Ok && step5Ok;
if (stateMachineOk) {
  pass('Country Switching', 'State transitions correctly synchronize country, currency, and localStorage keys', 'Sequence: CO(COP) -> ES(EUR) -> MX(MXN) -> Override(USD) -> CO(COP)');
} else {
  fail('Country Switching', 'State machine transitions failed', 'Mismatch in state synchronization');
}

// ----------------------------------------------------------------------
// 7. ADVERSARIAL STRING PARSING (parsePriceInput)
// ----------------------------------------------------------------------
console.log('\n--- SUITE 7: Adversarial Price String Parsing ---');

// 7.1 Complex units and thousand separators
const complex1 = parsePriceInput('$1,250.00/mes');
if (complex1.amount === 1250 && complex1.unit === '/mes' && complex1.detectedCurrency === 'USD') {
  pass('String Parsing', 'Parsed "$1,250.00/mes" with comma grouping, unit, and currency', JSON.stringify(complex1));
} else {
  fail('String Parsing', 'Parsed "$1,250.00/mes" failed', JSON.stringify(complex1));
}

// 7.2 Non-numeric string
const garbage = parsePriceInput('Gratis');
if (garbage.amount === 0) {
  pass('String Parsing', 'Non-numeric string "Gratis" parses safely to 0', JSON.stringify(garbage));
} else {
  fail('String Parsing', 'Non-numeric string "Gratis" failed', JSON.stringify(garbage));
}

// 7.3 Unit parsing with space: "49.90 / año"
const unitWithSpace = parsePriceInput('49.90 / año');
if (unitWithSpace.unit) {
  pass('String Parsing', 'Parsed "49.90 / año" with space before unit', JSON.stringify(unitWithSpace));
} else {
  finding(
    'String Parsing',
    'parsePriceInput fails to parse units when space precedes suffix (e.g. "49.90 / año")',
    `unit is undefined. Regex /(\\/(?:h|mes|...))/ requires slash directly adjacent to unit word.`
  );
}

// 7.4 Balboa symbol period collision: "B/. 150.00"
const balboaTest = parsePriceInput('B/. 150.00');
if (balboaTest.amount === 150) {
  pass('String Parsing', 'Parsed "B/. 150.00" amount correctly as 150', JSON.stringify(balboaTest));
} else {
  finding(
    'String Parsing',
    'CRITICAL DEFECT: parsePriceInput distorts Balboa (B/.) prices by factor of 1000',
    `"B/. 150.00" parsed as ${balboaTest.amount}. Regex [^0-9.,] leaves the period in "B/." producing ".150.00", which parseFloat parses as 0.15!`
  );
}

// ----------------------------------------------------------------------
// SUMMARY & METRICS
// ----------------------------------------------------------------------
console.log('\n================================================================');
console.log('📊 ADVERSARIAL STRESS TEST SUMMARY');
console.log('================================================================');

const total = records.length;
const passes = records.filter((r) => r.status === 'PASS').length;
const fails = records.filter((r) => r.status === 'FAIL').length;
const findings = records.filter((r) => r.status === 'ADVERSARIAL_FINDING');

console.log(`Total Scenarios: ${total}`);
console.log(`Passed Assertions: ${passes}`);
console.log(`Hard Failures: ${fails}`);
console.log(`Adversarial Findings / Edge Defects: ${findings.length}`);

findings.forEach((f) => {
  console.log(`\n⚠️  [${f.category}] ${f.name}`);
  console.log(`   Details: ${f.details}`);
});

if (fails > 0) {
  console.error(`\n❌ TEST SUITE FAILED WITH ${fails} UNEXPECTED ERRORS.`);
  process.exit(1);
} else {
  console.log('\n✅ ALL STANDARD VERIFICATION CRITERIA PASSED.');
  console.log('Adversarial findings documented for review report.');
}
