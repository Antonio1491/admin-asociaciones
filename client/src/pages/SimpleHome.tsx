import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Link } from "wouter";

export default function SimpleHome() {
  const [searchTerm, setSearchTerm] = useState("");
  const sliderRef = useRef<HTMLDivElement>(null);

  const { data: companiesResponse, isLoading, error } = useQuery({
    queryKey: ["/api/companies"],
  });

  const companies = (companiesResponse as any)?.companies || [];
  
  const searchResults = searchTerm.length > 0 ? companies.filter((company: any) =>
    company.nombreEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.descripcionEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.category?.nombreCategoria?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : companies;

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <div style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "4rem 2rem",
        textAlign: "center" 
      }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>
          🏢 Directorio de Empresas
        </h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem", opacity: 0.9 }}>
          Descubre las mejores empresas y servicios
        </p>
        
        {/* Buscador */}
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <input
            type="text"
            placeholder="Buscar empresas, servicios o categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "1rem",
              fontSize: "1.1rem",
              border: "none",
              borderRadius: "50px",
              outline: "none",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}
          />
        </div>
      </div>

      {/* Contenido */}
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        {isLoading && (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{
              width: "50px",
              height: "50px",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem"
            }}></div>
            <p style={{ color: "#666", fontSize: "1.1rem" }}>Cargando empresas...</p>
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
            <h2 style={{ 
              fontSize: "2rem", 
              fontWeight: "bold", 
              marginBottom: "2rem",
              textAlign: "center",
              color: "#374151"
            }}>
              {searchTerm ? `Resultados de búsqueda (${searchResults.length})` : `Empresas Registradas (${companies.length})`}
            </h2>

            {searchResults.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ color: "#666", fontSize: "1.2rem" }}>
                  {searchTerm ? "No se encontraron empresas que coincidan con tu búsqueda." : "No hay empresas registradas."}
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
                      color: "#667eea"
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
                    padding: "0 20px"
                  }}
                >
                  {searchResults.slice(0, 5).map((company: any) => (
                    <div key={company.id} style={{ 
                      minWidth: "280px", 
                      maxWidth: "280px",
                      flexShrink: 0 
                    }}>
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
                      color: "#667eea"
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
    <div style={{
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      overflow: "hidden",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "pointer",
      height: "400px",
      display: "flex",
      flexDirection: "column"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
    }}>
      
      {/* Logo/Header */}
      <div style={{
        height: "120px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.8rem"
      }}>
        {company.logotipoUrl ? (
          <img
            src={company.logotipoUrl}
            alt={company.nombreEmpresa}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain"
            }}
          />
        ) : (
          <div style={{
            width: "60px",
            height: "60px",
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "white"
          }}>
            {company.nombreEmpresa?.charAt(0) || "?"}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Categoría */}
        {company.category && (
          <span style={{
            backgroundColor: "#eff6ff",
            color: "#2563eb",
            padding: "0.25rem 0.75rem",
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: "500",
            marginBottom: "1rem",
            display: "inline-block"
          }}>
            {company.category.nombreCategoria}
          </span>
        )}

        {/* Nombre */}
        <h3 style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          marginBottom: "0.5rem",
          color: "#1f2937"
        }}>
          {company.nombreEmpresa}
        </h3>

        {/* Descripción */}
        <div style={{
          color: "#6b7280",
          fontSize: "0.8rem",
          lineHeight: "1.3",
          marginBottom: "0.8rem",
          height: "2.4rem",
          overflow: "hidden",
          flex: 1
        }}
        dangerouslySetInnerHTML={{ 
          __html: company.descripcionEmpresa?.substring(0, 80) + "..." || "Sin descripción" 
        }} />

        {/* Información de contacto */}
        <div style={{ marginBottom: "0.8rem" }}>
          {company.direccionFisica && (
            <div style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.3rem",
              fontSize: "0.75rem",
              color: "#6b7280"
            }}>
              <span style={{ marginRight: "0.4rem" }}>📍</span>
              <span>{company.direccionFisica.substring(0, 25)}{company.direccionFisica.length > 25 ? "..." : ""}</span>
            </div>
          )}
          
          {company.telefono1 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              fontSize: "0.75rem",
              color: "#6b7280"
            }}>
              <span style={{ marginRight: "0.4rem" }}>📞</span>
              <span>{company.telefono1}</span>
            </div>
          )}
        </div>

        {/* Botón */}
        <Link href={`/empresa/${company.id}`}>
          <button style={{
            width: "100%",
            padding: "0.6rem",
            backgroundColor: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.9rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
            marginTop: "auto"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#5a67d8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#667eea";
          }}>
            Ver Detalles
          </button>
        </Link>
      </div>
    </div>
  );
}