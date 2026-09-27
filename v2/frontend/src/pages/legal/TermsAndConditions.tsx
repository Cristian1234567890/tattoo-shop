

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-200">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Términos y Condiciones de Uso</h1>
        <p className="mb-4 text-sm text-gray-500">Última actualización: Septiembre 2026 | Jurisdicción: República de Panamá</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Aceptación de los Términos</h2>
          <p className="mb-4">
            Al acceder y utilizar "Tattoo Hub" (la "Plataforma"), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio. Estos términos se rigen bajo las leyes de la República de Panamá.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Descripción del Servicio</h2>
          <p className="mb-4">
            La Plataforma actúa como un intermediario digital (Marketplace / Hub) que conecta a artistas del tatuaje independientes y estudios ("Tatuadores") con usuarios interesados en adquirir sus servicios ("Clientes"). La Plataforma no provee servicios de tatuaje directamente.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Rol y Responsabilidad</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Independencia:</strong> Los Tatuadores son contratistas independientes. No existe relación laboral entre la Plataforma y los Tatuadores.</li>
            <li><strong>Transacciones:</strong> Cualquier acuerdo de precio, fecha o diseño es estrictamente entre el Tatuador y el Cliente. La Plataforma se exime de responsabilidad ante cancelaciones, mala praxis o insatisfacción del cliente.</li>
            <li><strong>Veracidad:</strong> Los Tatuadores son responsables de la veracidad de la información de sus licencias sanitarias y ubicación dentro del territorio panameño.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Cuentas y Seguridad (MFA)</h2>
          <p className="mb-4">
            Para garantizar la seguridad de ambas partes, el uso de autenticación de dos factores (App de Autenticación / TOTP) es obligatorio para el inicio de sesión. El usuario es responsable de salvaguardar su código secreto.
          </p>
        </section>
      </div>
    </div>
  );
}
