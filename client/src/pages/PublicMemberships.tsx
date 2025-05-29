import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap } from "lucide-react";
import type { MembershipType } from "@/../../shared/schema";

export default function PublicMemberships() {
  const { data: memberships, isLoading } = useQuery({
    queryKey: ["/api/membership-types"],
    queryFn: async () => {
      const response = await fetch("/api/membership-types");
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            El Directorio de la Industria
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-blue-100">
            del Equipamiento Urbano en América Latina
          </h2>
          <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            El espacio donde proveedores y líderes del espacio público se encuentran
          </p>
        </div>
      </div>

      {/* ¿Qué es el Directorio? */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            ¿Qué es el Directorio?
          </h2>
          <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
            <p className="mb-6">
              El Directorio Digital de la Industria del Equipamiento Urbano es una iniciativa de la 
              <strong> Asociación Nacional de Parques y Recreación de México (ANPR México)</strong>, 
              una organización sin fines de lucro que promueve la profesionalización del sector de 
              parques y espacios públicos en América Latina.
            </p>
            <p className="mb-8">
              Esta plataforma especializada conecta a empresas proveedoras con los principales tomadores 
              de decisiones en el diseño, desarrollo y operación de espacios públicos. Más que un catálogo, 
              es el punto de encuentro donde la innovación y las oportunidades de negocio se materializan.
            </p>
            <div className="text-center">
              <a 
                href="https://anpr.org.mx/nosotros/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Conoce más sobre la ANPR México
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ¿Quién puede formar parte? */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
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
                <h3 className="text-center font-medium text-gray-800">{item.title}</h3>
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
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">
            ¿Por qué unirte al Directorio?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-700 rounded-lg p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">Tu marca donde importa</h3>
              <p className="text-blue-100">Llega a quienes toman decisiones reales</p>
            </div>
            <div className="bg-blue-700 rounded-lg p-6">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-3">Contratos reales</h3>
              <p className="text-blue-100">Convierte tu presencia digital en contratos reales</p>
            </div>
            <div className="bg-blue-700 rounded-lg p-6">
              <div className="text-4xl mb-4">🌎</div>
              <h3 className="text-xl font-semibold mb-3">Alcance continental</h3>
              <p className="text-blue-100">Desde México hasta Argentina: haz que te vean</p>
            </div>
          </div>
        </div>
      </div>

      {/* Planes de Membresía */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Planes de Membresía
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Beneficios adicionales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">SEO Optimizado</h3>
                <p className="text-gray-600">Aparecer en buscadores gracias al SEO del micrositio</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📢</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Promoción cruzada</h3>
                <p className="text-gray-600">En eventos, webinars y medios aliados</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Atención personalizada</h3>
                <p className="text-gray-600">Acompañamiento y atención personalizada</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cómo funciona */}
        <div className="mt-16 mb-16">
          <div className="bg-blue-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              ¿Cómo funciona?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Elige y paga</h3>
                <p className="text-gray-600">Elige tu plan y registra tu pago en línea</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Envía información</h3>
                <p className="text-gray-600">Envía tu información y materiales</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">¡Activo en 5 días!</h3>
                <p className="text-gray-600">Tu micrositio estará activo dentro de 5 días hábiles</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-12 max-w-5xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¡Súmate hoy al directorio más grande de América Latina!
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              No dejes pasar la oportunidad de gozar de una herramienta que impulsa la calidad, 
              la innovación y las alianzas en el sector del espacio público. 
              Conecta, crece y transforma junto a la ANPR México.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 text-lg">
                Registrarse Ahora
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg">
                Solicitar Información
              </Button>
            </div>
            
            <div className="border-t border-blue-400 pt-8 mt-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-blue-100">
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