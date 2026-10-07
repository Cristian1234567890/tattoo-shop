import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Check,
  AtSign,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../api/supabase';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { TurnstileWidget } from '../components/auth/TurnstileWidget';
import { translateAuthError } from '../utils/authErrors';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
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
  const [searchParams] = useSearchParams();

  const getDashboardRoute = (userOrRole?: any): string => {
    let role = '';
    if (typeof userOrRole === 'string') {
      role = userOrRole;
    } else if (userOrRole?.user_metadata) {
      role = userOrRole.user_metadata.tipo || userOrRole.user_metadata.role || '';
    }
    const normalized = (role || '').toLowerCase();
    if (normalized === 'tatuador') return '/artist-dashboard';
    if (normalized === 'cliente') return '/client-dashboard';
    return '/user';
  };

  const navigateToDestination = (user?: any) => {
    const rawRedirect = searchParams.get('redirect');
    if (rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.startsWith('/hub')) {
      navigate(rawRedirect);
      return;
    }
    navigate(getDashboardRoute(user));
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (error) {
          setErrorMsg(error.message);
          return;
        }

        if (data.currentLevel === data.nextLevel) {
          login({ user: session.user as any, session: session as any });
          navigateToDestination(session.user);
        } else {
          const { data: factorsData } = await supabase.auth.mfa.listFactors();
          if (factorsData && factorsData.totp.length > 0) {
            setFactorId(factorsData.totp[0].id);
            setMfaPhase('VERIFY');
          } else {
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
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate, login]);

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    const rawRedirect = searchParams.get('redirect');
    const targetPath =
      rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.startsWith('/hub')
        ? rawRedirect
        : '/user';
    const redirectUrl = `${window.location.origin}${targetPath}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
    if (error) setErrorMsg(error.message);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!turnstileToken) {
      setErrorMsg('Por favor completa la verificación de seguridad anti-bots.');
      return;
    }

    setLoading(true);

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      try {
        const fallbackRes = await api.login({ email: email.trim(), password });
        if (fallbackRes.success && fallbackRes.data) {
          setLoading(false);
          login({ user: fallbackRes.data.user as any, session: fallbackRes.data.session as any });
          navigateToDestination(fallbackRes.data.user);
          return;
        }
      } catch {
        // Fallback note
      }
      setErrorMsg(translateAuthError(error.message));
      setLoading(false);
      return;
    }

    if (signInData.user && signInData.session) {
      login({ user: signInData.user as any, session: signInData.session as any });
      navigateToDestination(signInData.user);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setVerifyLoading(true);

    try {
      const { data, error } = await supabase.auth.mfa.challenge({ factorId });
      if (error) throw error;

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: data.id,
        code: otpCode.trim(),
      });
      if (verifyErr) throw verifyErr;

      const sessionRes = await supabase.auth.getSession();
      if (sessionRes.data.session) {
        login({
          user: sessionRes.data.session.user as any,
          session: sessionRes.data.session as any,
        });
        navigateToDestination(sessionRes.data.session.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Código OTP inválido');
    } finally {
      setVerifyLoading(false);
    }
  };

  const rawRedirect = searchParams.get('redirect');
  const registerLink =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? `/register?redirect=${encodeURIComponent(rawRedirect)}`
      : '/register';

  return (
    <div className="min-h-screen bg-[#090b10] text-[#e5e1e6] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Dynamic Atmospheric Glows & Ink Haze */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[680px] h-[360px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[420px] h-[280px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-20 w-[300px] h-[300px] bg-purple-900/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Central Editorial Master Container */}
      <div className="w-full max-w-[500px] relative z-10">
        {/* Outer Ambient Glow Border Frame (Stitch Neon Halo Effect) */}
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-purple-500/80 via-purple-600/30 to-white/10 shadow-[0_0_50px_rgba(124,58,237,0.25)]">
          {/* Smoked Glass Inner Surface Card */}
          <div className="bg-[#0f0e17]/95 backdrop-blur-2xl rounded-2xl p-7 sm:p-9 relative overflow-hidden shadow-2xl border border-white/5">
            {/* Subtle Atelier Ink Texture Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-80" />

            {/* Atelier Header Section */}
            <div className="flex flex-col items-center text-center">
              {/* Headings */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                ¡Bienvenido de nuevo!
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
                Inicia sesión para gestionar tus citas, stencils confidenciales y agenda de sesiones.
              </p>
            </div>

            {searchParams.get('reset') === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5 p-3.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>¡Tu contraseña ha sido restablecida con éxito! Ingresa con tu nueva clave.</span>
              </motion.div>
            )}

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5 p-3.5 bg-red-950/40 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {mfaPhase === 'NONE' && (
              <>
                {/* Social Fast Access Row (Google) */}
                <div className="w-full mb-6">
                  <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="flex items-center justify-center gap-3 py-3.5 px-6 w-full rounded-xl bg-zinc-900/80 hover:bg-zinc-800 transition-all duration-200 text-white group shadow-sm text-sm font-semibold border border-white/10 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" fill="#EA4335" />
                      <path d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" fill="#4285F4" />
                      <path d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" fill="#FBBC05" />
                      <path d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" fill="#34A853" />
                    </svg>
                    <span>Continuar con Google</span>
                  </button>
                </div>

                {/* Section Separator */}
                <div className="relative flex items-center justify-center my-6">
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                  <span className="absolute bg-[#0f0e17] px-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    O MEDIANTE CREDENCIALES REGISTRADAS
                  </span>
                </div>

                {/* Formulario */}
                <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                  {/* Correo o Alias */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="userEmail" className="text-[11px] font-bold tracking-wider text-zinc-300 flex items-center gap-1.5 uppercase">
                        <Lock className="w-3.5 h-3.5 text-purple-400" />
                        CORREO O ALIAS
                      </label>
                      <span className="text-[11px] text-zinc-500 font-mono">@usuario / estudio@dominio</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        id="userEmail"
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ej. artista@tattoohub.com o @master_ink"
                        className="w-full bg-zinc-950/80 text-white pl-3.5 pr-10 py-3 rounded-xl text-sm border border-zinc-800 placeholder:text-zinc-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition shadow-inner"
                      />
                      <div className="absolute right-3.5 text-zinc-500 pointer-events-none">
                        <AtSign className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="userPassword" className="text-[11px] font-bold tracking-wider text-zinc-300 flex items-center gap-1.5 uppercase">
                        <Key className="w-3.5 h-3.5 text-purple-400" />
                        CONTRASEÑA
                      </label>
                      <Link
                        to="/forget-password"
                        className="text-[11px] text-purple-400 hover:text-purple-300 transition underline-offset-4 hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        id="userPassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-zinc-950/80 text-white pl-3.5 pr-11 py-3 rounded-xl text-sm border border-zinc-800 placeholder:text-zinc-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        aria-label="Alternar visibilidad"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Mantener sesión */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded-md bg-zinc-800 peer-checked:bg-purple-600 flex items-center justify-center transition-all peer-checked:shadow-[0_0_10px_rgba(124,58,237,0.5)] border border-zinc-700">
                        {rememberDevice && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                      <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition">
                        Mantener sesión en este dispositivo
                      </span>
                    </label>
                  </div>

                  {/* Turnstile Widget Limpio & Integrado */}
                  <div className="pt-1">
                    <TurnstileWidget
                      onSuccess={(tok) => {
                        setTurnstileToken(tok);
                        if (errorMsg.includes('anti-bots')) setErrorMsg('');
                      }}
                      onExpire={() => setTurnstileToken(null)}
                    />
                  </div>

                  {/* Primary Submit Button con Halo Púrpura */}
                  <button
                    type="submit"
                    disabled={loading || !turnstileToken}
                    className="relative w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-right transition-all duration-300 text-white font-semibold text-sm shadow-[0_8px_25px_rgba(124,58,237,0.35)] hover:shadow-[0_10px_35px_rgba(124,58,237,0.55)] flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>{loading ? 'Accediendo a Tattoo Hub...' : 'Iniciar Sesión en Tattoo Hub'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-200" />
                  </button>
                </form>

                {/* Studio Community Signup Callout (Stitch Bottom Card) */}
                <div className="mt-6 p-4 rounded-xl bg-zinc-900/60 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-wider text-purple-400 uppercase">
                      NUEVO EN LA RED
                    </span>
                    <span className="text-xs text-zinc-400">
                      ¿Aún no tienes cuenta registrada?
                    </span>
                  </div>
                  <Link
                    to={registerLink}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition duration-200 shadow-sm shrink-0 border border-white/10"
                  >
                    <span>Regístrate gratis</span>
                    <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                  </Link>
                </div>
              </>
            )}

            {/* MFA Enroll Phase */}
            {mfaPhase === 'ENROLL' && (
              <div className="text-center py-4">
                <h2 className="text-xl font-bold mb-3 text-white">Configurar Autenticador</h2>
                <p className="text-zinc-400 text-xs mb-4">
                  Escanea este código QR con Google Authenticator o Authy.
                </p>
                <div className="flex justify-center mb-5 p-3 bg-white rounded-xl w-fit mx-auto">
                  <QRCodeSVG value={totpUri} size={160} />
                </div>
                <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-xs mx-auto">
                  <input
                    type="text"
                    required
                    placeholder="Código 6 dígitos"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full text-center tracking-widest text-lg py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={verifyLoading}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition"
                  >
                    {verifyLoading ? 'Verificando...' : 'Verificar y Entrar'}
                  </button>
                </form>
              </div>
            )}

            {/* MFA Verify Phase */}
            {mfaPhase === 'VERIFY' && (
              <div className="text-center py-4">
                <h2 className="text-xl font-bold mb-3 text-white">Verificación en Dos Pasos</h2>
                <p className="text-zinc-400 text-xs mb-4">
                  Ingresa el código de 6 dígitos de tu aplicación autenticadora.
                </p>
                <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-xs mx-auto">
                  <input
                    type="text"
                    required
                    placeholder="000 000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full text-center tracking-widest text-xl font-mono py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={verifyLoading}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition"
                  >
                    {verifyLoading ? 'Validando...' : 'Acceder'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer Link & SSL Badge */}
        <div className="mt-5 flex items-center justify-between text-xs text-zinc-500 px-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Volver al inicio de Tattoo Hub</span>
          </Link>
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cifrado SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
