import sharp, { Metadata, Sharp } from 'sharp';

export interface OptimizeImageOptions {
  maxWidth?: number;
  quality?: number;
}

export interface OptimizedImageResult {
  buffer: Buffer;
  contentType: 'image/webp';
  format: 'webp';
  width?: number;
  height?: number;
  originalSize: number;
  optimizedSize: number;
}

/**
 * Strips data URI header and decodes base64 string into a Node Buffer.
 */
export function decodeBase64Image(data: string): Buffer {
  if (!data || typeof data !== 'string') {
    throw new Error('Image data is required and must be a string');
  }

  let cleanData = data.trim();
  if (cleanData.startsWith('data:')) {
    const commaIndex = cleanData.indexOf(',');
    if (commaIndex !== -1) {
      cleanData = cleanData.substring(commaIndex + 1).trim();
    }
  }

  if (!cleanData) {
    throw new Error('Empty base64 image data');
  }

  const buffer = Buffer.from(cleanData, 'base64');
  if (buffer.length === 0) {
    throw new Error('Invalid base64 encoding or empty buffer');
  }

  return buffer;
}

/**
 * Validates, resizes to a maximum width (default 800px), compresses,
 * and converts any supported image format to WebP.
 * 
 * - Preserves aspect ratio
 * - Avoids upscaling images smaller than maxWidth
 * - Corrects EXIF rotation
 * - Strips unnecessary metadata to minimize payload size
 */
export async function optimizeImageToWebp(
  input: Buffer | Uint8Array | ArrayBuffer,
  options: OptimizeImageOptions = {}
): Promise<OptimizedImageResult> {
  const maxWidth = options.maxWidth ?? 800;
  const quality = options.quality ?? 80;

  const nodeBuffer = Buffer.isBuffer(input) ? input : Buffer.from(input as any);

  if (!nodeBuffer || nodeBuffer.length === 0) {
    throw new Error('Image buffer is empty');
  }

  let sharpInstance: Sharp;
  let metadata: Metadata;
  try {
    sharpInstance = sharp(nodeBuffer);
    metadata = await sharpInstance.metadata();
  } catch {
    throw new Error('Unsupported or corrupted image format');
  }

  if (!metadata || !metadata.format) {
    throw new Error('Unsupported or corrupted image format');
  }

  const processedBuffer = await sharpInstance
    .rotate() // Auto-orient based on EXIF
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
      fit: 'inside',
    })
    .webp({
      quality,
      effort: 4,
    })
    .toBuffer();

  const processedMeta = await sharp(processedBuffer).metadata();

  return {
    buffer: processedBuffer,
    contentType: 'image/webp',
    format: 'webp',
    width: processedMeta.width,
    height: processedMeta.height,
    originalSize: nodeBuffer.length,
    optimizedSize: processedBuffer.length,
  };
}
