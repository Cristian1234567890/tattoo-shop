import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { isQaEnvironment } from '../../api/supabase';
import { ShieldAlert } from 'lucide-react';
import { CustomSelect, SelectOption } from '../common/CustomSelect';

const MONTH_OPTIONS: SelectOption[] = Array.from({ length: 12 }, (_, i) => {
  const m = String(i + 1).padStart(2, '0');
  return { value: m, label: m };
});

const YEAR_OPTIONS: SelectOption[] = Array.from({ length: 10 }, (_, i) => {
  const y = String(2024 + i);
  return { value: y, label: y };
});

export const InteractiveCard: React.FC = () => {
  const { user, updateUserMetadata, refreshProfile } = useAuth();
  const [num0, setNum0] = useState<string>('');
  const [num1, setNum1] = useState<string>('');
  const [num2, setNum2] = useState<string>('');
  const [num3, setNum3] = useState<string>('');
  const [holder, setHolder] = useState<string>('');
  const [expMonth, setExpMonth] = useState<string>('');
  const [expYear, setExpYear] = useState<string>('');
  const [ccv, setCcv] = useState<string>('');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const input3Ref = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (user?.id) {
      try {
        await api.insertUserSubscription({
          id: user.id,
          product_id: 'PROD-MONTHLY',
          subscription_id: `SUB-CARD-${Date.now()}`,
        });
        updateUserMetadata({
          has_active_subscription: true,
        });
        if (refreshProfile) {
          await refreshProfile().catch(() => {});
        }
      } catch (err) {
        console.error('Error activating subscription on backend:', err);
      }
    }

    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen py-16 px-4 flex flex-col items-center justify-center">
      {isQaEnvironment() && (
        <div
          id="qa-payment-sandbox-alert"
          className="mb-6 max-w-md w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-200 text-xs shadow-lg backdrop-blur-md flex items-start gap-3"
        >
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-300 text-sm mb-1">
              Modo Sandbox QA (Pasarela Simulada)
            </h4>
            <p className="text-zinc-300 text-xs leading-relaxed">
              Este entorno de pruebas está completamente segregado. <strong>No introduzcas datos de tarjetas bancarias reales</strong>. Utiliza cualquier combinación numérica de 16 dígitos para simular la activación sin cobro monetario.
            </p>
          </div>
        </div>
      )}

      <div className="checkout">
        <div className={`credit-card-box ${isFlipped ? 'hover' : ''}`}>
          <div className="flip">
            {/* Front */}
            <div className="front">
              <div className="chip"></div>
              <div className="logo">
                <svg
                  version="1.1"
                  id="visa"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 47.834 47.834"
                  className="w-12 h-12 fill-white"
                >
                  <g>
                    <path d="M44.688,16.814h-3.004c-0.933,0-1.627,0.254-2.037,1.184l-5.773,13.074h4.083c0,0,0.666-1.758,0.817-2.143 c0.447,0,4.414,0.006,4.979,0.006c0.116,0.498,0.474,2.137,0.474,2.137h3.607L44.688,16.814z M39.893,26.01 c0.32-0.819,1.549-3.987,1.549-3.987c-0.021,0.039,0.317-0.825,0.518-1.362l0.262,1.23c0,0,0.745,3.406,0.901,4.119H39.893z M34.146,26.404c-0.028,2.963-2.684,4.875-6.771,4.875c-1.743-0.018-3.422-0.361-4.332-0.76l0.547-3.193l0.501,0.228 c1.277,0.532,2.104,0.747,3.661,0.747c1.117,0,2.313-0.438,2.325-1.393c0.007-0.625-0.501-1.07-2.016-1.77 c-1.476-0.683-3.43-1.827-3.405-3.876c0.021-2.773,2.729-4.708,6.571-4.708c1.506,0,2.713,0.31,3.483,0.599l-0.526,3.092 l-0.351-0.165c-0.716-0.288-1.638-0.566-2.91-0.546c-1.522,0-2.228,0.634-2.228,1.227c-0.008,0.668,0.824,1.108,2.184,1.77 C33.126,23.546,34.163,24.783,34.146,26.404z M0,16.962l0.05-0.286h6.028c0.813,0.031,1.468,0.29,1.694,1.159l1.311,6.304 C7.795,20.842,4.691,18.099,0,16.962z M17.581,16.812l-6.123,14.239l-4.114,0.007L3.862,19.161 c2.503,1.602,4.635,4.144,5.386,5.914l0.406,1.469l3.808-9.729L17.581,16.812L17.581,16.812z M19.153,16.8h3.89L20.61,31.066 h-3.888L19.153,16.8z" />
                  </g>
                </svg>
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
              <div className="logo">
                <svg
                  version="1.1"
                  id="visa"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 47.834 47.834"
                  className="w-10 h-10 fill-white"
                >
                  <g>
                    <path d="M44.688,16.814h-3.004c-0.933,0-1.627,0.254-2.037,1.184l-5.773,13.074h4.083c0,0,0.666-1.758,0.817-2.143 c0.447,0,4.414,0.006,4.979,0.006c0.116,0.498,0.474,2.137,0.474,2.137h3.607L44.688,16.814z" />
                  </g>
                </svg>
              </div>
              <div className="ccv">
                <label>CCV</label>
                <div>{ccv || '•••'}</div>
              </div>
            </div>
          </div>
        </div>

        <form className="form" autoComplete="off" noValidate onSubmit={handleSubmit}>
          <fieldset>
            <label htmlFor="card-number">Card Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                id="card-number"
                className="input-cart-number"
                maxLength={4}
                value={num0}
                onChange={(e) => handleNumChange(e.target.value, setNum0, input1Ref)}
                placeholder="4000"
              />
              <input
                type="text"
                id="card-number-1"
                ref={input1Ref}
                className="input-cart-number"
                maxLength={4}
                value={num1}
                onChange={(e) => handleNumChange(e.target.value, setNum1, input2Ref)}
                placeholder="1234"
              />
              <input
                type="text"
                id="card-number-2"
                ref={input2Ref}
                className="input-cart-number"
                maxLength={4}
                value={num2}
                onChange={(e) => handleNumChange(e.target.value, setNum2, input3Ref)}
                placeholder="5678"
              />
              <input
                type="text"
                id="card-number-3"
                ref={input3Ref}
                className="input-cart-number"
                maxLength={4}
                value={num3}
                onChange={(e) => handleNumChange(e.target.value, setNum3)}
                placeholder="9010"
              />
            </div>
          </fieldset>

          <fieldset>
            <label htmlFor="card-holder">Card holder</label>
            <input
              type="text"
              id="card-holder"
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
              placeholder="Juan Perez"
            />
          </fieldset>

          <fieldset className="fieldset-expiration">
            <label htmlFor="card-expiration-month">Expiration date</label>
            <div className="grid grid-cols-2 gap-3">
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
            <label htmlFor="card-ccv">CCV</label>
            <input
              type="text"
              id="card-ccv"
              maxLength={3}
              value={ccv}
              onChange={(e) => setCcv(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onFocus={() => setIsFlipped(true)}
              onBlur={() => setIsFlipped(false)}
              placeholder="123"
            />
          </fieldset>

          <button type="submit" disabled={isSubmitting} className="btn cursor-pointer">
            <i className="fa fa-lock mr-2"></i>{isSubmitting ? 'Procesando...' : 'Listo'}
          </button>
        </form>

        {submitted && (
          <div className="mt-4 p-4 bg-green-500/15 border border-green-500 rounded-xl text-center text-green-700 dark:text-green-300 font-semibold text-sm">
            <p className="mb-2">¡Tarjeta simulada validada exitosamente y suscripción activada!</p>
            {user ? (
              <Link
                to={((user.user_metadata?.tipo || user.user_metadata?.role || '').toLowerCase() === 'tatuador') ? '/artist-dashboard' : '/client-dashboard'}
                className="inline-block mt-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition"
              >
                {((user.user_metadata?.tipo || user.user_metadata?.role || '').toLowerCase() === 'tatuador')
                  ? 'Ir a mi Panel de Artista'
                  : 'Ir a mi Panel VIP'}
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-block mt-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="back mt-8">
        <Link to="/register" className="inline-block hover:opacity-80 transition">
          <img src="/assets/Back To White.png" alt="Volver" className="w-10 h-10" />
        </Link>
      </div>
    </div>
  );
};
