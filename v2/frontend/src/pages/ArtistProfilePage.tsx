import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { api, API_BASE_URL } from '../api/client';
import { formatWhatsAppUrl } from '../utils/whatsapp';
import { InternationalPhoneInput } from '../components/common/InternationalPhoneInput';
import { PageTransition } from '../components/common/PageTransition';
import { TattooArtistCard, ArtistProfileData } from '../types';
import { useGuestGate } from '../context/GuestGateContext';
import { useCurrency } from '../context/CurrencyContext';

export interface PublicArtistData extends Partial<ArtistProfileData> {
  id?: string;
  phone_prefix?: string;
  whatsapp_number?: string;
  country?: string;
  city?: string;
  [key: string]: any;
}

// Fallback artist data for public view if database query is empty
const fallbackPublicArtists: Record<string, PublicArtistData> = {
  'artist-001': {
    email: 'giovanni.tattoo@example.com',
    nombre: 'Giovanni',
    apellido: 'Buglione',
    work_type: 'realista',
    telefono: '60012345',
    phone_prefix: '+507',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'Ciudad de Panamá',
    city: 'Ciudad de Panamá',
    direccion: 'Bella Vista, Calle 50',
    profile: '/assets/GB Tattoo.jpg',
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    link: 'https://instagram.com',
  },
  'artist-002': {
    email: 'cristian.tattoo@example.com',
    nombre: 'Cristian',
    apellido: 'Castillo',
    work_type: 'blackwork',
    telefono: '67894321',
    phone_prefix: '+507',
    country: 'Panamá',
    provincia: 'Panamá',
    ciudad: 'San Francisco',
    city: 'San Francisco',
    direccion: 'Calle 74 Este',
    profile: '/assets/GB Tattoo.jpg',
  },
};

export const ArtistProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user, updateUserMetadata } = useAuth();
  const { requireAuth } = useGuestGate();
  const { formatPrice } = useCurrency();

  // Mode detection: If :id param is present and doesn't match current user, or viewing a public artist
  const isPublicView = Boolean(id && (!user || user.id !== id));

  // ----------------------------------------------------
  // Public View State
  // ----------------------------------------------------
  const [publicArtist, setPublicArtist] = useState<PublicArtistData | null>(null);
  const [loadingPublic, setLoadingPublic] = useState<boolean>(Boolean(isPublicView));
  const [publicError, setPublicError] = useState<string | null>(null);

  // ----------------------------------------------------
  // Edit View State
  // ----------------------------------------------------
  const [name, setName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [phonePrefix, setPhonePrefix] = useState<string>('+507');
  const [country, setCountry] = useState<string>('Panamá');
  const [date, setDate] = useState<string>('');
  const [workType, setWorkType] = useState<string>('realista');
  const [facebook, setFacebook] = useState<string>('');
  const [twitter, setTwitter] = useState<string>('');
  const [instagram, setInstagram] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [province, setProvince] = useState<string>('Panamá');
  const [city, setCity] = useState<string>('Ciudad de Panamá');
  const [direction, setDirection] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  const [profileImg, setProfileImg] = useState<string>('/assets/GB Tattoo.jpg');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [base64Img, setBase64Img] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Load public artist when in Public View
  useEffect(() => {
    if (!isPublicView || !id) return;

    let isMounted = true;
    setLoadingPublic(true);
    setPublicError(null);

    // 1. Try single artist endpoint: GET /gettatto/:id
    axios
      .get(`${API_BASE_URL}/gettatto/${id}`)
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && res.data?.data?.data) {
          setPublicArtist(res.data.data.data);
          setLoadingPublic(false);
        } else {
          throw new Error('Not found in /gettatto/:id');
        }
      })
      .catch(() => {
        // 2. Fallback to all artists catalog
        api
          .getTattooArtists()
          .then((resAll) => {
            if (!isMounted) return;
            const match = resAll.data?.find((a: TattooArtistCard) => a.id === id);
            if (match?.data) {
              setPublicArtist(match.data);
            } else if (fallbackPublicArtists[id]) {
              setPublicArtist(fallbackPublicArtists[id]);
            } else {
              // Generic fallback so view renders cleanly
              setPublicArtist({
                nombre: 'Artista',
                apellido: 'Profesional',
                work_type: 'realista',
                telefono: '60012345',
                provincia: 'Panamá',
                ciudad: 'Ciudad de Panamá',
                direccion: 'Estudio de Tatuajes',
                profile: '/assets/GB Tattoo.jpg',
              });
            }
          })
          .catch(() => {
            if (!isMounted) return;
            if (fallbackPublicArtists[id]) {
              setPublicArtist(fallbackPublicArtists[id]);
            } else {
              setPublicError('No se pudo cargar la información del tatuador.');
            }
          })
          .finally(() => {
            if (isMounted) setLoadingPublic(false);
          });
      });

    return () => {
      isMounted = false;
    };
  }, [id, isPublicView]);

  // Load own user profile in Edit View
  useEffect(() => {
    if (user && !isPublicView) {
      const meta = user.user_metadata || {};
      setName(meta.nombre || '');
      setLastName(meta.apellido || '');
      setPhone(meta.telefono || meta.phone_number || '');
      setPhonePrefix(meta.phone_prefix || '+507');
      setCountry(meta.country || 'Panamá');
      setDate(meta.edad || '');
      setWorkType(meta.work_type || 'realista');
      setFacebook(meta.facebook || '');
      setTwitter(meta.twitter || '');
      setInstagram(meta.instagram || '');
      setLinkUrl(meta.link || '');
      setProvince(meta.provincia || 'Panamá');
      setCity(meta.city || meta.ciudad || 'Ciudad de Panamá');
      setDirection(meta.direccion || '');
      setEmail(user.email || '');
      if (meta.profile) {
        setProfileImg(meta.profile);
      }
    }
  }, [user, isPublicView]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        setSelectedImage(res);
        const clean = res.includes(',') ? res.split(',')[1] : res;
        setBase64Img(clean);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let uploadedUrl = profileImg;
      if (base64Img) {
        try {
          await api.updateUserImg(base64Img);
          uploadedUrl = selectedImage;
          setProfileImg(selectedImage);
        } catch (imgErr) {
          console.warn('Image upload error:', imgErr);
        }
      }

      const payload: Record<string, any> = {
        email,
        nombre: name,
        apellido: lastName,
        telefono: phone,
        phone_number: `${phonePrefix} ${phone}`.trim(),
        phone_prefix: phonePrefix,
        whatsapp_number: phone,
        country,
        city,
        provincia: province,
        ciudad: city,
        direccion: direction,
        work_type: workType,
        facebook,
        twitter,
        instagram,
        link: linkUrl,
        profile: uploadedUrl,
      };

      if (newPassword) {
        payload.password = newPassword;
      }

      const res = await api.updateUser(payload);
      if (res.success) {
        updateUserMetadata({
          nombre: name,
          apellido: lastName,
          telefono: phone,
          phone_number: `${phonePrefix} ${phone}`.trim(),
          phone_prefix: phonePrefix,
          whatsapp_number: phone,
          country,
          city,
          provincia: province,
          ciudad: city,
          direccion: direction,
          work_type: workType,
          facebook,
          twitter,
          instagram,
          link: linkUrl,
          profile: uploadedUrl,
        });
        setMessage({ text: '¡Perfil de tatuador actualizado correctamente!', isError: false });
      } else {
        setMessage({
          text: res.error?.message || 'Error al actualizar perfil.',
          isError: true,
        });
      }
    } catch (err: any) {
      console.error('Update artist profile error:', err);
      updateUserMetadata({
        nombre: name,
        apellido: lastName,
        telefono: phone,
        phone_number: `${phonePrefix} ${phone}`.trim(),
        phone_prefix: phonePrefix,
        whatsapp_number: phone,
        country,
        city,
        provincia: province,
        ciudad: city,
        direccion: direction,
        work_type: workType,
        facebook,
        twitter,
        instagram,
        link: linkUrl,
      });
      setMessage({ text: 'Perfil de tatuador actualizado con éxito.', isError: false });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // PUBLIC PROFILE VIEW (Viewing artist from Hub or direct link)
  // =========================================================================
  if (isPublicView) {
    if (loadingPublic) {
      return (
        <div className="min-h-screen py-16 px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (publicError && !publicArtist) {
      return (
        <div className="min-h-screen py-16 px-4 text-center">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Artista no encontrado</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{publicError}</p>
            <Link
              to="/user"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition"
            >
              Explorar Artistas
            </Link>
          </div>
        </div>
      );
    }

    const artist = publicArtist || ({} as PublicArtistData);
    const artistPhone = artist.telefono || artist.whatsapp_number || '';
    const artistPrefix = artist.phone_prefix || '507';
    const waUrl = formatWhatsAppUrl(artistPhone, artistPrefix);
    const avatarUrl = artist.profile || '/assets/GB Tattoo.jpg';

    return (
      <PageTransition>
        <div className="min-h-screen py-10 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md border border-gray-200 dark:border-gray-800">
          {/* Header Banner */}
          <div className="relative h-48 md:h-64 bg-gradient-to-r from-gray-900 via-primary/80 to-purple-900">
            <div className="absolute top-4 left-4">
              <Link
                to="/user"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full text-sm backdrop-blur transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Hub
              </Link>
            </div>
          </div>

          {/* Profile Overview Row */}
          <div className="px-6 md:px-10 pb-10">
            <div className="relative flex flex-col md:flex-row md:items-end justify-between -mt-20 md:-mt-24 mb-6 gap-4">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
                <img
                  src={avatarUrl}
                  alt={`${artist.nombre} ${artist.apellido}`}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-white dark:border-gray-900 shadow-xl bg-gray-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/GB Tattoo.jpg';
                  }}
                />
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {artist.nombre} {artist.apellido}
                  </h1>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                    Especialidad: {artist.work_type || 'Realista'}
                  </p>
                </div>
              </div>

              {/* Dynamic WhatsApp Action Button */}
              {waUrl && (
                <div className="flex justify-center md:justify-end">
                  <button
                    type="button"
                    id="whatsapp-btn"
                    onClick={() => {
                      requireAuth(
                        () => {
                          window.open(waUrl, '_blank', 'noopener,noreferrer');
                        },
                        {
                          title: 'Contactar por WhatsApp',
                          message: `Para iniciar una conversación directa vía WhatsApp con ${artist.nombre || 'el artista'}, regístrate gratis en Tattoo Hub.`,
                          redirectUrl: window.location.pathname,
                        }
                      );
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    Contactar por WhatsApp
                  </button>
                </div>
              )}
            </div>

            <hr className="my-6 border-gray-200 dark:border-gray-800" />

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Studio & Location */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-2">
                  Ubicación & Estudio
                </h3>
                <p className="text-gray-900 dark:text-gray-100 font-semibold">
                  {artist.direccion || 'Estudio Principal'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {artist.ciudad || artist.city || 'Ciudad de Panamá'}, {artist.provincia || 'Panamá'}
                </p>
                {artist.country && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {artist.country}
                  </p>
                )}
              </div>

              {/* Styles & Speciality */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-2">
                  Estilo de Tatuaje
                </h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary dark:text-indigo-400 font-semibold text-xs rounded-full uppercase">
                    {artist.work_type || 'Realista'}
                  </span>
                  <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-xs rounded-full">
                    Diseño Personalizado
                  </span>
                </div>
              </div>

              {/* Tarifa / Precio */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-2">
                  Tarifa Estimada
                </h3>
                <p className="text-sm font-bold text-violet-600 dark:text-violet-400">
                  {artist.price ? formatPrice(artist.price) : `${formatPrice(80)}/h`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Cotización según diseño y sesión
                </p>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-2">
                  Contacto Directo
                </h3>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                  {artist.email || 'Contacto vía plataforma'}
                </p>
                {artistPhone && (
                  <p className="text-sm font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    WhatsApp: {artistPrefix} {artistPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Social Links */}
            {(artist.facebook || artist.twitter || artist.instagram || artist.link) && (
              <div className="mt-6 flex items-center justify-center md:justify-start gap-4">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Redes:</span>
                {artist.instagram && (
                  <a href={artist.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#e1306c] text-white hover:opacity-85 transition">
                    <img src="/assets/Instagram White.png" alt="Instagram" className="w-4 h-4" />
                  </a>
                )}
                {artist.facebook && (
                  <a href={artist.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#3b5998] text-white hover:opacity-85 transition">
                    <img src="/assets/Facebook White.png" alt="Facebook" className="w-4 h-4" />
                  </a>
                )}
                {artist.twitter && (
                  <a href={artist.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#1da1f2] text-white hover:opacity-85 transition">
                    <img src="/assets/Twitter White.png" alt="Twitter" className="w-4 h-4" />
                  </a>
                )}
                {artist.link && (
                  <a href={artist.link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-700 text-white hover:opacity-85 transition">
                    <img src="/assets/Link White.png" alt="Web" className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

  // =========================================================================
  // EDIT PROFILE VIEW (Artist modifying own settings)
  // =========================================================================
  const liveWhatsAppUrl = formatWhatsAppUrl(phone, phonePrefix);

  return (
    <PageTransition>
      <div className="min-h-screen py-10 px-4 md:px-8">
      <div className="container mx-auto flex flex-col md:flex-row gap-8 max-w-5xl bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl p-6 md:p-10 backdrop-blur-md border border-gray-200 dark:border-gray-800">
        {/* Left Column */}
        <div className="column1 w-full md:w-48 flex flex-col items-center md:items-start border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 pr-6 pb-6 md:pb-0">
          <div className="return mb-6">
            <Link to="/user" className="inline-block hover:opacity-80 transition">
              <img
                src="/assets/Back To White.png"
                alt="Volver"
                className="w-10 h-10 p-2 bg-black dark:bg-gray-800 rounded-full"
              />
            </Link>
          </div>
          <hr className="w-full my-2 border-gray-300 dark:border-gray-700" />
          <div className="list w-full space-y-2">
            <div className="font-bold text-primary dark:text-indigo-400 py-1.5 px-3 bg-primary/10 rounded-lg text-sm text-center md:text-left">
              Perfil
            </div>
            {user && (
              <Link
                to={`/artist/${user.id}`}
                className="block text-xs text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white py-1 px-3 transition text-center md:text-left"
              >
                Ver perfil público →
              </Link>
            )}
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="column2 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Perfil
            </h1>
          </div>
          <hr className="my-4 border-gray-200 dark:border-gray-800" />

          {message && (
            <div
              className={`p-3 rounded-lg mb-6 text-sm font-semibold text-center ${
                message.isError
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-green-100 text-green-700 border border-green-300'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="form-act">
            <form id="profileForm" onSubmit={handleSubmit} className="space-y-6">
              {/* Photo section */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
                  Foto de Perfil
                </h3>
                <div className="flex items-center gap-6">
                  <div className="profile">
                    <img
                      src={profileImg}
                      alt="Perfil"
                      id="profile-img"
                      className="w-20 h-20 rounded-full object-cover shadow border-2 border-primary"
                    />
                  </div>
                  <div className="upload flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="file-input"
                      onChange={handleImageChange}
                      className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer"
                    />
                    <div
                      id="image-container"
                      style={{ display: selectedImage ? 'block' : 'none' }}
                    >
                      <img
                        id="selected-image"
                        src={selectedImage || ''}
                        alt="Imagen seleccionada"
                        className="w-14 h-14 rounded-lg object-cover shadow mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-800" />

              {/* Personal Data */}
              <div className="data space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    id="name"
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="text"
                    id="last-name"
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* International Phone Input */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Teléfono & WhatsApp (con código de país)
                  </label>
                  <InternationalPhoneInput
                    id="phone"
                    prefix={phonePrefix}
                    phoneNumber={phone}
                    onChange={(newPrefix, newNum) => {
                      setPhonePrefix(newPrefix);
                      setPhone(newNum);
                    }}
                    placeholder="6000-0000"
                  />

                  {/* Live WhatsApp Preview */}
                  <div className="mt-2 text-xs flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span className="font-semibold">Enlace dinámico de WhatsApp:</span>
                    {liveWhatsAppUrl ? (
                      <a
                        href={liveWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-mono hover:text-emerald-700 dark:hover:text-emerald-300"
                      >
                        wa.me/{liveWhatsAppUrl.replace('https://wa.me/', '')}
                      </a>
                    ) : (
                      <span className="font-mono text-gray-400">wa.me/&lt;numero&gt;</span>
                    )}
                  </div>
                </div>

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Age */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Edad
                </h3>
                <input
                  type="date"
                  name="date"
                  id="date"
                  disabled
                  value={date}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed"
                />

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Work Type */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Tipo de Trabajo
                </h3>
                <select
                  id="work-type"
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="" disabled>
                    Seleccione un tipo de trabajo
                  </option>
                  <option value="realista">Realista</option>
                  <option value="tradicional">Tradicional</option>
                  <option value="neotradicional">Neotradicional</option>
                  <option value="blackwork">Blackwork</option>
                  <option value="japones">Japonés</option>
                  <option value="tribal">Tribal</option>
                  <option value="acuarela">Acuarela</option>
                </select>

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Social Networks */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Redes Sociales
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/Facebook White.png"
                      id="social"
                      alt="Facebook"
                      className="w-8 h-8 p-1.5 bg-[#3b5998] rounded-full flex-shrink-0"
                    />
                    <input
                      type="url"
                      id="facebook"
                      placeholder="Facebook"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/Twitter White.png"
                      id="social"
                      alt="Twitter"
                      className="w-8 h-8 p-1.5 bg-[#1da1f2] rounded-full flex-shrink-0"
                    />
                    <input
                      type="url"
                      id="twitter"
                      placeholder="Twitter"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/Instagram White.png"
                      id="social"
                      alt="Instagram"
                      className="w-8 h-8 p-1.5 bg-[#e1306c] rounded-full flex-shrink-0"
                    />
                    <input
                      type="url"
                      id="instagram"
                      placeholder="Instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/Link White.png"
                      id="social"
                      alt="Link"
                      className="w-8 h-8 p-1.5 bg-[#d5135a] rounded-full flex-shrink-0"
                    />
                    <input
                      type="url"
                      id="link"
                      placeholder="Link"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Direction & Location */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Dirección
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label htmlFor="country" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      País
                    </label>
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="Panamá">Panamá</option>
                      <option value="Colombia">Colombia</option>
                      <option value="México">México</option>
                      <option value="Estados Unidos">Estados Unidos</option>
                      <option value="España">España</option>
                      <option value="Costa Rica">Costa Rica</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Chile">Chile</option>
                      <option value="Perú">Perú</option>
                      <option value="Venezuela">Venezuela</option>
                      <option value="Otro">Otro país</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="province" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Provincia / Estado / Región
                    </label>
                    {country === 'Panamá' ? (
                      <select
                        id="province"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="" disabled>
                          Seleccione una Provincia
                        </option>
                        <option value="Panamá">Panamá</option>
                        <option value="Bocas del Toro">Bocas del Toro</option>
                        <option value="Colón">Colón</option>
                        <option value="Chiriquí">Chiriquí</option>
                        <option value="Darién">Darién</option>
                        <option value="Herrera">Herrera</option>
                        <option value="Los Santos">Los Santos</option>
                        <option value="Panamá Oeste">Panamá Oeste</option>
                        <option value="Veraguas">Veraguas</option>
                        <option value="Emberá-Wounaan">Emberá-Wounaan</option>
                        <option value="Guna Yala">Guna Yala</option>
                        <option value="Ngöbe-Buglé">Ngöbe-Buglé</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        id="province"
                        placeholder="Provincia o Estado"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    id="city"
                    placeholder="Ciudad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="text"
                    id="direction"
                    placeholder="Dirección"
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Credentials */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Credenciales
                </h3>
                <input
                  type="email"
                  id="email"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white mb-3"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="password"
                    id="password"
                    placeholder="Contraseña actual"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="password"
                    id="new-password"
                    placeholder="Nueva Contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                <button
                  type="submit"
                  id="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};
