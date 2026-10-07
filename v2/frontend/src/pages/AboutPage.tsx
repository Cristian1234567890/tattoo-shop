import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/common/PageTransition';
import {
  Globe,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  Award,
  Target,
  Eye,
  CheckCircle2,
  Clock,
  MessageSquare,
  Star,
  Send,
  Loader2,
  Layers,
  Flame,
  Check
} from 'lucide-react';
import { supabase } from '../api/supabase';

export const AboutPage: React.FC = () => {
  // Feedback form state
  const [feedbackType, setFeedbackType] = useState<'sugerencia' | 'mejora' | 'error' | 'felicitacion'>('sugerencia');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackEmail, setFeedbackEmail] = useState<string>('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  const pillars = [
    {
      icon: Sparkles,
      title: 'Libertad Artística Sin Algoritmos',
      desc: 'Ofrecemos a los artistas un lienzo digital ilimitado para exhibir su portafolio auténtico, técnicas distintivas y visión creativa sin censura injustificada ni supresión algorítmica.',
      color: 'from-violet-500/10 to-purple-500/5',
      borderColor: 'border-violet-500/20',
      iconColor: 'text-violet-400',
    },
    {
      icon: ShieldCheck,
      title: 'Calidad & Bioseguridad Verificada',
      desc: 'Promovemos los más rigurosos estándares sanitarios y profesionales en cada estudio registrado, garantizando higiene, asepsia y confianza a cada cliente en cada sesión.',
      color: 'from-emerald-500/10 to-teal-500/5',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Globe,
      title: 'Comunidad Global Sin Fronteras',
      desc: 'Conectamos amantes del arte corporal con los mejores talentos internacionales mediante geolocalización avanzada, filtros por técnica (Blackwork, Neotradicional, Realismo) y contacto directo.',
      color: 'from-blue-500/10 to-indigo-500/5',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: HeartHandshake,
      title: 'Trato Directo & Transparencia 0% Comisión',
      desc: 'Eliminamos intermediarios abusivos. Clientes y artistas cotizan, conversan y coordinan directamente con total claridad sobre tarifas, cuidados previos y sesiones requeridas.',
      color: 'from-amber-500/10 to-rose-500/5',
      borderColor: 'border-amber-500/20',
      iconColor: 'text-amber-400',
    },
  ];

  const stats = [
    { label: 'Artistas y Estudios Verificados', value: '+5,200' },
    { label: 'Ciudades y Guest Spots', value: '140+' },
    { label: 'Citas y Consultas Seguras', value: '+65,000' },
    { label: 'Índice de Satisfacción Sanitaria', value: '99.8%' },
  ];

  const roadmapMilestones = [
    {
      quarter: 'Fase 1 · Q1 2026',
      title: 'Lanzamiento de Red Atelier & Mapa Georreferenciado',
      status: 'completed',
      statusLabel: 'Completado',
      desc: 'Infraestructura central de perfiles artísticos, catálogo de obras en alta resolución y mapa interactivo con geolocalización de estudios en tiempo real.',
    },
    {
      quarter: 'Fase 2 · Q2 2026',
      title: 'Seguridad Integral, Validación 18+ & Auth Supabase',
      status: 'in-progress',
      statusLabel: 'En Producción / Staging',
      desc: 'Protección anti-bots Cloudflare Turnstile, flujo real de recuperación de credenciales, consentimientos legales con scroll forzado y 2FA TOTP.',
    },
    {
      quarter: 'Fase 3 · Q3 2026',
      title: 'Tienda Oficial de Suministros & Pasarela Stripe',
      status: 'upcoming',
      statusLabel: 'Próximamente',
      desc: 'Marketplace de tintas veganas certificadas, agujas y equipos profesionales homologados por sanidad, con pagos divididos y depósitos garantizados.',
    },
    {
      quarter: 'Fase 4 · Q4 2026',
      title: 'Red Global de Residencias (Guest Spots) & Certificado On-Chain',
      status: 'upcoming',
      statusLabel: 'Planeado',
      desc: 'Coordinación internacional de artistas invitados entre estudios y pasaporte sanitario digital para registro verificado de piezas de arte corporal.',
    },
  ];

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setFeedbackSubmitting(true);
    try {
      // Intentar guardar en Supabase si existe tabla o fallback resiliente a localStorage
      const feedbackPayload = {
        type: feedbackType,
        rating,
        message: feedbackMessage.trim(),
        email: feedbackEmail.trim() || 'anónimo',
        created_at: new Date().toISOString(),
      };

      try {
        await supabase.from('customer_feedback').insert([feedbackPayload]);
      } catch {
        // Fallback silencioso para persistencia local
      }

      const existingFeedback = JSON.parse(localStorage.getItem('tattoo_hub_feedback') || '[]');
      existingFeedback.push(feedbackPayload);
      localStorage.setItem('tattoo_hub_feedback', JSON.stringify(existingFeedback));

      setFeedbackSuccess(true);
      setFeedbackMessage('');
    } catch (err) {
      console.error('[Feedback] Error al enviar:', err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-[#090d16] text-white selection:bg-amber-500/30 selection:text-white font-sans">
        <main className="flex-grow flex flex-col items-center">
          {/* Hero Section */}
          <section className="relative w-full overflow-hidden py-24 md:py-32 flex items-center justify-center border-b border-zinc-800/60">
            {/* Ambient Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px]" />
              <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[140px]" />
            </div>

            <div className="z-10 text-center px-4 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-amber-500/30 backdrop-blur-md mb-6"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Institucional · Tattoo Hub Atelier
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight"
              >
                Elevando el Arte Corporal con{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
                  Tecnología & Bioseguridad
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
              >
                Nacimos de la convicción de que cada tatuaje es un compromiso personal para toda la vida. 
                Construimos el ecosistema tecnológico definitivo para conectar a los artistas más distinguidos con coleccionistas apasionados.
              </motion.p>
            </div>
          </section>

          {/* Stats Bar */}
          <section className="w-full max-w-6xl mx-auto px-4 py-12 border-b border-zinc-800/80">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="p-3"
                >
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Misión, Visión y Valores Fundacionales */}
          <section className="w-full max-w-6xl mx-auto px-4 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-8 md:p-10 rounded-3xl bg-zinc-900/60 border border-zinc-800 relative overflow-hidden shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Nuestra Misión</h2>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                  Dignificar y profesionalizar la industria global del tatuaje, empoderando a los artistas con herramientas tecnológicas independientes de gestión y difusión, al tiempo que garantizamos a los clientes una experiencia segura, transparente y de máxima calidad higiénico-sanitaria.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-8 md:p-10 rounded-3xl bg-zinc-900/60 border border-zinc-800 relative overflow-hidden shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
                  <Eye className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Nuestra Visión</h2>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                  Ser la red global descentralizada de referencia para el arte corporal, donde el talento de cualquier rincón del mundo pueda conectar con coleccionistas internacionales, coordinar residencias artísticas e impulsar una nueva era de respeto cultural y excelencia artística.
                </p>
              </motion.div>
            </div>

            {/* Pillars Grid */}
            <div className="text-center mb-12 pt-8">
              <h2 className="text-3xl font-extrabold text-white mb-3">Pilares de Excelencia</h2>
              <p className="text-zinc-400 text-sm max-w-xl mx-auto">
                Principios inquebrantables que rigen cada funcionalidad de Tattoo Hub.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map((pillar, index) => {
                const IconComp = pillar.icon;
                return (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`p-6 md:p-8 rounded-2xl bg-gradient-to-br ${pillar.color} border ${pillar.borderColor} backdrop-blur-sm shadow-lg`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-center mb-5">
                      <IconComp className={`w-6 h-6 ${pillar.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{pillar.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{pillar.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Interactive Roadmap */}
          <section className="w-full max-w-5xl mx-auto px-4 py-16 border-t border-zinc-800/80">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold mb-3">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Hoja de Ruta de Desarrollo</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                Roadmap de la Plataforma 2026
              </h2>
              <p className="text-zinc-400 text-sm max-w-xl mx-auto">
                Transparencia total sobre los hitos completados y las próximas innovaciones que estamos construyendo.
              </p>
            </div>

            <div className="space-y-6 relative">
              <div className="hidden md:block absolute left-8 top-6 bottom-6 w-0.5 bg-zinc-800" />

              {roadmapMilestones.map((m, index) => (
                <motion.div
                  key={m.quarter}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative flex flex-col md:flex-row md:items-start gap-4 md:gap-8 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-3 md:gap-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border ${
                        m.status === 'completed'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : m.status === 'in-progress'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                      }`}
                    >
                      {m.status === 'completed' ? (
                        <Check className="w-5 h-5" />
                      ) : m.status === 'in-progress' ? (
                        <Flame className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <span className="md:hidden text-xs font-mono font-bold text-zinc-400">
                      {m.quarter}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <span className="hidden md:inline text-xs font-mono font-bold text-zinc-500">
                          {m.quarter}
                        </span>
                        <h3 className="text-lg font-bold text-white">{m.title}</h3>
                      </div>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          m.status === 'completed'
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                            : m.status === 'in-progress'
                            ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                        }`}
                      >
                        {m.statusLabel}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">{m.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Interactive Customer Feedback Box */}
          <section className="w-full max-w-4xl mx-auto px-4 py-16 mb-20 border-t border-zinc-800/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-8 md:p-12 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Buzón de Sugerencias & Feedback</h2>
                  <p className="text-xs text-zinc-400">
                    Tu opinión guía el desarrollo de Tattoo Hub. Leemos cada mensaje con el equipo técnico.
                  </p>
                </div>
              </div>

              {feedbackSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-center space-y-3 mt-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-lg font-bold text-white">¡Gracias por tu aporte!</p>
                  <p className="text-sm text-emerald-200/90 max-w-md mx-auto">
                    Hemos registrado tu feedback en el sistema. Los aportes constructivos nos ayudan a construir la mejor plataforma de arte corporal.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFeedbackSuccess(false)}
                    className="mt-3 px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer transition"
                  >
                    Enviar otro comentario
                  </button>
                </motion.div>
              ) : (
                <form id="feedback-form" onSubmit={handleFeedbackSubmit} className="space-y-6 mt-6">
                  {/* Categoría */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Tipo de Aporte
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'sugerencia', label: '💡 Sugerencia' },
                        { id: 'mejora', label: '🚀 Mejora' },
                        { id: 'error', label: '🐛 Reporte Bug' },
                        { id: 'felicitacion', label: '⭐ Felicitación' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFeedbackType(item.id as any)}
                          className={`py-2 px-3 rounded-xl text-xs font-medium border transition cursor-pointer ${
                            feedbackType === item.id
                              ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-semibold'
                              : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating Estrellas */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Valoración de la Experiencia
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 cursor-pointer transition transform hover:scale-110"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= (hoverRating || rating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-zinc-700'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-zinc-400 ml-2 font-mono">
                        {rating} / 5 {rating === 5 ? '· Excelente' : rating >= 4 ? '· Muy bueno' : '· Aceptable'}
                      </span>
                    </div>
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label htmlFor="feedback-message" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Tu Mensaje o Sugerencia
                    </label>
                    <textarea
                      id="feedback-message"
                      rows={4}
                      required
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Cuéntanos qué función te gustaría ver o cómo ha sido tu experiencia en Tattoo Hub..."
                      className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950/60 text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition text-sm resize-none"
                    />
                  </div>

                  {/* Email Opcional */}
                  <div>
                    <label htmlFor="feedback-email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Correo Electrónico (opcional para darte respuesta)
                    </label>
                    <input
                      id="feedback-email"
                      type="email"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={feedbackSubmitting || !feedbackMessage.trim()}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {feedbackSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando mensaje...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar al Equipo Directivo</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </section>
        </main>
      </div>
    </PageTransition>
  );
};

export default AboutPage;
