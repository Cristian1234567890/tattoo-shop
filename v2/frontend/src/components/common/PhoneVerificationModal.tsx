import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Phone,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { api } from '../../api/client';
import { COUNTRIES, CountryData } from '../../utils/countries';
import { CustomSelect, SelectOption } from './CustomSelect';
import { OtpVerificationInput } from './OtpVerificationInput';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhone?: string;
  currentPrefix?: string;
  isChangeMode?: boolean;
  onVerified: (verifiedPhone: string, verifiedPrefix: string) => void;
}

const COUNTRY_OPTIONS: SelectOption[] = COUNTRIES.map((c) => ({
  value: c.dialCode,
  label: `${c.label} (${c.dialCode})`,
  flag: c.flag,
  code: c.code,
}));

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  currentPhone = '',
  currentPrefix = '+507',
  isChangeMode = false,
  onVerified,
}) => {
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [selectedPrefix, setSelectedPrefix] = useState<string>(currentPrefix || '+507');
  const [phoneNumber, setPhoneNumber] = useState<string>(currentPhone || '');
  const [otpCode, setOtpCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  // Synchronize initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPrefix(currentPrefix || '+507');
      setPhoneNumber(currentPhone || '');
      setOtpCode('');
      setErrorMsg(null);
      setStep('input');
    }
  }, [isOpen, currentPhone, currentPrefix]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  if (!isOpen) return null;

  const currentCountryObj: CountryData | undefined = COUNTRIES.find(
    (c) => c.dialCode === selectedPrefix
  );

  const handleSendCode = async () => {
    setErrorMsg(null);
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 6) {
      setErrorMsg('Por favor ingresa un número de teléfono válido.');
      return;
    }

    setIsLoading(true);
    try {
      const res = isChangeMode
        ? await api.requestPhoneChange(selectedPrefix, cleanNumber)
        : await api.sendPhoneOtp(selectedPrefix, cleanNumber);

      if (res.success) {
        setStep('otp');
        setCooldown(60);
      } else {
        setErrorMsg(res.error || 'No se pudo enviar el SMS. Intenta de nuevo.');
        if (res.cooldownRemaining) {
          setCooldown(res.cooldownRemaining);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode).trim();
    if (!code || code.length !== 6) {
      setErrorMsg('El código debe tener exactamente 6 dígitos.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    try {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const res = isChangeMode
        ? await api.confirmPhoneChange(selectedPrefix, cleanNumber, code)
        : await api.verifyPhoneOtp(selectedPrefix, cleanNumber, code);

      if (res.success) {
        setStep('success');
        onVerified(cleanNumber, selectedPrefix);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setErrorMsg(res.error || 'Código incorrecto o expirado.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al validar el código.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="phone-modal-title"
          className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8"
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
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-orange-500/20 text-primary border border-primary/30 mb-3 shadow-inner">
              {step === 'success' ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              ) : (
                <ShieldCheck className="w-7 h-7" />
              )}
            </div>
            <h2
              id="phone-modal-title"
              className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              {step === 'success'
                ? '¡Teléfono Verificado!'
                : step === 'otp'
                ? 'Ingresa el Código de 6 Dígitos'
                : isChangeMode
                ? 'Cambiar Número de Teléfono'
                : 'Verificar Número de Teléfono'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              {step === 'success'
                ? 'Tu número ha sido validado exitosamente con Vonage SMS.'
                : step === 'otp'
                ? `Hemos enviado un código SMS al ${selectedPrefix} ${phoneNumber}.`
                : 'Protegemos a la comunidad de clientes y artistas verificando que tu número sea real mediante SMS.'}
            </p>
          </div>

          {/* Error notification banner */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Step 1: Input Phone */}
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-1.5">
                  País y Prefijo Internacional
                </label>
                <CustomSelect
                  options={COUNTRY_OPTIONS}
                  value={selectedPrefix}
                  onChange={(val) => setSelectedPrefix(val)}
                  placeholder="Selecciona país"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-1.5">
                  Número Móvil
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-slate-400 pointer-events-none">
                    <Phone className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {selectedPrefix}
                    </span>
                  </div>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={currentCountryObj?.placeholder || '6123 4567'}
                    className="w-full pl-24 pr-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white font-mono text-sm focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendCode}
                disabled={isLoading || cooldown > 0}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-[#ff7a29] text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:brightness-105 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando SMS vía Vonage...
                  </>
                ) : cooldown > 0 ? (
                  `Espera ${cooldown}s para reenviar`
                ) : (
                  <>
                    Enviar Código de 6 Dígitos
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: 6-Digit OTP */}
          {step === 'otp' && (
            <div className="space-y-6">
              <OtpVerificationInput
                value={otpCode}
                onChange={setOtpCode}
                onComplete={(code) => handleVerifyCode(code)}
                disabled={isLoading}
                isError={Boolean(errorMsg)}
              />

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleVerifyCode()}
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-[#ff7a29] text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:brightness-105 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Validando Código...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Confirmar Verificación
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-gray-300 font-semibold underline cursor-pointer"
                  >
                    Cambiar número
                  </button>

                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={cooldown > 0 || isLoading}
                    className="inline-flex items-center gap-1 text-primary hover:text-orange-500 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar SMS'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Success Celebration */}
          {step === 'success' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-6 text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">
                ¡Número Verificado con Éxito!
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">
                {selectedPrefix} {phoneNumber}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
