import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Lock,
  Sparkles,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../api/client';
import { Link } from 'react-router-dom';

interface SubscriptionBillingSectionProps {
  userRole: 'cliente' | 'tatuador';
  onStatusUpdated?: () => void;
}

export const SubscriptionBillingSection: React.FC<SubscriptionBillingSectionProps> = ({
  userRole,
  onStatusUpdated,
}) => {
  const { user, updateUserMetadata, refreshProfile } = useAuth();
  const { formatPrice } = useCurrency();

  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Costo mensual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const meta = user?.user_metadata || {};
  const hasActive = Boolean(meta.has_active_subscription);
  const cancelAtPeriodEnd = Boolean(meta.cancel_at_period_end);

  // Compute period end date (defaulting to 30 days from now if absent)
  const [periodEnd, setPeriodEnd] = useState<string>(() => {
    if (meta.current_period_end) return meta.current_period_end;
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString();
  });

  const [cardInfo, setCardInfo] = useState<{
    last4: string;
    brand: string;
    exp: string;
    holder?: string;
  }>(() => ({
    last4: meta.card_last4 || '1111',
    brand: meta.card_brand || 'Visa',
    exp: meta.card_exp || '12/28',
    holder: meta.card_holder || meta.nombre || 'TITULAR REGISTRADO',
  }));

  // Fetch live subscription status from backend
  const fetchStatus = async () => {
    if (!user?.id) return;
    try {
      const res = await api.getSubscriptionStatus(user.id);
      if (res.success && res.data) {
        if (res.data.current_period_end) {
          setPeriodEnd(res.data.current_period_end);
        }
        if (res.data.card) {
          setCardInfo({
            last4: res.data.card.last4,
            brand: res.data.card.brand,
            exp: `${res.data.card.exp_month || '12'}/${res.data.card.exp_year || '28'}`,
            holder: res.data.card.holder,
          });
        }
      }
    } catch (err) {
      console.warn('[SubscriptionBillingSection] Status fetch fallback:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user?.id]);

  const formatDateDisplay = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return new Intl.DateTimeFormat('es-PA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    } catch {
      return isoStr;
    }
  };

  const handleConfirmCancel = async () => {
    if (!user?.id) return;
    setIsProcessing(true);
    setFeedbackMsg(null);
    try {
      const res = await api.cancelSubscription({
        user_id: user.id,
        reason: cancelReason,
      });

      if (res.success) {
        updateUserMetadata({
          has_active_subscription: true, // Maintain active benefits for remainder of period
          subscription_status: 'canceling',
          cancel_at_period_end: true,
          current_period_end: res.data?.current_period_end || periodEnd,
        });

        if (refreshProfile) {
          await refreshProfile().catch(() => {});
        }

        setShowCancelModal(false);
        setFeedbackMsg({
          type: 'success',
          text: `Cancelación programada para el ${formatDateDisplay(
            res.data?.current_period_end || periodEnd
          )}. Mantendrás tus beneficios activos hasta esa fecha y tu historial quedará protegido en modo lectura.`,
        });

        if (onStatusUpdated) onStatusUpdated();
      } else {
        setFeedbackMsg({
          type: 'error',
          text: res.error || 'No se pudo programar la cancelación.',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error en la solicitud de cancelación.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async () => {
    if (!user?.id) return;
    setLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await api.reactivateSubscription({
        user_id: user.id,
      });

      if (res.success) {
        updateUserMetadata({
          has_active_subscription: true,
          subscription_status: 'active',
          cancel_at_period_end: false,
          current_period_end: res.data?.current_period_end || periodEnd,
        });

        if (refreshProfile) {
          await refreshProfile().catch(() => {});
        }

        setFeedbackMsg({
          type: 'success',
          text: '¡Suscripción reactivada con éxito! Tu membresía continuará renovándose con normalidad.',
        });

        if (onStatusUpdated) onStatusUpdated();
      } else {
        setFeedbackMsg({
          type: 'error',
          text: res.error || 'No se pudo reactivar la suscripción.',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error reactivando la suscripción.',
      });
    } finally {
      setLoading(false);
    }
  };

  const isArtist = userRole === 'tatuador';
  const planName = isArtist ? 'Estudio Profesional (Acceso Comercial)' : 'Coleccionista VIP';
  const planFee = isArtist ? 4.99 : 4.99;

  return (
    <div className="atelier-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950/90 shadow-xl text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading">Facturación &amp; Suscripción</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Administra tu método de pago afiliado, estado de membresía y período contratado.
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div>
          {hasActive && !cancelAtPeriodEnd ? (
            <span
              id="subscription-badge-active"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Suscripción Activa
            </span>
          ) : hasActive && cancelAtPeriodEnd ? (
            <span
              id="subscription-badge-canceling"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Cancelación Programada
            </span>
          ) : (
            <span
              id="subscription-badge-free"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700"
            >
              Plan Gratuito
            </span>
          )}
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMsg && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Main Billing Information Card */}
      {hasActive ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan Info */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                Plan Contratado
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{planName}</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
                Tarifa recurrente: <strong>{formatPrice(planFee)}/mes</strong>
              </p>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 text-xs">
                {cancelAtPeriodEnd ? (
                  <div className="space-y-1">
                    <span className="text-amber-600 dark:text-amber-400 font-semibold block">
                      Cancelación programada para el {formatDateDisplay(periodEnd)}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Tus beneficios continuarán vigentes hasta esta fecha. Después, pasarás automáticamente a la versión gratuita sin cargos adicionales.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-slate-600 dark:text-zinc-300 block">
                      Próxima fecha de renovación: <strong>{formatDateDisplay(periodEnd)}</strong>
                    </span>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                      Ciclo de 30 días con débito automático a tu tarjeta afiliada.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method on File */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                  Método de Pago Afiliado
                </span>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                    {cardInfo.brand}
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    •••• •••• •••• {cardInfo.last4}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Expira: {cardInfo.exp} • {cardInfo.holder}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-zinc-500 text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Bóveda segura
                </span>
                <Link
                  to="/subscription/creditcard"
                  className="text-violet-600 dark:text-violet-400 font-semibold hover:underline text-[11px]"
                >
                  Cambiar tarjeta
                </Link>
              </div>
            </div>
          </div>

          {/* Read-Only Guarantee Notice */}
          <div className="p-4 rounded-2xl bg-violet-50/60 dark:bg-zinc-900/50 border border-violet-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold mb-0.5">
                Garantía de Resguardo Histórico (Modo Lectura Permanente)
              </strong>
              <span>
                Si decides cancelar o tu suscripción finaliza, <strong>toda tu información anterior</strong> (tatuajes registrados, historial de citas, diario fotográfico de cicatrización y portafolio de obras) se mantendrá disponible permanentemente para tu consulta. Únicamente se restringen nuevas acciones interactivas de membresía.
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            {cancelAtPeriodEnd ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  id="btn-reactivate-subscription"
                  disabled={loading}
                  onClick={handleReactivate}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Reactivar Suscripción</span>
                </button>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Continúa con tus beneficios sin cortes de servicio.
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  ¿Deseas darte de baja? Conservarás tus 30 días pagados.
                </span>
                <button
                  type="button"
                  id="btn-open-cancel-modal"
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer"
                >
                  Cancelar Suscripción
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Free Tier State */
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Cuenta en Plan Gratuito
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
            {isArtist
              ? 'Pasa a Estudio Profesional para desbloquear citas ilimitadas, pin en el mapa geolocalizado y gestión multi-artista con 30 días de prueba sin comisiones.'
              : 'Pasa a Cliente VIP para registrar la cicatrización clínica de tus tatuajes, acceder a flash drops anticipados y chat prioritario con artistas.'}
          </p>

          <Link
            to={isArtist ? '/unete-como-tatuador' : '/subscription/creditcard'}
            id="btn-upgrade-plan-now"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition transform hover:scale-[1.01]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isArtist ? 'Activar Estudio Profesional (30 Días Gratis)' : 'Desbloquear Membresía VIP ($4.99/mes)'}</span>
          </Link>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div
          role="dialog"
          aria-modal="true"
          id="subscription-cancel-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <div className="atelier-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-2xl relative text-left text-slate-900 dark:text-white">
            <button
              onClick={() => setShowCancelModal(false)}
              aria-label="Cerrar modal"
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  ¿Confirmas la cancelación de tu suscripción?
                </h3>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  Mantendrás tus beneficios hasta el {formatDateDisplay(periodEnd)}
                </span>
              </div>
            </div>

            <div className="space-y-3.5 my-5 text-xs text-slate-600 dark:text-zinc-300">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>Período de 30 días garantizado</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400 pl-6">
                  Tu suscripción no se corta inmediatamente. Dispones de acceso completo hasta el <strong>{formatDateDisplay(periodEnd)}</strong>. No se emitirán más cargos a tu tarjeta.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Historial resguardado en Modo Lectura</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400 pl-6">
                  Al vencer la fecha, tu cuenta pasará automáticamente al plan gratuito. Toda la información que hayas registrado previamente se mantiene intacta para tu consulta.
                </p>
              </div>
            </div>

            {/* Motivo de cancelación */}
            <div className="mb-6">
              <label htmlFor="cancel-reason-select" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Motivo de tu cancelación (opcional)
              </label>
              <select
                id="cancel-reason-select"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
              >
                <option value="Costo mensual">Costo mensual del plan</option>
                <option value="Poco uso de funciones">No utilizo las funciones con frecuencia</option>
                <option value="Solo necesitaba una sesión">Solo necesitaba gestionar una sesión puntual</option>
                <option value="Otro motivo">Otro motivo</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Mantener mi Suscripción
              </button>
              <button
                type="button"
                id="btn-confirm-cancel-subscription"
                disabled={isProcessing}
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Confirmar Cancelación Programada</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
