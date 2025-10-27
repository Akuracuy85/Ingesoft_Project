// ./ZoneTable/ZoneTable.tsx

import React from "react";
import type { Zone } from "../../../../../../models/Zone";
import ZoneRow from "./ZoneRow";

interface ZoneTableProps {
  zones: Zone[];
  // --- ¡NUEVOS PROPS! ---
  selectedQuantities: Record<string, number>;
  onQuantityChange: (zoneName: string, newQuantity: number) => void;
}

const ZoneTable: React.FC<ZoneTableProps> = ({
  zones,
  selectedQuantities, // Recibe el objeto de cantidades
  onQuantityChange,   // Recibe la función controladora
}) => {
  return (
    <div className="w-full max-w-md bg-white rounded-lg border border-gray-300 overflow-hidden shadow">
      <div className="grid grid-cols-3 bg-gray-100 font-semibold text-gray-700">
        <div className="py-2 text-center">Zona</div>
        <div className="py-2 text-center">Precio</div>
        <div className="py-2 text-center">Cantidad</div>
      </div>
      {zones.map((zone) => (
        <ZoneRow
          key={zone.zona}
          zone={zone}
          // --- ¡PASAMOS LOS PROPS! ---
          // Le damos la cantidad específica para esta zona (o 0 si no existe)
          quantity={selectedQuantities[zone.zona] || 0}
          // Le pasamos la misma función del padre
          onQuantityChange={onQuantityChange}
        />
      ))}
    </div>
  );
};

export default ZoneTable;