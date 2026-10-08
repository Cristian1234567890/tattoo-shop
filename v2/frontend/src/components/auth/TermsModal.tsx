import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, CheckCircle2, ScrollText, ArrowDown, CheckSquare, Square } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  title?: string;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  title = 'Términos, Condiciones & Políticas de Privacidad',
}) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [manualAgreed, setManualAgreed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 1. Lock background body scroll when modal is open to avoid background dragging
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // 2. Measure content on mount/open: If content fits on the device screen, enable immediately
  useEffect(() => {
    if (isOpen) {
      const checkHeight = () => {
        if (scrollContainerRef.current) {
          const { scrollHeight, clientHeight } = scrollContainerRef.current;
          // Tolerance: if content fits or almost fits within 50px, automatically enable
          if (scrollHeight <= clientHeight + 50) {
            setHasScrolledToBottom(true);
          }
        }
      };
      // Check immediately and after a tick for CSS reflow
      checkHeight();
      const t = setTimeout(checkHeight, 150);
      return () => clearTimeout(t);
    } else {
      setHasScrolledToBottom(false);
      setManualAgreed(false);
    }
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Generous tolerance of 50px
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setHasScrolledToBottom(true);
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setHasScrolledToBottom(true);
    }
  };

  const canAccept = hasScrolledToBottom || manualAgreed;

  const handleConfirm = () => {
    if (canAccept) {
      sessionStorage.setItem('terms_read_accepted', 'true');
      onAccept();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
        onTouchMove={(e) => {
          if (e.target === e.currentTarget) e.preventDefault();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-[#0e0e14] border border-zinc-800 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800/80 bg-[#12121a] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                <ScrollText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{title}</h3>
                <p className="text-xs text-zinc-400">Lectura requerida para validar tu consentimiento informado</p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="terms-modal-close-btn"
              className="w-8 h-8 rounded-full bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Scrollable Container */}
          <div
            ref={scrollContainerRef}
            id="terms-modal-scrollable-content"
            onScroll={handleScroll}
            style={{
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
            }}
            className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-0 space-y-5 text-sm text-zinc-300 leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 selection:bg-violet-500/30"
          >
            <div className="p-3.5 rounded-2xl bg-violet-950/20 border border-violet-500/20 flex items-start gap-3 text-xs text-violet-300">
              <ShieldAlert className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
              <span>
                Para proteger tu seguridad legal y sanitaria, revisa este documento antes de confirmar tu registro en el ecosistema.
              </span>
            </div>

            <section className="space-y-2">
              <h4 className="text-base font-bold text-white">1. Requisitos Sanitarios y Mayoría de Edad</h4>
              <p>
                Tattoo Hub es una plataforma exclusiva para personas mayores de 18 años. Al registrarte declaras bajo gravedad de juramento que posees plena capacidad civil y legal para contratar intervenciones corporales permanentes. Los tatuadores independientes y estudios se reservan el derecho legal de solicitar documento de identidad oficial previo a cualquier procedimiento.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="text-base font-bold text-white">2. Independencia Profesional de Tatuadores</h4>
              <p>
                Tattoo Hub opera como un directorio y plataforma de conectividad directa. No somos empleadores ni agentes laborales de los tatuadores registrados. Cada artista opera con su propia licencia sanitaria, protocolos de bioseguridad, esterilización de grado hospitalario y consentimiento informado particular. El 100% de la ejecución técnica y acuerdos económicos por servicios son acordados de mutuo acuerdo entre cliente y artista.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="text-base font-bold text-white">3. Protección y Confidencialidad de Datos</h4>
              <p>
                Tus datos de contacto, bocetos e historial de intervenciones se gestionan con cifrado en reposo y en tránsito bajo estándares de seguridad informática. Tus credenciales y números telefónicos no son compartidos con terceros comerciales ajenos a la gestión directa de tus citas.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="text-base font-bold text-white">4. Políticas de Reserva y Cancelación</h4>
              <p>
                Las políticas de anticipo de cita o señas dependen de los términos estipulados por cada estudio o artista en su cotización. Tattoo Hub facilita la agenda y trazabilidad de la reserva pero no retiene fondos de depósitos en custodia.
              </p>
            </section>

            <div className="pt-3 border-t border-zinc-800 text-center text-xs text-zinc-500">
              --- Fin del documento legal de Tattoo Hub (Versión 2.0 - 2026) ---
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 sm:p-6 border-t border-zinc-800/80 bg-[#12121a] shrink-0 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              {/* Direct Agreement Checkbox or Scroll Prompt */}
              <button
                type="button"
                id="terms-manual-agree-checkbox"
                onClick={() => setManualAgreed(!manualAgreed)}
                className="flex items-center gap-2 text-zinc-300 hover:text-white cursor-pointer select-none text-left"
              >
                {canAccept ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-500 shrink-0" />
                )}
                <span className={canAccept ? 'text-emerald-300 font-semibold' : 'text-zinc-400'}>
                  He leído, comprendido y acepto las condiciones
                </span>
              </button>

              {!canAccept && (
                <button
                  type="button"
                  id="terms-scroll-to-bottom-btn"
                  onClick={scrollToBottom}
                  className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 font-medium cursor-pointer transition-colors self-start sm:self-auto"
                >
                  <ArrowDown className="w-3.5 h-3.5 animate-bounce" /> Ir al final para habilitar
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 w-full pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs sm:text-sm font-semibold transition cursor-pointer flex-1 sm:flex-initial"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="terms-accept-confirm-btn"
                disabled={!canAccept}
                onClick={handleConfirm}
                className={`px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 flex-1 sm:flex-initial cursor-pointer ${
                  canAccept
                    ? 'btn-atelier-primary shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                He leído y Acepto los Términos
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
