import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { PageTransition } from '../components/common/PageTransition';
import {
  Palette,
  MessageSquare,
  Compass,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Lock,
} from 'lucide-react';

export const ArtistDashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        navigate('/login', { replace: true });
        return;
      }
      const role = (user.user_metadata?.tipo || user.user_metadata?.role || '').toLowerCase();
      if (role === 'cliente') {
        navigate('/client-dashboard', { replace: true });
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const meta = user.user_metadata || {};
  const artistName = meta.nombre || meta.full_name || meta.name || user.email?.split('@')[0] || 'Artista';
  const studioName = meta.direccion || meta.ciudad ? `${meta.ciudad || 'Tattoo'} Studio` : 'Estudio de Tatuajes';
  const workType = meta.work_type || 'Estilos Varios';

  // Calculate trial elapsed / remaining days if created_at is available, default to active day 1
  let trialDay = 1;
  const createdAtString = meta.created_at || (user as any).created_at;
  if (createdAtString) {
    const createdDate = new Date(createdAtString);
    const diffTime = Math.abs(Date.now() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    trialDay = Math.max(diffDays, 1);
  }
  const hasActiveSubscription = Boolean(meta.has_active_subscription);
  const isTrialExpired = trialDay > 90 && !hasActiveSubscription;
  const daysRemaining = Math.max(90 - trialDay, 0);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col relative">
        <Navbar />

      {/* Trial Expired Blocking Lockout Modal */}
      {isTrialExpired && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-900 via-gray-850 to-gray-900 border-2 border-red-500/50 rounded-2xl max-w-lg w-full p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto mb-5">
              <Lock size={32} />
            </div>
            <span className="px-3.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider">
              Acceso Comercial Bloqueado
            </span>
            <h2 className="text-2xl font-black text-white mt-4 mb-2">
              Tu Período de Prueba de 90 Días ha Expirado
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Han transcurrido {trialDay} días desde tu registro. Para continuar publicando en tu catálogo, recibiendo cotizaciones y apareciendo en el mapa de artistas, adquiere tu membresía comercial por $4.99/mes.
            </p>
            <div className="space-y-3">
              <Link
                to="/subscription/creditcard"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-primary hover:opacity-90 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition transform hover:scale-105"
              >
                <CreditCard size={18} /> Adquirir Membresía ($4.99/mes)
              </Link>
              <button
                onClick={() => logout()}
                className="w-full text-xs text-gray-400 hover:text-gray-200 transition py-2"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Trial Status Banner */}
        <section className="bg-gradient-to-r from-indigo-950 via-purple-950 to-gray-900 border border-primary/40 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              {hasActiveSubscription ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <CheckCircle2 size={14} /> Membresía Comercial Activa (Suscripción Premium)
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <CheckCircle2 size={14} /> Prueba Gratuita de 90 Días Activa
                </div>
              )}
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                ¡Bienvenido a tu Estudio, {artistName}! 🎨
              </h1>
              <p className="text-gray-300 mt-2 max-w-xl text-sm md:text-base leading-relaxed">
                {hasActiveSubscription
                  ? 'Tu suscripción comercial está activa. Tienes acceso completo para gestionar tu catálogo, recibir cotizaciones y aparecer en el mapa.'
                  : 'Tienes acceso total a todas las herramientas comerciales para publicar tu catálogo, recibir cotizaciones y aparecer en el mapa geolocalizado de Tattoo Hub.'}
              </p>
            </div>

            {/* Trial Counter Card */}
            <div className="bg-gray-900/80 backdrop-blur border border-primary/30 rounded-xl p-5 shrink-0 flex flex-col items-center md:items-end text-right">
              <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                <Clock size={16} /> Estado de Membresía
              </div>
              {hasActiveSubscription ? (
                <>
                  <div className="text-2xl font-black text-emerald-400">
                    Suscripción Activa
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Plan Artista Pro ($4.99/mes)
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-black text-white">
                    {daysRemaining} Días Restantes
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Día {Math.min(trialDay, 90)} de 90 (Prueba Gratuita)
                  </p>
                  <Link
                    to="/subscription/creditcard"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
                  >
                    <CreditCard size={14} /> Planes de Membresía ($4.99/mes)
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Studio Summary Bar */}
        <section className="bg-gray-800/60 border border-gray-700/80 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={meta.profile || '/assets/GB Tattoo.jpg'}
                alt="Perfil Artista"
                className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/Tattoo Machine Rotary.png';
                }}
              />
              <div>
                <h2 className="text-lg font-bold text-white">{artistName}</h2>
                <p className="text-sm text-gray-400">{studioName} • <span className="text-primary font-medium capitalize">{workType}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/tattoo"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow transition hover:scale-105"
              >
                <Palette size={16} /> Editar Portafolio
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-xl shadow transition hover:scale-105"
              >
                <MessageSquare size={16} /> Mensajes Directos
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="text-primary" size={20} /> Gestión del Artista
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Mi Estudio / Portafolio */}
            <div className="bg-gray-800/80 backdrop-blur border border-gray-700/60 rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                  <Palette size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Mi Estudio / Portafolio</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Actualiza tus datos de contacto, sube nuevas fotos de tus tatuajes y define tus estilos de especialidad.
                </p>
              </div>
              <Link
                to="/tattoo"
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
              >
                Administrar portafolio <ArrowRight size={16} />
              </Link>
            </div>

            {/* Card 2: Mensajes & Cotizaciones */}
            <div className="bg-gray-800/80 backdrop-blur border border-gray-700/60 rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Mensajes & Cotizaciones</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Revisa los mensajes enviados por clientes interesados, responde preguntas y coordina citas de trabajo.
                </p>
              </div>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
              >
                Ir a bandeja de mensajes <ArrowRight size={16} />
              </Link>
            </div>

            {/* Card 3: Explorar Comunidad & Mapa */}
            <div className="bg-gray-800/80 backdrop-blur border border-gray-700/60 rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                  <Compass size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Explorar Comunidad</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Observa la ubicación de tu estudio en el mapa interactivo y descubre otros artistas y estudios de la comunidad.
                </p>
              </div>
              <Link
                to="/hub"
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
              >
                Abrir mapa interactivo <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Commercial Features Overview */}
        <section className="bg-gray-850 border border-gray-700/80 rounded-2xl p-6 md:p-8 mb-10 shadow-xl">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} /> Ventajas de tu Cuenta Comercial
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-start gap-3 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
              <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={20} />
              <div>
                <strong className="text-white block mb-0.5">Perfil Verificado en Búsquedas</strong>
                Aparece en los primeros resultados de búsqueda cuando los clientes filtran por tu estilo y ciudad.
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
              <Calendar className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <strong className="text-white block mb-0.5">Gestión Directa de Cotizaciones</strong>
                Recibe requerimientos de clientes con especificaciones de tamaño, zona del cuerpo y referencias.
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      </div>
    </PageTransition>
  );
};

export default ArtistDashboardPage;
