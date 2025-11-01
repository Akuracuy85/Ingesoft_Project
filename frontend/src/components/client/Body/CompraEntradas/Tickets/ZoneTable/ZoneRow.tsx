// ./ZoneTable/ZoneRow.tsx

import React from "react";
import type { Zone } from "../../../../../../models/Zone";

interface ZoneRowProps {
  zone: Zone;
  quantity: number; 
  onQuantityChange: (zoneName: string, newQuantity: number) => void;
}

const ZoneRow: React.FC<ZoneRowProps> = ({ zone, quantity, onQuantityChange }) => {

  const handleDecrement = () => {
    const newQuantity = Math.max(0, quantity - 1);
    onQuantityChange(zone.nombre, newQuantity);
  };

  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    onQuantityChange(zone.nombre, newQuantity);
  };

  return (
    <div className="grid grid-cols-3 items-center border-t text-center py-2">
      <span>{zone.nombre}</span>
      
      {/* ✅ CORRECCIÓN: Se usa (zone.precio ?? 0) para prevenir el error 'toFixed' si el precio es null/undefined */}
      <span>S/ {(zone.tarifaNormal.precio ?? 0).toFixed(2)}</span> 
      
      <div className="flex items-center justify-center gap-2">
        <button
          className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleDecrement}
          disabled={quantity === 0}
        >
          -
        </button>
        <span>{quantity}</span>
        <button
          className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300"
          onClick={handleIncrement}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default ZoneRow;