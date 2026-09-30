import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { api } from '../api/client';
import {
  Sparkles,
  Lock,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Skeleton } from '../components/common/Skeleton';
import { PageTransition } from '../components/common/PageTransition';

import { ClientHeroHeader } from '../components/client/ClientHeroHeader';
import { ClientTabsNav, ClientTabId } from '../components/client/ClientTabsNav';
import { TattoosOverviewTab } from '../components/client/tabs/TattoosOverviewTab';
import { ClientSettingsTab } from '../components/client/tabs/ClientSettingsTab';
import { ClientSecurityTab } from '../components/client/tabs/ClientSecurityTab';

export const ClientDashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab synchronization via URL Query Param (?tab=overview|configuracion|seguridad)
  const tabParam = (searchParams.get('tab') || 'overview').toLowerCase();
  const validTabs: ClientTabId[] = ['overview', 'configuracion', 'seguridad'];
  const activeTab: ClientTabId = validTabs.includes(tabParam as ClientTabId)
    ? (tabParam as ClientTabId)
    : 'overview';

  // Language state (ES by default, reactive)
  const [lang, setLang] = useState<'es' | 'en'>(() => {
    const stored = localStorage.getItem('app_language');
    if (stored === 'en' || stored === 'es') return stored;
    return (user?.user_metadata?.preferred_language as 'es' | 'en') || 'es';
  });

  // Modal and toast states
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
  const [selectedStage, setSelectedStage] = useState<string>('Fase 1: Limpieza & Primer Vendaje');
  const [progressNotes, setProgressNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Saved VIP healing diary entries
  const [savedEntries, setSavedEntries] = useState<Array<{ stage: string; notes: string; date: string }>>([
    {
      stage: 'Fase 1: Limpieza & Primer Vendaje',
      notes: 'Sesión completada con éxito. Vendaje colocado con ungüento neutro.',
      date: 'Hace 2 días',
    },
  ]);

  // Auth & role check guards
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        navigate('/login', { replace: true });
        return;
      }
      const role = (user.user_metadata?.tipo || user.user_metadata?.role || '').toLowerCase();
      if (role === 'tatuador') {
        navigate('/artist-dashboard', { replace: true });
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Sync preferred_language if user metadata updates
  useEffect(() => {
    if (user?.user_metadata?.preferred_language) {
      const pref = user.user_metadata.preferred_language;
      if (pref === 'es' || pref === 'en') {
        setLang(pref);
      }
    }
  }, [user?.user_metadata?.preferred_language]);

  const handleTabChange = (newTab: ClientTabId) => {
    setSearchParams({ tab: newTab });
  };

  const handleShowToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Loading skeleton state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-pulse">
          {/* Welcome Banner Skeleton */}
          <div className="bg-gradient-to-r from-gray-800/80 via-gray-850/80 to-gray-900/80 border border-gray-700/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-6 w-36 rounded-full" />
              <Skeleton className="h-9 w-64 md:w-80 rounded-xl" />
              <Skeleton className="h-4 w-full max-w-lg rounded-md" />
              <Skeleton className="h-4 w-3/4 max-w-md rounded-md" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-40 rounded-xl" />
              <Skeleton className="h-11 w-36 rounded-xl" />
            </div>
          </div>

          {/* Quick Actions Grid Skeleton */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-6 w-6 rounded-lg" />
              <Skeleton className="h-6 w-48 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 flex flex-col justify-between h-48"
                >
                  <div className="space-y-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <Skeleton className="h-5 w-36 rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-28 rounded-md mt-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Tattoo Tracking Section Skeleton */}
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-7 w-64 rounded-lg" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-80 rounded-md" />
              </div>
              <Skeleton className="h-10 w-44 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {[1, 2, 3].map((stage) => (
                <div
                  key={stage}
                  className="p-5 rounded-xl bg-gray-800/30 border border-gray-700/40 space-y-3"
                >
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-5 w-44 rounded-md" />
                  <Skeleton className="h-3 w-full rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const meta = user.user_metadata || {};
  const hasVip = Boolean(meta.has_active_subscription);

  const handleOpenTrackingAction = (stageTitle?: string) => {
    if (!hasVip) {
      setShowPaywallModal(true);
      return;
    }
    if (stageTitle) {
      setSelectedStage(stageTitle);
    }
    setShowProgressModal(true);
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasVip) {
      setShowProgressModal(false);
      setShowPaywallModal(true);
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.saveTattooProgress({
        stage: selectedStage,
        notes: progressNotes,
      });

      if (res.code === 'CLIENT_PREMIUM_REQUIRED') {
        setShowProgressModal(false);
        setShowPaywallModal(true);
        return;
      }

      if (res.success) {
        setSavedEntries((prev) => [
          {
            stage: selectedStage,
            notes: progressNotes || (lang === 'en' ? 'Progress registered successfully.' : 'Avance registrado correctamente.'),
            date: lang === 'en' ? 'Today' : 'Hoy',
          },
          ...prev,
        ]);
        setProgressNotes('');
        setShowProgressModal(false);
        handleShowToast(
          lang === 'en'
            ? 'Tattoo healing progress saved to your VIP profile!'
            : '¡Avance de cicatrización guardado exitosamente en tu perfil VIP!',
          false
        );
      }
    } catch (err) {
      console.error('Error saving progress:', err);
      handleShowToast(
        lang === 'en' ? 'Failed to save progress' : 'Error al guardar avance',
        true
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col relative">
        <Navbar />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 max-w-md animate-bounce">
            <div
              className={`p-4 rounded-xl border shadow-2xl flex items-center gap-3 backdrop-blur-md ${
                toastMessage.isError
                  ? 'bg-red-950/90 border-red-500/50 text-red-200'
                  : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              }`}
            >
              {toastMessage.isError ? (
                <AlertCircle className="text-red-400 shrink-0" size={20} />
              ) : (
                <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              )}
              <span className="text-xs md:text-sm font-semibold">{toastMessage.text}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="ml-auto text-gray-400 hover:text-white"
                aria-label="Cerrar notificación"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* VIP Paywall Prompt Modal */}
        {showPaywallModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-gray-900 via-gray-850 to-gray-900 border-2 border-amber-500/50 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative text-center">
              <button
                onClick={() => setShowPaywallModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-4">
                <Lock size={32} />
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                Función Exclusiva VIP
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white mt-3 mb-2">
                Desbloquea el Seguimiento de Tatuajes con Cliente VIP por $4.99/mes
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Registra cada fase de cicatrización de tus tatuajes, sube fotografías de evolución y accede al historial avanzado con soporte prioritario.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/subscription/creditcard"
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-bold py-3.5 px-6 rounded-xl shadow-lg transition transform hover:scale-105 text-sm"
                >
                  <Sparkles size={18} /> Desbloquear Cliente VIP ($4.99/mes)
                </Link>
                <button
                  onClick={() => setShowPaywallModal(false)}
                  className="text-xs text-gray-400 hover:text-gray-200 transition py-1"
                >
                  Continuar con cuenta gratuita
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Registered VIP Progress Modal */}
        {showProgressModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative">
              <button
                onClick={() => setShowProgressModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Registrar Avance de Cicatrización</h3>
                  <p className="text-xs text-emerald-400 font-semibold">Cliente VIP Activo</p>
                </div>
              </div>

              <form onSubmit={handleSaveProgress} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Fase de Curación
                  </label>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="Fase 1: Limpieza & Primer Vendaje">Fase 1: Limpieza & Primer Vendaje (Días 1 - 3)</option>
                    <option value="Fase 2: Descamación & Hidratación">Fase 2: Descamación & Hidratación (Días 4 - 14)</option>
                    <option value="Fase 3: Cicatrización & Protección">Fase 3: Cicatrización & Protección (Días 15 - 30)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Notas de Estado / Cuidados
                  </label>
                  <textarea
                    rows={3}
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    placeholder="Ej. Piel sin enrojecimiento, aplicando crema neutra 3 veces al día..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary placeholder-gray-500"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProgressModal(false)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow transition"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Avance'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Main Dashboard Container */}
        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
          {/* Studio Breadcrumb & Quick Hub Link */}
          <div className="flex items-center justify-between mb-4 text-xs text-gray-400">
            <span className="hidden sm:inline">Tattoo Hub &gt; Dashboard</span>
            <Link
              to="/hub"
              className="inline-flex items-center gap-1 text-primary hover:underline font-semibold transition"
            >
              Explorar catálogo en el Hub &rarr;
            </Link>
          </div>

          {/* Identity Hero Header */}
          <ClientHeroHeader
            user={user}
            isVip={hasVip}
            tattoosCount={savedEntries.length}
            appointmentsCount={1}
            lang={lang}
            onUpgradeVip={() => setShowPaywallModal(true)}
          />

          {/* 3-Tab Pill Navigation */}
          <ClientTabsNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            lang={lang}
          />

          {/* Animated Tab Content Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <TattoosOverviewTab
                  isVip={hasVip}
                  lang={lang}
                  onOpenPaywall={() => setShowPaywallModal(true)}
                  onOpenTracking={handleOpenTrackingAction}
                  savedEntries={savedEntries}
                  user={user}
                />
              )}

              {activeTab === 'configuracion' && (
                <ClientSettingsTab
                  user={user}
                  lang={lang}
                  onLanguageChange={setLang}
                  onShowToast={handleShowToast}
                />
              )}

              {activeTab === 'seguridad' && (
                <ClientSecurityTab
                  user={user}
                  lang={lang}
                  onShowToast={handleShowToast}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default ClientDashboardPage;
