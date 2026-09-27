import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center py-16 px-4">
        <div id="main" className="w-full max-w-4xl text-center">
          <div
            id="card"
            className="bg-black/40 backdrop-blur-md rounded-2xl p-8 md:p-14 border border-white/20 shadow-2xl transition hover:border-white/40"
          >
            <div id="img-main">
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-wide leading-tight drop-shadow-lg mb-6">
                Bienvenido a TooTienda más confiable
              </h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8 leading-relaxed font-light">
                La plataforma definitiva para conectar a los mejores artistas del tatuaje con amantes del arte corporal. Encuentra tu estilo, cotiza tu diseño y agenda con total seguridad.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register">
                  <button className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-8 rounded-full text-lg shadow-xl transition hover:scale-105 cursor-pointer">
                    Explorar Tatuajes
                  </button>
                </Link>
                <Link to="/login">
                  <button className="bg-white/20 hover:bg-white/30 text-white font-bold py-3.5 px-8 rounded-full text-lg border border-white/40 shadow-xl transition hover:scale-105 cursor-pointer">
                    Ingresar
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Informative Sections for Beneficios, Precios, Sobre Nosotros */}
        <section id="beneficios" className="w-full max-w-5xl mt-20 pt-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white drop-shadow mb-10">
            Beneficios de TooTienda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Variedad de Estilos</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Filtra por estilos como Realista, Blackwork, Tradicional, Acuarela y más. Encuentra justo el tatuaje que imaginas.
              </p>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Contacto Directo</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Envía tus referencias e imágenes directamente al correo del artista con nuestro cotizador integrado.
              </p>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Seguridad 2FA</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Cuentas protegidas con autenticación de dos factores TOTP para máxima tranquilidad.
              </p>
            </div>
          </div>
        </section>

        <section id="precios" className="w-full max-w-4xl mt-20 pt-8 text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow mb-6">
            Precios Transparentes
          </h2>
          <div className="bg-white/90 dark:bg-gray-800/90 p-8 rounded-2xl shadow-xl max-w-md mx-auto backdrop-blur-sm">
            <span className="text-xs uppercase font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
              Para Tatuadores
            </span>
            <div className="text-4xl font-extrabold text-gray-900 dark:text-white my-4">
              $1.99 <span className="text-base font-normal text-gray-500">/ mes</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Muestra tu portafolio ante cientos de clientes potenciales, recibe cotizaciones y haz crecer tu estudio.
            </p>
            <Link to="/register">
              <button className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition shadow-md cursor-pointer">
                Comenzar Ahora
              </button>
            </Link>
          </div>
        </section>

        <section id="sobre-nosotros" className="w-full max-w-4xl mt-20 pt-8 text-center px-4 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow mb-4">
            Sobre Nosotros
          </h2>
          <div className="bg-white/90 dark:bg-gray-800/90 p-8 rounded-xl shadow-lg backdrop-blur-sm">
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed max-w-2xl mx-auto">
              TooTienda nació como una iniciativa para profesionalizar la búsqueda de tatuadores en Panamá y la región. Nuestro equipo combina pasión por el arte corporal y tecnología de vanguardia para brindar la mejor experiencia a clientes y artistas.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
