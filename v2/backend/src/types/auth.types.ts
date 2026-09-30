export interface SignInDTO {
  email?: string;
  password?: string;
}

export interface SignUpDTO {
  email?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  edad?: string | number;
  tipo?: 'Cliente' | 'Tatuador' | string;
  telefono?: string;
  provincia?: string;
  ciudad?: string;
  direccion?: string;
  country?: string;
  city?: string;
  phone_prefix?: string;
  whatsapp_number?: string;
  legal_accepted?: boolean;
  legal_accepted_at?: string;
}

export interface Verify2FADTO {
  factorId?: string;
  code?: string;
}

export interface UpdateUserDTO {
  email?: string;
  nombre?: string;
  apellido?: string;
  edad?: string | number;
  telefono?: string;
  provincia?: string;
  ciudad?: string;
  direccion?: string;
  country?: string;
  city?: string;
  phone_prefix?: string;
  whatsapp_number?: string;
  work_type?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  link?: string;
  profile?: string;
  role?: 'Cliente' | 'Tatuador' | string;
  tipo?: 'Cliente' | 'Tatuador' | string;
  legal_accepted?: boolean;
  legal_accepted_at?: string;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  onboarding_completed?: boolean;
  is_verified?: boolean;
  [key: string]: any;
}

export interface UpdateUserImgDTO {
  imageData?: string;
}

export interface CompleteOnboardingDTO {
  role: 'Cliente' | 'Tatuador';
  legal_accepted: boolean;
  legal_accepted_at?: string;
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
  country?: string;
  city?: string;
  phone_prefix?: string;
  whatsapp_number?: string;
}

export interface UserProfile {
  id: string;
  role?: 'Cliente' | 'Tatuador' | string | null;
  legal_accepted: boolean;
  legal_accepted_at?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  phone_number?: string | null;
  country?: string | null;
  city?: string | null;
  phone_prefix?: string | null;
  whatsapp_number?: string | null;
  is_verified?: boolean;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}
