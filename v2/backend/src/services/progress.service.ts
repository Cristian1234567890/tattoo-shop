import { supabaseAdmin } from '../config/supabase';
import { ApiResponse } from '../types/api.types';

export interface TattooProgressData {
  id?: string;
  client_id: string;
  artist_id?: string | null;
  title?: string;
  notes?: string;
  image_url?: string;
  photo_url?: string;
  stage?: string;
  session_number?: number;
  date?: string;
  tattooId?: string;
  metadata?: Record<string, any>;
}

export class ProgressService {
  /**
   * Save a new tattoo progress record into public.tattoo_progress
   */
  async saveProgress(
    userId: string,
    data: Partial<TattooProgressData>
  ): Promise<ApiResponse> {
    try {
      const cleanArtistId =
        data.artist_id && typeof data.artist_id === 'string' && data.artist_id.trim() !== ''
          ? data.artist_id.trim()
          : null;

      const payload = {
        client_id: userId,
        artist_id: cleanArtistId,
        title: (data.title && data.title.trim()) || 'Progreso de Tatuaje',
        notes: data.notes || '',
        image_url: data.image_url || data.photo_url || '',
        stage: data.stage || 'Fase 1: Limpieza & Primer Vendaje',
        session_number: Number(data.session_number) || 1,
        date: (data.date && data.date.trim()) || new Date().toISOString().split('T')[0],
        metadata: {
          ...(data.metadata || {}),
          ...(data.tattooId ? { tattooId: data.tattooId } : {}),
        },
      };

      const { data: record, error } = await supabaseAdmin
        .from('tattoo_progress')
        .insert(payload)
        .select(`
          *,
          artist:artist_id (
            id,
            full_name,
            avatar_url,
            phone_prefix,
            whatsapp_number
          )
        `)
        .single();

      if (error) {
        return { success: false, error: { message: error.message } };
      }

      return {
        success: true,
        message: 'Progreso de tatuaje registrado exitosamente',
        data: record,
      };
    } catch (err: any) {
      return { success: false, error: { message: err.message || 'Error guardando progreso' } };
    }
  }

  /**
   * Fetch all tattoo progress records for a specific client
   */
  async getClientProgress(clientId: string): Promise<ApiResponse> {
    try {
      const { data, error } = await supabaseAdmin
        .from('tattoo_progress')
        .select(`
          *,
          artist:artist_id (
            id,
            full_name,
            avatar_url,
            phone_prefix,
            whatsapp_number
          )
        `)
        .eq('client_id', clientId)
        .order('date', { ascending: false });

      if (error) {
        return { success: false, error: { message: error.message } };
      }

      return {
        success: true,
        data: data || [],
      };
    } catch (err: any) {
      return { success: false, error: { message: err.message || 'Error consultando avances' } };
    }
  }

  /**
   * Delete a progress record (verifying client ownership)
   */
  async deleteProgress(id: string, clientId: string): Promise<ApiResponse> {
    try {
      // 1. Fetch record to get storage_path if stored in metadata
      const { data: entry } = await supabaseAdmin
        .from('tattoo_progress')
        .select('id, client_id, metadata')
        .eq('id', id)
        .eq('client_id', clientId)
        .maybeSingle();

      if (!entry) {
        return { success: false, error: { message: 'Registro no encontrado o sin permisos' } };
      }

      // 2. Delete from storage if storage_path is present
      const storagePath = entry.metadata?.storage_path;
      if (storagePath) {
        await supabaseAdmin.storage
          .from('tattoo-progress')
          .remove([storagePath])
          .catch(() => {});
      }

      // 3. Delete from database
      const { error: deleteError } = await supabaseAdmin
        .from('tattoo_progress')
        .delete()
        .eq('id', id)
        .eq('client_id', clientId);

      if (deleteError) {
        return { success: false, error: { message: deleteError.message } };
      }

      return { success: true, message: 'Registro eliminado exitosamente' };
    } catch (err: any) {
      return { success: false, error: { message: err.message || 'Error eliminando progreso' } };
    }
  }

  /**
   * Fetch all progress records shared with a tattoo artist
   */
  async getArtistClientProgress(artistId: string): Promise<ApiResponse> {
    try {
      const { data, error } = await supabaseAdmin
        .from('tattoo_progress')
        .select(`
          *,
          client:client_id (
            id,
            full_name,
            avatar_url,
            phone_prefix,
            phone_number
          )
        `)
        .eq('artist_id', artistId)
        .order('date', { ascending: false });

      if (error) {
        return { success: false, error: { message: error.message } };
      }

      return {
        success: true,
        data: data || [],
      };
    } catch (err: any) {
      return { success: false, error: { message: err.message || 'Error consultando avances de clientes' } };
    }
  }
}

export const progressService = new ProgressService();
