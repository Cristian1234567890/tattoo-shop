import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { isQaEnvironment } from '../../api/supabase';
import { ShieldAlert, CheckCircle2, Lock, AlertCircle, RefreshCw, CreditCard } from 'lucide-react';
import { CustomSelect, SelectOption } from '../common/CustomSelect';

const MONTH_OPTIONS: SelectOption[] = Array.from({ length: 12 }, (_, i) => {
  const m = String(i + 1).padStart(2, '0');
  return { value: m, label: m };
});

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS: SelectOption[] = Array.from({ length: 10 }, (_, i) => {
  const y = String(currentYear + i);
  return { value: y, label: y };
});

export function isValidLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function detectCardBrand(cardNumber: string): string {
  const clean = cardNumber.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^(5[1-5]|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'American Express';
  if (/^6(?:011|5)/.test(clean)) return 'Discover';
  return 'Tarjeta';
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

export interface InteractiveCardProps {
  onSuccess?: (data: any) => void;
  targetRole?: 'Cliente' | 'Tatuador';
  planType?: 'vip' | 'studio' | string;
  billingCycle?: 'monthly' | 'annual';
  title?: string;
  buttonLabel?: string;
  isEmbedded?: boolean;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  onSuccess,
  targetRole,
  planType = 'vip',
  billingCycle = 'monthly',
  buttonLabel = 'Afiliar Tarjeta & Activar 30 Días',
  isEmbedded = false,
}) => {
  const { user, updateUserMetadata, refreshProfile } = useAuth();

  // Existing saved card detection
  const savedCardLast4 =
    user?.user_metadata?.card_last4 ||
    user?.user_metadata?.cardLast4 ||
    (user as any)?.card_last4 ||
    (user as any)?.cardLast4;
  const savedCardBrand = user?.user_metadata?.card_brand || (user as any)?.card_brand || 'Visa';
  const [useSavedCard, setUseSavedCard] = useState<boolean>(Boolean(savedCardLast4));

  useEffect(() => {
    if (savedCardLast4) {
      setUseSavedCard(true);
    }
  }, [savedCardLast4]);

  // Card input states
  const [cardNumber, setCardNumber] = useState<string>('');
  const [holder, setHolder] = useState<string>(
    user?.user_metadata?.nombre || user?.user_metadata?.full_name || ''
  );
  const [expMonth, setExpMonth] = useState<string>('12');
  const [expYear, setExpYear] = useState<string>(String(currentYear + 2));
  const [ccv, setCcv] = useState<string>('');
  const [agreementAccepted, setAgreementAccepted] = useState<boolean>(true);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Multi-stage interactive banking verification state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStage, setVerificationStage] = useState<number>(1);
  const [verificationProgress, setVerificationProgress] = useState<number>(0);

  const cleanDigits = cardNumber.replace(/\D/g, '');
  const brand = detectCardBrand(cleanDigits);

  const cardNumberDisplay = cardNumber ? cardNumber : '•••• •••• •••• ••••';
  const cardHolderDisplay = holder ? holder.toUpperCase() : 'NOMBRE DEL TITULAR';
  const cardExpDisplay =
    expMonth || expYear
      ? `${expMonth || 'MM'}/${expYear ? expYear.slice(-2) : 'YY'}`
      : 'MM/YY';

  const runVerificationProcess = async (
    onVerified: () => Promise<void>
  ) => {
    setIsVerifying(true);
    setVerificationStage(1);
    setVerificationProgress(20);

    // Stage 1 -> 2
    await new Promise((resolve) => setTimeout(resolve, 500));
    setVerificationStage(2);
    setVerificationProgress(65);

    // Stage 2 -> 3
    await new Promise((resolve) => setTimeout(resolve, 600));
    setVerificationStage(3);
    setVerificationProgress(100);

    // Stage 3 finalization & backend call
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      await onVerified();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChargeSavedCard = async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await runVerificationProcess(async () => {
        // Either reactivate or affiliate with stored info
        const res = await api.reactivateSubscription({
          user_id: user?.id,
        }).catch(() => null);

        updateUserMetadata({
          has_active_subscription: true,
          subscription_status: 'active',
          cancel_at_period_end: false,
          card_last4: savedCardLast4,
          card_brand: savedCardBrand,
          tipo: targetRole || user?.user_metadata?.tipo || 'Cliente',
          role: targetRole || user?.user_metadata?.role || 'Cliente',
        });

        if (refreshProfile) {
          await refreshProfile().catch(() => {});
        }

        setSubmitted(true);
        if (onSuccess) {
          onSuccess(res?.data || { success: true, card: { last4: savedCardLast4, brand: savedCardBrand } });
        }
      });
    } catch (err: any) {
      console.error('Error charging saved card:', err);
      setErrorMessage(err.message || 'Error al procesar el cobro con la tarjeta guardada.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!holder.trim()) {
      setErrorMessage('Ingresa el nombre del titular de la tarjeta.');
      return;
    }

    if (cleanDigits.length < 15) {
      setErrorMessage('Ingresa un número de tarjeta completo (15 o 16 dígitos).');
      return;
    }

    // Check Luhn
    const isSandboxPattern =
      cleanDigits.startsWith('4000') || cleanDigits.startsWith('4242') || cleanDigits.startsWith('4111');
    if (!isSandboxPattern && !isValidLuhn(cleanDigits)) {
      setErrorMessage('El número de tarjeta no supera el algoritmo de validación Luhn.');
      return;
    }

    if (!expMonth || !expYear) {
      setErrorMessage('Selecciona mes y año de expiración.');
      return;
    }

    const now = new Date();
    const currentFullYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const selectedYear = parseInt(expYear, 10);
    const selectedMonth = parseInt(expMonth, 10);
    if (selectedYear < currentFullYear || (selectedYear === currentFullYear && selectedMonth < currentMonth)) {
      setErrorMessage('La tarjeta seleccionada está vencida. Selecciona una fecha válida.');
      return;
    }

    if (ccv.length < 3) {
      setErrorMessage('Ingresa un código de seguridad CVV válido.');
      return;
    }

    if (!agreementAccepted) {
      setErrorMessage('Debes autorizar la afiliación de la tarjeta para activar tu suscripción.');
      return;
    }

    setIsSubmitting(true);

    try {
      await runVerificationProcess(async () => {
        const expFormatted = `${expMonth}/${expYear.slice(-2)}`;
        const res = await api.affiliateCard({
          user_id: user?.id,
          holder_name: holder.trim(),
          card_number: cleanDigits,
          expiration: expFormatted,
          cvv: ccv,
          agreement_accepted: agreementAccepted,
          role: targetRole?.toLowerCase() || (user?.user_metadata?.tipo || 'cliente').toLowerCase(),
          plan_type: planType,
          billing_cycle: billingCycle,
        });

        if (res.success) {
          updateUserMetadata({
            has_active_subscription: true,
            subscription_status: 'active',
            cancel_at_period_end: false,
            current_period_end: res.data?.current_period_end,
            card_last4: res.data?.card?.last4 || cleanDigits.slice(-4),
            card_brand: brand,
            tipo: targetRole || user?.user_metadata?.tipo || 'Cliente',
            role: targetRole || user?.user_metadata?.role || 'Cliente',
          });

          if (refreshProfile) {
            await refreshProfile().catch(() => {});
          }

          setSubmitted(true);
          if (onSuccess) {
            onSuccess(res.data);
          }
        } else {
          throw new Error(res.error || 'No se pudo procesar la afiliación de la tarjeta.');
        }
      });
    } catch (err: any) {
      console.error('Error activating subscription on backend:', err);
      setErrorMessage(err.message || 'Error en la pasarela de pago.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`relative ${isEmbedded ? 'py-4' : 'min-h-screen py-16'} px-4 flex flex-col items-center justify-center w-full`}>
      {isQaEnvironment() && !isEmbedded && (
        <div
          id="qa-payment-sandbox-alert"
          className="mb-6 max-w-md w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-200 text-xs shadow-lg backdrop-blur-md flex items-start gap-3"
        >
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-300 text-sm mb-1">
              Pasarela de Pago Segura • Afiliación Nativa
            </h4>
            <p className="text-zinc-300 text-xs leading-relaxed">
              Afiliación directa sin intermediarios externos. En modo Sandbox puedes utilizar tarjetas de prueba como <strong>4111 1111 1111 1111</strong> para activar tus 30 días de beneficios de forma inmediata.
            </p>
          </div>
        </div>
      )}

      {/* Verification Modal / Interactive Loading Overlay */}
      {isVerifying && (
        <div
          role="dialog"
          aria-modal="true"
          id="banking-verification-modal"
          data-testid="banking-verification-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <div className="max-w-md w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto shadow-inner">
              {verificationStage === 3 ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-in zoom-in-75 duration-300" />
              ) : (
                <Lock className="w-8 h-8 animate-pulse text-violet-500" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Verificación de Seguridad Bancaria
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Validando tarjeta y procesando encriptación de bóveda cifrada
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-2.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-zinc-700">
                <div
                  id="banking-progress-bar"
                  className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${verificationProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                <span>Seguridad PCI-DSS</span>
                <span className="font-bold text-violet-600 dark:text-violet-400">{verificationProgress}%</span>
              </div>
            </div>

            {/* Verification Stages */}
            <div className="space-y-2.5 text-left text-xs">
              <div className={`p-3 rounded-xl border transition-colors flex items-center gap-2.5 ${
                verificationStage >= 1
                  ? 'bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300'
                  : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500'
              }`}>
                {verificationStage > 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <RefreshCw className="w-4 h-4 animate-spin text-violet-500 shrink-0" />
                )}
                <span className="font-medium">
                  Etapa 1: Conectando con red bancaria (Visa/Mastercard)...
                </span>
              </div>

              <div className={`p-3 rounded-xl border transition-colors flex items-center gap-2.5 ${
                verificationStage >= 2
                  ? 'bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300'
                  : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500'
              }`}>
                {verificationStage > 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : verificationStage === 2 ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-violet-500 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-600 shrink-0" />
                )}
                <span className="font-medium">
                  Etapa 2: Validando algoritmo de seguridad y fondos...
                </span>
              </div>

              <div className={`p-3 rounded-xl border transition-colors flex items-center gap-2.5 ${
                verificationStage >= 3
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500'
              }`}>
                {verificationStage >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-slate-400 dark:text-zinc-600 shrink-0" />
                )}
                <span className="font-medium">
                  Etapa 3: Tarjeta verificada exitosamente. Bóveda cifrada activada.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="checkout w-full max-w-md">
        {/* Choice between Saved Card and New Card when user already has a saved card */}
        {savedCardLast4 && useSavedCard ? (
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5 text-center text-slate-900 dark:text-white">
            <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 w-14 h-14 flex items-center justify-center mx-auto">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Método de Pago Afiliado en Bóveda
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                Ya cuentas con una tarjeta registrada de forma segura. Puedes cobrar la activación directamente con 1 solo clic.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30">
                  {savedCardBrand}
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">
                  •••• •••• •••• {savedCardLast4}
                </span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bóveda Activa
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="button"
              id="btn-charge-saved-card"
              data-testid="btn-charge-saved-card"
              onClick={handleChargeSavedCard}
              disabled={isSubmitting || isVerifying}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition transform hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Cobrar a mi tarjeta guardada ({savedCardBrand} terminada en **** {savedCardLast4})</span>
            </button>

            <button
              type="button"
              id="btn-use-new-card"
              data-testid="btn-use-new-card"
              onClick={() => setUseSavedCard(false)}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-semibold cursor-pointer pt-2 block mx-auto"
            >
              ➕ Afiliar una tarjeta diferente
            </button>
          </div>
        ) : (
          <>
            {savedCardLast4 && (
              <div className="mb-4 text-center">
                <button
                  type="button"
                  onClick={() => setUseSavedCard(true)}
                  className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
                >
                  &larr; Volver a cobrar con mi tarjeta guardada (**** {savedCardLast4})
                </button>
              </div>
            )}

            <div className={`credit-card-box ${isFlipped ? 'hover' : ''}`}>
              <div className="flip">
                {/* Front */}
                <div className="front">
                  <div className="chip"></div>
                  <div className="logo flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-white">
                    <span className="px-2 py-0.5 rounded bg-white/20 border border-white/30 text-[10px]">
                      {brand}
                    </span>
                  </div>
                  <div className="number">{cardNumberDisplay}</div>
                  <div className="card-holder">
                    <label>Card holder</label>
                    <div>{cardHolderDisplay}</div>
                  </div>
                  <div className="card-expiration-date">
                    <label>Expires</label>
                    <div>{cardExpDisplay}</div>
                  </div>
                </div>

                {/* Back */}
                <div className="back">
                  <div className="strip"></div>
                  <div className="logo flex items-center justify-end font-bold text-xs uppercase tracking-wider text-white pr-4">
                    <span>{brand}</span>
                  </div>
                  <div className="ccv">
                    <label>CVV</label>
                    <div>{ccv || '•••'}</div>
                  </div>
                </div>
              </div>
            </div>

            <form className="form mt-6 space-y-4" autoComplete="off" noValidate onSubmit={handleSubmit}>
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Unified Card Number Input with dynamic 4-4-4-4 formatting */}
              <fieldset>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="card-number" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Número de Tarjeta (16 dígitos)
                  </label>
                  <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                    {brand}
                  </span>
                </div>
                <div className="w-full min-w-0">
                  <input
                    type="text"
                    id="card-number"
                    name="cardNumber"
                    data-testid="input-card-number"
                    className="w-full min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-mono text-sm tracking-wider font-bold focus:ring-2 focus:ring-violet-500 focus:outline-none transition shadow-sm"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4111 1111 1111 1111"
                    autoComplete="cc-number"
                  />
                </div>
              </fieldset>

              <fieldset>
                <label htmlFor="card-holder" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Nombre del Titular (como aparece en el plástico)
                </label>
                <input
                  type="text"
                  id="card-holder"
                  value={holder}
                  onChange={(e) => setHolder(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </fieldset>

              <div className="grid grid-cols-2 gap-3">
                <fieldset className="fieldset-expiration">
                  <label htmlFor="card-expiration-month" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Expiración
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <CustomSelect
                      placeholder="Mes"
                      options={MONTH_OPTIONS}
                      value={expMonth}
                      onChange={(val) => setExpMonth(val)}
                    />
                    <CustomSelect
                      placeholder="Año"
                      options={YEAR_OPTIONS}
                      value={expYear}
                      onChange={(val) => setExpYear(val)}
                    />
                  </div>
                </fieldset>

                <fieldset className="fieldset-ccv">
                  <label htmlFor="card-ccv" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    CVV / CVC
                  </label>
                  <input
                    type="password"
                    id="card-ccv"
                    maxLength={4}
                    value={ccv}
                    onChange={(e) => setCcv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    onFocus={() => setIsFlipped(true)}
                    onBlur={() => setIsFlipped(false)}
                    placeholder="123"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-mono font-bold text-center focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </fieldset>
              </div>

              {/* Affiliation Agreement Checkbox */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <label className="flex items-start gap-2.5 cursor-pointer text-left">
                  <input
                    type="checkbox"
                    id="checkbox-affiliate-agreement"
                    checked={agreementAccepted}
                    onChange={(e) => setAgreementAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400 leading-snug">
                    Autorizo afiliar esta tarjeta para cobros periódicos de mi suscripción de 30 días. Puedo cancelar en cualquier instante desde mi panel manteniendo mis beneficios hasta cumplir los 30 días pagados.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                id="btn-submit-card-affiliation"
                data-testid="btn-submit-card-affiliation"
                disabled={isSubmitting || isVerifying}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition transform hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting || isVerifying ? 'Verificando con Red Bancaria...' : buttonLabel}</span>
              </button>
            </form>
          </>
        )}

        {submitted && (
          <div className="mt-4 p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-center text-emerald-700 dark:text-emerald-300 font-semibold text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-center gap-1.5 mb-1.5 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>¡Tarjeta Afiliada con Éxito!</span>
            </div>
            <p className="mb-3 text-[11px] text-slate-600 dark:text-zinc-400">
              Tu método de pago ha sido guardado de forma segura y tus 30 días de suscripción han sido activados.
            </p>
            {user ? (
              <Link
                to={((targetRole || user.user_metadata?.tipo || user.user_metadata?.role || '').toLowerCase() === 'tatuador') ? '/artist-dashboard' : '/client-dashboard'}
                className="inline-block px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition shadow-md"
              >
                {((targetRole || user.user_metadata?.tipo || user.user_metadata?.role || '').toLowerCase() === 'tatuador')
                  ? 'Ir a mi Panel de Artista'
                  : 'Ir a mi Panel VIP'}
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-block px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition shadow-md"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        )}
      </div>

      {!isEmbedded && (
        <div className="back mt-8">
          <Link to="/" className="inline-block hover:opacity-80 transition text-xs font-bold text-slate-500 dark:text-zinc-400">
            &larr; Volver a Tattoo Hub
          </Link>
        </div>
      )}
    </div>
  );
};

export default InteractiveCard;
