import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { hubService } from '../../services/hub.service';
import { AgendaItem } from '../../types/hub.types';

export const AgendaTracking: React.FC = () => {
  const [appointments, setAppointments] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgenda = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hubService.getAgenda();
      setAppointments(data);
    } catch (err: any) {
      console.error('[AgendaTracking] Error loading appointments:', err);
      setError('No se pudo cargar la agenda en este momento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, []);

  const getStatusBadge = (status: AgendaItem['status']) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmada
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            Pendiente de Aprobación
          </span>
        );
      case 'reschedule_requested_client':
      case 'reschedule_requested_artist':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400">
            <RefreshCw className="w-3.5 h-3.5" />
            Reprogramación Solicitada
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Finalizada
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            Cancelada
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

  const formatAppointmentDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('es-PA', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
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
            <Calendar className="w-5 h-5 text-violet-400" />
            Agenda del Atelier
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Seguimiento de citas presenciales, sesiones de tatuaje y perforaciones biocompatibles.
          </p>
        </div>
        <button
          onClick={fetchAgenda}
          disabled={loading}
          className="self-start sm:self-auto px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-zinc-300 transition flex items-center gap-1.5"
          title="Actualizar agenda"
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
              className="p-5 rounded-xl border border-white/5 bg-[#1A1A24]/60 animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-zinc-700/60 rounded w-1/3"></div>
                <div className="h-5 bg-zinc-700/40 rounded-full w-24"></div>
              </div>
              <div className="h-3 bg-zinc-800/80 rounded w-2/3"></div>
              <div className="h-3 bg-zinc-800/60 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/10 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={fetchAgenda}
            className="mt-3 px-4 py-1.5 text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition"
          >
            Reintentar
          </button>
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
          <Calendar className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-zinc-300">No hay citas en tu agenda</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Cuando reserves una sesión de tatuaje o piercing con nuestros artistas residentes, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="atelier-card-hover p-5 rounded-xl border border-white/10 bg-[#1A1A24]/80 transition duration-300 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-white text-base">
                    {appt.service_title || 'Sesión en Atelier'}
                  </h4>
                  <p className="text-xs text-violet-300 flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                    Artista: {appt.artist_name || 'Residente Obsidian'}
                  </p>
                </div>
                <div>{getStatusBadge(appt.status)}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span className="capitalize">{formatAppointmentDate(appt.start_time)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{appt.studio_name || 'Obsidian Atelier — Retiro y Atención'}</span>
                </div>
              </div>

              {appt.notes && (
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-zinc-400">
                  <span className="text-zinc-500 font-medium">Notas técnicas: </span>
                  {appt.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
