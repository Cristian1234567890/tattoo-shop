import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Database, Lock, X, ChevronUp, CheckCircle } from 'lucide-react';
import { isQaEnvironment, activeSchema } from '../../api/supabase';

export const QaEnvironmentBanner: React.FC = () => {
  const [isQa, setIsQa] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    return sessionStorage.getItem('qa_banner_minimized') === 'true';
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsQa(isQaEnvironment());
  }, []);

  if (!isQa) return null;

  const handleMinimize = () => {
    setIsMinimized(true);
    sessionStorage.setItem('qa_banner_minimized', 'true');
  };

  const handleExpand = () => {
    setIsMinimized(false);
    sessionStorage.removeItem('qa_banner_minimized');
  };

  return (
    <>
      {/* Floating Minimized Widget */}
      {isMinimized ? (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleExpand}
            id="qa-expand-badge-btn"
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 backdrop-blur-md shadow-lg shadow-black/50 text-xs font-bold transition-all hover:scale-105 cursor-pointer"
            title="Expandir información del Entorno QA"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>🧪 QA SANDBOX ACTIVO ({activeSchema})</span>
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      ) : (
        /* Top High-Visibility Banner */
        <aside
          id="qa-environment-banner"
          aria-label="Aviso de ambiente de pruebas QA"
          className="w-full bg-gradient-to-r from-amber-950/95 via-purple-950/90 to-amber-950/95 border-b border-amber-500/30 text-amber-100 text-xs px-4 py-2 relative z-50 shadow-md backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
                AMBIENTE DE QA / SANDBOX
              </span>
              <p className="text-zinc-200 text-xs leading-tight">
                <strong className="text-amber-300">Datos Segregados:</strong> Este entorno utiliza datos ficticios. Las cuentas, citas y pagos son simulados y <span className="underline decoration-amber-400/50">NO se reflejan en producción</span>.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsModalOpen(true)}
                id="qa-security-policy-btn"
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
              >
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                <span>Blindaje de Seguridad</span>
              </button>
              <button
                onClick={handleMinimize}
                id="qa-banner-dismiss-btn"
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Minimizar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Security Restrictions Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/30 rounded-2xl p-6 shadow-2xl text-zinc-200">
            <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Protocolo de Segregación y Blindaje QA
                  </h3>
                  <p className="text-xs text-amber-300 font-mono">
                    Esquema de Base de Datos: <span className="font-bold underline">{activeSchema}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                <Database className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-zinc-100">Espejo Aislado en Supabase (Schema QA)</h4>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Todas las consultas y escrituras se ejecutan en el esquema dedicado <code className="text-amber-300 bg-amber-950/40 px-1 py-0.5 rounded">qa</code>. Los perfiles, clientes reales y citas del ambiente productivo (<code className="text-zinc-300">public</code>) están completamente aislados y protegidos.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                <Lock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-zinc-100">Segregación de Usuarios Externos</h4>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Cualquier registro realizado en este entorno se etiqueta como <span className="text-amber-300 font-semibold">[QA Sandbox User]</span>. No otorga acceso ni validez comercial en el entorno de producción.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-zinc-100">Blindaje de Pasarelas y Transacciones Reales</h4>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Los flujos de cobro con tarjeta están protegidos en modo simulación/sandbox. No se efectúan cargos a cuentas bancarias reales.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-zinc-100">Aislamiento de Notificaciones</h4>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Los envíos de correo y notificaciones a clientes están encapsulados para evitar dispersión de correos o confusión con clientes verdaderos.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 hover:text-white transition-all cursor-pointer"
              >
                Entendido, Continuar Pruebas
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
