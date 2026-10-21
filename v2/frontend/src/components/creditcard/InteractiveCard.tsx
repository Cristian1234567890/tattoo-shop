import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { isQaEnvironment } from '../../api/supabase';
import { ShieldAlert, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
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
  const [num0, setNum0] = useState<string>('');
  const [num1, setNum1] = useState<string>('');
  const [num2, setNum2] = useState<string>('');
  const [num3, setNum3] = useState<string>('');
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

  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const input3Ref = useRef<HTMLInputElement>(null);

  const fullCardNumber = `${num0}${num1}${num2}${num3}`.replace(/\D/g, '');
  const brand = detectCardBrand(fullCardNumber);

  const cardNumberDisplay =
    `${num0 || '••••'} ${num1 || '••••'} ${num2 || '••••'} ${num3 || '••••'}`.trim();
  const cardHolderDisplay = holder ? holder.toUpperCase() : 'NOMBRE DEL TITULAR';
  const cardExpDisplay =
    expMonth || expYear
      ? `${expMonth || 'MM'}/${expYear ? expYear.slice(-2) : 'YY'}`
      : 'MM/YY';

  const handleNumChange = (
    val: string,
    setVal: (v: string) => void,
    nextRef?: React.RefObject<HTMLInputElement>
  ) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    setVal(clean);
    if (clean.length === 4 && nextRef && nextRef.current) {
      nextRef.current.focus();
    }
  };

  const handlePasteCard = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 16);
    if (pasted.length >= 4) {
      setNum0(pasted.slice(0, 4));
      setNum1(pasted.slice(4, 8));
      setNum2(pasted.slice(8, 12));
      setNum3(pasted.slice(12, 16));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!holder.trim()) {
      setErrorMessage('Ingresa el nombre del titular de la tarjeta.');
      return;
    }

    if (fullCardNumber.length < 15) {
      setErrorMessage('Ingresa un número de tarjeta completo (15 o 16 dígitos).');
      return;
    }

    // Check Luhn
    const isSandboxPattern = fullCardNumber.startsWith('4000') || fullCardNumber.startsWith('4242') || fullCardNumber.startsWith('4111');
    if (!isSandboxPattern && !isValidLuhn(fullCardNumber)) {
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
      const expFormatted = `${expMonth}/${expYear.slice(-2)}`;
      const res = await api.affiliateCard({
        user_id: user?.id,
        holder_name: holder.trim(),
        card_number: fullCardNumber,
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
          card_last4: res.data?.card?.last4 || fullCardNumber.slice(-4),
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
        setErrorMessage(res.error || 'No se pudo procesar la afiliación de la tarjeta.');
      }
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

      <div className="checkout w-full max-w-md">
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

          <fieldset>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="card-number" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Número de Tarjeta (16 dígitos)
              </label>
              <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                {brand}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                id="card-number"
                className="input-cart-number text-center font-mono font-bold"
                maxLength={4}
                value={num0}
                onChange={(e) => handleNumChange(e.target.value, setNum0, input1Ref)}
                onPaste={handlePasteCard}
                placeholder="4111"
              />
              <input
                type="text"
                id="card-number-1"
                ref={input1Ref}
                className="input-cart-number text-center font-mono font-bold"
                maxLength={4}
                value={num1}
                onChange={(e) => handleNumChange(e.target.value, setNum1, input2Ref)}
                placeholder="1111"
              />
              <input
                type="text"
                id="card-number-2"
                ref={input2Ref}
                className="input-cart-number text-center font-mono font-bold"
                maxLength={4}
                value={num2}
                onChange={(e) => handleNumChange(e.target.value, setNum2, input3Ref)}
                placeholder="1111"
              />
              <input
                type="text"
                id="card-number-3"
                ref={input3Ref}
                className="input-cart-number text-center font-mono font-bold"
                maxLength={4}
                value={num3}
                onChange={(e) => handleNumChange(e.target.value, setNum3)}
                placeholder="1111"
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
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition transform hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>{isSubmitting ? 'Procesando Afiliación...' : buttonLabel}</span>
          </button>
        </form>

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

