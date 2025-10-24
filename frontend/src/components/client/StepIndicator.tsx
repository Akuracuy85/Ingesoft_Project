import React from "react";
import type { Step } from "../../types/Step";

interface StepIndicatorProps {
  step: Step;
  isLast?: boolean;
  isActive?: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ step, isActive }) => {
  return (
    <div className="flex items-center gap-2 w-full max-w-3xl mx-auto">
      {/* Círculo con número */}
      <div
        className={`relative flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full border-4 font-bold text-2xl
          ${isActive ? "border-black text-black" : "border-gray-400 text-gray-800"}
        `}
      >
        {/* Círculo interno relleno si está activo */}
        {isActive && <div className="absolute w-10 h-10 rounded-full bg-black"></div>}

        {/* Número encima del círculo interno, solo si NO está activo */}
        {!isActive && (
        <div className="relative text-black">
            {step.number ?? 1}
        </div>
        )}
      </div>

      {/* Bloque de texto + línea */}
      <div className="flex flex-col flex-1">
        <div className="text-gray-700 font-medium text-[25px] mb-1">
          {step.title}
        </div>
        <div className="h-1 bg-black w-full"></div>
      </div>
    </div>
  );
};

export default StepIndicator;