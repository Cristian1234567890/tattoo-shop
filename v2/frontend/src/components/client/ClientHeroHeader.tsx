import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import {
  Sparkles,
  ShieldCheck,
  Calendar,
  Activity,
  Compass,
  MessageCircle,
  Crown,
  Lock,
  User as UserIcon,
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

interface ClientHeroHeaderProps {
  user: User | null;
  isVip: boolean;
  tattoosCount?: number;
  appointmentsCount?: number;
  lang?: 'es' | 'en';
  onUpgradeVip?: () => void;
}

export const ClientHeroHeader: React.FC<ClientHeroHeaderProps> = ({
  user,
  isVip,
  tattoosCount = 1,
  appointmentsCount = 0,
  lang = 'es',
  onUpgradeVip,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const { formatPrice } = useCurrency();
  const meta = user?.user_metadata || {};
  // 1. Form name + last name takes highest precedence
  const formFullName = `${meta.nombre || ''} ${meta.apellido || ''}`.trim();
  // 2. Cleaned full_name (removes OAuth suffixes like "(Our Present)")
  const cleanedFullName = meta.full_name?.replace(/\s*\([^)]*\)/g, '').trim();
  const clientName =
    formFullName ||
    cleanedFullName ||
    meta.name ||
    user?.email?.split('@')[0] ||
    (lang === 'en' ? 'Client' : 'Cliente');

  const avatarUrl =
    meta.profile ||
    meta.avatar_url ||
    meta.picture ||
    '';

  const t = {
    panelBadge: lang === 'en' ? 'Client Studio' : 'Panel del Cliente',
    greeting: lang === 'en' ? `Hello, ${clientName}` : `¡Hola, ${clientName}!`,
    subtitle:
      lang === 'en'
        ? 'Welcome to your private studio space. Manage your tattoo sessions, track healing progress, and stay in touch with elite artists.'
        : 'Bienvenido a tu espacio personal. Gestiona tus citas, sigue la cicatrización de tus piezas y mantente en contacto con artistas élite.',
    roleClient: lang === 'en' ? 'Client' : 'Cliente',
    vipClient: lang === 'en' ? 'VIP Member' : 'Cliente VIP',
    standardClient: lang === 'en' ? 'Standard Account' : 'Cliente Estándar',
    unlockVip:
      lang === 'en'
        ? `Unlock VIP (${formatPrice(4.99)}/mo)`
        : `Desbloquear VIP (${formatPrice(4.99)}/mes)`,
    statTattoos: lang === 'en' ? 'Tracked Tattoos' : 'Tatuajes en seguimiento',
    statAppointments: lang === 'en' ? 'Active Appointments' : 'Citas activas',
    statSecurity: lang === 'en' ? 'Secure Session' : 'Sesión segura',
    statProtected: lang === 'en' ? 'Protected 256-bit' : 'Protegida (Cifrado)',
    exploreArtists: lang === 'en' ? 'Explore Artists' : 'Explorar Artistas',
    messages: lang === 'en' ? 'My Messages' : 'Mis Mensajes',
    online: lang === 'en' ? 'Online' : 'En línea',
  };

  return (
    <section className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 border border-white/10 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative ambient light */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      {isVip && (
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Identity & Avatar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar with illuminated ring & online indicator */}
          <div className="relative shrink-0">
            <div
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden p-0.5 bg-[#090d16] flex items-center justify-center ${
                isVip
                  ? 'ring-2 ring-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
                  : 'ring-2 ring-primary/80 shadow-[0_0_25px_rgba(230,81,0,0.35)]'
              }`}
            >
              {avatarUrl && !imgError ? (
                <img
                  src={avatarUrl}
                  alt={clientName}
                  className="w-full h-full object-cover rounded-full"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-primary/80">
                  <UserIcon className="w-10 h-10 md:w-12 md:h-12" />
                </div>
              )}
            </div>
            {/* Pulsing online status badge */}
            <span
              title={t.online}
              className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#090d16] rounded-full ring-2 ring-emerald-500/40 animate-pulse"
            />
          </div>

          {/* User Details & Badges */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
                <Sparkles size={13} /> {t.panelBadge}
              </span>
              {isVip ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold tracking-wide">
                  <Crown size={13} className="text-amber-400" /> {t.vipClient}
                </span>
              ) : (
                <button
                  onClick={onUpgradeVip}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 hover:bg-gray-750 text-gray-300 hover:text-amber-300 border border-gray-700 text-xs font-semibold transition"
                >
                  <Lock size={12} className="text-amber-400" /> {t.standardClient}
                </button>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {t.greeting}
            </h1>
            <p className="text-gray-300 text-xs md:text-sm max-w-xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/hub"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs md:text-sm font-bold px-4 md:px-5 py-2.5 rounded-xl shadow-lg transition hover:scale-105"
          >
            <Compass size={17} /> {t.exploreArtists}
          </Link>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs md:text-sm font-semibold px-4 md:px-5 py-2.5 rounded-xl shadow transition hover:scale-105"
          >
            <MessageCircle size={17} /> {t.messages}
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/10">
        <div className="bg-gray-900/60 border border-white/5 rounded-xl p-3.5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-lg md:text-xl font-bold text-white">{tattoosCount}</div>
            <div className="text-xs text-gray-400">{t.statTattoos}</div>
          </div>
        </div>

        <div className="bg-gray-900/60 border border-white/5 rounded-xl p-3.5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Calendar size={18} />
          </div>
          <div>
            <div className="text-lg md:text-xl font-bold text-white">{appointmentsCount}</div>
            <div className="text-xs text-gray-400">{t.statAppointments}</div>
          </div>
        </div>

        <div className="bg-gray-900/60 border border-white/5 rounded-xl p-3.5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-xs md:text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              {t.statProtected}
            </div>
            <div className="text-xs text-gray-400">{t.statSecurity}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
