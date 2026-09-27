import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        id="mensajeEmergente"
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full border border-gray-200 dark:border-gray-800 text-center animate-scale-in"
      >
        <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 text-3xl">
          ⭐
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          Suscripción para Tatuadores
        </h3>

        <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm mb-6">
          <p>Para está opción requieres de una suscripción.</p>
          <p className="font-semibold text-primary dark:text-indigo-400 text-base">
            Suscríbete por tan solo 1.99$/mes.
          </p>
          <br />
          <p className="font-medium">¿Deseas continuar?</p>
        </div>

        <div className="flex gap-4">
          <button
            id="btn-continuar"
            onClick={handleGoToCreditCard}
            className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition cursor-pointer shadow-md"
          >
            Continuar
          </button>
          <button
            id="btn-no-continuar"
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-lg transition cursor-pointer"
          >
            No
          </button>
        </div>

        <div id="paypal-button-container" className="mt-4 empty:hidden"></div>
      </div>
    </div>
  );
};
