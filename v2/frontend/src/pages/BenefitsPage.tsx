import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Percent,
  MessageCircle,
  CheckCircle2,
  XCircle,
  HeartHandshake,
  FileCheck2,
  ChevronRight,
  Star,
} from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';

export const BenefitsPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="bg-[#0B0B0E] min-h-screen text-zinc-300 font-sans flex flex-col selection:bg-violet-500/30">
        <main className="flex-1 max-w-7xl mx-auto px-6 py-16 md:py-24 w-full">
          {/* 1. Manifesto Hero */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-bold tracking-widest uppercase text-violet-400 bg-violet-600/10 px-4 py-1.5 rounded-full border border-violet-500/20 mb-6 inline-block shadow-sm">
              MANIFIESTO DEL ATELIER DIGITAL
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
              Devolviendo el tatuaje a quienes lo graban con aguja y lo llevan en la piel.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Frente a plataformas corporativas que cobran comisiones abusivas y algoritmos que ocultan tu trabajo, Tattoo Hub nace como un espacio independiente, transparente y digno.
            </p>
          </div>

          {/* 2. Three Core Guarantees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div className="atelier-card atelier-card-hover p-8 rounded-2xl relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 shadow-lg">
                <Percent className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">100% para el Tatuador</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Cero comisiones sobre el valor de tus sesiones en camilla. Lo que cotizas y cobras por tu arte es tuyo por derecho. Sin retenciones sorpresivas ni tarifas por cada cita confirmada.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> 0% comisión garantizada
              </div>
            </div>

            <div className="atelier-card atelier-card-hover p-8 rounded-2xl relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 text-violet-400 shadow-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Protocolos Sanitarios Visibles</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Insignia de bioseguridad que acredita autoclave, material descartable y desinfección grado hospitalario para brindar total tranquilidad al coleccionista antes de sentarse en la camilla.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-violet-400">
                <FileCheck2 className="w-4 h-4" /> Higiene y bioseguridad auditada
              </div>
            </div>

            <div className="atelier-card atelier-card-hover p-8 rounded-2xl relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 shadow-lg">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Contacto Directo sin Paredes</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Conexión inmediata por WhatsApp directo y chat de estudio. Sin números ocultos, sin filtros que retengan tus mensajes ni trabas diseñadas para forzarte a pagar dentro de la app.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <HeartHandshake className="w-4 h-4" /> Comunicación directa cliente-estudio
              </div>
            </div>
          </div>

          {/* 3. Platform Comparison Matrix */}
          <div className="atelier-card p-8 md:p-12 rounded-3xl mb-24 overflow-x-auto shadow-2xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-2 block">
                TRANSPARENCIA COMPARATIVA
              </span>
              <h2 className="text-3xl font-bold text-white mb-3">Tattoo Hub vs Canales Tradicionales</h2>
              <p className="text-sm text-zinc-400">
                Diseñado exclusivamente para el ecosistema del tatuaje, no para publicidad masiva ni comisiones corporativas.
              </p>
            </div>

            <table className="w-full text-left text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-4">Característica Clave</th>
                  <th className="pb-4 text-violet-400">Tattoo Hub</th>
                  <th className="pb-4 text-zinc-500">Redes Sociales (IG/TikTok)</th>
                  <th className="pb-4 text-zinc-500">Apps Corporativas de Citas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                <tr>
                  <td className="py-4 font-semibold text-white">Comisión por Cita</td>
                  <td className="py-4 text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> 0% (Totalmente Gratis)
                  </td>
                  <td className="py-4 text-zinc-400">0% (pero penalizado por ads)</td>
                  <td className="py-4 text-red-400 font-medium flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> 15% - 25% por servicio
                  </td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-white">Alcance del Portafolio</td>
                  <td className="py-4 text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Geolocalizado y Orgánico
                  </td>
                  <td className="py-4 text-red-400 font-medium flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Sujeto a algoritmos de video
                  </td>
                  <td className="py-4 text-zinc-400">Limitado a usuarios de pago</td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-white">Cotizaciones Estructuradas</td>
                  <td className="py-4 text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Medidas (cm), zona y foto
                  </td>
                  <td className="py-4 text-red-400 font-medium flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> DMs caóticos y vagos
                  </td>
                  <td className="py-4 text-zinc-400">Formulario genérico</td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-white">Verificación Higiénica</td>
                  <td className="py-4 text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Sello de Bioseguridad visible
                  </td>
                  <td className="py-4 text-red-400 font-medium flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> No existe control
                  </td>
                  <td className="py-4 text-zinc-400">Superficial</td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold text-white">Privacidad de Diseños</td>
                  <td className="py-4 text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Sin entrenamiento de IA
                  </td>
                  <td className="py-4 text-red-400 font-medium flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Usados para scrapers e IA
                  </td>
                  <td className="py-4 text-zinc-400">Términos ambiguos</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. Testimonials of Studio Residents */}
          <div className="mb-24">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-2 block">
                VOCES DEL ATELIER
              </span>
              <h2 className="text-3xl font-bold text-white">La Comunidad Opina</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="atelier-card p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-violet-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-violet-400" />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-300 italic mb-4 leading-relaxed">
                    "Poder recibir cotizaciones con los centímetros exactos y la zona del cuerpo ahorra horas de ida y vuelta en mensajes sin sentido. Y saber que no hay comisión sobre mi aguja es fundamental."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                  <div className="w-10 h-10 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center font-bold text-violet-300">
                    KS
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Kaelen Silva ("Void")</h4>
                    <p className="text-xs text-zinc-500">Residente en Obsidian Atelier</p>
                  </div>
                </div>
              </div>

              <div className="atelier-card p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-violet-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-violet-400" />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-300 italic mb-4 leading-relaxed">
                    "Como coleccionista, encontrar estudios que muestren claramente a sus residentes y sus medidas higiénicas me dio la confianza que ninguna red social me brindaba."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300">
                    ML
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Maya Lin</h4>
                    <p className="text-xs text-zinc-500">Coleccionista Verificada</p>
                  </div>
                </div>
              </div>

              <div className="atelier-card p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-violet-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-violet-400" />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-300 italic mb-4 leading-relaxed">
                    "Subo mis flash designs y los clientes pueden reservarlos con un clic. El enlace directo a WhatsApp agiliza la cita y nos mantiene conectados de forma humana."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                  <div className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-300">
                    CC
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Cristian Castillo</h4>
                    <p className="text-xs text-zinc-500">Tatuador en Neon Ink Studio</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Pre-Footer Call to Action */}
          <div className="atelier-card border-violet-500/30 p-10 md:p-14 rounded-3xl text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 via-transparent to-indigo-900/10 pointer-events-none" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              ¿Listo para experimentar el tatuaje sin intermediarios?
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto mb-8 text-base">
              Únete a miles de coleccionistas y estudios que ya operan en una plataforma limpia, moderna y enfocada exclusivamente en el arte en la piel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register?role=Cliente"
                className="btn-atelier-primary px-8 py-3.5 text-sm font-bold shadow-lg"
              >
                Crear Cuenta de Coleccionista
              </Link>
              <Link
                to="/artistas"
                className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 hover:border-zinc-500 px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                Explorar Directorio de Artistas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default BenefitsPage;
