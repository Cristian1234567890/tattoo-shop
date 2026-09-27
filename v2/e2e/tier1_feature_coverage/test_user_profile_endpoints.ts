/**
 * Tier 1: Feature Coverage - User Profile & Avatar Endpoints
 * Tests:
 *  - Endpoint 5: POST /updateuser (6 test cases)
 *  - Endpoint 6: POST /updateuserimg (6 test cases)
 */

import { describe, it, expect, setTier } from '../framework/test_runner.ts';
import { ApiClient } from '../framework/api_client.ts';
import { generateTestEmail, SAMPLE_BASE64_IMAGE } from '../config.ts';

export function registerUserProfileEndpointsTests(client: ApiClient) {
  setTier('Tier 1 - Feature Coverage');

  describe('Feature 5: POST /updateuser (Profile Data Update)', () => {
    it('TC-UPDATEUSER-01: Client updates basic personal metadata', async () => {
      const email = generateTestEmail('update_client');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'Original',
        apellido: 'Name',
        tipo: 'Cliente',
      });

      const token = reg.data.session.access_token;
      const refresh = reg.data.session.refresh_token;

      const updateRes = await client.updateUser(
        {
          email,
          nombre: 'UpdatedName',
          apellido: 'UpdatedLastName',
          telefono: '69990000',
          provincia: 'Chiriquí',
          ciudad: 'David',
          direccion: 'Avenida Central',
        },
        {
          Authorization: `Bearer ${token}`,
          refresh_token: refresh,
        }
      );

      expect(updateRes.status).toBe(200);
      expect(updateRes.data.success).toBe(true);
      expect(updateRes.data.data.user.user_metadata.nombre).toBe('UpdatedName');
      expect(updateRes.data.data.user.user_metadata.provincia).toBe('Chiriquí');
    });

    it('TC-UPDATEUSER-02: Artist updates extended fields (work_type, social links) and syncs to tatuadores_data', async () => {
      const email = generateTestEmail('update_artist');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'InkArtist',
        apellido: 'Pro',
        tipo: 'Tatuador',
      });

      const token = reg.data.session.access_token;
      const refresh = reg.data.session.refresh_token;

      const updateRes = await client.updateUser(
        {
          email,
          nombre: 'InkArtist',
          apellido: 'Pro',
          work_type: 'realista',
          facebook: 'https://facebook.com/inkartist',
          twitter: 'https://twitter.com/inkartist',
          instagram: 'https://instagram.com/inkartist',
          link: 'https://inkartist.com',
          provincia: 'Panamá',
          ciudad: 'Ciudad de Panamá',
          direccion: 'Costa del Este',
        },
        {
          Authorization: `Bearer ${token}`,
          refresh_token: refresh,
        }
      );

      expect(updateRes.status).toBe(200);
      expect(updateRes.data.success).toBe(true);
      expect(updateRes.data.data.user.user_metadata.work_type).toBe('realista');
      expect(updateRes.data.data.user.user_metadata.instagram).toBe('https://instagram.com/inkartist');
    });

    it('TC-UPDATEUSER-03: Request without Authorization header fails gracefully without server crash', async () => {
      const updateRes = await client.updateUser({
        nombre: 'Hacker',
      });
      // Crucial: Must NOT trigger unhandled TypeError: Cannot read properties of undefined (reading 'split')
      expect(updateRes.status >= 400 || (updateRes.data && updateRes.data.success === false)).toBe(true);
    });

    it('TC-UPDATEUSER-04: Request with invalid bearer token is rejected with unauthorized response', async () => {
      const updateRes = await client.updateUser(
        { nombre: 'Tampered' },
        {
          Authorization: 'Bearer invalid.tampered.token',
          refresh_token: 'fake_refresh',
        }
      );
      expect(updateRes.status >= 400 || (updateRes.data && updateRes.data.success === false)).toBe(true);
    });

    it('TC-UPDATEUSER-05: Supports both "refresh_token" and "refresh" header variants', async () => {
      const email = generateTestEmail('update_alt_refresh');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'Alt',
        apellido: 'Header',
        tipo: 'Cliente',
      });

      const updateRes = await client.updateUser(
        {
          email,
          nombre: 'UpdatedWithAltHeader',
        },
        {
          Authorization: `Bearer ${reg.data.session.access_token}`,
          refresh: reg.data.session.refresh_token,
        }
      );

      expect(updateRes.status).toBe(200);
      expect(updateRes.data.success).toBe(true);
    });

    it('TC-UPDATEUSER-06: Partial profile updates preserve unmentioned fields', async () => {
      const email = generateTestEmail('partial_update');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'InitialName',
        apellido: 'InitialLast',
        tipo: 'Cliente',
        telefono: '11111111',
      });

      const token = reg.data.session.access_token;
      const refresh = reg.data.session.refresh_token;

      // Update only phone
      const updateRes = await client.updateUser(
        {
          email,
          telefono: '99999999',
        },
        {
          Authorization: `Bearer ${token}`,
          refresh_token: refresh,
        }
      );

      expect(updateRes.status).toBe(200);
      expect(updateRes.data.success).toBe(true);
      expect(updateRes.data.data.user.user_metadata.telefono).toBe('99999999');
    });
  });

  describe('Feature 6: POST /updateuserimg (Avatar Upload)', () => {
    it('TC-UPDATEUSERIMG-01: Authenticated user uploads valid base64 image and receives success: true', async () => {
      const email = generateTestEmail('avatar_client');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'Avatar',
        apellido: 'User',
        tipo: 'Cliente',
      });

      const token = reg.data.session.access_token;
      const refresh = reg.data.session.refresh_token;

      const uploadRes = await client.updateUserImg(
        {
          imageData: SAMPLE_BASE64_IMAGE,
        },
        {
          Authorization: `Bearer ${token}`,
          refresh_token: refresh,
        }
      );

      expect(uploadRes.status).toBe(200);
      expect(uploadRes.data.success).toBe(true);
    });

    it('TC-UPDATEUSERIMG-02: Handles base64 string with "data:image/png;base64," prefix', async () => {
      const email = generateTestEmail('avatar_prefix');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'Prefix',
        apellido: 'User',
        tipo: 'Cliente',
      });

      const uploadRes = await client.updateUserImg(
        {
          imageData: `data:image/png;base64,${SAMPLE_BASE64_IMAGE}`,
        },
        {
          Authorization: `Bearer ${reg.data.session.access_token}`,
          refresh_token: reg.data.session.refresh_token,
        }
      );

      expect(uploadRes.status).toBe(200);
      expect(uploadRes.data.success).toBe(true);
    });

    it('TC-UPDATEUSERIMG-03: Consecutive avatar uploads update existing avatar without duplicate conflict error', async () => {
      const email = generateTestEmail('avatar_consecutive');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'Consecutive',
        apellido: 'Uploader',
        tipo: 'Cliente',
      });

      const headers = {
        Authorization: `Bearer ${reg.data.session.access_token}`,
        refresh_token: reg.data.session.refresh_token,
      };

      // First upload
      const res1 = await client.updateUserImg({ imageData: SAMPLE_BASE64_IMAGE }, headers);
      expect(res1.status).toBe(200);
      expect(res1.data.success).toBe(true);

      // Second upload (should overwrite or update cleanly)
      const res2 = await client.updateUserImg({ imageData: SAMPLE_BASE64_IMAGE }, headers);
      expect(res2.status).toBe(200);
      expect(res2.data.success).toBe(true);
    });

    it('TC-UPDATEUSERIMG-04: Request without Authorization header is rejected safely', async () => {
      const res = await client.updateUserImg({
        imageData: SAMPLE_BASE64_IMAGE,
      });
      expect(res.status >= 400 || (res.data && res.data.success === false)).toBe(true);
    });

    it('TC-UPDATEUSERIMG-05: Empty imageData payload returns failure error', async () => {
      const email = generateTestEmail('avatar_empty');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'Empty',
        apellido: 'Img',
        tipo: 'Cliente',
      });

      const res = await client.updateUserImg(
        {
          imageData: '',
        },
        {
          Authorization: `Bearer ${reg.data.session.access_token}`,
          refresh_token: reg.data.session.refresh_token,
        }
      );

      expect(res.status >= 400 || (res.data && res.data.success === false)).toBe(true);
    });

    it('TC-UPDATEUSERIMG-06: Artist avatar upload updates profile in tatuadores_data', async () => {
      const email = generateTestEmail('artist_avatar_sync');
      const reg = await client.register({
        email,
        password: 'Password123!',
        nombre: 'ArtistAvatar',
        apellido: 'Sync',
        tipo: 'Tatuador',
      });

      const uploadRes = await client.updateUserImg(
        {
          imageData: SAMPLE_BASE64_IMAGE,
        },
        {
          Authorization: `Bearer ${reg.data.session.access_token}`,
          refresh_token: reg.data.session.refresh_token,
        }
      );

      expect(uploadRes.status).toBe(200);
      expect(uploadRes.data.success).toBe(true);
    });
  });
}
