// ./BodyCompraEntradas.tsx

import React, { useState } from "react";
import ZoneTable from "./ZoneTable/ZoneTable";
import StepIndicator from "../StepIndicator"; // Asegúrate que la ruta sea correcta
import Encabezado from "../../../../../assets/EstadioImagen.png"; // Asegúrate que la ruta sea correcta
import SelectionSummaryTable from "./SelectionSummaryTable"; // Asegúrate que la ruta sea correcta
import type { SummaryItem } from "./SelectionSummaryTable";

import DatosCompra from "../DatosCompra/DatosCompra"; // Asegúrate que la ruta sea correcta

import type { Zone } from "../../../../../types/Zone";
import type { Step } from "../../../../../types/Step";
import { mockZonesData } from "../../../../../data/zonesMock";

const steps: Step[] = [
  { title: "TICKETS" },
  { title: "DATOS DE COMPRA", number: 2 },
];
const zones: Zone[] = mockZonesData;

export const BodyCompraEntradas: React.FC = () => {
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [selectionSummary, setSelectionSummary] = useState<SummaryItem[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isUsingPointsFlow, setIsUsingPointsFlow] = useState(false); 

  // --- Funciones (Handlers) ---

  const handleQuantityChange = (zoneName: string, newQuantity: number) => {
    setSelectedQuantities((prevQuantities) => ({
      ...prevQuantities,
      [zoneName]: newQuantity,
    }));
  };

  const handleSubmitSelection = () => {
    const newSummary: SummaryItem[] = [];
    for (const zone of zones) {
      const cantidad = selectedQuantities[zone.zona] || 0;
      if (cantidad > 0) {
        newSummary.push({
          zona: zone.zona,
          cantidad: cantidad,
          subtotal: zone.precio * cantidad,
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

  return (
    <div className="w-full flex flex-col items-center bg-gray-50 px-8 py-6">
      
      {/* Indicador de Pasos */}
      <div className="w-full max-w-4xl mx-auto mb-8">
        <div className="flex items-start gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex-1 flex justify-center relative">
              <StepIndicator
                step={step}
                isLast={idx === steps.length - 1}
                isActive={idx === currentStep}
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- ✅ PASO 1: SELECCIÓN DE TICKETS (CONTENIDO RESTAURADO) --- */}
      {currentStep === 0 && (
        <React.Fragment>
          {/* Encabezado */}
          <img
            src={Encabezado}
            alt="Encabezado"
            className="w-[400px] h-[500px] rounded-lg shadow-sm object-cover"
          />

          {/* Título */}
          <h1 className="text-2xl font-semibold text-gray-800 my-4">
            Compra tus entradas 🎟️
          </h1>

          {/* Tabla de zonas */}
          <ZoneTable
            zones={zones}
            selectedQuantities={selectedQuantities}
            onQuantityChange={handleQuantityChange}
          />

          {/* Botón "Agregar" / "Actualizar" */}
          <button
            onClick={handleSubmitSelection}
            className="mt-6 bg-yellow-700 text-white px-6 py-2 rounded-lg shadow hover:bg-yellow-800"
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
          summaryItems={selectionSummary} 
          onBack={handleGoBack} 
          isUsingPoints={isUsingPointsFlow}
        />
      )}

    </div>
  );
};