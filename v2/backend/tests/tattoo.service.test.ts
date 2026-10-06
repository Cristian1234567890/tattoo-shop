import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { tattooService } from '../src/services/tattoo.service';

describe('TattooService Query Filters Unit Tests', () => {
  it('should return all public artists when no filters provided', async () => {
    const result = await tattooService.getTattoPublicData();
    assert.equal(result.success, true);
    assert.ok(Array.isArray(result.data), 'Expected data to be an array');
  });

  it('should filter artists by country (case and accent insensitive)', async () => {
    const all = await tattooService.getTattoPublicData();
    assert.equal(all.success, true);

    const panamaResult = await tattooService.getTattoPublicData(undefined, { country: 'Panama' });
    assert.equal(panamaResult.success, true);
    for (const artist of panamaResult.data!) {
      const country = (artist.data?.country || artist.data?.pais || '').toLowerCase();
      assert.ok(country.includes('panam') || country.includes('panama'), `Unexpected country: ${country}`);
    }

    const panamaAccents = await tattooService.getTattoPublicData(undefined, { country: 'Panamá' });
    assert.equal(panamaAccents.success, true);
    assert.equal(panamaResult.data!.length, panamaAccents.data!.length);
  });

  it('should filter artists by city', async () => {
    const result = await tattooService.getTattoPublicData(undefined, { city: 'Panamá' });
    assert.equal(result.success, true);
    for (const artist of result.data!) {
      const city = (artist.data?.city || artist.data?.ciudad || artist.data?.provincia || '').toLowerCase();
      assert.ok(city.includes('panam') || city.length === 0, `Expected city to match: ${city}`);
    }
  });

  it('should filter artists by style / work_type', async () => {
    const result = await tattooService.getTattoPublicData(undefined, { style: 'realis' });
    assert.equal(result.success, true);
    for (const artist of result.data!) {
      const style = (artist.data?.work_type || artist.data?.style || '').toLowerCase();
      assert.ok(style.includes('realis'), `Expected style to match: ${style}`);
    }
  });

  it('should filter artists by currency', async () => {
    const resultUSD = await tattooService.getTattoPublicData(undefined, { currency: 'USD' });
    assert.equal(resultUSD.success, true);
    for (const artist of resultUSD.data!) {
      const curr = (artist.data?.currency || 'USD').toUpperCase();
      assert.equal(curr, 'USD');
    }
  });

  it('should filter artists by minPrice and maxPrice', async () => {
    const result = await tattooService.getTattoPublicData(undefined, { minPrice: 20, maxPrice: 300 });
    assert.equal(result.success, true);
    for (const artist of result.data!) {
      const val = artist.data?.price ?? artist.data?.precio ?? artist.data?.min_price;
      if (val !== undefined && val !== null) {
        const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) {
          assert.ok(num >= 20, `Price ${num} should be >= 20`);
          assert.ok(num <= 300, `Price ${num} should be <= 300`);
        }
      }
    }
  });

  it('should filter artists using general search query', async () => {
    const result = await tattooService.getTattoPublicData(undefined, { search: 'a' });
    assert.equal(result.success, true);
    assert.ok(Array.isArray(result.data));
  });

  it('should sort artists by name_asc correctly', async () => {
    const result = await tattooService.getTattoPublicData(undefined, { sort: 'name_asc' });
    assert.equal(result.success, true);
    const artists = result.data!;
    if (artists.length >= 2) {
      for (let i = 0; i < artists.length - 1; i++) {
        const nameA = `${artists[i].data?.nombre || ''} ${artists[i].data?.apellido || ''}`.trim();
        const nameB = `${artists[i + 1].data?.nombre || ''} ${artists[i + 1].data?.apellido || ''}`.trim();
        assert.ok(nameA.localeCompare(nameB) <= 0, `Expected "${nameA}" <= "${nameB}"`);
      }
    }
  });

  it('should paginate artists using limit and offset', async () => {
    const all = await tattooService.getTattoPublicData();
    assert.equal(all.success, true);
    const total = all.data!.length;

    if (total >= 2) {
      const paginated = await tattooService.getTattoPublicData(undefined, { limit: 1, offset: 0 });
      assert.equal(paginated.success, true);
      assert.equal(paginated.data!.length, 1);
      assert.equal(paginated.data![0].id, all.data![0].id);

      const secondPage = await tattooService.getTattoPublicData(undefined, { limit: 1, offset: 1 });
      assert.equal(secondPage.success, true);
      assert.equal(secondPage.data!.length, 1);
      assert.equal(secondPage.data![0].id, all.data![1].id);
    }
  });

  it('should isolate sandbox test accounts from anonymous and real users', async () => {
    const realUsersView = await tattooService.getTattoPublicData();
    assert.equal(realUsersView.success, true);
    // Real view should not return accounts flagged as is_test_account
    for (const a of realUsersView.data!) {
      assert.notEqual(a.data?.is_test_account, true);
    }
  });
});
