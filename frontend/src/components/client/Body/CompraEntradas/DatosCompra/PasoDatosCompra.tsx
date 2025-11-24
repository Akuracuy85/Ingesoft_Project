// src/components/client/Body/CompraEntradas/DatosCompra/PasoDatosCompra.tsx

import React, { useState, useMemo } from "react";
import type { SummaryItem } from "../Tickets/SelectionSummaryTable";
import ResumenCompra from "./ResumenCompra";
import CompraService from "../../../../../services/CompraService";
import { type CrearOrdenDto } from "../../../../../types/CrearOrdenDTO";
import { FormularioDatosCompra } from "./FormularioDatosCompra";
import { useLocation, useNavigate } from "react-router-dom";
import ColaService from "@/services/ColaService";
import NotificationService from "@/services/NotificationService";
import SelectorPago from "./SelectorPagos";
import type { Event } from "@/models/Event";

interface DatosCompraProps {
  eventoId: number;
  summaryItems: SummaryItem[];
  onBack: () => void;
  isUsingPoints: boolean;
  purchaseType: "normal" | "preferencial";
  totalPointsImpact: number;
  userPoints: number;
}

interface Attendee {
  id: string;
  zona: string;
  label: string;
}

const DNI_LENGTH = 8;

const DatosCompra: React.FC<DatosCompraProps> = ({
  eventoId,
  summaryItems,
  onBack,
  isUsingPoints,
  purchaseType,
  totalPointsImpact,
  userPoints,
}) => {
  const [dniValues, setDniValues] = useState<Record<string, string>>({});
  const [dniErrors, setDniErrors] = useState<Record<string, string>>({});
  const [conadisCodes, setConadisCodes] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [uniteTermsAccepted, setUniteTermsAccepted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showElegirTipoPagoModal, setShowElegirTipoPagoModal] = useState<boolean>(false);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // --- Crear lista de asistentes según cantidad por zona ---
  const allAttendees: Attendee[] = summaryItems.flatMap((item) =>
    Array(item.cantidad)
      .fill(null)
      .map((_, index) => ({
        id: `${item.zona}-${index}`,
        zona: item.zona,
        label: `Asistente ${index + 1} (${item.zona})`,
      }))
  );

  const conadisAttendees = allAttendees.filter((att) =>
    att.zona.toUpperCase().includes("CONADIS")
  );

  // --- Detectar DNIs duplicados en tiempo real ---
  const duplicateDnis = useMemo(() => {
    const dnis: string[] = Object.values(dniValues).filter(
      (dni) => dni.length === DNI_LENGTH
    );
    const counts: Record<string, number> = {};
    dnis.forEach((dni) => {
      counts[dni] = (counts[dni] || 0) + 1;
    });
    return new Set(Object.keys(counts).filter((dni) => counts[dni] > 1));
  }, [dniValues]);

  const handleDniChange = (id: string, value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const finalValue = numericValue.slice(0, DNI_LENGTH);
    setDniValues((prev) => ({ ...prev, [id]: finalValue }));
    if (finalValue.length === DNI_LENGTH) {
      setDniErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleConadisChange = (id: string, value: string) => {
    setConadisCodes((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uniteTermsAccepted) {
      NotificationService.warning("Debes aceptar los términos y condiciones de Unite");
      return;
    }

    const evento: Event = location.state.evento;
    if(evento?.terminosUso && !termsAccepted) {
      NotificationService.warning("Debes aceptar los términos y condiciones del evento");
      return;
    }

    // --- Validaciones de DNI ---
    let formValid = true;
    const newErrors: Record<string, string> = {};
    const enteredDnis = new Set<string>();
    const duplicateDnisOnSubmit = new Set<string>();

    allAttendees.forEach((att) => {
      const dni = dniValues[att.id]?.trim() || "";
      if (!dni) {
        newErrors[att.id] = "El DNI es obligatorio.";
        formValid = false;
      } else if (dni.length !== DNI_LENGTH) {
        newErrors[att.id] = `El DNI debe tener ${DNI_LENGTH} dígitos.`;
        formValid = false;
      } else {
        if (enteredDnis.has(dni)) {
          duplicateDnisOnSubmit.add(dni);
          formValid = false;
        }
        enteredDnis.add(dni);
      }
    });

    if (duplicateDnisOnSubmit.size > 0) {
      allAttendees.forEach((att) => {
        const dni = dniValues[att.id]?.trim() || "";
        if (duplicateDnisOnSubmit.has(dni)) {
          newErrors[att.id] = `El DNI ${dni} ya ha sido ingresado para otro asistente.`;
        }
      });
    }

    setDniErrors(newErrors);
    if (!formValid) {
      NotificationService.warning("Por favor, corrige los errores en los campos de DNI");
      return;
    }

    setIsLoading(true);

    // --- Mapear DNI por zona ---
    const dnisPorZona: Record<string, string[]> = allAttendees.reduce(
      (acc, attendee) => {
        const dni = dniValues[attendee.id];
        if (dni) {
          if (!acc[attendee.zona]) acc[attendee.zona] = [];
          acc[attendee.zona].push(dni);
        }
        return acc;
      },
      {} as Record<string, string[]>
    );

    const items = summaryItems.map((summaryItem) => ({
      zonaId: summaryItem.zonaId,
      dnis: dnisPorZona[summaryItem.zona] || [],
    }));

    const payload: CrearOrdenDto = {
      eventoId,
      items: items.filter((item) => item.dnis.length > 0),
    };

    try {
      const response = await CompraService.crearOrden(payload);

      if (response.success) {
        setPendingOrderId(response.ordenId);
        setShowElegirTipoPagoModal(true);
      }
    } catch (error: any) {
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        "Error desconocido al crear la orden.";
      console.error("Error al procesar la compra:", error);
      NotificationService.error(`Error en la compra: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Volver
      </button>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1">
          <FormularioDatosCompra
            handleSubmit={handleSubmit}
            handleDniChange={handleDniChange}
            handleConadisChange={handleConadisChange}
            setTermsAccepted={setTermsAccepted}
            setUniteTermsAccepted={setUniteTermsAccepted}
            allAttendees={allAttendees}
            conadisAttendees={conadisAttendees}
            summaryItems={summaryItems}
            dniValues={dniValues}
            dniErrors={dniErrors}
            duplicateDnis={duplicateDnis}
            conadisCodes={conadisCodes}
            termsAccepted={termsAccepted}
            uniteTermsAccepted={uniteTermsAccepted}
            isLoading={isLoading}
            isUsingPoints={isUsingPoints}
          />
        </div>

        <div className="w-full md:w-1/3">
          <ResumenCompra
            summaryItems={summaryItems}
            isUsingPoints={isUsingPoints}
            purchaseType={purchaseType}
            pointsImpact={totalPointsImpact}
            userPointsPre={userPoints}
          />
        </div>
      </div>
      {
        showElegirTipoPagoModal && pendingOrderId &&
        <SelectorPago
          monto={summaryItems.reduce((sum, i) => sum + i.subtotal, 0)}
          pendingOrderId={pendingOrderId}
          onClose={() => setShowElegirTipoPagoModal(false)}
          onConfirm={async () => {
            try {
              if (purchaseType === "normal") {
                await CompraService.confirmarStandar(pendingOrderId);
                NotificationService.success("Pago completado. Se asignaron puntos por la compra");
              } else if (purchaseType === "preferencial") {
                await CompraService.confirmarPreventa(pendingOrderId);
                NotificationService.success("Pago completado. Se descontaron puntos por la preventaa");
              }
              ColaService.eliminarTurno(location.state.evento.cola.id);
              navigate("/compra-exitosa");
            } catch (err) {
              console.error("Error al confirmar el pago:", err);
              NotificationService.error("Error al procesar el pago simulado");
            } finally {
              setShowElegirTipoPagoModal(false);
            }
          }}
          />
      }
    </div>
  );
};

export default DatosCompra;
