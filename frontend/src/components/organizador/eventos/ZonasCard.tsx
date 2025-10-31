import { Map } from "lucide-react";

export default function ZonasCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 p-2 rounded-md">
          <Map className="h-5 w-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Zonas diferenciadas</h3>
          <p className="text-sm text-gray-500">Define sectores, aforos y ubicaciones.</p>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <p>Administra zonas como VIP, Platea, General, etc.</p>
      </div>
    </div>
  );
}

