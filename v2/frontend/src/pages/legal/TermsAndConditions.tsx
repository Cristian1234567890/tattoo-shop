import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';

export const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gray-900 border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-black mb-4 text-white">Términos y Condiciones de Uso</h1>
          <p className="mb-8 text-sm text-gray-400">
            Última actualización: Septiembre 2026 | Jurisdicción Internacional y Estándares Globales de Comercio Electrónico
          </p>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-white">1. Aceptación de los Términos</h2>
            <p className="text-gray-300 leading-relaxed">
              Al acceder y utilizar "Tattoo Hub" (la "Plataforma"), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio. Estos términos se rigen bajo los principios de comercio digital internacional y las normativas aplicables en las jurisdicciones de operación de los usuarios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-white">2. Descripción del Servicio</h2>
            <p className="text-gray-300 leading-relaxed">
              La Plataforma actúa como un intermediario digital (Marketplace / Hub) que conecta a artistas del tatuaje independientes y estudios ("Tatuadores") con usuarios interesados en adquirir sus servicios ("Clientes"). La Plataforma no provee servicios de tatuaje directamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-white">3. Rol y Responsabilidad</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-300 leading-relaxed">
              <li><strong>Independencia:</strong> Los Tatuadores son contratistas independientes. No existe relación laboral entre la Plataforma y los Tatuadores.</li>
              <li><strong>Transacciones:</strong> Cualquier acuerdo de precio, fecha o diseño es estrictamente entre el Tatuador y el Cliente. La Plataforma se exime de responsabilidad ante cancelaciones, mala praxis o insatisfacción del cliente.</li>
              <li><strong>Veracidad:</strong> Los Tatuadores son responsables de la veracidad de la información de sus licencias sanitarias y ubicación dentro de sus respectivos territorios y jurisdicciones locales.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-white">4. Cuentas y Seguridad (MFA)</h2>
            <p className="text-gray-300 leading-relaxed">
              Para garantizar la seguridad de ambas partes, el uso de autenticación de dos factores (App de Autenticación / TOTP) es obligatorio para el inicio de sesión. El usuario es responsable de salvaguardar su código secreto.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
