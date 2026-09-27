import { decode } from 'base64-arraybuffer';
import { User } from '@supabase/supabase-js';
import { supabaseAdmin, createScopedClient } from '../config/supabase';
import { ApiResponse } from '../types/api.types';
import { UpdateUserDTO, CompleteOnboardingDTO } from '../types/auth.types';

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

    // Synchronize public.user_profiles
    const profileUpdates: any = {
      id: user.id,
      updated_at: new Date().toISOString(),
    };
    const candidateRole = userData.role || userData.tipo;
    if (candidateRole === 'Cliente' || candidateRole === 'Tatuador') {
      profileUpdates.role = candidateRole;
    }
    if (userData.legal_accepted !== undefined) profileUpdates.legal_accepted = userData.legal_accepted;
    if (userData.legal_accepted_at !== undefined) profileUpdates.legal_accepted_at = userData.legal_accepted_at;
    if (userData.full_name || userData.nombre) {
      profileUpdates.full_name = userData.full_name || `${userData.nombre || ''} ${userData.apellido || ''}`.trim();
    }
    if (userData.profile || userData.avatar_url) profileUpdates.avatar_url = userData.profile || userData.avatar_url;
    if (userData.telefono || userData.phone_number) profileUpdates.phone_number = userData.telefono || userData.phone_number;
    if (userData.onboarding_completed !== undefined) profileUpdates.onboarding_completed = userData.onboarding_completed;
    if (userData.is_verified !== undefined) profileUpdates.is_verified = userData.is_verified;

    try {
      await supabaseAdmin.from('user_profiles').upsert(profileUpdates);
    } catch (errUp: any) {
      console.warn('Note: user_profiles upsert in updateUser:', errUp?.message || errUp);
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

  async completeOnboarding(
    dto: CompleteOnboardingDTO,
    user: User,
    token: string,
    refresh?: string
  ): Promise<ApiResponse> {
    if (!dto.role || (dto.role !== 'Cliente' && dto.role !== 'Tatuador')) {
      return {
        success: false,
        error: { message: 'El rol debe ser Cliente o Tatuador', status: 400 },
      };
    }

    if (dto.legal_accepted !== true && String(dto.legal_accepted) !== 'true') {
      return {
        success: false,
        error: { message: 'Debes aceptar los Términos y Condiciones y la Política de Privacidad', status: 400 },
      };
    }

    // Preserve existing legal acceptance audit timestamp if user already accepted terms
    let legal_accepted_at: string | null = null;
    if (user.user_metadata?.legal_accepted === true && user.user_metadata?.legal_accepted_at) {
      legal_accepted_at = user.user_metadata.legal_accepted_at;
    } else {
      try {
        const { data: existingProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('legal_accepted, legal_accepted_at')
          .eq('id', user.id)
          .maybeSingle();
        if (existingProfile?.legal_accepted && existingProfile?.legal_accepted_at) {
          legal_accepted_at = existingProfile.legal_accepted_at;
        }
      } catch {}
    }

    if (!legal_accepted_at) {
      legal_accepted_at = dto.legal_accepted_at || new Date().toISOString();
    }
    const fullName = dto.full_name?.trim() || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
    const avatarUrl = dto.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || user.user_metadata?.profile || '';
    const phoneNumber = dto.phone_number || user.user_metadata?.telefono || user.user_metadata?.phone_number || null;

    const profileData = {
      id: user.id,
      role: dto.role,
      legal_accepted: true,
      legal_accepted_at,
      full_name: fullName,
      avatar_url: avatarUrl,
      phone_number: phoneNumber,
      is_verified: false,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    try {
      await supabaseAdmin.from('user_profiles').upsert(profileData);
    } catch (err: any) {
      console.warn('Note: user_profiles upsert in completeOnboarding:', err?.message || err);
    }

    // Update user auth metadata
    const updatedMetadata = {
      ...(user.user_metadata || {}),
      tipo: dto.role,
      role: dto.role,
      legal_accepted: true,
      legal_accepted_at,
      full_name: fullName,
      avatar_url: avatarUrl,
      telefono: phoneNumber,
      onboarding_completed: true,
    };

    try {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: updatedMetadata,
      });
    } catch (errMeta: any) {
      console.warn('Note: auth.admin.updateUserById in completeOnboarding:', errMeta?.message || errMeta);
    }

    // If role is Tatuador, ensure initial artist data exists in tatuadores_data
    if (dto.role === 'Tatuador') {
      const data_to_insert = {
        email: user.email,
        nombre: fullName.split(' ')[0] || '',
        apellido: fullName.split(' ').slice(1).join(' ') || '',
        work_type: '',
        telefono: phoneNumber || '',
        provincia: '',
        ciudad: '',
        direccion: '',
        facebook: '',
        twitter: '',
        instagram: '',
        link: '',
        profile: avatarUrl || '',
      };

      try {
        await supabaseAdmin.from('tatuadores_data').upsert({ id: user.id, data: data_to_insert });
      } catch (errArt: any) {
        console.warn('Note: tatuadores_data upsert in completeOnboarding:', errArt?.message || errArt);
      }
    }

    return {
      success: true,
      data: {
        profile: profileData,
        user: {
          ...user,
          user_metadata: updatedMetadata,
        },
      },
    };
  }

  async getUserProfile(user: User): Promise<ApiResponse> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        return {
          success: true,
          data,
        };
      }
    } catch (err) {
      // Fallback to metadata
    }

    const fallbackProfile = {
      id: user.id,
      role: user.user_metadata?.tipo || user.user_metadata?.role || null,
      legal_accepted: !!user.user_metadata?.legal_accepted,
      legal_accepted_at: user.user_metadata?.legal_accepted_at || null,
      full_name: user.user_metadata?.full_name || `${user.user_metadata?.nombre || ''} ${user.user_metadata?.apellido || ''}`.trim() || user.email?.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || user.user_metadata?.profile || null,
      phone_number: user.user_metadata?.telefono || user.user_metadata?.phone_number || null,
      is_verified: false,
      onboarding_completed: !!user.user_metadata?.onboarding_completed,
    };

    return {
      success: true,
      data: fallbackProfile,
    };
  }
}

export const userService = new UserService();
