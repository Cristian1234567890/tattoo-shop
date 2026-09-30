import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleGoToCreditCard = () => {
    onContinue();
    navigate('/subscription/creditcard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div
        id="mensajeEmergente"
        className="bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full border border-primary/40 text-center animate-scale-in"
      >
        <div className="w-14 h-14 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">
          Membresía & Suscripción
        </h3>

        <div className="space-y-2 text-gray-300 text-sm mb-6">
          <p>
            Para acceder a esta función comercial o mantener activo tu perfil profesional tras los 90 días de prueba gratuita, requieres de una membresía activa.
          </p>
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 my-3">
            <p className="font-bold text-primary text-lg">
              $4.99 / mes
            </p>
            <p className="text-xs text-gray-400">
              o $49.90 / año (ahorra 17%)
            </p>
          </div>
          <p className="font-medium text-gray-400 mt-2">¿Deseas continuar al proceso de pago?</p>
        </div>

        <div className="flex gap-4">
          <button
            id="btn-continuar"
            onClick={handleGoToCreditCard}
            className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition cursor-pointer shadow-lg shadow-primary/25"
          >
            Continuar
          </button>
          <button
            id="btn-no-continuar"
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-bold rounded-lg transition cursor-pointer border border-gray-700"
          >
            Cancelar
          </button>
        </div>

        <div id="paypal-button-container" className="mt-4 empty:hidden"></div>
      </div>
    </div>
  );
};

