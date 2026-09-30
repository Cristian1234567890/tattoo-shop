import React, { useState } from 'react';
import { TattooArtistCard } from '../../types';
import { api } from '../../api/client';
import { formatWhatsAppUrl } from '../../utils/whatsapp';

interface ArtistCardProps {
  artist: TattooArtistCard;
  onMessageSent?: (msg: string) => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onMessageSent }) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [imageData, setImageData] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');

  const cardData = artist.data as TattooArtistCard['data'] & {
    whatsapp_number?: string;
    phone_prefix?: string;
  };
  const avatarSrc = cardData.profile || '/assets/GB Tattoo.jpg';

  const handleOpenMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsActive(true);
    setStatusText('');
  };

  const handleCloseMessage = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsActive(false);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      // Strip base64 metadata prefix for /mail API if needed, or keep complete data URL
      const base64Clean = result.includes(',') ? result.split(',')[1] : result;
      setImageData(base64Clean);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setStatusText('Por favor escribe un mensaje.');
      return;
    }
    setSending(true);
    setStatusText('Enviando...');
    try {
      await api.sendMail({
        to: cardData.email,
        email: message,
        img: imageData || undefined,
      });
      setStatusText('¡Mensaje enviado con éxito!');
      if (onMessageSent) onMessageSent(message);
      setTimeout(() => {
        setMessage('');
        setImageData('');
        setImagePreview('');
        setIsActive(false);
        setStatusText('');
      }, 1500);
    } catch (err: any) {
      console.error('Error sending email:', err);
      setStatusText('Error al enviar el correo. Por favor intente más tarde.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="wrapper">
      <div className={`profile-card js-profile-card ${isActive ? 'active' : ''}`}>
        <div className="profile-card__img">
          <img
            src={avatarSrc}
            alt="profile card"
            id="profile-img"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/GB Tattoo.jpg';
            }}
          />
        </div>

        <div className="profile-card__cnt js-profile-cnt">
          <div className="profile-card__name" id="name">
            {cardData.nombre} {cardData.apellido}
          </div>
          <div className="profile-card__txt">
            Tatuador ubicado en:{' '}
            <strong id="address">
              {cardData.provincia || 'Panamá'}, {cardData.ciudad || 'Ciudad de Panamá'}
            </strong>
          </div>

          <div className="profile-card-inf">
            <div className="profile-card-inf__item">
              <div className="profile-card-inf__title">
                {cardData.followersCount ?? 1598}
              </div>
              <div className="profile-card-inf__txt">Seguidores</div>
            </div>

            <div className="profile-card-inf__item">
              <div className="profile-card-inf__title">
                {cardData.followingCount ?? 65}
              </div>
              <div className="profile-card-inf__txt">Siguiendo</div>
            </div>

            <div className="profile-card-inf__item">
              <div className="profile-card-inf__title capitalize">
                {cardData.work_type || 'Realista'}
              </div>
              <div className="profile-card-inf__txt">Tipo de Trabajo</div>
            </div>

            <div className="profile-card-inf__item">
              <div className="profile-card-inf__title">
                {cardData.worksCount ?? 85}
              </div>
              <div className="profile-card-inf__txt">Trabajos</div>
            </div>
          </div>

          <div className="profile-card-social">
            <a
              href={cardData.facebook || '#'}
              className="profile-card-social__item facebook"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
            >
              <span className="icon-font">
                <svg className="icon w-5 h-5 fill-current">
                  <use xlinkHref="#icon-facebook"></use>
                </svg>
              </span>
            </a>

            <a
              href={cardData.twitter || '#'}
              className="profile-card-social__item twitter"
              target="_blank"
              rel="noopener noreferrer"
              title="Twitter"
            >
              <span className="icon-font">
                <svg className="icon w-5 h-5 fill-current">
                  <use xlinkHref="#icon-twitter"></use>
                </svg>
              </span>
            </a>

            <a
              href={cardData.instagram || '#'}
              className="profile-card-social__item instagram"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
            >
              <span className="icon-font">
                <svg className="icon w-5 h-5 fill-current">
                  <use xlinkHref="#icon-instagram"></use>
                </svg>
              </span>
            </a>

            <a
              href={cardData.link || '#'}
              className="profile-card-social__item link"
              target="_blank"
              rel="noopener noreferrer"
              title="Enlace web"
            >
              <span className="icon-font">
                <svg className="icon w-5 h-5 fill-current">
                  <use xlinkHref="#icon-link"></use>
                </svg>
              </span>
            </a>
          </div>

          <div className="profile-card-ctr">
            <button
              className="profile-card__button button--blue js-message-btn"
              onClick={handleOpenMessage}
            >
              Mensaje
            </button>
            {(() => {
              const phone = cardData.telefono || cardData.whatsapp_number;
              const prefix = cardData.phone_prefix || '507';
              return phone ? (
                <a
                  href={formatWhatsAppUrl(phone, prefix) || formatWhatsAppUrl(cardData.telefono)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-card__button button--whatsapp flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer"
                  id="whatsapp-btn"
                  title="Contactar por WhatsApp"
                >
                  WhatsApp
                </a>
              ) : null;
            })()}
            <button
              className="profile-card__button button--orange"
              onClick={() => alert(`Siguiendo a ${cardData.nombre}`)}
            >
              Seguir
            </button>
          </div>
        </div>

        {/* Message Inquiry Overlay */}
        <div className="profile-card-message js-message">
          <form className="profile-card-form" onSubmit={handleSendMessage}>
            <div className="profile-card-form__container">
              <textarea
                placeholder="¿Qué quisieras hacerte?"
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <hr className="my-2 border-gray-300 dark:border-gray-600" />
            <div className="dragdrop">
              <div className="draggable" draggable="true">
                Ingresa un ejemplo de tatuaje ⤵️
              </div>
              <div
                className="droppable hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                Suelta aquí
              </div>
            </div>
            <div className="upload flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                id="file-input"
                onChange={handleFileInputChange}
                className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer"
              />
              <div
                id="image-container"
                style={{ display: imagePreview ? 'block' : 'none' }}
                className="mt-2"
              >
                <img
                  id="selected-image"
                  src={imagePreview || ''}
                  alt="Imagen seleccionada"
                  className="w-16 h-16 object-cover rounded shadow"
                />
              </div>
            </div>
            {statusText && (
              <p className="text-xs text-center font-semibold text-primary mt-2">
                {statusText}
              </p>
            )}
            <hr className="my-2 border-gray-300 dark:border-gray-600" />
            <div className="profile-card-form__bottom">
              <button
                type="submit"
                className="profile-card__button button--blue js-message-close"
                id="btn-message"
                disabled={sending}
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
              <button
                type="button"
                className="profile-card__button button--gray js-message-close"
                onClick={handleCloseMessage}
              >
                Cancelar
              </button>
            </div>
          </form>
          <div
            className="profile-card__overlay js-message-close"
            onClick={handleCloseMessage}
          ></div>
        </div>
      </div>
    </div>
  );
};
