import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MapPin, Phone, Mail, Building } from "lucide-react";
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
              Directorio de la Industria del Equipamiento Urbano
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Encuentra las mejores empresas especializadas en equipamiento urbano
            </p>
            
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-4 flex-col md:flex-row">
                <Input
                  type="text"
                  placeholder="Buscar empresas, servicios o categorías..."
                  className="flex-1 py-4 text-lg rounded-lg border-0 shadow-lg focus:ring-4 focus:ring-blue-300 text-gray-800"
                />
                <select className="px-4 py-4 text-lg rounded-lg border-0 shadow-lg text-gray-800 bg-white min-w-[200px]">
                  <option value="">Todas las ubicaciones</option>
                  <option value="aguascalientes">Aguascalientes</option>
                  <option value="baja-california">Baja California</option>
                  <option value="baja-california-sur">Baja California Sur</option>
                  <option value="campeche">Campeche</option>
                  <option value="chiapas">Chiapas</option>
                  <option value="chihuahua">Chihuahua</option>
                  <option value="coahuila">Coahuila</option>
                  <option value="colima">Colima</option>
                  <option value="cdmx">Ciudad de México</option>
                  <option value="durango">Durango</option>
                  <option value="estado-mexico">Estado de México</option>
                  <option value="guanajuato">Guanajuato</option>
                  <option value="guerrero">Guerrero</option>
                  <option value="hidalgo">Hidalgo</option>
                  <option value="jalisco">Jalisco</option>
                  <option value="michoacan">Michoacán</option>
                  <option value="morelos">Morelos</option>
                  <option value="nayarit">Nayarit</option>
                  <option value="nuevo-leon">Nuevo León</option>
                  <option value="oaxaca">Oaxaca</option>
                  <option value="puebla">Puebla</option>
                  <option value="queretaro">Querétaro</option>
                  <option value="quintana-roo">Quintana Roo</option>
                  <option value="san-luis-potosi">San Luis Potosí</option>
                  <option value="sinaloa">Sinaloa</option>
                  <option value="sonora">Sonora</option>
                  <option value="tabasco">Tabasco</option>
                  <option value="tamaulipas">Tamaulipas</option>
                  <option value="tlaxcala">Tlaxcala</option>
                  <option value="veracruz">Veracruz</option>
                  <option value="yucatan">Yucatán</option>
                  <option value="zacatecas">Zacatecas</option>
                </select>
                <Button className="px-8 py-4 text-lg rounded-lg shadow-lg whitespace-nowrap">
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
          <div className="overflow-x-auto">
            <div className="animate-pulse flex space-x-4 min-w-max pb-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 w-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
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
          <div className="flex space-x-4 min-w-max pb-2">
            <Link href="/directorio">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-lg border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex-shrink-0"
              >
                <Building className="w-4 h-4" />
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
                  className="flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-lg border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex-shrink-0"
                >
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
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

function CompaniesSection() {
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ["/api/companies"],
    select: (data: any) => data,
  });

  const companies = companiesData?.companies || [];
  const featuredCompanies = companies.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Empresas Destacadas
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Descubre las empresas líderes en equipamiento urbano con los mejores productos y servicios
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCompanies.map((company: any) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}

      <div className="text-center mt-12">
        <Link href="/directorio">
          <Button size="lg" className="px-8 py-3">
            Ver todas las empresas
          </Button>
        </Link>
      </div>
    </div>
  );
}

function CompanyCard({ company }: { company: any }) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={company.logotipoUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop'}
            alt={company.nombreEmpresa}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {company.membershipType && (
            <Badge className="absolute top-3 right-3 bg-blue-600">
              {company.membershipType.nombreTipo}
            </Badge>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="font-bold text-lg mb-2 text-gray-800">
            {company.nombreEmpresa}
          </h3>
          
          {company.descripcionEmpresa && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {company.descripcionEmpresa}
            </p>
          )}
          
          <div className="space-y-2">
            {company.telefono1 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {company.telefono1}
              </div>
            )}
            
            {company.email1 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {company.email1}
              </div>
            )}
            
            {company.estadosPresencia && company.estadosPresencia.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {company.estadosPresencia.slice(0, 2).join(', ')}
                {company.estadosPresencia.length > 2 && ' +'}
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <Link href={`/empresa/${company.id}`}>
              <Button variant="outline" className="w-full">
                Ver detalles
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}