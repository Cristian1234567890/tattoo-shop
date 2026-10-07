import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { supabase } from '../api/supabase';
import { translateAuthError } from '../utils/authErrors';
import { useLanguage } from '../context/LanguageContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Determinar redirect URL seguro en base al entorno actual
      const redirectTo = `${window.location.origin}/change-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (resetError) {
        throw resetError;
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('[ForgotPassword] Error:', err);
      setError(
        translateAuthError(err.message, language) ||
        (language === 'es'
          ? 'No se pudo enviar el correo de recuperación. Verifica la dirección ingresada.'
          : 'Could not send recovery email. Please verify the entered address.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 bg-[#090d16] relative overflow-hidden">
      {/* Glow ambiental de fondo */}
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
            <KeyRound className="w-7 h-7" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-white mb-2 tracking-tight">
          Recuperar Contraseña
        </h1>
        <p className="text-zinc-400 text-sm text-center mb-6">
          Ingresa el correo electrónico asociado a tu cuenta de Tattoo Hub para recibir un enlace seguro de restablecimiento.
        </p>

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
            className="space-y-6"
          >
            <div className="p-5 bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-semibold text-white">¡Enlace enviado!</p>
              <p className="text-xs text-emerald-200/90">
                Hemos enviado un correo a <strong className="text-white">{email}</strong> con instrucciones para restablecer tu contraseña.
              </p>
            </div>

            <p className="text-xs text-zinc-500 text-center">
              ¿No recibiste el correo? Revisa tu carpeta de spam o intenta nuevamente en unos minutos.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="w-full py-2.5 px-4 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-sm font-medium transition cursor-pointer"
              >
                Reintentar con otro correo
              </button>
              <Link
                to="/login"
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition cursor-pointer text-center"
              >
                <ArrowLeft className="w-4 h-4" /> Volver al Inicio de Sesión
              </Link>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="recovery-email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="recovery-email"
                  type="email"
                  name="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950/60 text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando enlace seguro...</span>
                </>
              ) : (
                <span>Enviar Instrucciones</span>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Iniciar Sesión</span>
          </Link>
          <Link
            to="/register"
            className="text-amber-400 hover:text-amber-300 font-medium transition"
          >
            Crear cuenta nueva
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
