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
            Planes de Membresía
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Elige el plan que mejor se adapte a las necesidades de tu empresa. 
            Todos nuestros planes incluyen beneficios exclusivos para hacer crecer tu negocio.
          </p>
        </div>
      </div>

      {/* Memberships Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
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

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Necesitas un plan personalizado?
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Si ninguno de nuestros planes se adapta a tus necesidades, 
              contáctanos para crear una solución personalizada para tu empresa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Contactar Ventas
              </Button>
              <Button size="lg" variant="outline">
                Solicitar Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}