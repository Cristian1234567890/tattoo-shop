import React, { useState } from 'react';
import {
  X,
  Calendar,
  Trash2,
  MessageCircle,
  Download,
  AlertTriangle,
  User,
} from 'lucide-react';
import { ProgressItem } from './TattooTimeline';

interface ProgressDetailModalProps {
  entry: ProgressItem | null;
  onClose: () => void;
  onDelete?: (id: string) => Promise<void>;
  isOwner?: boolean;
}

export const ProgressDetailModal: React.FC<ProgressDetailModalProps> = ({
  entry,
  onClose,
  onDelete,
  isOwner = true,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!entry) return null;

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(entry.id);
      onClose();
    } catch (err) {
      console.error('Error deleting entry:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getWhatsAppLink = (artist: any) => {
    if (!artist?.whatsapp_number) return null;
    const cleanNumber = artist.whatsapp_number.replace(/\D/g, '');
    const cleanPrefix = (artist.phone_prefix || '+507').replace('+', '');
    const fullNumber = cleanNumber.startsWith(cleanPrefix)
      ? cleanNumber
      : `${cleanPrefix}${cleanNumber}`;
    const text = encodeURIComponent(
      `Hola ${artist.full_name || ''}, te comparto el avance de mi tatuaje (${entry.stage}): ${entry.title}.`
    );
    return `https://wa.me/${fullNumber}?text=${text}`;
  };

  const whatsappUrl = entry.artist ? getWhatsAppLink(entry.artist) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700/80 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative my-8 flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-gray-300 hover:text-white p-2 rounded-full backdrop-blur-sm transition"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {/* Left Side: Full Image */}
        <div className="md:w-1/2 bg-black flex items-center justify-center p-4 relative group">
          <img
            src={entry.image_url || '/assets/placeholder-tattoo.png'}
            alt={entry.title}
            className="max-h-[600px] w-full object-contain rounded-2xl"
          />
          {entry.image_url && (
            <a
              href={entry.image_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="absolute bottom-6 right-6 bg-gray-900/80 hover:bg-primary text-white p-2.5 rounded-xl backdrop-blur-sm transition shadow-lg opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-semibold"
            >
              <Download size={14} /> Abrir original
            </a>
          )}
        </div>

        {/* Right Side: Details & Actions */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
          <div>
            {/* Header Stage & Date */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="px-3.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/40 text-xs font-bold uppercase tracking-wider">
                {entry.stage}
              </span>

              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar size={14} className="text-gray-500" />
                <span>{entry.date}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-black text-white mb-4">{entry.title}</h3>

            {/* Artist Card */}
            {entry.artist ? (
              <div className="bg-gray-950/80 border border-gray-800 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={entry.artist.avatar_url || '/assets/Tattoo Machine Rotary.png'}
                    alt={entry.artist.full_name || 'Artista'}
                    className="w-11 h-11 rounded-full object-cover border-2 border-primary/60"
                  />
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                      Tatuador Responsable
                    </span>
                    <h5 className="text-sm font-bold text-white">
                      {entry.artist.full_name || 'Artista Tattoo Hub'}
                    </h5>
                  </div>
                </div>

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <div className="bg-gray-950/40 border border-gray-800/80 rounded-xl p-3 mb-6 flex items-center gap-2 text-xs text-gray-400">
                <User size={14} className="text-gray-500" />
                <span>Registro fotográfico de cuidados personales</span>
              </div>
            )}

            {/* Notes Section */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Notas de la Sesión & Cuidados
              </h4>
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 text-sm text-gray-200 leading-relaxed max-h-48 overflow-y-auto">
                {entry.notes ? (
                  <p>{entry.notes}</p>
                ) : (
                  <p className="text-gray-500 italic">No se agregaron notas para este avance.</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-gray-800">
            {showDeleteConfirm ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                  <AlertTriangle size={16} />
                  <span>¿Estás seguro de que deseas eliminar este registro?</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="text-xs text-gray-400 hover:text-white px-3 py-1.5"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition shadow"
                  >
                    {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {isOwner && onDelete && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-gray-500 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 py-1.5 transition"
                  >
                    <Trash2 size={14} /> Eliminar avance
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="ml-auto bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDetailModal;
