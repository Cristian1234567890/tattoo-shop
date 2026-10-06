import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
} from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { useCurrency } from '../context/CurrencyContext';

export const PricingPage: React.FC = () => {
  const { formatPrice, currency, countryInfo } = useCurrency();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const vipPrice = billingCycle === 'annual' ? 3.99 : 4.99;
  const studioPrice = billingCycle === 'annual' ? 3.99 : 4.99;

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
      <div className="bg-[#0B0B0E] min-h-screen text-zinc-300 font-sans flex flex-col selection:bg-violet-500/30">
        <main className="flex-1 max-w-6xl mx-auto px-6 py-16 md:py-24 w-full">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-violet-400 bg-violet-600/10 px-4 py-1.5 rounded-full border border-violet-500/20 mb-4 inline-block">
              TARIFAS CLARAS • CERO COMISIONES
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Planes y Membresías Transparentes
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed">
              Herramientas profesionales de estudio y coleccionismo sin entregar porcentajes de tus obras.
            </p>

            {/* Currency Pill Indicator */}
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
              <Globe className="w-3.5 h-3.5 text-violet-400" />
              <span>
                Moneda activa:{' '}
                <strong className="text-white">
                  {countryInfo.name} ({currency})
                </strong>
              </span>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="mt-8 inline-flex items-center p-1.5 bg-[#13131A] border border-white/[0.08] rounded-full shadow-inner">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Facturación Mensual
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Facturación Anual
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold border border-emerald-500/30">
                  Ahorra 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* 1. Explorador */}
            <div className="atelier-card p-8 rounded-3xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
                  EXPLORADOR
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">Gratis</h3>
                <div className="text-3xl font-extrabold text-white mb-6">0 {currency}</div>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  Para entusiastas y personas que buscan su primer tatuaje o explorar estudios locales.
                </p>
                <ul className="space-y-3 mb-8 text-xs text-zinc-300">
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Explorar mapa interactivo de estudios</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Ver portafolios y flashes disponibles</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Contactar estudios por WhatsApp directo</span>
                  </li>
                  <li className="flex gap-2.5 text-zinc-500">
                    <CheckCircle2 className="w-4 h-4 text-zinc-700 shrink-0" />
                    <span>Seguimiento clínico de cicatrización</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register?role=Cliente"
                className="w-full text-center py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Empezar Gratis
              </Link>
            </div>

            {/* 2. Coleccionista VIP */}
            <div className="atelier-card p-8 rounded-3xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2 block">
                  COLECCIONISTA
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">Coleccionista VIP</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-white">{formatPrice(vipPrice)}</span>
                  <span className="text-xs text-zinc-500">/mes</span>
                </div>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  Para apasionados de la tinta: seguimiento clínico, flash drops y línea prioritaria.
                </p>
                <ul className="space-y-3 mb-8 text-xs text-zinc-300">
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Todo lo incluido en Explorador</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Diario de cicatrización fotográfico seguro</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Alertas tempranas de flash drops exclusivos</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Chat directo prioritario con residentes</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register?role=Cliente"
                className="w-full text-center py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Elegir Coleccionista VIP
              </Link>
            </div>

            {/* 3. Estudio Profesional */}
            <div className="atelier-card border-2 border-violet-600 p-8 rounded-3xl flex flex-col justify-between relative shadow-[0_0_40px_rgba(124,58,237,0.25)]">
              <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                MÁS POPULAR • 30 DÍAS GRATIS
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2 block">
                  ESTUDIOS & TATUADORES
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">Estudio Profesional</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-white">
                    {formatPrice(studioPrice)}
                  </span>
                  <span className="text-xs text-zinc-500">/mes</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-bold mb-4 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 30 días de prueba gratuita sin compromiso
                </div>
                <ul className="space-y-3 mb-8 text-xs text-zinc-300">
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>Pin geolocalizado destacado en el mapa</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>Gestión multi-artista de residentes del local</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>Catálogo ilimitado de flash designs</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>Recepción estructurada con cm y zona</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
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
            </div>
          </div>

          {/* Feature Comparison Matrix */}
          <div className="atelier-card p-8 md:p-12 rounded-3xl mb-20 overflow-x-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Comparativa Detallada de Funciones
            </h2>
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Función</th>
                  <th className="pb-3 text-center">Explorador</th>
                  <th className="pb-3 text-center text-violet-400">Coleccionista VIP</th>
                  <th className="pb-3 text-center text-indigo-400">Estudio Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                <tr>
                  <td className="py-3 font-medium text-white">Navegación en Mapa & Directorio</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Contacto Directo por WhatsApp</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Envío de Bocetos Estructurados</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Diario de Cicatrización Fotográfico</td>
                  <td className="py-3 text-center text-zinc-600">—</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Pin Destacado en el Mapa</td>
                  <td className="py-3 text-center text-zinc-600">—</td>
                  <td className="py-3 text-center text-zinc-600">—</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Gestión de N Artistas Residentes</td>
                  <td className="py-3 text-center text-zinc-600">—</td>
                  <td className="py-3 text-center text-zinc-600">—</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Subida Ilimitada de Flashes</td>
                  <td className="py-3 text-center text-zinc-600">—</td>
                  <td className="py-3 text-center text-zinc-600">—</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Preguntas Frecuentes</h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="atelier-card rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-violet-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-violet-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
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
