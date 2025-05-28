import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MapLocationPickerProps {
  ciudad: string;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number; address: string } | null;
}

export default function MapLocationPicker({ ciudad, onLocationSelect, initialLocation }: MapLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(initialLocation || null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
          libraries: ["places", "geometry"]
        });

        const { Map } = await loader.importLibrary("maps");
        const { Marker } = await loader.importLibrary("marker");

        if (!mapRef.current) return;

        // Coordenadas por defecto para México
        const defaultCenter = { lat: 19.4326, lng: -99.1332 }; // Ciudad de México
        
        // Intentar obtener coordenadas específicas de la ciudad
        let cityCenter = defaultCenter;
        try {
          const geocoder = new google.maps.Geocoder();
          const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
            geocoder.geocode({ address: ciudad + ", México" }, (results, status) => {
              if (status === "OK" && results) {
                resolve(results);
              } else {
                reject(status);
              }
            });
          });

          if (result && result[0]) {
            cityCenter = {
              lat: result[0].geometry.location.lat(),
              lng: result[0].geometry.location.lng()
            };
          }
        } catch (error) {
          console.log("Using default coordinates for", ciudad);
        }

        const mapInstance = new Map(mapRef.current, {
          center: initialLocation || cityCenter,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Crear marcador
        const markerInstance = new Marker({
          map: mapInstance,
          position: initialLocation || cityCenter,
          draggable: true,
          title: "Ubicación de la empresa"
        });

        // Evento de clic en el mapa
        mapInstance.addListener("click", async (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const position = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            };

            markerInstance.setPosition(position);

            // Obtener dirección usando geocoding reverso
            try {
              const geocoder = new google.maps.Geocoder();
              const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
                geocoder.geocode({ location: position }, (results, status) => {
                  if (status === "OK" && results) {
                    resolve(results);
                  } else {
                    reject(status);
                  }
                });
              });

              const address = result && result[0] ? result[0].formatted_address : "Ubicación seleccionada";
              const locationData = { ...position, address };
              setSelectedLocation(locationData);
              onLocationSelect(locationData);
            } catch (error) {
              const locationData = { ...position, address: "Ubicación seleccionada" };
              setSelectedLocation(locationData);
              onLocationSelect(locationData);
            }
          }
        });

        // Evento de arrastrar marcador
        markerInstance.addListener("dragend", async () => {
          const position = markerInstance.getPosition();
          if (position) {
            const pos = {
              lat: position.lat(),
              lng: position.lng()
            };

            try {
              const geocoder = new google.maps.Geocoder();
              const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
                geocoder.geocode({ location: pos }, (results, status) => {
                  if (status === "OK" && results) {
                    resolve(results);
                  } else {
                    reject(status);
                  }
                });
              });

              const address = result && result[0] ? result[0].formatted_address : "Ubicación seleccionada";
              const locationData = { ...pos, address };
              setSelectedLocation(locationData);
              onLocationSelect(locationData);
            } catch (error) {
              const locationData = { ...pos, address: "Ubicación seleccionada" };
              setSelectedLocation(locationData);
              onLocationSelect(locationData);
            }
          }
        });

        setMap(mapInstance);
        setMarker(markerInstance);
        setIsLoading(false);

        // Si hay una ubicación inicial, notificar al componente padre
        if (initialLocation) {
          setSelectedLocation(initialLocation);
          onLocationSelect(initialLocation);
        }

      } catch (error) {
        console.error("Error initializing map:", error);
        setIsLoading(false);
      }
    };

    initMap();
  }, [ciudad, onLocationSelect, initialLocation]);

  const searchLocation = async () => {
    if (!map || !marker || !searchValue.trim()) return;

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ 
          address: searchValue + ", " + ciudad + ", México" 
        }, (results, status) => {
          if (status === "OK" && results) {
            resolve(results);
          } else {
            reject(status);
          }
        });
      });

      if (result && result[0]) {
        const location = result[0].geometry.location;
        const position = {
          lat: location.lat(),
          lng: location.lng()
        };

        map.setCenter(position);
        map.setZoom(16);
        marker.setPosition(position);

        const locationData = {
          ...position,
          address: result[0].formatted_address
        };
        setSelectedLocation(locationData);
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchLocation();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4" />
          Ubicación en {ciudad}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Buscador */}
        <div className="flex gap-2">
          <Input
            placeholder={`Buscar dirección en ${ciudad}...`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={searchLocation} variant="outline" size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Mapa */}
        <div className="relative">
          <div
            ref={mapRef}
            className="w-full h-64 rounded-lg border"
            style={{ minHeight: "256px" }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Cargando mapa...</p>
              </div>
            </div>
          )}
        </div>

        {/* Información de ubicación seleccionada */}
        {selectedLocation && (
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium text-gray-700">Ubicación seleccionada:</p>
            <p className="text-gray-600 mt-1">{selectedLocation.address}</p>
            <p className="text-gray-500 text-xs mt-1">
              Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación exacta de tu empresa.
        </p>
      </CardContent>
    </Card>
  );
}