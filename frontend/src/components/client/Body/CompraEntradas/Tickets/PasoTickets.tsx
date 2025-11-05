// src/components/client/Body/CompraEntradas/Tickets/PasoTickets.tsx

import React, { useState, useMemo } from "react";

// Componentes UI
import ZoneTable from "./ZoneTable/ZoneTable";
import Encabezado from "../../../../../assets/EstadioImagen.png";
import SelectionSummaryTable from "./SelectionSummaryTable";

// Tipos
import type { EventDetailsForPurchase } from "../../../../../services/EventoService";
import type { SummaryItem } from "./SelectionSummaryTable";
import type { Zone } from "../../../../../models/Zone";
import { type ZonePurchaseDetail } from "../../../../../types/ZonePurchaseDetail";

interface PasoTicketsProps {
  eventDetails: EventDetailsForPurchase;
  zones: Zone[];
  zonesToMap: ZonePurchaseDetail[];
  tipoTarifa: 'Normal' | 'Preventa';
  isUsingPointsFlow: boolean;
  userPoints: number;
  pointsGainPerTicket: number;
  pointsCostPerTicket: number;
  maxTickets: number;
  onStepComplete: (summary: SummaryItem[]) => void;
}

// Función para obtener el precio activo de la zona según tarifa
const getActiveZonePrice = (zoneDetail: ZonePurchaseDetail, tarifa: 'Normal' | 'Preventa'): number => {
  if (tarifa === 'Preventa' && zoneDetail.tarifaPreventa) {
    return zoneDetail.tarifaPreventa.precio;
  }
  return zoneDetail.tarifaNormal.precio;
};

export const PasoTickets: React.FC<PasoTicketsProps> = ({
  eventDetails,
  zones,
  zonesToMap,
  tipoTarifa,
  isUsingPointsFlow,
  userPoints,
  pointsGainPerTicket,
  pointsCostPerTicket,
  maxTickets,
  onStepComplete
}) => {

  // --- Estados locales ---
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [selectionSummary, setSelectionSummary] = useState<SummaryItem[]>([]);

  // --- Cálculos en tiempo real ---
  const totalSelectedTickets = useMemo(() => 
    Object.values(selectedQuantities).reduce((sum, q) => sum + q, 0)
  , [selectedQuantities]);

  const potentialSubtotal = useMemo(() => {
    return Object.entries(selectedQuantities).reduce((total, [zoneName, quantity]) => {
      if (!quantity) return total;
      const zoneDetail = zonesToMap.find(z => z.nombre === zoneName);
      if (!zoneDetail) return total;
      return total + getActiveZonePrice(zoneDetail, tipoTarifa) * quantity;
    }, 0);
  }, [selectedQuantities, zonesToMap, tipoTarifa]);

  // --- Lógica de puntos separada ---
  const totalPointsImpact = useMemo(() => {
    if (totalSelectedTickets === 0) return 0;
    return isUsingPointsFlow
      ? totalSelectedTickets * pointsCostPerTicket // GASTAR puntos
      : totalSelectedTickets * pointsGainPerTicket; // ACUMULAR puntos
  }, [totalSelectedTickets, isUsingPointsFlow, pointsGainPerTicket, pointsCostPerTicket]);

  const totalPointsCost = isUsingPointsFlow ? totalPointsImpact : 0;
  const hasEnoughPoints = userPoints >= totalPointsCost;

  const isSummaryVisible = selectionSummary.length > 0;
  const canProceedToSummary = totalSelectedTickets > 0 && totalSelectedTickets <= maxTickets;

  // --- Handlers ---
  const handleQuantityChange = (zoneName: string, newQuantity: number) => {
    const currentQuantity = selectedQuantities[zoneName] || 0;
    const diff = newQuantity - currentQuantity;
    const newTotal = totalSelectedTickets + diff;

    let quantityToSet = newQuantity;
    if (newTotal > maxTickets) {
      const maxAllowed = currentQuantity + (maxTickets - totalSelectedTickets);
      quantityToSet = Math.min(newQuantity, maxAllowed);
      if (newQuantity > currentQuantity) {
        alert(`Solo puedes comprar un máximo de ${maxTickets} entradas en total.`);
      }
    }

    setSelectedQuantities(prev => ({ ...prev, [zoneName]: quantityToSet }));
  };

  const handleSubmitSelection = () => {
    if (totalSelectedTickets === 0) {
      alert("Debes seleccionar al menos una entrada para continuar.");
      return;
    }
    if (isUsingPointsFlow && !hasEnoughPoints) {
      alert(`No tienes suficientes puntos. Necesitas ${totalPointsCost} y solo tienes ${userPoints}.`);
      return;
    }

    const newSummary: SummaryItem[] = [];
    zonesToMap.forEach(detail => {
      const cantidad = selectedQuantities[detail.nombre] || 0;
      if (cantidad > 0) {
        const subtotal = getActiveZonePrice(detail, tipoTarifa) * cantidad;
        newSummary.push({
          zona: detail.nombre,
          zonaId: detail.id,
          cantidad,
          subtotal
        });
      }
    });

    setSelectionSummary(newSummary);
  };

  const handleDeleteSummaryItem = (zoneName: string) => {
    setSelectionSummary(prev => prev.filter(item => item.zona !== zoneName));
    handleQuantityChange(zoneName, 0);
  };

  const handleAcceptSelection = () => {
    if (selectionSummary.length === 0) {
      alert("Debes 'Agregar' tu selección antes de continuar.");
      return;
    }
    if (totalSelectedTickets > maxTickets) {
      alert(`Error: La cantidad máxima de entradas es ${maxTickets}. Reduce tu selección.`);
      return;
    }
    if (isUsingPointsFlow && !hasEnoughPoints) {
      alert(`No tienes suficientes puntos. Necesitas ${totalPointsImpact} y solo tienes ${userPoints}.`);
      return;
    }

    onStepComplete(selectionSummary);
  };

  // --- Renderizado ---
  return (
    <>
      <img src={Encabezado} alt="Encabezado del Evento" className="w-[400px] h-[500px] rounded-lg shadow-sm object-cover" />
      <h1 className="text-2xl font-semibold text-gray-800 my-4">
        Compra tus entradas para {eventDetails.title}
      </h1>

      {/* Indicador de tarifa y flujo de puntos */}
      <div className="w-full max-w-2xl text-center mb-4 text-lg font-medium p-3 border border-gray-300 bg-white rounded shadow-sm">
        Tarifa seleccionada:  
        <span className={`font-bold ${tipoTarifa === 'Preventa' ? 'text-blue-600' : 'text-green-600'}`}>
          {" "}{tipoTarifa}
        </span>
        <div className="text-sm font-normal mt-1">
          {isUsingPointsFlow 
            ? <span className="text-red-600">(Esta compra usará {totalPointsImpact} Puntos. Saldo: {userPoints})</span>
            : <span className="text-green-600">(Esta compra acumulará {totalPointsImpact} Puntos)</span>
          }
        </div>
      </div>

      <div className="text-center mb-4 text-orange-600 font-medium p-2 border border-orange-300 bg-orange-50 rounded">
        Máximo de {maxTickets} entradas adquiridas por evento.
      </div>

      <ZoneTable
        zones={zones}
        selectedQuantities={selectedQuantities}
        onQuantityChange={handleQuantityChange}
        maxGlobalLimit={maxTickets}
        currentTotal={totalSelectedTickets}
      />

      <button
        onClick={handleSubmitSelection}
        disabled={!canProceedToSummary || (isUsingPointsFlow && !hasEnoughPoints)}
        className="mt-6 bg-yellow-700 text-white px-6 py-2 rounded-lg shadow hover:bg-yellow-800 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSummaryVisible ? "Actualizar Selección" : "Agregar"}
      </button>

      {isUsingPointsFlow && !hasEnoughPoints && totalSelectedTickets > 0 && (
        <div className="mt-4 text-red-600 font-medium">
          No tienes suficientes puntos para {totalSelectedTickets} entrada(s). Necesitas {totalPointsCost}.
        </div>
      )}

      {isSummaryVisible && (
        <div className="w-full flex flex-col items-center mt-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Tu Selección ({totalSelectedTickets} entradas)
          </h2>
          <SelectionSummaryTable
            items={selectionSummary}
            onDeleteItem={handleDeleteSummaryItem}
            onAcceptSelection={handleAcceptSelection}
          />
        </div>
      )}
    </>
  );
};
