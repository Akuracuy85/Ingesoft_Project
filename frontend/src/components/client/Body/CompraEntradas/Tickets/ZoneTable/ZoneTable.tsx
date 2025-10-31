// ./ZoneTable/ZoneTable.tsx

import React from "react";
import type { Zone } from "../../../../../../models/Zone";
import ZoneRow from "./ZoneRow";

interface ZoneTableProps {
  zones: Zone[];
  selectedQuantities: Record<string, number>;
  onQuantityChange: (zoneName: string, newQuantity: number) => void;
}

const ZoneTable: React.FC<ZoneTableProps> = ({
  zones,
  selectedQuantities,
  onQuantityChange,
}) => {
    
    // NOTA: Los console.log de diagnóstico han sido eliminados en la versión final limpia.

  return (
    <div className="w-full max-w-md bg-white rounded-lg border border-gray-300 overflow-hidden shadow">
      <div className="grid grid-cols-3 bg-gray-100 font-semibold text-gray-700">
        <div className="py-2 text-center">Zona</div>
        <div className="py-2 text-center">Precio</div>
        <div className="py-2 text-center">Cantidad</div>
      </div>
      {zones.map((zone) => (
        <ZoneRow
          key={zone.id} // ✅ CORRECCIÓN: Usar zone.id (el identificador único)
          zone={zone}
          // Se usa zone.zona para buscar la cantidad en el objeto de cantidades
          quantity={selectedQuantities[zone.nombre] || 0}
          onQuantityChange={onQuantityChange}
        />
      ))}
    </div>
  );
};

export default ZoneTable;