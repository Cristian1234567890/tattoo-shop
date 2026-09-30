import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole } from '../../types';
import { api } from '../../api/client';
import { supabase } from '../../api/supabase';
import { useAuth } from '../../context/AuthContext';

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
  const { updateUserMetadata } = useAuth();

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
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!role) {
      setErrorMsg('Por favor selecciona tu rol (Cliente o Tatuador).');
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      setErrorMsg('Debes leer y aceptar los Términos y Condiciones y la Política de Privacidad.');
      return;
    }

    setLoading(true);

    const legalTimestamp = new Date().toISOString();
    const avatarUrl =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      user.user_metadata?.profile ||
      'https://mftthukphffirdcoqprz.supabase.co/storage/v1/object/public/user_profile/tatto-default-profile.png';

    try {
      let saved = false;
      let errorDetail = '';

      // 1. Backend API call
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

      // 2. Client-side Supabase direct upsert fallback / reinforcement
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

      // 3. Update Auth context metadata
      updateUserMetadata({
        tipo: role,
        role,
        full_name: fullName,
        telefono: phone,
        phone_number: phone,
        legal_accepted: true,
        legal_accepted_at: legalTimestamp,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        id="onboardingModal"
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 max-w-lg w-full border border-gray-200 dark:border-gray-800 animate-scale-in"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3 text-3xl font-extrabold">
            🎨
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            ¡Completa tu Perfil!
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Para brindarte la mejor experiencia, selecciona cómo usarás Tattoo Hub y acepta nuestros términos legales.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre Completo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre y apellido"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Teléfono de Contacto (opcional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555-0100"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition"
            />
          </div>

          {/* Selector de Rol */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ¿Cómo planeas usar la plataforma? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('Cliente')}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                  role === 'Cliente'
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-2xl mb-1">🤩</div>
                <div className="font-bold text-gray-900 dark:text-white">Cliente</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Busco inspiración, cotizar tatuajes y contactar artistas.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('Tatuador')}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                  role === 'Tatuador'
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-2xl mb-1">😎</div>
                <div className="font-bold text-gray-900 dark:text-white">Tatuador</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Quiero publicar mis trabajos y recibir solicitudes de clientes.
                </div>
              </button>
            </div>
            {role === 'Tatuador' && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                ⭐ Nota: El rol de Tatuador cuenta con un plan de suscripción opcional de 1.99$/mes para máxima visibilidad.
              </p>
            )}
          </div>

          {/* Legal Acceptance Checkboxes (R3) */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                id="onboardingTermsCheckbox"
                name="termsAccepted"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>
                He leído y acepto los{' '}
                <Link
                  to="/legal/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Términos y Condiciones
                </Link>{' '}
                de Tattoo Hub.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                id="onboardingPrivacyCheckbox"
                name="privacyAccepted"
                required
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>
                He leído y acepto la{' '}
                <Link
                  to="/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Política de Privacidad
                </Link>{' '}
                y el tratamiento de datos.
              </span>
            </label>
          </div>

          <button
            type="submit"
            id="btn-complete-onboarding"
            disabled={loading || !role || !termsAccepted || !privacyAccepted}
            className="w-full py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-lg transition duration-200 shadow-lg cursor-pointer"
          >
            {loading ? 'Guardando...' : 'Completar Registro y Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
};
