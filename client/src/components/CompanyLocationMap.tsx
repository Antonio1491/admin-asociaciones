import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ubicacionGeografica?.lat || !ubicacionGeografica?.lng) {
      return;
    }

    if (mapRef.current && !mapInstanceRef.current) {
      // Crear el mapa
      const map = L.map(mapRef.current).setView(
        [ubicacionGeografica.lat, ubicacionGeografica.lng], 
        15
      );

      // Agregar capa de tiles de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Crear el contenido del popup
      const popupContent = `
        <div style="text-align: center; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${nombreEmpresa}</h3>
          ${direccionFisica ? `<p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">${direccionFisica}</p>` : ''}
          ${ubicacionGeografica.address ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af;">${ubicacionGeografica.address}</p>` : ''}
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #9ca3af;">
            ${ubicacionGeografica.lat.toFixed(6)}, ${ubicacionGeografica.lng.toFixed(6)}
          </p>
        </div>
      `;

      // Agregar marcador con popup
      L.marker([ubicacionGeografica.lat, ubicacionGeografica.lng])
        .addTo(map)
        .bindPopup(popupContent)
        .openPopup();

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [ubicacionGeografica, direccionFisica, nombreEmpresa]);

  if (!ubicacionGeografica?.lat || !ubicacionGeografica?.lng) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Ubicación no disponible</p>
          {direccionFisica && (
            <p className="text-xs mt-1 text-gray-400">{direccionFisica}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        ref={mapRef} 
        className="w-full h-64 border rounded-lg"
        style={{ minHeight: '256px' }}
      />
      {direccionFisica && (
        <p className="text-sm text-gray-600 mt-2">
          <MapPin className="h-4 w-4 inline mr-1" />
          {direccionFisica}
        </p>
      )}
    </div>
  );
}