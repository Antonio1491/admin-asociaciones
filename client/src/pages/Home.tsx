import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Search, MapPin, Phone, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: companiesResponse } = useQuery({
    queryKey: ["/api/companies"],
  });

  const companies = (companiesResponse as any)?.companies || [];
  const featuredCompanies = companies.slice(0, 5);
  
  const searchResults = searchTerm.length > 0 ? companies.filter((company: any) =>
    company.nombreEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.descripcionEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.category?.nombreCategoria?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const nextSlide = () => {
    if (featuredCompanies.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % featuredCompanies.length);
    }
  };

  const prevSlide = () => {
    if (featuredCompanies.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + featuredCompanies.length) % featuredCompanies.length);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Descubre las Mejores Empresas
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Encuentra el negocio perfecto para tus necesidades
            </p>
            
            {/* Buscador Central */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                <Input
                  type="text"
                  placeholder="Buscar empresas, servicios o categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg rounded-full border-0 shadow-lg focus:ring-4 focus:ring-blue-300 text-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados de Búsqueda */}
      {searchTerm.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">
            Resultados de búsqueda ({searchResults.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((company: any) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
          {searchResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron empresas que coincidan con tu búsqueda.</p>
            </div>
          )}
        </div>
      )}

      {/* Slider de Empresas Destacadas */}
      {searchTerm.length === 0 && featuredCompanies.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Empresas Destacadas
          </h2>
          
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredCompanies.map((company: any) => (
                  <div key={company.id} className="w-full flex-shrink-0">
                    <FeaturedCompanySlide company={company} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Controles del Slider */}
            {featuredCompanies.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                
                {/* Indicadores */}
                <div className="flex justify-center mt-6 space-x-2">
                  {featuredCompanies.map((_: any, index: number) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Grid de Todas las Empresas */}
      {searchTerm.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Todas las Empresas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company: any) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
          {companies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay empresas registradas.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FeaturedCompanySlide({ company }: { company: any }) {
  return (
    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
        <div className="p-8 flex flex-col justify-center">
          <div className="mb-4">
            {company.category && (
              <Badge variant="secondary" className="mb-2">
                {company.category.nombreCategoria}
              </Badge>
            )}
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              {company.nombreEmpresa}
            </h3>
            <div 
              className="text-gray-600 mb-4 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: company.descripcionEmpresa || '' }}
            />
          </div>
          
          <div className="space-y-2 mb-6">
            {company.telefono1 && (
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{company.telefono1}</span>
              </div>
            )}
            {company.email1 && (
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>{company.email1}</span>
              </div>
            )}
            {company.direccionFisica && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{company.direccionFisica}</span>
              </div>
            )}
          </div>
          
          <Link href={`/empresa/${company.id}`}>
            <Button size="lg" className="w-full">
              Ver Detalles
            </Button>
          </Link>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 flex items-center justify-center">
          {company.logotipoUrl ? (
            <img
              src={company.logotipoUrl}
              alt={company.nombreEmpresa}
              className="max-w-full max-h-48 object-contain"
            />
          ) : (
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {company.nombreEmpresa?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompanyCard({ company }: { company: any }) {
  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        {company.logotipoUrl ? (
          <img
            src={company.logotipoUrl}
            alt={company.nombreEmpresa}
            className="max-w-full max-h-full object-contain p-4"
          />
        ) : (
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {company.nombreEmpresa?.charAt(0) || '?'}
            </span>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="mb-4">
          {company.category && (
            <Badge variant="secondary" className="mb-2">
              {company.category.nombreCategoria}
            </Badge>
          )}
          <h3 className="text-xl font-semibold mb-2">{company.nombreEmpresa}</h3>
          <div 
            className="text-gray-600 text-sm line-clamp-2"
            dangerouslySetInnerHTML={{ __html: company.descripcionEmpresa || '' }}
          />
        </div>
        
        <div className="space-y-1 mb-4 text-sm text-gray-500">
          {company.direccionFisica && (
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{company.direccionFisica}</span>
            </div>
          )}
          {company.telefono1 && (
            <div className="flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              <span>{company.telefono1}</span>
            </div>
          )}
        </div>
        
        <Link href={`/empresa/${company.id}`}>
          <Button variant="outline" className="w-full">
            Ver Detalles
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}