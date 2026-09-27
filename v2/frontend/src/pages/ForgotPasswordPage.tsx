import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="forgetpassword flex-1 flex items-center justify-center py-12 px-4">
        <div className="container max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-800">
          <div className="session">
            <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6">
              Olvide mi contraseña
            </h1>

            {submitted ? (
              <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-center font-medium text-sm">
                Hemos enviado un correo de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Correo Electrónico
                  </p>
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="submit w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition duration-200 shadow-lg cursor-pointer"
                  >
                    Enviar
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="pages mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 text-center space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>¿Estás registrado?</p>
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Registrarse
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
