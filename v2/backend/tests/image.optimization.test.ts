import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { optimizeImageToWebp, decodeBase64Image } from '../src/utils/image.util';
import { userService } from '../src/services/user.service';
import { supabaseAdmin } from '../src/config/supabase';

describe('Image Optimization Service & Upload Hardening', () => {
  it('1. optimizeImageToWebp resizes wide image (>800px) down to 800px and converts to WebP', async () => {
    // Generate a 1200x800 test PNG
    const originalBuffer = await sharp({
      create: {
        width: 1200,
        height: 800,
        channels: 4,
        background: { r: 50, g: 150, b: 200, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const result = await optimizeImageToWebp(originalBuffer, { maxWidth: 800, quality: 80 });

    assert.equal(result.format, 'webp');
    assert.equal(result.contentType, 'image/webp');
    assert.equal(result.width, 800);
    // Aspect ratio preserved: 1200x800 -> 800x533
    assert.equal(Math.round(result.height || 0), 533);
    assert.ok(result.optimizedSize > 0);
  });

  it('2. optimizeImageToWebp does NOT upscale images smaller than 800px', async () => {
    // Generate a 400x300 test PNG
    const smallBuffer = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 4,
        background: { r: 200, g: 50, b: 50, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const result = await optimizeImageToWebp(smallBuffer, { maxWidth: 800, quality: 80 });

    assert.equal(result.format, 'webp');
    assert.equal(result.contentType, 'image/webp');
    assert.equal(result.width, 400);
    assert.equal(result.height, 300);
  });

  it('3. decodeBase64Image correctly strips data URI prefix and decodes bytes', async () => {
    const rawBuffer = Buffer.from('hello-image-bytes');
    const base64Str = rawBuffer.toString('base64');
    const withPrefix = `data:image/png;base64,${base64Str}`;

    const decoded = decodeBase64Image(withPrefix);
    assert.deepEqual(decoded, rawBuffer);

    const decodedPlain = decodeBase64Image(base64Str);
    assert.deepEqual(decodedPlain, rawBuffer);
  });

  it('4. decodeBase64Image rejects empty or non-string inputs', () => {
    assert.throws(() => decodeBase64Image(''), /Image data is required/);
    assert.throws(() => decodeBase64Image(null as any), /Image data is required/);
    assert.throws(() => decodeBase64Image('data:image/png;base64,'), /Empty base64/);
  });

  it('5. optimizeImageToWebp rejects corrupted or arbitrary text buffers', async () => {
    const junkBuffer = Buffer.from('Not an image at all, just plain text payload');
    await assert.rejects(
      async () => optimizeImageToWebp(junkBuffer),
      /Unsupported or corrupted image format/
    );
  });

  it('6. UserService.updateUserImg validates malformed or non-image payload safely', async () => {
    const mockUser: any = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test@example.com',
      user_metadata: {},
    };

    const resMalformed = await userService.updateUserImg(
      'NOT_BASE64_CORRUPT',
      mockUser,
      'fake-token'
    );

    assert.equal(resMalformed.success, false);
    assert.ok(resMalformed.error);
  });

  it('7. UserService.updateUserImg uploads WebP with content-type image/webp and profile.webp path', async () => {
    // Generate valid test PNG image in base64
    const validPngBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 10, g: 20, b: 30, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const base64Img = `data:image/png;base64,${validPngBuffer.toString('base64')}`;

    // Track calls to supabaseAdmin.storage
    let uploadedPath = '';
    let uploadedContentType = '';
    let signedUrlRequestedPath = '';

    const originalFrom = supabaseAdmin.storage.from.bind(supabaseAdmin.storage);
    (supabaseAdmin.storage as any).from = (bucket: string) => {
      const bucketInstance = originalFrom(bucket);
      return {
        ...bucketInstance,
        upload: async (path: string, body: any, options: any) => {
          uploadedPath = path;
          uploadedContentType = options?.contentType;
          return { data: { path }, error: null };
        },
        update: async (path: string, body: any, options: any) => {
          uploadedPath = path;
          uploadedContentType = options?.contentType;
          return { data: { path }, error: null };
        },
        createSignedUrl: async (path: string, expiresIn: number) => {
          signedUrlRequestedPath = path;
          return {
            data: { signedUrl: `https://mock-storage.supabase.co/${bucket}/${path}?token=mock` },
            error: null,
          };
        },
        remove: async (paths: string[]) => {
          return { data: paths, error: null };
        },
      };
    };

    try {
      const mockUser: any = {
        id: '11111111-2222-3333-4444-555555555555',
        email: 'artist@example.com',
        user_metadata: { tipo: 'Cliente' },
      };

      const res = await userService.updateUserImg(
        base64Img,
        mockUser,
        'mock-valid-token'
      );

      assert.equal(res.success, true);
      assert.equal(uploadedPath, '11111111-2222-3333-4444-555555555555/profile.webp');
      assert.equal(uploadedContentType, 'image/webp');
      assert.equal(signedUrlRequestedPath, '11111111-2222-3333-4444-555555555555/profile.webp');
    } finally {
      (supabaseAdmin.storage as any).from = originalFrom;
    }
  });
});
