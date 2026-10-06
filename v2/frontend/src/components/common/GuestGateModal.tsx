import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, X, Sparkles, MessageCircle, Calendar } from 'lucide-react';

export interface GuestGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  options?: {
    title?: string;
    message?: string;
    redirectUrl?: string;
  };
}

export const GuestGateModal: React.FC<GuestGateModalProps> = ({
  isOpen,
  onClose,
  options,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const currentRedirect = options?.redirectUrl || location.pathname + location.search;

  const handleRegister = () => {
    onClose();
    navigate(`/register?redirect=${encodeURIComponent(currentRedirect)}`);
  };

  const handleLogin = () => {
    onClose();
    navigate(`/login?redirect=${encodeURIComponent(currentRedirect)}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      id="guest-gate-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="bg-zinc-950 border border-violet-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-[0_0_50px_rgba(124,58,237,0.25)] relative text-center text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal de invitados"
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Glowing Badge Icon */}
        <div className="w-16 h-16 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 mx-auto mb-4 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Acceso Exclusivo • Tattoo Hub
        </div>

        <h3 className="text-xl md:text-2xl font-black text-white mb-2">
          {options?.title || 'Únete a la Comunidad de Tattoo Hub'}
        </h3>

        <p className="text-zinc-300 text-sm leading-relaxed mb-6">
          {options?.message ||
            'Para reservar cupos, acceder al Flash Book o contactar artistas directamente por WhatsApp, crea tu cuenta gratuita en segundos.'}
        </p>

        {/* Feature Highlights */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 mb-6 text-left space-y-2.5 text-xs text-zinc-300">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-violet-400 shrink-0" />
            <span>Reserva cupos y aparta diseños de Flash Book al instante.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Contacto directo verificado vía WhatsApp con cada artista.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Seguimiento de cicatrización y gestión de citas privadas.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            id="guest-gate-register-btn"
            onClick={handleRegister}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition transform hover:scale-[1.02] cursor-pointer"
          >
            Crear Cuenta Gratuita
          </button>
          <button
            id="guest-gate-login-btn"
            onClick={handleLogin}
            className="w-full py-3 px-6 rounded-xl font-medium text-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition cursor-pointer"
          >
            Ya tengo cuenta • Iniciar Sesión
          </button>
          <button
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-400 transition py-1 mt-1"
          >
            Continuar explorando como invitado
          </button>
        </div>
      </div>
    </div>
  );
};
