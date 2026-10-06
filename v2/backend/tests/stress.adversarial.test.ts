import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../src/app';
import { currencyService, SEEDED_CURRENCIES, CurrencyService } from '../src/services/currency.service';
import { tattooService, TattooService, ArtistFilterParams } from '../src/services/tattoo.service';
import { supabaseAdmin } from '../src/config/supabase';
import { TatuadorRecord } from '../types/tattoo.types';

describe('Adversarial Stress Test Suite: Milestone 11', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  // =========================================================================
  // SECTION 1: CURRENCY RESILIENCE & FALLBACK STRESS TESTS
  // =========================================================================
  describe('1. Currency Service Resilience & Fallback', () => {
    it('1.1 Should fallback to SEEDED_CURRENCIES when table is missing or DB errors', async () => {
      const res = await currencyService.getActiveCurrencies();
      assert.equal(res.success, true);
      assert.ok(Array.isArray(res.data));
      assert.equal(res.data.length, SEEDED_CURRENCIES.length);
      const codes = res.data.map(c => c.code);
      assert.deepEqual(codes.sort(), ['COP', 'EUR', 'MXN', 'PAB', 'USD'].sort());
    });

    it('1.2 Should fallback to SEEDED_CURRENCIES when database query returns empty array []', async () => {
      const mockService = new CurrencyService();
      // Temporarily mock supabaseAdmin.from for currencies
      const originalFrom = supabaseAdmin.from.bind(supabaseAdmin);
      (supabaseAdmin as any).from = (table: string) => {
        if (table === 'currencies') {
          return {
            select: () => ({
              eq: async () => ({ data: [], error: null }),
            }),
          };
        }
        return originalFrom(table);
      };

      try {
        const res = await mockService.getActiveCurrencies();
        assert.equal(res.success, true);
        assert.equal(res.data?.length, 5);
        assert.equal(res.data?.[0].code, 'USD');
      } finally {
        (supabaseAdmin as any).from = originalFrom;
      }
    });

    it('1.3 Should fallback to SEEDED_CURRENCIES when database throws an unhandled exception', async () => {
      const mockService = new CurrencyService();
      const originalFrom = supabaseAdmin.from.bind(supabaseAdmin);
      (supabaseAdmin as any).from = (table: string) => {
        if (table === 'currencies') {
          throw new Error('Fatal socket disconnect / network timeout');
        }
        return originalFrom(table);
      };

      try {
        const res = await mockService.getActiveCurrencies();
        assert.equal(res.success, true);
        assert.equal(res.data?.length, 5);
      } finally {
        (supabaseAdmin as any).from = originalFrom;
      }
    });

    it('1.4 GET /currencies HTTP endpoint returns 200 and standard format', async () => {
      const res = await fetch(`${baseUrl}/currencies`);
      assert.equal(res.status, 200);
      const json = await res.json() as any;
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.data));
      for (const curr of json.data) {
        assert.ok(curr.code, 'Currency code must be present');
        assert.ok(curr.symbol, 'Currency symbol must be present');
        assert.ok(typeof curr.rate_to_usd === 'number', 'Rate must be numeric');
        assert.ok(curr.rate_to_usd > 0, 'Rate must be positive');
      }
    });
  });

  // =========================================================================
  // SECTION 2: ACCENT, CASING & SPECIAL CHARACTER STRESS TESTS
  // =========================================================================
  describe('2. Query Filters: Diacritics, Casing & Adversarial Strings', () => {
    it('2.1 Accent invariance: Panamá vs panama vs PANAMÁ vs PaNaMa', async () => {
      const resAccent = await tattooService.getTattoPublicData(undefined, { country: 'Panamá' });
      const resNoAccent = await tattooService.getTattoPublicData(undefined, { country: 'panama' });
      const resUpper = await tattooService.getTattoPublicData(undefined, { country: 'PANAMÁ' });
      const resMixed = await tattooService.getTattoPublicData(undefined, { country: 'PaNaMa' });

      assert.equal(resAccent.success, true);
      assert.equal(resNoAccent.success, true);
      assert.equal(resUpper.success, true);
      assert.equal(resMixed.success, true);

      assert.equal(resAccent.data!.length, resNoAccent.data!.length);
      assert.equal(resAccent.data!.length, resUpper.data!.length);
      assert.equal(resAccent.data!.length, resMixed.data!.length);
      assert.ok(resAccent.data!.length > 0, 'Should match artists with country Panama');
    });

    it('2.2 Unicode NFC vs NFD normalization invariance', async () => {
      const nfc = 'Panam\u00E1'; // Precomposed "Panamá"
      const nfd = 'Panam\u0061\u0301'; // Decomposed "Panama" + combining acute

      const resNFC = await tattooService.getTattoPublicData(undefined, { country: nfc });
      const resNFD = await tattooService.getTattoPublicData(undefined, { country: nfd });

      assert.equal(resNFC.success, true);
      assert.equal(resNFD.success, true);
      assert.equal(resNFC.data!.length, resNFD.data!.length);
    });

    it('2.3 City accent invariance: Colón vs colon', async () => {
      const resAccent = await tattooService.getTattoPublicData(undefined, { city: 'Colón' });
      const resNoAccent = await tattooService.getTattoPublicData(undefined, { city: 'colon' });
      const resUpper = await tattooService.getTattoPublicData(undefined, { city: 'COLÓN' });

      assert.equal(resAccent.success, true);
      assert.equal(resNoAccent.success, true);
      assert.equal(resUpper.success, true);

      assert.equal(resAccent.data!.length, resNoAccent.data!.length);
      assert.equal(resAccent.data!.length, resUpper.data!.length);
      assert.ok(resAccent.data!.length > 0, 'Should match artists in Colón');
    });

    it('2.4 Style casing and accent invariance: Realista vs realista vs REALISTA', async () => {
      const resLower = await tattooService.getTattoPublicData(undefined, { style: 'realista' });
      const resUpper = await tattooService.getTattoPublicData(undefined, { style: 'REALISTA' });
      const resMixed = await tattooService.getTattoPublicData(undefined, { style: 'ReAlIsTa' });

      assert.equal(resLower.success, true);
      assert.equal(resUpper.success, true);
      assert.equal(resMixed.success, true);

      assert.equal(resLower.data!.length, resUpper.data!.length);
      assert.equal(resLower.data!.length, resMixed.data!.length);
      assert.ok(resLower.data!.length > 0, 'Should match realistic style artists');
    });

    it('2.5 Special characters, SQL metacharacters and regex symbols must not crash or inject', async () => {
      const adversarialInputs = [
        "' OR '1'='1",
        "'; DROP TABLE tatuadores_data; --",
        "\\",
        "([a-zA-Z0-9]+)*",
        ".*+?^$()[]{}|\\",
        "<script>alert('xss')</script>",
        "null",
        "undefined",
        "NaN",
        "%20",
        " \t\n ",
        "💥✨🎉",
      ];

      for (const input of adversarialInputs) {
        // Test via service
        const servRes = await tattooService.getTattoPublicData(undefined, {
          search: input,
          country: input,
          city: input,
          style: input,
        });
        assert.equal(servRes.success, true, `Service should succeed gracefully on: ${input}`);
        assert.ok(Array.isArray(servRes.data));

        // Test via HTTP GET endpoint
        const encoded = encodeURIComponent(input);
        const httpRes = await fetch(`${baseUrl}/gettatto?search=${encoded}&country=${encoded}`);
        assert.equal(httpRes.status, 200, `HTTP should return 200 on: ${input}`);
        const httpJson = await httpRes.json() as any;
        assert.equal(httpJson.success, true);
        assert.ok(Array.isArray(httpJson.data));
      }
    });
  });

  // =========================================================================
  // SECTION 3: PRICE FILTERING, BOUNDS & PARSING EDGE CASES
  // =========================================================================
  describe('3. Price Filtering Edge Cases & Extreme Bounds', () => {
    it('3.1 MinPrice = 0 should be treated as valid 0 threshold, not falsy/ignored', async () => {
      // In live DB artists currently have no price set (price is null)
      // When minPrice = 0 is applied, artists with null price should be excluded
      const allRes = await tattooService.getTattoPublicData();
      const min0Res = await tattooService.getTattoPublicData(undefined, { minPrice: 0 });

      assert.equal(allRes.success, true);
      assert.equal(min0Res.success, true);
      // Because live DB records have no price, price === null, so min0Res should be 0 records
      assert.equal(min0Res.data!.length, 0);
      assert.ok(allRes.data!.length > 0);
    });

    it('3.2 Inverted bounds (minPrice > maxPrice) returns empty array without error', async () => {
      const res = await tattooService.getTattoPublicData(undefined, { minPrice: 500, maxPrice: 100 });
      assert.equal(res.success, true);
      assert.equal(res.data!.length, 0);
    });

    it('3.3 Extreme numeric bounds (huge numbers, negative numbers)', async () => {
      const resHuge = await tattooService.getTattoPublicData(undefined, { minPrice: 1e12 });
      assert.equal(resHuge.success, true);
      assert.equal(resHuge.data!.length, 0);

      const resNeg = await tattooService.getTattoPublicData(undefined, { minPrice: -999999 });
      assert.equal(resNeg.success, true);
      assert.ok(Array.isArray(resNeg.data));
    });

    it('3.4 HTTP query string non-numeric prices do not crash the endpoint', async () => {
      const res = await fetch(`${baseUrl}/gettatto?minPrice=notanumber&maxPrice=invalid`);
      assert.equal(res.status, 200);
      const json = await res.json() as any;
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.data));
    });

    it('3.5 Synthetic artist price parsing resilience across formats', async () => {
      // Verify price parsing on simulated data with diverse shapes
      const mockArtists: TatuadorRecord[] = [
        { id: '1', data: { price: 100 }, created_at: '', updated_at: '' },
        { id: '2', data: { precio: '150.50' }, created_at: '', updated_at: '' },
        { id: '3', data: { min_price: '$200/hr' }, created_at: '', updated_at: '' },
        { id: '4', data: { minPrice: 0 }, created_at: '', updated_at: '' },
        { id: '5', data: { hourly_rate: -50 }, created_at: '', updated_at: '' },
        { id: '6', data: { price: 'Free' }, created_at: '', updated_at: '' },
        { id: '7', data: {}, created_at: '', updated_at: '' },
      ];

      // Test filter logic directly with custom service instance
      const originalFrom = supabaseAdmin.from.bind(supabaseAdmin);
      (supabaseAdmin as any).from = (table: string) => {
        if (table === 'tatuadores_data') {
          return {
            select: async () => ({ data: mockArtists, error: null }),
          };
        }
        if (table === 'user_profiles') {
          return {
            select: () => ({
              eq: () => ({ maybeSingle: async () => ({ data: null }) }),
            }),
          };
        }
        return originalFrom(table);
      };

      try {
        const testService = new TattooService();

        // minPrice = 100 should match #1 (100), #2 (150.50), #3 (200)
        const resMin100 = await testService.getTattoPublicData(undefined, { minPrice: 100 });
        assert.equal(resMin100.data!.length, 3);
        const ids100 = resMin100.data!.map(a => a.id);
        assert.deepEqual(ids100.sort(), ['1', '2', '3'].sort());

        // maxPrice = 100 should match #1 (100), #4 (0), #5 (-50)
        const resMax100 = await testService.getTattoPublicData(undefined, { maxPrice: 100 });
        assert.equal(resMax100.data!.length, 3);
        const idsMax100 = resMax100.data!.map(a => a.id);
        assert.deepEqual(idsMax100.sort(), ['1', '4', '5'].sort());

        // minPrice = 0 should match #1 (100), #2 (150.5), #3 (200), #4 (0)
        const resMin0 = await testService.getTattoPublicData(undefined, { minPrice: 0 });
        assert.equal(resMin0.data!.length, 4);

        // Sorting price_asc
        const resSortAsc = await testService.getTattoPublicData(undefined, { sort: 'price_asc' });
        const pricesAsc = resSortAsc.data!.map(a => a.id);
        assert.equal(pricesAsc[0], '5'); // -50 is lowest
        assert.equal(pricesAsc[1], '4'); // 0

        // Sorting price_desc
        const resSortDesc = await testService.getTattoPublicData(undefined, { sort: 'price_desc' });
        const pricesDesc = resSortDesc.data!.map(a => a.id);
        assert.equal(pricesDesc[0], '3'); // 200 is highest
      } finally {
        (supabaseAdmin as any).from = originalFrom;
      }
    });
  });

  // =========================================================================
  // SECTION 4: SANDBOX & TEST ACCOUNT ISOLATION TESTS
  // =========================================================================
  describe('4. Sandbox & Test Account Isolation Verification', () => {
    const REAL_USER_ID = 'real-user-uuid-1111';
    const TEST_USER_ID = '09ea4109-e17b-407a-b604-89ab725d9cbe'; // known test account in user_profiles

    it('4.1 Live DB: Anonymous user sees 1000 real artists, zero test accounts', async () => {
      const res = await tattooService.getTattoPublicData();
      assert.equal(res.success, true);
      assert.ok(res.data!.length > 0);
      for (const artist of res.data!) {
        assert.notEqual(artist.id, TEST_USER_ID);
        assert.notEqual(artist.data?.is_test_account, true);
      }
    });

    it('4.2 Live DB: Test user requester sees 0 real artists (isolated sandbox)', async () => {
      const res = await tattooService.getTattoPublicData(TEST_USER_ID);
      assert.equal(res.success, true);
      // Because there are no test artists currently in tatuadores_data,
      // test user gets [] and NONE of the 1000 real artists leak to them!
      assert.equal(res.data!.length, 0);
    });

    it('4.3 Bidirectional synthetic leak test with mixed real & test records', async () => {
      const mockProfiles = [
        { id: 'user_real_1', is_test_account: false },
        { id: 'user_test_1', is_test_account: true },
        { id: 'artist_real_1', is_test_account: false },
        { id: 'artist_test_1', is_test_account: true },
      ];

      const mockArtists: TatuadorRecord[] = [
        { id: 'artist_real_1', data: { nombre: 'Real Artist' }, created_at: '', updated_at: '' },
        { id: 'artist_test_1', data: { nombre: 'Test Artist' }, created_at: '', updated_at: '' },
      ];

      const originalFrom = supabaseAdmin.from.bind(supabaseAdmin);
      (supabaseAdmin as any).from = (table: string) => {
        if (table === 'tatuadores_data') {
          return {
            select: (cols: string) => ({
              eq: (_col: string, val: string) => ({
                maybeSingle: async () => ({
                  data: mockArtists.find(a => a.id === val) || null,
                  error: null,
                }),
              }),
              then: (fn: any) => Promise.resolve({ data: mockArtists, error: null }).then(fn),
              [Symbol.toStringTag]: 'Promise',
            }),
          };
        }
        if (table === 'user_profiles') {
          return {
            select: () => ({
              eq: (col: string, val: any) => {
                if (col === 'id') {
                  const found = mockProfiles.find(p => p.id === val);
                  return {
                    maybeSingle: async () => ({ data: found || null, error: null }),
                  };
                }
                if (col === 'is_test_account' && val === true) {
                  const testOnly = mockProfiles.filter(p => p.is_test_account);
                  return Promise.resolve({ data: testOnly, error: null });
                }
                return Promise.resolve({ data: [], error: null });
              },
            }),
          };
        }
        return originalFrom(table);
      };

      try {
        const testService = new TattooService();

        // 1. Anonymous user catalog
        const anonRes = await testService.getTattoPublicData();
        assert.equal(anonRes.data!.length, 1);
        assert.equal(anonRes.data![0].id, 'artist_real_1');

        // 2. Real user catalog
        const realRes = await testService.getTattoPublicData('user_real_1');
        assert.equal(realRes.data!.length, 1);
        assert.equal(realRes.data![0].id, 'artist_real_1');

        // 3. Test user catalog
        const testRes = await testService.getTattoPublicData('user_test_1');
        assert.equal(testRes.data!.length, 1);
        assert.equal(testRes.data![0].id, 'artist_test_1');

        // 4. getTattoById: Real user querying real artist -> SUCCESS
        const r2r = await testService.getTattoById('artist_real_1', 'user_real_1');
        assert.equal(r2r.success, true);
        assert.equal(r2r.data?.id, 'artist_real_1');

        // 5. getTattoById: Anonymous user querying test artist -> 404 / NOT FOUND (NO LEAK)
        const a2t = await testService.getTattoById('artist_test_1', undefined);
        assert.equal(a2t.success, false);
        assert.equal(a2t.error, 'Artist not found');

        // 6. getTattoById: Real user querying test artist -> 404 / NOT FOUND (NO LEAK)
        const r2t = await testService.getTattoById('artist_test_1', 'user_real_1');
        assert.equal(r2t.success, false);
        assert.equal(r2t.error, 'Artist not found');

        // 7. getTattoById: Test user querying real artist -> 404 / NOT FOUND (NO LEAK)
        const t2r = await testService.getTattoById('artist_real_1', 'user_test_1');
        assert.equal(t2r.success, false);
        assert.equal(t2r.error, 'Artist not found');

        // 8. getTattoById: Test user querying test artist -> SUCCESS
        const t2t = await testService.getTattoById('artist_test_1', 'user_test_1');
        assert.equal(t2t.success, true);
        assert.equal(t2t.data?.id, 'artist_test_1');
      } finally {
        (supabaseAdmin as any).from = originalFrom;
      }
    });
  });
});
