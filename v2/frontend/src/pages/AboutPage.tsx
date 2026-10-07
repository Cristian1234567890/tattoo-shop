import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/common/PageTransition';
import {
  Target,
  Eye,
  TrendingUp,
  MessageSquare,
  Star,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe2
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

  const marketStrategies = [
    {
      icon: Zap,
      title: 'Modelo 0% Comisión en Camilla',
      desc: 'Eliminamos intermediarios abusivos. Los tatuadores conservan el 100% de los honorarios pactados por sus obras, sin retenciones ocultas sobre el servicio en el estudio.',
      color: 'from-purple-500/10 to-indigo-500/5',
      borderColor: 'border-purple-500/20',
      iconColor: 'text-purple-400',
    },
    {
      icon: Globe2,
      title: 'Red de Estudios & Residencias (Guest Spots)',
      desc: 'Infraestructura de geolocalización que permite a artistas residentes y viajeros coordinar cupos en estudios de distintas ciudades, expandiendo su mercado internacional.',
      color: 'from-blue-500/10 to-cyan-500/5',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: ShieldCheck,
      title: 'Ecosistema de Bioseguridad & Higiene Certificada',
      desc: 'Fomento riguroso de normativas sanitarias oficiales, verificación de consentimiento informado mayor de edad (18+) y protocolos de asepsia homologados.',
      color: 'from-emerald-500/10 to-teal-500/5',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Sparkles,
      title: 'Tecnología Atelier Especializada',
      desc: 'Herramientas de software diseñadas exclusivamente para la dinámica real del tatuaje: cotizaciones por anatomía y medidas, protección de stencils y agenda inteligente.',
      color: 'from-amber-500/10 to-rose-500/5',
      borderColor: 'border-amber-500/20',
      iconColor: 'text-amber-400',
    },
  ];

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setFeedbackSubmitting(true);
    try {
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
        // Fallback silencioso a localStorage
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
      <div className="flex flex-col min-h-screen bg-[#090b10] text-white selection:bg-purple-500/30 font-sans">
        <main className="flex-grow flex flex-col items-center">
          {/* Header Institucional */}
          <section className="relative w-full py-20 md:py-28 flex items-center justify-center border-b border-zinc-800/80 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />

            <div className="z-10 text-center px-4 max-w-4xl mx-auto">
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-purple-950/60 border border-purple-500/30 text-purple-300 px-3.5 py-1 rounded-full mb-4">
                TATTOO HUB ATELIER · IDENTIDAD INSTITUCIONAL
              </span>

              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
                Sobre Nosotros
              </h1>
              <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Nuestra identidad, propósito fundacional y la estrategia que redefine la relación entre el arte corporal, los artistas independientes y los coleccionistas.
              </p>
            </div>
          </section>

          {/* Bloque 1: Misión y Visión */}
          <section className="w-full max-w-5xl mx-auto px-4 py-16 border-b border-zinc-800/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Misión */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 relative overflow-hidden shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 shadow-inner">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Misión</h2>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                  Dignificar, profesionalizar y empoderar a la comunidad mundial del arte corporal a través de infraestructura tecnológica moderna. Conectamos directamente a los mejores artistas independientes con coleccionistas y clientes que valoran la autenticidad, la precisión técnica y la máxima bioseguridad en cada pieza.
                </p>
              </motion.div>

              {/* Visión */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 relative overflow-hidden shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-inner">
                  <Eye className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Visión</h2>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                  Convertirnos en el estándar global de referencia para el arte sobre la piel, constituyendo una red descentralizada donde el talento creativo no esté limitado por fronteras geográficas ni penalizado por intermediarios abusivos, garantizando siempre el respeto por la cultura del tatuaje y la salud de las personas.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Bloque 2: Estrategia de Mercado */}
          <section className="w-full max-w-5xl mx-auto px-4 py-16 border-b border-zinc-800/80">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span>Propuesta de Valor & Posicionamiento</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
                Estrategia de Mercado
              </h2>
              <p className="text-zinc-400 text-sm max-w-xl mx-auto">
                Los cuatro pilares competitivos con los que Tattoo Hub revoluciona la industria.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {marketStrategies.map((strat, idx) => {
                const IconComp = strat.icon;
                return (
                  <motion.div
                    key={strat.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className={`p-7 rounded-2xl bg-gradient-to-br ${strat.color} border ${strat.borderColor} backdrop-blur-sm shadow-lg`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-center mb-5">
                      <IconComp className={`w-6 h-6 ${strat.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{strat.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{strat.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Bloque 3: Buzón de Feedback */}
          <section className="w-full max-w-4xl mx-auto px-4 py-16 mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-8 md:p-12 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Buzón de Feedback & Sugerencias</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tu opinión técnica y artística guía directamente las prioridades de desarrollo en Tattoo Hub.
                  </p>
                </div>
              </div>

              {feedbackSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-center space-y-3 mt-4"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-lg font-bold text-white">¡Aporte Registrado!</p>
                  <p className="text-sm text-emerald-200/90 max-w-md mx-auto">
                    Gracias por tu retroalimentación. Nuestro equipo de producto analiza cada sugerencia para las siguientes entregas.
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
                <form id="feedback-form" onSubmit={handleFeedbackSubmit} className="space-y-6">
                  {/* Tipo de Feedback */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Categoría
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'sugerencia', label: '💡 Sugerencia' },
                        { id: 'mejora', label: '🚀 Mejora' },
                        { id: 'error', label: '🐛 Bug / Error' },
                        { id: 'felicitacion', label: '⭐ Felicitación' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFeedbackType(item.id as any)}
                          className={`py-2 px-3 rounded-xl text-xs font-medium border transition cursor-pointer ${
                            feedbackType === item.id
                              ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-semibold'
                              : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
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
                            className={`w-6 h-6 ${
                              star <= (hoverRating || rating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-zinc-700'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-zinc-400 ml-2 font-mono">
                        {rating} / 5
                      </span>
                    </div>
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label htmlFor="feedback-message" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Tu Mensaje
                    </label>
                    <textarea
                      id="feedback-message"
                      rows={4}
                      required
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Escribe aquí tu propuesta, feedback técnico o comentario sobre la plataforma..."
                      className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950/60 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition text-sm resize-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="feedback-email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Correo Electrónico (opcional para darte seguimiento)
                    </label>
                    <input
                      id="feedback-email"
                      type="email"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={feedbackSubmitting || !feedbackMessage.trim()}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
