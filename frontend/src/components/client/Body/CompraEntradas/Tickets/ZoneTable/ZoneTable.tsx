import React from "react";
import type { Zone } from "../../../../../../models/Zone";
import ZoneRow from "./ZoneRow";

interface ZoneTableProps {
  zones: Zone[];
  selectedQuantities: Record<string, number>;
  onQuantityChange: (zoneName: string, newQuantity: number) => void;
  
  // ✅ Propiedades existentes
  maxGlobalLimit: number;
  currentTotal: number;

  // 🔹 NUEVA PROP: tipo de compra elegido ("preventa" o "normal")
  purchaseType: "preventa" | "normal";
}

const ZoneTable: React.FC<ZoneTableProps> = ({
  zones,
  selectedQuantities,
  onQuantityChange,
  maxGlobalLimit, 
  currentTotal,
  purchaseType, // 🔹 se recibe desde el componente padre
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
          key={zone.id}
          zone={zone}
          quantity={selectedQuantities[zone.nombre] || 0}
          onQuantityChange={onQuantityChange}
          maxGlobalLimit={maxGlobalLimit}
          currentTotal={currentTotal}
          purchaseType={purchaseType} // ✅ Se pasa hacia ZoneRow
        />
      ))}
    </div>
  );
};

export default ZoneTable;