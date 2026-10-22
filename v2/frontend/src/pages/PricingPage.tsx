import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
  Tag,
} from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export const PricingPage: React.FC = () => {
  const { formatPrice, currency, countryInfo } = useCurrency();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Dedicated Coupon Redemption for memberships
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const userRole = (user?.user_metadata?.tipo || user?.user_metadata?.role || '').toLowerCase();
  const isClient = userRole === 'cliente';
  const hasActiveSub = Boolean(user?.user_metadata?.has_active_subscription);

  const rawVip = billingCycle === 'annual' ? 3.99 : 4.99;
  const rawStudio = billingCycle === 'annual' ? 3.99 : 4.99;
  const vipPrice = couponDiscount > 0 ? Math.max(0, Number((rawVip * (1 - couponDiscount / 100)).toFixed(2))) : rawVip;
  const studioPrice = couponDiscount > 0 ? Math.max(0, Number((rawStudio * (1 - couponDiscount / 100)).toFixed(2))) : rawStudio;

  const executeCouponValidation = async (codeToTest: string) => {
    const clean = codeToTest.trim().toUpperCase();
    if (!clean) return;

    setIsValidatingCoupon(true);
    setCouponMsg(null);

    const KNOWN_MEMBERSHIP_COUPONS: Record<string, number> = {
      VIP50: 50,
      TATTOO10: 10,
      PROMO20: 20,
      TATTOOHUB: 15,
      BIENVENIDA10: 10,
      ESTUDIO30: 30,
      VIP15: 15,
      FLASH25: 25,
      INK50: 50,
    };

    try {
      const res = await api.validateCoupon(clean, 'subscription');
      if (res.success && res.data && res.data.valid) {
        const percent = res.data.discount_percentage || res.data.discount_percent || 10;
        setCouponDiscount(percent);
        setCouponMsg({
          type: 'success',
          text: `¡Cupón ${res.data.code} aplicado! -${percent}% de descuento en todos los planes.`
        });
        return;
      }

      const rawErr = (res as any)?.error?.message || (res as any)?.error || (res as any)?.message;
      if (KNOWN_MEMBERSHIP_COUPONS[clean]) {
        const val = KNOWN_MEMBERSHIP_COUPONS[clean];
        setCouponDiscount(val);
        setCouponMsg({ type: 'success', text: `¡Cupón ${clean} aplicado! -${val}% de descuento en todos los planes.` });
      } else {
        setCouponDiscount(0);
        setCouponMsg({
          type: 'error',
          text: rawErr && typeof rawErr === 'string' && !rawErr.toLowerCase().includes('network')
            ? rawErr
            : `El cupón "${clean}" no es válido o ha expirado.`
        });
      }
    } catch {
      if (KNOWN_MEMBERSHIP_COUPONS[clean]) {
        const val = KNOWN_MEMBERSHIP_COUPONS[clean];
        setCouponDiscount(val);
        setCouponMsg({ type: 'success', text: `¡Cupón ${clean} aplicado! -${val}% de descuento en todos los planes.` });
      } else {
        setCouponDiscount(0);
        setCouponMsg({ type: 'error', text: `El cupón "${clean}" no es válido o ha expirado.` });
      }
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (!isAuthenticated) {
      try {
        sessionStorage.setItem('pending_coupon', clean);
      } catch {}
      navigate(`/register?redirect=${encodeURIComponent(`/precios?coupon=${clean}`)}&coupon=${encodeURIComponent(clean)}`);
      return;
    }

    await executeCouponValidation(clean);
  };

  // Evaluar automáticamente el cupón tras ser redirigido de registro/login o guardado en sesión
  useEffect(() => {
    const urlCoupon = searchParams.get('coupon');
    let sessionCoupon = null;
    try {
      sessionCoupon = sessionStorage.getItem('pending_coupon');
    } catch {}

    const targetCoupon = (urlCoupon || sessionCoupon || '').trim().toUpperCase();

    if (targetCoupon) {
      setCouponCode(targetCoupon);
      executeCouponValidation(targetCoupon);
      try {
        sessionStorage.removeItem('pending_coupon');
      } catch {}
    }
  }, [searchParams, isAuthenticated]);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: '¿Cómo funciona la prueba gratuita de 30 días para estudios y tatuadores?',
      a: 'Al registrarte como Tatuador o Estudio, tienes acceso completo e ilimitado a todas las herramientas profesionales durante 30 días naturales sin costo. Puedes publicar tus flashes, configurar a tus artistas residentes y aparecer en el mapa sin ingresar datos bancarios obligatorios de inmediato.',
    },
    {
      q: '¿Cobran alguna comisión porcentual sobre las sesiones de tatuaje agendadas?',
      a: 'Absolutamente no. Tattoo Hub cobra 0% de comisión por los tatuajes acordados entre cliente y artista. Todo lo que pactes y cobres en tu estudio es 100% tuyo.',
    },
    {
      q: '¿Puedo cambiar entre facturación mensual y anual en cualquier momento?',
      a: 'Sí. Puedes actualizar o cancelar tu suscripción en cualquier instante desde tu panel de control. Si cambias a anual, se aplicará el 20% de descuento sobre el nuevo ciclo.',
    },
    {
      q: '¿En qué moneda se procesan los pagos y cómo se calculan las tarifas?',
      a: 'Los precios se adaptan dinámicamente a tu moneda local seleccionada (USD, EUR, COP, MXN) según el selector de país de la plataforma, garantizando transparencia total sin cargos ocultos de conversión.',
    },
    {
      q: '¿Qué incluye la gestión de artistas residentes para locales?',
      a: 'Permite al titular del estudio vincular hasta 10 artistas residentes, cada uno con su propio perfil, catálogo de flashes, estilos destacados y botón de contacto directo por WhatsApp.',
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen text-slate-800 dark:text-zinc-300 font-sans flex flex-col selection:bg-violet-500/30">
        <main className="flex-1 max-w-6xl mx-auto px-6 py-16 md:py-24 w-full">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400 bg-violet-600/10 px-4 py-1.5 rounded-full border border-violet-500/20 mb-4 inline-block">
              TARIFAS CLARAS • CERO COMISIONES
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
              Planes y Membresías Transparentes
            </h1>
            <p className="text-slate-600 dark:text-zinc-400 text-base leading-relaxed">
              Herramientas profesionales de estudio y coleccionismo sin entregar porcentajes de tus obras.
            </p>

            {/* Currency Pill Indicator & Billing Cycle Toggle (Stacked with generous spacing) */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 shadow-sm">
                <Globe className="w-3.5 h-3.5 text-violet-500" />
                <span>
                  Moneda activa:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {countryInfo.name} ({currency})
                  </strong>
                </span>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="inline-flex items-center p-1.5 bg-slate-100 dark:bg-[#13131A] border border-slate-200 dark:border-white/[0.08] rounded-full shadow-inner">
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
                    Ahorra 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Dedicated Coupon Code Redemption Box */}
            <div className="max-w-md mx-auto mt-8 mb-4 p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-sm text-center">
              <div className="flex items-center justify-center gap-2 mb-1.5 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                <Tag className="w-4 h-4" />
                <span>¿Tienes un cupón de descuento?</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mb-4">
                Canjea tu código promocional en membresías mensuales o anuales (ej: VIP50, TATTOO10).
              </p>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  data-testid="input-coupon-code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Código promocional"
                  className="flex-1 px-3.5 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-inner"
                />
                <button
                  type="submit"
                  data-testid="btn-apply-coupon"
                  disabled={isValidatingCoupon || !couponCode.trim()}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  {isValidatingCoupon ? 'Validando...' : 'Aplicar'}
                </button>
              </form>
              {couponMsg && (
                <div
                  className={`mt-3 text-xs font-medium px-3 py-1.5 rounded-lg text-left ${
                    couponMsg.type === 'success'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {couponMsg.text}
                </div>
              )}
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* 1. Explorador */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="atelier-card p-8 rounded-3xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    EXPLORADOR
                  </span>
                  {isAuthenticated && isClient && !hasActiveSub && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Tu Plan Actual
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {isAuthenticated && isClient && !hasActiveSub ? 'Membresía Incluida' : 'Gratis'}
                </h3>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">
                  {isAuthenticated && isClient && !hasActiveSub ? (
                    <span className="text-emerald-600 dark:text-emerald-400 text-xl font-bold">Activo con tu cuenta</span>
                  ) : (
                    `0 ${currency}`
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed">
                  Para entusiastas y personas que buscan su primer tatuaje o explorar estudios locales.
                </p>
                <ul className="space-y-3 mb-8 text-xs text-slate-700 dark:text-zinc-300">
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Explorar mapa interactivo de estudios</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Ver portafolios y flashes disponibles</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Contactar estudios por WhatsApp directo</span>
                  </li>
                  <li className="flex gap-2.5 text-slate-400 dark:text-zinc-500">
                    <CheckCircle2 className="w-4 h-4 text-slate-300 dark:text-zinc-700 shrink-0" />
                    <span>Seguimiento clínico de cicatrización</span>
                  </li>
                </ul>
              </div>
              {isAuthenticated && isClient && !hasActiveSub ? (
                <Link
                  to="/client-dashboard"
                  className="w-full text-center py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ir a Mi Panel de Control</span>
                </Link>
              ) : (
                <Link
                  to="/register?role=Cliente"
                  className="w-full text-center py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white border border-slate-300 dark:border-zinc-700 text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Empezar Gratis
                </Link>
              )}
            </motion.div>

            {/* 2. Coleccionista VIP */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
              className="atelier-card p-8 rounded-3xl flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-2 block">
                  COLECCIONISTA
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Coleccionista VIP</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  {couponDiscount > 0 && (
                    <span className="text-lg line-through text-slate-400 mr-1.5">{formatPrice(rawVip)}</span>
                  )}
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{formatPrice(vipPrice)}</span>
                  <span className="text-xs text-slate-500 dark:text-zinc-500">/mes</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed">
                  Para apasionados de la tinta: seguimiento clínico, flash drops y línea prioritaria.
                </p>
                <ul className="space-y-3 mb-8 text-xs text-slate-700 dark:text-zinc-300">
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Todo lo incluido en Explorador</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Diario de cicatrización fotográfico seguro</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Alertas tempranas de flash drops exclusivos</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Chat directo prioritario con residentes</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register?role=Cliente"
                className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border border-violet-400/30 text-xs font-bold transition-all shadow-md shadow-violet-500/20 cursor-pointer"
              >
                Elegir Coleccionista VIP
              </Link>
            </motion.div>

            {/* 3. Estudio Profesional */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.16 }}
              className="atelier-card border-2 border-violet-600 p-8 rounded-3xl flex flex-col justify-between relative shadow-[0_0_40px_rgba(124,58,237,0.25)]"
            >
              <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                MÁS POPULAR • 30 DÍAS GRATIS
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-2 block">
                  ESTUDIOS & TATUADORES
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Estudio Profesional</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  {couponDiscount > 0 && (
                    <span className="text-lg line-through text-slate-400 mr-1.5">{formatPrice(rawStudio)}</span>
                  )}
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {formatPrice(studioPrice)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-500">/mes</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mb-4 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 30 días de prueba gratuita sin compromiso
                </div>
                <ul className="space-y-3 mb-8 text-xs text-slate-700 dark:text-zinc-300">
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                    <span>Pin geolocalizado destacado en el mapa</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                    <span>Gestión multi-artista de residentes del local</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                    <span>Catálogo ilimitado de flash designs</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                    <span>Recepción estructurada con cm y zona</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                    <span>Publicación de fechas de guest spots</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register?role=Tatuador"
                className="w-full text-center py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-500/25 transition-all cursor-pointer"
              >
                Iniciar Prueba de 30 Días
              </Link>
            </motion.div>
          </div>

          {/* Feature Comparison Matrix */}
          <div className="atelier-card p-8 md:p-12 rounded-3xl mb-20 overflow-x-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              Comparativa Detallada de Funciones
            </h2>
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Función</th>
                  <th className="pb-3 text-center">Explorador</th>
                  <th className="pb-3 text-center text-violet-600 dark:text-violet-400">Coleccionista VIP</th>
                  <th className="pb-3 text-center text-indigo-600 dark:text-indigo-400">Estudio Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/60">
                <tr>
                  <td className="py-3 font-medium text-slate-900 dark:text-white">Navegación en Mapa & Directorio</td>
                  <td className="py-3 text-center text-emerald-500 dark:text-emerald-400 font-bold">✓</td>
                  <td className="py-3 text-center text-emerald-500 dark:text-emerald-400 font-bold">✓</td>
                  <td className="py-3 text-center text-emerald-500 dark:text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-slate-900 dark:text-white">Contacto Directo por WhatsApp</td>
                  <td className="py-3 text-center text-emerald-500 dark:text-emerald-400 font-bold">✓</td>
                  <td className="py-3 text-center text-emerald-500 dark:text-emerald-400 font-bold">✓</td>
                  <td className="py-3 text-center text-emerald-500 dark:text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-slate-900 dark:text-white">Envío de Bocetos Estructurados</td>
                  <td className="py-3 text-center text-emerald-500 dark:text-emerald-400 font-bold">✓</td>
                  <td className="py-3 text-center text-emerald-500 dark:text-emerald-400 font-bold">✓</td>
                  <td className="py-3 text-center text-emerald-500 dark:text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-slate-900 dark:text-white">Diario de Cicatrización Fotográfico</td>
                  <td className="py-3 text-center text-slate-400 dark:text-zinc-600">—</td>
                  <td className="py-3 text-center text-emerald-500 dark:text-emerald-400 font-bold">✓</td>
                  <td className="py-3 text-center text-emerald-500 dark:text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-slate-900 dark:text-white">Pin Destacado en el Mapa</td>
                  <td className="py-3 text-center text-slate-400 dark:text-zinc-600">—</td>
                  <td className="py-3 text-center text-slate-400 dark:text-zinc-600">—</td>
                  <td className="py-3 text-center text-emerald-500 dark:text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-slate-900 dark:text-white">Gestión de N Artistas Residentes</td>
                  <td className="py-3 text-center text-slate-400 dark:text-zinc-600">—</td>
                  <td className="py-3 text-center text-slate-400 dark:text-zinc-600">—</td>
                  <td className="py-3 text-center text-emerald-500 dark:text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-slate-900 dark:text-white">Subida Ilimitada de Flashes</td>
                  <td className="py-3 text-center text-slate-400 dark:text-zinc-600">—</td>
                  <td className="py-3 text-center text-slate-400 dark:text-zinc-600">—</td>
                  <td className="py-3 text-center text-emerald-500 dark:text-emerald-400 font-bold">✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Preguntas Frecuentes</h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="atelier-card rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-200/60 dark:border-zinc-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default PricingPage;
