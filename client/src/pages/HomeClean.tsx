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

function CategoriesSection() {
  const {
    data: categoriesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/categories"],
  });

  const categories = (categoriesResponse as any) || [];

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes("tecnología") || name.includes("software")) return "💻";
    if (name.includes("salud") || name.includes("médico")) return "🏥";
    if (name.includes("educación") || name.includes("escuela")) return "🎓";
    if (name.includes("comercio") || name.includes("tienda")) return "🛍️";
    if (name.includes("construcción") || name.includes("inmueble")) return "🏗️";
    if (name.includes("transporte") || name.includes("logística")) return "🚛";
    if (name.includes("finanzas") || name.includes("banco")) return "💰";
    if (name.includes("turismo") || name.includes("hotel")) return "✈️";
    if (name.includes("marketing") || name.includes("publicidad")) return "📢";
    if (name.includes("legal") || name.includes("abogado")) return "⚖️";
    return "🏢";
  };

  if (isLoading || error || categories.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: "transparent",
        padding: "1rem 0 2rem 0",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <h5
          style={{
            fontSize: "1rem",
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: "1.5rem",
            marginTop: "2rem",
            color: "white",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          Explore por Solución: Su Puerta de Entrada a Proveedores Especializados
        </h5>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "2rem",
            justifyItems: "center",
          }}
        >
          {categories.slice(0, 8).map((category: any) => (
            <CategoryIcon
              key={category.id}
              category={category}
              icon={getCategoryIcon(category.nombreCategoria)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryIcon({ category, icon }: { category: any; icon: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          backgroundColor: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          border: "2px solid #f1f5f9",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#bcce16";
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
          const iconElement = e.currentTarget.querySelector(
            ".category-icon",
          ) as HTMLElement;
          const textElement = e.currentTarget.querySelector(
            ".category-text",
          ) as HTMLElement;
          if (iconElement)
            iconElement.style.filter = "grayscale(0%) brightness(0) invert(1)";
          if (textElement) textElement.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "white";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          const iconElement = e.currentTarget.querySelector(
            ".category-icon",
          ) as HTMLElement;
          const textElement = e.currentTarget.querySelector(
            ".category-text",
          ) as HTMLElement;
          if (iconElement)
            iconElement.style.filter = "grayscale(100%) brightness(0.6)";
          if (textElement) textElement.style.color = "#6b7280";
        }}
      >
        <div
          className="category-icon"
          style={{
            fontSize: "2.5rem",
            marginBottom: "0.5rem",
            filter: "grayscale(100%) brightness(0.6)",
            transition: "all 0.3s ease",
          }}
        >
          {icon}
        </div>
        <span
          className="category-text"
          style={{
            fontSize: "0.75rem",
            fontWeight: "600",
            textAlign: "center",
            lineHeight: "1.2",
            color: "#6b7280",
            transition: "all 0.3s ease",
            maxWidth: "90px",
          }}
        >
          {category.nombreCategoria}
        </span>
      </div>
    </div>
  );
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {company.categories && company.categories.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "8px",
                left: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {getCategoryIcon(company.categories[0].nombreCategoria)}
            </div>
          )}

          {!company.imagenPortada && !company.logotipoUrl && (
            <div
              style={{
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

export default function HomeClean() {
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
  
  // Obtener ubicaciones únicas de las empresas
  const locations = companies.map((company: any) => company.ciudad).filter(Boolean);
  const uniqueLocations = locations.filter((location, index) => locations.indexOf(location) === index);

  const searchResults = companies.filter((company: any) => {
    const matchesSearch = searchTerm.trim() === "" || 
      company.nombreEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.descripcionEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.categories?.some((cat: any) => cat.nombreCategoria?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "" || 
      company.categories?.some((cat: any) => cat.id?.toString() === selectedCategory);
    
    const matchesLocation = selectedLocation === "" || 
      company.ciudad === selectedLocation;
    
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
        style={{
          background: `linear-gradient(rgba(15, 33, 97, 0.9), rgba(15, 33, 97, 0.7)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          color: "white",
          padding: "5rem 2rem 3rem 2rem",
          textAlign: "center",
          position: "relative",
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
            style={{
              fontSize: "3.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Directorio de Proveedores
          </h1>
          <p
            style={{
              fontSize: "1.3rem",
              marginBottom: "3rem",
              opacity: 0.95,
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            Conéctese con fabricantes, distribuidores y especialistas líderes. Descubra soluciones innovadoras y haga crecer su red de proyectos. ¡Comience su búsqueda hoy mismo!
          </p>

          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              {/* Campo de búsqueda */}
              <div style={{ flex: 2, position: "relative" }}>
                <input
                  type="text"
                  placeholder="empresas, servicios o categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "1.2rem 3rem 1.2rem 1.5rem",
                    fontSize: "1.1rem",
                    border: "none",
                    borderRadius: "50px",
                    outline: "none",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                    color: "#333",
                  }}
                />
                <div style={{
                  position: "absolute",
                  right: "1.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6b7280",
                  pointerEvents: "none"
                }}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
              </div>
              
              {/* Filtro de categoría */}
              <div style={{ flex: 1 }}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "1.2rem 1.5rem",
                    fontSize: "1.1rem",
                    border: "none",
                    borderRadius: "50px",
                    outline: "none",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                    color: "#333",
                    cursor: "pointer",
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
              <div style={{ flex: 1 }}>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "1.2rem 1.5rem",
                    fontSize: "1.1rem",
                    border: "none",
                    borderRadius: "50px",
                    outline: "none",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                    color: "#333",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Todas las ubicaciones</option>
                  {uniqueLocations.map((location: any) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de categorías integrada dentro del header */}
        <CategoriesSection />
      </div>

      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        {isLoading && (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "3px solid #f3f3f3",
                borderTop: "3px solid #667eea",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1rem",
              }}
            ></div>
            <p style={{ color: "#666", fontSize: "1.1rem" }}>
              Cargando empresas...
            </p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "#dc2626", fontSize: "1.1rem" }}>
              Error al cargar las empresas: {String(error)}
            </p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                textAlign: "center",
                color: "#4a4a49",
                fontFamily: "'Montserrat', sans-serif",
                lineHeight: "1.2"
              }}
            >
              Encuentre Exactamente lo que Necesita para su Proyecto
            </h2>
            
            <p style={{
              fontSize: "1.1rem",
              textAlign: "center",
              color: "#6b7280",
              marginBottom: "3rem",
              maxWidth: "800px",
              margin: "0 auto 3rem auto"
            }}>
              {searchTerm
                ? `Resultados de búsqueda (${searchResults.length})`
                : `Descubra ${companies.length} empresas líderes en diferentes sectores`}
            </p>

            {searchResults.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ color: "#666", fontSize: "1.2rem" }}>
                  {searchTerm
                    ? "No se encontraron empresas que coincidan con tu búsqueda."
                    : "No hay empresas registradas."}
                </p>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                {companies.length > 3 && (
                  <button
                    onClick={scrollLeft}
                    style={{
                      position: "absolute",
                      left: "-20px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                      backgroundColor: "white",
                      border: "2px solid #e5e7eb",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      fontSize: "1.5rem",
                      color: "#667eea",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                  >
                    ‹
                  </button>
                )}

                <div
                  ref={sliderRef}
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    overflowX: "auto",
                    scrollBehavior: "smooth",
                    paddingBottom: "1rem",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    padding: "0 20px",
                  }}
                >
                  {searchResults.slice(0, 5).map((company: any) => (
                    <div
                      key={company.id}
                      style={{
                        minWidth: "220px",
                        maxWidth: "220px",
                        flexShrink: 0,
                      }}
                    >
                      <CompanyCard company={company} />
                    </div>
                  ))}
                </div>

                {companies.length > 3 && (
                  <button
                    onClick={scrollRight}
                    style={{
                      position: "absolute",
                      right: "-20px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                      backgroundColor: "white",
                      border: "2px solid #e5e7eb",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      fontSize: "1.5rem",
                      color: "#667eea",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                  >
                    ›
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Nueva sección: Empresas líderes por categoría */}
      <div style={{ padding: "4rem 2rem", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            textAlign: "center",
            color: "#0f2161",
            fontFamily: "'Montserrat', sans-serif"
          }}>
            Empresas líderes en las que puede confiar
          </h2>
          
          <p style={{
            fontSize: "1.1rem",
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "3rem",
            maxWidth: "800px",
            margin: "0 auto 3rem auto"
          }}>
            Descubra empresas mejor valoradas, soluciones innovadoras y proyectos inspiradores. 
            Haga clic para explorar sus perfiles y conectarse directamente.
          </p>

          {/* Slider de empresas por categoría */}
          <div style={{ position: "relative" }}>
            {/* Botones de navegación */}
            <button
              onClick={scrollCategoryLeft}
              style={{
                position: "absolute",
                left: "-10px",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "white",
                border: "2px solid #e5e7eb",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                zIndex: 10,
                color: "#0f2161"
              }}
            >
              ‹
            </button>

            <button
              onClick={scrollCategoryRight}
              style={{
                position: "absolute",
                right: "-10px",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "white",
                border: "2px solid #e5e7eb",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                zIndex: 10,
                color: "#0f2161"
              }}
            >
              ›
            </button>

            <div 
              ref={categorySliderRef}
              style={{
                display: "flex",
                gap: "2rem",
                overflowX: "auto",
                scrollBehavior: "smooth",
                paddingBottom: "1rem",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                padding: "0 20px",
                WebkitOverflowScrolling: "touch"
              }}>
              {categories.map((category: any) => {
                // Buscar una empresa de esta categoría
                const categoryCompany = companies.find((company: any) => 
                  company.categoriesIds && company.categoriesIds.includes(category.id)
                );
                
                if (!categoryCompany) return null;
                
                return (
                  <div key={category.id} style={{ 
                    minWidth: "600px", 
                    maxWidth: "600px",
                    flexShrink: 0 
                  }}>
                    <div style={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      overflow: "hidden",
                      display: "flex",
                      height: "300px"
                    }}>
                      {/* Imagen del producto */}
                      <div style={{
                        width: "50%",
                        background: categoryCompany.imagenPortada
                          ? `url(${categoryCompany.imagenPortada}) center/cover`
                          : categoryCompany.logotipoUrl
                          ? `url(${categoryCompany.logotipoUrl}) center/contain no-repeat #f8fafc`
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        position: "relative"
                      }}>
                        {/* Badge de categoría en la imagen */}
                        <div style={{
                          position: "absolute",
                          top: "1rem",
                          left: "1rem",
                          backgroundColor: "#0f2161",
                          color: "white",
                          padding: "0.5rem 1rem",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem"
                        }}>
                          {getCategoryIcon(category.nombreCategoria)} {category.nombreCategoria}
                        </div>
                        
                        {!categoryCompany.imagenPortada && !categoryCompany.logotipoUrl && (
                          <div style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "80px",
                            height: "80px",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2rem",
                            fontWeight: "bold",
                            color: "white"
                          }}>
                            {categoryCompany.nombreEmpresa?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>
                      
                      {/* Ficha técnica de la empresa */}
                      <div style={{
                        width: "50%",
                        padding: "2rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                      }}>
                        <div>
                          <h3 style={{
                            fontSize: "1.4rem",
                            fontWeight: "700",
                            color: "#0f2161",
                            marginBottom: "0.5rem",
                            fontFamily: "'Montserrat', sans-serif"
                          }}>
                            {categoryCompany.nombreEmpresa}
                          </h3>
                          
                          <div style={{
                            color: "#6b7280",
                            fontSize: "0.9rem",
                            lineHeight: "1.5",
                            marginBottom: "1rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                          dangerouslySetInnerHTML={{ 
                            __html: categoryCompany.descripcionEmpresa || "Empresa especializada en soluciones innovadoras"
                          }} />
                          
                          {/* Información de contacto */}
                          <div style={{ marginBottom: "1rem" }}>
                            {categoryCompany.ciudad && (
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "0.5rem",
                                fontSize: "0.8rem",
                                color: "#6b7280"
                              }}>
                                <span style={{ marginRight: "0.5rem" }}>📍</span>
                                <span>{categoryCompany.ciudad}</span>
                              </div>
                            )}
                            
                            {categoryCompany.telefono1 && (
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                fontSize: "0.8rem",
                                color: "#6b7280"
                              }}>
                                <span style={{ marginRight: "0.5rem" }}>📞</span>
                                <span>{categoryCompany.telefono1}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Botón ver detalles */}
                        <Link href={`/empresa/${categoryCompany.id}`}>
                          <button style={{
                            backgroundColor: "#bcce16",
                            color: "#0f2161",
                            border: "none",
                            borderRadius: "50px",
                            padding: "0.8rem 1.5rem",
                            fontSize: "0.9rem",
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: "700",
                            cursor: "pointer",
                            width: "100%",
                            transition: "background-color 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#a8b914";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#bcce16";
                          }}>
                            Ver Detalles
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sección de reseñas */}
      <div style={{ padding: "4rem 2rem", backgroundColor: "white" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            textAlign: "center",
            color: "#0f2161",
            fontFamily: "'Montserrat', sans-serif"
          }}>
            Escuche a Nuestra Comunidad: Proyectos Reales, Experiencias Auténticas
          </h2>
          
          <p style={{
            fontSize: "1.1rem",
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "3rem",
            maxWidth: "900px",
            margin: "0 auto 3rem auto"
          }}>
            Lea reseñas auténticas de productos y proveedores, comparta sus opiniones y conéctese con sus pares. 
            Su retroalimentación da forma a nuestra red de confianza y excelencia.
          </p>

          {/* Grid de reseñas */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "2rem",
            marginBottom: "3rem"
          }}>
            {/* Reseña 1 */}
            <div style={{
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              padding: "2rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{
                display: "flex",
                marginBottom: "1rem"
              }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: "#bcce16", fontSize: "1.2rem" }}>★</span>
                ))}
              </div>
              
              <p style={{
                fontSize: "1rem",
                lineHeight: "1.6",
                color: "#374151",
                marginBottom: "1.5rem",
                fontStyle: "italic"
              }}>
                "Excelente experiencia trabajando con EcoTech Solutions. Su equipo técnico resolvió nuestros problemas de automatización de manera eficiente y profesional. Definitivamente los recomendaría."
              </p>
              
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "#0f2161",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.2rem",
                  fontWeight: "bold"
                }}>
                  MR
                </div>
                <div>
                  <div style={{
                    fontWeight: "600",
                    color: "#0f2161",
                    fontSize: "0.9rem"
                  }}>
                    María Rodríguez
                  </div>
                  <div style={{
                    color: "#6b7280",
                    fontSize: "0.8rem"
                  }}>
                    Gerente de Operaciones - Industrias del Norte
                  </div>
                </div>
              </div>
            </div>

            {/* Reseña 2 */}
            <div style={{
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              padding: "2rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{
                display: "flex",
                marginBottom: "1rem"
              }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: "#bcce16", fontSize: "1.2rem" }}>★</span>
                ))}
              </div>
              
              <p style={{
                fontSize: "1rem",
                lineHeight: "1.6",
                color: "#374151",
                marginBottom: "1.5rem",
                fontStyle: "italic"
              }}>
                "La calidad de los productos de MarketPro es excepcional. Hemos trabajado con ellos durante 3 años y siempre superan nuestras expectativas. Su servicio al cliente es de primera clase."
              </p>
              
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "#0f2161",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.2rem",
                  fontWeight: "bold"
                }}>
                  CL
                </div>
                <div>
                  <div style={{
                    fontWeight: "600",
                    color: "#0f2161",
                    fontSize: "0.9rem"
                  }}>
                    Carlos López
                  </div>
                  <div style={{
                    color: "#6b7280",
                    fontSize: "0.8rem"
                  }}>
                    Director de Compras - Comercial Metropolitana
                  </div>
                </div>
              </div>
            </div>

            {/* Reseña 3 */}
            <div style={{
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              padding: "2rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{
                display: "flex",
                marginBottom: "1rem"
              }}>
                {[...Array(4)].map((_, i) => (
                  <span key={i} style={{ color: "#bcce16", fontSize: "1.2rem" }}>★</span>
                ))}
                <span style={{ color: "#d1d5db", fontSize: "1.2rem" }}>★</span>
              </div>
              
              <p style={{
                fontSize: "1rem",
                lineHeight: "1.6",
                color: "#374151",
                marginBottom: "1.5rem",
                fontStyle: "italic"
              }}>
                "Muy buena experiencia con TechnoSoft. Sus soluciones de software nos ayudaron a optimizar nuestros procesos internos. El soporte técnico es rápido y efectivo."
              </p>
              
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "#0f2161",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.2rem",
                  fontWeight: "bold"
                }}>
                  AS
                </div>
                <div>
                  <div style={{
                    fontWeight: "600",
                    color: "#0f2161",
                    fontSize: "0.9rem"
                  }}>
                    Ana Silva
                  </div>
                  <div style={{
                    color: "#6b7280",
                    fontSize: "0.8rem"
                  }}>
                    Coordinadora TI - Servicios Integrales
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Sección de registro para proveedores */}
      <div style={{ 
        padding: "4rem 2rem", 
        backgroundColor: "#0f2161",
        color: "white" 
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            fontFamily: "'Montserrat', sans-serif",
            color: "white"
          }}>
            ¿Es Usted un Proveedor de Equipamiento Urbano o Parques?
          </h2>
          
          <p style={{
            fontSize: "1.2rem",
            lineHeight: "1.6",
            marginBottom: "2.5rem",
            color: "#e5e7eb"
          }}>
            Regístrese y conecte con miles de proyectos y clientes potenciales en todo América Latina. 
            Muestre sus soluciones a la audiencia correcta.
          </p>

          <Link href="/login">
            <button style={{
              backgroundColor: "#bcce16",
              color: "#0f2161",
              border: "none",
              borderRadius: "50px",
              padding: "1.2rem 2.5rem",
              fontSize: "1.1rem",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: "700",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
              boxShadow: "0 4px 6px rgba(0,0,0,0.2)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#a8b914";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#bcce16";
            }}>
              Regístrate como empresa
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
