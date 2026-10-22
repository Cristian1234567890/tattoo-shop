import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '../../api/supabase';
import { OtpVerificationInput } from './OtpVerificationInput';

interface TwoFactorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnrolled: boolean;
  activeFactorId?: string;
  onStatusChange: (enrolled: boolean) => void;
}

export const TwoFactorAuthModal: React.FC<TwoFactorAuthModalProps> = ({
  isOpen,
  onClose,
  isEnrolled,
  activeFactorId,
  onStatusChange,
}) => {
  const [step, setStep] = useState<'enroll' | 'disable' | 'success'>('enroll');
  const [factorId, setFactorId] = useState<string>(activeFactorId || '');
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg(null);
    setOtpCode('');

    if (isEnrolled) {
      setStep('disable');
    } else {
      setStep('enroll');
      startEnrollment();
    }
  }, [isOpen, isEnrolled]);

  const startEnrollment = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'TattooHub Authenticator',
      });

      if (error) throw error;
      if (data) {
        setFactorId(data.id);
        setQrCodeSvg(data.totp?.qr_code || '');
        setSecretKey(data.totp?.secret || '');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al inicializar la autenticación 2FA con Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEnrollment = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode).trim();
    if (!code || code.length !== 6) {
      setErrorMsg('Ingresa los 6 dígitos generados por tu aplicación autenticadora.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) throw verifyError;

      setStep('success');
      onStatusChange(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Código 2FA incorrecto o expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const idToUnenroll = factorId || activeFactorId;
      if (!idToUnenroll) {
        // Find existing TOTP factor
        const { data: factors, error: listErr } = await supabase.auth.mfa.listFactors();
        if (listErr) throw listErr;
        const totp = factors?.totp?.[0];
        if (!totp) {
          onStatusChange(false);
          onClose();
          return;
        }
        const { error } = await supabase.auth.mfa.unenroll({ factorId: totp.id });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: idToUnenroll });
        if (error) throw error;
      }

      setStep('success');
      onStatusChange(false);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al desactivar 2FA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (!secretKey) return;
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="two-factor-title"
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-500/20 to-primary/20 text-violet-500 dark:text-violet-400 border border-violet-500/30 mb-3 shadow-inner">
              {step === 'success' ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              ) : step === 'disable' ? (
                <ShieldAlert className="w-7 h-7 text-amber-500" />
              ) : (
                <Shield className="w-7 h-7" />
              )}
            </div>
            <h2
              id="two-factor-title"
              className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              {step === 'success'
                ? isEnrolled
                  ? '¡2FA Desactivado!'
                  : '¡2FA Activado Exitosamente!'
                : step === 'disable'
                ? 'Desactivar Autenticación 2FA'
                : 'Configurar Autenticación en Dos Pasos (2FA)'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              {step === 'disable'
                ? 'Al desactivar 2FA, tu cuenta solo requerirá contraseña o inicio de sesión con Google.'
                : 'Protege tu cuenta de Tattoo Hub vinculando Google Authenticator, 1Password, Authy o Apple Passwords.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step Enroll: QR Code & Code Input */}
          {step === 'enroll' && (
            <div className="space-y-5">
              {isLoading && !qrCodeSvg ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs text-slate-500">Generando llave secreta de Supabase...</p>
                </div>
              ) : (
                <>
                  {/* QR Code Container */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700">
                    {qrCodeSvg ? (
                      <div
                        className="w-48 h-48 bg-white p-2 rounded-xl shadow-md flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                      />
                    ) : (
                      <div className="w-48 h-48 bg-slate-200 dark:bg-gray-700 animate-pulse rounded-xl" />
                    )}

                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-3 text-center">
                      1. Escanea este código QR con tu app de autenticación preferida.
                    </p>
                  </div>

                  {/* Manual Key */}
                  {secretKey && (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-between gap-2">
                      <div className="overflow-hidden">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Clave manual
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                          {secretKey}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 shadow-xs transition shrink-0 cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* 6-Digit input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 text-center mb-2">
                      2. Digita el código de 6 dígitos que muestra tu app
                    </label>
                    <OtpVerificationInput
                      value={otpCode}
                      onChange={setOtpCode}
                      onComplete={(code) => handleVerifyEnrollment(code)}
                      disabled={isLoading}
                      isError={Boolean(errorMsg)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerifyEnrollment()}
                    disabled={isLoading || otpCode.length !== 6}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verificando 2FA...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Confirmar y Activar 2FA
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step Disable 2FA */}
          {step === 'disable' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
                <p className="font-bold mb-1">¿Deseas desactivar la verificación en dos pasos?</p>
                <p>
                  Reducirá el nivel de protección de tu cuenta. Podrás volver a activarla cuando lo
                  desees.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDisable2FA}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Sí, Desactivar 2FA'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="py-6 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">
                Operación completada con éxito
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
