import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { hubService } from '../../services/hub.service';
import { PaymentItem } from '../../types/hub.types';

export const PaymentTracking: React.FC = () => {
  const { formatPrice } = useCurrency();
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hubService.getPayments();
      setPayments(data);
    } catch (err: any) {
      console.error('[PaymentTracking] Error loading payments:', err);
      setError('No se pudieron sincronizar las transacciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusBadge = (status: PaymentItem['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            Pendiente
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            Fallido
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400">
            <RefreshCw className="w-3.5 h-3.5" />
            Reembolsado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300">
            {status}
          </span>
        );
    }
  };

  const formatPaymentMethod = (method: string) => {
    const m = method.toLowerCase();
    if (m.includes('paypal')) return 'PayPal Payouts';
    if (m.includes('credit') || m.includes('card') || m.includes('tarjeta')) return 'Tarjeta de Crédito';
    if (m.includes('cash') || m.includes('studio') || m.includes('estudio')) return 'Depósito en Estudio';
    if (m.includes('transfer')) return 'Transferencia Bancaria';
    return method.toUpperCase();
  };

  const formatPaymentDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('es-PA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="atelier-card p-6 border border-white/10 rounded-2xl bg-[#13131A]/90 text-white shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-violet-400" />
            Pagos y Transacciones
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Historial de abonos, pagos en línea y depósitos de reserva para el atelier.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="self-start sm:self-auto px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-zinc-300 transition flex items-center gap-1.5"
          title="Actualizar transacciones"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-white/5 bg-[#1A1A24]/60 animate-pulse flex justify-between items-center"
            >
              <div className="space-y-2 w-1/2">
                <div className="h-5 bg-zinc-700/60 rounded w-1/3"></div>
                <div className="h-3 bg-zinc-800/80 rounded w-2/3"></div>
              </div>
              <div className="h-6 bg-zinc-700/40 rounded-full w-24"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/10 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={fetchPayments}
            className="mt-3 px-4 py-1.5 text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition"
          >
            Reintentar
          </button>
        </div>
      ) : payments.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
          <CreditCard className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-zinc-300">No hay pagos registrados</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Tus transacciones, abonos de citas o compras de productos en la tienda se mostrarán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="atelier-card-hover p-5 rounded-xl border border-white/10 bg-[#1A1A24]/80 transition duration-300 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white tracking-tight">
                    {formatPrice(payment.amount, payment.currency)}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded border border-white/10 bg-white/5 text-zinc-300">
                    {formatPaymentMethod(payment.payment_method)}
                  </span>
                </div>
                {payment.concept && (
                  <p className="text-xs text-zinc-300 font-medium">
                    {payment.concept}
                  </p>
                )}
                <p className="text-[11px] text-zinc-500">
                  Registrado el {formatPaymentDate(payment.created_at)}
                </p>
              </div>

              <div className="self-start sm:self-auto">
                {getStatusBadge(payment.status)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Cifrado TLS 256-bit • Respaldado por el Atelier</span>
        </div>
        <span>Fase 1: PayPal &amp; Presencial</span>
      </div>
    </div>
  );
};
