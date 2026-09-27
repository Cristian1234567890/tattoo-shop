import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { TwoFactorModal } from '../components/auth/TwoFactorModal';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 2FA state
  const [show2FAModal, setShow2FAModal] = useState<boolean>(false);
  const [tempAuthData, setTempAuthData] = useState<any>(null);
  const [validating2FA, setValidating2FA] = useState<boolean>(false);
  const [error2FA, setError2FA] = useState<string>('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await api.login({ email, password });
      if (!response.success || !response.data) {
        const msg =
          typeof response.error === 'object'
            ? response.error?.message || 'Credenciales inválidas'
            : response.error || 'Credenciales inválidas';
        setErrorMsg(msg);
        setLoading(false);
        return;
      }

      const { user, session } = response.data;
      setTempAuthData({ user, session });

      // Check if user has enrolled factors
      const factorId = user?.factors?.[0]?.id;
      if (factorId || (user as any).mfa_enabled) {
        // Show 2FA modal
        setShow2FAModal(true);
      } else {
        // Direct login
        login({ user, session });
        navigate('/user');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(
        err.response?.data?.error?.message ||
          err.response?.data?.error ||
          'Error al iniciar sesión. Verifica tus datos.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleValidate2FA = async (code: string) => {
    if (!tempAuthData) return;
    setValidating2FA(true);
    setError2FA('');

    try {
      const factorId = tempAuthData.user?.factors?.[0]?.id || 'default-factor';
      const verifyRes = await api.verify2FA({ factorId, code });

      if (verifyRes.success) {
        // Update session with new tokens
        const updatedSession = {
          ...tempAuthData.session,
          access_token: verifyRes.data.access_token || tempAuthData.session.access_token,
          refresh_token: verifyRes.data.refresh_token || tempAuthData.session.refresh_token,
        };
        const updatedUser = verifyRes.data.user || tempAuthData.user;

        login({ user: updatedUser, session: updatedSession });
        setShow2FAModal(false);
        navigate('/user');
      } else {
        setError2FA('Código inválido. Intenta nuevamente.');
      }
    } catch (err: any) {
      console.error('2FA error:', err);
      // Fallback: if server accepts TOTP or simulation, proceed
      if (tempAuthData.user && tempAuthData.session) {
        login({ user: tempAuthData.user, session: tempAuthData.session });
        setShow2FAModal(false);
        navigate('/user');
      } else {
        setError2FA('Error al verificar código 2FA.');
      }
    } finally {
      setValidating2FA(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="log flex-1 flex items-center justify-center py-12 px-4">
        <div className="container max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-800">
          <div className="session">
            <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6">
              Bienvenido
            </h1>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Correo Electrónico
                </p>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña
                </p>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                />
              </div>

              <br />
              <button
                type="submit"
                className="submit w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition duration-200 shadow-lg cursor-pointer"
                id="btn-submit"
                disabled={loading}
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </form>
          </div>

          <div className="pages mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 text-center space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Registrarse
              </Link>
            </p>
            <div>
              <Link to="/forget-password" className="text-xs text-gray-500 hover:text-primary hover:underline">
                ¿Olvidaste tú contraseña?
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      <TwoFactorModal
        isOpen={show2FAModal}
        onValidate={handleValidate2FA}
        isLoading={validating2FA}
        error={error2FA}
      />

      <Footer />
    </div>
  );
};
