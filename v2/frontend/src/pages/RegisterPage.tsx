import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Heart,
  Circle,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  Calendar,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { isQaEnvironment } from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { CustomSelect, SelectOption } from '../components/common/CustomSelect';
import { TermsModal } from '../components/auth/TermsModal';
import { TurnstileWidget } from '../components/auth/TurnstileWidget';
import { VerificationModal } from '../components/auth/VerificationModal';
import { COUNTRIES, getCountryByName } from '../utils/countries';

const COUNTRY_OPTIONS: SelectOption[] = COUNTRIES.map((c) => ({
  value: c.value,
  label: `${c.label} (${c.dialCode})`,
  flag: c.flag,
  code: c.code,
}));

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role')?.toLowerCase() === 'tatuador' ? 'Tatuador' : 'Cliente';
  const [tipo, setTipo] = useState<'Cliente' | 'Tatuador'>(initialRole);

  // Form State
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('España');
  const [birthdate, setBirthdate] = useState('');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    nombre?: string;
    apellido?: string;
    email?: string;
    phoneLocal?: string;
    birthdate?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    password?: string;
    confirmPassword?: string;
    termsAccepted?: string;
  }>({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const selectedCountryData = getCountryByName(country);
  const fullPhoneNumber = `${selectedCountryData.dialCode} ${phoneLocal}`.trim();

  const rawRedirect = searchParams.get('redirect');
  const loginLink =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? `/login?redirect=${encodeURIComponent(rawRedirect)}`
      : '/login';

  const calculateAge = (birthDateString: string): number | null => {
    if (!birthDateString) return null;
    const birth = new Date(birthDateString);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge(birthdate);
  const isUnderage = currentAge !== null && currentAge < 18;

  // Paso 1: Validación previa personalizada y apertura del modal de verificación
  const handlePreRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const errors: typeof fieldErrors = {};

    if (!nombre.trim()) {
      errors.nombre = 'Por favor ingresa tu nombre.';
    }
    if (!apellido.trim()) {
      errors.apellido = 'Por favor ingresa tu apellido.';
    }
    if (!email.trim()) {
      errors.email = 'Por favor ingresa tu correo electrónico.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'El formato del correo electrónico es inválido.';
    }
    if (!phoneLocal.trim()) {
      errors.phoneLocal = 'Por favor ingresa tu número de teléfono móvil.';
    }
    if (!birthdate) {
      errors.birthdate = 'La fecha de nacimiento es obligatoria para verificar la mayoría de edad.';
    } else if (isUnderage) {
      errors.birthdate = 'Debes ser mayor de 18 años para registrarte en Tattoo Hub.';
    }

    if (tipo === 'Tatuador') {
      if (!address.trim()) {
        errors.address = 'Por favor ingresa la dirección de tu estudio.';
      }
      if (!city.trim()) {
        errors.city = 'Por favor ingresa tu ciudad.';
      }
      if (!postalCode.trim()) {
        errors.postalCode = 'Por favor ingresa tu código postal.';
      }
    }

    if (!password) {
      errors.password = 'Por favor ingresa una contraseña.';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Por favor confirma tu contraseña.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (!termsAccepted) {
      errors.termsAccepted = 'Debes leer y aceptar los Términos y la Política de Privacidad.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      const targetId = `reg-${firstKey}`;
      document.getElementById(targetId)?.focus();
      return;
    }

    setFieldErrors({});

    if (!turnstileToken) {
      setErrorMsg('Por favor completa la verificación de seguridad anti-bots.');
      return;
    }

    setIsVerificationModalOpen(true);
  };

  // Paso 2: Creación de cuenta tras superar la doble verificación (Email OTP + Phone OTP)
  const executeVerifiedRegistration = async () => {
    setIsVerificationModalOpen(false);
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await api.register({
        email,
        password,
        tipo,
        nombre,
        apellido,
        edad: currentAge ? String(currentAge) : '18',
        telefono: fullPhoneNumber,
        provincia: country,
        ciudad: city,
        direccion: address,
        environment: isQaEnvironment() ? 'qa' : 'production',
      } as any);

      if (response.success && response.data) {
        await login({ user: response.data.user, session: response.data.session });

        if (rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.startsWith('/hub')) {
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
    <div className="min-h-screen text-slate-800 dark:text-zinc-300 font-sans selection:bg-violet-500/30 flex flex-col">
      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="mb-10">
          <span className="text-[10px] font-bold tracking-widest uppercase text-violet-400 mb-2 block bg-violet-600/10 w-max px-2.5 py-1 rounded-full border border-violet-500/20">
            PORTAL DE ACCESO AL COLECTIVO
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Elige cómo quieres formar parte de la comunidad
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 text-lg">
            Ya sea que busques plasmar una nueva pieza o gestionar la agenda y flashes de tu estudio.
          </p>
        </div>

        {/* QA Sandbox Notice */}
        {isQaEnvironment() && (
          <div
            id="qa-register-sandbox-alert"
            className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs shadow-lg backdrop-blur-sm"
          >
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block font-bold text-sm mb-0.5">
                🧪 Registro en Entorno de QA / Sandbox
              </strong>
              <p className="text-zinc-300 leading-relaxed">
                Esta cuenta se creará en el esquema aislado de pruebas <code className="text-amber-300 bg-amber-950/40 px-1 py-0.5 rounded font-mono">qa</code>. No otorga acceso al entorno productivo ni interactúa con clientes reales.
              </p>
            </div>
          </div>
        )}

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Cliente Card */}
          <div
            onClick={() => setTipo('Cliente')}
            className={`cursor-pointer rounded-3xl p-8 border-2 transition-all ${
              tipo === 'Cliente'
                ? 'atelier-card border-violet-500 shadow-[0_0_30px_rgba(124,58,237,0.2)]'
                : 'bg-white dark:bg-[#13131A] border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold tracking-widest text-slate-600 dark:text-zinc-400 uppercase bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                ACCESO GRATUITO • EXPLORACIÓN
              </span>
              {tipo === 'Cliente' ? (
                <CheckCircle className="w-6 h-6 text-violet-500" />
              ) : (
                <Circle className="w-6 h-6 text-zinc-400 dark:text-zinc-700" />
              )}
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Cliente</h3>
            <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed mb-8">
              Descubre artistas locales, guarda stencils y flash books en tus favoritos, solicita
              cotizaciones directas sin comisiones y lleva un diario de cicatrización de tus piezas.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex gap-3 text-sm text-slate-700 dark:text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Exploración sin límites y contacto directo por chat.
              </li>
              <li className="flex gap-3 text-sm text-slate-700 dark:text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Cotizaciones con medidas y zona anatómica clara.
              </li>
              <li className="flex gap-3 text-sm text-slate-700 dark:text-zinc-300">
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
                : 'bg-white dark:bg-[#13131A] border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm'
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
                <Circle className="w-6 h-6 text-zinc-400 dark:text-zinc-700" />
              )}
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Tatuador / Estudio Independiente</h3>
            <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed mb-8">
              Publica tu portafolio en alta resolución, expón tus flash designs con tarifas cerradas,
              agenda guest spots en otras ciudades y recibe cotizaciones organizadas sin mensajes perdidos.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex gap-3 text-sm text-slate-700 dark:text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Perfil geolocalizado en el mapa de estudios.
              </li>
              <li className="flex gap-3 text-sm text-slate-700 dark:text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Subida directa de flashes con medidas y zonas recomendadas.
              </li>
              <li className="flex gap-3 text-sm text-slate-700 dark:text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Control de agenda para residentes y artistas invitados.
              </li>
              <li className="flex gap-3 text-sm text-slate-700 dark:text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Sin comisiones sobre lo que cobras en el estudio.
              </li>
            </ul>
          </div>
        </div>

        {/* Form Container */}
        <div className="atelier-card rounded-3xl p-8 md:p-12 relative shadow-2xl">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest text-slate-600 dark:text-zinc-400 uppercase">
            REGISTRO DE {tipo.toUpperCase()}
          </div>

          <form onSubmit={handlePreRegister} noValidate className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-800 dark:text-white mb-2">Nombre(s)</label>
                <input
                  id="reg-nombre"
                  type="text"
                  value={nombre}
                  aria-invalid={Boolean(fieldErrors.nombre)}
                  aria-describedby={fieldErrors.nombre ? 'reg-nombre-error' : undefined}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (fieldErrors.nombre) setFieldErrors((prev) => ({ ...prev, nombre: undefined }));
                  }}
                  placeholder="Ej: Mateo o Carlos"
                  className={`input-atelier w-full transition ${
                    fieldErrors.nombre
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                      : ''
                  }`}
                />
                {fieldErrors.nombre && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    id="reg-nombre-error"
                    role="alert"
                    className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1 pl-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{fieldErrors.nombre}</span>
                  </motion.div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 dark:text-white mb-2">Apellido(s)</label>
                <input
                  id="reg-apellido"
                  type="text"
                  value={apellido}
                  aria-invalid={Boolean(fieldErrors.apellido)}
                  aria-describedby={fieldErrors.apellido ? 'reg-apellido-error' : undefined}
                  onChange={(e) => {
                    setApellido(e.target.value);
                    if (fieldErrors.apellido) setFieldErrors((prev) => ({ ...prev, apellido: undefined }));
                  }}
                  placeholder="Ej: Valenzuela o Restrepo"
                  className={`input-atelier w-full transition ${
                    fieldErrors.apellido
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                      : ''
                  }`}
                />
                {fieldErrors.apellido && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    id="reg-apellido-error"
                    role="alert"
                    className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1 pl-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{fieldErrors.apellido}</span>
                  </motion.div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-white mb-2">Correo electrónico</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="estudio@tattoohub.art"
                className={`input-atelier w-full transition ${
                  fieldErrors.email
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                    : ''
                }`}
              />
              {fieldErrors.email && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="reg-email-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1 pl-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{fieldErrors.email}</span>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <CustomSelect
                  label="País de residencia / operación"
                  options={COUNTRY_OPTIONS}
                  value={country}
                  onChange={(val) => setCountry(val)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 dark:text-white mb-2">Número de teléfono móvil</label>
                <div
                  className={`flex rounded-xl overflow-hidden border bg-slate-50 dark:bg-[#121217] transition-all ${
                    fieldErrors.phoneLocal
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-zinc-800 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500'
                  }`}
                >
                  <div className="bg-slate-100 dark:bg-zinc-900/90 px-3.5 py-3 border-r border-slate-300 dark:border-zinc-800 flex items-center gap-1.5 text-sm font-semibold text-violet-700 dark:text-violet-300 shrink-0 select-none">
                    <span className="text-base">{selectedCountryData.flag}</span>
                    <span className="font-mono">{selectedCountryData.dialCode}</span>
                  </div>
                  <input
                    id="reg-phoneLocal"
                    type="tel"
                    value={phoneLocal}
                    aria-invalid={Boolean(fieldErrors.phoneLocal)}
                    aria-describedby={fieldErrors.phoneLocal ? 'reg-phoneLocal-error' : undefined}
                    onChange={(e) => {
                      setPhoneLocal(e.target.value);
                      if (fieldErrors.phoneLocal) setFieldErrors((prev) => ({ ...prev, phoneLocal: undefined }));
                    }}
                    placeholder={selectedCountryData.placeholder}
                    className="bg-transparent px-4 py-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 text-sm focus:outline-none w-full"
                  />
                </div>
                {fieldErrors.phoneLocal && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    id="reg-phoneLocal-error"
                    role="alert"
                    className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1 pl-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{fieldErrors.phoneLocal}</span>
                  </motion.div>
                )}
                <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
                  Prefijo reactivo {selectedCountryData.dialCode} ({selectedCountryData.label}).
                </p>
              </div>
            </div>

            {/* Fecha de Nacimiento con Validación 18+ */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-white">
                  <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Fecha de Nacimiento
                </label>
                {currentAge !== null && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      isUnderage
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {isUnderage ? `Menor de edad (${currentAge} años)` : `Mayor de edad (${currentAge} años)`}
                  </span>
                )}
              </div>
              <input
                id="reg-birthdate"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={birthdate}
                aria-invalid={Boolean(fieldErrors.birthdate || isUnderage)}
                aria-describedby={fieldErrors.birthdate ? 'reg-birthdate-error' : undefined}
                onChange={(e) => {
                  setBirthdate(e.target.value);
                  if (fieldErrors.birthdate) setFieldErrors((prev) => ({ ...prev, birthdate: undefined }));
                }}
                className={`input-atelier w-full cursor-pointer transition ${
                  fieldErrors.birthdate || isUnderage
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                    : ''
                }`}
              />
              {fieldErrors.birthdate && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="reg-birthdate-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1 pl-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{fieldErrors.birthdate}</span>
                </motion.div>
              )}
              {isUnderage && (
                <div className="mt-2.5 p-3 rounded-xl bg-red-950/30 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Acceso Restringido (18+):</strong> Debes ser mayor de 18 años para registrarte en Tattoo Hub conforme a las normativas sanitarias y legales aplicables a intervenciones de arte corporal.
                  </span>
                </div>
              )}
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
                    <label className="block text-sm font-medium text-slate-800 dark:text-white">
                      Ubicación para el Mapa de Estudios
                    </label>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/30">
                      Geolocalización lista
                    </span>
                  </div>
                  <div>
                    <input
                      id="reg-address"
                      type="text"
                      value={address}
                      aria-invalid={Boolean(fieldErrors.address)}
                      aria-describedby={fieldErrors.address ? 'reg-address-error' : undefined}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: undefined }));
                      }}
                      placeholder="Dirección del estudio o calle (ej. Calle del Pez 28, Local B)"
                      className={`input-atelier w-full mb-4 transition ${
                        fieldErrors.address
                          ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                          : ''
                      }`}
                    />
                    {fieldErrors.address && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="reg-address-error"
                        role="alert"
                        className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mb-4 pl-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                        <span>{fieldErrors.address}</span>
                      </motion.div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          id="reg-city"
                          type="text"
                          value={city}
                          aria-invalid={Boolean(fieldErrors.city)}
                          aria-describedby={fieldErrors.city ? 'reg-city-error' : undefined}
                          onChange={(e) => {
                            setCity(e.target.value);
                            if (fieldErrors.city) setFieldErrors((prev) => ({ ...prev, city: undefined }));
                          }}
                          placeholder="Ciudad / Localidad (ej. Madrid)"
                          className={`input-atelier w-full transition ${
                            fieldErrors.city
                              ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                              : ''
                          }`}
                        />
                        {fieldErrors.city && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            id="reg-city-error"
                            role="alert"
                            className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1 pl-1"
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                            <span>{fieldErrors.city}</span>
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <input
                          id="reg-postalCode"
                          type="text"
                          value={postalCode}
                          aria-invalid={Boolean(fieldErrors.postalCode)}
                          aria-describedby={fieldErrors.postalCode ? 'reg-postalCode-error' : undefined}
                          onChange={(e) => {
                            setPostalCode(e.target.value);
                            if (fieldErrors.postalCode) setFieldErrors((prev) => ({ ...prev, postalCode: undefined }));
                          }}
                          placeholder="Código Postal (ej. 28004)"
                          className={`input-atelier w-full transition ${
                            fieldErrors.postalCode
                              ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                              : ''
                          }`}
                        />
                        {fieldErrors.postalCode && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            id="reg-postalCode-error"
                            role="alert"
                            className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1 pl-1"
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                            <span>{fieldErrors.postalCode}</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-slate-800 dark:text-white mb-2">
                  Contraseña segura
                  {password.length > 0 && <span className="text-[10px] text-emerald-400 font-bold">MEDIA</span>}
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'reg-password-error' : undefined}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="••••••••••••"
                    className={`input-atelier w-full pr-12 transition ${
                      fieldErrors.password
                        ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                        : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    id="reg-password-error"
                    role="alert"
                    className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1 pl-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{fieldErrors.password}</span>
                  </motion.div>
                )}
              </div>
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-slate-800 dark:text-white mb-2">
                  Confirmar contraseña
                  {confirmPassword.length > 0 && confirmPassword === password && (
                    <span className="text-[10px] text-emerald-400 font-bold">COINCIDE</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    id="reg-confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    aria-describedby={fieldErrors.confirmPassword ? 'reg-confirmPassword-error' : undefined}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    placeholder="••••••••••••"
                    className={`input-atelier w-full transition ${
                      fieldErrors.confirmPassword
                        ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                        : ''
                    }`}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    id="reg-confirmPassword-error"
                    role="alert"
                    className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mt-1 pl-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{fieldErrors.confirmPassword}</span>
                  </motion.div>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm">
                {errorMsg}
              </div>
            )}

            {/* Terms and Privacy Agreement with Forced Scroll Modal */}
            <div className={`flex items-start gap-3 mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-[#121217] border transition-all ${
              fieldErrors.termsAccepted ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20' : 'border-slate-200 dark:border-zinc-800'
            }`}>
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={() => {
                  const hasRead = sessionStorage.getItem('terms_read_accepted') === 'true';
                  if (!hasRead) {
                    setIsTermsModalOpen(true);
                  } else {
                    const nextVal = !termsAccepted;
                    setTermsAccepted(nextVal);
                    if (nextVal && fieldErrors.termsAccepted) setFieldErrors((prev) => ({ ...prev, termsAccepted: undefined }));
                  }
                }}
                className="mt-1 w-5 h-5 rounded border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-violet-600 focus:ring-violet-500 focus:ring-offset-slate-100 dark:focus:ring-offset-zinc-900 cursor-pointer"
              />
              <div className="text-sm text-slate-600 dark:text-zinc-400">
                <span
                  onClick={() => setIsTermsModalOpen(true)}
                  className="cursor-pointer"
                >
                  He leído y acepto los{' '}
                  <span className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 font-semibold underline underline-offset-4 cursor-pointer">
                    Términos, Condiciones y Políticas de Privacidad
                  </span>{' '}
                  de Tattoo Hub (lectura obligatoria de consentimiento).
                </span>
                {!termsAccepted && (
                  <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                    * Debes abrir la ventana emergente y desplazarte hasta el final para habilitar esta casilla.
                  </p>
                )}
                {fieldErrors.termsAccepted && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    id="reg-terms-error"
                    role="alert"
                    className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium mt-2 pl-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{fieldErrors.termsAccepted}</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Cloudflare Turnstile Anti-Bot Verification */}
            <div className="mt-4">
              <TurnstileWidget
                onSuccess={(token) => {
                  setTurnstileToken(token);
                  if (errorMsg.includes('anti-bots')) setErrorMsg('');
                }}
                onExpire={() => setTurnstileToken(null)}
              />
            </div>

            <button
              id="btn-register-submit"
              disabled={loading}
              type="submit"
              className="btn-atelier-primary keep-white-text !text-white w-full mt-8 py-4 rounded-xl font-bold text-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(124,58,237,0.3)] transition"
            >
              <span className="!text-white keep-white-text font-bold">
                {loading
                  ? 'Creando cuenta...'
                  : isUnderage
                  ? '🔞 Registro Bloqueado: Menor de Edad'
                  : 'Crear mi Cuenta - Empezar Ahora'}
              </span>
            </button>

            <p className="text-center text-sm text-slate-500 dark:text-zinc-500 mt-6 font-body">
              ¿Ya tienes cuenta en Tattoo Hub?{' '}
              <Link to={loginLink} className="text-violet-600 dark:text-white font-medium hover:underline">
                Iniciar Sesión
              </Link>
            </p>
          </form>

          <TermsModal
            isOpen={isTermsModalOpen}
            onClose={() => setIsTermsModalOpen(false)}
            onAccept={() => setTermsAccepted(true)}
          />

          <VerificationModal
            isOpen={isVerificationModalOpen}
            email={email}
            phone={fullPhoneNumber}
            onVerified={executeVerifiedRegistration}
            onClose={() => setIsVerificationModalOpen(false)}
          />
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pb-20">
          <div className="atelier-card p-6 rounded-2xl flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-1">Taller Libre de Comisiones</h4>
              <p className="text-slate-500 dark:text-zinc-500 text-xs leading-relaxed">
                El 100% de lo pactado por tus piezas es para ti. No intermediamos en el cobro de tu arte en camilla.
              </p>
            </div>
          </div>
          <div className="atelier-card p-6 rounded-2xl flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400 shrink-0" />
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-1">Privacidad & Resguardo</h4>
              <p className="text-slate-500 dark:text-zinc-500 text-xs leading-relaxed">
                Tus bocetos, stencils y flashes no son utilizados para alimentar motores generativos de IA.
              </p>
            </div>
          </div>
          <div className="atelier-card p-6 rounded-2xl flex items-start gap-4">
            <Heart className="w-6 h-6 text-pink-500 dark:text-pink-400 shrink-0" />
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-1">Cultura Independiente</h4>
              <p className="text-slate-500 dark:text-zinc-500 text-xs leading-relaxed">
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
