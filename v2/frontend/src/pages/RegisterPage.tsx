import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { QrModal } from '../components/auth/QrModal';
import { SubscriptionNoticeModal } from '../components/auth/SubscriptionNoticeModal';

export const RegisterPage: React.FC = () => {
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [edad, setEdad] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [tipo, setTipo] = useState<'Cliente' | 'Tatuador' | ''>('');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Modals state
  const [showSubscriptionNotice, setShowSubscriptionNotice] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [registeredSession, setRegisteredSession] = useState<any>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as 'Cliente' | 'Tatuador';
    setTipo(selected);
    if (selected === 'Tatuador') {
      setShowSubscriptionNotice(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }
    if (!tipo) {
      setErrorMsg('Por favor selecciona tu rol (Cliente o Tatuador).');
      return;
    }
    if (!termsAccepted || !privacyAccepted) {
      setErrorMsg('Debes leer y aceptar los Términos y Condiciones y la Política de Privacidad.');
      return;
    }

    setLoading(true);

    try {
      const legalTimestamp = new Date().toISOString();
      // 1. POST /register
      const registerRes = await api.register({
        email,
        password,
        nombre,
        apellido,
        edad,
        tipo,
        legal_accepted: true,
        legal_accepted_at: legalTimestamp,
      });

      if (!registerRes.success || !registerRes.data) {
        const msg =
          typeof registerRes.error === 'object'
            ? registerRes.error?.message || 'Error en el registro'
            : registerRes.error || 'Error en el registro';
        setErrorMsg(msg);
        setLoading(false);
        return;
      }

      const { user, session } = registerRes.data;
      setRegisteredSession({ user, session });
      api.setStoredSession({ user, session });

      // 2. Enroll TOTP 2FA
      try {
        const enrollRes = await api.enroll2FA();
        if (enrollRes.success && enrollRes.data?.totp?.qr_code) {
          setQrCodeUrl(enrollRes.data.totp.qr_code);
          setShowQrModal(true);
        } else {
          // If no QR generated, proceed
          finishRegistration({ user, session });
        }
      } catch (enrollErr) {
        console.warn('Enroll 2FA warning:', enrollErr);
        // Fallback: proceed to user feed
        finishRegistration({ user, session });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg(
        err.response?.data?.error?.message ||
          err.response?.data?.error ||
          'Error al registrar la cuenta. Intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const finishRegistration = (data: any) => {
    login(data);
    const userRole = tipo || data?.user?.user_metadata?.tipo || data?.user?.user_metadata?.role;
    if (userRole === 'Tatuador') {
      // 90-day trial is automatically active upon registration
      navigate('/artist-dashboard');
    } else {
      navigate('/client-dashboard');
    }
  };

  const handleQrExit = () => {
    setShowQrModal(false);
    if (registeredSession) {
      finishRegistration(registeredSession);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="register flex-1 flex items-center justify-center py-12 px-4">
        <div className="container max-w-lg w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-800">
          <div className="session">
            <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6">
              Registrarse
            </h1>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg text-center">
                {errorMsg}
              </div>
            )}

            <form action="createUserForm" id="createUserForm" onSubmit={handleSubmit} className="space-y-4">
              <div className="log space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Nombre
                    </p>
                    <input
                      type="text"
                      name="nombre"
                      id="bar"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Juan"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Apellido
                    </p>
                    <input
                      type="text"
                      name="apellido"
                      id="bar"
                      required
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Perez"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Edad
                  </p>
                  <input
                    type="date"
                    name="edad"
                    id="bar"
                    required
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Correo Electrónico
                  </p>
                  <input
                    type="email"
                    name="email"
                    id="bar"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juan@ejemplo.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Contraseña
                    </p>
                    <input
                      type="password"
                      name="password"
                      id="bar"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Confirmar Contraseña
                    </p>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="bar"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    ¿Qué eres?
                  </p>
                  <select
                    name="tipo"
                    id="options"
                    required
                    value={tipo}
                    onChange={handleRoleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                  >
                    <option value="" disabled>
                      Seleccione una opción
                    </option>
                    <option value="Cliente">Cliente 🤩</option>
                    <option value="Tatuador">Tatuador 😎</option>
                  </select>
                </div>

                {/* Legal Acceptance Checkboxes (R2) */}
                <div className="pt-2 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      id="termsCheckbox"
                      name="termsAccepted"
                      required
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span>
                      Acepto los{' '}
                      <Link
                        to="/legal/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        Términos y Condiciones
                      </Link>{' '}
                      del servicio.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      id="privacyCheckbox"
                      name="privacyAccepted"
                      required
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span>
                      Acepto la{' '}
                      <Link
                        to="/legal/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        Política de Privacidad
                      </Link>{' '}
                      y el tratamiento de mis datos personales.
                    </span>
                  </label>
                </div>
              </div>

              <br />
              <button
                type="submit"
                className="submit w-full py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-lg transition duration-200 shadow-lg cursor-pointer"
                id="btn-submit"
                disabled={loading || !termsAccepted || !privacyAccepted}
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </form>
          </div>

          <div className="pages mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 text-center space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>¿Ya estás registrado?</p>
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>

      {/* Subscription Alert for Tatuador */}
      <SubscriptionNoticeModal
        isOpen={showSubscriptionNotice}
        onContinue={() => setShowSubscriptionNotice(false)}
        onCancel={() => {
          setShowSubscriptionNotice(false);
          setTipo('Cliente');
        }}
      />

      {/* QR Modal for 2FA */}
      <QrModal
        isOpen={showQrModal}
        qrCodeUrl={qrCodeUrl}
        onExit={handleQrExit}
      />

      <div className="back text-center pb-8">
        <Link to="/" className="inline-block hover:opacity-80 transition">
          <img src="/assets/Back To White.png" alt="Volver" className="w-10 h-10 mx-auto" />
        </Link>
      </div>

      <Footer />
    </div>
  );
};
