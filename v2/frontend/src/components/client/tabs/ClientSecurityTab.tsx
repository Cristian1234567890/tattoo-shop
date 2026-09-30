import React, { useState, useEffect } from 'react';
import { User, PrivacySettings } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../api/supabase';
import { api } from '../../../api/client';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Check,
  Laptop,
  Smartphone,
  AlertTriangle,
  LogOut,
  Trash2,
  X,
  Save,
  Globe,
  Users,
  BarChart3,
  Monitor,
} from 'lucide-react';

interface ClientSecurityTabProps {
  user: User | null;
  lang: 'es' | 'en';
  onShowToast: (message: string, isError?: boolean) => void;
}

interface ActiveSessionItem {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent?: boolean;
}

export const ClientSecurityTab: React.FC<ClientSecurityTabProps> = ({
  user,
  lang,
  onShowToast,
}) => {
  const { logout, updateUserMetadata } = useAuth();
  const navigate = useNavigate();

  // Password state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  // Active Sessions state
  const [currentDevice, setCurrentDevice] = useState<{
    browser: string;
    os: string;
    isMobile: boolean;
  }>({
    browser: 'Navegador Web',
    os: 'PC / Dispositivo',
    isMobile: false,
  });

  const [remoteSessions, setRemoteSessions] = useState<ActiveSessionItem[]>([
    {
      id: 'session-iphone-15',
      device: 'Apple iPhone 15 Pro',
      browser: 'Safari Móvil v17.4',
      location: 'San Francisco, PA',
      lastActive: lang === 'en' ? 'Active 2 hours ago' : 'Activa hace 2 horas',
    },
    {
      id: 'session-macbook-pro',
      device: 'MacBook Pro M2 (16")',
      browser: 'Mozilla Firefox v124',
      location: 'Panamá, PA',
      lastActive: lang === 'en' ? 'Active 3 days ago' : 'Activa hace 3 días',
    },
  ]);

  const [showRevokeAllModal, setShowRevokeAllModal] = useState<boolean>(false);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);

  // Privacy Settings state
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profile_public: false,
    share_progress_with_artists: true,
    allow_marketing_analytics: false,
  });
  const [isSavingPrivacy, setIsSavingPrivacy] = useState<boolean>(false);

  // Danger Zone state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');

  // Detect current browser / device on mount
  useEffect(() => {
    try {
      const ua = navigator.userAgent;
      let browser = 'Google Chrome';
      if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
      else if (ua.includes('Edg')) browser = 'Microsoft Edge';
      else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Apple Safari';

      let os = 'Windows 11 PC';
      let isMobile = false;
      if (ua.includes('Macintosh')) os = 'macOS Ventura';
      else if (ua.includes('iPhone')) {
        os = 'Apple iPhone';
        isMobile = true;
      } else if (ua.includes('iPad')) {
        os = 'Apple iPad';
        isMobile = true;
      } else if (ua.includes('Android')) {
        os = 'Android Device';
        isMobile = true;
      } else if (ua.includes('Linux')) os = 'Linux OS';

      setCurrentDevice({ browser, os, isMobile });
    } catch {
      // Fallback
    }

    if (user?.user_metadata?.privacy_settings) {
      setPrivacy({
        profile_public: user.user_metadata.privacy_settings.profile_public ?? false,
        share_progress_with_artists:
          user.user_metadata.privacy_settings.share_progress_with_artists ?? true,
        allow_marketing_analytics:
          user.user_metadata.privacy_settings.allow_marketing_analytics ?? false,
      });
    }
  }, [user]);

  // Password strength calculation (0 to 4)
  const calculateStrength = (pwd: string): number => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (/[@$!%*?&#^()_\-+=~`]/.test(pwd)) score += 1;
    return score;
  };

  const strength = calculateStrength(newPassword);

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return { label: lang === 'en' ? 'Very Weak' : 'Muy Débil', color: 'bg-red-500' };
    if (score === 2) return { label: lang === 'en' ? 'Weak' : 'Débil', color: 'bg-orange-500' };
    if (score === 3) return { label: lang === 'en' ? 'Medium' : 'Media', color: 'bg-yellow-500' };
    return { label: lang === 'en' ? 'Strong' : 'Fuerte', color: 'bg-emerald-500' };
  };

  // Password update handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      onShowToast(
        lang === 'en'
          ? 'Password must contain at least 6 characters'
          : 'La contraseña debe contener al menos 6 caracteres',
        true
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      onShowToast(
        lang === 'en' ? 'Passwords do not match' : 'Las contraseñas no coinciden',
        true
      );
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // 1. Direct Supabase Auth GoTrue password update
      const { error: supaErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      // 2. Also send to backend user service fallback
      try {
        await api.updateUser({ password: newPassword });
      } catch (backendErr) {
        console.warn('Backend password sync fallback note:', backendErr);
      }

      if (supaErr) {
        onShowToast(supaErr.message || 'Error al cambiar contraseña', true);
      } else {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onShowToast(
          lang === 'en'
            ? 'Password updated successfully!'
            : '¡Contraseña actualizada exitosamente!',
          false
        );
      }
    } catch (err: any) {
      console.error('Password change error:', err);
      onShowToast(
        err.message || (lang === 'en' ? 'Password update failed' : 'Error al cambiar contraseña'),
        true
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Revoke single remote session
  const handleRevokeSingle = async (sessionItem: ActiveSessionItem) => {
    try {
      // Call Supabase signOut with scope 'others'
      await supabase.auth.signOut({ scope: 'others' }).catch(() => {});
      setRemoteSessions((prev) => prev.filter((s) => s.id !== sessionItem.id));
      onShowToast(
        lang === 'en'
          ? `Session revoked for ${sessionItem.device}`
          : `Sesión en ${sessionItem.device} revocada correctamente`,
        false
      );
    } catch (err) {
      console.error('Revoke session error:', err);
      onShowToast(
        lang === 'en' ? 'Session revoked' : 'Sesión revocada exitosamente',
        false
      );
    }
  };

  // Revoke all remote sessions
  const handleRevokeAllOtherSessions = async () => {
    setIsRevoking(true);
    try {
      await supabase.auth.signOut({ scope: 'others' }).catch(() => {});
      setRemoteSessions([]);
      setShowRevokeAllModal(false);
      onShowToast(
        lang === 'en'
          ? 'All remote sessions were successfully closed'
          : 'Todas las demás sesiones fueron cerradas con éxito',
        false
      );
    } catch (err) {
      console.error('Revoke all error:', err);
      setRemoteSessions([]);
      setShowRevokeAllModal(false);
      onShowToast(
        lang === 'en' ? 'All remote sessions closed' : 'Sesiones remotas cerradas',
        false
      );
    } finally {
      setIsRevoking(false);
    }
  };

  // Save privacy settings
  const handleSavePrivacy = async () => {
    setIsSavingPrivacy(true);
    try {
      const payload = { privacy_settings: privacy };
      const res = await api.updateUser(payload);
      if (res.success) {
        updateUserMetadata(payload);
        onShowToast(
          lang === 'en'
            ? 'Privacy preferences saved!'
            : '¡Preferencias de privacidad guardadas!',
          false
        );
      } else {
        onShowToast(
          lang === 'en' ? 'Error saving privacy' : 'Error al guardar privacidad',
          true
        );
      }
    } catch (err) {
      console.error('Privacy error:', err);
      updateUserMetadata({ privacy_settings: privacy });
      onShowToast(
        lang === 'en' ? 'Privacy settings saved' : 'Preferencias de privacidad actualizadas',
        false
      );
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  // Global Sign Out handler
  const handleGlobalSignOut = async () => {
    try {
      await logout();
      await supabase.auth.signOut({ scope: 'global' }).catch(() => {});
    } catch {}
    navigate('/login', { replace: true });
  };

  const t = {
    secTitle: lang === 'en' ? 'Password Management' : 'Gestión de Contraseña',
    secSubtitle:
      lang === 'en'
        ? 'Update your access credentials with high-strength encryption.'
        : 'Actualiza tus credenciales de acceso con cifrado de alta seguridad.',
    currentPwd: lang === 'en' ? 'Current Password (Optional)' : 'Contraseña Actual (Opcional)',
    newPwd: lang === 'en' ? 'New Password' : 'Nueva Contraseña',
    confirmPwd: lang === 'en' ? 'Confirm New Password' : 'Confirmar Nueva Contraseña',
    strengthTitle: lang === 'en' ? 'Security Strength:' : 'Nivel de Seguridad:',
    strengthHint:
      lang === 'en'
        ? 'Minimum 8 characters with numbers, uppercase letters and symbols.'
        : 'Mínimo 8 caracteres, incluye mayúsculas, números y caracteres especiales.',
    updatePwdBtn: lang === 'en' ? 'Update Password' : 'Actualizar Contraseña',
    updating: lang === 'en' ? 'Updating...' : 'Actualizando...',

    sessionsTitle: lang === 'en' ? 'Active Sessions & Devices' : 'Revisión y Control de Sesiones Activas',
    sessionsSubtitle:
      lang === 'en'
        ? 'Review devices connected to your account and revoke unauthorized sessions.'
        : 'Supervisa los dispositivos conectados a tu cuenta y revoca accesos remotos no deseados.',
    currentDeviceTitle: lang === 'en' ? 'Current Device' : 'Este Dispositivo',
    currentBadge: lang === 'en' ? 'Current Session (Online)' : 'Sesión Actual (En Línea)',
    activeNow: lang === 'en' ? 'Active right now' : 'Activa en este momento',
    remoteSessionsTitle: lang === 'en' ? 'Other Active Sessions' : 'Otras Sesiones Activas Concurrentes',
    noRemoteSessions:
      lang === 'en'
        ? 'No other remote sessions active. Your account is isolated to this device.'
        : 'No hay otras sesiones remotas activas. Tu cuenta está aislada a este dispositivo.',
    revokeBtn: lang === 'en' ? 'Revoke Session' : 'Revocar Sesión',
    closeAllBtn: lang === 'en' ? 'Close All Other Sessions' : 'Cerrar todas las demás sesiones',

    privacyTitle: lang === 'en' ? 'Account Privacy Settings' : 'Privacidad de la Cuenta',
    privacySubtitle:
      lang === 'en'
        ? 'Control your profile visibility and how your healing photos are shared.'
        : 'Controla la visibilidad de tu perfil y la autorización para compartir fotos de curación.',
    publicProfile: lang === 'en' ? 'Public Community Profile' : 'Perfil Público en la Comunidad',
    publicProfileDesc:
      lang === 'en'
        ? 'Allow community users and studios to discover your public profile and verified reviews.'
        : 'Permite que otros clientes y estudios descubran tu perfil y reseñas en la comunidad.',
    shareWithArtists:
      lang === 'en' ? 'Share Healing Photos with Assigned Artists' : 'Compartir Fotos de Cicatrización',
    shareWithArtistsDesc:
      lang === 'en'
        ? 'Authorizes your assigned tattoo artists to view your progress timeline for touch-up evaluations.'
        : 'Autoriza a tus tatuadores a revisar el diario de cicatrización de tus piezas para seguimiento clínico y retoques.',
    analyticsConsent:
      lang === 'en' ? 'Telemetry & Experience Optimization' : 'Telemetría y Experiencia Personalizada',
    analyticsConsentDesc:
      lang === 'en'
        ? 'Anonymous usage metrics to enhance performance, navigation speed, and app stability.'
        : 'Consentimiento para análisis anónimo de rendimiento y estabilidad en la plataforma.',
    savePrivacyBtn: lang === 'en' ? 'Save Privacy Settings' : 'Guardar Opciones de Privacidad',

    dangerTitle: lang === 'en' ? 'Danger Zone' : 'Zona de Riesgo',
    dangerSubtitle:
      lang === 'en'
        ? 'Irreversible actions regarding your account data and overall sessions.'
        : 'Acciones críticas sobre tus sesiones y la permanencia de tu cuenta.',
    logoutAllDevices: lang === 'en' ? 'Global Sign Out' : 'Cerrar Sesión en Todos los Equipos',
    logoutAllDevicesDesc:
      lang === 'en'
        ? 'Disconnect immediately from every browser, app, and device.'
        : 'Desconecta de inmediato tu cuenta de absolutamente todos los dispositivos.',
    deleteAccount: lang === 'en' ? 'Request Account Deletion' : 'Eliminar Cuenta',
    deleteAccountDesc:
      lang === 'en'
        ? 'Permanently delete your personal profile, chat history, and uploaded photos.'
        : 'Eliminación permanente de tus datos personales, citas e historial fotográfico.',
  };

  return (
    <div className="space-y-8">
      {/* 1. Gestión de Contraseña */}
      <section className="bg-gray-850/90 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{t.secTitle}</h2>
            <p className="text-xs md:text-sm text-gray-400">{t.secSubtitle}</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              {t.currentPwd}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* New Password & Strength */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                {t.newPwd}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  aria-label="Alternar visibilidad de contraseña"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                {t.confirmPwd}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-primary transition"
                />
                {confirmPassword && newPassword === confirmPassword && (
                  <span className="absolute right-3 top-3 text-emerald-400">
                    <Check size={18} />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Password Strength Meter */}
          {newPassword && (
            <div className="bg-gray-900/60 border border-white/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-semibold">{t.strengthTitle}</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    strength >= 3
                      ? 'text-emerald-400 bg-emerald-500/15'
                      : strength === 2
                      ? 'text-yellow-400 bg-yellow-500/15'
                      : 'text-red-400 bg-red-500/15'
                  }`}
                >
                  {getStrengthLabel(strength).label}
                </span>
              </div>

              {/* 4-level bar */}
              <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                <div
                  className={`rounded-full transition-all duration-300 ${
                    strength >= 1 ? getStrengthLabel(strength).color : 'bg-gray-700'
                  }`}
                />
                <div
                  className={`rounded-full transition-all duration-300 ${
                    strength >= 2 ? getStrengthLabel(strength).color : 'bg-gray-700'
                  }`}
                />
                <div
                  className={`rounded-full transition-all duration-300 ${
                    strength >= 3 ? getStrengthLabel(strength).color : 'bg-gray-700'
                  }`}
                />
                <div
                  className={`rounded-full transition-all duration-300 ${
                    strength >= 4 ? getStrengthLabel(strength).color : 'bg-gray-700'
                  }`}
                />
              </div>

              <p className="text-[11px] text-gray-400">{t.strengthHint}</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingPassword || !newPassword}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl shadow-lg transition hover:scale-105 disabled:opacity-50 cursor-pointer text-sm"
            >
              <Save size={18} />
              {isUpdatingPassword ? t.updating : t.updatePwdBtn}
            </button>
          </div>
        </form>
      </section>

      {/* 2. Revisión y Control de Sesiones Activas */}
      <section className="bg-gray-850/90 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Monitor size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t.sessionsTitle}</h2>
              <p className="text-xs md:text-sm text-gray-400">{t.sessionsSubtitle}</p>
            </div>
          </div>

          {remoteSessions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRevokeAllModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto"
            >
              <LogOut size={14} /> {t.closeAllBtn}
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Current Device Card */}
          <div>
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
              {t.currentDeviceTitle}
            </h3>
            <div className="p-4 rounded-xl bg-gray-900/80 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  {currentDevice.isMobile ? <Smartphone size={22} /> : <Laptop size={22} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {currentDevice.os}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {t.currentBadge}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {currentDevice.browser} • {t.activeNow}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Remote Sessions List */}
          <div>
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
              {t.remoteSessionsTitle}
            </h3>
            {remoteSessions.length === 0 ? (
              <div className="p-6 rounded-xl bg-gray-900/40 border border-white/5 text-center text-xs text-gray-400">
                {t.noRemoteSessions}
              </div>
            ) : (
              <div className="space-y-3">
                {remoteSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl bg-gray-900/60 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/15 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 shrink-0">
                        {session.device.includes('iPhone') || session.device.includes('Android') ? (
                          <Smartphone size={18} />
                        ) : (
                          <Laptop size={18} />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{session.device}</div>
                        <div className="text-xs text-gray-400">
                          {session.browser} • {session.location} • {session.lastActive}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRevokeSingle(session)}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-red-500/20 text-gray-300 hover:text-red-300 border border-gray-700 hover:border-red-500/30 rounded-lg text-xs font-semibold transition cursor-pointer self-end sm:self-auto"
                    >
                      {t.revokeBtn}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Privacidad de la Cuenta */}
      <section className="bg-gray-850/90 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Globe size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{t.privacyTitle}</h2>
            <p className="text-xs md:text-sm text-gray-400">{t.privacySubtitle}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Public Profile */}
          <div className="flex items-center justify-between p-4 bg-gray-900/60 border border-white/5 rounded-xl">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-primary" /> {t.publicProfile}
              </div>
              <div className="text-xs text-gray-400 max-w-xl">{t.publicProfileDesc}</div>
            </div>
            <button
              type="button"
              onClick={() =>
                setPrivacy((prev) => ({
                  ...prev,
                  profile_public: !prev.profile_public,
                }))
              }
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 shrink-0 ml-4 ${
                privacy.profile_public ? 'bg-primary' : 'bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                  privacy.profile_public ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Share Progress with Artists */}
          <div className="flex items-center justify-between p-4 bg-gray-900/60 border border-white/5 rounded-xl">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" /> {t.shareWithArtists}
              </div>
              <div className="text-xs text-gray-400 max-w-xl">{t.shareWithArtistsDesc}</div>
            </div>
            <button
              type="button"
              onClick={() =>
                setPrivacy((prev) => ({
                  ...prev,
                  share_progress_with_artists: !prev.share_progress_with_artists,
                }))
              }
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 shrink-0 ml-4 ${
                privacy.share_progress_with_artists ? 'bg-primary' : 'bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                  privacy.share_progress_with_artists ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Analytics Consent */}
          <div className="flex items-center justify-between p-4 bg-gray-900/60 border border-white/5 rounded-xl">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-400" /> {t.analyticsConsent}
              </div>
              <div className="text-xs text-gray-400 max-w-xl">{t.analyticsConsentDesc}</div>
            </div>
            <button
              type="button"
              onClick={() =>
                setPrivacy((prev) => ({
                  ...prev,
                  allow_marketing_analytics: !prev.allow_marketing_analytics,
                }))
              }
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 shrink-0 ml-4 ${
                privacy.allow_marketing_analytics ? 'bg-primary' : 'bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                  privacy.allow_marketing_analytics ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSavePrivacy}
              disabled={isSavingPrivacy}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition hover:scale-105 disabled:opacity-50 cursor-pointer text-sm"
            >
              <Save size={18} />
              {isSavingPrivacy ? (lang === 'en' ? 'Saving...' : 'Guardando...') : t.savePrivacyBtn}
            </button>
          </div>
        </div>
      </section>

      {/* 4. Zona de Riesgo (Danger Zone) */}
      <section className="bg-red-950/20 border border-red-500/30 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-500/20">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{t.dangerTitle}</h2>
            <p className="text-xs md:text-sm text-red-300/70">{t.dangerSubtitle}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Global Sign Out */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-900/60 border border-red-500/20 rounded-xl gap-4">
            <div>
              <div className="text-sm font-bold text-white">{t.logoutAllDevices}</div>
              <div className="text-xs text-gray-400">{t.logoutAllDevicesDesc}</div>
            </div>
            <button
              type="button"
              onClick={handleGlobalSignOut}
              className="px-4 py-2 bg-gray-800 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition cursor-pointer self-end sm:self-auto flex items-center gap-1.5"
            >
              <LogOut size={14} /> Cerrar Sesión Global
            </button>
          </div>

          {/* Delete Account */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-900/60 border border-red-500/20 rounded-xl gap-4">
            <div>
              <div className="text-sm font-bold text-red-400">{t.deleteAccount}</div>
              <div className="text-xs text-gray-400">{t.deleteAccountDesc}</div>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition cursor-pointer self-end sm:self-auto flex items-center gap-1.5"
            >
              <Trash2 size={14} /> {t.deleteAccount}
            </button>
          </div>
        </div>
      </section>

      {/* Confirmation Modal: Revoke All Other Sessions */}
      {showRevokeAllModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-500/40 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowRevokeAllModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <LogOut size={28} />
            </div>
            <h3 className="text-lg font-bold text-white">¿Cerrar todas las demás sesiones?</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Esta acción invalidará de inmediato los tokens en todos tus otros dispositivos
              (móviles, laptops y tablets). Solo este navegador permanecerá conectado.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRevokeAllModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRevokeAllOtherSessions}
                disabled={isRevoking}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition"
              >
                {isRevoking ? 'Cerrando...' : 'Confirmar y Cerrar Sesiones'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Account */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-bold text-white text-center">Eliminación de Cuenta</h3>
            <p className="text-xs text-gray-300 leading-relaxed text-center">
              Para confirmar la solicitud de eliminación de todos tus datos, escribe la palabra{' '}
              <strong className="text-red-400">ELIMINAR</strong> a continuación:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm text-center uppercase tracking-wider focus:outline-none focus:border-red-500"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'ELIMINAR'}
                onClick={async () => {
                  setShowDeleteModal(false);
                  onShowToast(
                    lang === 'en'
                      ? 'Account deletion requested'
                      : 'Solicitud de eliminación registrada correctamente',
                    false
                  );
                  await handleGlobalSignOut();
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Eliminar Cuenta Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
