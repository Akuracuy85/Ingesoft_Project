import React from "react";
import type { Zone } from "../../types/Zone";
import ZoneRow from "./ZoneRow";

interface ZoneTableProps {
  zones: Zone[];
}

const ZoneTable: React.FC<ZoneTableProps> = ({ zones }) => {
  return (
    <div className="w-full max-w-md bg-white rounded-lg border border-gray-300 overflow-hidden shadow">
      <div className="grid grid-cols-3 bg-gray-100 font-semibold text-gray-700">
        <div className="py-2 text-center">Zona</div>
        <div className="py-2 text-center">Precio</div>
        <div className="py-2 text-center">Cantidad</div>
      </div>
      {zones.map((zone) => (
        <ZoneRow key={zone.zona} zone={zone} />
      ))}
    </div>
  );
};

export default ZoneTable;
