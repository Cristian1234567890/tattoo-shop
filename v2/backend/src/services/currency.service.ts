import { supabaseAdmin } from '../config/supabase';
import { ApiResponse } from '../types/api.types';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate_to_usd: number;
  country: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const SEEDED_CURRENCIES: Currency[] = [
  {
    code: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    rate_to_usd: 1.0,
    country: 'Estados Unidos',
    is_active: true,
  },
  {
    code: 'PAB',
    name: 'Balboa Panameño',
    symbol: 'B/.',
    rate_to_usd: 1.0,
    country: 'Panamá',
    is_active: true,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    rate_to_usd: 0.92,
    country: 'España',
    is_active: true,
  },
  {
    code: 'COP',
    name: 'Peso Colombiano',
    symbol: '$',
    rate_to_usd: 4150.0,
    country: 'Colombia',
    is_active: true,
  },
  {
    code: 'MXN',
    name: 'Peso Mexicano',
    symbol: '$',
    rate_to_usd: 18.5,
    country: 'México',
    is_active: true,
  },
];

export class CurrencyService {
  async getActiveCurrencies(): Promise<ApiResponse<Currency[]>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('currencies')
        .select('*')
        .eq('is_active', true);

      if (error || !data || data.length === 0) {
        return {
          success: true,
          data: SEEDED_CURRENCIES,
        };
      }

      const formatted: Currency[] = data.map((item: any) => ({
        code: item.code,
        name: item.name,
        symbol: item.symbol,
        rate_to_usd: Number(item.rate_to_usd) || 1.0,
        country: item.country,
        is_active: Boolean(item.is_active),
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      return {
        success: true,
        data: formatted,
      };
    } catch (err: any) {
      return {
        success: true,
        data: SEEDED_CURRENCIES,
      };
    }
  }
}

export const currencyService = new CurrencyService();
