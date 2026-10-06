import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Palette,
  ShieldCheck,
  Sparkles,
  Navigation,
  Layers,
  ChevronRight,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useGuestGate } from '../context/GuestGateContext';

export const HomePage: React.FC = () => {
  const { formatPrice } = useCurrency();
  const { requireAuth } = useGuestGate();

  return (
    <div className="bg-[#0B0B0E] min-h-screen text-zinc-300 font-sans selection:bg-violet-500/30 flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative px-6 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/25 via-[#0B0B0E] to-[#0B0B0E] -z-10" />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.1]"
        >
          El punto de encuentro entre{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.35)]">
            artistas del tatuaje y piel de verdad
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed"
        >
          Conecta directamente con tatuadores y estudios independientes. Explora flash books, consulta
          disponibilidad y agenda tu próxima sesión sin comisiones corporativas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link
            to="/register?role=Cliente"
            className="btn-atelier-primary px-8 py-3.5 text-base font-medium shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)]"
          >
            Empezar mi colección de tinta
          </Link>
          <Link
            to="/register?role=Tatuador"
            className="flex items-center justify-center gap-2 bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-800 hover:border-zinc-700 px-8 py-3.5 rounded-xl font-medium transition-all backdrop-blur-md"
          >
            Formar un Estudio o Perfil <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* 2. Hoja de Ruta (Normalized id="beneficios") */}
      <section
        id="beneficios"
        className="scroll-mt-20 px-8 py-20 max-w-7xl mx-auto border-t border-zinc-900 w-full"
      >
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="md:w-1/3">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-violet-400 mb-4 bg-violet-600/10 px-3 py-1 rounded-full border border-violet-500/20">
              <ShieldCheck className="w-4 h-4" /> TRABAJANDO CON ESTILO
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Nuestra Hoja de Ruta & Estándares</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Construimos este ecosistema de forma transparente para nuestra comunidad. Sin filtros confusos,
              solo características que estamos desarrollando, probando y escalando.
            </p>
            <Link
              to="/beneficios"
              className="text-sm font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1.5"
            >
              Conoce nuestro manifiesto completo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                status: 'FASE 1 • EN CURSO',
                title: 'Directorio de Estudios Independientes',
                desc: 'Espacio a estudios locales con perfil multi-artista y contacto directo por WhatsApp sin comisiones.',
                active: true,
              },
              {
                status: 'FASE 2 • EN BREVE',
                title: 'Protocolo Sanitario y de Higiene',
                desc: 'Auditoría rigurosa de autoclave, material descartable y normativas internacionales visibles en cada perfil.',
                active: false,
              },
              {
                status: 'FASE 3 • PRÓXIMO',
                title: 'Verificación Manual de Portafolios',
                desc: 'Premios a piezas curadas sin filtros extremos ni alteraciones engañosas sobre piel real.',
                active: false,
              },
              {
                status: 'FASE 4 • A FUTURO',
                title: 'Guías Exclusivas & Calendario Taller',
                desc: 'Hub de cuidados post-tatuaje, seguimiento fotográfico y alertas de flash drops.',
                active: false,
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border transition-all ${
                  item.active
                    ? 'atelier-card border-violet-500/40 shadow-[0_0_20px_rgba(124,58,237,0.15)]'
                    : 'bg-zinc-900/40 border-zinc-800/60'
                } flex flex-col`}
              >
                <span
                  className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full w-max mb-4 ${
                    item.active
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {item.status}
                </span>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm flex-1 leading-relaxed">{item.desc}</p>
                {item.active && (
                  <div className="mt-4 text-xs font-medium text-violet-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Activo en plataforma
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Herramientas Reales de Taller */}
      <section className="px-8 py-20 max-w-7xl mx-auto border-t border-zinc-900 text-center w-full">
        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold tracking-widest uppercase text-zinc-400 mb-6">
          HERRAMIENTAS REALES DE TALLER
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Hecho para el ritmo diario de un estudio</h2>
        <p className="text-zinc-400 max-w-2xl mx-auto mb-16 text-base">
          Menos tiempo gestionando mensajes caóticos en redes sociales y más tiempo con la máquina en mano.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="atelier-card atelier-card-hover p-8 rounded-2xl">
            <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center mb-6 text-violet-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Flash Books & Grandes Piezas</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Publica stencils listos con medidas recomendadas, tarifas cerradas y reserva directa por WhatsApp sin rodeos.
            </p>
            <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
              01 • CATÁLOGO ORDENADO
            </span>
          </div>

          <div className="atelier-card atelier-card-hover p-8 rounded-2xl">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Cotizaciones con Medidas y Zona</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              El cliente envía solicitudes estructuradas: referencia visual, zona anatómica del cuerpo, centímetros y fechas tentativas.
            </p>
            <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
              02 • FIN DE MENSAJES VAGOS
            </span>
          </div>

          <div className="atelier-card atelier-card-hover p-8 rounded-2xl">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6 text-emerald-400">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Mapa de Estudios y Residentes</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Localiza talleres por ciudad y explora los artistas que residen en cada local. Contacta directamente a quien prefieras.
            </p>
            <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
              03 • GEOLOCALIZACIÓN DIRECTA
            </span>
          </div>
        </div>
      </section>

      {/* 4. Flash Gallery Preview */}
      <section className="px-8 py-20 max-w-7xl mx-auto border-t border-zinc-900 w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-2">
              GALERÍA FLASH DISPONIBLE
            </div>
            <h2 className="text-3xl font-bold text-white">Piezas Listas para Tinta</h2>
          </div>
          <Link
            to="/hub"
            className="text-sm font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            Ver catálogo interactivo <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              title: 'Sigil Core 01',
              artist: 'Kaelen Silva (Obsidian)',
              price: 120,
              img: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=400&q=80',
            },
            {
              title: 'Neo-Tribal Spine',
              artist: 'Kaelen Silva (Obsidian)',
              price: 150,
              img: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=400&q=80',
            },
            {
              title: 'Ojo Hiperrealista',
              artist: 'Cristian Castillo (Neon Ink)',
              price: 160,
              img: 'https://images.unsplash.com/photo-1621847468516-1ed15271c480?auto=format&fit=crop&w=400&q=80',
            },
            {
              title: 'Colibrí Acuarela',
              artist: 'Elena Vega (Neon Ink)',
              price: 95,
              img: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=400&q=80',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() =>
                requireAuth(
                  () => {
                    alert(`Diseño "${item.title}" reservado. Notificando a ${item.artist}.`);
                  },
                  {
                    title: 'Reserva de Flash Design',
                    message: `Para apartar "${item.title}" con ${item.artist}, crea tu cuenta gratis en Tattoo Hub.`,
                    redirectUrl: '/#beneficios',
                  }
                )
              }
              className="atelier-card rounded-2xl overflow-hidden group cursor-pointer border border-zinc-800 hover:border-violet-500/60 transition-all"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-xs font-bold text-violet-300">
                  {formatPrice(item.price)}
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                <p className="text-xs text-zinc-400 mt-1 truncate">{item.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Sección de Artistas & Estudios (Normalized id="artistas") */}
      <section
        id="artistas"
        className="scroll-mt-20 px-8 py-20 max-w-7xl mx-auto border-t border-zinc-900 w-full"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 atelier-card p-10 md:p-14 rounded-3xl border-violet-500/30">
          <div className="max-w-xl">
            <span className="text-xs font-bold tracking-widest uppercase text-violet-400 bg-violet-600/10 px-3 py-1 rounded-full border border-violet-500/20 mb-4 inline-block">
              DIRECTORIO Y LOCALES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Estudios con Residentes Verificados
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed mb-6">
              Conoce los estudios de tu ciudad, cuántos artistas residen en cada local y contacta directamente al especialista en tu estilo favorito.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/artistas"
                className="btn-atelier-primary px-6 py-3 text-sm font-bold shadow-md"
              >
                Ver Directorio de Artistas <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/hub"
                className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                Abrir Mapa de Estudios
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 text-center">
              <Users className="w-6 h-6 text-violet-400 mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-white">100%</div>
              <div className="text-xs text-zinc-400 mt-1">Contacto Directo</div>
            </div>
            <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 text-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-white">0%</div>
              <div className="text-xs text-zinc-400 mt-1">Comisiones</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Section (Normalized id="precios") */}
      <section
        id="precios"
        className="scroll-mt-20 px-8 py-20 max-w-5xl mx-auto border-t border-zinc-900 text-center w-full"
      >
        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold tracking-widest uppercase text-zinc-400 mb-6">
          PASES AL CLUB
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Planes y Membresías</h2>
        <p className="text-zinc-400 mb-12 text-base">
          Suscripción simple y directa. Sin comisiones sobre lo que cobras en el estudio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
          {/* Plan 1: Coleccionista VIP */}
          <div className="atelier-card p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-2 block">
                PARA CLIENTES Y COLECCIONISTAS
              </span>
              <h3 className="text-2xl font-bold text-white mb-2">Coleccionista VIP</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">{formatPrice(4.99)}</span>
                <span className="text-zinc-500 text-sm">/mes</span>
              </div>
              <p className="text-sm text-zinc-400 mb-8 pb-8 border-b border-zinc-800 leading-relaxed">
                Explora el mapa y contacta estudios sin límites. Herramientas de control de tu agenda y alertas de flash drops.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Buscar estudios, filtrar estilos y contactar artistas (Gratis)</span>
                </li>
                <li className="flex gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Diario de cicatrización para documentar tus piezas con foto y fecha</span>
                </li>
                <li className="flex gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Alertas tempranas de flash drops de tus artistas favoritos</span>
                </li>
              </ul>
            </div>
            <Link
              to="/register?role=Cliente"
              className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              Crear Perfil de Coleccionista
            </Link>
          </div>

          {/* Plan 2: Estudio Profesional */}
          <div className="atelier-card border-2 border-violet-600 p-8 rounded-3xl relative shadow-[0_0_40px_rgba(124,58,237,0.2)] flex flex-col justify-between">
            <div className="absolute -top-3.5 right-8 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              PLAN ESTUDIOS
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-violet-400 uppercase mb-2 block">
                MEMBRESÍA DESDE {formatPrice(3.99)}/MES
              </span>
              <h3 className="text-2xl font-bold text-white mb-2">Estudio Profesional</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-extrabold text-white">{formatPrice(4.99)}</span>
                <span className="text-zinc-500 text-sm">/mes</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full mb-6 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" /> Prueba de 30 días completamente gratis
              </div>
              <p className="text-sm text-zinc-400 mb-8 pb-8 border-b border-zinc-800 leading-relaxed">
                Todo lo que un estudio de tatuajes necesita. Sin comisiones extra por generar cotizaciones o agendar citas.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0" />
                  <span>Pin y presencia geolocalizada en el mapa de estudios</span>
                </li>
                <li className="flex gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0" />
                  <span>Gestión de artistas residentes y recepciones del estudio</span>
                </li>
                <li className="flex gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0" />
                  <span>Catálogo ilimitado de flash designs y control de stock</span>
                </li>
                <li className="flex gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0" />
                  <span>Recepción estructurada con zona y centímetros aproximados</span>
                </li>
              </ul>
            </div>
            <Link
              to="/register?role=Tatuador"
              className="btn-atelier-primary w-full text-center py-3 rounded-xl font-bold shadow-lg"
            >
              Comenzar Prueba de 30 Días
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Cultura de Taller Pre-Footer CTA Banner */}
      <section className="border-t border-zinc-900 bg-gradient-to-b from-[#0B0B0E] to-zinc-950 py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold tracking-widest uppercase text-zinc-400 mb-6">
            CULTURA DE TALLER
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            El arte queda en la piel.
            <br />
            Tu estudio merece visibilidad real.
          </h2>
          <p className="text-zinc-400 mb-10 max-w-xl mx-auto text-base leading-relaxed">
            Súmate hoy a la plataforma independiente de arte corporal. Sin algoritmos engañosos ni comisiones ocultas.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register?role=Cliente"
              className="bg-white hover:bg-zinc-200 text-black px-8 py-3.5 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Crear Cuenta Gratis
            </Link>
            <Link
              to="/hub"
              className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 px-8 py-3.5 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Explorar Mapa de Estudios
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
