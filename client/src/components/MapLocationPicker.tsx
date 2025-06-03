import { useEffect, useState, useRef } from "react";
import { MapPin, Search, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "@googlemaps/js-api-loader";

interface MapLocationPickerProps {
  ciudad: string;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number; address: string } | null;
}

export default function MapLocationPicker({ ciudad, onLocationSelect, initialLocation }: MapLocationPickerProps) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(
    initialLocation || null
  );
  const [manualCoords, setManualCoords] = useState({
    lat: initialLocation?.lat?.toString() || "",
    lng: initialLocation?.lng?.toString() || "",
    address: initialLocation?.address || ""
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const initializationAttempted = useRef(false);

  useEffect(() => {
    if (!initializationAttempted.current) {
      initializationAttempted.current = true;
      // Dar tiempo para que el modal se renderice completamente
      const timer = setTimeout(() => {
        initializeMap();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const initializeMap = async () => {
    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      setError("La API key de Google Maps no está configurada. Verifica la configuración del proyecto.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar que el contenedor existe y está visible
      if (!mapRef.current) {
        setError("El contenedor del mapa no está disponible.");
        setIsLoading(false);
        return;
      }

      // Verificar que el contenedor tiene dimensiones
      const rect = mapRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        setError("El contenedor del mapa no tiene dimensiones válidas.");
        setIsLoading(false);
        return;
      }

      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["places", "geometry"]
      });

      const google = await loader.load();
      
      // Centro por defecto para México
      const defaultCenter = { lat: 19.4326, lng: -99.1332 };
      const center = selectedLocation ? 
        { lat: selectedLocation.lat, lng: selectedLocation.lng } : 
        defaultCenter;

      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: selectedLocation ? 15 : 10,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;

      // Crear marcador si hay ubicación inicial
      if (selectedLocation) {
        const marker = new google.maps.Marker({
          position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
          map,
          draggable: true,
          title: "Ubicación seleccionada"
        });

        markerRef.current = marker;

        // Listener para cuando se arrastra el marcador
        marker.addListener("dragend", () => {
          const position = marker.getPosition();
          if (position) {
            handleLocationSelect(position.lat(), position.lng());
          }
        });
      }

      // Listener para clics en el mapa
      map.addListener("click", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          handleLocationSelect(event.latLng.lat(), event.latLng.lng());
        }
      });

      // Configurar búsqueda de lugares
      const searchBox = new google.maps.places.SearchBox(
        document.createElement("input")
      );

      setMapLoaded(true);
      setIsLoading(false);

    } catch (error) {
      console.error("Error loading Google Maps:", error);
      setError("Error al cargar Google Maps. Verifica que la API key esté configurada correctamente.");
      setIsLoading(false);
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    try {
      // Crear o mover el marcador
      if (mapInstanceRef.current) {
        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        } else {
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: mapInstanceRef.current,
            draggable: true,
            title: "Ubicación seleccionada"
          });

          markerRef.current = marker;

          marker.addListener("dragend", () => {
            const position = marker.getPosition();
            if (position) {
              handleLocationSelect(position.lat(), position.lng());
            }
          });
        }

        mapInstanceRef.current.setCenter({ lat, lng });
      }

      // Geocodificación reversa para obtener la dirección
      let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      if (window.google && window.google.maps) {
        const geocoder = new google.maps.Geocoder();
        try {
          const response = await geocoder.geocode({ location: { lat, lng } });
          if (response.results && response.results.length > 0) {
            address = response.results[0].formatted_address;
          }
        } catch (geocodeError) {
          console.warn("Geocoding failed:", geocodeError);
        }
      }

      const location = { lat, lng, address };
      setSelectedLocation(location);
      setManualCoords({
        lat: lat.toString(),
        lng: lng.toString(),
        address
      });

      onLocationSelect(location);
    } catch (error) {
      console.error("Error selecting location:", error);
      setError("Error al seleccionar la ubicación.");
    }
  };

  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualCoords.lat);
    const lng = parseFloat(manualCoords.lng);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Las coordenadas ingresadas no son válidas.");
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError("Las coordenadas están fuera del rango válido.");
      return;
    }

    handleLocationSelect(lat, lng);
  };

  const handleSearch = async () => {
    if (!searchValue.trim() || !mapInstanceRef.current) return;

    try {
      const service = new google.maps.places.PlacesService(mapInstanceRef.current);
      const request = {
        query: `${searchValue} ${ciudad}`,
        fields: ['place_id', 'geometry', 'formatted_address']
      };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
          const place = results[0];
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            handleLocationSelect(lat, lng);
            
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setZoom(15);
            }
          }
        } else {
          setError("No se encontraron resultados para la búsqueda.");
        }
      });
    } catch (error) {
      console.error("Search error:", error);
      setError("Error en la búsqueda.");
    }
  };

  if (error && !mapLoaded) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Seleccionar Ubicación - {ciudad}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Coordenadas Manuales (Respaldo)</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Input
                    placeholder="Latitud"
                    value={manualCoords.lat}
                    onChange={(e) => setManualCoords(prev => ({ ...prev, lat: e.target.value }))}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Longitud"
                    value={manualCoords.lng}
                    onChange={(e) => setManualCoords(prev => ({ ...prev, lng: e.target.value }))}
                  />
                </div>
              </div>
              <Input
                placeholder="Dirección"
                value={manualCoords.address}
                onChange={(e) => setManualCoords(prev => ({ ...prev, address: e.target.value }))}
                className="mt-2"
              />
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleManualLocationSubmit();
                }} 
                className="mt-2 w-full"
                type="button"
              >
                Usar Coordenadas Manuales
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Seleccionar Ubicación - {ciudad}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Input
            placeholder={`Buscar en ${ciudad}...`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleSearch();
              }
            }}
          />
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSearch();
            }} 
            variant="outline" 
            size="icon"
            type="button"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <div
            ref={mapRef}
            className="w-full h-64 bg-gray-100 rounded-lg border"
          />
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Cargando mapa...</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Coordenadas Manuales</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Latitud"
              value={manualCoords.lat}
              onChange={(e) => setManualCoords(prev => ({ ...prev, lat: e.target.value }))}
            />
            <Input
              placeholder="Longitud"
              value={manualCoords.lng}
              onChange={(e) => setManualCoords(prev => ({ ...prev, lng: e.target.value }))}
            />
          </div>
          <Input
            placeholder="Dirección"
            value={manualCoords.address}
            onChange={(e) => setManualCoords(prev => ({ ...prev, address: e.target.value }))}
          />
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleManualLocationSubmit();
            }} 
            variant="outline" 
            className="w-full"
            type="button"
          >
            Usar Coordenadas Manuales
          </Button>
        </div>

        {selectedLocation && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium">Ubicación Seleccionada:</p>
            <p className="text-sm text-gray-600">
              Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
            </p>
            <p className="text-sm text-gray-600">{selectedLocation.address}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}