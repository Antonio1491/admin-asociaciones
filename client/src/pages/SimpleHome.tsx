import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Link } from "wouter";

function CategoriesSection() {
  const {
    data: categoriesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/categories"],
  });

  const categories = (categoriesResponse as any) || [];

  // Iconos para diferentes categorías
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
        backgroundColor: "#f8fafc",
        padding: "4rem 2rem",
        borderTop: "1px solid #e5e7eb",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            fontSize: "2.2rem",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: "3rem",
            color: "#0f2161",
          }}
        >
          Explora por Categorías
        </h2>

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

export default function SimpleHome() {
  const [searchTerm, setSearchTerm] = useState("");
  const sliderRef = useRef<HTMLDivElement>(null);

  const {
    data: companiesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/companies"],
  });

  const companies = (companiesResponse as any)?.companies || [];

  const searchResults =
    searchTerm.length > 0
      ? companies.filter(
          (company: any) =>
            company.nombreEmpresa
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            company.descripcionEmpresa
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            company.category?.nombreCategoria
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()),
        )
      : companies;

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
          padding: "5rem 2rem",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Overlay adicional */}
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
            Encuentra las mejores empresas y servicios profesionales
          </p>

          {/* Buscador mejorado */}
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ position: "relative", display: "flex" }}>
              <input
                type="text"
                placeholder="empresas, servicios o categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: "1.2rem 1.5rem",
                  fontSize: "1.1rem",
                  border: "none",
                  borderRadius: "50px 0 0 50px",
                  outline: "none",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  backgroundColor: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  color: "#333",
                }}
              />
              <button
                style={{
                  backgroundColor: "#bcce16",
                  color: "#0f2161",
                  border: "none",
                  borderRadius: "0 50px 50px 0",
                  padding: "1.2rem 2rem",
                  fontSize: "1rem",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#a8b914";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#bcce16";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onClick={() => {
                  // Trigger search functionality if needed
                }}
              >
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
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Categorías */}
      <CategoriesSection />

      {/* Contenido */}
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
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "2rem",
                textAlign: "center",
                color: "#374151",
              }}
            >
              {searchTerm
                ? `Resultados de búsqueda (${searchResults.length})`
                : `Empresas Registradas (${companies.length})`}
            </h2>

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
                {/* Botón Izquierdo */}
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

                {/* Slider Container */}
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
                        minWidth: "280px",
                        maxWidth: "280px",
                        flexShrink: 0,
                      }}
                    >
                      <CompanyCard company={company} />
                    </div>
                  ))}
                </div>

                {/* Botón Derecho */}
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
    </div>
  );
}

function CompanyCard({ company }: { company: any }) {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
        height: "400px",
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
      {/* Logo/Header */}
      <div
        style={{
          height: "120px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.8rem",
        }}
      >
        {company.logotipoUrl ? (
          <img
            src={company.logotipoUrl}
            alt={company.nombreEmpresa}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
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

      {/* Contenido */}
      <div
        style={{
          padding: "1rem",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Categoría */}
        {company.category && (
          <span
            style={{
              backgroundColor: "#eff6ff",
              color: "#2563eb",
              padding: "0.25rem 0.75rem",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: "500",
              marginBottom: "1rem",
              display: "inline-block",
            }}
          >
            {company.category.nombreCategoria}
          </span>
        )}

        {/* Nombre */}
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
            color: "#1f2937",
          }}
        >
          {company.nombreEmpresa}
        </h3>

        {/* Descripción */}
        <div
          style={{
            color: "#6b7280",
            fontSize: "0.8rem",
            lineHeight: "1.3",
            marginBottom: "0.8rem",
            height: "2.4rem",
            overflow: "hidden",
            flex: 1,
          }}
          dangerouslySetInnerHTML={{
            __html:
              company.descripcionEmpresa?.substring(0, 80) + "..." ||
              "Sin descripción",
          }}
        />

        {/* Información de contacto */}
        <div style={{ marginBottom: "0.8rem" }}>
          {company.direccionFisica && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.3rem",
                fontSize: "0.75rem",
                color: "#6b7280",
              }}
            >
              <span style={{ marginRight: "0.4rem" }}>📍</span>
              <span>
                {company.direccionFisica.substring(0, 25)}
                {company.direccionFisica.length > 25 ? "..." : ""}
              </span>
            </div>
          )}

          {company.telefono1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "0.75rem",
                color: "#6b7280",
              }}
            >
              <span style={{ marginRight: "0.4rem" }}>📞</span>
              <span>{company.telefono1}</span>
            </div>
          )}
        </div>

        {/* Botón */}
        <Link href={`/empresa/${company.id}`}>
          <button
            style={{
              width: "100%",
              padding: "0.6rem",
              backgroundColor: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: "700",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
              marginTop: "auto",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#5a67d8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#667eea";
            }}
          >
            Ver Detalles
          </button>
        </Link>
      </div>
    </div>
  );
}
