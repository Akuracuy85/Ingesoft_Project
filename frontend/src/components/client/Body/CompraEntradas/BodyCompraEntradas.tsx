// src/components/client/Body/CompraEntradas/BodyCompraEntradas.tsx

import React, { useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../hooks/useAuth";

import EventoService from "../../../../services/EventoService";
import { type EventDetailsForPurchase } from "../../../../services/EventoService";

// Componentes de pasos
import { PasoTickets } from "./Tickets/PasoTickets";
import DatosCompra from "./DatosCompra/PasoDatosCompra";
import StepIndicator from "./StepIndicator";

// Tipos
import type { SummaryItem } from "./Tickets/SelectionSummaryTable";
import type { Zone } from "../../../../models/Zone";
import { type ZonePurchaseDetail } from "../../../../types/ZonePurchaseDetail";
import type { Step } from "../../../../types/Step";

const steps: Step[] = [
  { title: "TICKETS", number: 1 },
  { title: "DATOS DE COMPRA", number: 2 },
];

const MAX_TICKETS = 4;

export const BodyCompraEntradas: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();

  // --- Estado principal ---
  const [currentStep, setCurrentStep] = useState(0);
  const [selectionSummary, setSelectionSummary] = useState<SummaryItem[]>([]);

  // --- Variables de puntos independientes ---
  const pointsGainPerTicket = 10;   // Puntos que se acumulan al comprar
  const pointsCostPerTicket = 100;  // Puntos que se gastan al usar puntos

  // Tipo de tarifa y flujo de puntos
  const tipoTarifa: 'Normal' | 'Preventa' = location.state?.tipoTarifa || 'Normal';
  const isUsingPointsFlow = tipoTarifa === 'Preventa';
  const purchaseType: 'normal' | 'preferencial' = isUsingPointsFlow ? 'preferencial' : 'normal';

  // --- Consulta de detalles del evento ---
  const { data: eventDetails, isLoading, isError, error } = useQuery<EventDetailsForPurchase>({
    queryKey: ['eventPurchase', id],
    queryFn: () => {
      if (!id) throw new Error("ID de evento no disponible.");
      return EventoService.buscarDatosCompraPorId(id);
    },
    enabled: !!id,
  });

  // --- Datos de usuario ---
  const userPoints = user?.puntos ?? 10000;

  // --- Mapeo de zonas para Paso 1 ---
  const zonesToMap: ZonePurchaseDetail[] = eventDetails?.zonasDisponibles || [];
  const zones: Zone[] = zonesToMap.map(detail => ({
    id: detail.id,
    nombre: detail.nombre,
    capacidad: detail.capacidad,
    cantidadComprada: detail.cantidadComprada,
    tarifaNormal: detail.tarifaNormal,
    tarifaPreventa: detail.tarifaPreventa,
  }));

  // --- Cálculo de subtotal ---
  const finalSubtotal = useMemo(() => {
    return selectionSummary.reduce((total, item) => total + item.subtotal, 0);
  }, [selectionSummary]);

  // --- Cálculo de puntos totales ---
  const totalPointsImpact = useMemo(() => {
    if (selectionSummary.length === 0) return 0;

    if (isUsingPointsFlow) {
      // GASTAR puntos
      return selectionSummary.reduce((acc, item) => acc + item.cantidad * pointsCostPerTicket, 0);
    } else {
      // ACUMULAR puntos
      return selectionSummary.reduce((acc, item) => acc + item.cantidad * pointsGainPerTicket, 0);
    }
  }, [selectionSummary, isUsingPointsFlow, pointsGainPerTicket, pointsCostPerTicket]);

  // --- Handlers de navegación ---
  const handleStep1Complete = (summary: SummaryItem[]) => {
    setSelectionSummary(summary);
    setCurrentStep(1);
  };

  const handleGoBack = () => {
    setCurrentStep(0);
  };

  // --- Renderizado ---
  if (isLoading) {
    return <div className="text-center py-20 text-xl font-medium text-gray-700">Cargando datos del evento...</div>;
  }
  if (isError) {
    return <div className="text-center py-20 text-xl font-medium text-red-600">
      Error al cargar el evento. {error instanceof Error ? error.message : 'Error desconocido.'}
    </div>;
  }
  if (!eventDetails) {
    return <div className="text-center py-20 text-xl font-medium text-gray-500">
      El evento con ID {id} no fue encontrado o no está disponible para compra.
    </div>;
  }

  const eventIdNumber = eventDetails.id;

  return (
    <div className="w-full flex flex-col items-center bg-gray-50 px-8 py-6">

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
          pointsGainPerTicket={pointsGainPerTicket}
          pointsCostPerTicket={pointsCostPerTicket}
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
