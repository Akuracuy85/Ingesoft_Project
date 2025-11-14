import React, { useMemo } from "react";
import type { Zone } from "../../../../../../models/Zone";

//const MAX_TICKETS = 4;

interface ZoneRowProps {
  zone: Zone;
  quantity: number;
  onQuantityChange: (zoneName: string, newQuantity: number) => void;
  maxGlobalLimit: number;
  currentTotal: number;

  // 🔹 Nueva prop: tipo de compra elegido por el usuario
  purchaseType: "preventa" | "normal";
}

const ZoneRow: React.FC<ZoneRowProps> = ({
  zone,
  quantity,
  onQuantityChange,
  maxGlobalLimit,
  currentTotal,
  purchaseType, // 🔹 se recibe desde ZoneTable
}) => {
  // --- Calcular el máximo permitido ---
  const maxAllowedForZone = useMemo(() => {
    const remainingZoneCapacity = zone.capacidad - zone.cantidadComprada;
    const ticketsCurrentlySelectedInOtherZones = currentTotal - quantity;
    const remainingGlobalLimit = maxGlobalLimit - ticketsCurrentlySelectedInOtherZones;

    return Math.min(remainingZoneCapacity, remainingGlobalLimit);
  }, [zone.capacidad, zone.cantidadComprada, currentTotal, quantity, maxGlobalLimit]);

  // --- Elegir el precio según tipo de compra ---
  const activePrice =
    purchaseType === "preventa"
      ? zone.tarifaPreventa?.precio ?? zone.tarifaNormal?.precio ?? 0
      : zone.tarifaNormal?.precio ?? 0;

  const handleDecrement = () => {
    const newQuantity = Math.max(0, quantity - 1);
    onQuantityChange(zone.nombre, newQuantity);
  };

  const handleIncrement = () => {
    const potentialQuantity = quantity + 1;
    const newQuantity = Math.min(potentialQuantity, maxAllowedForZone);
    onQuantityChange(zone.nombre, newQuantity);
  };

  return (
    <div className="grid grid-cols-3 items-center border-t text-center py-2">
      <span>{zone.nombre}</span>

      {/* ✅ Precio depende del tipo de compra elegido */}
      <span>S/ {activePrice.toFixed(2)}</span>

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
          className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleIncrement}
          disabled={quantity >= maxAllowedForZone}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default ZoneRow;
