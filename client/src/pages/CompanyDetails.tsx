import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, MapPin, Phone, Mail, Globe, Facebook, Instagram, Twitter, Users, Calendar, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CompanyWithDetails } from "@/../../shared/schema";

export default function CompanyDetails() {
  const { id } = useParams();

  const { data: company, isLoading } = useQuery({
    queryKey: ["/api/companies", id],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${id}`);
      if (!response.ok) throw new Error("Company not found");
      return response.json() as CompanyWithDetails;
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
                dangerouslySetInnerHTML={{ __html: company.descripcion || '' }}
              />
              
              {/* Información de contacto principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.telefonos && company.telefonos[0] && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3" />
                    <span>{company.telefonos[0]}</span>
                  </div>
                )}
                {company.emails && company.emails[0] && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3" />
                    <span>{company.emails[0]}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
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
                  dangerouslySetInnerHTML={{ __html: company.descripcion || 'No hay descripción disponible.' }}
                />
              </CardContent>
            </Card>

            {/* Galería de Fotos */}
            {company.galeria && company.galeria.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Galería</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {company.galeria.map((imagen, index) => (
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

            {/* Video */}
            {company.videoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Video className="h-5 w-5 mr-2" />
                    Video Corporativo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video">
                    <iframe
                      src={company.videoUrl}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Representantes de Ventas */}
            {company.representantesVentas && company.representantesVentas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Equipo de Ventas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.representantesVentas.map((rep, index) => (
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
                {company.telefonos && company.telefonos.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Teléfonos
                    </h4>
                    {company.telefonos.map((telefono, index) => (
                      <p key={index} className="text-gray-600">{telefono}</p>
                    ))}
                  </div>
                )}

                {/* Emails */}
                {company.emails && company.emails.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Correos Electrónicos
                    </h4>
                    {company.emails.map((email, index) => (
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
                {company.redesSociales && company.redesSociales.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Redes Sociales</h4>
                    <div className="space-y-2">
                      {company.redesSociales.map((red, index) => (
                        <a
                          key={index}
                          href={red.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          {red.plataforma.toLowerCase() === 'facebook' && <Facebook className="h-4 w-4 mr-2" />}
                          {red.plataforma.toLowerCase() === 'instagram' && <Instagram className="h-4 w-4 mr-2" />}
                          {red.plataforma.toLowerCase() === 'twitter' && <Twitter className="h-4 w-4 mr-2" />}
                          {!['facebook', 'instagram', 'twitter'].includes(red.plataforma.toLowerCase()) && <Globe className="h-4 w-4 mr-2" />}
                          {red.plataforma}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Direcciones */}
            {company.direcciones && company.direcciones.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Ubicaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {company.direcciones.map((direccion, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{direccion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Catálogo PDF */}
            {company.catalogoPdf && (
              <Card>
                <CardHeader>
                  <CardTitle>Catálogo de Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={company.catalogoPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Descargar Catálogo
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Información Adicional */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Membresía</CardTitle>
              </CardHeader>
              <CardContent>
                {company.membershipType && (
                  <div className="space-y-2">
                    <Badge variant="outline" className="mb-2">
                      {company.membershipType.nombrePlan}
                    </Badge>
                    <p className="text-sm text-gray-600">
                      {company.membershipType.descripcion}
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      ${company.membershipType.precio}/mes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}