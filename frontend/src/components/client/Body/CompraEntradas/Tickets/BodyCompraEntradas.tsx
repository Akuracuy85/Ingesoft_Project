// BodyCompraEntradas.tsx

import React, { useState, useMemo } from "react"; // ✅ Importar useMemo
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import EventoService from "../../../../../services/EventoService";
import { type EventDetailsForPurchase } from "../../../../../services/EventoService";

// Importaciones de Componentes y Tipos Locales
import ZoneTable from "./ZoneTable/ZoneTable";
import StepIndicator from "../StepIndicator";
import Encabezado from "../../../../../assets/EstadioImagen.png";
import SelectionSummaryTable from "./SelectionSummaryTable";
import type { SummaryItem } from "./SelectionSummaryTable";
import DatosCompra from "../DatosCompra/DatosCompra";

// Importaciones de Tipos para la lógica
// Importamos el modelo 'Zone' que nos diste
import type { Zone } from "../../../../../models/Zone"; 
import { type ZonePurchaseDetail } from "../../../../../types/ZonePurchaseDetail";
import type { Step } from "../../../../../types/Step";


const steps: Step[] = [
  { title: "TICKETS", number: 1 },
  { title: "DATOS DE COMPRA", number: 2 },
];

const getActiveZonePrice = (zoneDetail: ZonePurchaseDetail): number => {
    const now = new Date();
    
    if (zoneDetail.tarifaPreventa) {
        const preventaFin = new Date(zoneDetail.tarifaPreventa.fechaFin);
        
        if (now < preventaFin) {
            return zoneDetail.tarifaPreventa.precio;
        }
    }
    
    return zoneDetail.tarifaNormal.precio;
};

// --- CONSTANTE DE LÍMITE DE ENTRADAS ---
const MAX_TICKETS = 4;


export const BodyCompraEntradas: React.FC = () => {
    
    const { id } = useParams<{ id: string }>();

    const { data: eventDetails, isLoading, isError, error } = useQuery<EventDetailsForPurchase>({
        queryKey: ['eventPurchase', id],
        queryFn: () => {
            if (!id) throw new Error("ID de evento no disponible.");
            return EventoService.buscarDatosCompraPorId(id);
        },
        enabled: !!id,
    });
    

    const zonesToMap: ZonePurchaseDetail[] = eventDetails?.zonasDisponibles || [];

    const zones: Zone[] = zonesToMap.map(detail => ({
        id: detail.id,
        nombre: detail.nombre,
        capacidad: detail.capacidad,
        cantidadComprada: detail.cantidadComprada,
        

        tarifaNormal: detail.tarifaNormal, 
        tarifaPreventa: detail.tarifaPreventa,
    }));
    

    const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
    const [selectionSummary, setSelectionSummary] = useState<SummaryItem[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isUsingPointsFlow, setIsUsingPointsFlow] = useState(false);

    // --- CÁLCULO DE ENTRADAS TOTALES (OPTIMIZADO CON useMemo) ---
    const totalSelectedTickets = useMemo(() => {
        return Object.values(selectedQuantities).reduce((sum, quantity) => sum + quantity, 0);
    }, [selectedQuantities]);

    // ✅ MODIFICADO: Agrega lógica de límite de 4 entradas
    const handleQuantityChange = (zoneName: string, newQuantity: number) => {
        
        // 1. Obtener la cantidad actual de esta zona
        const currentQuantity = selectedQuantities[zoneName] || 0;

        // 2. Calcular la diferencia que se está intentando agregar
        const diff = newQuantity - currentQuantity;

        // 3. Calcular el total después del cambio
        const newTotal = totalSelectedTickets + diff;

        // 4. Aplicar restricción
        if (newTotal > MAX_TICKETS) {
            // Si el nuevo total excede el límite (4), ajustamos la cantidad de la zona
            // para que el total sea exactamente MAX_TICKETS.
            const maxAllowedForZone = currentQuantity + (MAX_TICKETS - totalSelectedTickets);
            
            // Solo si se intenta aumentar, mostramos la alerta.
            if (newQuantity > currentQuantity) {
                alert(`Solo puedes comprar un máximo de ${MAX_TICKETS} entradas en total.`);
            }

            // Establecemos la cantidad máxima permitida para esta zona (si newQuantity > maxAllowedForZone)
            // O la cantidad actual si la nueva cantidad es muy grande.
            const quantityToSet = Math.min(newQuantity, maxAllowedForZone);

            setSelectedQuantities((prevQuantities) => ({
                ...prevQuantities,
                [zoneName]: quantityToSet,
            }));
        } else {
            // Si no excede el límite, simplemente actualiza
            setSelectedQuantities((prevQuantities) => ({
                ...prevQuantities,
                [zoneName]: newQuantity,
            }));
        }
    };

    const handleSubmitSelection = () => {
        // Validación de que al menos una entrada haya sido seleccionada
        if (totalSelectedTickets === 0) {
            alert("Debes seleccionar al menos una entrada para continuar.");
            return;
        }

        const newSummary: SummaryItem[] = [];
        

        for (const detail of zonesToMap) {
            

            const cantidad = selectedQuantities[detail.nombre] || 0;
            
            if (cantidad > 0) {

                const precioActivo = getActiveZonePrice(detail);

                newSummary.push({
                    zona: detail.nombre,
                    zonaId: detail.id,
                    cantidad: cantidad,

                    subtotal: precioActivo * cantidad, 
                });
            }
        }
        setSelectionSummary(newSummary);
    };

    const handleDeleteSummaryItem = (zoneName: string) => {
        setSelectionSummary((prevSummary) =>
            prevSummary.filter((item) => item.zona !== zoneName)
        );
        handleQuantityChange(zoneName, 0);
    };
    
    const handleAcceptSelection = () => {
        // ✅ AÑADIDO: Validación final antes de pasar a DatosCompra
        if (totalSelectedTickets === 0) {
            alert("Debes seleccionar al menos una entrada para continuar.");
            return;
        }
        if (totalSelectedTickets > MAX_TICKETS) {
            alert(`Error: La cantidad máxima de entradas es ${MAX_TICKETS}. Por favor, reduce tu selección.`);
            return;
        }
        setCurrentStep(1);
    };
    
    const handleGoBack = () => {
        setCurrentStep(0);
    };

    const isSummaryVisible = selectionSummary.length > 0;
    // ✅ AÑADIDO: Control de disponibilidad de compra
    const canProceedToSummary = totalSelectedTickets > 0 && totalSelectedTickets <= MAX_TICKETS;

    // Lógica de carga y error se mantiene igual
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

    return (
        <div className="w-full flex flex-col items-center bg-gray-50 px-8 py-6">
          
          <StepIndicator currentStep={currentStep} steps={steps} />

          {currentStep === 0 && (
                <React.Fragment>
                    
                    <img
                        src={Encabezado}
                        alt="Encabezado del Evento"
                        className="w-[400px] h-[500px] rounded-lg shadow-sm object-cover"
                    />

                    <h1 className="text-2xl font-semibold text-gray-800 my-4">
                        Compra tus entradas para {eventDetails.title}
                    </h1>

                    {/* ✅ AÑADIDO: Mensaje de límite de compra */}
                    <div className="text-center mb-4 text-orange-600 font-medium p-2 border border-orange-300 bg-orange-50 rounded">
                        Máximo de {MAX_TICKETS} entradas por compra.
                    </div>

                    {/* ✅ MODIFICADO: Pasar el límite restante a ZoneTable */}
                    <ZoneTable
                        zones={zones} 
                        selectedQuantities={selectedQuantities}
                        onQuantityChange={handleQuantityChange}
                        maxGlobalLimit={MAX_TICKETS} // ✅ Propiedad enviada para el límite total
                        currentTotal={totalSelectedTickets} // ✅ Propiedad enviada para el total actual
                    />

                    <button
                        onClick={handleSubmitSelection}
                        // ✅ Deshabilitar si no se puede proceder (no hay al menos 1 entrada o se excedió el límite - aunque el límite se controla en el handler)
                        disabled={!canProceedToSummary} 
                        className="mt-6 bg-yellow-700 text-white px-6 py-2 rounded-lg shadow hover:bg-yellow-800 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSummaryVisible ? "Actualizar Selección" : "Agregar"}
                    </button>

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
                </React.Fragment>
          )}

          {currentStep === 1 && (
            <DatosCompra
              eventoId={eventDetails.id}
              summaryItems={selectionSummary}
              onBack={handleGoBack}
              isUsingPoints={isUsingPointsFlow}
            />
          )}

        </div>
    );
};