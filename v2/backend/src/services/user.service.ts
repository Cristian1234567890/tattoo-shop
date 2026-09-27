import { decode } from 'base64-arraybuffer';
import { User } from '@supabase/supabase-js';
import { supabaseAdmin, createScopedClient } from '../config/supabase';
import { ApiResponse } from '../types/api.types';
import { UpdateUserDTO } from '../types/auth.types';

export class UserService {
  async updateUser(
    userData: UpdateUserDTO,
    user: User,
    token: string,
    refresh?: string
  ): Promise<ApiResponse> {
    const updatedMetadata = {
      ...(user.user_metadata || {}),
      ...userData,
    };

    // Try updating via scoped client
    let updatedUser: User | null = null;
    try {
      const client = createScopedClient(token);
      if (refresh) {
        await client.auth
          .setSession({ access_token: token, refresh_token: refresh })
          .catch(() => {});
      }
      const { data, error } = await client.auth.updateUser({
        data: userData,
      });
      if (!error && data?.user) {
        updatedUser = data.user;
      }
    } catch {
      // Fallback to admin update
    }

    // Always persist via admin client (bypasses public GoTrue rate limiting)
    const { data: adminData, error: adminError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: updatedMetadata,
      });

    if (adminError && !updatedUser) {
      return { success: false, error: adminError };
    }

    const finalUser = updatedUser || adminData?.user || {
      ...user,
      user_metadata: updatedMetadata,
    };

    // If user is a tattoo artist, synchronize with public.tatuadores_data
    const isArtist =
      user.user_metadata?.tipo === 'Tatuador' ||
      userData.tipo === 'Tatuador' ||
      (finalUser as any).user_metadata?.tipo === 'Tatuador';

    if (isArtist) {
      const { data: existingArtist } = await supabaseAdmin
        .from('tatuadores_data')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const merged = {
        ...(existingArtist?.data || {}),
        ...userData,
      };

      const { error: error_update } = await supabaseAdmin
        .from('tatuadores_data')
        .upsert({ id: user.id, data: merged });

      if (error_update) {
        return { success: false, error_update };
      }
    }

    return {
      success: true,
      data: {
        user: {
          ...finalUser,
          user_metadata: updatedMetadata,
        },
      },
    };
  }

  async updateUserImg(
    imageData: string | undefined,
    user: User,
    token: string,
    refresh?: string
  ): Promise<ApiResponse> {
    if (!imageData || typeof imageData !== 'string') {
      return {
        success: false,
        error: { message: 'imageData is required and must be a base64 string' },
      };
    }

    let rawBase64 = imageData.trim();
    if (rawBase64.startsWith('data:')) {
      const commaIdx = rawBase64.indexOf(',');
      if (commaIdx !== -1) {
        rawBase64 = rawBase64.substring(commaIdx + 1).trim();
      }
    }

    let buffer: ArrayBuffer;
    try {
      buffer = decode(rawBase64);
      if (!buffer || buffer.byteLength === 0) {
        return {
          success: false,
          error: { message: 'Invalid or corrupt base64 image data' },
        };
      }
    } catch {
      return {
        success: false,
        error: { message: 'Error decoding base64 image' },
      };
    }

    const filePath = `${user.id}/profile.png`;

    // Upload / upsert into user_profile storage bucket
    const { error: uploadError } = await supabaseAdmin.storage
      .from('user_profile')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      // Try update fallback if upload failed with duplicate
      const { error: updateError } = await supabaseAdmin.storage
        .from('user_profile')
        .update(filePath, buffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (updateError) {
        return { success: false, error: updateError };
      }
    }

    // Generate signed URL valid for ~1 year (3.154e7 seconds)
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from('user_profile')
      .createSignedUrl(filePath, 31540000);

    if (urlError || !urlData?.signedUrl) {
      return { success: false, error: urlError || 'Failed to generate signed URL' };
    }

    const signedUrl = urlData.signedUrl;

    // Update user auth metadata
    const client = createScopedClient(token);
    if (refresh) {
      await client.auth
        .setSession({ access_token: token, refresh_token: refresh })
        .catch(() => {});
    }

    await client.auth.updateUser({
      data: { profile: signedUrl },
    });

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...(user.user_metadata || {}),
        profile: signedUrl,
      },
    });

    // If user is Tatuador, synchronize public.tatuadores_data
    if (user.user_metadata?.tipo === 'Tatuador') {
      const { data: existingArtist } = await supabaseAdmin
        .from('tatuadores_data')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (existingArtist) {
        const merged = {
          ...(existingArtist.data || {}),
          profile: signedUrl,
        };

        const { error: error_update } = await supabaseAdmin
          .from('tatuadores_data')
          .update({ data: merged })
          .eq('id', user.id);

        if (error_update) {
          return { success: false, error_update };
        }
      }
    }

    return { success: true };
  }
}

export const userService = new UserService();
