import React, { useState, useMemo } from "react";
import ZoneTable from "./ZoneTable/ZoneTable";
import Encabezado from "../../../../../assets/EstadioImagen.png";
import SelectionSummaryTable from "./SelectionSummaryTable";
import type { EventDetailsForPurchase } from "../../../../../services/EventoService";
import type { SummaryItem } from "./SelectionSummaryTable";
import type { Zone } from "../../../../../models/Zone";
import type { ZonePurchaseDetail } from "../../../../../types/ZonePurchaseDetail";
import { calcularPuntos } from "../../../../../utils/points";
import NotificationService from "@/services/NotificationService";

interface PasoTicketsProps {
  eventDetails: EventDetailsForPurchase;
  zones: Zone[];
  zonesToMap: ZonePurchaseDetail[];
  tipoTarifa: "Normal" | "Preventa";
  isUsingPointsFlow: boolean;
  userPoints: number;
  maxTickets: number;
  onStepComplete: (summary: SummaryItem[]) => void;
}

const getActiveZonePrice = (
  zoneDetail: ZonePurchaseDetail,
  tarifa: "Normal" | "Preventa"
): number => {
  return tarifa === "Preventa" && zoneDetail.tarifaPreventa
    ? zoneDetail.tarifaPreventa.precio
    : zoneDetail.tarifaNormal.precio;
};

export const PasoTickets: React.FC<PasoTicketsProps> = ({
  eventDetails,
  zones,
  zonesToMap,
  tipoTarifa,
  isUsingPointsFlow,
  userPoints,
  maxTickets,
  onStepComplete,
}) => {
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [selectionSummary, setSelectionSummary] = useState<SummaryItem[]>([]);
  const [isSynced, setIsSynced] = useState(true); // 🔹 indica si el resumen está sincronizado

  // 🎟️ Total de entradas seleccionadas (actuales)
  const totalSelectedTickets = useMemo(
    () => Object.values(selectedQuantities).reduce((sum, q) => sum + q, 0),
    [selectedQuantities]
  );

  // 💰 Subtotal provisional (de la tabla superior)
  /*const potentialSubtotal = useMemo(() => {
    return Object.entries(selectedQuantities).reduce((total, [zoneName, quantity]) => {
      const zoneDetail = zonesToMap.find((z) => z.nombre === zoneName);
      return zoneDetail ? total + getActiveZonePrice(zoneDetail, tipoTarifa) * quantity : total;
    }, 0);
  }, [selectedQuantities, zonesToMap, tipoTarifa]);

  // 🔹 Puntos estimados (tabla superior)
  const potentialPointsImpact = useMemo(
    () => calcularPuntos(potentialSubtotal, isUsingPointsFlow),
    [potentialSubtotal, isUsingPointsFlow]
  );*/

  // 🔹 Subtotal confirmado (del resumen)
  const confirmedSubtotal = useMemo(
    () => selectionSummary.reduce((acc, item) => acc + item.subtotal, 0),
    [selectionSummary]
  );

  // 🔹 Puntos confirmados (tabla resumen)
  const confirmedPointsImpact = useMemo(
    () => calcularPuntos(confirmedSubtotal, isUsingPointsFlow),
    [confirmedSubtotal, isUsingPointsFlow]
  );

  //const totalPointsCost = isUsingPointsFlow ? potentialPointsImpact : 0;
  //const hasEnoughPoints = userPoints >= totalPointsCost;

  const handleQuantityChange = (zoneName: string, newQuantity: number) => {
    setSelectedQuantities((prev) => {
      if (prev[zoneName] === newQuantity) return prev;
      setIsSynced(false); // 🔹 Desincroniza si cambian las cantidades
      return { ...prev, [zoneName]: newQuantity };
    });
  };

  const handleSubmitSelection = () => {
    const newSummary: SummaryItem[] = [];
    zonesToMap.forEach((detail) => {
      const cantidad = selectedQuantities[detail.nombre] || 0;
      if (cantidad > 0) {
        const subtotal = getActiveZonePrice(detail, tipoTarifa) * cantidad;
        newSummary.push({ zona: detail.nombre, zonaId: detail.id, cantidad, subtotal });
      }
    });

    setSelectionSummary(newSummary);
    setIsSynced(true); // 🔹 Al actualizar, vuelve a sincronizar
  };

  const handleDeleteSummaryItem = (zoneName: string) => {
    setSelectionSummary((prev) => prev.filter((item) => item.zona !== zoneName));
    handleQuantityChange(zoneName, 0);
  };

  const handleAcceptSelection = () => {
    if (!isSynced) {
      NotificationService.warning("Debes presionar 'Actualizar selección' antes de continuar");
      return;
    }
    onStepComplete(selectionSummary);
  };

  const isSummaryVisible = selectionSummary.length > 0;

  // 🆕 --- NUEVOS CÁLCULOS DE LÍMITE DE ENTRADAS ---
  const ticketsComprados = 4 - maxTickets; // Entradas ya compradas
  const maxAlcanzado = maxTickets === 0;   // Límite alcanzado
  console.log(eventDetails)
  return (
    <>
      <img
        src={eventDetails.imageLugar ?? Encabezado}
        alt="Encabezado del Evento"
        className="w-[400px] h-[500px] rounded-lg shadow-sm object-cover"
      />

      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 my-4">
        Compra tus entradas para {eventDetails.title}
      </h1>

      <ZoneTable
        zones={zones}
        selectedQuantities={selectedQuantities}
        onQuantityChange={handleQuantityChange}
        maxGlobalLimit={maxTickets}
        currentTotal={totalSelectedTickets}
        purchaseType={tipoTarifa === "Preventa" ? "preventa" : "normal"}
      />

      {/* 🆕 Aviso de límite de entradas */}
      <div
        className={`mt-3 text-center py-2 px-4 rounded-lg ${
          maxAlcanzado
            ? "bg-red-50 border border-red-300 text-red-700"
            : "bg-yellow-50 border border-yellow-300 text-yellow-800"
        }`}
      >
        {maxAlcanzado ? (
          <>Ya tienes las 4 entradas permitidas para este evento. No puedes comprar más.</>
        ) : (
          <>
            Ya tienes <b>{ticketsComprados}</b> entrada
            {ticketsComprados === 1 ? "" : "s"} para este evento. Puedes comprar hasta{" "}
            <b>{maxTickets}</b> más (máximo total: 4).
          </>
        )}
      </div>

      {/* 🔹 Botón que cambia según el estado de sincronización */}
      <button
        onClick={handleSubmitSelection}
        disabled={maxAlcanzado} // 🔹 evita que agregue si ya llegó al máximo
        className={`mt-6 px-6 py-2 rounded-lg shadow font-semibold transition duration-150 ${
          maxAlcanzado
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : isSynced
            ? "bg-yellow-700 text-white hover:bg-yellow-800"
            : "bg-yellow-500 text-white animate-pulse"
        }`}
      >
        {isSummaryVisible
          ? isSynced
            ? "Actualizar Selección"
            : "Actualizar (Desincronizado)"
          : "Agregar"}
      </button>

      {isSummaryVisible && (
        <div className="w-full flex flex-col items-center mt-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Tu Selección ({totalSelectedTickets} entradas)
          </h2>
          <SelectionSummaryTable
            items={selectionSummary}
            onDeleteItem={handleDeleteSummaryItem}
            onAcceptSelection={handleAcceptSelection}
            isUsingPointsFlow={isUsingPointsFlow}
            totalPointsImpact={confirmedPointsImpact} // ✅ usa puntos confirmados
            userPoints={userPoints}
            isSynced={isSynced}
          />
        </div>
      )}
    </>
  );
};
