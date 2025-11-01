export function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Auditoría Médica
          <span className="text-primary-600"> Facilitada</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Herramienta para facilitar auditorías médicas con gestión integral de evidencias
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10">
              Comenzar Auditoría
            </button>
          </div>
          <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
              Ver Documentación
            </button>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900">Gestión de Evidencias</h3>
            <p className="mt-2 text-sm text-gray-500">
              Organice y gestione todas las evidencias de auditoría en un solo lugar
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900">Reportes Automatizados</h3>
            <p className="mt-2 text-sm text-gray-500">
              Genere reportes de auditoría automáticamente con los datos recopilados
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900">Colaboración en Tiempo Real</h3>
            <p className="mt-2 text-sm text-gray-500">
              Trabaje en equipo con actualizaciones en tiempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}