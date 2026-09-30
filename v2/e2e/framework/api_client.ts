/**
 * Opaque-box HTTP API Client for Tattoo Shop V2
 * Interfaces directly with http://localhost:8080 endpoints.
 */

import { CONFIG } from '../config.ts';

export interface ApiResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  rawText: string;
  durationMs: number;
}

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
  rawBody?: string;
}

export class ApiClient {
  private baseUrl: string;
  private defaultTimeoutMs: number;

  constructor(baseUrl: string = CONFIG.baseUrl, timeoutMs: number = CONFIG.requestTimeoutMs) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultTimeoutMs = timeoutMs;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async isServerReachable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseUrl}/gettatto`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(id);
      return res.status < 600;
    } catch {
      return false;
    }
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const method = options.method || 'GET';
    const headers: Record<string, string> = {
      ...options.headers,
    };

    let bodyPayload: BodyInit | undefined = undefined;

    if (options.rawBody !== undefined) {
      bodyPayload = options.rawBody;
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json';
      }
    } else if (options.body !== undefined) {
      if (typeof options.body === 'string') {
        bodyPayload = options.body;
      } else {
        bodyPayload = JSON.stringify(options.body);
        if (!headers['Content-Type'] && !headers['content-type']) {
          headers['Content-Type'] = 'application/json';
        }
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || this.defaultTimeoutMs);

    const start = Date.now();
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: bodyPayload,
        signal: controller.signal,
      });

      const durationMs = Date.now() - start;
      const rawText = await res.text();

      let parsedData: any = rawText;
      try {
        parsedData = JSON.parse(rawText);
      } catch {
        // Keep as raw text if not JSON
      }

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        resHeaders[k.toLowerCase()] = v;
      });

      return {
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        data: parsedData,
        rawText,
        durationMs,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  // Auth Endpoints
  async login(body: any, headers?: Record<string, string>) {
    return this.request('/login', { method: 'POST', body, headers });
  }

  async register(body: any, headers?: Record<string, string>) {
    return this.request('/register', { method: 'POST', body, headers });
  }

  async logout(authHeaders?: Record<string, string>) {
    return this.request('/logout', { method: 'POST', headers: authHeaders });
  }

  // MFA Endpoints
  async enroll(authHeaders?: Record<string, string>) {
    return this.request('/enroll', { method: 'POST', body: {}, headers: authHeaders });
  }

  async verify2FA(body: any, authHeaders?: Record<string, string>) {
    return this.request('/verify2fa', { method: 'POST', body, headers: authHeaders });
  }

  // User Profile Endpoints
  async updateUser(body: any, authHeaders?: Record<string, string>) {
    return this.request('/updateuser', { method: 'POST', body, headers: authHeaders });
  }

  async updateUserImg(body: any, authHeaders?: Record<string, string>) {
    return this.request('/updateuserimg', { method: 'POST', body, headers: authHeaders });
  }

  async completeOnboarding(body: any, authHeaders?: Record<string, string>) {
    return this.request('/complete-onboarding', { method: 'POST', body, headers: authHeaders });
  }

  async getUserProfile(authHeaders?: Record<string, string>) {
    return this.request('/userprofile', { method: 'GET', headers: authHeaders });
  }

  // Artist Gallery
  async getTatto(authHeaders?: Record<string, string>) {
    return this.request('/gettatto', { method: 'GET', headers: authHeaders });
  }

  // PayPal & Subscriptions
  async createProduct(body: any = {}) {
    return this.request('/createproduct', { method: 'POST', body });
  }

  async subscribe(body: any) {
    return this.request('/subscribe', { method: 'POST', body });
  }

  async getPayPalSubscription(id: string) {
    return this.request(`/paypalsubscription/${id}`, { method: 'GET' });
  }

  async getUserSubscription(id: string, authHeaders?: Record<string, string>) {
    return this.request(`/usersubscription/${id}`, { method: 'GET', headers: authHeaders });
  }

  async insertUserSubscription(body: any, authHeaders?: Record<string, string>) {
    return this.request('/usersubscription', { method: 'POST', body, headers: authHeaders });
  }

  // Mail
  async sendMail(body: any, authHeaders?: Record<string, string>) {
    return this.request('/mail', { method: 'POST', body, headers: authHeaders });
  }

  // Client Premium Features
  async postClientTattooProgress(body: any, authHeaders?: Record<string, string>) {
    return this.request('/api/client/tattoo-progress', { method: 'POST', body, headers: authHeaders });
  }

  // Database Fixture Manipulation (Admin Service Role for Trial Simulation)
  async backdateUserProfile(userId: string, daysAgo: number): Promise<boolean> {
    const targetDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    try {
      const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          apikey: CONFIG.supabaseServiceRoleKey,
          Authorization: `Bearer ${CONFIG.supabaseServiceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ created_at: targetDate }),
      });
      return res.status >= 200 && res.status < 300;
    } catch {
      return false;
    }
  }

  async setUserSubscriptionActive(userId: string, hasActive: boolean): Promise<boolean> {
    try {
      const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          apikey: CONFIG.supabaseServiceRoleKey,
          Authorization: `Bearer ${CONFIG.supabaseServiceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ has_active_subscription: hasActive }),
      });
      return res.status >= 200 && res.status < 300;
    } catch {
      return false;
    }
  }
}

export const defaultApiClient = new ApiClient();
