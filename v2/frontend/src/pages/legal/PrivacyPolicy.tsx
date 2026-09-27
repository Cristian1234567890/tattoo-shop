

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-200">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Políticas de Privacidad</h1>
        <p className="mb-4 text-sm text-gray-500">Última actualización: Septiembre 2026 | Jurisdicción: República de Panamá (Ley 81 de Protección de Datos Personales)</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Recopilación de Datos</h2>
          <p className="mb-4">
            Recopilamos la información que usted nos proporciona directamente al registrarse mediante Google OAuth o correo electrónico, incluyendo nombre, correo y configuración de autenticación 2FA. Para Tatuadores, recopilamos adicionalmente ubicación geográfica y portafolio de imágenes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Uso de la Información</h2>
          <p className="mb-4">
            Utilizamos su información para:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Mantener y mejorar la Plataforma.</li>
            <li>Conectar a Tatuadores y Clientes mediante nuestro directorio de mapas.</li>
            <li>Gestionar la seguridad de la cuenta a través de nuestro sistema de validación TOTP de 6 dígitos.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Compartición de Datos</h2>
          <p className="mb-4">
            Los perfiles de los Tatuadores son públicos (incluyendo nombre, estilo y geolocalización aproximada o exacta proporcionada). La información de los Clientes se mantiene privada y solo se comparte de forma limitada con el Tatuador al momento de confirmar una cita.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Seguridad de la Información</h2>
          <p className="mb-4">
            Toda la información se almacena en bases de datos con políticas de acceso a nivel de fila (RLS), asegurando que solo los dueños legítimos puedan modificar su información. Protegemos los datos conforme a los estándares técnicos dictados por la Ley 81 de la República de Panamá.
          </p>
        </section>
      </div>
    </div>
  );
}
