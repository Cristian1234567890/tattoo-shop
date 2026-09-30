import { supabase } from '../api/supabase';

export const PROGRESS_BUCKET = 'tattoo-progress';

export interface UploadProgressResult {
  path: string;
  publicUrl: string;
  error?: any;
}

/**
 * Uploads a tattoo progress photo directly to Supabase Storage bucket 'tattoo-progress'.
 * Uses the user-specific directory structure required by RLS: `${userId}/${timestamp}-${uuid}.${ext}`
 */
export async function uploadTattooProgressPhoto(
  file: File,
  userId: string
): Promise<UploadProgressResult> {
  if (!userId) {
    throw new Error('User ID is required for storage upload');
  }

  // Derive file extension
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${userId}/${cleanFileName}`;

  const { error } = await supabase.storage
    .from(PROGRESS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });

  if (error) {
    return {
      path: '',
      publicUrl: '',
      error,
    };
  }

  const { data: urlData } = supabase.storage
    .from(PROGRESS_BUCKET)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: urlData.publicUrl,
  };
}

/**
 * Retrieves the public CDN URL for a given path inside the 'tattoo-progress' bucket.
 */
export function getPublicProgressUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const { data } = supabase.storage.from(PROGRESS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Deletes a tattoo progress photo from the 'tattoo-progress' bucket.
 */
export async function deleteProgressPhoto(path: string): Promise<{ success: boolean; error?: any }> {
  if (!path) return { success: true };
  const { error } = await supabase.storage.from(PROGRESS_BUCKET).remove([path]);
  if (error) {
    return { success: false, error };
  }
  return { success: true };
}
