import axios, { AxiosInstance } from 'axios';
import {
  AuthResponse,
  TwoFactorEnrollData,
  TwoFactorVerifyData,
  TattooArtistCard,
  PayPalProduct,
  PayPalPlan,
  UserSubscriptionRecord,
  User,
  Session,
  UserProfile
} from '../types';

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to inject Authorization and refresh_token headers
    this.axiosInstance.interceptors.request.use((config) => {
      const stored = this.getStoredSession();
      if (stored?.session?.access_token) {
        config.headers.Authorization = `Bearer ${stored.session.access_token}`;
      }
      if (stored?.session?.refresh_token) {
        // Provide both header variants for legacy compatibility
        config.headers.refresh_token = stored.session.refresh_token;
        config.headers.refresh = stored.session.refresh_token;
      }
      return config;
    });
  }

  public getStoredSession(): { user?: User; session?: Session } | null {
    try {
      const raw = sessionStorage.getItem('user');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public setStoredSession(data: { user: User; session: Session }): void {
    sessionStorage.setItem('user', JSON.stringify(data));
  }

  public clearStoredSession(): void {
    sessionStorage.removeItem('user');
  }

  // 1. POST /login
  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = await this.axiosInstance.post<AuthResponse>('/login', payload);
    return res.data;
  }

  // 2. POST /register
  async register(payload: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    edad: string;
    tipo: 'Cliente' | 'Tatuador';
    telefono?: string;
    provincia?: string;
    ciudad?: string;
    direccion?: string;
    legal_accepted?: boolean;
    legal_accepted_at?: string;
  }): Promise<AuthResponse> {
    const res = await this.axiosInstance.post<AuthResponse>('/register', payload);
    return res.data;
  }

  // 2.1 POST /complete-onboarding
  async completeOnboarding(payload: {
    role: 'Cliente' | 'Tatuador';
    legal_accepted: boolean;
    legal_accepted_at?: string;
    full_name?: string;
    phone_number?: string;
    avatar_url?: string;
  }): Promise<{ success: boolean; data?: any; error?: any }> {
    const res = await this.axiosInstance.post('/complete-onboarding', payload);
    return res.data;
  }

  // 2.2 GET /userprofile
  async getUserProfile(): Promise<{ success: boolean; data?: UserProfile; error?: any }> {
    const res = await this.axiosInstance.get('/userprofile');
    return res.data;
  }

  // 3. POST /logout
  async logout(): Promise<{ success: boolean; error?: any }> {
    const res = await this.axiosInstance.post('/logout', {});
    this.clearStoredSession();
    return res.data;
  }

  // 4. POST /enroll
  async enroll2FA(): Promise<{ success: boolean; data: TwoFactorEnrollData; error?: any }> {
    const res = await this.axiosInstance.post('/enroll', {});
    return res.data;
  }

  // 5. POST /verify2fa
  async verify2FA(payload: {
    factorId: string;
    code: string;
  }): Promise<{ success: boolean; data: TwoFactorVerifyData; error?: any }> {
    const res = await this.axiosInstance.post('/verify2fa', payload);
    return res.data;
  }

  // 6. POST /updateuser
  async updateUser(payload: Record<string, any>): Promise<{ success: boolean; data?: any; error?: any }> {
    const res = await this.axiosInstance.post('/updateuser', payload);
    return res.data;
  }

  // 7. POST /updateuserimg
  async updateUserImg(imageData: string): Promise<{ success: boolean; error?: any }> {
    const res = await this.axiosInstance.post('/updateuserimg', { imageData });
    return res.data;
  }

  // 8. GET /gettatto
  async getTattooArtists(): Promise<{ success: boolean; data: TattooArtistCard[]; error?: any }> {
    const res = await this.axiosInstance.get('/gettatto');
    return res.data;
  }

  // 9. POST /createproduct
  async createProduct(): Promise<PayPalProduct> {
    const res = await this.axiosInstance.post('/createproduct', {});
    return res.data;
  }

  // 10. POST /subscribe
  async createSubscriptionPlan(payload: {
    id: string;
    name: string;
    description: string;
  }): Promise<PayPalPlan> {
    const res = await this.axiosInstance.post('/subscribe', payload);
    return res.data;
  }

  // 11. GET /paypalsubscription/:id
  async getPayPalSubscription(id: string): Promise<PayPalPlan> {
    const res = await this.axiosInstance.get(`/paypalsubscription/${id}`);
    return res.data;
  }

  // 12. GET /usersubscription/:id
  async getUserSubscription(userId: string): Promise<{ success: boolean; data: UserSubscriptionRecord[]; error?: any }> {
    const res = await this.axiosInstance.get(`/usersubscription/${userId}`);
    return res.data;
  }

  // 13. POST /usersubscription
  async insertUserSubscription(payload: {
    id: string;
    product_id: string;
    subscription_id: string;
  }): Promise<{ success: boolean; data?: any; error?: any }> {
    const res = await this.axiosInstance.post('/usersubscription', payload);
    return res.data;
  }

  // 14. POST /mail
  async sendMail(payload: {
    to: string;
    email: string;
    img?: string;
  }): Promise<string> {
    const res = await this.axiosInstance.post('/mail', payload, {
      responseType: 'text',
    });
    return res.data;
  }
}

export const api = new ApiClient();
