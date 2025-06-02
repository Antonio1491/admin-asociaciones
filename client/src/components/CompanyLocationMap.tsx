import { MapPin, ExternalLink } from "lucide-react";

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
  const googleMapsUrl = ubicacionGeografica
    ? `https://www.google.com/maps/search/?api=1&query=${ubicacionGeografica.lat},${ubicacionGeografica.lng}`
    : direccionFisica
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionFisica)}`
    : null;

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

      {/* Placeholder para mapa visual */}
      <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-64 flex items-center justify-center border border-gray-200">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">{nombreEmpresa}</h3>
          <p className="text-gray-600 text-sm">Ubicación de la empresa</p>
          {ubicacionGeografica && (
            <div className="mt-2 text-xs text-gray-500">
              Lat: {ubicacionGeografica.lat.toFixed(4)}, Lng: {ubicacionGeografica.lng.toFixed(4)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}