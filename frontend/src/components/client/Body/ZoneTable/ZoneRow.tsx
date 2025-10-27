// ./ZoneTable/ZoneRow.tsx

import React from "react";
import type { Zone } from "../../../../models/Zone";

interface ZoneRowProps {
  zone: Zone;
  // --- ¡CAMBIOS AQUÍ! ---
  // 1. Recibe la cantidad actual desde el padre
  quantity: number; 
  // 2. Recibe una función para notificar al padre de un cambio
  onQuantityChange: (zoneName: string, newQuantity: number) => void;
}

const ZoneRow: React.FC<ZoneRowProps> = ({ zone, quantity, onQuantityChange }) => {
  // 3. Ya no usamos useState aquí

  // 4. Las funciones ahora llaman al 'handler' del padre
  const handleDecrement = () => {
    const newQuantity = Math.max(0, quantity - 1);
    onQuantityChange(zone.zona, newQuantity);
  };

  const handleIncrement = () => {
    // Opcional: puedes agregar un límite máximo (ej: zone.stock)
    const newQuantity = quantity + 1;
    onQuantityChange(zone.zona, newQuantity);
  };

  return (
    <div className="grid grid-cols-3 items-center border-t text-center py-2">
      <span>{zone.zona}</span>
      <span>S/ {zone.precio.toFixed(2)}</span>
      <div className="flex items-center justify-center gap-2">
        <button
          className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleDecrement}
          // 5. La deshabilitación ahora depende del prop 'quantity'
          disabled={quantity === 0}
        >
          -
        </button>
        {/* 6. Mostramos el prop 'quantity' */}
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