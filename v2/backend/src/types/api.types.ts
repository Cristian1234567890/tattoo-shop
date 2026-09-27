import { Request } from 'express';
import { User, Session } from '@supabase/supabase-js';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: any;
  error_insert?: any;
  error_update?: any;
  user?: User | any;
  session?: Session | any;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
  refreshToken?: string;
}
