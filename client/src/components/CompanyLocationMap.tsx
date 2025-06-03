import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapPin, ExternalLink, Map } from "lucide-react";

interface CompanyLocationMapProps {
  ubicacionGeografica?: { lat: number; lng: number; address?: string } | null;
  direccionFisica?: string;
  nombreEmpresa: string;
}

export default function CompanyLocationMap({ 
  ubicacionGeografica, 
  direccionFisica, 
  nombreEmpresa 
}: CompanyLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const googleMapsUrl = ubicacionGeografica
    ? `https://www.google.com/maps/search/?api=1&query=${ubicacionGeografica.lat},${ubicacionGeografica.lng}`
    : direccionFisica
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionFisica)}`
    : null;

  useEffect(() => {
    if (!ubicacionGeografica || !mapRef.current) return;

    const initMap = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        setMapError(true);
        return;
      }

      try {
        const loader = new Loader({
          apiKey: apiKey,
          version: "weekly",
          libraries: ["maps"]
        });

        const { Map } = await loader.importLibrary("maps") as any;

        const map = new Map(mapRef.current, {
          zoom: 15,
          center: ubicacionGeografica,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        // Usar Marker estándar en lugar de AdvancedMarkerElement
        new (window as any).google.maps.Marker({
          map: map,
          position: ubicacionGeografica,
          title: nombreEmpresa,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="10" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
                <circle cx="16" cy="16" r="4" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new (window as any).google.maps.Size(32, 32),
            anchor: new (window as any).google.maps.Point(16, 16)
          }
        });

        setMapLoaded(true);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setMapError(true);
      }
    };

    initMap();
  }, [ubicacionGeografica, nombreEmpresa]);

  return (
    <div className="w-full space-y-4">
      {/* Información de ubicación */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">Ubicación</h3>
            {direccionFisica && (
              <p className="text-gray-700 mb-2">{direccionFisica}</p>
            )}
            {ubicacionGeografica && (
              <p className="text-sm text-gray-500">
                Coordenadas: {ubicacionGeografica.lat.toFixed(6)}, {ubicacionGeografica.lng.toFixed(6)}
              </p>
            )}
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Ver en Google Maps
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Mapa interactivo o fallback */}
      {ubicacionGeografica ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <div 
            ref={mapRef} 
            className="w-full h-64"
            style={{ display: mapLoaded ? 'block' : 'none' }}
          />
          
          {/* Loading state */}
          {!mapLoaded && !mapError && (
            <div className="bg-gray-100 h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Cargando mapa...</p>
              </div>
            </div>
          )}
          
          {/* Error fallback */}
          {mapError && (
            <div className="bg-gradient-to-br from-blue-100 to-green-100 h-64 flex items-center justify-center">
              <div className="text-center">
                <Map className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">{nombreEmpresa}</h3>
                <p className="text-gray-600 text-sm">Ubicación de la empresa</p>
                <div className="mt-2 text-xs text-gray-500">
                  Lat: {ubicacionGeografica.lat.toFixed(4)}, Lng: {ubicacionGeografica.lng.toFixed(4)}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Fallback cuando no hay coordenadas */
        <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-64 flex items-center justify-center border border-gray-200">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">{nombreEmpresa}</h3>
            <p className="text-gray-600 text-sm">Ubicación de la empresa</p>
            <p className="text-gray-500 text-xs mt-2">Coordenadas no disponibles</p>
          </div>
        </div>
      )}
    </div>
  );
}