import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import type { CompanyWithDetails } from "@/../../shared/schema";

interface DirectoryMapProps {
  companies: CompanyWithDetails[];
}

export default function DirectoryMap({ companies }: DirectoryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      try {
        // Verificar que el elemento HTML esté disponible
        if (!mapRef.current) {
          console.warn("Map container not ready");
          return;
        }

        // Verificar que la API key esté configurada
        if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
          console.warn("Google Maps API key not configured");
          setHasError(true);
          setIsLoading(false);
          return;
        }

        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["places"]
        });

        const { Map } = await loader.importLibrary("maps") as google.maps.MapsLibrary;
        const { Marker } = await loader.importLibrary("marker") as google.maps.MarkerLibrary;

        // Verificar nuevamente que el elemento siga disponible
        if (!mapRef.current) {
          console.warn("Map container was unmounted during initialization");
          return;
        }

        // Centro del mapa en México
        const defaultCenter = { lat: 19.4326, lng: -99.1332 };
        
        const mapInstance = new Map(mapRef.current, {
          center: defaultCenter,
          zoom: 6,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        // Filtrar empresas que tienen ubicación geográfica
        const companiesWithLocation = companies.filter(
          company => company.ubicacionGeografica && 
                    typeof company.ubicacionGeografica === 'object' &&
                    'lat' in company.ubicacionGeografica && 
                    'lng' in company.ubicacionGeografica
        );

        // Agregar marcadores para cada empresa
        companiesWithLocation.forEach((company) => {
          const ubicacion = company.ubicacionGeografica as { lat: number; lng: number };
          if (ubicacion) {
            const marker = new (window as any).google.maps.Marker({
              position: {
                lat: ubicacion.lat,
                lng: ubicacion.lng
              },
              map: mapInstance,
              title: company.nombreEmpresa,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="#ffffff"/>
                  </svg>
                `),
                scaledSize: new (window as any).google.maps.Size(24, 24),
                anchor: new (window as any).google.maps.Point(12, 12)
              }
            });

            // InfoWindow para mostrar información de la empresa
            const infoWindow = new (window as any).google.maps.InfoWindow({
              content: `
                <div style="padding: 10px; max-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${company.nombreEmpresa}</h3>
                  ${company.direccionFisica ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${company.direccionFisica}</p>` : ''}
                  ${company.telefono1 ? `<p style="margin: 0 0 4px 0; font-size: 12px;">📞 ${company.telefono1}</p>` : ''}
                  ${company.email1 ? `<p style="margin: 0 0 8px 0; font-size: 12px;">✉️ ${company.email1}</p>` : ''}
                  <a href="/companies/${company.id}" style="color: #2563eb; text-decoration: none; font-size: 12px;">Ver detalles →</a>
                </div>
              `
            });

            marker.addListener("click", () => {
              infoWindow.open(mapInstance, marker);
            });
          }
        });

        // Ajustar el zoom para mostrar todas las empresas si hay ubicaciones
        if (companiesWithLocation.length > 0) {
          const bounds = new (window as any).google.maps.LatLngBounds();
          companiesWithLocation.forEach((company) => {
            const ubicacion = company.ubicacionGeografica as { lat: number; lng: number };
            if (ubicacion) {
              bounds.extend({
                lat: ubicacion.lat,
                lng: ubicacion.lng
              });
            }
          });
          mapInstance.fitBounds(bounds);
          
          // Asegurar un zoom mínimo
          (window as any).google.maps.event.addListenerOnce(mapInstance, 'bounds_changed', () => {
            if (mapInstance.getZoom() && mapInstance.getZoom() > 15) {
              mapInstance.setZoom(15);
            }
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing map:", error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    // Usar un timeout para asegurar que el DOM esté listo
    const timeoutId = setTimeout(() => {
      if (companies.length > 0) {
        initMap();
      } else {
        setIsLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [companies]);

  if (isLoading) {
    return (
      <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Error al cargar el mapa</p>
          <p className="text-sm">Verifique la configuración de Google Maps</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-96 rounded-lg border" />;
}