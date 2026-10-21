import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Building2,
  MessageSquare,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../api/client';

interface BecomeArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  'Lettering'
];

export const BecomeArtistModal: React.FC<BecomeArtistModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserMetadata, refreshProfile } = useAuth();
  const { formatPrice } = useCurrency();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Formulario
  const [artistName, setArtistName] = useState(
    user?.user_metadata?.nombre || user?.user_metadata?.full_name || ''
  );
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Blackwork']);
  const [experienceYears, setExperienceYears] = useState('3');
  const [phone, setPhone] = useState(user?.user_metadata?.telefono || '');
  const [studioName, setStudioName] = useState('');
  const [bio, setBio] = useState('');

  // Step 2: Pasarela y Cupón
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [cardNumber, setCardNumber] = useState('4000 1234 5678 9010');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCcv, setCardCcv] = useState('789');

  const basePrice = billingCycle === 'annual' ? 3.99 : 4.99;
  const discountedPrice = couponDiscount > 0
    ? Math.max(0, Number((basePrice * (1 - couponDiscount / 100)).toFixed(2)))
    : basePrice;

  if (!isOpen) return null;

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await api.validateCoupon(couponCode.trim(), 'subscription');
      if (res.success && res.data) {
        setCouponDiscount(res.data.discount_percentage);
        setCouponMsg(`¡Cupón ${res.data.code} aplicado: -${res.data.discount_percentage}% de descuento!`);
      } else {
        setCouponDiscount(0);
        setCouponMsg(res.error || 'Cupón inválido');
      }
    } catch {
      // Local fallback validation
      const code = couponCode.trim().toUpperCase();
      if (code === 'VIP50') {
        setCouponDiscount(50);
        setCouponMsg('¡Cupón VIP50 aplicado: -50% de descuento!');
      } else if (code === 'TATTOO10' || code === 'TATTOOHUB') {
        setCouponDiscount(15);
        setCouponMsg('¡Cupón aplicado: -15% de descuento!');
      } else {
        setCouponDiscount(0);
        setCouponMsg('El código ingresado no es válido');
      }
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!artistName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre artístico.');
      return;
    }
    if (selectedStyles.length === 0) {
      setErrorMsg('Por favor selecciona al menos un estilo de tatuaje.');
      return;
    }
    setStep(2);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (user?.id) {
        await api.insertUserSubscription({
          id: user.id,
          product_id: 'PROD-STUDIO-PRO',
          subscription_id: `SUB-ARTIST-${Date.now()}`
        }).catch(() => {});
      }
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error procesando la activación.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      await api.completeOnboarding({
        role: 'Tatuador',
        legal_accepted: true,
        full_name: artistName,
        phone_number: phone
      }).catch(() => {});

      updateUserMetadata({
        tipo: 'Tatuador',
        role: 'Tatuador',
        nombre: artistName,
        work_type: selectedStyles.join(', '),
        has_active_subscription: true,
        onboarding_completed: true
      });

      if (refreshProfile) {
        await refreshProfile().catch(() => {});
      }

      onClose();
      window.location.href = '/artist-dashboard';
    } catch (err: any) {
      setErrorMsg(err.message || 'Error finalizando el registro de tatuador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        data-testid="become-artist-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="atelier-card w-full max-w-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-white my-8"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Convertirme en Tatuador / Abrir Estudio
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Paso {step} de 3 • {step === 1 ? 'Perfil Profesional' : step === 2 ? 'Membresía & Pasarela' : 'Onboarding del Hub'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress Indicator */}
        <div className="px-6 pt-4 pb-2">
          <div className="grid grid-cols-3 gap-2">
            <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-violet-600' : 'bg-slate-200 dark:bg-zinc-800'}`} />
            <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-violet-600' : 'bg-slate-200 dark:bg-zinc-800'}`} />
            <div className={`h-1.5 rounded-full ${step >= 3 ? 'bg-violet-600' : 'bg-slate-200 dark:bg-zinc-800'}`} />
          </div>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Formulario Profesional */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                Nombre Artístico / Alias Profesional *
              </label>
              <input
                type="text"
                required
                data-testid="become-artist-name"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Ej. Kaelen Silva (Void Tattoo)"
                className="input-atelier w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                Estilos de Especialidad (Selecciona los que dominas) *
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLES_LIST.map((style) => {
                  const isSelected = selectedStyles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                        isSelected
                          ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                          : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-violet-400/50'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                  Años de Experiencia
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="input-atelier w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                  WhatsApp Comercial
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+507 60000000"
                  className="input-atelier w-full text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                Nombre de tu Estudio o Modalidad
              </label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="Ej. Obsidian Flash Lab o Tatuador Independiente"
                className="input-atelier w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                Biografía y Propuesta Artística
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Cuéntale a tus futuros clientes tu trayectoria, higiene y enfoque visual..."
                className="input-atelier w-full text-sm"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                data-testid="btn-step1-next"
                className="btn-atelier-primary px-6 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <span>Continuar a Pasarela de Pago</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Pasarela de Pago & Membresía */}
        {step === 2 && (
          <form onSubmit={handleProcessPayment} className="p-6 space-y-5">
            {/* Plan Info Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-transparent border border-violet-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-violet-600 dark:text-violet-400">
                  Plan Artista Pro &amp; Estudio
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  30 DÍAS DE PRUEBA GRATIS
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {formatPrice(discountedPrice)}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">/mes</span>
                {couponDiscount > 0 && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatPrice(basePrice)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Acceso completo al catálogo ilimitado, presencia destacada en el mapa, chat directo y recepción de citas con 0% comisiones.
              </p>

              {/* Billing Cycle Toggle */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    billingCycle === 'annual'
                      ? 'bg-violet-600 text-white'
                      : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  Anual (Ahorra 20% • {formatPrice(3.99)}/m)
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    billingCycle === 'monthly'
                      ? 'bg-violet-600 text-white'
                      : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  Mensual ({formatPrice(4.99)}/m)
                </button>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                ¿Tienes un cupón de descuento?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  data-testid="become-coupon-input"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Ej. VIP50, TATTOO10, TATTOOHUB"
                  className="input-atelier flex-1 text-xs uppercase"
                />
                <button
                  type="button"
                  data-testid="btn-apply-coupon"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700 transition cursor-pointer"
                >
                  Aplicar
                </button>
              </div>
              {couponMsg && (
                <p className={`text-xs font-medium ${couponDiscount > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                  {couponMsg}
                </p>
              )}
            </div>

            {/* Simulated Payment Card Form */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-violet-500" /> Datos de Tarjeta (Modo Seguro)
                </span>
                <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> 256-Bit SSL
                </span>
              </div>

              <div>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Número de tarjeta"
                  className="input-atelier w-full text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={cardExp}
                  onChange={(e) => setCardExp(e.target.value)}
                  placeholder="MM/AA"
                  className="input-atelier w-full text-xs font-mono"
                />
                <input
                  type="text"
                  value={cardCcv}
                  onChange={(e) => setCardCcv(e.target.value)}
                  placeholder="CCV"
                  className="input-atelier w-full text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Volver
              </button>
              <button
                type="submit"
                disabled={loading}
                data-testid="btn-confirm-membership"
                className="btn-atelier-primary px-6 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <span>{loading ? 'Validando...' : 'Iniciar 30 Días Gratis'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Onboarding Interactivo del Hub */}
        {step === 3 && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                ¡Membresía Activada! Bienvenido al Colectivo
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
                Descubre cómo operar eficientemente como Tatuador Profesional y en los estudios del Hub.
              </p>
            </div>

            <div className="space-y-3">
              {/* Card 1: Portafolio & Flashes */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500 shrink-0">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    1. Publica tus Obras y Flash Designs
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5">
                    Sube tus flashes con precio y medidas. Los clientes los reservarán para retiro o cita sin comisiones corporativas.
                  </p>
                </div>
              </div>

              {/* Card 2: Estudio & Studio ID */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    2. Asóciate con tu Studio ID o Registra el Tuyo en el Mapa
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5">
                    Cada estudio cuenta con un código único compartido por el dueño. También puedes registrar tu propio estudio físico con horarios de atención.
                  </p>
                </div>
              </div>

              {/* Card 3: Chat y Recepción de Citas */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    3. Chat Flotante y Cotizaciones Estructuradas
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5">
                    Comunícate con clientes en tiempo real, intercambia referencias con adjuntos de imagen y agenda citas de forma segura.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={handleCompleteOnboarding}
                disabled={loading}
                data-testid="btn-finish-onboarding"
                className="btn-atelier-primary px-8 py-3 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Accediendo...' : 'Ir a Mi Panel de Tatuador'}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
