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
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-violet-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl dark:shadow-[0_0_50px_rgba(124,58,237,0.25)] relative text-center text-slate-900 dark:text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal de invitados"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Glowing Badge Icon */}
        <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-600/20 border border-violet-200 dark:border-violet-500/40 flex items-center justify-center text-violet-600 dark:text-violet-400 mx-auto mb-4 shadow-sm dark:shadow-[0_0_20px_rgba(124,58,237,0.4)]">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-300 text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Acceso Exclusivo • Tattoo Hub
        </div>

        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 font-heading">
          {options?.title || 'Únete a la Comunidad de Tattoo Hub'}
        </h3>

        <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed mb-6 font-body">
          {options?.message ||
            'Para reservar cupos, acceder al Flash Book o contactar artistas directamente por WhatsApp, crea tu cuenta gratuita en segundos.'}
        </p>

        {/* Feature Highlights (Light mode slate text on soft violet; dark mode zinc) */}
        <div className="bg-violet-50/70 dark:bg-zinc-800/80 border border-violet-100 dark:border-zinc-700 rounded-xl p-3.5 mb-6 text-left space-y-2.5 text-xs text-slate-700 dark:text-zinc-200 shadow-inner">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
            <span className="font-medium">Reserva cupos y aparta diseños de Flash Book al instante.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">Contacto directo verificado vía WhatsApp con cada artista.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-medium">Seguimiento de cicatrización y gestión de citas privadas.</span>
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
            className="w-full py-3 px-6 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 transition cursor-pointer shadow-sm"
          >
            Ya tengo cuenta • Iniciar Sesión
          </button>
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-400 transition py-1 mt-1 cursor-pointer"
          >
            Continuar explorando como invitado
          </button>
        </div>
      </div>
    </div>
  );
};
