import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { MapPin, Phone, Mail, ChevronLeft, ChevronRight, Tag, Building, Truck, Zap, TreePine, Wrench, Shield, Home as HomeIcon, Users, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category } from "@shared/schema";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              🎉 ¡Directorio de Empresas Funcionando!
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              El frontend principal ya está operativo
            </p>
            
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Buscar empresas, servicios o categorías..."
                  className="flex-1 py-4 text-lg rounded-lg border-0 shadow-lg focus:ring-4 focus:ring-blue-300 text-gray-800"
                />
                <select className="px-4 py-4 text-lg rounded-lg border-0 shadow-lg text-gray-800 bg-white min-w-[150px]">
                  <option value="">Todas las ubicaciones</option>
                  <option value="cdmx">Ciudad de México</option>
                  <option value="jalisco">Jalisco</option>
                  <option value="nuevo-leon">Nuevo León</option>
                  <option value="estado-mexico">Estado de México</option>
                  <option value="puebla">Puebla</option>
                  <option value="hidalgo">Hidalgo</option>
                  <option value="michoacan">Michoacán</option>
                  <option value="colima">Colima</option>
                  <option value="coahuila">Coahuila</option>
                  <option value="tamaulipas">Tamaulipas</option>
                  <option value="queretaro">Querétaro</option>
                  <option value="guanajuato">Guanajuato</option>
                </select>
                <Button className="px-8 py-4 text-lg rounded-lg shadow-lg">
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CategoriesBarSection />
      <CompaniesSection />
    </div>
  );
}

function CategoriesBarSection() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 w-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !categories) {
    return null;
  }

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="overflow-x-auto">
          <div className="flex space-x-4 min-w-max">
            <Link href="/directorio">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-lg border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <Building />
                Todas las empresas
              </Button>
            </Link>
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/directorio?categoryId=${category.id}`}
              >
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-lg border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {category.nombreCategoria.charAt(0)}
                    </span>
                  </div>
                  {category.nombreCategoria}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoriesSection() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error || !categories) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-gray-600">Error cargando las categorías</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 bg-white">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Explorar por Categorías
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Encuentra empresas especializadas en diferentes sectores del equipamiento urbano
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div 
            key={category.id}
            className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group bg-white rounded-lg border p-6 text-center" 
            onClick={() => window.location.href = `/directorio?categoryId=${category.id}`}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center group-hover:from-indigo-600 group-hover:to-blue-700 transition-all duration-300">
              <span className="text-white text-xs font-bold text-center px-1">
                {category.nombreCategoria.split(' ').map(word => word.charAt(0)).join('').substring(0, 3)}
              </span>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
              {category.nombreCategoria}
            </h3>
            {category.descripcion && category.descripcion.trim() !== '' && (
              <div 
                className="text-sm text-gray-600 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: category.descripcion }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}



function CompaniesSection() {
  const { data: companiesResponse, isLoading, error } = useQuery({
    queryKey: ["/api/companies"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-red-600">Error al cargar las empresas: {String(error)}</p>
        </div>
      </div>
    );
  }

  const companies = (companiesResponse as any)?.companies || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
        Empresas Registradas ({companies.length})
      </h2>
      
      {companies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay empresas registradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company: any) => (
            <CompanyCard key={company.id} company={company} />
          ))}
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