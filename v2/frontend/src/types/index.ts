export type UserRole = 'Cliente' | 'Tatuador';

export type TattooStyle =
  | 'realista'
  | 'tradicional'
  | 'neotradicional'
  | 'blackwork'
  | 'botwork'
  | 'dotwork'
  | 'japones'
  | 'tribal'
  | 'acuarela';

export interface UserMetadata {
  nombre: string;
  apellido: string;
  edad: string;
  tipo: UserRole;
  telefono?: string;
  provincia?: string;
  ciudad?: string;
  direccion?: string;
  profile?: string;
  work_type?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  link?: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata: UserMetadata;
  factors?: Array<{ id: string; factor_type?: string; status?: string }>;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    session: Session;
  };
  error?: {
    message?: string;
    status?: number;
  } | string;
}

export interface TwoFactorEnrollData {
  id: string;
  type: string;
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

export interface TwoFactorVerifyData {
  access_token: string;
  refresh_token: string;
  user?: User;
}

export interface ArtistProfileData {
  email: string;
  nombre: string;
  apellido: string;
  work_type: string;
  telefono?: string;
  provincia: string;
  ciudad: string;
  direccion?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  link?: string;
  profile: string;
  followersCount?: number;
  followingCount?: number;
  worksCount?: number;
}

export interface TattooArtistCard {
  id: string;
  data: ArtistProfileData;
}

export interface PayPalProduct {
  id: string;
  name: string;
  description: string;
  type?: string;
  category?: string;
}

export interface PayPalPlan {
  id: string;
  product_id: string;
  name: string;
  status: string;
}

export interface UserSubscriptionRecord {
  id: string;
  product_id: string;
  subscription_id: string;
}
