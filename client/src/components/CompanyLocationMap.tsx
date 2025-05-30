import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface CompanyLocationMapProps {
  ubicacionGeografica?: { lat: number; lng: number } | null;
  direccionFisica?: string;
  nombreEmpresa: string;
}

export default function CompanyLocationMap({ 
  ubicacionGeografica, 
  direccionFisica, 
  nombreEmpresa 
}: CompanyLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
          libraries: ["places"]
        });

        const { Map } = await loader.importLibrary("maps");
        const { Marker } = await loader.importLibrary("marker");

        if (!mapRef.current) return;

        // Usar ubicación específica o coordenadas por defecto de México
        const defaultLocation = { lat: 19.4326, lng: -99.1332 }; // Ciudad de México
        const mapLocation = ubicacionGeografica || defaultLocation;

        const mapInstance = new Map(mapRef.current, {
          center: mapLocation,
          zoom: ubicacionGeografica ? 15 : 6,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        // Solo agregar marcador si hay ubicación específica
        if (ubicacionGeografica) {
          new Marker({
            position: mapLocation,
            map: mapInstance,
            title: nombreEmpresa,
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing map:", error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    initMap();
  }, [ubicacionGeografica, nombreEmpresa]);

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Error al cargar el mapa</p>
          <p className="text-sm">Verifique la configuración de Google Maps</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div ref={mapRef} className="w-full h-64 rounded-lg border" />
      {direccionFisica && ubicacionGeografica && (
        <div className="flex justify-center">
          <a
            href={`https://www.google.com/maps?q=${ubicacionGeografica.lat},${ubicacionGeografica.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Ver en Google Maps
          </a>
        </div>
      )}
    </div>
  );
}