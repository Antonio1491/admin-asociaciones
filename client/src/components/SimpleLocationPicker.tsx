import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { paisesAmericaLatina, estadosMexico, ciudadesPorEstado } from "@/lib/locationData";

interface SimpleLocationPickerProps {
  ciudad: string;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number; address: string } | null;
}

// Coordenadas de ciudades principales en México
const coordenadasCiudades: { [key: string]: { lat: number; lng: number } } = {
  "Guadalajara, Jalisco": { lat: 20.6597, lng: -103.3496 },
  "Monterrey, Nuevo León": { lat: 25.6866, lng: -100.3161 },
  "Puebla, Puebla": { lat: 19.0414, lng: -98.2063 },
  "Tijuana, Baja California": { lat: 32.5149, lng: -117.0382 },
  "León, Guanajuato": { lat: 21.1619, lng: -101.6971 },
  "Juárez, Chihuahua": { lat: 31.6904, lng: -106.4245 },
  "Torreón, Coahuila": { lat: 25.5428, lng: -103.4068 },
  "Querétaro, Querétaro": { lat: 20.5888, lng: -100.3899 },
  "San Luis Potosí, San Luis Potosí": { lat: 22.1565, lng: -100.9855 },
  "Mérida, Yucatán": { lat: 20.9674, lng: -89.5926 },
  "Mexicali, Baja California": { lat: 32.6245, lng: -115.4523 },
  "Aguascalientes, Aguascalientes": { lat: 21.8853, lng: -102.2916 },
  "Chihuahua, Chihuahua": { lat: 28.6353, lng: -106.0889 },
  "Hermosillo, Sonora": { lat: 29.0729, lng: -110.9559 },
  "Saltillo, Coahuila": { lat: 25.4232, lng: -101.0053 },
  "Culiacán, Sinaloa": { lat: 24.7999, lng: -107.3841 },
  "Morelia, Michoacán": { lat: 19.7006, lng: -101.1844 },
  "Villahermosa, Tabasco": { lat: 17.9892, lng: -92.9475 },
  "Toluca, Estado de México": { lat: 19.2926, lng: -99.6568 },
  "Xalapa, Veracruz": { lat: 19.5437, lng: -96.9102 },
  "Tuxtla Gutiérrez, Chiapas": { lat: 16.7516, lng: -93.1161 },
  "Oaxaca, Oaxaca": { lat: 17.0732, lng: -96.7266 },
  "Pachuca, Hidalgo": { lat: 20.1011, lng: -98.7591 },
  "Cuernavaca, Morelos": { lat: 18.9262, lng: -99.2319 },
  "Durango, Durango": { lat: 24.0277, lng: -104.6532 },
  "Tepic, Nayarit": { lat: 21.5041, lng: -104.8942 },
  "Zacatecas, Zacatecas": { lat: 22.7709, lng: -102.5832 },
  "Colima, Colima": { lat: 19.2452, lng: -103.7240 },
  "Tlaxcala, Tlaxcala": { lat: 19.3139, lng: -98.2404 },
  "La Paz, Baja California Sur": { lat: 24.1426, lng: -110.3128 },
  "Campeche, Campeche": { lat: 19.8301, lng: -90.5349 },
  "Chetumal, Quintana Roo": { lat: 18.5001, lng: -88.2960 },
  // Ciudad de México y zona metropolitana
  "Ciudad de México, Ciudad de México": { lat: 19.4326, lng: -99.1332 },
  "Ecatepec, Estado de México": { lat: 19.6017, lng: -99.0608 },
  "Nezahualcóyotl, Estado de México": { lat: 19.4003, lng: -99.0144 },
  "Naucalpan, Estado de México": { lat: 19.4758, lng: -99.2386 },
  "Tlalnepantla, Estado de México": { lat: 19.5398, lng: -99.1953 },
  "Cuautitlán Izcalli, Estado de México": { lat: 19.6461, lng: -99.2064 },
};

export default function SimpleLocationPicker({ ciudad, onLocationSelect, initialLocation }: SimpleLocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(
    initialLocation || null
  );
  const [manualCoords, setManualCoords] = useState({
    lat: initialLocation?.lat?.toString() || "",
    lng: initialLocation?.lng?.toString() || "",
    address: initialLocation?.address || ""
  });
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedCiudadLocal, setSelectedCiudadLocal] = useState("");

  const handleEstadoChange = (estado: string) => {
    setSelectedEstado(estado);
    setSelectedCiudadLocal("");
  };

  const handleCiudadChange = (ciudadLocal: string) => {
    setSelectedCiudadLocal(ciudadLocal);
    
    // Buscar coordenadas para la ciudad seleccionada
    const ciudadCompleta = `${ciudadLocal}, ${selectedEstado}`;
    const coordenadas = coordenadasCiudades[ciudadCompleta];
    
    if (coordenadas) {
      const location = {
        lat: coordenadas.lat,
        lng: coordenadas.lng,
        address: ciudadCompleta
      };
      
      setSelectedLocation(location);
      setManualCoords({
        lat: coordenadas.lat.toString(),
        lng: coordenadas.lng.toString(),
        address: ciudadCompleta
      });
      onLocationSelect(location);
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
  };

  const getCiudadesDisponibles = () => {
    if (!selectedEstado) return [];
    return ciudadesPorEstado[selectedEstado] || [];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Seleccionar Ubicación para {ciudad}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selector de estado y ciudad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <Select value={selectedEstado} onValueChange={handleEstadoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(estadosMexico).map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Ciudad</label>
            <Select 
              value={selectedCiudadLocal} 
              onValueChange={handleCiudadChange}
              disabled={!selectedEstado}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una ciudad" />
              </SelectTrigger>
              <SelectContent>
                {getCiudadesDisponibles().map((ciudadLocal) => (
                  <SelectItem key={ciudadLocal} value={ciudadLocal}>
                    {ciudadLocal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
        
        {/* Información sobre ciudades disponibles */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">Ciudades con coordenadas predefinidas:</p>
          <p>Las ciudades principales de México tienen coordenadas automáticas. Para otras ubicaciones, usa las coordenadas manuales.</p>
        </div>
      </CardContent>
    </Card>
  );
}