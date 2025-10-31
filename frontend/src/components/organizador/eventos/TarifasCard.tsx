import { Tags } from "lucide-react";

export default function TarifasCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 p-2 rounded-md">
          <Tags className="h-5 w-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Tarifas diferenciadas</h3>
          <p className="text-sm text-gray-500">Configura precios y categorías de entradas.</p>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <p>Define tarifas por tipo de entrada, promociones y descuentos.</p>
      </div>
    </div>
  );
}

