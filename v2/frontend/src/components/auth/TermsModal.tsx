import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, CheckCircle2, ScrollText, ArrowDown } from 'lucide-react';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Tolerance of 25px
    if (scrollTop + clientHeight >= scrollHeight - 25) {
      setHasScrolledToBottom(true);
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleConfirm = () => {
    if (hasScrolledToBottom) {
      sessionStorage.setItem('terms_read_accepted', 'true');
      onAccept();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#0e0e14] border border-zinc-800 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800/80 bg-[#12121a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <ScrollText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
                <p className="text-xs text-zinc-400">Lectura requerida para validar tu consentimiento informado</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 p-6 overflow-y-auto space-y-6 text-sm text-zinc-300 leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 selection:bg-violet-500/30"
          >
            <div className="p-4 rounded-2xl bg-violet-950/20 border border-violet-500/20 flex items-start gap-3 text-xs text-violet-300">
              <ShieldAlert className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
              <span>
                Para proteger tu seguridad legal y sanitaria, debes desplazarte hasta el final de este documento antes de poder aceptar los términos.
              </span>
            </div>

            <section className="space-y-3">
              <h4 className="text-base font-bold text-white">1. Requisitos Sanitarios y Mayoría de Edad</h4>
              <p>
                Tattoo Hub es una plataforma exclusiva para personas mayores de 18 años. Al registrarte declaras bajo gravedad de juramento que posees plena capacidad civil y legal para contratar intervenciones corporales permanentes. Los tatuadores independientes se reservan el derecho legal de solicitar documento de identidad oficial previo a cualquier procedimiento.
              </p>
            </section>

            <section className="space-y-3">
              <h4 className="text-base font-bold text-white">2. Independencia Profesional de Tatuadores</h4>
              <p>
                Tattoo Hub opera como un directorio y herramienta de gestión directa. No somos empleadores ni agentes de los tatuadores registrados. Cada artista opera con su propia licencia sanitaria, esterilización de grado hospitalario y consentimiento informado particular. El 100% del pago por servicios es gestionado de mutuo acuerdo entre cliente y artista.
              </p>
            </section>

            <section className="space-y-3">
              <h4 className="text-base font-bold text-white">3. Protección de Datos y Fotografías de Evolución</h4>
              <p>
                Tus datos personales y fotografías subidas al diario de cicatrización están protegidos mediante cifrado de grado bancario. Tattoo Hub no comercializa tu información con terceros ni utiliza tus fotografías corporales para alimentar modelos generativos de inteligencia artificial sin tu consentimiento explícito.
              </p>
            </section>

            <section className="space-y-3">
              <h4 className="text-base font-bold text-white">4. Propiedad Intelectual y Flashes</h4>
              <p>
                Todos los bocetos, stencils y diseños expuestos en el catálogo pertenecen moral y patrimonialmente a los artistas creadores. Queda terminantemente prohibida la descarga no autorizada, copia comercial o explotación de diseños ajenos.
              </p>
            </section>

            <section className="space-y-3">
              <h4 className="text-base font-bold text-white">5. Cancelaciones, Señas y Depósitos</h4>
              <p>
                Las políticas de devolución de señas por concepto de apartado de cita dependen exclusivamente de los términos establecidos por cada estudio o artista en su cotización. Tattoo Hub facilita la trazabilidad de la reserva pero no retiene fondos de depósitos en custodia.
              </p>
            </section>

            <div className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-500">
              --- Fin del documento legal de Tattoo Hub (Versión 2.0 - 2026) ---
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-6 border-t border-zinc-800/80 bg-[#12121a] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              {hasScrolledToBottom ? (
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Has leído el documento completo
                </span>
              ) : (
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 font-medium cursor-pointer transition-colors"
                >
                  <ArrowDown className="w-4 h-4 animate-bounce" /> Desplázate al final para habilitar
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white text-sm font-semibold transition cursor-pointer w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!hasScrolledToBottom}
                onClick={handleConfirm}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer ${
                  hasScrolledToBottom
                    ? 'btn-atelier-primary shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                }`}
              >
                He leído y Acepto los Términos
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
