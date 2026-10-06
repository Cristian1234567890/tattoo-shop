import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ShieldCheck, Heart, Circle, CheckCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role')?.toLowerCase() === 'tatuador' ? 'Tatuador' : 'Cliente';
  const [tipo, setTipo] = useState<'Cliente' | 'Tatuador'>(initialRole);

  // Form State
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('España');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const rawRedirect = searchParams.get('redirect');
  const loginLink =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? `/login?redirect=${encodeURIComponent(rawRedirect)}`
      : '/login';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('Debes aceptar los Términos y la Política de Privacidad.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const response = await api.register({
        email,
        password,
        tipo,
        nombre,
        apellido,
        edad: '18',
        telefono: phone,
        provincia: country,
        ciudad: city,
        direccion: address,
      });

      if (response.success && response.data) {
        await login({ user: response.data.user, session: response.data.session });

        if (rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')) {
          navigate(rawRedirect);
          return;
        }

        if (tipo === 'Tatuador') {
          navigate('/artist-dashboard');
        } else {
          navigate('/client-dashboard');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-zinc-300 font-sans selection:bg-violet-500/30 flex flex-col">
      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="mb-10">
          <span className="text-[10px] font-bold tracking-widest uppercase text-violet-400 mb-2 block bg-violet-600/10 w-max px-2.5 py-1 rounded-full border border-violet-500/20">
            PORTAL DE ACCESO AL COLECTIVO
          </span>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            Elige cómo quieres formar parte de la comunidad
          </h1>
          <p className="text-zinc-400 text-lg">
            Ya sea que busques plasmar una nueva pieza o gestionar la agenda y flashes de tu estudio.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Cliente Card */}
          <div
            onClick={() => setTipo('Cliente')}
            className={`cursor-pointer rounded-3xl p-8 border-2 transition-all ${
              tipo === 'Cliente'
                ? 'atelier-card border-violet-500 shadow-[0_0_30px_rgba(124,58,237,0.2)]'
                : 'bg-[#13131A] border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase bg-zinc-800 px-3 py-1.5 rounded-full">
                ACCESO GRATUITO • EXPLORACIÓN
              </span>
              {tipo === 'Cliente' ? (
                <CheckCircle className="w-6 h-6 text-violet-500" />
              ) : (
                <Circle className="w-6 h-6 text-zinc-700" />
              )}
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">Cliente</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              Descubre artistas locales, guarda stencils y flash books en tus favoritos, solicita
              cotizaciones directas sin comisiones y lleva un diario de cicatrización de tus piezas.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Exploración sin límites y contacto directo por chat.
              </li>
              <li className="flex gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Cotizaciones con medidas y zona anatómica clara.
              </li>
              <li className="flex gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Historial clínico de sesiones y cuidados post-tinta.
              </li>
            </ul>
          </div>

          {/* Tatuador Card */}
          <div
            onClick={() => setTipo('Tatuador')}
            className={`cursor-pointer rounded-3xl p-8 border-2 transition-all relative overflow-hidden ${
              tipo === 'Tatuador'
                ? 'atelier-card border-violet-500 shadow-[0_0_30px_rgba(124,58,237,0.2)]'
                : 'bg-[#13131A] border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {tipo === 'Tatuador' && (
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[80px] -z-10 rounded-full" />
            )}
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold tracking-widest text-white uppercase bg-violet-600 px-3 py-1.5 rounded-full shadow-md">
                30 DÍAS DE PRUEBA
              </span>
              {tipo === 'Tatuador' ? (
                <CheckCircle className="w-6 h-6 text-violet-500" />
              ) : (
                <Circle className="w-6 h-6 text-zinc-700" />
              )}
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">Tatuador / Estudio Independiente</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              Publica tu portafolio en alta resolución, expón tus flash designs con tarifas cerradas,
              agenda guest spots en otras ciudades y recibe cotizaciones organizadas sin mensajes perdidos.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Perfil geolocalizado en el mapa de estudios.
              </li>
              <li className="flex gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Subida directa de flashes con medidas y zonas recomendadas.
              </li>
              <li className="flex gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Control de agenda para residentes y artistas invitados.
              </li>
              <li className="flex gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Sin comisiones sobre lo que cobras en el estudio.
              </li>
            </ul>
          </div>
        </div>

        {/* Form Container */}
        <div className="atelier-card rounded-3xl p-8 md:p-12 relative shadow-2xl">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            REGISTRO DE {tipo.toUpperCase()}
          </div>

          <form onSubmit={handleRegister} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nombre(s)</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Mateo o Carlos"
                  className="input-atelier w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Apellido(s)</label>
                <input
                  type="text"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Ej: Valenzuela o Restrepo"
                  className="input-atelier w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="estudio@tattoohub.art"
                className="input-atelier w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">País de residencia / operación</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="input-atelier w-full cursor-pointer"
                >
                  <option value="España">🇪🇸 España</option>
                  <option value="Mexico">🇲🇽 México</option>
                  <option value="Colombia">🇨🇴 Colombia</option>
                  <option value="Panama">🇵🇦 Panamá</option>
                  <option value="Estados Unidos">🇺🇸 Estados Unidos</option>
                  <option value="Argentina">🇦🇷 Argentina</option>
                  <option value="Chile">🇨🇱 Chile</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Número de teléfono móvil</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 612 345 678"
                  className="input-atelier w-full"
                />
              </div>
            </div>

            <AnimatePresence>
              {tipo === 'Tatuador' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-white">
                      Ubicación para el Mapa de Estudios
                    </label>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/30">
                      Geolocalización lista
                    </span>
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Dirección del estudio o calle (ej. Calle del Pez 28, Local B)"
                      className="input-atelier w-full mb-4"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ciudad / Localidad (ej. Madrid)"
                        className="input-atelier w-full"
                      />
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Código Postal (ej. 28004)"
                        className="input-atelier w-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-white mb-2">
                  Contraseña segura
                  {password.length > 0 && <span className="text-[10px] text-emerald-400 font-bold">MEDIA</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input-atelier w-full pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-white mb-2">
                  Confirmar contraseña
                  {confirmPassword.length > 0 && confirmPassword === password && (
                    <span className="text-[10px] text-emerald-400 font-bold">COINCIDE</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input-atelier w-full"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm">
                {errorMsg}
              </div>
            )}

            <div className="flex items-start gap-3 mt-6">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-violet-600 focus:ring-violet-500 focus:ring-offset-zinc-900 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-zinc-400 cursor-pointer">
                Acepto las{' '}
                <Link to="/legal/privacy" className="text-white hover:underline font-medium">
                  Políticas de Privacidad
                </Link>{' '}
                y los{' '}
                <Link to="/legal/terms" className="text-white hover:underline font-medium">
                  Términos y Condiciones
                </Link>{' '}
                de Tattoo Hub.
              </label>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="btn-atelier-primary w-full mt-8 py-4 rounded-xl font-bold text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear mi Cuenta - Empezar Ahora'}
            </button>

            <p className="text-center text-sm text-zinc-500 mt-6">
              ¿Ya tienes cuenta en Tattoo Hub?{' '}
              <Link to={loginLink} className="text-white font-medium hover:underline">
                Iniciar Sesión
              </Link>
            </p>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pb-20">
          <div className="atelier-card p-6 rounded-2xl flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-white font-bold mb-1">Taller Libre de Comisiones</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                El 100% de lo pactado por tus piezas es para ti. No intermediamos en el cobro de tu arte en camilla.
              </p>
            </div>
          </div>
          <div className="atelier-card p-6 rounded-2xl flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-violet-400 shrink-0" />
            <div>
              <h4 className="text-white font-bold mb-1">Privacidad & Resguardo</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Tus bocetos, stencils y flashes no son utilizados para alimentar motores generativos de IA.
              </p>
            </div>
          </div>
          <div className="atelier-card p-6 rounded-2xl flex items-start gap-4">
            <Heart className="w-6 h-6 text-pink-400 shrink-0" />
            <div>
              <h4 className="text-white font-bold mb-1">Cultura Independiente</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Diseñado exclusivamente por y para la comunidad del tatuaje. Conectando tinta real con piel de verdad.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
