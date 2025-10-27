// ./ResumenCompra.tsx

import React from "react";
import type { SummaryItem } from "../Tickets/SelectionSummaryTable";

interface ResumenCompraProps {
  summaryItems: SummaryItem[];
  // ✅ ¡NUEVO PROP! 
  // true = muestra "Puntos utilizados"
  // false = muestra "Puntos acumulados"
  isUsingPoints: boolean; 
}

const ResumenCompra: React.FC<ResumenCompraProps> = ({ 
  summaryItems, 
  isUsingPoints 
}) => {
  const totalGeneral = summaryItems.reduce((acc, item) => acc + item.subtotal, 0);

  // --- Datos simulados para el Flujo "Usando Puntos" (Home Page 7) ---
  const puntosUtilizados = 30;
  const saldoConGasto = 240;
  const notaGasto = "*Se consumen 10 puntos por entrada en la cola preferencial.";

  // --- Datos simulados para el Flujo "Sin Usar Puntos" (Home Page 8) ---
  const puntosAcumulados = 10;
  const saldoConGanancia = 260;
  const notaGanancia = "*Se acumulan 5 puntos por cada entrada adquirida.";

  return (
    <div className="sticky top-10">
      {/* Resumen de Compra (sin cambios) */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Resumen
        </h3>
        <div className="space-y-2">
          {summaryItems.map((item) => (
            <div key={item.zona} className="flex justify-between text-gray-700">
              <span className="capitalize">{item.zona.toLowerCase()}</span>
              <span className="font-medium">S/ {item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-gray-900 font-bold text-lg mt-4 pt-4 border-t-2">
          <span>Total:</span>
          <span>S/ {totalGeneral.toFixed(2)}</span>
        </div>
      </div>

      {/* --- ✅ ¡NUEVO! Bloque de Puntos Condicional --- */}
      {isUsingPoints ? (
        // --- CASO 1: ESTÁ USANDO PUNTOS (Home Page 7) ---
        <div className="mt-6">
          <div className="flex gap-4">
            <div className="flex-1 bg-gray-100 p-4 rounded-lg text-center shadow-sm">
              <span className="block text-sm text-gray-600">Puntos utilizados*</span>
              <span className="block text-2xl font-bold text-yellow-700">{puntosUtilizados}</span>
              <span className="block text-sm text-gray-600">puntos</span>
            </div>
            <div className="flex-1 bg-yellow-600 p-4 rounded-lg text-center shadow-sm text-white">
              <span className="block text-sm">Nuevo saldo</span>
              <span className="block text-2xl font-bold">{saldoConGasto}</span>
              <span className="block text-sm">puntos</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{notaGasto}</p>
        </div>
      ) : (
        // --- CASO 2: NO USA PUNTOS (ACUMULA) (Home Page 8) ---
        <div className="mt-6">
          <div className="flex gap-4">
            <div className="flex-1 bg-gray-100 p-4 rounded-lg text-center shadow-sm">
              <span className="block text-sm text-gray-600">Puntos acumulados*</span>
              <span className="block text-2xl font-bold text-yellow-700">{puntosAcumulados}</span>
              <span className="block text-sm text-gray-600">puntos</span>
            </div>
            <div className="flex-1 bg-yellow-600 p-4 rounded-lg text-center shadow-sm text-white">
              <span className="block text-sm">Nuevo saldo</span>
              <span className="block text-2xl font-bold">{saldoConGanancia}</span>
              <span className="block text-sm">puntos</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{notaGanancia}</p>
        </div>
      )}
    </div>
  );
};

export default ResumenCompra;