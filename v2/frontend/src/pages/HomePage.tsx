import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { PageTransition } from '../components/common/PageTransition';
import {
  Palette,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  MapPin,
  Check,
  ArrowRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-gray-950 text-white selection:bg-primary selection:text-white font-sans">
        <Navbar />

      <main className="flex-grow flex flex-col items-center">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden min-h-[90vh] flex items-center justify-center">
          {/* Glassmorphism Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
            <div className="absolute top-1/3 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/10 rounded-full blur-[150px]"></div>
          </div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center mt-12 md:mt-0"
          >
            {/* Internationalized Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-sm font-medium text-gray-300">La plataforma global para el arte corporal</span>
            </motion.div>
            
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-400 mb-6 drop-shadow-sm leading-tight"
            >
              Encuentra al Artista <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-purple-500">
                Perfecto para tu Piel
              </span>
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed"
            >
              Explora portafolios verificados, cotiza sin compromisos y gestiona tus citas en la comunidad más exclusiva de tatuadores y coleccionistas.
            </motion.p>
            
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
            >
              <Link to="/hub" className="w-full sm:w-auto">
                <button className="w-full py-4 px-8 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-all shadow-[0_0_40px_rgba(239,68,68,0.3)] hover:shadow-[0_0_60px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2 hover:-translate-y-1 cursor-pointer">
                  <MapPin className="w-5 h-5" />
                  <span>Explorar el Mapa</span>
                </button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <button className="w-full py-4 px-8 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10 backdrop-blur-md flex items-center justify-center gap-2 hover:-translate-y-1 cursor-pointer">
                  <span>Registrarme Gratis</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Benefits Section with id="beneficios" */}
        <section id="beneficios" className="w-full max-w-7xl mx-auto px-4 py-24 relative z-10 scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Por qué elegir Tattoo Hub</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Diseñado específicamente para elevar los estándares de seguridad, calidad y profesionalismo en la industria del tatuaje.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-gray-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm hover:bg-gray-900/60 transition-all shadow-lg hover:shadow-primary/10"
            >
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Estudios Verificados</h3>
              <p className="text-gray-400 leading-relaxed">
                Todos los artistas en nuestro Hub pasan por un proceso de verificación de identidad y estándares de higiene para tu total tranquilidad.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8 }}
              className="bg-gray-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm hover:bg-gray-900/60 transition-all shadow-lg hover:shadow-purple-500/10"
            >
              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Chat Directo & Cotización</h3>
              <p className="text-gray-400 leading-relaxed">
                Olvídate de intermediarios. Chatea en tiempo real, envía referencias y acuerda precios directamente desde nuestra plataforma segura.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -8 }}
              className="bg-gray-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm hover:bg-gray-900/60 transition-all shadow-lg hover:shadow-blue-500/10"
            >
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Palette className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Portafolios Interactivos</h3>
              <p className="text-gray-400 leading-relaxed">
                Descubre artistas a través de un mapa geolocalizado o filtra por estilos específicos (Realismo, Blackwork, Tradicional, etc).
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section with id="precios" */}
        <section id="precios" className="w-full max-w-7xl mx-auto px-4 py-24 relative z-10 border-t border-white/5 scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Planes y Membresías</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Una plataforma transparente. Elige el plan que más se adapte a tu rol.
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-1 p-1 bg-gray-900 border border-white/10 rounded-full mt-8">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  billingCycle === 'annual' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                Anual
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                  -17%
                </span>
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Clientes Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -6 }}
              className="bg-gray-900/60 border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden backdrop-blur-md transition-all shadow-xl"
            >
              <div className="mb-8">
                <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Para Clientes</span>
                <h3 className="text-3xl font-bold text-white mb-2">Coleccionista VIP</h3>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-black text-white">{billingCycle === 'monthly' ? '$4.99' : '$49.90'}</span>
                  <span className="text-gray-500 font-medium">/{billingCycle === 'monthly' ? 'mes' : 'año'}</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Uso básico gratuito (explorar y chatear). La membresía VIP desbloquea funciones premium exclusivas.
                </p>
              </div>

              <div className="flex-grow">
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span>Explorar mapa y contactar artistas (Gratis)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="font-semibold text-white">Seguimiento fotográfico de curación</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Historial avanzado de sesiones y cuidados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Insignia de Coleccionista VIP en tu perfil</span>
                  </li>
                </ul>
              </div>

              <div className="mt-10">
                <Link to="/register?role=Cliente">
                  <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all cursor-pointer">
                    Registrarme como Cliente
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Artistas Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -6 }}
              className="bg-gradient-to-b from-primary/20 to-gray-900/80 border border-primary/40 rounded-3xl p-8 flex flex-col relative overflow-hidden backdrop-blur-md shadow-[0_0_50px_rgba(239,68,68,0.15)] transition-all"
            >
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
                Más Popular
              </div>
              
              <div className="mb-8">
                <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Para Tatuadores</span>
                <h3 className="text-3xl font-bold text-white mb-2">Estudio Profesional</h3>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-black text-white">{billingCycle === 'monthly' ? '$4.99' : '$49.90'}</span>
                  <span className="text-gray-500 font-medium">/{billingCycle === 'monthly' ? 'mes' : 'año'}</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-bold text-green-400">90 días de prueba gratis</span>
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  Suscripción obligatoria tras el período de prueba para mantener presencia comercial en la app.
                </p>
              </div>

              <div className="flex-grow">
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="font-semibold text-white">Presencia geolocalizada en el Hub</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Recepción de chats y cotizaciones ilimitadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Gestión de portafolio y precios base</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Insignia de Artista Verificado</span>
                  </li>
                </ul>
              </div>

              <div className="mt-10">
                <Link to="/register?role=Tatuador">
                  <button className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30 cursor-pointer">
                    Iniciar mi Prueba de 90 Días
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full max-w-5xl mx-auto px-4 py-24 mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-12 rounded-[2.5rem] bg-gradient-to-r from-gray-900 via-primary/10 to-gray-900 border border-white/10 text-center relative overflow-hidden shadow-2xl"
          >
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              El arte es eterno. <br className="hidden md:block"/> Tu plataforma también debería serlo.
            </h2>
            <Link to="/register">
              <button className="py-4 px-10 bg-white text-gray-950 hover:bg-gray-200 font-extrabold rounded-full transition-all hover:scale-105 cursor-pointer shadow-lg">
                Únete a Tattoo Hub
              </button>
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
      </div>
    </PageTransition>
  );
};

export default HomePage;
