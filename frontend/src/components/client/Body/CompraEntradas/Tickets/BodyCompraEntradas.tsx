import React, { useState } from "react";
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

// FUNCIÓN AUXILIAR: Calcula el precio activo (preventa vs. normal)
// Esta función está perfecta.
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
    
    // --- Mapeo de datos para la tabla de selección ---
    const zonesToMap: ZonePurchaseDetail[] = eventDetails?.zonasDisponibles || [];

    // --- 🟢 CORRECCIÓN 1: Mapeo de Zonas ---
    // Tu modelo 'Zone' (src/types/zone.ts) dice que 'tarifaNormal' 
    // y 'tarifaPreventa' deben ser OBJETOS de tipo 'Tarifa', no un 'number'.
    // El código anterior estaba asignando un 'number', lo cual violaba el modelo.
    const zones: Zone[] = zonesToMap.map(detail => ({
        id: detail.id,
        nombre: detail.nombre,
        capacidad: detail.capacidad,
        cantidadComprada: detail.cantidadComprada,
        
        // ❌ INCORRECTO ANTES: tarifaNormal: getActiveZonePrice(detail)
        // ✅ CORRECTO: Pasamos el objeto 'Tarifa' completo
        tarifaNormal: detail.tarifaNormal, 
        tarifaPreventa: detail.tarifaPreventa,
    }));
    
    // --- Estados del Componente ---
    const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
    const [selectionSummary, setSelectionSummary] = useState<SummaryItem[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isUsingPointsFlow, setIsUsingPointsFlow] = useState(false);

    // 🚀 Funciones Handler
    const handleQuantityChange = (zoneName: string, newQuantity: number) => {
        setSelectedQuantities((prevQuantities) => ({
            ...prevQuantities,
            [zoneName]: newQuantity,
        }));
    };

    // --- 🟢 CORRECCIÓN 2: Cálculo del Subtotal ---
    // El código anterior iteraba sobre el array 'zones' (que estaba mal mapeado)
    // e intentaba calcular el subtotal con 'zone.tarifaNormal.precio', lo cual fallaba.
    //
    // La forma correcta es iterar sobre el array original 'zonesToMap'
    // y usar la función 'getActiveZonePrice' (que ya existe) para obtener el precio real.
    const handleSubmitSelection = () => {
        const newSummary: SummaryItem[] = [];
        
        // ✅ Iteramos el array original 'zonesToMap'
        for (const detail of zonesToMap) {
            
            // Obtenemos la cantidad seleccionada desde el estado
            const cantidad = selectedQuantities[detail.nombre] || 0;
            
            if (cantidad > 0) {
                // ✅ Usamos el helper para obtener el precio real (preventa o normal)
                const precioActivo = getActiveZonePrice(detail);

                newSummary.push({
                    zona: detail.nombre,
                    zonaId: detail.id,
                    cantidad: cantidad,
                    // ✅ Usamos el precio activo para el subtotal
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
        setCurrentStep(1);
    };
    
    const handleGoBack = () => {
        setCurrentStep(0);
    };

    const isSummaryVisible = selectionSummary.length > 0;

    // --- Manejo de Estados de Carga y Error ---
    
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

          {/* --- PASO 1: SELECCIÓN DE TICKETS --- */}
          {currentStep === 0 && (
                <React.Fragment>
                    
                    {/* Encabezado */}
                    <img
                        src={Encabezado}
                        alt="Encabezado del Evento"
                        className="w-[400px] h-[500px] rounded-lg shadow-sm object-cover"
                    />

                    {/* Título */}
                    <h1 className="text-2xl font-semibold text-gray-800 my-4">
                        Compra tus entradas para **{eventDetails.title}** 🎟️
                    </h1>
                    
                    {/* Tabla de Zonas */}
                    <ZoneTable
                        zones={zones} // <-- Ahora pasamos el array 'zones' correctamente tipado
                        selectedQuantities={selectedQuantities}
                        onQuantityChange={handleQuantityChange}
                    />

                    {/* Botón de Selección */}
                    <button
                        onClick={handleSubmitSelection}
                        className="mt-6 bg-yellow-700 text-white px-6 py-2 rounded-lg shadow hover:bg-yellow-800 transition duration-150"
                    >
                        {isSummaryVisible ? "Actualizar Selección" : "Agregar"}
                    </button>

                    {/* Tabla Resumen */}
                    {isSummaryVisible && (
                        <div className="w-full flex flex-col items-center mt-10">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Tu Selección
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

          {/* --- PASO 2: DATOS DE COMPRA --- */}
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
