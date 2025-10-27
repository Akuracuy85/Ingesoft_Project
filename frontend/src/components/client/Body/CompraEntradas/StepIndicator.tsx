import React from "react";
import type { Step } from "../../../../types/Step";

interface StepIndicatorProps {
  step: Step;
  isLast?: boolean; // Todavía lo mantenemos por si lo necesitas para otra cosa, pero no afectará la línea ahora.
  isActive?: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  step,
  isActive,
  isLast, // Lo mantenemos pero no lo usaremos para la línea
}) => {
  return (
    <div className="flex items-center gap-2 w-full mx-auto">
      {/* Círculo con número o círculo relleno */}
      <div
        className={`relative flex-shrink-0 flex items-center justify-center 
          w-8 h-8 rounded-full border-2 font-bold text-base
          ${
            isActive // Si está activo (DATOS DE COMPRA en tu imagen)
              ? "border-gray-400 bg-white" // Borde gris, fondo blanco para el círculo principal
              : "border-gray-400 bg-white" // Inactivo (TICKETS en tu imagen): Borde gris, fondo blanco
          }
        `}
      >
        {isActive ? (
          // ✅ Círculo interno negro para el estado activo
          <div className="w-4 h-4 rounded-full bg-black"></div>
        ) : (
          // ✅ Número para el estado inactivo (pero bordeado, no relleno)
          <div className="text-black">{step.number ?? 1}</div>
        )}
      </div>

      {/* Bloque de texto + línea */}
      <div className="flex flex-col flex-1">
        <div
          className={`font-medium text-lg mb-1 
            ${isActive ? "text-black" : "text-gray-700"}`} // ✅ El texto activo es más oscuro
        >
          {step.title}
        </div>
        
        {/* ✅ La línea siempre se muestra (quitamos la condición !isLast) */}
        <div className="h-1 bg-black w-full"></div>
      </div>
    </div>
  );
};

export default StepIndicator;