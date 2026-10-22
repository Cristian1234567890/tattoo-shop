import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Loader2,
} from 'lucide-react';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../api/supabase';
import { PhoneVerificationModal } from '../common/PhoneVerificationModal';
import { TwoFactorAuthModal } from '../common/TwoFactorAuthModal';

interface ClientSecuritySettingsSectionProps {
  user: User | null;
  lang?: 'es' | 'en';
  onShowToast: (message: string, isError?: boolean) => void;
}

export const ClientSecuritySettingsSection: React.FC<ClientSecuritySettingsSectionProps> = ({
  user,
  lang = 'es',
  onShowToast,
}) => {
  const { updateUserMetadata } = useAuth();

  const meta = user?.user_metadata || {};
  const currentPhone = meta.telefono || meta.phone_number || '';
  const currentPrefix = meta.phone_prefix || '+507';
  const isPhoneVerified = Boolean((user as any)?.phone_verified || meta.phone_verified);

  // Phone states
  const [phone, setPhone] = useState<string>(currentPhone);
  const [phonePrefix, setPhonePrefix] = useState<string>(currentPrefix);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
  const [isPhoneChangeMode, setIsPhoneChangeMode] = useState<boolean>(false);

  // Email change states
  const [isChangingEmail, setIsChangingEmail] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>('');
  const [isEmailLoading, setIsEmailLoading] = useState<boolean>(false);

  // 2FA states
  const [is2faModalOpen, setIs2faModalOpen] = useState<boolean>(false);
  const [is2faEnrolled, setIs2faEnrolled] = useState<boolean>(false);
  const [activeFactorId, setActiveFactorId] = useState<string>('');

  // Password reset state
  const [isSendingResetEmail, setIsSendingResetEmail] = useState<boolean>(false);

  // Check 2FA factor status from Supabase MFA API
  useEffect(() => {
    if (!user) return;
    supabase.auth.mfa
      .listFactors()
      .then(({ data, error }) => {
        if (!error && data?.totp && data.totp.length > 0) {
          const verified = data.totp.find((f: any) => f.status === 'verified');
          if (verified) {
            setIs2faEnrolled(true);
            setActiveFactorId(verified.id);
          } else {
            setIs2faEnrolled(false);
          }
        } else {
          setIs2faEnrolled(false);
        }
      })
      .catch(() => {});
  }, [user]);

  // Handle email update via Supabase
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      onShowToast(
        lang === 'en' ? 'Please enter a valid email.' : 'Por favor ingresa un correo electrónico válido.',
        true
      );
      return;
    }

    setIsEmailLoading(true);
    try {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/client-dashboard?tab=configuracion`
          : undefined;

      const { error } = await supabase.auth.updateUser(
        { email: newEmail.trim() },
        { emailRedirectTo: redirectUrl }
      );

      if (error) throw error;

      onShowToast(
        lang === 'en'
          ? 'Confirmation sent! Please check both your current and new email addresses to confirm.'
          : '¡Solicitud enviada! Supabase ha enviado un enlace de confirmación a tu nuevo y antiguo correo.',
        false
      );
      setIsChangingEmail(false);
      setNewEmail('');
    } catch (err: any) {
      onShowToast(err?.message || 'Error al solicitar cambio de correo.', true);
    } finally {
      setIsEmailLoading(false);
    }
  };

  // Handle native password reset via Supabase email
  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    setIsSendingResetEmail(true);
    try {
      const redirectTo = `${window.location.origin}/change-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo,
      });

      if (error) throw error;

      onShowToast(
        lang === 'en'
          ? 'Password reset link sent to your email.'
          : 'Hemos enviado un enlace seguro para restablecer tu contraseña a tu correo.',
        false
      );
    } catch (err: any) {
      onShowToast(err?.message || 'Error al enviar correo de restablecimiento.', true);
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-850/90 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-500 dark:text-violet-400">
          <Lock size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {lang === 'en' ? 'Security & Credentials' : 'Seguridad & Credenciales'}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400">
            {lang === 'en'
              ? 'Manage your email, Vonage SMS phone verification, and two-factor authentication (2FA).'
              : 'Gestiona tu correo electrónico, verificación telefónica vía SMS con Vonage y autenticación en dos pasos (2FA).'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Email Management */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-primary" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {lang === 'en' ? 'Email Address' : 'Correo Electrónico'}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {lang === 'en' ? 'Active' : 'Activo'}
            </span>
          </div>

          <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-gray-800 p-3 rounded-xl border border-slate-200 dark:border-gray-700 truncate">
            {user?.email || 'Sin correo registrado'}
          </p>

          {isChangingEmail ? (
            <form onSubmit={handleUpdateEmail} className="space-y-3 pt-2">
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nuevo-correo@ejemplo.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-xs outline-none focus:border-primary transition"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isEmailLoading}
                  className="flex-1 py-2 px-3 rounded-xl bg-primary text-white font-bold text-xs hover:brightness-105 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isEmailLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirmar Cambio'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingEmail(false);
                    setNewEmail('');
                  }}
                  className="py-2 px-3 rounded-xl border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsChangingEmail(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-800 dark:text-gray-200 font-bold text-xs transition cursor-pointer"
            >
              {lang === 'en' ? 'Change Email Address' : 'Cambiar Correo Electrónico'}
            </button>
          )}
        </div>

        {/* Card 2: Vonage Phone Verification */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-emerald-500" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {lang === 'en' ? 'Phone Verification (Vonage)' : 'Verificación Telefónica (Vonage)'}
              </span>
            </div>
            {isPhoneVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                {lang === 'en' ? 'Verified' : 'Verificado'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <ShieldAlert className="w-3 h-3" />
                {lang === 'en' ? 'Unverified' : 'No verificado'}
              </span>
            )}
          </div>

          <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-gray-800 p-3 rounded-xl border border-slate-200 dark:border-gray-700">
            {phone ? `${phonePrefix} ${phone}` : (lang === 'en' ? 'No phone registered' : 'Sin teléfono registrado')}
          </p>

          <button
            type="button"
            onClick={() => {
              setIsPhoneChangeMode(Boolean(isPhoneVerified));
              setIsPhoneModalOpen(true);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            {isPhoneVerified
              ? (lang === 'en' ? 'Change Phone Number' : 'Cambiar Número de Teléfono')
              : (lang === 'en' ? 'Verify with 6-Digit SMS' : 'Verificar con SMS de 6 Dígitos')}
          </button>
        </div>

        {/* Card 3: Two-Factor Authentication (2FA TOTP) */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-violet-500" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {lang === 'en' ? 'Two-Factor Auth (2FA)' : 'Autenticación en Dos Pasos (2FA)'}
              </span>
            </div>
            {is2faEnrolled ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                <ShieldCheck className="w-3 h-3" />
                {lang === 'en' ? 'Protected' : 'Protegido'}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300">
                {lang === 'en' ? 'Disabled' : 'Desactivado'}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
            {lang === 'en'
              ? 'Adds an extra layer of security using Google Authenticator, 1Password, Authy or Apple Passwords.'
              : 'Añade una capa de protección adicional mediante un código dinámico en tu app autenticadora.'}
          </p>

          <button
            type="button"
            onClick={() => setIs2faModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl border border-violet-500/30 hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold text-xs transition cursor-pointer"
          >
            {is2faEnrolled
              ? (lang === 'en' ? 'Manage 2FA / Disable' : 'Administrar 2FA / Desactivar')
              : (lang === 'en' ? 'Set Up 2FA (QR Code)' : 'Configurar 2FA (Código QR)')}
          </button>
        </div>

        {/* Card 4: Password Recovery via Supabase Email */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-white/5 space-y-4">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {lang === 'en' ? 'Password Recovery' : 'Recuperación de Contraseña'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
            {lang === 'en'
              ? 'Request a secure password reset link dispatched natively through Supabase Email.'
              : 'Solicita un enlace seguro para actualizar tu contraseña enviado directamente por Supabase a tu buzón.'}
          </p>

          <button
            type="button"
            onClick={handleSendPasswordReset}
            disabled={isSendingResetEmail}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-800 dark:text-gray-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSendingResetEmail ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Enviando enlace...
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5 text-primary" />
                {lang === 'en' ? 'Send Password Reset Email' : 'Enviar Correo de Reseteo'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        currentPhone={phone}
        currentPrefix={phonePrefix}
        isChangeMode={isPhoneChangeMode}
        onVerified={(verifiedPhone, verifiedPrefix) => {
          setPhone(verifiedPhone);
          setPhonePrefix(verifiedPrefix);
          updateUserMetadata({
            phone_number: `${verifiedPrefix} ${verifiedPhone}`.trim(),
            telefono: verifiedPhone,
            phone_prefix: verifiedPrefix,
            phone_verified: true,
          });
          onShowToast(
            lang === 'en'
              ? 'Phone number verified successfully with Vonage!'
              : '¡Número verificado exitosamente con Vonage SMS!',
            false
          );
        }}
      />

      <TwoFactorAuthModal
        isOpen={is2faModalOpen}
        onClose={() => setIs2faModalOpen(false)}
        isEnrolled={is2faEnrolled}
        activeFactorId={activeFactorId}
        onStatusChange={(enrolled) => {
          setIs2faEnrolled(enrolled);
          onShowToast(
            enrolled
              ? (lang === 'en' ? '2FA activated successfully!' : '¡Autenticación 2FA activada con éxito!')
              : (lang === 'en' ? '2FA disabled.' : 'Autenticación 2FA desactivada.'),
            false
          );
        }}
      />
    </section>
  );
};
