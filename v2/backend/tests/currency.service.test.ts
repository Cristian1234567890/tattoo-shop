import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { currencyService, SEEDED_CURRENCIES } from '../src/services/currency.service';

describe('CurrencyService Unit Tests', () => {
  it('should fetch active currencies with success: true', async () => {
    const result = await currencyService.getActiveCurrencies();
    assert.equal(result.success, true);
    assert.ok(Array.isArray(result.data), 'Expected data to be an array');
    assert.ok(result.data!.length >= 5, 'Expected at least 5 active currencies');
  });

  it('should contain all required supported currencies: USD, PAB, EUR, COP, MXN', async () => {
    const result = await currencyService.getActiveCurrencies();
    assert.equal(result.success, true);
    const codes = result.data!.map(c => c.code);

    assert.ok(codes.includes('USD'), 'Missing USD');
    assert.ok(codes.includes('PAB'), 'Missing PAB');
    assert.ok(codes.includes('EUR'), 'Missing EUR');
    assert.ok(codes.includes('COP'), 'Missing COP');
    assert.ok(codes.includes('MXN'), 'Missing MXN');
  });

  it('should have valid rates and symbols for each currency', async () => {
    const result = await currencyService.getActiveCurrencies();
    assert.equal(result.success, true);

    for (const curr of result.data!) {
      assert.ok(typeof curr.code === 'string' && curr.code.length === 3, `Invalid code: ${curr.code}`);
      assert.ok(typeof curr.name === 'string' && curr.name.length > 0, `Invalid name: ${curr.name}`);
      assert.ok(typeof curr.symbol === 'string' && curr.symbol.length > 0, `Invalid symbol: ${curr.symbol}`);
      assert.ok(typeof curr.country === 'string' && curr.country.length > 0, `Invalid country: ${curr.country}`);
      assert.ok(typeof curr.rate_to_usd === 'number' && curr.rate_to_usd > 0, `Invalid rate: ${curr.rate_to_usd}`);
      assert.equal(curr.is_active, true, `Expected active flag to be true`);
    }

    const usd = result.data!.find(c => c.code === 'USD');
    assert.equal(usd?.rate_to_usd, 1.0);

    const pab = result.data!.find(c => c.code === 'PAB');
    assert.equal(pab?.rate_to_usd, 1.0);
  });

  it('should verify SEEDED_CURRENCIES baseline defaults', () => {
    assert.equal(SEEDED_CURRENCIES.length, 5);
    const usd = SEEDED_CURRENCIES.find(c => c.code === 'USD');
    assert.equal(usd?.symbol, '$');
    assert.equal(usd?.rate_to_usd, 1.0);

    const eur = SEEDED_CURRENCIES.find(c => c.code === 'EUR');
    assert.equal(eur?.symbol, '€');
    assert.equal(eur?.rate_to_usd, 0.92);

    const cop = SEEDED_CURRENCIES.find(c => c.code === 'COP');
    assert.equal(cop?.rate_to_usd, 4150.0);
  });
});
