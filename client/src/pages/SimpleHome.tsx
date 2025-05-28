export default function SimpleHome() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#3B82F6", color: "white", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "2rem" }}>
          ✅ PÁGINA FUNCIONANDO
        </h1>
        
        <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
          El frontend está operativo correctamente
        </p>
        
        <div style={{ backgroundColor: "white", color: "black", padding: "2rem", borderRadius: "8px", marginTop: "2rem" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Plataforma de Administración Web
          </h2>
          <p style={{ fontSize: "1.2rem" }}>
            Directorio de empresas con panel administrativo
          </p>
        </div>
        
        <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}>
          <p>Si ves este mensaje, React está funcionando perfectamente</p>
        </div>
      </div>
    </div>
  );
}