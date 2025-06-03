import { useState, useEffect, useRef } from "react";
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
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      console.error("Google Maps API key not found");
      return;
    }

    try {
      setIsLoading(true);
      
      // Wait for container to be ready
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (!mapRef.current) {
        console.warn("Map container not available");
        setIsLoading(false);
        return;
      }

      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["maps", "places"]
      });

      await loader.load();
      
      // Coordenadas por defecto para México
      const defaultCenter = { lat: 19.4326, lng: -99.1332 };
      const center = initialLocation || defaultCenter;

      const map = new (window as any).google.maps.Map(mapRef.current, {
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
      map.addListener("click", (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        const location = {
          lat,
          lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        };

        setSelectedLocation(location);
        setManualCoords({
          lat: lat.toString(),
          lng: lng.toString(),
          address: location.address
        });
        
        addMarker(location, map);
        onLocationSelect(location);
      });

      setMapLoaded(true);
    } catch (error) {
      console.error("Error loading Google Maps:", error);
      setMapLoaded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const addMarker = (location: { lat: number; lng: number; address: string }, map: any) => {
    // Eliminar marcador anterior
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Crear nuevo marcador
    const marker = new (window as any).google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: map,
      title: location.address,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="10" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
            <circle cx="16" cy="16" r="4" fill="#ffffff"/>
          </svg>
        `),
        scaledSize: new (window as any).google.maps.Size(32, 32),
        anchor: new (window as any).google.maps.Point(16, 16)
      }
    });

    markerRef.current = marker;
  };

  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualCoords.lat);
    const lng = parseFloat(manualCoords.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert("Por favor ingresa coordenadas válidas");
      return;
    }

    if (lat < -90 || lat > 90) {
      alert("La latitud debe estar entre -90 y 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      alert("La longitud debe estar entre -180 y 180");
      return;
    }

    const location = {
      lat,
      lng,
      address: manualCoords.address || `${lat}, ${lng}`
    };

    setSelectedLocation(location);
    
    // Actualizar mapa si está cargado
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat, lng });
      addMarker(location, mapInstanceRef.current);
    }
    
    onLocationSelect(location);
  };

  const suggestedLocations = [
    { name: "Ciudad de México", lat: 19.4326, lng: -99.1332 },
    { name: "Guadalajara", lat: 20.6597, lng: -103.3496 },
    { name: "Monterrey", lat: 25.6866, lng: -100.3161 },
    { name: "Puebla", lat: 19.0414, lng: -98.2063 },
    { name: "Tijuana", lat: 32.5149, lng: -117.0382 },
    { name: "León", lat: 21.1619, lng: -101.6921 }
  ];

  const handleSuggestedLocation = (location: { name: string; lat: number; lng: number }) => {
    const locationData = {
      lat: location.lat,
      lng: location.lng,
      address: location.name
    };
    setSelectedLocation(locationData);
    setManualCoords({
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      address: location.name
    });

    // Actualizar mapa si está cargado
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: location.lat, lng: location.lng });
      addMarker(locationData, mapInstanceRef.current);
    }
    
    onLocationSelect(locationData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Seleccionar Ubicación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Búsqueda por dirección */}
        <div>
          <label className="block text-sm font-medium mb-2">Buscar dirección</label>
          <div className="flex gap-2">
            <Input
              placeholder={`Buscar en ${ciudad}...`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Puedes buscar una dirección o usar las coordenadas manuales abajo
          </p>
        </div>

        {/* Ubicaciones sugeridas */}
        <div>
          <label className="block text-sm font-medium mb-2">Ubicaciones sugeridas</label>
          <div className="grid grid-cols-2 gap-2">
            {suggestedLocations.map((location) => (
              <Button
                key={location.name}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedLocation(location)}
                className="text-left justify-start"
              >
                {location.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Coordenadas manuales */}
        <div>
          <label className="block text-sm font-medium mb-2">Coordenadas manuales</label>
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
            Establecer Ubicación
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

        {/* Mapa de Google Maps */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Cargando mapa...</p>
              </div>
            </div>
          )}
          <div 
            ref={mapRef}
            className="w-full h-64 rounded-lg border border-gray-200"
            style={{ minHeight: '256px' }}
          />
          {!mapLoaded && !isLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">
                  {selectedLocation 
                    ? `Ubicación seleccionada: ${selectedLocation.address}`
                    : "Selecciona una ubicación usando las opciones superiores"
                  }
                </p>
                {selectedLocation && (
                  <div className="mt-2 text-xs text-gray-500">
                    Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}