import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  MessageCircle,
  Sparkles,
  Lock,
  Heart,
  CheckCircle,
  Activity,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { ProgressItem } from '../../tattoo/TattooTimeline';
import { TattooLiveEvolutionSection } from '../../tattoo/TattooLiveEvolutionSection';
import { api } from '../../../api/client';
import { supabase } from '../../../api/supabase';
import { useCurrency } from '../../../context/CurrencyContext';

interface TattoosOverviewTabProps {
  isVip: boolean;
  lang?: 'es' | 'en';
  onOpenPaywall: () => void;
  onOpenTracking: (stageTitle?: string) => void;
  savedEntries: Array<{ stage: string; notes: string; date: string }>;
  user?: any;
}

export const TattoosOverviewTab: React.FC<TattoosOverviewTabProps> = ({
  isVip,
  lang = 'es',
  onOpenPaywall,
  onOpenTracking,
  savedEntries,
  user,
}) => {
  const { formatPrice } = useCurrency();
  const t = {
    quickActions: lang === 'en' ? 'Quick Actions' : 'Acciones Rápidas',
    exploreArtists: lang === 'en' ? 'Explore Artists' : 'Explorar Artistas',
    exploreArtistsDesc:
      lang === 'en'
        ? 'Browse the global interactive map and discover verified studios and artists near you.'
        : 'Navega por el mapa interactivo global y descubre estudios y artistas verificados cerca de ti.',
    viewMap: lang === 'en' ? 'View interactive map' : 'Ver mapa interactivo',
    myMessages: lang === 'en' ? 'My Appointments & Chat' : 'Mis Citas & Mensajes',
    myMessagesDesc:
      lang === 'en'
        ? 'Access direct messages with artists, quote requests, and scheduled studio sessions.'
        : 'Consulta tus conversaciones directas con artistas, cotizaciones solicitadas y fechas de cita acordadas.',
    openChat: lang === 'en' ? 'Open studio chat' : 'Abrir chat de mensajes',
    catalogStyles: lang === 'en' ? 'Styles Catalog' : 'Catálogo de Estilos',
    catalogStylesDesc:
      lang === 'en'
        ? 'Filter studio work by style: Realism, Traditional, Blackwork, Japanese, Watercolor, and more.'
        : 'Filtra trabajos por estilos: Realismo, Tradicional, Blackwork, Japonés, Acuarela y más.',
    exploreCatalog: lang === 'en' ? 'Explore styles' : 'Explorar catálogo',
    trackingTitle:
      lang === 'en' ? 'Tattoo Healing & Stage Tracking' : 'Seguimiento de Tatuajes & Curación',
    trackingDesc:
      lang === 'en'
        ? 'Keep a photographic healing diary of your body art with clinical aftercare reminders.'
        : 'Lleva un diario fotográfico de la cicatrización de tu arte corporal con recordatorios de cuidado.',
    vipActive: lang === 'en' ? 'VIP Active' : 'VIP Activo',
    vipPremium: lang === 'en' ? `VIP Premium (${formatPrice(4.99)}/mo)` : `VIP Premium (${formatPrice(4.99)}/mes)`,
    addProgress: lang === 'en' ? 'Record Progress' : 'Registrar Avance',
    unlockVip: lang === 'en' ? `Unlock VIP (${formatPrice(4.99)})` : `Desbloquear VIP (${formatPrice(4.99)})`,
    phase1: lang === 'en' ? 'Phase 1: Cleansing & Wrap' : 'Fase 1: Limpieza & Primer Vendaje',
    phase1Days: lang === 'en' ? 'Days 1 - 3' : 'Días 1 - 3',
    phase1Desc:
      lang === 'en'
        ? 'Wash gently with lukewarm water and neutral soap. Apply very thin layer of ointment.'
        : 'Lavar con agua tibia y jabón neutro. Aplicar capa muy fina de ungüento antibacteriano.',
    phase2: lang === 'en' ? 'Phase 2: Peeling & Moisture' : 'Fase 2: Descamación & Hidratación',
    phase2Days: lang === 'en' ? 'Days 4 - 14' : 'Días 4 - 14',
    phase2Desc:
      lang === 'en'
        ? 'Never scratch or peel scabs. Keep skin moisturized with unscented neutral lotion.'
        : 'No rascar ni retirar costras. Mantener la piel hidratada con loción neutra sin aroma.',
    phase3: lang === 'en' ? 'Phase 3: Healing & Sun Protection' : 'Fase 3: Cicatrización & Protección',
    phase3Days: lang === 'en' ? 'Days 15 - 30' : 'Días 15 - 30',
    phase3Desc:
      lang === 'en'
        ? 'Sun protection essential (SPF 50+). Review session with your artist for potential touch-ups.'
        : 'Protección solar indispensable (FPS 50+). Revisión con tu tatuador para posibles retoques.',
    vipBannerTitle:
      isVip
        ? lang === 'en'
          ? 'Your Progress History is Enabled'
          : 'Tu Historial y Progreso Están Habilitados'
        : lang === 'en'
        ? 'Want to record your tattoo progress?'
        : '¿Quieres guardar el progreso de tus tatuajes?',
    vipBannerDesc:
      isVip
        ? lang === 'en'
          ? 'You can record notes, upload healing evolution photos, and sync directly with artists.'
          : 'Puedes registrar notas, subir fotos de evolución y sincronizar directamente con tus artistas.'
        : lang === 'en'
        ? 'With a VIP membership you can track every session, save before/after photos and receive personalized alerts.'
        : 'Con la suscripción VIP puedes registrar cada sesión, guardar fotos de antes/después y recibir alertas personalizadas.',
    registerNewPhase: lang === 'en' ? 'Record new phase' : 'Registrar nueva fase',
    moreVipDetails: lang === 'en' ? 'VIP plan details' : 'Más detalles del plan VIP',
    recentHistory: lang === 'en' ? 'Recent Healing Diary (VIP)' : 'Diario de Curación Reciente (VIP)',
    galleryAnchorTitle:
      lang === 'en' ? 'Live Progress Evolution Gallery' : 'Galería de Evolución en Vivo',
    galleryAnchorSubtitle:
      lang === 'en'
        ? 'Photographic tracking of your tattoos connected directly to Supabase Storage.'
        : 'Seguimiento fotográfico de tus tatuajes conectado directamente a Supabase Storage.',
    uploadPhoto: lang === 'en' ? 'Upload Progress Photo' : 'Subir Foto de Avance',
  };

  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>(user?.id || '');

  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    } else {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.id) {
          setCurrentUserId(data.user.id);
        }
      });
    }
  }, [user]);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await api.getClientProgress();
      if (res.success && Array.isArray(res.data)) {
        setProgressList(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch client progress:', err);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const timelineEntries: ProgressItem[] = useMemo(() => {
    if (progressList.length > 0) return progressList;
    return savedEntries.map((e, i) => ({
      id: `saved-${i}`,
      client_id: currentUserId,
      title: e.stage || 'Progreso de Tatuaje',
      notes: e.notes || '',
      image_url: '/assets/placeholder-tattoo.png',
      stage: e.stage || 'Fase 1: Limpieza & Primer Vendaje',
      date: e.date || new Date().toISOString().split('T')[0],
      session_number: 1,
    }));
  }, [progressList, savedEntries, currentUserId]);

  return (
    <div className="space-y-10">
      {/* Quick Actions Grid */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 font-heading">
          <Activity className="text-primary" size={20} /> {t.quickActions}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Explorar Artistas & Mapa */}
          <div className="atelier-card-hover hover:scale-[1.02] cursor-pointer backdrop-blur-xl bg-white/75 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/10 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Compass size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 font-heading">{t.exploreArtists}</h3>
              <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed mb-4 font-body">
                {t.exploreArtistsDesc}
              </p>
            </div>
            <Link
              to="/hub"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
            >
              {t.viewMap} <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 2: Mis Citas / Mensajes */}
          <div className="atelier-card-hover hover:scale-[1.02] cursor-pointer backdrop-blur-xl bg-white/75 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/10 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 font-heading">{t.myMessages}</h3>
              <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed mb-4 font-body">
                {t.myMessagesDesc}
              </p>
            </div>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
            >
              {t.openChat} <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 3: Catálogo General */}
          <div className="atelier-card-hover hover:scale-[1.02] cursor-pointer backdrop-blur-xl bg-white/75 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/10 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 font-heading">{t.catalogStyles}</h3>
              <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed mb-4 font-body">
                {t.catalogStylesDesc}
              </p>
            </div>
            <Link
              to="/hub"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
            >
              {t.exploreCatalog} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Section: Seguimiento de Tatuajes & Curación */}
      <section className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-xl dark:shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white font-heading">
                {t.trackingTitle}
              </h2>
              {isVip ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  <CheckCircle size={14} /> {t.vipActive}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                  <Lock size={14} /> {t.vipPremium}
                </span>
              )}
            </div>
            <p className="text-slate-600 dark:text-gray-400 text-sm mt-1 font-body">{t.trackingDesc}</p>
          </div>

          <div className="flex items-center gap-3">
            {isVip ? (
              <button
                type="button"
                onClick={() => onOpenTracking()}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg transition hover:scale-105 text-sm cursor-pointer"
              >
                <Plus size={16} /> {t.addProgress}
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenPaywall}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-bold px-5 py-2.5 rounded-xl shadow-lg transition hover:scale-105 text-sm cursor-pointer"
              >
                <Sparkles size={16} /> {t.unlockVip}
              </button>
            )}
          </div>
        </div>

        {/* Healing Stages Preview (interactive clicks trigger tracking action) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            onClick={() => onOpenTracking('Fase 1: Limpieza & Primer Vendaje')}
            className="atelier-card-hover hover:scale-[1.02] cursor-pointer backdrop-blur-md bg-white/70 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-white/10 hover:border-primary/50 rounded-xl p-4 transition-all duration-300 hover:bg-white/95 dark:hover:bg-zinc-900/80 shadow-sm hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                Fase 1
              </span>
              <span className="text-xs text-gray-400">{t.phase1Days}</span>
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1 font-heading">{t.phase1}</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-body">{t.phase1Desc}</p>
          </div>

          <div
            onClick={() => onOpenTracking('Fase 2: Descamación & Hidratación')}
            className="atelier-card-hover hover:scale-[1.02] cursor-pointer backdrop-blur-md bg-white/70 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-white/10 hover:border-primary/50 rounded-xl p-4 transition-all duration-300 hover:bg-white/95 dark:hover:bg-zinc-900/80 shadow-sm hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                Fase 2
              </span>
              <span className="text-xs text-gray-400">{t.phase2Days}</span>
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1 font-heading">{t.phase2}</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-body">{t.phase2Desc}</p>
          </div>

          <div
            onClick={() => onOpenTracking('Fase 3: Cicatrización & Protección')}
            className="atelier-card-hover hover:scale-[1.02] cursor-pointer backdrop-blur-md bg-white/70 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-white/10 hover:border-primary/50 rounded-xl p-4 transition-all duration-300 hover:bg-white/95 dark:hover:bg-zinc-900/80 shadow-sm hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                Fase 3
              </span>
              <span className="text-xs text-gray-400">{t.phase3Days}</span>
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1 font-heading">{t.phase3}</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-body">{t.phase3Desc}</p>
          </div>
        </div>

        {/* VIP Feature Highlights Box */}
        <div className="backdrop-blur-md bg-violet-50/80 dark:bg-zinc-900/90 border border-primary/30 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0">
              <Heart size={22} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm md:text-base font-heading">
                {t.vipBannerTitle}
              </h4>
              <p className="text-xs md:text-sm text-slate-600 dark:text-gray-400 font-body">
                {t.vipBannerDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isVip ? (
              <button
                type="button"
                onClick={() => onOpenTracking()}
                className="text-xs md:text-sm font-semibold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {t.registerNewPhase} <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenPaywall}
                className="text-xs md:text-sm font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                {t.moreVipDetails} <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Saved VIP History Records (Preserved in Read-Only Mode) */}
        {savedEntries.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-gray-700/80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">
                {t.recentHistory}
              </h3>
              {!isVip && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700">
                  Modo Lectura
                </span>
              )}
            </div>
            <div className="space-y-3">
              {savedEntries.map((entry, idx) => (
                <div
                  key={idx}
                  className="backdrop-blur-md bg-white/80 dark:bg-zinc-900/60 border border-slate-200 dark:border-gray-800 rounded-xl p-3.5 flex items-start justify-between gap-4 shadow-sm"
                >
                  <div>
                    <span className="text-xs font-bold text-primary block mb-0.5">
                      {entry.stage}
                    </span>
                    <p className="text-sm text-slate-800 dark:text-gray-200">{entry.notes}</p>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{entry.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Anchor Section: Galería de Evolución en Vivo Multi-Tatuaje */}
      <section id="tattoo-progress-anchor">
        <TattooLiveEvolutionSection
          isVip={isVip}
          lang={lang}
          onOpenPaywall={onOpenPaywall}
          user={user}
          customEntries={timelineEntries}
        />
      </section>
    </div>
  );
};
