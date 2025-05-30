import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Search, MapPin, Phone, Mail, ChevronLeft, ChevronRight, Tag, Building, Truck, Zap, TreePine, Wrench, Shield, Home as HomeIcon, Users, Package, Settings } from "lucide-react";
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
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                <Input
                  type="text"
                  placeholder="Buscar empresas, servicios o categorías..."
                  className="pl-12 pr-4 py-4 text-lg rounded-full border-0 shadow-lg focus:ring-4 focus:ring-blue-300 text-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CategoriesSection />
      <CompaniesSection />
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
    return null;
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
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}

// Función para obtener el ícono de una categoría
function getCategoryIcon(iconName: string) {
  const iconMap = {
    'Building': Building,
    'Truck': Truck,
    'Zap': Zap,
    'TreePine': TreePine,
    'Wrench': Wrench,
    'Shield': Shield,
    'Home': HomeIcon,
    'Users': Users,
    'Package': Package,
    'Settings': Settings,
    'Tag': Tag,
  };
  
  return iconMap[iconName as keyof typeof iconMap] || Tag;
}

function CategoryCard({ category }: { category: Category }) {
  const IconComponent = getCategoryIcon(category.icono || 'Tag');
  
  return (
    <Link href={`/directorio?categoryId=${category.id}`}>
      <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center group-hover:from-indigo-600 group-hover:to-blue-700 transition-all duration-300">
            <IconComponent className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
            {category.nombreCategoria}
          </h3>
          {category.descripcion && (
            <div 
              className="text-sm text-gray-600 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: category.descripcion }}
            />
          )}
        </CardContent>
      </Card>
    </Link>
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