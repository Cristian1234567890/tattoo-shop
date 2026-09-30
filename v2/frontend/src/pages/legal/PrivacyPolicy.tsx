import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gray-900 border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-black mb-4 text-white">Política de Privacidad</h1>
          <p className="mb-8 text-sm text-gray-400">
            Última actualización: Septiembre 2026 | Jurisdicción Internacional y Estándares Globales de Privacidad (GDPR, RLS)
          </p>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-white">1. Recopilación de Datos</h2>
            <p className="text-gray-300 leading-relaxed">
              Recopilamos la información que usted nos proporciona directamente al registrarse mediante Google OAuth o correo electrónico, incluyendo nombre, correo y configuración de autenticación 2FA. Para Tatuadores, recopilamos adicionalmente ubicación geográfica y portafolio de imágenes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-white">2. Uso de la Información</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Utilizamos su información para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300 leading-relaxed">
              <li>Mantener y mejorar la Plataforma.</li>
              <li>Conectar a Tatuadores y Clientes mediante nuestro directorio de mapas global.</li>
              <li>Gestionar la seguridad de la cuenta a través de nuestro sistema de validación TOTP de 6 dígitos.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-white">3. Compartición de Datos</h2>
            <p className="text-gray-300 leading-relaxed">
              Los perfiles de los Tatuadores son públicos (incluyendo nombre, estilo y geolocalización aproximada o exacta proporcionada). La información de los Clientes se mantiene privada y solo se comparte de forma limitada con el Tatuador al momento de confirmar una cita.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-white">4. Seguridad de la Información</h2>
            <p className="text-gray-300 leading-relaxed">
              Toda la información se almacena en bases de datos con políticas de acceso a nivel de fila (RLS), asegurando que solo los dueños legítimos puedan modificar su información. Protegemos los datos conforme a las mejores prácticas internacionales de seguridad informática y normativas globales de protección de datos personales.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
