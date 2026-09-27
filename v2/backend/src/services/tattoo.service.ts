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
}

export const tattooService = new TattooService();
