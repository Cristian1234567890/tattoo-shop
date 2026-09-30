import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { supabase } from '../api/supabase';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 2FA / TOTP States
  const [mfaPhase, setMfaPhase] = useState<'NONE' | 'ENROLL' | 'VERIFY'>('NONE');
  const [totpUri, setTotpUri] = useState('');
  const [factorId, setFactorId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const getDashboardRoute = (userOrRole?: any): string => {
    let role = '';
    if (typeof userOrRole === 'string') {
      role = userOrRole;
    } else if (userOrRole?.user_metadata) {
      role = userOrRole.user_metadata.tipo || userOrRole.user_metadata.role || '';
    }
    const normalized = role.toLowerCase();
    if (normalized === 'tatuador') return '/artist-dashboard';
    if (normalized === 'cliente') return '/client-dashboard';
    return '/user';
  };

  const navigateToDashboard = (userOrRole?: any) => {
    const dest = getDashboardRoute(userOrRole);
    if (dest === '/user') {
      navigate('/user');
    } else {
      navigate(dest);
    }
  };

  // Listen to Supabase Auth state changes (useful for Google OAuth callback)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Evaluate MFA level
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (error) {
          setErrorMsg(error.message);
          return;
        }

        if (data.currentLevel === data.nextLevel) {
          // Fully verified
          // We need to sync with our custom node backend if necessary, or just use the session
          login({ user: session.user as any, session: session as any });
          navigateToDashboard(session.user);
        } else {
          // Requires MFA
          const { data: factorsData } = await supabase.auth.mfa.listFactors();
          if (factorsData && factorsData.totp.length > 0) {
            setFactorId(factorsData.totp[0].id);
            setMfaPhase('VERIFY');
          } else {
            // Need to enroll
            const { data: enrollData, error: enrollErr } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
            if (enrollErr) {
              setErrorMsg('Error iniciando 2FA: ' + enrollErr.message);
              return;
            }
            setFactorId(enrollData.id);
            setTotpUri(enrollData.totp.uri);
            setMfaPhase('ENROLL');
          }
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, login]);

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    const redirectUrl = `${window.location.origin}/user`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl }
    });
    if (error) setErrorMsg(error.message);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      try {
        const fallbackRes = await api.login({ email, password });
        if (fallbackRes.success && fallbackRes.data) {
          setLoading(false);
          login({ user: fallbackRes.data.user as any, session: fallbackRes.data.session as any });
          navigateToDashboard(fallbackRes.data.user);
          return;
        }
      } catch {
        // Fallback also failed, display original error
      }
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    if (signInData?.session && signInData?.user) {
      login({ user: signInData.user as any, session: signInData.session as any });
      navigateToDashboard(signInData.user);
    }
    // onAuthStateChange hook will also catch this and trigger MFA checks if required
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.mfa.challenge({ factorId });
    if (error) {
      setErrorMsg(error.message);
      setVerifyLoading(false);
      return;
    }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: data.id,
      code: otpCode,
    });

    if (verifyErr) {
      setErrorMsg('Código incorrecto. ' + verifyErr.message);
      setVerifyLoading(false);
      return;
    }

    setVerifyLoading(false);
    const sessionRes = await supabase.auth.getSession();
    if (sessionRes.data.session) {
      login({ user: sessionRes.data.session.user as any, session: sessionRes.data.session as any });
      navigateToDashboard(sessionRes.data.session.user);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="container max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-800">
          
          {mfaPhase === 'NONE' && (
            <>
              <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6">
                Iniciar Sesión
              </h1>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg text-center">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Continuar con Google
              </button>

              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
                <span className="px-4 text-sm text-gray-500">O ingresa con tu email</span>
                <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</p>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Contraseña</p>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white font-bold rounded-lg transition"
                >
                  {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </button>
              </form>
              
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                ¿No tienes cuenta? <Link to="/register" className="font-semibold text-primary hover:underline">Registrarse</Link>
              </div>
            </>
          )}

          {mfaPhase === 'ENROLL' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Configurar Autenticador</h2>
              <p className="text-gray-600 mb-4 text-sm">Escanea este código QR con tu aplicación de autenticación (ej. Google Authenticator o Authy).</p>
              <div className="flex justify-center mb-6">
                {totpUri && <QRCodeSVG value={totpUri} size={200} />}
              </div>
              <form onSubmit={handleVerifyOTP}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono px-4 py-3 rounded-lg border border-gray-300 mb-4"
                />
                {errorMsg && <p className="text-red-600 text-sm mb-4">{errorMsg}</p>}
                <button type="submit" disabled={verifyLoading} className="w-full py-3 bg-primary text-white font-bold rounded-lg transition">
                  {verifyLoading ? 'Verificando...' : 'Validar y Continuar'}
                </button>
              </form>
            </div>
          )}

          {mfaPhase === 'VERIFY' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Verificación 2FA</h2>
              <p className="text-gray-600 mb-6 text-sm">Ingresa el código de 6 dígitos de tu App de Autenticación.</p>
              <form onSubmit={handleVerifyOTP}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono px-4 py-3 rounded-lg border border-gray-300 mb-4"
                />
                {errorMsg && <p className="text-red-600 text-sm mb-4">{errorMsg}</p>}
                <button type="submit" disabled={verifyLoading} className="w-full py-3 bg-primary text-white font-bold rounded-lg transition">
                  {verifyLoading ? 'Verificando...' : 'Validar Código'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
};
