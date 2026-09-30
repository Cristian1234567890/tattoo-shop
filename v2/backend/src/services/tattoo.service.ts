import { supabaseAdmin } from '../config/supabase';
import { ApiResponse } from '../types/api.types';
import { TatuadorRecord } from '../types/tattoo.types';

export class TattooService {
  async getTattoPublicData(): Promise<ApiResponse<TatuadorRecord[]>> {
    const { data, error } = await supabaseAdmin.from('tatuadores_data').select('*');
    if (error) {
      return { success: false, error };
    }
    return { success: true, data: data || [] };
  }

  async getTattoById(id: string): Promise<ApiResponse<TatuadorRecord>> {
    const { data, error } = await supabaseAdmin
      .from('tatuadores_data')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return { success: false, error };
    }
    if (!data) {
      return { success: false, error: 'Artist not found' };
    }
    return { success: true, data };
  }
}

export const tattooService = new TattooService();
