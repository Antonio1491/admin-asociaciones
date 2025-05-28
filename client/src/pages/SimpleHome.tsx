export default function SimpleHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              🎉 ¡Directorio de Empresas!
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Plataforma funcionando correctamente
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            ¡Excelente! El frontend está funcionando
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Ahora podemos proceder con las funcionalidades completas
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">Directorio Público</h3>
              <p className="text-gray-600">Vista pública de empresas registradas</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-green-600">Panel Administrativo</h3>
              <p className="text-gray-600">Gestión completa de empresas y usuarios</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-purple-600">Búsqueda Avanzada</h3>
              <p className="text-gray-600">Filtros por categoría, ubicación y más</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}