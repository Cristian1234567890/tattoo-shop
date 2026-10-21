import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

interface SubscriptionNoticeModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onCancel: () => void;
}

export const SubscriptionNoticeModal: React.FC<SubscriptionNoticeModalProps> = ({
  isOpen,
  onContinue,
  onCancel,
}) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  if (!isOpen) return null;

  const handleGoToCreditCard = () => {
    onContinue();
    navigate('/subscription/creditcard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div
        id="mensajeEmergente"
        className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full border border-slate-200 dark:border-primary/40 text-center animate-scale-in text-slate-900 dark:text-white"
      >
        <div className="w-14 h-14 bg-violet-100 dark:bg-primary/20 border border-violet-200 dark:border-primary/30 rounded-full flex items-center justify-center mx-auto mb-4 text-violet-600 dark:text-primary">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
          Membresía &amp; Suscripción
        </h3>

        <div className="space-y-2 text-slate-600 dark:text-gray-300 text-sm mb-6">
          <p>
            Para acceder a esta función comercial o mantener activo tu perfil profesional tras los 90 días de prueba gratuita, requieres de una membresía activa.
          </p>
          <div className="bg-violet-50 dark:bg-primary/10 border border-violet-200 dark:border-primary/30 rounded-xl p-3 my-3">
            <p className="font-bold text-violet-700 dark:text-primary text-lg">
              {formatPrice(4.99)} / mes
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              o {formatPrice(49.90)} / año (ahorra 17%)
            </p>
          </div>
          <p className="font-medium text-slate-500 dark:text-gray-400 mt-2">¿Deseas continuar al proceso de pago?</p>
        </div>

        <div className="flex gap-4">
          <button
            id="btn-continuar"
            onClick={handleGoToCreditCard}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl transition cursor-pointer shadow-lg shadow-violet-500/25 border border-violet-400/30"
          >
            Continuar
          </button>
          <button
            id="btn-no-continuar"
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl transition cursor-pointer border border-slate-300 dark:border-zinc-700"
          >
            Cancelar
          </button>
        </div>

        <div id="paypal-button-container" className="mt-4 empty:hidden"></div>
      </div>
    </div>
  );
};

