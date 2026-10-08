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

          {/* 4. Pillars of the Independent Atelier */}
          <div className="mb-24">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-2 block">
                COMPROMISO DEL ECOSISTEMA
              </span>
              <h2 className="text-3xl font-bold text-white mb-3">La Filosofía Tattoo Hub</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Construimos una infraestructura basada en hechos, transparencia y respeto por el oficio del arte corporal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="atelier-card p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Sin Tarifas Escondidas</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    A diferencia de directorios que cobran por clic o porcentajes sobre citas, el contacto y las cotizaciones en Tattoo Hub son 100% directos entre cliente y artista.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800 text-xs font-semibold text-violet-400">
                  Transparencia económica total
                </div>
              </div>

              <div className="atelier-card p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Higiene y Salud Auditada</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Facilitamos la verificación de licencias sanitarias y protocolos de bioseguridad para proteger tanto a los estudios responsables como a los clientes.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800 text-xs font-semibold text-emerald-400">
                  Estándares hospitalarios visibles
                </div>
              </div>

              <div className="atelier-card p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Construido con la Comunidad</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Nuestras funciones evolucionan con el aporte de artistas y coleccionistas reales. Tu feedback guía cada iteración de la plataforma.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800 text-xs font-semibold text-indigo-400">
                  Evolución colaborativa
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
              Únete a la plataforma digital independiente diseñada exclusivamente para el arte en la piel, sin tarifas abusivas ni filtros opacos.
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
