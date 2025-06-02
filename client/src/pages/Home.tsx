import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Link } from "wouter";

function getCategoryIcon(categoryName: string): string {
  const iconMap: { [key: string]: string } = {
    Comercio: "🛍️",
    Tecnología: "💻",
    Servicios: "🔧",
    Salud: "⚕️",
    Educación: "📚",
    Alimentación: "🍽️",
    Construcción: "🏗️",
    Transporte: "🚛",
    Financiero: "💰",
    Entretenimiento: "🎭",
  };
  return iconMap[categoryName] || "🏢";
}

function CompanyCard({ company }: { company: any }) {
  return (
    <Link href={`/empresa/${company.id}`}>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          overflow: "hidden",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          cursor: "pointer",
          aspectRatio: "1",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
        }}
      >
        <div
          style={{
            height: "75%",
            background: company.imagenPortada
              ? `url(${company.imagenPortada}) center/cover`
              : company.logotipoUrl
              ? `url(${company.logotipoUrl}) center/contain no-repeat #f8fafc`
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            position: "relative",
          }}
        >
          {!company.imagenPortada && !company.logotipoUrl && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "60px",
                height: "60px",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "white",
              }}
            >
              {company.nombreEmpresa?.charAt(0) || "?"}
            </div>
          )}

          {company.membershipType && (
            <div
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                backgroundColor: company.membershipType.nombreTipo === "Premium" 
                  ? "#eab308" : company.membershipType.nombreTipo === "Pro" 
                  ? "#3b82f6" : "#6b7280",
                color: "white",
                padding: "0.25rem 0.5rem",
                borderRadius: "12px",
                fontSize: "0.7rem",
                fontWeight: "600",
              }}
            >
              {company.membershipType.nombreTipo}
            </div>
          )}
        </div>

        <div
          style={{
            height: "25%",
            padding: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: "600",
              color: "#1f2937",
              textAlign: "center",
              lineHeight: "1.2",
              margin: "0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {company.nombreEmpresa}
          </h3>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const sliderRef = useRef<HTMLDivElement>(null);
  const categorySliderRef = useRef<HTMLDivElement>(null);

  const {
    data: companiesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/companies"],
  });

  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["/api/categories"],
  });

  const companies = (companiesResponse as any)?.companies || [];
  const categories = (categoriesResponse as any) || [];
  
  // Lista de estados mexicanos para el selector de ubicaciones
  const mexicanStates = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", 
    "Chiapas", "Chihuahua", "Coahuila", "Colima", "Ciudad de México", 
    "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo", 
    "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", 
    "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", 
    "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
  ];

  const searchResults = companies.filter((company: any) => {
    const matchesSearch = searchTerm.trim() === "" || 
      company.nombreEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.descripcionEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.categories?.some((cat: any) => cat.nombreCategoria?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "" || 
      company.categories?.some((cat: any) => cat.id?.toString() === selectedCategory);
    
    const matchesLocation = selectedLocation === "" || 
      (company.estadosPresencia && company.estadosPresencia.includes(selectedLocation));
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  const scrollCategoryLeft = () => {
    if (categorySliderRef.current) {
      categorySliderRef.current.scrollBy({ left: -620, behavior: "smooth" });
    }
  };

  const scrollCategoryRight = () => {
    if (categorySliderRef.current) {
      categorySliderRef.current.scrollBy({ left: 620, behavior: "smooth" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <div
        className="relative text-center text-white"
        style={{
          background: `linear-gradient(rgba(15, 33, 97, 0.9), rgba(15, 33, 97, 0.7)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          padding: "5rem 1rem 3rem 1rem",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 1,
          }}
        ></div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <h1
            className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4"
            style={{
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Directorio de Proveedores
          </h1>
          <p
            className="text-sm md:text-lg lg:text-xl mb-8 opacity-95 max-w-4xl mx-auto px-4"
            style={{
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            Conéctese con fabricantes, distribuidores y especialistas líderes. Descubra soluciones innovadoras y haga crecer su red de proyectos. ¡Comience su búsqueda hoy mismo!
          </p>

          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Campo de búsqueda - SIN LUPA */}
              <div className="flex-1 md:flex-2 relative">
                <input
                  type="text"
                  placeholder="empresas, servicios o categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-3 md:py-4 text-sm md:text-lg rounded-lg border-none outline-none text-gray-700"
                  style={{
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "8px",
                  }}
                />
              </div>
              
              {/* Filtro de categoría */}
              <div className="flex-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 md:py-4 text-sm md:text-lg rounded-lg border-none outline-none text-gray-700 cursor-pointer"
                  style={{
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "8px",
                  }}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.nombreCategoria}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Filtro de ubicación */}
              <div className="flex-1">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-3 md:py-4 text-sm md:text-lg rounded-lg border-none outline-none text-gray-700 cursor-pointer"
                  style={{
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "8px",
                  }}
                >
                  <option value="">Todas las ubicaciones</option>
                  {mexicanStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de categorías deslizable */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="overflow-x-auto">
            <div className="flex space-x-4 min-w-max pb-2">
              <Link href="/directorio">
                <button className="flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex-shrink-0 bg-white text-gray-700">
                  🏢 Todas las empresas
                </button>
              </Link>
              {categories.map((category: any) => (
                <Link 
                  key={category.id} 
                  href={`/directorio?categoryId=${category.id}`}
                >
                  <button className="flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex-shrink-0 bg-white text-gray-700">
                    {getCategoryIcon(category.nombreCategoria)} {category.nombreCategoria}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="py-8 md:py-16 px-4 max-w-6xl mx-auto">
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">
              Cargando empresas...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">
              Error al cargar las empresas: {String(error)}
            </p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-center text-gray-700 font-['Montserrat'] leading-tight">
              Encuentre Exactamente lo que Necesita para su Proyecto
            </h2>
            
            <p className="text-sm md:text-lg text-center text-gray-500 mb-8 md:mb-12 max-w-4xl mx-auto px-4">
              {searchTerm
                ? `Resultados de búsqueda (${searchResults.length})`
                : `Descubra ${companies.length} empresas líderes en diferentes sectores`}
            </p>

            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg md:text-xl">
                  {searchTerm
                    ? "No se encontraron empresas que coincidan con tu búsqueda."
                    : "No hay empresas registradas."}
                </p>
              </div>
            ) : (
              <div className="relative">
                {companies.length > 3 && (
                  <button
                    onClick={scrollLeft}
                    className="hidden md:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border-2 border-gray-200 rounded-full w-12 h-12 items-center justify-center cursor-pointer shadow-lg text-xl text-blue-500 hover:bg-gray-50"
                  >
                    ‹
                  </button>
                )}

                <div
                  ref={sliderRef}
                  className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide px-0 md:px-5"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {searchResults.slice(0, 5).map((company: any) => (
                    <div
                      key={company.id}
                      className="min-w-[280px] md:min-w-[320px] lg:min-w-[280px] max-w-[280px] md:max-w-[320px] lg:max-w-[280px] flex-shrink-0"
                    >
                      <CompanyCard company={company} />
                    </div>
                  ))}
                </div>

                {companies.length > 3 && (
                  <button
                    onClick={scrollRight}
                    className="hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border-2 border-gray-200 rounded-full w-12 h-12 items-center justify-center cursor-pointer shadow-lg text-xl text-blue-500 hover:bg-gray-50"
                  >
                    ›
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}