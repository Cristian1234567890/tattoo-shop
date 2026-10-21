import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../src/app';
import { StudioService } from '../src/services/studio.service';

describe('Studio Management, Multi-Studio, Certification, Ratings & Coupons Suite', () => {
  let server: http.Server;
  let baseUrl: string;
  let studioService: StudioService;

  before(async () => {
    studioService = new StudioService();
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

  beforeEach(() => {
    studioService.resetRuntimeStudios();
  });

  describe('1. Studio Registration & Duplicate Name Validation', () => {
    it('1.1 should create a studio with unique studio_code and opening_hours', async () => {
      const studio = await studioService.createStudio(
        {
          name: 'Cyberpunk Flash House',
          address: 'Calle 50, Obarrio',
          city: 'Ciudad de Panamá',
          lat: 8.985,
          lng: -79.515,
          phone: '+507 68889999',
          description: 'Especialistas en estilo ciberpunk y tintas fluorescentes.',
          opening_hours: {
            mon: '10:00 - 20:00',
            tue: '10:00 - 20:00',
            wed: '10:00 - 20:00',
            thu: '10:00 - 20:00',
            fri: '10:00 - 22:00',
            sat: '11:00 - 20:00',
            sun: 'Cerrado',
          },
        },
        'artist-user-1'
      );

      assert.ok(studio.id);
      assert.ok(studio.studio_code.startsWith('STD-'));
      assert.equal(studio.name, 'Cyberpunk Flash House');
      assert.equal(studio.owner_id, 'artist-user-1');
      assert.equal(studio.lat, 8.985);
      assert.equal(studio.lng, -79.515);
      assert.equal(studio.opening_hours?.fri, '10:00 - 22:00');
    });

    it('1.2 should reject duplicate studio names (case and diacritic invariant)', async () => {
      await assert.rejects(
        async () => {
          await studioService.createStudio(
            {
              name: 'OBSIDIAN ATELIER & FLASH LAB',
              address: 'Otra direccion',
            },
            'artist-user-2'
          );
        },
        {
          message: /Ya existe un estudio registrado con el nombre/i,
        }
      );
    });

    it('1.3 should allow an artist to create multiple studios (1:N relationship)', async () => {
      const studio1 = await studioService.createStudio(
        {
          name: 'Ink Master Studio Alpha',
          address: 'El Cangrejo',
        },
        'artist-owner-multi'
      );

      const studio2 = await studioService.createStudio(
        {
          name: 'Ink Master Studio Beta',
          address: 'Costa del Este',
        },
        'artist-owner-multi'
      );

      assert.ok(studio1.id);
      assert.ok(studio2.id);
      assert.notEqual(studio1.id, studio2.id);
      assert.notEqual(studio1.studio_code, studio2.studio_code);
      assert.equal(studio1.owner_id, 'artist-owner-multi');
      assert.equal(studio2.owner_id, 'artist-owner-multi');
    });

    it('1.4 should reject studio names without sufficient alphanumeric characters', async () => {
      await assert.rejects(
        async () => {
          await studioService.createStudio(
            {
              name: '!!! ???',
              address: 'Calle 50',
            },
            'artist-symbols'
          );
        },
        {
          message: /al menos 2 caracteres alfanuméricos/i,
        }
      );
    });

    it('1.5 should reject out-of-bounds geographic coordinates', async () => {
      await assert.rejects(
        async () => {
          await studioService.createStudio(
            {
              name: 'Space Orbit Ink',
              address: 'Espacio Exterior',
              lat: 120.5,
              lng: -200.0,
            },
            'artist-space'
          );
        },
        {
          message: /fuera del rango válido/i,
        }
      );
    });
  });

  describe('2. Collaborator Association & Security (Studio ID)', () => {
    it('2.1 should associate collaborator using valid Studio ID (studio_code)', async () => {
      const result = await studioService.joinStudio('STD-OBSID01', {
        id: 'new-collaborator-1',
        name: 'Carlos Ink',
        specialties: ['Blackwork', 'Fineline'],
      });

      assert.equal(result.success, true);
      const joined = result.studio.residents?.find((r) => r.id === 'new-collaborator-1');
      assert.ok(joined);
      assert.equal(joined.name, 'Carlos Ink');
    });

    it('2.2 should reject invalid studio codes', async () => {
      await assert.rejects(
        async () => {
          await studioService.joinStudio('STD-INVALIDO99', {
            id: 'fake-artist',
            name: 'Fake Artist',
          });
        },
        {
          message: /Código de Estudio no es válido/i,
        }
      );
    });
  });

  describe('3. Ownership Transfer & Safe Studio Deletion', () => {
    it('3.1 should transfer studio ownership to another artist when performed by owner', async () => {
      const created = await studioService.createStudio(
        {
          name: 'Transferable Art Lounge',
          address: 'Marbella, Calle 54',
        },
        'original-owner'
      );

      const transferred = await studioService.transferOwnership(
        created.id,
        'new-owner-mateo',
        'original-owner'
      );

      assert.equal(transferred.owner_id, 'new-owner-mateo');
    });

    it('3.2 should forbid non-owners from transferring studio ownership', async () => {
      await assert.rejects(
        async () => {
          await studioService.transferOwnership('obsidian', 'impostor', 'not-the-owner');
        },
        {
          message: /Solo el propietario actual puede transferir la titularidad/i,
        }
      );
    });

    it('3.3 deleting a studio must disassociate artists without deleting their accounts', async () => {
      const created = await studioService.createStudio(
        {
          name: 'Temporary Studio Collective',
          address: 'Paitilla',
        },
        'temp-owner'
      );

      await studioService.joinStudio(created.studio_code, {
        id: 'resident-artist-stays-alive',
        name: 'Artista Que No Debe Ser Borrado',
      });

      const delResult = await studioService.deleteStudio(created.id, 'temp-owner');
      assert.equal(delResult.success, true);

      // Verify studio is gone
      const checkStudio = await studioService.getStudioById(created.id);
      assert.equal(checkStudio, null);
    });
  });

  describe('4. Ratings, Reviews & Star Filtering (1 to 5 Stars)', () => {
    it('4.1 should allow client to rate a studio with stars (1-5) and comment', async () => {
      const res = await studioService.addReview('obsidian', 'client-valeria', {
        rating: 5,
        comment: 'Trabajo excepcional de los artistas residentes.',
        clientName: 'Valeria Gómez',
      });

      assert.equal(res.success, true);
      assert.equal(res.review.rating, 5);
      assert.ok(res.updatedRating >= 4.9);
      assert.ok(res.reviewCount >= 3);
    });

    it('4.2 should reject invalid star ratings (<1 or >5)', async () => {
      await assert.rejects(
        async () => {
          await studioService.addReview('obsidian', 'client-bad', {
            rating: 6,
            comment: 'Puntuación fuera de rango',
          });
        },
        {
          message: /entre 1 y 5 estrellas/i,
        }
      );
    });

    it('4.3 should filter studios by minimum rating', async () => {
      const highRated = await studioService.getStudios({ minRating: 4.8 });
      assert.ok(highRated.length > 0);
      highRated.forEach((st) => {
        assert.ok(st.rating >= 4.8);
      });
    });
  });

  describe('5. Promotional Coupons Redemption', () => {
    it('5.1 should validate active coupons and return discount percentage', () => {
      const res10 = studioService.validateCoupon('TATTOO10');
      assert.equal(res10.valid, true);
      assert.equal(res10.discount_percentage, 10);

      const res50 = studioService.validateCoupon('VIP50', 'subscription');
      assert.equal(res50.valid, true);
      assert.equal(res50.discount_percentage, 50);

      const res20 = studioService.validateCoupon('PROMO20', 'product');
      assert.equal(res20.valid, true);
      assert.equal(res20.discount_percentage, 20);
    });

    it('5.2 should reject invalid or expired coupon codes', () => {
      const bad = studioService.validateCoupon('NOEXISTE99');
      assert.equal(bad.valid, false);
      assert.equal(bad.discount_percentage, 0);
    });
  });

  describe('6. HTTP Endpoints', () => {
    it('GET /studios should return 200 and studio list', async () => {
      const res = await fetch(`${baseUrl}/studios`);
      assert.equal(res.status, 200);
      const body = (await res.json()) as { success: boolean; data: any[] };
      assert.equal(body.success, true);
      assert.ok(body.data.length >= 3);
    });

    it('POST /coupons/validate should validate coupon via API', async () => {
      const res = await fetch(`${baseUrl}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'TATTOOHUB' }),
      });
      assert.equal(res.status, 200);
      const body = (await res.json()) as { success: boolean; data: any };
      assert.equal(body.success, true);
      assert.equal(body.data.discount_percentage, 15);
    });
  });
});
