import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap, ShoppingCart } from "lucide-react";
import type { MembershipType } from "@/../../shared/schema";
import headerDirectorioImage from "@assets/header_directorio.png";
import fondoHeaderDirectorioImage from "@assets/fondo_header_directorio.png";

export default function PublicMemberships() {
  const [, setLocation] = useLocation();
  
  const { data: memberships, isLoading } = useQuery({
    queryKey: ["/api/membership-types/public"],
    queryFn: async () => {
      const response = await fetch("/api/membership-types/public");
      if (!response.ok) throw new Error("Failed to fetch memberships");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando membresías...</p>
          </div>
        </div>
      </div>
    );
  }

  const getIcon = (index: number) => {
    const icons = [Star, Zap, Crown];
    const Icon = icons[index % icons.length];
    return Icon;
  };

  const getColorScheme = (index: number) => {
    const schemes = [
      { bg: "bg-blue-600", border: "border-blue-200", accent: "text-blue-600" },
      { bg: "bg-green-600", border: "border-green-200", accent: "text-green-600" },
      { bg: "bg-purple-600", border: "border-purple-200", accent: "text-purple-600" },
    ];
    return schemes[index % schemes.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative min-h-[500px] bg-cover bg-center bg-no-repeat flex items-center"
        style={{
          backgroundImage: `url(${fondoHeaderDirectorioImage})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover'
        }}
      >
        {/* Overlay para mejor legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/50"></div>
        
        {/* Contenido del Hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Directorio de
              <br />
              Equipamiento Urbano
              <br />
              LATAM
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              El espacio donde proveedores y líderes de la industria del espacio público se encuentran
            </p>
            
            <Button 
              size="lg"
              className="text-black font-bold px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              style={{ 
                backgroundColor: '#bcce16'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a8b814'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#bcce16'}
              onClick={() => {
                const plansSection = document.getElementById('membership-plans');
                if (plansSection) {
                  plansSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              ÚNETE AHORA
            </Button>
          </div>
        </div>
      </div>

      {/* ¿Qué es el Directorio? - Nueva sección */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contenido del texto */}
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                ¿Qué es el Directorio?
              </h2>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className="text-lg">
                  El Directorio de Equipamiento Urbano LATAM es una plataforma digital creada por la{" "}
                  <span className="font-semibold text-green-600">ANPR México</span> que conecta a empresas 
                  proveedoras con líderes en diseño y gestión de espacios públicos en América Latina.
                </p>
                
                <p className="text-lg">
                  Más que un catálogo, es una herramienta estratégica para impulsar la visibilidad comercial, 
                  fomentar alianzas y generar nuevas oportunidades de negocio en la región.
                </p>
              </div>
            </div>
            
            {/* Imagen ilustrativa */}
            <div className="order-1 lg:order-2 flex justify-center">
              <img 
                src="/attached_assets/que_es_el_directorio.png"
                alt="Ilustración del Directorio de Equipamiento Urbano"
                className="w-full max-w-md lg:max-w-lg h-auto"
              />
            </div>
          </div>
        </div>
      </div>



      {/* ¿Quién puede formar parte? */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">
            ¿Quién puede formar parte?
          </h2>
          <div className="mb-8 text-center">
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              El Directorio está abierto a empresas de toda América Latina que ofrecen productos, 
              servicios o soluciones especializadas para parques, espacios públicos y entornos urbanos. 
              Está diseñado para visibilizar a actores clave de la industria del equipamiento urbano, incluyendo:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🎪", title: "Juegos infantiles" },
              { icon: "🪑", title: "Mobiliario urbano" },
              { icon: "🏀", title: "Superficies deportivas" },
              { icon: "🚏", title: "Señalética y accesibilidad" },
              { icon: "💧", title: "Tecnología de riego y landscaping" },
              { icon: "💡", title: "Iluminación y energía limpia" },
              { icon: "🌿", title: "Mantenimiento de áreas verdes y manejo de residuos" },
              { icon: "🔒", title: "Seguridad, movilidad eléctrica y accesos automatizados" },
              { icon: "🏗️", title: "Diseño, construcción y servicios para parques" },
              { icon: "👕", title: "Uniformes, productos promocionales" },
              { icon: "➕", title: "y más..." }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3 text-center">{item.icon}</div>
                <h3 className="text-center font-medium text-gray-600">{item.title}</h3>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Si tu empresa contribuye a mejorar la calidad, funcionalidad o sostenibilidad 
              de los espacios públicos, <strong>este directorio es para ti</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ¿Por qué unirte al Directorio? */}
      <div style={{ backgroundColor: '#0f2161' }} className="text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">
            ¿Por qué unirte al Directorio?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div style={{ backgroundColor: '#1a2f7a' }} className="rounded-lg p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">Tu marca donde importa</h3>
              <p style={{ color: '#e5e7eb' }}>Llega a quienes toman decisiones reales</p>
            </div>
            <div style={{ backgroundColor: '#1a2f7a' }} className="rounded-lg p-6">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-3">Contratos reales</h3>
              <p style={{ color: '#e5e7eb' }}>Convierte tu presencia digital en contratos reales</p>
            </div>
            <div style={{ backgroundColor: '#1a2f7a' }} className="rounded-lg p-6">
              <div className="text-4xl mb-4">🌎</div>
              <h3 className="text-xl font-semibold mb-3">Alcance continental</h3>
              <p style={{ color: '#e5e7eb' }}>Desde México hasta Argentina: haz que te vean</p>
            </div>
          </div>
        </div>
      </div>

      {/* Planes de Membresía */}
      <div id="membership-plans" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-700 mb-4">
            Planes de Membresía
          </h2>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a las necesidades de tu empresa. 
            Todos nuestros planes incluyen beneficios exclusivos para hacer crecer tu negocio.
          </p>
        </div>
      </div>

      {/* Memberships Section */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {memberships && memberships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memberships.map((membership: any, index: number) => {
              const Icon = getIcon(index);
              const colorScheme = getColorScheme(index);
              
              return (
                <Card key={membership.id} className={`relative hover:shadow-xl transition-all duration-300 border-2 ${colorScheme.border} group hover:-translate-y-2`}>
                  {/* Popular Badge for middle plan */}
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className={`${colorScheme.bg} text-white px-4 py-1`}>
                        Más Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 ${colorScheme.bg} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {membership.nombrePlan}
                    </CardTitle>
                    <div className="mt-4">
                      <span className={`text-4xl font-bold ${colorScheme.accent}`}>
                        ${membership.costo}
                      </span>
                      <span className="text-gray-600 ml-2">
                        /{membership.periodicidad === 'monthly' ? 'mes' : 'año'}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {membership.descripcionPlan && (
                      <p className="text-gray-600 text-center mb-6">
                        {membership.descripcionPlan}
                      </p>
                    )}
                    
                    {membership.beneficios && Array.isArray(membership.beneficios) && (
                      <div className="space-y-3 mb-8">
                        {(membership.beneficios as string[]).map((beneficio: string, idx: number) => (
                          <div key={idx} className="flex items-center">
                            <Check className={`h-5 w-5 ${colorScheme.accent} mr-3 flex-shrink-0`} />
                            <span className="text-gray-700">{beneficio}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button 
                      className={`w-full ${colorScheme.bg} hover:opacity-90 text-white font-semibold py-3`}
                      onClick={() => setLocation(`/checkout-plan/${membership.id}`)}
                    >
                      Elegir Plan
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay planes disponibles
              </h3>
              <p className="text-gray-600">
                Actualmente no hay planes de membresía disponibles. 
                Por favor, contacta con nosotros para más información.
              </p>
            </div>
          </div>
        )}

        {/* Bonos y promociones exclusivas */}
        <div className="mt-16 mb-16">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-8 max-w-6xl mx-auto text-white">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Bonos y promociones exclusivas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-6">
                <div className="text-2xl mb-3">🚀</div>
                <h3 className="text-xl font-semibold mb-2">Paquetes de lanzamiento</h3>
                <p className="text-green-100">Visibilidad destacada durante los 3 primeros meses</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-6">
                <div className="text-2xl mb-3">🏆</div>
                <h3 className="text-xl font-semibold mb-2">Sellos de calidad</h3>
                <p className="text-green-100">Muestra que eres parte del Directorio oficial de ANPR México</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-6">
                <div className="text-2xl mb-3">⏰</div>
                <h3 className="text-xl font-semibold mb-2">Oferta por tiempo limitado</h3>
                <p className="text-green-100">¡Inscríbete antes del 15 de junio y recibe 1 mes Premium gratis!</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-6">
                <div className="text-2xl mb-3">👥</div>
                <h3 className="text-xl font-semibold mb-2">Descuentos por referidos</h3>
                <p className="text-green-100">Invita a otra empresa y gana beneficios adicionales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Beneficios adicionales */}
        <div className="mt-16 mb-16">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">
              Beneficios adicionales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-600">SEO Optimizado</h3>
                <p className="text-gray-500">Aparecer en buscadores gracias al SEO del micrositio</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📢</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-600">Promoción cruzada</h3>
                <p className="text-gray-500">En eventos, webinars y medios aliados</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-600">Atención personalizada</h3>
                <p className="text-gray-500">Acompañamiento y atención personalizada</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cómo funciona */}
        <div className="mt-16 mb-16">
          <div className="bg-blue-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">
              ¿Cómo funciona?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div style={{ backgroundColor: '#0f2161' }} className="text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-600">Elige y paga</h3>
                <p className="text-gray-500">Elige tu plan y registra tu pago en línea</p>
              </div>
              <div className="text-center">
                <div style={{ backgroundColor: '#0f2161' }} className="text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-600">Envía información</h3>
                <p className="text-gray-500">Envía tu información y materiales</p>
              </div>
              <div className="text-center">
                <div style={{ backgroundColor: '#0f2161' }} className="text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-600">¡Activo en 5 días!</h3>
                <p className="text-gray-500">Tu micrositio estará activo dentro de 5 días hábiles</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="mt-16 text-center">
          <div style={{ background: 'linear-gradient(135deg, #0f2161 0%, #1a2f7a 100%)' }} className="rounded-2xl shadow-lg p-12 max-w-5xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¡Súmate hoy al directorio más grande de América Latina!
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: '#e5e7eb' }}>
              No dejes pasar la oportunidad de gozar de una herramienta que impulsa la calidad, 
              la innovación y las alianzas en el sector del espacio público. 
              Conecta, crece y transforma junto a la ANPR México.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 text-lg">
                Registrarse Ahora
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white font-semibold px-8 py-4 text-lg transition-colors"
                style={{ borderColor: '#ffffff' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#0f2161';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                Solicitar Información
              </Button>
            </div>
            
            <div className="border-t pt-8 mt-8" style={{ borderColor: '#ffffff40' }}>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6" style={{ color: '#e5e7eb' }}>
                <div className="flex items-center gap-2">
                  <span>📩</span>
                  <a href="mailto:conexion@anpr.org.mx" className="hover:text-white transition-colors">
                    conexion@anpr.org.mx
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔗</span>
                  <a href="https://anpr.org.mx" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    anpr.org.mx
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span>📱</span>
                  <span>@anprmexico</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}