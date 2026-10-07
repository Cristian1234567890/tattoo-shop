import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  UserCheck
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { api } from '../../api/client';
import { supabase } from '../../api/supabase';
import { useAuth } from '../../context/AuthContext';
import { TermsModal } from './TermsModal';

interface OnboardingModalProps {
  isOpen: boolean;
  user: User;
  onCompleted: (selectedRole?: UserRole | '') => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  user,
  onCompleted,
}) => {
  const { updateUserMetadata, logout } = useAuth();

  const [role, setRole] = useState<UserRole | ''>(
    (user.user_metadata?.tipo as UserRole) || (user.user_metadata?.role as UserRole) || ''
  );
  const [fullName, setFullName] = useState<string>(
    user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      `${user.user_metadata?.nombre || ''} ${user.user_metadata?.apellido || ''}`.trim() ||
      user.email?.split('@')[0] ||
      ''
  );
  const [phone, setPhone] = useState<string>(
    user.user_metadata?.telefono || user.user_metadata?.phone_number || ''
  );
  const [birthdate, setBirthdate] = useState<string>(
    user.user_metadata?.birthdate || user.user_metadata?.fecha_nacimiento || ''
  );

  const [swornStatement, setSwornStatement] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const calculateAge = (birthDateString: string): number | null => {
    if (!birthDateString) return null;
    const birth = new Date(birthDateString);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge(birthdate);
  const isUnderage = currentAge !== null && currentAge < 18;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!role) {
      setErrorMsg('Por favor selecciona tu rol (Cliente o Tatuador).');
      return;
    }

    if (!birthdate) {
      setErrorMsg('La fecha de nacimiento es obligatoria para verificar la mayoría de edad.');
      return;
    }

    if (isUnderage) {
      setErrorMsg(
        'Acceso Restringido: Debes ser mayor de 18 años para utilizar Tattoo Hub conforme a las normativas sanitarias y legales aplicables.'
      );
      return;
    }

    if (!swornStatement) {
      setErrorMsg('Debes confirmar la declaración jurada de mayoría de edad.');
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      setErrorMsg('Debes leer y aceptar los Términos y Condiciones y la Política de Privacidad.');
      return;
    }

    setLoading(true);

    const legalTimestamp = new Date().toISOString();
    const authProvider = (user as any)?.app_metadata?.provider || 'oauth';
    const avatarUrl =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      user.user_metadata?.profile ||
      'https://mftthukphffirdcoqprz.supabase.co/storage/v1/object/public/user_profile/tatto-default-profile.png';

    try {
      let saved = false;
      let errorDetail = '';

      // 1. Backend API Call
      try {
        const res = await api.completeOnboarding({
          role,
          legal_accepted: true,
          legal_accepted_at: legalTimestamp,
          full_name: fullName,
          phone_number: phone,
          avatar_url: avatarUrl,
        });

        if (res.success) {
          saved = true;
        } else {
          errorDetail =
            (typeof res.error === 'object' ? res.error?.message : res.error) ||
            'Error al completar el perfil en el servidor.';
        }
      } catch (backendErr: any) {
        errorDetail =
          backendErr.response?.data?.error?.message ||
          backendErr.response?.data?.error ||
          backendErr.message ||
          'Error de conexión con el servidor.';
      }

      // 2. Client-side Supabase direct upsert fallback / audit reinforcement
      if (!saved) {
        try {
          const { error: supaErr } = await supabase.from('user_profiles').upsert({
            id: user.id,
            role,
            legal_accepted: true,
            legal_accepted_at: legalTimestamp,
            full_name: fullName,
            avatar_url: avatarUrl,
            phone_number: phone || null,
            is_verified: false,
            onboarding_completed: true,
            updated_at: legalTimestamp,
          });
          if (!supaErr) {
            saved = true;
          }
        } catch (errDb) {
          console.warn('Direct user_profiles upsert note:', errDb);
        }
      }

      if (!saved) {
        setErrorMsg(errorDetail || 'No se pudo guardar la información. Por favor, intenta de nuevo.');
        return;
      }

      // 3. Update Auth Context Metadata
      updateUserMetadata({
        tipo: role,
        role,
        full_name: fullName,
        telefono: phone,
        phone_number: phone,
        birthdate,
        edad: currentAge ? String(currentAge) : '18',
        legal_accepted: true,
        legal_accepted_at: legalTimestamp,
        legal_terms_version: 'v2.0-2026',
        auth_provider: authProvider,
        onboarding_completed: true,
      });

      onCompleted(role);
    } catch (err: any) {
      console.error('Onboarding submission error:', err);
      setErrorMsg('Ocurrió un error inesperado al procesar tu solicitud. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="onboardingModalOverlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
    >
      <motion.div
        id="onboardingModal"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#0e0e14] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 md:p-8 max-w-xl w-full border border-zinc-800 text-white my-8 relative overflow-hidden"
      >
        {/* Glow de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 text-center mb-6">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <UserCheck className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-zinc-400">
            COMPUERTA DE AUTENTICACIÓN RÁPIDA · POST-OAUTH GATE
          </span>
          <h2 className="text-2xl font-black text-white mt-3">
            ¡Bienvenido a Tattoo Hub!
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
            Para garantizar el cumplimiento de las regulaciones sanitarias de arte corporal y la bioseguridad, completa tu fecha de nacimiento y acepta nuestros términos legales.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-950/40 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Nombre Completo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre y apellido"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition text-sm"
            />
          </div>

          {/* Fecha de Nacimiento (Validación 18+ reactiva obligatoria) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="onboarding-birthdate" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Fecha de Nacimiento <span className="text-amber-500 font-bold">*</span>
              </label>
              {currentAge !== null && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    isUnderage
                      ? 'bg-red-950/60 border-red-500/50 text-red-400'
                      : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  }`}
                >
                  {currentAge} años {isUnderage ? '(Menor de 18)' : '(18+ Verificado ✓)'}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="onboarding-birthdate"
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-950/60 text-white focus:outline-none transition text-sm ${
                  isUnderage
                    ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                    : 'border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                }`}
              />
              <Calendar className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {isUnderage && (
              <div className="mt-2 p-3 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Acceso Restringido (18+):</strong> Debes ser mayor de 18 años para utilizar Tattoo Hub conforme a las normativas sanitarias y legales aplicables a intervenciones de arte corporal.
                </span>
              </div>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Teléfono de Contacto (opcional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+34 600 000 000"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition text-sm"
            />
          </div>

          {/* Selector de Rol */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              ¿Cómo usarás la plataforma? <span className="text-amber-500 font-bold">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                id="role-btn-cliente"
                onClick={() => setRole('Cliente')}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  role === 'Cliente'
                    ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500'
                    : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">✨</span>
                  {role === 'Cliente' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="font-bold text-white text-sm">Cliente / Coleccionista</div>
                <div className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  Busco inspiración, cotizaciones claras y contacto directo con artistas.
                </div>
              </button>

              <button
                type="button"
                id="role-btn-tatuador"
                onClick={() => setRole('Tatuador')}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  role === 'Tatuador'
                    ? 'border-violet-500 bg-violet-600/10 shadow-[0_0_20px_rgba(124,58,237,0.15)] ring-1 ring-violet-500'
                    : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">⚡</span>
                  {role === 'Tatuador' && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                </div>
                <div className="font-bold text-white text-sm">Tatuador / Estudio</div>
                <div className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  Deseo publicar portafolio, flashes, gestionar agenda y recibir solicitudes.
                </div>
              </button>
            </div>
          </div>

          {/* Declaración Jurada de Mayoría de Edad (Legal Attestation) */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                id="swornStatementCheckbox"
                required
                disabled={isUnderage}
                checked={swornStatement}
                onChange={(e) => setSwornStatement(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 cursor-pointer disabled:opacity-40"
              />
              <span>
                <strong>Declaración Jurada:</strong> Declaro bajo fe de juramento que la fecha de nacimiento ingresada es verídica, que cuento con 18 años cumplidos o más y que no tengo impedimentos legales para contratar servicios sanitarios y de arte corporal.
              </span>
            </label>

            {/* Aceptación de Términos con Modal Forzado */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-300 pt-2 border-t border-zinc-900">
              <input
                type="checkbox"
                id="onboardingTermsCheckbox"
                required
                checked={termsAccepted}
                onChange={() => {
                  const hasRead = sessionStorage.getItem('terms_read_accepted') === 'true';
                  if (!hasRead) {
                    setIsTermsModalOpen(true);
                  } else {
                    setTermsAccepted(!termsAccepted);
                  }
                }}
                className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <div>
                <span onClick={() => setIsTermsModalOpen(true)}>
                  He leído y acepto los{' '}
                  <span className="text-amber-400 font-semibold underline underline-offset-2 hover:text-amber-300">
                    Términos, Condiciones y Políticas de Privacidad
                  </span>{' '}
                  de Tattoo Hub (lectura obligatoria de consentimiento).
                </span>
                {!termsAccepted && (
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    * Abre la ventana emergente y desplázate al 100% para validar esta casilla.
                  </p>
                )}
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-300 pt-2 border-t border-zinc-900">
              <input
                type="checkbox"
                id="onboardingPrivacyCheckbox"
                required
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <span>
                Autorizo el tratamiento de mis datos de contacto conforme a la Política de Privacidad de Tattoo Hub y normativas sanitarias vigentes.
              </span>
            </label>
          </div>

          <button
            type="submit"
            id="btn-complete-onboarding"
            disabled={
              loading ||
              !role ||
              !birthdate ||
              isUnderage ||
              !swornStatement ||
              !termsAccepted ||
              !privacyAccepted
            }
            className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl transition duration-200 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              'Guardando verificación...'
            ) : isUnderage ? (
              '🔞 Registro Bloqueado: Menor de Edad'
            ) : !role ? (
              'Selecciona tu rol para continuar'
            ) : !swornStatement ? (
              'Declaración jurada 18+ requerida'
            ) : !termsAccepted ? (
              'Lectura de Términos Requerida'
            ) : (
              'Verificar y Acceder a la Plataforma'
            )}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Cerrar sesión e ingresar con otra cuenta</span>
            </button>
          </div>
        </form>

        <TermsModal
          isOpen={isTermsModalOpen}
          onClose={() => setIsTermsModalOpen(false)}
          onAccept={() => setTermsAccepted(true)}
        />
      </motion.div>
    </div>
  );
};

export default OnboardingModal;
