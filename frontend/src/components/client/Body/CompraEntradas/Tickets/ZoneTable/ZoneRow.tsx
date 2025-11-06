// ./ZoneTable/ZoneRow.tsx

import React, { useMemo } from "react"; // ✅ Importar useMemo
import type { Zone } from "../../../../../../models/Zone";

// --- CONSTANTE DE LÍMITE (Debe coincidir con BodyCompraEntradas) ---
const MAX_TICKETS = 4; 

interface ZoneRowProps {
  zone: Zone;
  quantity: number; 
  onQuantityChange: (zoneName: string, newQuantity: number) => void;
  // ✅ PROPIEDADES NUEVAS DEL LÍMITE GLOBAL
  maxGlobalLimit: number; // Siempre será 4
  currentTotal: number;
}

const ZoneRow: React.FC<ZoneRowProps> = ({ 
    zone, 
    quantity, 
    onQuantityChange, 
    maxGlobalLimit, // Recibido desde ZoneTable
    currentTotal    // Recibido desde ZoneTable
}) => {

    // --- CÁLCULO DEL LÍMITE MÁXIMO PARA ESTA FILA ---
    const maxAllowedForZone = useMemo(() => {
        // 1. Cupo de la zona: Capacidad total - Entradas ya compradas
        const remainingZoneCapacity = zone.capacidad - zone.cantidadComprada; 

        // 2. Límite global restante (ajustado para esta zona):
        //    Máx. global (4) - (Total actual en el carrito - Cantidad de esta zona)
        //    Esto nos da cuántas entradas más se pueden agregar ANTES de alcanzar el total de 4.
        const ticketsCurrentlySelectedInOtherZones = currentTotal - quantity;
        const remainingGlobalLimit = maxGlobalLimit - ticketsCurrentlySelectedInOtherZones;

        // El límite máximo es el menor entre el stock real de la zona y el límite global.
        return Math.min(remainingZoneCapacity, remainingGlobalLimit);
    }, [zone.capacidad, zone.cantidadComprada, currentTotal, quantity, maxGlobalLimit]);


  const handleDecrement = () => {
    const newQuantity = Math.max(0, quantity - 1);
    onQuantityChange(zone.nombre, newQuantity);
  };

  // ✅ MODIFICADO: Agrega restricción al límite de la zona
  const handleIncrement = () => {
    // 1. Calcular la nueva cantidad potencial
    const potentialQuantity = quantity + 1;

    // 2. Aplicar el límite: la nueva cantidad no puede exceder el máximo permitido.
    //    (Nota: El uso de 'disabled' abajo ya previene esto en la UI, pero este es el resguardo de la lógica)
    const newQuantity = Math.min(potentialQuantity, maxAllowedForZone);

    onQuantityChange(zone.nombre, newQuantity);
  };

  // Obtiene el precio activo para mostrar
  const activePrice = zone.tarifaPreventa && (new Date() < new Date(zone.tarifaPreventa.fechaFin)) 
                      ? zone.tarifaPreventa.precio 
                      : zone.tarifaNormal.precio;


  return (
    <div className="grid grid-cols-3 items-center border-t text-center py-2">
      <span>{zone.nombre}</span>
      
      {/* ✅ USAR EL PRECIO ACTIVO */}
      <span>S/ {(activePrice ?? 0).toFixed(2)}</span> 
      
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
          // ✅ RESTRICCIÓN CLAVE: Deshabilitar si ya se alcanzó el límite para esta zona.
          disabled={quantity >= maxAllowedForZone} 
        >
          +
        </button>
      </div>
    </div>
  );
};

export default ZoneRow;