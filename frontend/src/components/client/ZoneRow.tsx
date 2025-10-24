import React from "react";
import type { Zone } from "../../types/Zone";

interface ZoneRowProps {
  zone: Zone;
}

const ZoneRow: React.FC<ZoneRowProps> = ({ zone }) => {
  return (
    <div className="grid grid-cols-3 items-center border-t text-center py-2">
      <span>{zone.zona}</span>
      <span>S/ {zone.precio.toFixed(2)}</span>
      <div className="flex items-center justify-center gap-2">
        <button className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300">
          -
        </button>
        <span>0</span>
        <button className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300">
          +
        </button>
      </div>
    </div>
  );
};

export default ZoneRow;