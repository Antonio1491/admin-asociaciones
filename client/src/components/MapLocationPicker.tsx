import { useState } from "react";
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
  const [searchValue, setSearchValue] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(
    initialLocation || null
  );
  const [manualCoords, setManualCoords] = useState({
    lat: initialLocation?.lat?.toString() || "",
    lng: initialLocation?.lng?.toString() || "",
    address: initialLocation?.address || ""
  });

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

        {/* Placeholder visual para mapa */}
        <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-48 flex items-center justify-center border border-gray-200">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Vista previa del mapa</p>
            {selectedLocation && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedLocation.address}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}