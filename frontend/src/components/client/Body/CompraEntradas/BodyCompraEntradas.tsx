import React, { useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../hooks/useAuth";



import EventoService from "../../../../services/EventoService";
import type { EventDetailsForPurchase } from "../../../../services/EventoService";
import PerfilService from "../../../../services/PerfilService";
import CompraService from "../../../../services/CompraService";

import { PasoTickets } from "./Tickets/PasoTickets";
import DatosCompra from "./DatosCompra/PasoDatosCompra";
import StepIndicator from "./StepIndicator";

import type { SummaryItem } from "./Tickets/SelectionSummaryTable";
import type { Zone } from "../../../../models/Zone";
import type { ZonePurchaseDetail } from "../../../../types/ZonePurchaseDetail";
import type { Step } from "../../../../types/Step";

import { calcularPuntos } from "../../../../utils/points";
import Loading from "@/components/common/Loading";

const steps: Step[] = [
  { title: "TICKETS", number: 1 },
  { title: "DATOS DE COMPRA", number: 2 },
];

export const BodyCompraEntradas: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectionSummary, setSelectionSummary] = useState<SummaryItem[]>([]);

  const tipoTarifa: "Normal" | "Preventa" = location.state?.tipoTarifa || "Normal";
  const isUsingPointsFlow = tipoTarifa === "Preventa";
  const purchaseType: "normal" | "preferencial" = isUsingPointsFlow ? "preferencial" : "normal";

  const { data: ticketsPoseidos = 0, isLoading: isLoadingTicketsPoseidos } = useQuery<number>({
    queryKey: ["ticketsPoseidos", id],
    queryFn: async () => {
      if (!id) throw new Error("ID de evento no disponible");
      const cantidad = await CompraService.getCantidadEntradasPorEvento(Number(id));
      return cantidad ?? 0;
    },
    enabled: !!user && !!id,
  });

  const MAX_TICKETS = Math.max(0, 4 - ticketsPoseidos);

  // --- Consulta de evento ---
  const { data: eventDetails, isLoading, isError, error } = useQuery<EventDetailsForPurchase>({
    queryKey: ["eventPurchase", id],
    queryFn: () => {
      if (!id) throw new Error("ID de evento no disponible.");
      return EventoService.buscarDatosCompraPorId(id);
    },
    enabled: !!id,
  });

  // --- Puntos del usuario ---
  const { data: fetchedUserPoints, isLoading: isLoadingPoints } = useQuery<number | null>({
    queryKey: ["userPoints"],
    queryFn: async () => {
      const puntosInfo = await PerfilService.getPuntos();
      return puntosInfo.totalPoints;
    },
    enabled: !!user,
  });

  const userPoints = fetchedUserPoints ?? 0;

  // --- Mapeo de zonas ---
  const zonesToMap: ZonePurchaseDetail[] = eventDetails?.zonasDisponibles || [];
  const zones: Zone[] = zonesToMap.map((detail) => ({
    id: detail.id,
    nombre: detail.nombre,
    capacidad: detail.capacidad,
    cantidadComprada: detail.cantidadComprada,
    tarifaNormal: detail.tarifaNormal,
    tarifaPreventa: detail.tarifaPreventa,
  }));

  // --- Cálculos ---
  const finalSubtotal = useMemo(
    () => selectionSummary.reduce((total, item) => total + item.subtotal, 0),
    [selectionSummary]
  );

  const totalPointsImpact = useMemo(
    () => calcularPuntos(finalSubtotal, isUsingPointsFlow),
    [finalSubtotal, isUsingPointsFlow]
  );

  // --- Handlers ---
  const handleStep1Complete = (summary: SummaryItem[]) => {
    setSelectionSummary(summary);
    setCurrentStep(1);
  };

  const handleGoBack = () => setCurrentStep(0);

  // --- Loading/Error ---
  if (isLoading || isLoadingPoints || isLoadingTicketsPoseidos) {
    return (
      <>
        <Loading fullScreen />
      </>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-xl font-medium text-red-600 dark:text-red-500">
        Error al cargar el evento.{" "}
        {error instanceof Error ? error.message : "Error desconocido."}
      </div>
    );
  }

  if (!eventDetails) {
    return (
      <div className="text-center py-20 text-xl font-medium text-gray-500 dark:text-gray-200">
        El evento con ID {id} no fue encontrado o no está disponible para compra.
      </div>
    );
  }

  const eventIdNumber = eventDetails.id;

  // --- Renderizado ---
  return (
    <div className="w-full flex flex-col items-center bg-white px-8 py-6 text-black dark:bg-gray-900 dark:text-white">
      <StepIndicator currentStep={currentStep} steps={steps} />

      {currentStep === 0 && (
        <PasoTickets
          eventDetails={eventDetails}
          zones={zones}
          zonesToMap={zonesToMap}
          tipoTarifa={tipoTarifa}
          isUsingPointsFlow={isUsingPointsFlow}
          userPoints={userPoints}
          maxTickets={MAX_TICKETS}
          onStepComplete={handleStep1Complete}
        />
      )}

      {currentStep === 1 && (
        <DatosCompra
          eventoId={eventIdNumber}
          summaryItems={selectionSummary}
          onBack={handleGoBack}
          isUsingPoints={isUsingPointsFlow}
          purchaseType={purchaseType}
          totalPointsImpact={totalPointsImpact}
          userPoints={userPoints}
        />
      )}
    </div>
  );
};
