import React from "react";
import type { Step } from "../../../../types/Step";


export interface StepIndicatorProps {
    currentStep: number; 
    steps: Step[]; 
}

const SingleStep: React.FC<{ step: Step; isActive: boolean; isCompleted: boolean; isLast: boolean }> = ({
    step,
    isActive,
    isCompleted,
    isLast,
}) => {
    // Determinar el estilo
    const circleClass = isCompleted
        ? "bg-black text-white dark:bg-yellow-500 dark:text-white" // Completado
        : isActive
        ? "border-2 border-black bg-white text-black dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" // Activo
        : "border-2 border-gray-400 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"; // Inactivo

    return (
        <div className="flex items-center">
            {/* Círculo */}
            <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-base ${circleClass}`}
            >
                {isCompleted ? (
                    '✓' // O icono de check
                ) : (
                    step.number ?? 1
                )}
            </div>

            {/* Línea y Título */}
            <div className="flex flex-col ml-2 flex-1 min-w-0">
                <div className={`font-medium text-lg mb-1 ${isActive || isCompleted ? "text-black dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}>
                    {step.title}
                </div>
                {/* La línea conectora solo si NO es el último paso */}
                {!isLast && (
                    (() => {
                        const connectorClass = isCompleted ? 'h-1 w-full mt-1 bg-black dark:bg-yellow-500' : 'h-1 w-full mt-1 bg-gray-300 dark:bg-gray-700';
                        return <div className={connectorClass}></div>;
                    })()
                )}
            </div>
        </div>
    );
};


// 🚀 COMPONENTE PRINCIPAL (Este es el que usas en BodyCompraEntradas)
const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
    return (
        <div className="flex justify-between w-full max-w-lg mx-auto mb-8">
            {steps.map((step, index) => (
                <SingleStep
                    key={index}
                    step={step}
                    isActive={index === currentStep}
                    isCompleted={index < currentStep}
                    isLast={index === steps.length - 1}
                />
            ))}
        </div>
    );
};

export default StepIndicator;