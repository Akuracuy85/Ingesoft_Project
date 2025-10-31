// ./BodyCompraEntradas.tsx

import React, { useState } from "react";
// 🚨 CAMBIO CLAVE: Importar Hooks y Servicio
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// ⚠️ ASEGÚRATE DE QUE LA RUTA A TU SERVICIO Y TIPOS SEA CORRECTA
import EventoService from "../../../../../services/EventoService"; 
import { type EventDetailsForPurchase } from "../../../../../services/EventoService"; 


import ZoneTable from "./ZoneTable/ZoneTable";
import StepIndicator from "../StepIndicator"; 
import Encabezado from "../../../../../assets/EstadioImagen.png"; 
import SelectionSummaryTable from "./SelectionSummaryTable"; 
import type { SummaryItem } from "./SelectionSummaryTable";

import DatosCompra from "../DatosCompra/DatosCompra"; 

import type { Zone } from "../../../../../models/Zone";
import type { Step } from "../../../../../types/Step";
// ❌ ELIMINADO: import { mockZonesData } from "../../../../../data/zonesMock"; 

const steps: Step[] = [
  { title: "TICKETS" },
  { title: "DATOS DE COMPRA", number: 2 },
];
// ❌ ELIMINADO: const zones: Zone[] = mockZonesData; // Ahora se definirá dentro del componente


export const BodyCompraEntradas: React.FC = () => {
    
    // 1. 🚨 CAMBIO CLAVE: Obtener el ID de la URL
    const { id } = useParams<{ id: string }>();

    // 2. 🚨 CAMBIO CLAVE: Llamar al backend con useQuery
    const { data: eventDetails, isLoading, isError, error } = useQuery<EventDetailsForPurchase>({
        queryKey: ['eventPurchase', id], 
        queryFn: () => {
            if (!id) throw new Error("ID de evento no disponible.");
            return EventoService.buscarDatosCompraPorId(id);
        },
        enabled: !!id, // Solo ejecuta si el ID existe
    });
    
    // 3. 🚨 CAMBIO CLAVE: Definir 'zones' con la data del backend
    // Usamos 'zonasDisponibles' que viene del tipo EventDetailsForPurchase
    const zones: Zone[] = eventDetails?.zonasDisponibles || []; 
    
// 🚨 PUNTO DE VERIFICACIÓN CLAVE: Muestra el estado en cada render
    console.log("--- RENDERIZADO BodyCompraEntradas ---");
    console.log("isLoading:", isLoading);
    console.log("eventDetails (cargado):", !!eventDetails);
    console.log("Número de zonas (prop a ZoneTable):", zones.length);
    console.log("---------------------------------------");


    const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
    const [selectionSummary, setSelectionSummary] = useState<SummaryItem[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isUsingPointsFlow, setIsUsingPointsFlow] = useState(false); 

    // --- Funciones (Handlers) ---
    // (Se mantienen iguales, ya que usan la variable 'zones')

    const handleQuantityChange = (zoneName: string, newQuantity: number) => {
        setSelectedQuantities((prevQuantities) => ({
            ...prevQuantities,
            [zoneName]: newQuantity,
        }));
    };

    const handleSubmitSelection = () => {
        const newSummary: SummaryItem[] = [];
        for (const zone of zones) {
            const cantidad = selectedQuantities[zone.nombre] || 0;
            if (cantidad > 0) {
                newSummary.push({
                    zona: zone.nombre,
                    cantidad: cantidad,
                    subtotal: zone.costo * cantidad,
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
        console.log("Selección Aceptada, pasando al paso 2:", selectionSummary);
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
          
          {/* Indicador de Pasos... (Se mantiene) */}

          {/* --- ✅ PASO 1: SELECCIÓN DE TICKETS --- */}
          {currentStep === 0 && (
            <React.Fragment>
              {/* Encabezado */}
              <img
                src={Encabezado}
                alt="Encabezado"
                className="w-[400px] h-[500px] rounded-lg shadow-sm object-cover"
              />

              {/* Título (Ahora usa el nombre del evento del backend) */}
              <h1 className="text-2xl font-semibold text-gray-800 my-4">
                Compra tus entradas para **{eventDetails.title}** 🎟️
              </h1>

              {/* Tabla de zonas: Ahora usa las 'zones' obtenidas del backend */}
              <ZoneTable
                zones={zones} // zones = eventDetails.zonasDisponibles
                selectedQuantities={selectedQuantities}
                onQuantityChange={handleQuantityChange}
              />

              {/* Botón y Tabla Resumen... (Se mantienen) */}
              <button
                onClick={handleSubmitSelection}
                className="mt-6 bg-yellow-700 text-white px-6 py-2 rounded-lg shadow hover:bg-yellow-800"
              >
                {isSummaryVisible ? "Actualizar Selección" : "Agregar"}
              </button>

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
              summaryItems={selectionSummary} 
              onBack={handleGoBack} 
              isUsingPoints={isUsingPointsFlow}
            />
          )}

        </div>
    );
};