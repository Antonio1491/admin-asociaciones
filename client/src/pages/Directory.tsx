import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Search, 
  Filter,
  ExternalLink,
  Grid3X3,
  Map
} from "lucide-react";
import type { CompanyWithDetails, Category } from "@/../../shared/schema";

declare global {
  interface Window {
    google: any;
  }
}

export default function Directory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: async () => {
      const response = await fetch("/api/companies");
      if (!response.ok) throw new Error("Failed to fetch companies");
      return response.json();
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const companies = companiesData?.companies || [];
  const filteredCompanies = companies.filter((company: CompanyWithDetails) => {
    const matchesSearch = company.nombreEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (company.descripcionEmpresa && company.descripcionEmpresa.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || 
                           (company.categories && company.categories.some((cat: Category) => cat.id.toString() === selectedCategory));
    const matchesState = !selectedState || company.estado === selectedState;
    
    return matchesSearch && matchesCategory && matchesState;
  });

  // Unique states from companies
  const states = Array.from(new Set(companies.map((company: CompanyWithDetails) => company.estado))).filter(Boolean);

  // Initialize Google Maps
  const initializeMap = () => {
    if (typeof window !== 'undefined' && window.google && document.getElementById('map')) {
      const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: { lat: 23.6345, lng: -102.5528 }, // Mexico center
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });
      
      setMap(mapInstance);
      addMarkersToMap(mapInstance, filteredCompanies);
    }
  };

  const addMarkersToMap = (mapInstance: any, companiesToShow: CompanyWithDetails[]) => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: any[] = [];

    companiesToShow.forEach((company: CompanyWithDetails) => {
      if (company.latitud && company.longitud) {
        const marker = new window.google.maps.Marker({
          position: { lat: parseFloat(company.latitud), lng: parseFloat(company.longitud) },
          map: mapInstance,
          title: company.nombreEmpresa,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#2563eb"/>
                <path d="M16 8C13.2386 8 11 10.2386 11 13C11 17.25 16 24 16 24C16 24 21 17.25 21 13C21 10.2386 18.7614 8 16 8ZM16 15.5C14.6193 15.5 13.5 14.3807 13.5 13C13.5 11.6193 14.6193 10.5 16 10.5C17.3807 10.5 18.5 11.6193 18.5 13C18.5 14.3807 17.3807 15.5 16 15.5Z" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-3 max-w-xs">
              <h3 class="font-semibold text-gray-900 mb-2">${company.nombreEmpresa}</h3>
              ${company.descripcion ? `<p class="text-sm text-gray-600 mb-2">${company.descripcion.substring(0, 100)}...</p>` : ''}
              <div class="space-y-1 text-xs text-gray-500">
                ${company.telefono1 ? `<p><strong>Teléfono:</strong> ${company.telefono1}</p>` : ''}
                ${company.email1 ? `<p><strong>Email:</strong> ${company.email1}</p>` : ''}
                ${company.direccion ? `<p><strong>Dirección:</strong> ${company.direccion}</p>` : ''}
              </div>
              <a href="/empresa/${company.id}" class="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                Ver detalles →
              </a>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);
  };

  useEffect(() => {
    if (viewMode === 'map') {
      // Load Google Maps API if not already loaded
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    }
  }, [viewMode]);

  useEffect(() => {
    if (map && viewMode === 'map') {
      addMarkersToMap(map, filteredCompanies);
    }
  }, [filteredCompanies, map]);

  if (companiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando directorio...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Directorio de Empresas
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl leading-relaxed">
            Explora todas las empresas registradas en nuestra plataforma. 
            Encuentra proveedores, servicios y oportunidades de negocio.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories?.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.nombreCategoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  {states.map((state: string) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Lista
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4 mr-2" />
                Mapa
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? 's' : ''} encontrada{filteredCompanies.length !== 1 ? 's' : ''}
            </p>
            {(searchTerm || selectedCategory || selectedState) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedState("");
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company: CompanyWithDetails) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    {company.logotipoUrl ? (
                      <img
                        src={company.logotipoUrl}
                        alt={`Logo de ${company.nombreEmpresa}`}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {company.nombreEmpresa}
                      </CardTitle>
                      {company.categories && company.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {company.categories.slice(0, 2).map((category: Category) => (
                            <Badge key={category.id} variant="secondary" className="text-xs">
                              {category.nombreCategoria}
                            </Badge>
                          ))}
                          {company.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{company.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {company.descripcion && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {company.descripcion}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    {company.telefono1 && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{company.telefono1}</span>
                      </div>
                    )}
                    {company.email1 && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{company.email1}</span>
                      </div>
                    )}
                    {(company.ciudad || company.estado) && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{[company.ciudad, company.estado].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                  </div>
                  
                  <Link href={`/empresa/${company.id}`}>
                    <Button className="w-full" size="sm">
                      Ver Detalles
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div 
              id="map" 
              className="w-full h-[600px] rounded-lg shadow-lg border"
              style={{ minHeight: '600px' }}
            />
            {filteredCompanies.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay empresas para mostrar en el mapa</p>
                </div>
              </div>
            )}
          </div>
        )}

        {filteredCompanies.length === 0 && viewMode === 'grid' && (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron empresas
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Intenta ajustar los filtros de búsqueda o explora diferentes categorías.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}