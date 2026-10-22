import axios from 'axios';
import crypto from 'crypto';
import { env } from '../config/env';
import { supabaseAdmin } from '../config/supabase';

export interface SendOtpResult {
  success: boolean;
  message: string;
  cooldownRemaining?: number;
  messageId?: string;
  mocked?: boolean;
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  attemptsRemaining?: number;
}

interface StoredOtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  verified: boolean;
}

export class VonageService {
  private static otpStore: Map<string, StoredOtpRecord> = new Map();
  private readonly OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
  private readonly RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
  private readonly MAX_ATTEMPTS = 5;

  /**
   * Normalizes country prefix and phone number to E.164 digits-only string
   */
  public normalizePhone(prefix: string = '+507', phoneNumber: string = ''): string {
    const cleanPrefix = (prefix || '').replace(/\D/g, '');
    const cleanNumber = (phoneNumber || '').replace(/\D/g, '');
    return `${cleanPrefix}${cleanNumber}`;
  }

  /**
   * Generates a cryptographically secure 6-digit numeric OTP
   */
  public generateOtpCode(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Sends 6-digit verification code via Vonage SMS API
   */
  public async sendOtp(
    prefix: string,
    phoneNumber: string,
    customMessage?: string
  ): Promise<SendOtpResult> {
    const normalized = this.normalizePhone(prefix, phoneNumber);

    if (!normalized || normalized.length < 8 || normalized.length > 16) {
      return {
        success: false,
        message: 'Número de teléfono inválido. Debe contener entre 8 y 16 dígitos con su prefijo.',
      };
    }

    const now = Date.now();
    const existing = VonageService.otpStore.get(normalized);

    // Cooldown check
    if (existing && now - existing.lastSentAt < this.RESEND_COOLDOWN_MS) {
      const cooldownRemaining = Math.ceil(
        (this.RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000
      );
      return {
        success: false,
        message: `Por favor espera ${cooldownRemaining} segundos antes de solicitar otro código.`,
        cooldownRemaining,
      };
    }

    const code = this.generateOtpCode();
    VonageService.otpStore.set(normalized, {
      code,
      expiresAt: now + this.OTP_EXPIRATION_MS,
      attempts: 0,
      lastSentAt: now,
      verified: false,
    });

    const smsBody =
      customMessage ||
      `Tu código de verificación de Tattoo Hub es: ${code}. Válido por 10 minutos. No lo compartas con nadie.`;

    // Dispatch via Vonage REST SMS API
    try {
      const response = await axios.post(
        'https://rest.nexmo.com/sms/json',
        {
          api_key: env.VONAGE_API_KEY,
          api_secret: env.VONAGE_API_SECRET,
          to: normalized,
          from: env.VONAGE_FROM || 'TattooHub',
          text: smsBody,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      const msg = response.data?.messages?.[0];
      if (msg && msg.status === '0') {
        return {
          success: true,
          message: 'Código de verificación de 6 dígitos enviado por SMS.',
          messageId: msg['message-id'],
        };
      }

      const errorText = msg?.['error-text'] || 'Error al despachar SMS con Vonage';
      console.warn(`[VonageService] Vonage SMS warning status ${msg?.status}: ${errorText}`);

      // If in sandbox or carrier restriction occurs, allow graceful degradation for dev/testing
      if (env.NODE_ENV === 'test' || env.NODE_ENV === 'development') {
        return {
          success: true,
          message: 'Código de verificación generado (Modo seguro/simulado).',
          mocked: true,
        };
      }

      return {
        success: false,
        message: `No se pudo enviar el SMS (${errorText}). Verifica que el número sea válido.`,
      };
    } catch (err: any) {
      console.error('[VonageService] Network error sending SMS:', err?.message || err);

      if (env.NODE_ENV === 'test' || env.NODE_ENV === 'development') {
        return {
          success: true,
          message: 'Código de verificación generado (Simulación de entorno).',
          mocked: true,
        };
      }

      return {
        success: false,
        message: 'Error de conexión con el proveedor de SMS. Inténtalo de nuevo más tarde.',
      };
    }
  }

  /**
   * Verifies the 6-digit OTP code entered by the user
   */
  public verifyOtp(prefix: string, phoneNumber: string, code: string): VerifyOtpResult {
    const normalized = this.normalizePhone(prefix, phoneNumber);
    const cleanedCode = (code || '').trim();

    if (!cleanedCode || cleanedCode.length !== 6 || !/^\d{6}$/.test(cleanedCode)) {
      return {
        success: false,
        message: 'El código de verificación debe contener exactamente 6 dígitos numéricos.',
      };
    }

    const record = VonageService.otpStore.get(normalized);
    if (!record) {
      return {
        success: false,
        message: 'No hay un código activo para este número. Solicita un nuevo código.',
      };
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      VonageService.otpStore.delete(normalized);
      return {
        success: false,
        message: 'El código ha expirado. Por favor solicita uno nuevo.',
      };
    }

    if (record.attempts >= this.MAX_ATTEMPTS) {
      VonageService.otpStore.delete(normalized);
      return {
        success: false,
        message: 'Has superado el número máximo de intentos fallidos. Solicita un nuevo código.',
      };
    }

    if (record.code !== cleanedCode) {
      record.attempts += 1;
      const attemptsRemaining = this.MAX_ATTEMPTS - record.attempts;
      return {
        success: false,
        message: `Código incorrecto. Te quedan ${attemptsRemaining} intento(s).`,
        attemptsRemaining,
      };
    }

    // Success: mark as verified and clear code
    record.verified = true;
    VonageService.otpStore.delete(normalized);

    return {
      success: true,
      message: 'Número de teléfono verificado exitosamente.',
    };
  }

  /**
   * Persists phone verification status into Supabase DB and User Metadata
   */
  public async persistVerifiedPhone(
    userId: string,
    prefix: string,
    phoneNumber: string
  ): Promise<{ success: boolean; error?: any }> {
    try {
      const cleanPrefix = prefix.startsWith('+') ? prefix : `+${prefix.replace(/\D/g, '')}`;
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const verifiedAt = new Date().toISOString();

      // 1. Update user_profiles table
      await supabaseAdmin.from('user_profiles').upsert({
        id: userId,
        phone_number: cleanPhone,
        phone_prefix: cleanPrefix,
        phone_verified: true,
        phone_verified_at: verifiedAt,
        updated_at: verifiedAt,
      });

      // 2. Update user_metadata in Supabase Auth
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          phone_number: cleanPhone,
          phone_prefix: cleanPrefix,
          phone_verified: true,
          phone_verified_at: verifiedAt,
        },
      });

      // 3. Update tatuadores_data if user is an artist
      const { data: artistRecord } = await supabaseAdmin
        .from('tatuadores_data')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (artistRecord) {
        const mergedData = {
          ...(artistRecord.data || {}),
          telefono: cleanPhone,
          whatsapp_number: cleanPhone,
          phone_prefix: cleanPrefix,
          phone_verified: true,
          phone_verified_at: verifiedAt,
        };

        await supabaseAdmin.from('tatuadores_data').upsert({
          id: userId,
          data: mergedData,
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error('[VonageService] Error persisting verified phone:', err?.message || err);
      return { success: false, error: err?.message || err };
    }
  }

  /**
   * Inspect current OTP for testing purposes
   */
  public getActiveOtpForTesting(prefix: string, phoneNumber: string): string | null {
    const normalized = this.normalizePhone(prefix, phoneNumber);
    return VonageService.otpStore.get(normalized)?.code || null;
  }

  /**
   * Clear all stored OTPs (for tests)
   */
  public clearAllOtps(): void {
    VonageService.otpStore.clear();
  }
}

export const vonageService = new VonageService();
