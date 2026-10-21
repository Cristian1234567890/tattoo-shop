import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
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
  Building2,
  Copy,
  Trash2,
  Users,
  Check,
  MapPin,
  Plus,
  Share2,
  X,
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../api/client';
import { SubscriptionBillingSection } from '../components/common/SubscriptionBillingSection';

export const ArtistDashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab synchronization via URL Query Param (?tab=general|suscripciones)
  const tabParam = (searchParams.get('tab') || 'general').toLowerCase();
  const activeTab = tabParam === 'suscripciones' ? 'suscripciones' : 'general';

  // Studio management states
  const [studios, setStudios] = useState<any[]>([]);
  const [, setIsLoadingStudios] = useState(false);
  const [showStudioModal, setShowStudioModal] = useState(false);
  const [dismissLockout, setDismissLockout] = useState(false);
  const [newStudioName, setNewStudioName] = useState('');
  const [newStudioAddress, setNewStudioAddress] = useState('Bella Vista, Calle 50, Ciudad de Panamá');
  const [newStudioTagline, setNewStudioTagline] = useState('Colectivo de Arte & Flash Lab');
  const [newStudioDescription, setNewStudioDescription] = useState('Estudio profesional con bioseguridad visible y artistas residentes.');
  const [newStudioHours, setNewStudioHours] = useState('Lun - Sáb: 10:00 - 20:00');
  const [newStudioLat, setNewStudioLat] = useState('8.9824');
  const [newStudioLng, setNewStudioLng] = useState('-79.5199');
  const [isSubmittingStudio, setIsSubmittingStudio] = useState(false);
  const [studioError, setStudioError] = useState<string | null>(null);
  const [studioSuccess, setStudioSuccess] = useState<string | null>(null);

  // Copy and collaboration states
  const [copiedStudioCode, setCopiedStudioCode] = useState<string | null>(null);
  const [joinStudioCode, setJoinStudioCode] = useState('');
  const [isJoiningStudio, setIsJoiningStudio] = useState(false);
  const [transferTargetStudio, setTransferTargetStudio] = useState<any | null>(null);
  const [transferTargetArtistId, setTransferTargetArtistId] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const normalizeName = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  const formatOpeningHours = (hours: any): string => {
    if (!hours) return 'Lun - Sáb: 10:00 - 20:00';
    if (typeof hours === 'string') return hours;
    if (typeof hours === 'object') {
      const dayLabels: Record<string, string> = {
        mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue', fri: 'Vie', sat: 'Sáb', sun: 'Dom'
      };
      const parts: string[] = [];
      for (const [k, v] of Object.entries(hours)) {
        const label = dayLabels[k.toLowerCase()] || k;
        parts.push(`${label}: ${v}`);
      }
      return parts.join(' | ') || 'Lun - Sáb: 10:00 - 20:00';
    }
    return String(hours);
  };

  const loadStudios = async () => {
    setIsLoadingStudios(true);
    try {
      const res = await api.getStudios();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setStudios(res.data);
      } else {
        setStudios([
          {
            id: 'obsidian',
            name: 'Obsidian Atelier & Flash Lab',
            studio_code: 'OBS-9X42',
            address: 'Bella Vista, Calle 50, Ciudad de Panamá',
            tagline: 'Colectivo de Arte Oscuro & Cybersigilism',
            opening_hours: 'Lun - Sáb: 10:00 - 20:00',
            rating: 4.9,
            review_count: 142,
            is_owner: true,
            artists_count: 3,
            lat: 8.9824,
            lng: -79.5199,
          }
        ]);
      }
    } catch {
      setStudios([
        {
          id: 'obsidian',
          name: 'Obsidian Atelier & Flash Lab',
          studio_code: 'OBS-9X42',
          address: 'Bella Vista, Calle 50, Ciudad de Panamá',
          tagline: 'Colectivo de Arte Oscuro & Cybersigilism',
          opening_hours: 'Lun - Sáb: 10:00 - 20:00',
          rating: 4.9,
          review_count: 142,
          is_owner: true,
          artists_count: 3,
          lat: 8.9824,
          lng: -79.5199,
        }
      ]);
    } finally {
      setIsLoadingStudios(false);
    }
  };

  useEffect(() => {
    loadStudios();
  }, []);

  const isNameDuplicate = useMemo(() => {
    if (!newStudioName.trim()) return false;
    const norm = normalizeName(newStudioName);
    return studios.some((s) => normalizeName(s.name) === norm);
  }, [newStudioName, studios]);

  const handleCreateStudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasActiveSubscription && (isTrialExpired || meta.subscription_status === 'canceled')) {
      setStudioError('Para registrar un nuevo estudio debes contar con una suscripción comercial activa. Tu cuenta se encuentra actualmente en modo gratuito.');
      return;
    }

    if (isNameDuplicate) {
      setStudioError('Ya existe un estudio registrado con este nombre. Elige un nombre distintivo.');
      return;
    }

    const latNum = parseFloat(newStudioLat);
    const lngNum = parseFloat(newStudioLng);
    if (!isNaN(latNum) && (latNum < -90 || latNum > 90)) {
      setStudioError('La latitud debe estar comprendida entre -90 y 90 grados.');
      return;
    }
    if (!isNaN(lngNum) && (lngNum < -180 || lngNum > 180)) {
      setStudioError('La longitud debe estar comprendida entre -180 y 180 grados.');
      return;
    }

    setIsSubmittingStudio(true);
    setStudioError(null);
    setStudioSuccess(null);
    try {
      const res = await api.createStudio({
        name: newStudioName.trim(),
        address: newStudioAddress.trim() || 'Bella Vista, Ciudad de Panamá',
        tagline: newStudioTagline.trim() || 'Estudio de Tatuajes & Colectivo de Arte',
        description: newStudioDescription.trim() || 'Estudio profesional de tatuajes con artistas residentes.',
        opening_hours: newStudioHours.trim() || 'Lun - Sáb: 10:00 - 20:00',
        lat: isNaN(latNum) ? 8.9824 : latNum,
        lng: isNaN(lngNum) ? -79.5199 : lngNum,
      });

      if (res.success && res.data) {
        setStudioSuccess(`¡Estudio "${res.data.name}" registrado con éxito! Código: ${res.data.studio_code}`);
        setStudios((prev) => [res.data, ...prev]);
        setShowStudioModal(false);
        setNewStudioName('');
      } else {
        setStudioError(res.error || 'No se pudo crear el estudio.');
      }
    } catch (err: any) {
      setStudioError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsSubmittingStudio(false);
    }
  };

  const handleJoinStudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinStudioCode.trim()) return;
    setIsJoiningStudio(true);
    setStudioError(null);
    try {
      const res = await api.joinStudio(joinStudioCode.trim().toUpperCase());
      if (res.success) {
        setStudioSuccess('¡Te has vinculado exitosamente al estudio colaborador!');
        setJoinStudioCode('');
        loadStudios();
      } else {
        setStudioError(res.error || 'Código de estudio no encontrado o inválido.');
      }
    } catch {
      setStudioError('Error al vincularse al estudio.');
    } finally {
      setIsJoiningStudio(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferTargetStudio || !transferTargetArtistId.trim()) return;
    setIsTransferring(true);
    try {
      const res = await api.transferStudioOwnership(transferTargetStudio.id, transferTargetArtistId.trim());
      if (res.success) {
        setStudioSuccess(`Propiedad de "${transferTargetStudio.name}" transferida con éxito.`);
        setTransferTargetStudio(null);
        setTransferTargetArtistId('');
        loadStudios();
      } else {
        setStudioError(res.error || 'No se pudo transferir la propiedad.');
      }
    } catch {
      setStudioError('Error al transferir la propiedad del estudio.');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleDeleteStudio = async (studioId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este estudio? Los artistas colaboradores no serán eliminados y continuarán como artistas independientes en el mapa.')) {
      return;
    }
    try {
      const res = await api.deleteStudio(studioId);
      if (res.success) {
        setStudios((prev) => prev.filter((s) => s.id !== studioId));
        setStudioSuccess('Estudio eliminado de forma segura. Los artistas asociados continúan como independientes.');
      } else {
        setStudioError(res.error || 'No se pudo eliminar el estudio.');
      }
    } catch {
      setStudioError('Error al eliminar el estudio.');
    }
  };

  const copyStudioCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedStudioCode(code);
    setTimeout(() => setCopiedStudioCode(null), 2500);
  };

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
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-white flex flex-col relative">
        <Navbar />

      {/* Trial Expired / Subscription Ended Modal */}
      {isTrialExpired && !dismissLockout && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 border-2 border-amber-500/50 rounded-2xl max-w-lg w-full p-8 shadow-2xl text-center text-slate-800 dark:text-white">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-5">
              <Lock size={32} />
            </div>
            <span className="px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              Modo Gratuito Disponible
            </span>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mt-4 mb-2 font-heading">
              Período de Membresía Comercial Expirado
            </h2>
            <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
              Tu información histórica y estudios registrados se mantienen resguardados. Puedes optar por continuar en la versión gratuita en <strong>Modo Lectura</strong> o reactivar tu membresía comercial por {formatPrice(4.99)}/mes para registrar nuevos estudios y recibir cotizaciones.
            </p>
            <div className="space-y-3">
              <Link
                to="/subscription/creditcard"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition transform hover:scale-[1.01]"
              >
                <CreditCard size={18} /> Adquirir Membresía Pro ({formatPrice(4.99)}/mes)
              </Link>
              <button
                id="btn-continue-free-artist"
                type="button"
                onClick={() => setDismissLockout(true)}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 transition cursor-pointer"
              >
                Continuar en Versión Gratuita (Modo Lectura)
              </button>
              <button
                onClick={() => logout()}
                className="w-full text-xs text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition py-1"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Navigation Tabs (General vs Suscripciones) */}
        <nav
          className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-gray-900/90 border border-slate-200 dark:border-white/10 rounded-2xl mb-8 backdrop-blur-md overflow-x-auto shadow-sm dark:shadow-xl"
          aria-label="Navegación del panel de artista"
        >
          <button
            type="button"
            id="tab-btn-general"
            data-testid="tab-btn-general"
            onClick={() => setSearchParams({ tab: 'general' })}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === 'general'
                ? 'bg-gradient-to-r from-primary to-[#ff7a29] !text-white keep-white-text shadow-[0_0_20px_rgba(230,81,0,0.45)] ring-1 ring-white/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
            }`}
          >
            <Building2 size={18} />
            <span>Mi Estudio &amp; Catálogo</span>
          </button>

          <button
            type="button"
            id="tab-btn-suscripciones"
            data-testid="tab-btn-suscripciones"
            onClick={() => setSearchParams({ tab: 'suscripciones' })}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === 'suscripciones'
                ? 'bg-gradient-to-r from-primary to-[#ff7a29] !text-white keep-white-text shadow-[0_0_20px_rgba(230,81,0,0.45)] ring-1 ring-white/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
            }`}
          >
            <Sparkles size={18} />
            <span>Suscripciones &amp; Facturación</span>
          </button>
        </nav>

        {/* Suscripciones Dedicated Tab View */}
        {activeTab === 'suscripciones' ? (
          <section className="mb-8 space-y-6">
            <SubscriptionBillingSection userRole="tatuador" />
          </section>
        ) : (
          <>
        {/* Read-Only Mode Banner for Free / Canceled / Expired Tier */}
        {(!hasActiveSubscription && (isTrialExpired || meta.subscription_status === 'canceled')) && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <strong className="block font-bold">Versión Gratuita (Modo Lectura)</strong>
                <span>Toda tu información previa y estudios registrados se mantienen intactos. Las interacciones comerciales (registrar nuevos estudios o publicar en el mapa) requieren membresía activa.</span>
              </div>
            </div>
            <Link
              to="/subscription/creditcard"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs whitespace-nowrap shadow-sm shrink-0"
            >
              Reactivar Membresía Pro
            </Link>
          </div>
        )}
        {/* Trial Status Banner */}
        <section className="dark-banner bg-gradient-to-r from-violet-700 via-indigo-700 to-purple-800 dark:from-indigo-950 dark:via-purple-950 dark:to-gray-900 border border-violet-400/30 dark:border-primary/40 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl relative overflow-hidden text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              {hasActiveSubscription ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <CheckCircle2 size={14} /> Membresía Comercial Activa (Suscripción Premium)
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <CheckCircle2 size={14} /> Prueba Gratuita de 90 Días Activa
                </div>
              )}
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                ¡Bienvenido a tu Estudio, {artistName}! 🎨
              </h1>
              <p className="text-white/90 dark:text-gray-300 mt-2 max-w-xl text-sm md:text-base leading-relaxed">
                {hasActiveSubscription
                  ? 'Tu suscripción comercial está activa. Tienes acceso completo para gestionar tu catálogo, recibir cotizaciones y aparecer en el mapa.'
                  : 'Tienes acceso total a todas las herramientas comerciales para publicar tu catálogo, recibir cotizaciones y aparecer en el mapa geolocalizado de Tattoo Hub.'}
              </p>
            </div>

            {/* Trial Counter Card */}
            <div className="bg-white/10 dark:bg-gray-900/80 backdrop-blur border border-white/20 dark:border-primary/30 rounded-xl p-5 shrink-0 flex flex-col items-center md:items-end text-right">
              <div className="flex items-center gap-2 text-amber-300 dark:text-primary font-bold text-sm mb-1">
                <Clock size={16} /> Estado de Membresía
              </div>
              {hasActiveSubscription ? (
                <>
                  <div className="text-2xl font-black text-emerald-300 dark:text-emerald-400">
                    Suscripción Activa
                  </div>
                  <p className="text-xs text-white/80 dark:text-gray-400 mt-1">
                    Plan Artista Pro ({formatPrice(4.99)}/mes)
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-black text-white">
                    {daysRemaining} Días Restantes
                  </div>
                  <p className="text-xs text-white/80 dark:text-gray-400 mt-1">
                    Día {Math.min(trialDay, 90)} de 90 (Prueba Gratuita)
                  </p>
                  <Link
                    to="/subscription/creditcard"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 dark:text-primary hover:text-amber-200 hover:underline"
                  >
                    <CreditCard size={14} /> Planes de Membresía ({formatPrice(4.99)}/mes)
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Facturación & Suscripción Management */}
        <section className="mb-8">
          <SubscriptionBillingSection userRole="tatuador" />
        </section>

        {/* Studio Summary Bar */}
        <section className="bg-white dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700/80 rounded-2xl p-6 mb-8 shadow-lg text-slate-800 dark:text-white">
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
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{artistName}</h2>
                <p className="text-sm text-slate-500 dark:text-gray-400">{studioName} • <span className="text-violet-600 dark:text-primary font-medium capitalize">{workType}</span></p>
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
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-xl shadow transition hover:scale-105 border border-slate-300 dark:border-transparent"
              >
                <MessageSquare size={16} /> Mensajes Directos
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="text-primary" size={20} /> Gestión del Artista
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Mi Estudio / Portafolio */}
            <div className="atelier-card-hover hover:scale-[1.02] cursor-pointer bg-white dark:bg-gray-800/80 backdrop-blur border border-slate-200 dark:border-gray-700/60 rounded-xl p-6 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg flex flex-col justify-between text-slate-800 dark:text-white">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                  <Palette size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Mi Estudio / Portafolio</h3>
                <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  Actualiza tus datos de contacto, sube nuevas fotos de tus tatuajes y define tus estilos de especialidad.
                </p>
              </div>
              <Link
                to="/tattoo"
                className="inline-flex items-center gap-2 text-violet-600 dark:text-primary font-semibold text-sm hover:underline"
              >
                Administrar portafolio <ArrowRight size={16} />
              </Link>
            </div>

            {/* Card 2: Mensajes & Cotizaciones */}
            <div className="atelier-card-hover hover:scale-[1.02] cursor-pointer bg-white dark:bg-gray-800/80 backdrop-blur border border-slate-200 dark:border-gray-700/60 rounded-xl p-6 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg flex flex-col justify-between text-slate-800 dark:text-white">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <MessageSquare size={24} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:border-violet-500/40 dark:text-violet-300 border border-violet-200">
                    🌐 Multilenguaje
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Mensajes & Cotizaciones</h3>
                <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
                  Revisa los mensajes enviados por clientes. Ahora puedes visualizar el <strong>idioma preferido del cliente (ES / EN)</strong> para comunicarte de forma clara.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-gray-900/70 border border-slate-200 dark:border-gray-700/50 text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-2 mb-4">
                  <span className="text-base">🗣️</span>
                  <span>Insignia de idioma visible en chat y cotizaciones</span>
                </div>
              </div>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 text-violet-600 dark:text-primary font-semibold text-sm hover:underline"
              >
                Ir a bandeja de mensajes <ArrowRight size={16} />
              </Link>
            </div>

            {/* Card 3: Explorar Comunidad & Mapa */}
            <div className="atelier-card-hover hover:scale-[1.02] cursor-pointer bg-white dark:bg-gray-800/80 backdrop-blur border border-slate-200 dark:border-gray-700/60 rounded-xl p-6 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg flex flex-col justify-between text-slate-800 dark:text-white">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-4">
                  <Compass size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Explorar Comunidad</h3>
                <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  Observa la ubicación de tu estudio en el mapa interactivo y descubre otros artistas y estudios de la comunidad.
                </p>
              </div>
              <Link
                to="/hub"
                className="inline-flex items-center gap-2 text-violet-600 dark:text-primary font-semibold text-sm hover:underline"
              >
                Abrir mapa interactivo <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Studio Management Section */}
        <section className="mb-10" id="mis-estudios">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Building2 className="text-primary" size={22} /> Mis Estudios & Presencia en el Mapa
              </h2>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                Registra tu estudio con ubicación geográfica exacta, comparte tu código para agregar artistas colaboradores o transfiere la administración.
              </p>
            </div>
            <button
              onClick={() => {
                setStudioError(null);
                setStudioSuccess(null);
                setShowStudioModal(true);
              }}
              data-testid="btn-open-create-studio"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-violet-600 hover:from-primary-hover hover:to-violet-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg transition hover:scale-105 shrink-0"
            >
              <Plus size={18} /> Registrar Nuevo Estudio
            </button>
          </div>

          {/* Feedback messages */}
          {studioSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
                {studioSuccess}
              </span>
              <button onClick={() => setStudioSuccess(null)} className="text-emerald-700 dark:text-emerald-300 hover:opacity-75">
                <X size={16} />
              </button>
            </div>
          )}

          {studioError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 flex items-center justify-between text-sm">
              <span>{studioError}</span>
              <button onClick={() => setStudioError(null)} className="text-red-700 dark:text-red-300 hover:opacity-75">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Join Studio with Code Card */}
          <div className="bg-white dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700/60 rounded-2xl p-5 mb-6 shadow-sm">
            <form onSubmit={handleJoinStudio} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
                  ¿Eres residente o colaborador en un estudio existente?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={joinStudioCode}
                    onChange={(e) => setJoinStudioCode(e.target.value.toUpperCase())}
                    placeholder="Ingresa el código del estudio (ej. OBS-9X42)"
                    data-testid="join-studio-code-input"
                    className="w-full pl-3 pr-24 py-2 text-sm bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none uppercase font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isJoiningStudio || !joinStudioCode.trim()}
                    data-testid="btn-join-studio"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
                  >
                    {isJoiningStudio ? 'Vinculando...' : 'Vincularse'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Studios Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studios.map((studio) => (
              <div
                key={studio.id}
                data-testid={`studio-card-${studio.id}`}
                className="bg-white dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700/60 rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{studio.name}</h3>
                        {studio.is_owner && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            Propietario
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-primary font-medium mt-0.5">{studio.tagline}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-amber-500 text-sm font-bold justify-end">
                        ★ {studio.rating?.toFixed(1) || '5.0'}
                      </div>
                      <span className="text-[11px] text-slate-400">({studio.review_count || 0} reseñas)</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-gray-300 my-4">
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span>{studio.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400 shrink-0" />
                      <span>{formatOpeningHours(studio.opening_hours)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400 shrink-0" />
                      <span>{studio.artists_count || 1} artistas residentes</span>
                    </p>
                  </div>

                  {/* Collaboration Code Box */}
                  <div className="p-3 bg-slate-50 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-700/50 rounded-xl mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-bold tracking-wider block">
                        Código de Colaboración
                      </span>
                      <span className="text-sm font-mono font-bold text-slate-800 dark:text-white">
                        {studio.studio_code}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyStudioCode(studio.studio_code)}
                      data-testid={`copy-code-${studio.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-gray-700 hover:border-primary transition"
                    >
                      {copiedStudioCode === studio.studio_code ? (
                        <>
                          <Check size={14} className="text-emerald-500" />
                          <span data-testid={`copied-code-${studio.id}`} className="text-emerald-600 dark:text-emerald-400">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Owner Actions */}
                {studio.is_owner && (
                  <div className="pt-4 border-t border-slate-100 dark:border-gray-700/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTransferTargetStudio(studio);
                        setTransferTargetArtistId('');
                      }}
                      data-testid={`btn-transfer-studio-${studio.id}`}
                      className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-gray-300 hover:text-primary transition"
                    >
                      <Share2 size={13} /> Transferir Propiedad
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStudio(studio.id)}
                      data-testid={`btn-delete-studio-${studio.id}`}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                      title="Elimina el estudio de forma segura (los artistas colaboradores se mantienen independientes)"
                    >
                      <Trash2 size={13} /> Eliminar Estudio
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Commercial Features Overview */}
        <section className="bg-white dark:bg-gray-850 border border-slate-200 dark:border-gray-700/80 rounded-2xl p-6 md:p-8 mb-10 shadow-xl text-slate-800 dark:text-white">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} /> Ventajas de tu Cuenta Comercial
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-gray-300">
            <div className="atelier-card-hover hover:scale-[1.02] cursor-pointer flex items-start gap-3 bg-slate-50 dark:bg-gray-900/60 p-4 rounded-xl border border-slate-200 dark:border-gray-800 transition-all duration-300">
              <ShieldCheck className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" size={20} />
              <div>
                <strong className="text-slate-800 dark:text-white block mb-0.5">Perfil Verificado en Búsquedas</strong>
                Aparece en los primeros resultados de búsqueda cuando los clientes filtran por tu estilo y ciudad.
              </div>
            </div>
            <div className="atelier-card-hover hover:scale-[1.02] cursor-pointer flex items-start gap-3 bg-slate-50 dark:bg-gray-900/60 p-4 rounded-xl border border-slate-200 dark:border-gray-800 transition-all duration-300">
              <Calendar className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <strong className="text-slate-800 dark:text-white block mb-0.5">Gestión Directa de Cotizaciones</strong>
                Recibe requerimientos de clientes con especificaciones de tamaño, zona del cuerpo y referencias.
              </div>
            </div>
          </div>
        </section>
        </>
        )}
      </main>

      {/* Studio Registration Modal */}
      {showStudioModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-800 dark:text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Building2 className="text-primary" size={22} />
                <h3 className="text-lg font-bold">Registrar Estudio en el Mapa</h3>
              </div>
              <button
                onClick={() => setShowStudioModal(false)}
                data-testid="btn-close-studio-modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStudio} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 mb-1">
                  Nombre del Estudio *
                </label>
                <input
                  type="text"
                  required
                  value={newStudioName}
                  onChange={(e) => setNewStudioName(e.target.value)}
                  placeholder="Ej. Obsidian Atelier & Flash Lab"
                  data-testid="studio-name-input"
                  className={`w-full px-3 py-2 text-sm bg-slate-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 ${
                    isNameDuplicate
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-300 dark:border-gray-700 focus:ring-primary'
                  }`}
                />
                {isNameDuplicate && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    ⚠️ Ya existe un estudio con este nombre. Elige un nombre único.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 mb-1">
                  Lema / Especialidad
                </label>
                <input
                  type="text"
                  value={newStudioTagline}
                  onChange={(e) => setNewStudioTagline(e.target.value)}
                  placeholder="Ej. Colectivo de Arte Oscuro & Cybersigilism"
                  data-testid="studio-tagline-input"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 mb-1">
                  Dirección Física *
                </label>
                <input
                  type="text"
                  required
                  value={newStudioAddress}
                  onChange={(e) => setNewStudioAddress(e.target.value)}
                  placeholder="Ej. Bella Vista, Calle 50, Ciudad de Panamá"
                  data-testid="studio-address-input"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 mb-1">
                  Horario de Atención
                </label>
                <input
                  type="text"
                  value={newStudioHours}
                  onChange={(e) => setNewStudioHours(e.target.value)}
                  placeholder="Lun - Sáb: 10:00 - 20:00"
                  data-testid="studio-hours-input"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={newStudioDescription}
                  onChange={(e) => setNewStudioDescription(e.target.value)}
                  placeholder="Breve reseña del estudio y normas sanitarias..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 mb-1">
                    Latitud
                  </label>
                  <input
                    type="text"
                    value={newStudioLat}
                    onChange={(e) => setNewStudioLat(e.target.value)}
                    placeholder="8.9824"
                    data-testid="studio-lat-input"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 mb-1">
                    Longitud
                  </label>
                  <input
                    type="text"
                    value={newStudioLng}
                    onChange={(e) => setNewStudioLng(e.target.value)}
                    placeholder="-79.5199"
                    data-testid="studio-lng-input"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              {studioError && (
                <p className="text-xs text-red-500 font-medium">{studioError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowStudioModal(false)}
                  className="px-4 py-2 text-sm rounded-xl text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStudio || isNameDuplicate || !newStudioName.trim()}
                  data-testid="btn-submit-studio"
                  className="px-5 py-2 text-sm font-bold rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white shadow transition"
                >
                  {isSubmittingStudio ? 'Guardando...' : 'Guardar y Publicar en Mapa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {transferTargetStudio && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 dark:text-white">
            <h3 className="text-lg font-bold mb-2">Transferir Propiedad del Estudio</h3>
            <p className="text-sm text-slate-600 dark:text-gray-300 mb-4">
              Estás por transferir la administración total de <strong>{transferTargetStudio.name}</strong> a otro artista.
              Perderás los privilegios de eliminar o transferir este estudio.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 mb-1">
                ID o Correo del Nuevo Propietario
              </label>
              <input
                type="text"
                value={transferTargetArtistId}
                onChange={(e) => setTransferTargetArtistId(e.target.value)}
                placeholder="ID de usuario o correo de destino"
                data-testid="transfer-artist-id-input"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setTransferTargetStudio(null)}
                data-testid="btn-cancel-transfer"
                className="px-4 py-2 text-sm rounded-xl text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleTransferOwnership}
                disabled={isTransferring || !transferTargetArtistId.trim()}
                data-testid="btn-confirm-transfer"
                className="px-5 py-2 text-sm font-bold rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white shadow transition"
              >
                {isTransferring ? 'Transfiriendo...' : 'Confirmar Transferencia'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageTransition>
  );
};

export default ArtistDashboardPage;
