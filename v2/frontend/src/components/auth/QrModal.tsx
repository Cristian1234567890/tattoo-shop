import React from 'react';

interface QrModalProps {
  isOpen: boolean;
  qrCodeUrl: string;
  onExit: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, qrCodeUrl, onExit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        id="ventanaQR"
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full border border-gray-200 dark:border-gray-800 text-center animate-scale-in"
      >
        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-green-500 text-2xl">
          📱
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Configurar Autenticador (2FA)
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
          Escanea este código QR con Google Authenticator o tu aplicación TOTP favorita para activar la protección de tu cuenta.
        </p>

        <div className="flex justify-center p-3 bg-white rounded-lg border border-gray-200 shadow-inner mb-6">
          <img
            id="qr"
            src={qrCodeUrl}
            alt="Código QR de autenticación"
            className="w-48 h-48 object-contain"
          />
        </div>

        <button
          id="btn-salir"
          onClick={onExit}
          className="w-full py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-lg transition cursor-pointer shadow-md"
        >
          Salir
        </button>
      </div>
    </div>
  );
};
