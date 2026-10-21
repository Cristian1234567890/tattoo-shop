import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Palette,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  Tag,
  Clock,
  Compass,
  DollarSign,
  Check,
} from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../api/client';
import { InteractiveCard } from '../components/creditcard/InteractiveCard';

const STYLES_LIST = [
  'Realismo',
  'Blackwork',
  'Tradicional',
  'Neotradicional',
  'Fineline',
  'Geométrico',
  'Acuarela',
  'Japonés / Irezumi',
  'Anime / Manga',
  'Puntillismo',
  'Lettering',
  'Micro-realismo',
];

export const BecomeArtistPage: React.FC = () => {
  const { user, updateUserMetadata, refreshProfile } = useAuth();
  const { formatPrice } = useCurrency();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Artist profile info
  const [artistName, setArtistName] = useState(
    user?.user_metadata?.nombre || user?.user_metadata?.full_name || ''
  );
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Blackwork', 'Fineline']);
  const [experienceYears, setExperienceYears] = useState('3');
  const [phone, setPhone] = useState(user?.user_metadata?.telefono || '');
  const [studioName, setStudioName] = useState('');
  const [city, setCity] = useState(user?.user_metadata?.ciudad || 'Ciudad de Panamá');
  const [bio, setBio] = useState('');

  React.useEffect(() => {
    if (user?.user_metadata) {
      const name = (user.user_metadata.nombre || user.user_metadata.full_name || '') as string;
      if (!artistName && name) {
        setArtistName(name);
      }
      const ph = (user.user_metadata.telefono || user.user_metadata.phone_number || '') as string;
      if (!phone && ph) {
        setPhone(ph);
      }
    }
  }, [user, artistName, phone]);

  // Step 2: Plan and billing cycle
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const basePrice = billingCycle === 'annual' ? 3.99 : 4.99;
  const discountedPrice =
    couponDiscount > 0
      ? Math.max(0, Number((basePrice * (1 - couponDiscount / 100)).toFixed(2)))
      : basePrice;

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponMsg(null);
    try {
      const res = await api.validateCoupon(couponCode.trim(), 'subscription');
      if (res.success && res.data) {
        const discount = res.data.discount_percentage || 15;
        setCouponDiscount(discount);
        setCouponMsg({
          type: 'success',
          text: `¡Cupón ${res.data.code} aplicado! -${discount}% de descuento.`,
        });
      } else {
        const code = couponCode.trim().toUpperCase();
        if (code === 'VIP50') {
          setCouponDiscount(50);
          setCouponMsg({ type: 'success', text: '¡Cupón VIP50 aplicado! -50% de descuento.' });
        } else if (code === 'TATTOO10' || code === 'TATTOOHUB') {
          setCouponDiscount(15);
          setCouponMsg({ type: 'success', text: '¡Cupón aplicado! -15% de descuento.' });
        } else {
          setCouponDiscount(0);
          setCouponMsg({ type: 'error', text: 'Código de cupón inválido o expirado.' });
        }
      }
    } catch {
      const code = couponCode.trim().toUpperCase();
      if (code === 'VIP50') {
        setCouponDiscount(50);
        setCouponMsg({ type: 'success', text: '¡Cupón VIP50 aplicado! -50% de descuento.' });
      } else {
        setCouponDiscount(0);
        setCouponMsg({ type: 'error', text: 'Código de cupón inválido o expirado.' });
      }
    }
  };

  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!artistName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre artístico profesional.');
      return;
    }
    if (selectedStyles.length === 0) {
      setErrorMsg('Selecciona al menos un estilo de tatuaje representativo.');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToStep3 = () => {
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCardSuccess = async (cardData: any) => {
    setIsUpgrading(true);
    try {
      // Save artist details and upgrade role in user_metadata
      await api.completeOnboarding({
        role: 'Tatuador',
        legal_accepted: true,
        full_name: artistName,
        phone_number: phone,
      }).catch(() => {});

      updateUserMetadata({
        tipo: 'Tatuador',
        role: 'Tatuador',
        nombre: artistName,
        full_name: artistName,
        telefono: phone,
        ciudad: city,
        work_type: selectedStyles.join(', '),
        has_active_subscription: true,
        subscription_status: 'active',
        cancel_at_period_end: false,
        current_period_end: cardData?.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (refreshProfile) {
        await refreshProfile().catch(() => {});
      }

      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error completing artist upgrade:', err);
      setErrorMsg(err.message || 'Error finalizando el alta.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen text-slate-800 dark:text-zinc-300 font-sans flex flex-col selection:bg-violet-500/30">
        {/* Hero Section */}
        <div className="relative py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60 dark:border-white/5 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-600/10 text-violet-600 dark:text-violet-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Programa de Artistas &amp; Estudios • Tattoo Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 font-heading">
              Únete como Tatuador o Abre tu Estudio
            </h1>
            <p className="text-slate-600 dark:text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Consigue visibilidad geolocalizada en el mapa de Tattoo Hub, drops de flash ilimitados y contacto directo con coleccionistas con <strong className="text-slate-900 dark:text-white">0% de comisiones</strong>.
            </p>

            {/* Stepper Progress Bar */}
            <div className="max-w-2xl mx-auto mt-10">
              <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
                {[
                  { num: 1, title: 'Perfil Artístico' },
                  { num: 2, title: 'Plan & Cupón' },
                  { num: 3, title: 'Afiliación Tarjeta' },
                  { num: 4, title: 'Bienvenido' },
                ].map((s) => (
                  <div key={s.num} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step === s.num
                          ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 ring-4 ring-violet-500/20'
                          : step > s.num
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500'
                      }`}
                    >
                      {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                    </div>
                    <span
                      className={`text-[11px] font-semibold hidden sm:inline ${
                        step === s.num
                          ? 'text-violet-600 dark:text-violet-400'
                          : step > s.num
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 dark:text-zinc-500'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Grid Highlights */}
        {step < 4 && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5 shadow-sm text-left">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-2">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">0% de Comisiones</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Todo lo que cobras por tus tatuajes o piezas es 100% tuyo sin retenciones.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5 shadow-sm text-left">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pin en el Hub</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Tu estudio o silla independiente aparece visible para clientes en tu ciudad.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5 shadow-sm text-left">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Flash Books</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Publica tus diseños exclusivos con apartados directos por WhatsApp y Chat.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5 shadow-sm text-left">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">30 Días de Prueba</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Acceso completo inmediato. Cancela antes de tu fecha sin cargos retenidos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-6 w-full mb-16">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Artist Form */}
          {step === 1 && (
            <div className="atelier-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950/90 shadow-xl text-slate-900 dark:text-white">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
                <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading">Cuéntanos sobre tu Arte y Trayectoria</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Esta información nutrirá tu perfil público en el catálogo de Tattoo Hub.
                  </p>
                </div>
              </div>

              <form onSubmit={handleProceedToStep2} className="space-y-6">
                <div>
                  <label htmlFor="artist-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                    Nombre Artístico o de Estudio *
                  </label>
                  <input
                    id="artist-name-input"
                    type="text"
                    required
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Ej. Void Ink Studio, Valentina Bones..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="artist-phone-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                      Teléfono WhatsApp de Contacto
                    </label>
                    <input
                      id="artist-phone-input"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+507 6000-0000"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="artist-city-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                      Ciudad y País
                    </label>
                    <input
                      id="artist-city-input"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ciudad de Panamá, Panamá"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      Estilos Principales que Dominas *
                    </label>
                    <span className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold">
                      {selectedStyles.length} seleccionados
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STYLES_LIST.map((style) => {
                      const isSel = selectedStyles.includes(style);
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => toggleStyle(style)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSel
                              ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20 border border-violet-400/40'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700'
                          }`}
                        >
                          {style}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="artist-exp-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                      Años de Experiencia
                    </label>
                    <input
                      id="artist-exp-input"
                      type="number"
                      min="1"
                      max="40"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="artist-studio-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                      Estudio Base (o "Independiente")
                    </label>
                    <input
                      id="artist-studio-input"
                      type="text"
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      placeholder="Obsidian Atelier, Privado..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="artist-bio-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                    Bio Breve / Propuesta Estética
                  </label>
                  <textarea
                    id="artist-bio-input"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Cuéntale a tus futuros clientes sobre tu técnica, máquinas preferidas y cómo preparas cada sesión..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none placeholder-slate-400 dark:placeholder-zinc-500"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-white/5">
                  <button
                    type="submit"
                    id="btn-next-step-1"
                    className="px-6 py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition transform hover:scale-[1.01] flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continuar a Selección de Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Plan Selection & Promo Coupon */}
          {step === 2 && (
            <div className="atelier-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950/90 shadow-xl text-slate-900 dark:text-white">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
                <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading">Plan Estudio Profesional</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Incluye 30 días de prueba gratuita. Cancela en cualquier momento sin penalizaciones.
                  </p>
                </div>
              </div>

              {/* Billing Cycle Picker */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex p-1.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full shadow-inner">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      billingCycle === 'monthly'
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Facturación Mensual
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      billingCycle === 'annual'
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Facturación Anual
                    <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold border border-emerald-500/30">
                      -20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plan Card Display */}
              <div className="p-6 rounded-2xl border-2 border-violet-500/40 bg-violet-50/50 dark:bg-violet-950/20 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Estudios &amp; Artistas Pro
                  </span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    30 Días Gratis
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  {couponDiscount > 0 && (
                    <span className="text-lg line-through text-slate-400">
                      {formatPrice(basePrice)}
                    </span>
                  )}
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {formatPrice(discountedPrice)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-500">/mes</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed mb-4">
                  Activa tu catálogo, pin en el mapa geolocalizado, flash drops y botón de WhatsApp directo. Primeros 30 días garantizados sin costo al afiliar tu tarjeta.
                </p>

                <div className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>0% comisión sobre todas tus sesiones y citas pactadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Subida ilimitada de flashes y fotos de trabajos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Gestión de agenda y citas privadas con recordatorios</span>
                  </div>
                </div>
              </div>

              {/* Coupon Redemption */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 mb-6">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  <Tag className="w-4 h-4" />
                  <span>¿Tienes un cupón de descuento?</span>
                </div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Ej. VIP50, TATTOOHUB"
                    className="flex-1 px-3.5 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </form>
                {couponMsg && (
                  <div
                    className={`mt-2.5 text-xs font-medium px-3 py-1.5 rounded-lg ${
                      couponMsg.type === 'success'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {couponMsg.text}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a Datos</span>
                </button>
                <button
                  type="button"
                  id="btn-next-step-2"
                  onClick={handleProceedToStep3}
                  className="px-6 py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition transform hover:scale-[1.01] flex items-center gap-2 cursor-pointer"
                >
                  <span>Afiliar Tarjeta para 30 Días Gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Native Card Vault Affiliation */}
          {step === 3 && (
            <div className="atelier-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950/90 shadow-xl text-slate-900 dark:text-white">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
                <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading">Afiliación Nativa de Tarjeta</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Tus primeros 30 días son 100% gratuitos. Si cancelas antes de tu fecha, mantendrás tus 30 días completos.
                  </p>
                </div>
              </div>

              {/* Embedded Interactive Card Component */}
              <InteractiveCard
                isEmbedded={true}
                targetRole="Tatuador"
                planType="studio"
                billingCycle={billingCycle}
                buttonLabel="Confirmar Afiliación &amp; Activar Cuenta Pro"
                onSuccess={handleCardSuccess}
              />

              {isUpgrading && (
                <div className="mt-4 p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-center text-xs font-semibold text-violet-600 dark:text-violet-400 animate-pulse">
                  Configurando y activando tu cuenta de artista en Tattoo Hub...
                </div>
              )}

              <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a Planes</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation & Next Steps */}
          {step === 4 && (
            <div className="atelier-card p-8 sm:p-12 rounded-3xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-zinc-950/90 shadow-2xl text-center text-slate-900 dark:text-white">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                ¡Alta Exitosa en Tattoo Hub!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 mb-2 font-heading">
                ¡Bienvenido a la Comunidad, {artistName}! 🎨
              </h2>
              <p className="text-slate-600 dark:text-zinc-300 text-sm max-w-lg mx-auto leading-relaxed mb-6 font-body">
                Tu perfil de Tatuador ha sido configurado y tu tarjeta ha quedado afiliada con 30 días de beneficios completos. Tu portafolio y catálogo ya están listos para ser descubiertos en el mapa oficial.
              </p>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left text-xs space-y-2 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Rol activo:</span>
                  <strong className="text-violet-600 dark:text-violet-400 font-bold">Tatuador Profesional</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Período de prueba:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">30 Días Activos</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Comisiones:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">0% Directo</strong>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/artist-dashboard"
                  id="btn-go-to-artist-dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition transform hover:scale-[1.02] cursor-pointer"
                >
                  Ir a Mi Panel de Tatuador &rarr;
                </Link>
                <Link
                  to="/hub"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 transition cursor-pointer"
                >
                  Ver Mapa de Estudios
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default BecomeArtistPage;
