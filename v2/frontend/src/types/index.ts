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

export interface NotificationPreferences {
  email_appointments: boolean;
  email_chat: boolean;
  email_care_reminders: boolean;
  email_promotions: boolean;
  inapp_sounds: boolean;
  inapp_browser_push: boolean;
  inapp_upcoming_alerts: boolean;
}

export interface PrivacySettings {
  profile_public: boolean;
  share_progress_with_artists: boolean;
  allow_marketing_analytics: boolean;
}

export interface UserMetadata {
  nombre?: string;
  apellido?: string;
  edad?: string;
  tipo?: UserRole;
  role?: UserRole;
  telefono?: string;
  provincia?: string;
  ciudad?: string;
  direccion?: string;
  country?: string;
  city?: string;
  phone_prefix?: string;
  whatsapp_number?: string;
  profile?: string;
  work_type?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  link?: string;
  legal_accepted?: boolean;
  legal_accepted_at?: string;
  onboarding_completed?: boolean;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  name?: string;
  picture?: string;
  has_active_subscription?: boolean;
  is_trial_active?: boolean;
  trial_days_remaining?: number;
  trial_expired?: boolean;
  days_active?: number;
  notification_preferences?: NotificationPreferences;
  preferred_language?: 'es' | 'en';
  privacy_settings?: PrivacySettings;
  [key: string]: any;
}

export interface User {
  id: string;
  email: string;
  user_metadata: UserMetadata;
  app_metadata?: { provider?: string; providers?: string[]; [key: string]: any };
  identities?: Array<{ id: string; provider: string; identity_data?: any; last_sign_in_at?: string }>;
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
  phone_prefix?: string;
  whatsapp_number?: string;
  country?: string;
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
  lat?: number;
  lng?: number;
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

export interface UserProfile {
  id: string;
  role?: UserRole | null;
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
  has_active_subscription?: boolean;
  trial_days_remaining?: number;
  is_trial_active?: boolean;
  trial_expired?: boolean;
  days_active?: number;
  notification_preferences?: NotificationPreferences | null;
  preferred_language?: 'es' | 'en' | null;
  privacy_settings?: PrivacySettings | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Sub-entidad: Artista que reside o colabora en un estudio físico o estudio privado
 */
export interface ResidentArtist {
  id: string;
  name: string;
  alias?: string;
  avatar: string;
  bio?: string;
  specialties: string[];
  hourlyRate?: number;
  hourly_rate?: number;
  currency?: string;
  experience_years?: number;
  rating?: number;
  availableToday?: boolean;
  available_today?: boolean;
  instagram?: string;
  phone?: string;
  whatsapp: {
    number: string;
    prefix: string;
    default_message?: string;
  };
  portfolio?: Array<{
    id: string;
    image_url: string;
    title?: string;
    style?: string;
    price?: number;
  }>;
  flashes?: Array<{
    id: string;
    img: string;
    title: string;
    price?: number;
    amount?: number;
  }>;
}

/**
 * Entidad Raíz: Local/Estudio Físico o Tatuador Independiente
 */
export interface StudioLocation {
  id: string;
  type: 'studio' | 'independent';
  name: string;
  tagline?: string;
  description?: string;
  banner_url?: string;
  banner?: string;
  logo_url?: string;
  rating: number;
  review_count?: number;
  reviewCount?: number;
  verified: boolean;
  address: string;
  city?: string;
  province?: string;
  country?: string;
  lat?: number;
  lng?: number;
  distance?: string;
  distanceKm?: number;
  mapPin?: { x: string; y: string };
  map_pin?: { x: string; y: string };
  artistsCount?: number;
  artists_count?: number;
  residents?: ResidentArtist[];
  resident_artists?: ResidentArtist[];
  studio_whatsapp?: {
    number: string;
    prefix: string;
  };
  amenities?: string[];
}
