import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Camera,
  AlertCircle,
  Info,
} from 'lucide-react';
import { uploadTattooProgressPhoto } from '../../utils/storage';
import { api } from '../../api/client';
import { supabase } from '../../api/supabase';

interface UploadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onProgressSaved: (newEntry: any) => void;
  availableArtists?: Array<{ id: string; name: string; avatar?: string }>;
}

export const UploadProgressModal: React.FC<UploadProgressModalProps> = ({
  isOpen,
  onClose,
  userId,
  onProgressSaved,
  availableArtists = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [stage, setStage] = useState<string>('Fase 1: Limpieza & Primer Vendaje');
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [artistId, setArtistId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [bodyPart, setBodyPart] = useState<string>('Brazo');
  const [healingRating, setHealingRating] = useState<number>(5);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }
    // Limit to 10MB client-side
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('La imagen no debe superar los 10MB.');
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Debes seleccionar o arrastrar una fotografía.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Por favor ingresa un título para este avance.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setUploadProgress('Subiendo fotografía a Supabase Storage...');

    try {
      // 1. Direct upload to Supabase Storage bucket 'tattoo-progress'
      const uploadResult = await uploadTattooProgressPhoto(selectedFile, userId);
      if (uploadResult.error || !uploadResult.publicUrl) {
        throw new Error(`Error en Storage: ${uploadResult.error?.message || 'Fallo al subir imagen'}`);
      }

      const publicImageUrl = uploadResult.publicUrl;
      const filePath = uploadResult.path;

      // 2. Persist record to public.tattoo_progress via ApiClient or Supabase client
      setUploadProgress('Guardando registro de evolución en la base de datos...');
      const payload = {
        client_id: userId,
        artist_id: artistId ? artistId : null,
        title: title.trim(),
        notes: notes.trim(),
        image_url: publicImageUrl,
        stage,
        session_number: Number(sessionNumber) || 1,
        date,
        metadata: {
          storage_path: filePath,
          file_size: selectedFile.size,
          body_part: bodyPart,
          healing_rating: Number(healingRating),
        },
      };

      // Attempt saving via API first
      let savedRecord: any = null;
      const apiRes = await api.saveTattooProgress(payload);

      if (apiRes.success && apiRes.data) {
        savedRecord = apiRes.data;
      } else {
        // Fallback to direct Supabase client insert
        const { data: insertedData, error: insertError } = await supabase
          .from('tattoo_progress')
          .insert(payload)
          .select(`
            *,
            artist:artist_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .single();

        if (insertError) {
          throw new Error(`Error en base de datos: ${insertError.message}`);
        }
        savedRecord = insertedData;
      }

      // 3. Notify parent and close modal
      onProgressSaved(savedRecord);
      onClose();
    } catch (err: any) {
      console.error('Error uploading tattoo progress:', err);
      setErrorMessage(err.message || 'Ocurrió un error inesperado al guardar el avance.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700/80 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isUploading}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-800"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
            <Camera size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Registrar Avance del Tatuaje</h3>
            <p className="text-xs text-gray-400">
              Sube una fotografía reciente y documenta la cicatrización o sesión.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo Dropzone / Preview */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Fotografía de la Sesión / Cicatrización *
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden bg-gray-950 border-2 border-primary/40 p-2 flex items-center justify-center group">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="max-h-64 rounded-xl object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setImagePreview('');
                  }}
                  className="absolute top-4 right-4 bg-black/80 hover:bg-red-600 text-white p-2 rounded-xl text-xs flex items-center gap-1 backdrop-blur-sm transition shadow-lg"
                >
                  <X size={14} /> Cambiar Foto
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 hover:border-primary/60 rounded-2xl p-8 text-center cursor-pointer transition bg-gray-950/40 hover:bg-gray-800/40 flex flex-col items-center justify-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gray-800/80 flex items-center justify-center text-primary mb-3">
                  <UploadCloud size={28} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Haz clic para seleccionar o arrastra tu foto aquí
                </h4>
                <p className="text-xs text-gray-400">
                  Formatos soportados: JPG, PNG, WEBP (Hasta 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Title & Stage Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Título del Registro *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Sesión 1 - Líneas brazo derecho"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Fase de Curación / Tipo de Sesión
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value="Fase 1: Limpieza & Primer Vendaje">Fase 1: Limpieza & Primer Vendaje (Días 1 - 3)</option>
                <option value="Fase 2: Descamación & Hidratación">Fase 2: Descamación & Hidratación (Días 4 - 14)</option>
                <option value="Fase 3: Cicatrización Completa">Fase 3: Cicatrización Completa (Días 15 - 30)</option>
                <option value="Sesión de Tinta: Delineado / Línea">Sesión de Tinta: Delineado / Línea</option>
                <option value="Sesión de Tinta: Sombras & Color">Sesión de Tinta: Sombras & Color</option>
                <option value="Sesión de Retoque Final">Sesión de Retoque Final</option>
              </select>
            </div>
          </div>

          {/* Date, Session Number & Artist Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Fecha del Avance
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Número de Sesión
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={sessionNumber}
                onChange={(e) => setSessionNumber(Number(e.target.value))}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Tatuador Asociado (Opcional)
              </label>
              <select
                value={artistId}
                onChange={(e) => setArtistId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Sin asociar / Personal</option>
                {availableArtists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Body Part & Healing Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Zona del Cuerpo
              </label>
              <input
                type="text"
                value={bodyPart}
                onChange={(e) => setBodyPart(e.target.value)}
                placeholder="Brazo, Pierna, Espalda..."
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Nivel de Curación (1-5)
              </label>
              <select
                value={healingRating}
                onChange={(e) => setHealingRating(Number(e.target.value))}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value={1}>1 - Con irritación / dolor</option>
                <option value={2}>2 - Descamación activa</option>
                <option value={3}>3 - En proceso normal</option>
                <option value={4}>4 - Cicatrizando muy bien</option>
                <option value={5}>5 - Completamente curado</option>
              </select>
            </div>
          </div>

          {/* Notes and Aftercare Details */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Notas de Curación & Cuidados
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe cómo sientes la piel, crema utilizada (ej. Bepanthen, Aquaphor), nivel de enrojecimiento o dudas..."
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary placeholder-gray-500"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            {isUploading ? (
              <div className="flex items-center gap-2 text-xs text-primary">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <span>{uploadProgress}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Info size={13} /> Visible en tu perfil y compartido con tu tatuador
              </span>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Guardando...' : 'Publicar Avance'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadProgressModal;
