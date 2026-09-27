import React, { useState } from 'react';

interface TwoFactorModalProps {
  isOpen: boolean;
  onValidate: (code: string) => Promise<void>;
  onClose?: () => void;
  isLoading?: boolean;
  error?: string;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onValidate,
  isLoading = false,
  error,
}) => {
  const [code, setCode] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length >= 6) {
      onValidate(code.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        id="mensajeEmergente"
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full border border-gray-200 dark:border-gray-800 text-center animate-scale-in"
      >
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary text-2xl">
          🔐
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Verificación en Dos Pasos
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Código de autenticación:
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            id="code"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full text-center text-2xl font-mono tracking-widest py-3 px-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:border-primary focus:outline-none dark:bg-gray-800 dark:text-white"
            autoFocus
          />

          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

          <button
            type="submit"
            id="btn-validar"
            disabled={isLoading || code.length < 6}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition disabled:opacity-50 cursor-pointer shadow-md"
          >
            {isLoading ? 'Validando...' : 'Validar'}
          </button>
        </form>
      </div>
    </div>
  );
};
