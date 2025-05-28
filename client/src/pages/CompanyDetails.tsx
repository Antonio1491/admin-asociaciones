import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, MapPin, Phone, Mail, Globe, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { CompanyWithDetails } from "@/../../shared/schema";

export default function CompanyDetails() {
  const { id } = useParams();

  const { data: company, isLoading } = useQuery({
    queryKey: ["/api/companies", id],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${id}`);
      if (!response.ok) throw new Error("Company not found");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de la empresa...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Empresa no encontrada</h1>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const telefonos = [company.telefono1, company.telefono2].filter(Boolean);
  const emails = [company.email1, company.email2].filter(Boolean);
  const galeria = company.galeriaProductosUrls as string[] || [];
  const videos = [company.videoUrl1, company.videoUrl2, company.videoUrl3].filter(Boolean);
  const representantes = company.representantesVentas as string[] || [];
  const redesSociales = company.redesSociales as Record<string, string> || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al directorio
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <div className="mb-4">
                {company.category && (
                  <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
                    {company.category.nombreCategoria}
                  </Badge>
                )}
                {company.membershipType && (
                  <Badge variant="outline" className="ml-2 bg-white/10 text-white border-white/30">
                    {company.membershipType.nombrePlan}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4">{company.nombreEmpresa}</h1>
              <div 
                className="text-xl text-blue-100 mb-6"
                dangerouslySetInnerHTML={{ __html: company.descripcionEmpresa || '' }}
              />
              
              {/* Información de contacto principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {telefonos[0] && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3" />
                    <span>{telefonos[0]}</span>
                  </div>
                )}
                {emails[0] && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3" />
                    <span>{emails[0]}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              {company.logotipoUrl ? (
                <img
                  src={company.logotipoUrl}
                  alt={company.nombreEmpresa}
                  className="max-w-48 max-h-48 object-contain bg-white/10 rounded-2xl p-6"
                />
              ) : (
                <div className="w-48 h-48 bg-white/10 rounded-2xl flex items-center justify-center">
                  <span className="text-6xl font-bold">
                    {company.nombreEmpresa.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Descripción Detallada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Acerca de la Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: company.descripcionEmpresa || 'No hay descripción disponible.' }}
                />
              </CardContent>
            </Card>

            {/* Galería de Fotos */}
            {galeria.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Galería de Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galeria.map((imagen, index) => (
                      <img
                        key={index}
                        src={imagen}
                        alt={`${company.nombreEmpresa} - Imagen ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Video className="h-5 w-5 mr-2" />
                    Videos Corporativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {videos.map((videoUrl, index) => (
                      <div key={index} className="aspect-video">
                        <iframe
                          src={videoUrl}
                          className="w-full h-full rounded-lg"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Representantes de Ventas */}
            {representantes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Equipo de Ventas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {representantes.map((rep, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-semibold">{rep}</h4>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información de Contacto */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Teléfonos */}
                {telefonos.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Teléfonos
                    </h4>
                    {telefonos.map((telefono, index) => (
                      <p key={index} className="text-gray-600">{telefono}</p>
                    ))}
                  </div>
                )}

                {/* Emails */}
                {emails.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Correos Electrónicos
                    </h4>
                    {emails.map((email, index) => (
                      <p key={index} className="text-gray-600">{email}</p>
                    ))}
                  </div>
                )}

                {/* Sitio Web */}
                {company.sitioWeb && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Sitio Web
                    </h4>
                    <a
                      href={company.sitioWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.sitioWeb}
                    </a>
                  </div>
                )}

                <Separator />

                {/* Redes Sociales */}
                {Object.keys(redesSociales).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Redes Sociales</h4>
                    <div className="space-y-2">
                      {Object.entries(redesSociales).map(([plataforma, url], index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          {plataforma}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dirección */}
            {company.direccionFisica && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{company.direccionFisica}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Catálogo Digital */}
            {company.catalogoDigitalUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Catálogo Digital</CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={company.catalogoDigitalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Catálogo
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Información de Membresía */}
            {company.membershipType && (
              <Card>
                <CardHeader>
                  <CardTitle>Información de la Membresía</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline" className="mb-2">
                      {company.membershipType.nombrePlan}
                    </Badge>
                    {company.membershipType.descripcionPlan && (
                      <p className="text-sm text-gray-600">
                        {company.membershipType.descripcionPlan}
                      </p>
                    )}
                    {company.membershipType.costo && (
                      <p className="text-lg font-semibold text-green-600">
                        {company.membershipType.costo}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}