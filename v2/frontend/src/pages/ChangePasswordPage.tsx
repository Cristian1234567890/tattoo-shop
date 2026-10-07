import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, AlertCircle, Loader2, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../api/supabase';

export const ChangePasswordPage: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);
  const [hasValidSession, setHasValidSession] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Escuchar el evento de recuperación de contraseña de Supabase o validar la sesión actual
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasValidSession(true);
      }
      setSessionChecked(true);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setHasValidSession(true);
        setSessionChecked(true);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSubmitted(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err: any) {
      console.error('[ChangePassword] Error:', err);
      setError(
        err.message || 'No se pudo actualizar la contraseña. El enlace de recuperación puede haber expirado.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 bg-[#090d16] relative overflow-hidden">
      {/* Glow ambiental */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-zinc-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-zinc-800 relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-white mb-2 tracking-tight">
          Nueva Contraseña
        </h1>
        <p className="text-zinc-400 text-sm text-center mb-6">
          Ingresa y confirma tu nueva credencial de acceso para asegurar tu cuenta en Tattoo Hub.
        </p>

        {sessionChecked && !hasValidSession && (
          <div className="mb-6 p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-start gap-3 text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">Sin sesión de recuperación activa</p>
              <p className="text-amber-300/80 mt-0.5">
                Para restablecer tu contraseña debes abrir el enlace seguro enviado a tu correo o solicitar uno en <Link to="/forget-password" className="underline font-semibold hover:text-white">olvidé mi contraseña</Link>.
              </p>
            </div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-950/40 border border-red-500/40 rounded-xl flex items-start gap-3 text-red-300 text-sm"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="p-5 bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 rounded-xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-semibold text-white">¡Contraseña restablecida!</p>
              <p className="text-xs text-emerald-200/90">
                Tu clave ha sido actualizada con éxito. Serás redirigido al inicio de sesión en unos momentos.
              </p>
            </div>

            <Link
              to="/login"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold flex items-center justify-center gap-2 transition cursor-pointer text-sm shadow-lg shadow-amber-500/20"
            >
              Iniciar Sesión Ahora
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Nueva Contraseña (mín. 8 caracteres)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-zinc-800 bg-zinc-950/60 text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-new-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirm-new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950/60 text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition text-sm"
                />
              </div>
            </div>

            {password && confirmPassword && (
              <div className="text-xs">
                {password === confirmPassword ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Las contraseñas coinciden
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Las contraseñas aún no coinciden
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              className="w-full py-3.5 px-4 mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Actualizando credencial...</span>
                </>
              ) : (
                <span>Guardar Nueva Contraseña</span>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-5 border-t border-zinc-800/80 flex items-center justify-center text-xs text-zinc-400">
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Iniciar Sesión</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
