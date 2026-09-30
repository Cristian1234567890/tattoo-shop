import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/common/PageTransition';
import {
  Globe,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  Users,
  Compass,
  ArrowRight,
  Award
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const pillars = [
    {
      icon: Sparkles,
      title: 'Libertad Artística',
      desc: 'Ofrecemos a los artistas un lienzo digital ilimitado para exhibir su portafolio auténtico, técnicas distintivas y visión creativa sin algoritmos arbitrarios.',
      color: 'from-violet-500/20 to-purple-500/10',
      iconColor: 'text-violet-400',
    },
    {
      icon: ShieldCheck,
      title: 'Calidad & Higiene Verificada',
      desc: 'Promovemos los más altos estándares sanitarios y profesionales en cada estudio, garantizando seguridad y confianza a cada cliente en cada sesión.',
      color: 'from-emerald-500/20 to-teal-500/10',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Globe,
      title: 'Comunidad Global Sin Fronteras',
      desc: 'Conectamos amantes del arte corporal con los mejores talentos internacionales mediante geolocalización avanzada, recomendaciones y contacto directo.',
      color: 'from-blue-500/20 to-indigo-500/10',
      iconColor: 'text-blue-400',
    },
    {
      icon: HeartHandshake,
      title: 'Trato Directo & Transparencia',
      desc: 'Eliminamos intermediarios abusivos y comisiones ocultas. Clientes y artistas cotizan, conversan y coordinan directamente con total claridad.',
      color: 'from-pink-500/20 to-rose-500/10',
      iconColor: 'text-pink-400',
    },
  ];

  const stats = [
    { label: 'Artistas y Estudios', value: '+5,000' },
    { label: 'Ciudades del Mundo', value: '120+' },
    { label: 'Citas y Consultas', value: '+50,000' },
    { label: 'Índice de Satisfacción', value: '99.4%' },
  ];

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-gray-950 text-white selection:bg-primary selection:text-white font-sans">
        <Navbar />

      <main className="flex-grow flex flex-col items-center">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden py-24 md:py-32 flex items-center justify-center">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-10 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[140px]"></div>
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[140px]"></div>
          </div>

          <div className="z-10 text-center px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
            >
              <Award className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-gray-300">Sobre Nosotros</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight"
            >
              Transformando la Experiencia del{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-pink-500">
                Arte Corporal
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              Tattoo Hub nació de la convicción de que cada tatuaje es una obra de arte única y un compromiso personal para toda la vida. Nuestra plataforma une a los artistas más talentosos con personas que buscan plasmar su historia en la piel.
            </motion.p>
          </div>
        </section>

        {/* Global Community Stats */}
        <section className="w-full max-w-6xl mx-auto px-4 py-12 border-y border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-4"
              >
                <div className="text-3xl md:text-5xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Company Pillars */}
        <section className="w-full max-w-7xl mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Nuestros Pilares</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Principios fundamentales que guían cada línea de código y cada conexión en nuestra red global.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((pillar, index) => {
              const IconComp = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  whileHover={{ y: -6 }}
                  className={`p-8 rounded-3xl bg-gradient-to-br ${pillar.color} border border-white/10 backdrop-blur-md shadow-xl transition-all`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                    <IconComp className={`w-7 h-7 ${pillar.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{pillar.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-base">{pillar.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Mission Statement & Vision */}
        <section className="w-full max-w-5xl mx-auto px-4 py-16 mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-10 md:p-14 rounded-[2.5rem] bg-gradient-to-r from-gray-900 via-violet-950/30 to-gray-900 border border-white/10 text-center relative overflow-hidden shadow-2xl"
          >
            <Users className="w-12 h-12 text-violet-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              Una plataforma creada por y para la comunidad del tatuaje
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Ya seas un coleccionista buscando tu próxima gran pieza o un artista deseando expandir tu clientela internacional, Tattoo Hub es tu hogar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/hub">
                <button className="w-full sm:w-auto py-3.5 px-8 rounded-full font-bold bg-white text-gray-950 hover:bg-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg">
                  <Compass className="w-5 h-5" />
                  <span>Explorar el Mapa</span>
                </button>
              </Link>
              <Link to="/register">
                <button className="w-full sm:w-auto py-3.5 px-8 rounded-full font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span>Unirme Ahora</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
      </div>
    </PageTransition>
  );
};

export default AboutPage;
