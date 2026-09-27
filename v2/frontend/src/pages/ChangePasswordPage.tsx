import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const ChangePasswordPage: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    setSubmitted(true);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="changepassword flex-1 flex items-center justify-center py-12 px-4">
        <div className="container max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-800">
          <div className="session">
            <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6">
              Olvide mi contraseña
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            {submitted ? (
              <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-center font-medium text-sm">
                ¡Contraseña cambiada exitosamente! Redirigiendo al inicio de sesión...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Nueva Contraseña
                  </p>
                  <input
                    type="password"
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
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="submit w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition duration-200 shadow-lg cursor-pointer"
                  >
                    Listo
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="pages"></div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
