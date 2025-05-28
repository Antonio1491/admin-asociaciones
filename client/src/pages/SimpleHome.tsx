import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

export default function SimpleHome() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: companiesResponse, isLoading, error } = useQuery({
    queryKey: ["/api/companies"],
  });

  const companies = (companiesResponse as any)?.companies || [];
  
  const searchResults = searchTerm.length > 0 ? companies.filter((company: any) =>
    company.nombreEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.descripcionEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.category?.nombreCategoria?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : companies;

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
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: "2rem"
              }}>
                {searchResults.map((company: any) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
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
      cursor: "pointer"
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
        height: "150px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
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
            {company.nombreEmpresa?.charAt(0) || "?"}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div style={{ padding: "1.5rem" }}>
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
          fontSize: "0.9rem",
          lineHeight: "1.4",
          marginBottom: "1rem",
          height: "2.8rem",
          overflow: "hidden"
        }}
        dangerouslySetInnerHTML={{ 
          __html: company.descripcionEmpresa?.substring(0, 120) + "..." || "Sin descripción" 
        }} />

        {/* Información de contacto */}
        <div style={{ marginBottom: "1rem" }}>
          {company.direccionFisica && (
            <div style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.5rem",
              fontSize: "0.85rem",
              color: "#6b7280"
            }}>
              <span style={{ marginRight: "0.5rem" }}>📍</span>
              <span>{company.direccionFisica.substring(0, 40)}{company.direccionFisica.length > 40 ? "..." : ""}</span>
            </div>
          )}
          
          {company.telefono1 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.5rem",
              fontSize: "0.85rem",
              color: "#6b7280"
            }}>
              <span style={{ marginRight: "0.5rem" }}>📞</span>
              <span>{company.telefono1}</span>
            </div>
          )}
        </div>

        {/* Botón */}
        <Link href={`/empresa/${company.id}`}>
          <button style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s ease"
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