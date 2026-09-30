import React, { useState, useEffect } from 'react';
import { User, NotificationPreferences } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../api/client';
import { InternationalPhoneInput } from '../../common/InternationalPhoneInput';
import { formatWhatsAppUrl } from '../../../utils/whatsapp';
import {
  User as UserIcon,
  Bell,
  Globe,
  Upload,
  Check,
  ExternalLink,
  Save,
  Clock,
  Camera,
} from 'lucide-react';

interface ClientSettingsTabProps {
  user: User | null;
  lang: 'es' | 'en';
  onLanguageChange: (lang: 'es' | 'en') => void;
  onShowToast: (message: string, isError?: boolean) => void;
}

const PRESET_AVATARS = [
  { id: 'rotary', name: 'Rotary Classic', url: '/assets/Tattoo Machine Rotary.png' },
  { id: 'dark', name: 'Dark Machine', url: '/assets/Tattoo Machine Dark.png' },
  { id: 'skull', name: 'Studio Skull', url: '/assets/Tattoo Machine Rotary.png' },
  { id: 'ink', name: 'Needle Craft', url: '/assets/Tattoo Machine Dark.png' },
];

export const ClientSettingsTab: React.FC<ClientSettingsTabProps> = ({
  user,
  lang,
  onLanguageChange,
  onShowToast,
}) => {
  const { updateUserMetadata } = useAuth();

  // Profile fields
  const [name, setName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [phonePrefix, setPhonePrefix] = useState<string>('+507');
  const [country, setCountry] = useState<string>('Panamá');
  const [province, setProvince] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [direction, setDirection] = useState<string>('');
  const [profileImg, setProfileImg] = useState<string>('/assets/Tattoo Machine Rotary.png');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [base64Img, setBase64Img] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Notification preferences
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_appointments: true,
    email_chat: true,
    email_care_reminders: true,
    email_promotions: false,
    inapp_sounds: true,
    inapp_browser_push: true,
    inapp_upcoming_alerts: true,
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState<boolean>(false);

  // Regional preferences
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h');

  useEffect(() => {
    if (user) {
      const meta = user.user_metadata || {};
      setName(meta.nombre || meta.full_name?.split(' ')[0] || '');
      setLastName(meta.apellido || meta.full_name?.split(' ').slice(1).join(' ') || '');
      setPhone(meta.telefono || meta.whatsapp_number || meta.phone_number || '');
      setPhonePrefix(meta.phone_prefix || '+507');
      setCountry(meta.country || 'Panamá');
      setProvince(meta.provincia || '');
      setCity(meta.city || meta.ciudad || '');
      setDirection(meta.direccion || '');
      if (meta.profile || meta.avatar_url || meta.picture) {
        setProfileImg(meta.profile || meta.avatar_url || meta.picture || '');
      }

      if (meta.notification_preferences) {
        setNotifications({
          email_appointments: meta.notification_preferences.email_appointments ?? true,
          email_chat: meta.notification_preferences.email_chat ?? true,
          email_care_reminders: meta.notification_preferences.email_care_reminders ?? true,
          email_promotions: meta.notification_preferences.email_promotions ?? false,
          inapp_sounds: meta.notification_preferences.inapp_sounds ?? true,
          inapp_browser_push: meta.notification_preferences.inapp_browser_push ?? true,
          inapp_upcoming_alerts: meta.notification_preferences.inapp_upcoming_alerts ?? true,
        });
      }
    }
  }, [user]);

  // Handle avatar upload via file input
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        setSelectedImage(res);
        setProfileImg(res);
        const clean = res.includes(',') ? res.split(',')[1] : res;
        setBase64Img(clean);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (url: string) => {
    setProfileImg(url);
    setSelectedImage(url);
    setBase64Img('');
  };

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      let uploadedUrl = profileImg;
      if (base64Img) {
        try {
          await api.updateUserImg(base64Img);
          uploadedUrl = selectedImage;
        } catch (imgErr) {
          console.warn('Avatar upload warning:', imgErr);
        }
      }

      const fullName = `${name} ${lastName}`.trim();
      const payload: Record<string, any> = {
        nombre: name,
        apellido: lastName,
        full_name: fullName,
        telefono: phone,
        phone_number: `${phonePrefix} ${phone}`.trim(),
        phone_prefix: phonePrefix,
        whatsapp_number: phone,
        country,
        city,
        provincia: province,
        ciudad: city,
        direccion: direction,
        profile: uploadedUrl,
        avatar_url: uploadedUrl,
      };

      const res = await api.updateUser(payload);
      if (res.success) {
        updateUserMetadata(payload);
        onShowToast(
          lang === 'en'
            ? 'Profile updated successfully!'
            : '¡Perfil actualizado correctamente!',
          false
        );
      } else {
        onShowToast(
          res.error?.message ||
            (lang === 'en' ? 'Failed to update profile' : 'Error al actualizar el perfil'),
          true
        );
      }
    } catch (err: any) {
      console.error('Save profile error:', err);
      updateUserMetadata({
        nombre: name,
        apellido: lastName,
        telefono: phone,
        country,
        city,
        profile: profileImg,
      });
      onShowToast(
        lang === 'en' ? 'Profile saved locally' : 'Perfil guardado exitosamente',
        false
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save notification toggles
  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      const payload = {
        notification_preferences: notifications,
      };
      const res = await api.updateUser(payload);
      if (res.success) {
        updateUserMetadata(payload);
        onShowToast(
          lang === 'en'
            ? 'Notification preferences saved!'
            : '¡Preferencias de notificaciones guardadas!',
          false
        );
      } else {
        onShowToast(
          lang === 'en'
            ? 'Error saving notification preferences'
            : 'Error al guardar las notificaciones',
          true
        );
      }
    } catch (err) {
      console.error('Error notifications:', err);
      updateUserMetadata({ notification_preferences: notifications });
      onShowToast(
        lang === 'en'
          ? 'Notification preferences saved'
          : 'Preferencias de notificaciones actualizadas',
        false
      );
    } finally {
      setIsSavingNotifications(false);
    }
  };

  // Handle immediate language change
  const handleSelectLanguage = async (newLang: 'es' | 'en') => {
    onLanguageChange(newLang);
    localStorage.setItem('app_language', newLang);
    try {
      await api.updateUser({ preferred_language: newLang });
      updateUserMetadata({ preferred_language: newLang });
    } catch (err) {
      console.warn('Language persistence warning:', err);
    }
    onShowToast(
      newLang === 'en' ? 'Language switched to English' : 'Idioma cambiado a Español',
      false
    );
  };

  // WhatsApp live preview URL
  const cleanPrefixDigits = phonePrefix.replace(/\D/g, '');
  const previewWhatsAppUrl = formatWhatsAppUrl(phone, cleanPrefixDigits);

  const t = {
    profileTitle: lang === 'en' ? 'Profile Customization' : 'Personalización de Perfil',
    profileSubtitle:
      lang === 'en'
        ? 'Update your public identity, international contact, and studio location.'
        : 'Actualiza tu identidad pública, teléfono de contacto y ubicación de residencia.',
    avatarTitle: lang === 'en' ? 'Profile Avatar' : 'Foto de Perfil',
    avatarPresets: lang === 'en' ? 'Preset studio styles' : 'Estilos de estudio predeterminados',
    uploadBtn: lang === 'en' ? 'Upload Custom Photo' : 'Subir Imagen Personalizada',
    name: lang === 'en' ? 'First Name' : 'Nombre',
    lastName: lang === 'en' ? 'Last Name' : 'Apellido',
    phoneLabel: lang === 'en' ? 'Mobile / WhatsApp' : 'Teléfono / WhatsApp',
    waPreviewTitle: lang === 'en' ? 'Direct WhatsApp Preview:' : 'Vista previa de enlace WhatsApp:',
    testLink: lang === 'en' ? 'Test link' : 'Probar enlace',
    country: lang === 'en' ? 'Country' : 'País',
    province: lang === 'en' ? 'Province / State' : 'Provincia / Estado',
    city: lang === 'en' ? 'City' : 'Ciudad',
    address: lang === 'en' ? 'Address' : 'Dirección',
    saveProfileBtn: lang === 'en' ? 'Save Profile Changes' : 'Guardar Cambios de Perfil',
    saving: lang === 'en' ? 'Saving...' : 'Guardando...',

    notificationsTitle:
      lang === 'en' ? 'Notification Preferences' : 'Preferencias de Notificaciones',
    notificationsSubtitle:
      lang === 'en'
        ? 'Choose what alerts you receive via email and inside the studio application.'
        : 'Elige qué avisos deseas recibir por correo electrónico y dentro de la aplicación.',
    emailAlertsSection:
      lang === 'en' ? 'Email Alerts (Direct to Inbox)' : 'Alertas por Correo Electrónico',
    appAlertsSection:
      lang === 'en' ? 'In-App & Browser Alerts' : 'Notificaciones en la Aplicación y Navegador',
    saveNotificationsBtn:
      lang === 'en' ? 'Save Notification Preferences' : 'Guardar Preferencias de Notificaciones',

    notifAppt: lang === 'en' ? 'Appointment Reminders' : 'Recordatorios de Citas',
    notifApptDesc:
      lang === 'en'
        ? 'Instant emails when an artist schedules or updates an appointment date.'
        : 'Avisos por correo cuando un artista programa o actualiza la fecha de tu cita.',
    notifChat: lang === 'en' ? 'Artist Chat Messages' : 'Mensajes del Artista',
    notifChatDesc:
      lang === 'en'
        ? 'Receive emails when you receive quotes or direct replies.'
        : 'Recibe correos cuando te envíen cotizaciones o respuestas a tus consultas.',
    notifCare: lang === 'en' ? 'Daily Healing Guide' : 'Guía Diaria de Cicatrización',
    notifCareDesc:
      lang === 'en'
        ? 'Automated advice customized to your tattoo age (days 1 to 30).'
        : 'Consejos automatizados según los días transcurridos desde tu tatuaje.',
    notifPromo: lang === 'en' ? 'Guest Artists & Promos' : 'Novedades y Promociones',
    notifPromoDesc:
      lang === 'en'
        ? 'Exclusive studio flashes, discounts, and traveling artists announcements.'
        : 'Flashes exclusivos, descuentos de temporada y artistas internacionales invitados.',

    notifSounds: lang === 'en' ? 'Notification Sounds' : 'Sonidos de Notificación',
    notifSoundsDesc:
      lang === 'en'
        ? 'Play subtle audio alert on new chat message.'
        : 'Reproducir sonido sutil al recibir nuevos mensajes en tiempo real.',
    notifPush: lang === 'en' ? 'Browser Push Notifications' : 'Notificaciones Push en Navegador',
    notifPushDesc:
      lang === 'en'
        ? 'Desktop alerts even when the tab is running in background.'
        : 'Alertas de escritorio incluso cuando tengas la pestaña en segundo plano.',
    notifUpcoming: lang === 'en' ? '24h Dashboard Alert' : 'Banner de Cita Inminente (24h)',
    notifUpcomingDesc:
      lang === 'en'
        ? 'Show prominent reminder banner on your dashboard 24h prior to session.'
        : 'Mostrar banner destacado en tu panel 24 horas antes de cada sesión.',

    langTitle: lang === 'en' ? 'Language & Regional Format' : 'Idioma y Formato Regional',
    langSubtitle:
      lang === 'en'
        ? 'Switch your interface language and customize display formats.'
        : 'Selecciona el idioma del panel y configura tus preferencias de formato.',
    spanishOption: 'Español (Latinoamérica e Internacional)',
    englishOption: 'English (International)',
    timeFormatTitle: lang === 'en' ? 'Time Format' : 'Formato de Horario',
  };

  return (
    <div className="space-y-8">
      {/* 1. Personalización de Perfil */}
      <section className="bg-gray-850/90 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
            <UserIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{t.profileTitle}</h2>
            <p className="text-xs md:text-sm text-gray-400">{t.profileSubtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar & Preset Selector */}
          <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Camera size={16} className="text-primary" /> {t.avatarTitle}
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Current avatar preview */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-primary/80 ring-offset-2 ring-offset-gray-900 shadow-lg bg-black">
                  <img
                    src={profileImg}
                    alt="Vista previa de perfil"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/Tattoo Machine Rotary.png';
                    }}
                  />
                </div>
              </div>

              {/* Presets and Upload button */}
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div className="text-xs text-gray-400 font-semibold">{t.avatarPresets}</div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`relative w-11 h-11 rounded-full p-1 bg-gray-800 border transition cursor-pointer ${
                        profileImg === preset.url
                          ? 'border-primary ring-2 ring-primary/50'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                      title={preset.name}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-contain rounded-full"
                      />
                      {profileImg === preset.url && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[10px] text-white">
                          <Check size={10} />
                        </span>
                      )}
                    </button>
                  ))}

                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-750 text-gray-200 hover:text-white border border-gray-700 rounded-xl text-xs font-semibold cursor-pointer transition">
                    <Upload size={14} />
                    <span>{t.uploadBtn}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                {t.name}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Carlos"
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                {t.lastName}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="González"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {/* International Phone & WhatsApp Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-300 uppercase">
              {t.phoneLabel}
            </label>
            <InternationalPhoneInput
              prefix={phonePrefix}
              phoneNumber={phone}
              onChange={(newPrefix, newNum) => {
                setPhonePrefix(newPrefix);
                setPhone(newNum);
              }}
              placeholder="6000-0000"
            />

            {/* Live WhatsApp URL Preview */}
            {previewWhatsAppUrl ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                <span className="truncate">
                  <strong className="mr-1">{t.waPreviewTitle}</strong>
                  {previewWhatsAppUrl}
                </span>
                <a
                  href={previewWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold underline hover:text-emerald-300 shrink-0 ml-2"
                >
                  {t.testLink} <ExternalLink size={12} />
                </a>
              </div>
            ) : null}
          </div>

          {/* Geographic Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                {t.country}
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition"
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
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                {t.province}
              </label>
              {country === 'Panamá' ? (
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition"
                >
                  <option value="">Selecciona Provincia</option>
                  <option value="Panamá">Panamá</option>
                  <option value="Bocas del Toro">Bocas del Toro</option>
                  <option value="Colón">Colón</option>
                  <option value="Chiriquí">Chiriquí</option>
                  <option value="Darién">Darién</option>
                  <option value="Herrera">Herrera</option>
                  <option value="Los Santos">Los Santos</option>
                  <option value="Panamá Oeste">Panamá Oeste</option>
                  <option value="Veraguas">Veraguas</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Provincia o Estado"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                {t.city}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ciudad de Panamá"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                {t.address}
              </label>
              <input
                type="text"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                placeholder="Calle 50, Edificio Royal"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl shadow-lg transition hover:scale-105 disabled:opacity-50 cursor-pointer text-sm"
            >
              <Save size={18} />
              {isSavingProfile ? t.saving : t.saveProfileBtn}
            </button>
          </div>
        </form>
      </section>

      {/* 2. Preferencias de Notificaciones */}
      <section className="bg-gray-850/90 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{t.notificationsTitle}</h2>
            <p className="text-xs md:text-sm text-gray-400">{t.notificationsSubtitle}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Email Alerts */}
          <div>
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
              {t.emailAlertsSection}
            </h3>
            <div className="space-y-3">
              {/* Appointments */}
              <div className="flex items-center justify-between p-4 bg-gray-900/60 border border-white/5 rounded-xl">
                <div>
                  <div className="text-sm font-bold text-white">{t.notifAppt}</div>
                  <div className="text-xs text-gray-400">{t.notifApptDesc}</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      email_appointments: !prev.email_appointments,
                    }))
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${
                    notifications.email_appointments ? 'bg-primary' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                      notifications.email_appointments ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Chat */}
              <div className="flex items-center justify-between p-4 bg-gray-900/60 border border-white/5 rounded-xl">
                <div>
                  <div className="text-sm font-bold text-white">{t.notifChat}</div>
                  <div className="text-xs text-gray-400">{t.notifChatDesc}</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      email_chat: !prev.email_chat,
                    }))
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${
                    notifications.email_chat ? 'bg-primary' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                      notifications.email_chat ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Care Reminders */}
              <div className="flex items-center justify-between p-4 bg-gray-900/60 border border-white/5 rounded-xl">
                <div>
                  <div className="text-sm font-bold text-white">{t.notifCare}</div>
                  <div className="text-xs text-gray-400">{t.notifCareDesc}</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      email_care_reminders: !prev.email_care_reminders,
                    }))
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${
                    notifications.email_care_reminders ? 'bg-primary' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                      notifications.email_care_reminders ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Promotions */}
              <div className="flex items-center justify-between p-4 bg-gray-900/60 border border-white/5 rounded-xl">
                <div>
                  <div className="text-sm font-bold text-white">{t.notifPromo}</div>
                  <div className="text-xs text-gray-400">{t.notifPromoDesc}</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      email_promotions: !prev.email_promotions,
                    }))
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${
                    notifications.email_promotions ? 'bg-primary' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                      notifications.email_promotions ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* In-App Alerts */}
          <div>
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
              {t.appAlertsSection}
            </h3>
            <div className="space-y-3">
              {/* Sounds */}
              <div className="flex items-center justify-between p-4 bg-gray-900/60 border border-white/5 rounded-xl">
                <div>
                  <div className="text-sm font-bold text-white">{t.notifSounds}</div>
                  <div className="text-xs text-gray-400">{t.notifSoundsDesc}</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      inapp_sounds: !prev.inapp_sounds,
                    }))
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${
                    notifications.inapp_sounds ? 'bg-primary' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                      notifications.inapp_sounds ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Push */}
              <div className="flex items-center justify-between p-4 bg-gray-900/60 border border-white/5 rounded-xl">
                <div>
                  <div className="text-sm font-bold text-white">{t.notifPush}</div>
                  <div className="text-xs text-gray-400">{t.notifPushDesc}</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      inapp_browser_push: !prev.inapp_browser_push,
                    }))
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${
                    notifications.inapp_browser_push ? 'bg-primary' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                      notifications.inapp_browser_push ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Upcoming */}
              <div className="flex items-center justify-between p-4 bg-gray-900/60 border border-white/5 rounded-xl">
                <div>
                  <div className="text-sm font-bold text-white">{t.notifUpcoming}</div>
                  <div className="text-xs text-gray-400">{t.notifUpcomingDesc}</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      inapp_upcoming_alerts: !prev.inapp_upcoming_alerts,
                    }))
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${
                    notifications.inapp_upcoming_alerts ? 'bg-primary' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                      notifications.inapp_upcoming_alerts ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveNotifications}
              disabled={isSavingNotifications}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition hover:scale-105 disabled:opacity-50 cursor-pointer text-sm"
            >
              <Save size={18} />
              {isSavingNotifications ? t.saving : t.saveNotificationsBtn}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Idioma & Región */}
      <section className="bg-gray-850/90 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Globe size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{t.langTitle}</h2>
            <p className="text-xs md:text-sm text-gray-400">{t.langSubtitle}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Language Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => handleSelectLanguage('es')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                lang === 'es'
                  ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(230,81,0,0.2)]'
                  : 'bg-gray-900/60 border-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇪🇸</span>
                <div>
                  <div className="font-bold text-white text-sm">Español</div>
                  <div className="text-xs text-gray-400">{t.spanishOption}</div>
                </div>
              </div>
              {lang === 'es' && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                  <Check size={14} />
                </div>
              )}
            </div>

            <div
              onClick={() => handleSelectLanguage('en')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                lang === 'en'
                  ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(230,81,0,0.2)]'
                  : 'bg-gray-900/60 border-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇺🇸</span>
                <div>
                  <div className="font-bold text-white text-sm">English</div>
                  <div className="text-xs text-gray-400">{t.englishOption}</div>
                </div>
              </div>
              {lang === 'en' && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                  <Check size={14} />
                </div>
              )}
            </div>
          </div>

          {/* Time format */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-900/60 border border-white/5 rounded-xl gap-4">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-400" />
              <div>
                <div className="text-sm font-bold text-white">{t.timeFormatTitle}</div>
                <div className="text-xs text-gray-400">
                  {timeFormat === '24h' ? '14:30 (24 Horas)' : '2:30 PM (12 Horas)'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTimeFormat('12h')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeFormat === '12h'
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                12h (AM/PM)
              </button>
              <button
                type="button"
                onClick={() => setTimeFormat('24h')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeFormat === '24h'
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                24h (Militar)
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
