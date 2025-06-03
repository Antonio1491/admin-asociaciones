import { useEffect, useState, useRef } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      console.error("Google Maps API key not found");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Wait for container to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!mapRef.current) {
        console.warn("Map container not available");
        setIsLoading(false);
        return;
      }

      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["places", "geocoding"]
      });

      await loader.load();

      // Coordenadas por defecto (Ciudad de México)
      const center = initialLocation 
        ? { lat: initialLocation.lat, lng: initialLocation.lng }
        : { lat: 19.4326, lng: -99.1332 };

      const map = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: center,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: 'cooperative'
      });

      mapInstanceRef.current = map;

      // Agregar marcador inicial si hay ubicación
      if (initialLocation) {
        addMarker(initialLocation, map);
      }

      // Agregar listener para clics en el mapa
      map.addListener("click", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          // Buscar dirección usando geocoding
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            
            if (status === "OK" && results && results[0]) {
              address = results[0].formatted_address;
            }

            const location = { lat, lng, address };

            setSelectedLocation(location);
            setManualCoords({
              lat: lat.toString(),
              lng: lng.toString(),
              address: address
            });
            
            addMarker(location, map);
            onLocationSelect(location);
          });
        }
      });

      setMapLoaded(true);
      setIsLoading(false);
      
    } catch (error) {
      console.error("Error loading Google Maps:", error);
      setMapLoaded(false);
      setIsLoading(false);
    }
  };

  const addMarker = (location: { lat: number; lng: number; address: string }, map: google.maps.Map) => {
    // Remover marcador anterior si existe
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Crear nuevo marcador
    markerRef.current = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: map,
      title: location.address
    });

    // Centrar el mapa en la nueva ubicación
    map.setCenter({ lat: location.lat, lng: location.lng });
  };

  const handleSearch = async () => {
    if (!searchValue.trim() || !mapInstanceRef.current) return;

    try {
      const service = new google.maps.places.PlacesService(mapInstanceRef.current);
      const request = {
        query: `${searchValue}, ${ciudad}`,
        fields: ['name', 'geometry', 'formatted_address'],
      };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
          const place = results[0];
          if (place.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const address = place.formatted_address || place.name || "";

            const location = { lat, lng, address };
            
            setSelectedLocation(location);
            setManualCoords({
              lat: lat.toString(),
              lng: lng.toString(),
              address: address
            });
            
            if (mapInstanceRef.current) {
              addMarker(location, mapInstanceRef.current);
            }
            onLocationSelect(location);
          }
        }
      });
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualCoords.lat);
    const lng = parseFloat(manualCoords.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert("Por favor ingresa coordenadas válidas");
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert("Las coordenadas deben estar en el rango válido (lat: -90 a 90, lng: -180 a 180)");
      return;
    }
    
    const address = manualCoords.address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    const location = { lat, lng, address };
    
    setSelectedLocation(location);
    onLocationSelect(location);
    
    if (mapInstanceRef.current) {
      addMarker(location, mapInstanceRef.current);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span>Cargando mapa...</span>
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
          Seleccionar Ubicación para {ciudad}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Búsqueda */}
        <div className="flex gap-2">
          <Input
            placeholder="Buscar dirección o lugar..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={!mapLoaded}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Mapa */}
        <div 
          ref={mapRef} 
          className="w-full h-64 bg-gray-200 rounded-lg"
          style={{ minHeight: '256px' }}
        />

        {/* Coordenadas manuales */}
        <div>
          <label className="block text-sm font-medium mb-2">Coordenadas manuales (opcional)</label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Input
              placeholder="Latitud (ej: 19.4326)"
              value={manualCoords.lat}
              onChange={(e) => setManualCoords({...manualCoords, lat: e.target.value})}
            />
            <Input
              placeholder="Longitud (ej: -99.1332)"
              value={manualCoords.lng}
              onChange={(e) => setManualCoords({...manualCoords, lng: e.target.value})}
            />
          </div>
          <Input
            placeholder="Dirección (opcional)"
            value={manualCoords.address}
            onChange={(e) => setManualCoords({...manualCoords, address: e.target.value})}
            className="mb-2"
          />
          <Button onClick={handleManualLocationSubmit} className="w-full">
            Establecer Ubicación Manual
          </Button>
        </div>

        {/* Ubicación seleccionada */}
        {selectedLocation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="font-medium text-green-800 mb-1">Ubicación seleccionada:</h4>
            <p className="text-sm text-green-700">
              <strong>Dirección:</strong> {selectedLocation.address}
            </p>
            <p className="text-sm text-green-700">
              <strong>Coordenadas:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        )}
        
        {!mapLoaded && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            Error al cargar Google Maps. Verifica que la API key esté configurada correctamente.
          </div>
        )}
      </CardContent>
    </Card>
  );
}