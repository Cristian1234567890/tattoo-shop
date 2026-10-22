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
      timeout: 5000,
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
      const raw = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public setStoredSession(data: { user: User; session: Session }): void {
    sessionStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('user', JSON.stringify(data));
  }

  public clearStoredSession(): void {
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
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
    birthdate?: string;
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

  // 2.3 POST /check-availability
  async checkAvailability(payload: {
    email?: string;
    phone?: string;
  }): Promise<{ success: boolean; available: boolean; field?: 'email' | 'phone'; message?: string }> {
    try {
      const res = await this.axiosInstance.post('/check-availability', payload);
      return res.data;
    } catch (err: any) {
      return {
        success: false,
        available: true, // Graceful degradation on network timeout
        message: err.response?.data?.message || err.message,
      };
    }
  }

  // 2.4 POST /send-email-otp
  async sendEmailOtp(email: string): Promise<{ success: boolean; message?: string; cooldownRemaining?: number }> {
    const res = await this.axiosInstance.post('/send-email-otp', { email });
    return res.data;
  }

  // 2.5 POST /verify-email-otp
  async verifyEmailOtp(email: string, code: string): Promise<{ success: boolean; message?: string }> {
    const res = await this.axiosInstance.post('/verify-email-otp', { email, code });
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

  // 13.1 POST /subscription/affiliate-card (Legacy Card Vault Gateway)
  async affiliateCard(payload: {
    user_id?: string;
    holder_name: string;
    card_number: string;
    expiration: string;
    cvv: string;
    agreement_accepted: boolean;
    role?: string;
    plan_type?: string;
    billing_cycle?: 'monthly' | 'annual';
  }): Promise<{ success: boolean; message?: string; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.post('/subscription/affiliate-card', payload);
      return res.data;
    } catch (err: any) {
      return err.response?.data || { success: false, error: err.message };
    }
  }

  // 13.2 POST /subscription/cancel
  async cancelSubscription(payload: {
    id?: string;
    user_id?: string;
    reason?: string;
  }): Promise<{ success: boolean; message?: string; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.post('/subscription/cancel', payload);
      return res.data;
    } catch (err: any) {
      return err.response?.data || { success: false, error: err.message };
    }
  }

  // 13.3 POST /subscription/reactivate
  async reactivateSubscription(payload: {
    id?: string;
    user_id?: string;
  }): Promise<{ success: boolean; message?: string; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.post('/subscription/reactivate', payload);
      return res.data;
    } catch (err: any) {
      return err.response?.data || { success: false, error: err.message };
    }
  }

  // 13.4 GET /subscription/status/:id
  async getSubscriptionStatus(userId: string): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.get(`/subscription/status/${userId}`);
      return res.data;
    } catch (err: any) {
      return err.response?.data || { success: false, error: err.message };
    }
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

  // 15. POST /api/client/tattoo-progress (Client Premium)
  async saveTattooProgress(payload: {
    tattooId?: string;
    client_id?: string;
    artist_id?: string | null;
    title?: string;
    stage?: string;
    notes?: string;
    image_url?: string;
    photo_url?: string;
    session_number?: number;
    date?: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; data?: any; error?: any; code?: string; message?: string }> {
    try {
      const res = await this.axiosInstance.post('/api/client/tattoo-progress', payload);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) {
        return err.response.data;
      }
      return { success: false, error: err.message || 'Error registrando progreso' };
    }
  }

  // 16. GET /api/client/tattoo-progress (Client Premium)
  async getClientProgress(): Promise<{ success: boolean; data?: any[]; error?: any; code?: string; message?: string }> {
    try {
      const res = await this.axiosInstance.get('/api/client/tattoo-progress');
      return res.data;
    } catch (err: any) {
      if (err.response?.data) {
        return err.response.data;
      }
      return { success: false, error: err.message || 'Error consultando avances' };
    }
  }

  // 17. DELETE /api/client/tattoo-progress/:id (Client Premium)
  async deleteProgress(id: string): Promise<{ success: boolean; error?: any; message?: string }> {
    try {
      const res = await this.axiosInstance.delete(`/api/client/tattoo-progress/${id}`);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) {
        return err.response.data;
      }
      return { success: false, error: err.message || 'Error eliminando progreso' };
    }
  }

  // 18. GET /api/artist/tattoo-progress
  async getArtistClientProgress(): Promise<{ success: boolean; data?: any[]; error?: any }> {
    try {
      const res = await this.axiosInstance.get('/api/artist/tattoo-progress');
      return res.data;
    } catch (err: any) {
      if (err.response?.data) {
        return err.response.data;
      }
      return { success: false, error: err.message || 'Error consultando avances de clientes' };
    }
  }

  // 19. GET /agenda
  async getAgenda(artistId?: string): Promise<{ success: boolean; data?: any[]; error?: any }> {
    try {
      const url = artistId ? `/artists/${artistId}/schedules` : '/agenda';
      const res = await this.axiosInstance.get(url);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error consultando agenda' };
    }
  }

  // 20. POST /agenda
  async createAgenda(payload: any): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.post('/agenda', payload);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error creando cita en agenda' };
    }
  }

  // 21. PUT /agenda/:id
  async updateAgenda(id: string | number, payload: any): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.put(`/agenda/${id}`, payload);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error actualizando cita' };
    }
  }

  // 22. GET /payments
  async getPayments(clientId?: string): Promise<{ success: boolean; data?: any[]; error?: any }> {
    try {
      const url = clientId ? `/payments?client_id=${clientId}` : '/payments';
      const res = await this.axiosInstance.get(url);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error consultando pagos' };
    }
  }

  // 23. POST /payments
  async createPayment(payload: any): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.post('/payments', payload);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error creando pago' };
    }
  }

  // 24. GET /products or /artists/:artistId/products
  async getProducts(params?: { category?: string; artistId?: string }): Promise<{ success: boolean; data?: any[]; error?: any }> {
    try {
      let url = '/products';
      if (params?.artistId) {
        url = `/artists/${params.artistId}/products`;
      }
      const queryParams: string[] = [];
      if (params?.category && params.category !== 'all') {
        queryParams.push(`category=${encodeURIComponent(params.category)}`);
      }
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      const res = await this.axiosInstance.get(url);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error consultando productos' };
    }
  }

  // 25. POST /products
  async createStoreProduct(payload: any): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.post('/products', payload);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error creando producto' };
    }
  }

  // 26. GET /orders
  async getOrders(): Promise<{ success: boolean; data?: any[]; error?: any }> {
    try {
      const res = await this.axiosInstance.get('/orders');
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error consultando pedidos' };
    }
  }

  // 27. POST /orders
  async createOrder(payload: any): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.post('/orders', payload);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error creando pedido de retiro' };
    }
  }

  // 28. POST /sketches
  async createSketch(payload: any): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.post('/sketches', payload);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error enviando boceto' };
    }
  }

  // 29. GET /studios
  async getStudios(params?: { search?: string; minRating?: number; style?: string; city?: string }): Promise<{ success: boolean; data?: any[]; error?: any }> {
    try {
      const res = await this.axiosInstance.get('/studios', { params });
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error consultando estudios' };
    }
  }

  // 30. POST /studios
  async createStudio(payload: any): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.post('/studios', payload);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error registrando estudio' };
    }
  }

  // 31. PUT /studios/:id
  async updateStudio(id: string, payload: any): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.put(`/studios/${id}`, payload);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error actualizando estudio' };
    }
  }

  // 32. POST /studios/:id/transfer
  async transferStudioOwnership(id: string, newOwnerId: string): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.post(`/studios/${id}/transfer`, { new_owner_id: newOwnerId });
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error transfiriendo estudio' };
    }
  }

  // 33. DELETE /studios/:id
  async deleteStudio(id: string): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.delete(`/studios/${id}`);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error eliminando estudio' };
    }
  }

  // 34. POST /studios/join
  async joinStudio(studioCode: string, specialties?: string[]): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.post('/studios/join', { studio_code: studioCode, specialties });
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error vinculándose al estudio' };
    }
  }

  // 35. POST /studios/:id/reviews
  async addStudioReview(studioId: string, payload: { rating: number; comment?: string; client_name?: string }): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.post(`/studios/${studioId}/reviews`, payload);
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error enviando calificación' };
    }
  }

  // 36. POST /coupons/validate
  async validateCoupon(code: string, appliesTo?: string): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const res = await this.axiosInstance.post('/coupons/validate', { code, applies_to: appliesTo });
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error validando cupón' };
    }
  }

  // 37. POST /api/phone/send-otp (Vonage 6-digit SMS OTP)
  async sendPhoneOtp(phonePrefix: string, phoneNumber: string): Promise<{ success: boolean; message?: string; error?: string; cooldownRemaining?: number }> {
    try {
      const res = await this.axiosInstance.post('/api/phone/send-otp', {
        phone_prefix: phonePrefix,
        phone_number: phoneNumber,
      });
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error enviando código de verificación SMS' };
    }
  }

  // 38. POST /api/phone/verify-otp
  async verifyPhoneOtp(phonePrefix: string, phoneNumber: string, code: string): Promise<{ success: boolean; message?: string; error?: string; phone_verified?: boolean }> {
    try {
      const res = await this.axiosInstance.post('/api/phone/verify-otp', {
        phone_prefix: phonePrefix,
        phone_number: phoneNumber,
        code,
      });
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error verificando código SMS' };
    }
  }

  // 39. POST /api/phone/change-request
  async requestPhoneChange(newPhonePrefix: string, newPhoneNumber: string): Promise<{ success: boolean; message?: string; error?: string; cooldownRemaining?: number }> {
    try {
      const res = await this.axiosInstance.post('/api/phone/change-request', {
        new_phone_prefix: newPhonePrefix,
        new_phone_number: newPhoneNumber,
      });
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error solicitando cambio de número' };
    }
  }

  // 40. POST /api/phone/change-confirm
  async confirmPhoneChange(newPhonePrefix: string, newPhoneNumber: string, code: string): Promise<{ success: boolean; message?: string; error?: string; phone_verified?: boolean; phone_number?: string; phone_prefix?: string }> {
    try {
      const res = await this.axiosInstance.post('/api/phone/change-confirm', {
        new_phone_prefix: newPhonePrefix,
        new_phone_number: newPhoneNumber,
        code,
      });
      return res.data;
    } catch (err: any) {
      if (err.response?.data) return err.response.data;
      return { success: false, error: err.message || 'Error confirmando cambio de número' };
    }
  }
}

export const api = new ApiClient();
