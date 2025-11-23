// src/components/client/Body/CompraEntradas/DatosCompra/ResumenCompra.tsx

import React from "react";
import type { SummaryItem } from "../Tickets/SelectionSummaryTable";
// 🛑 NUEVO: Importar useAuth para obtener el saldo de puntos real
import { useAuth } from "../../../../../hooks/useAuth"; // Ajusta esta ruta

// 🛑 MODIFICADO: Props actualizadas
interface ResumenCompraProps {
  summaryItems: SummaryItem[];
  isUsingPoints: boolean; // True si es 'preferencial' (Gastar)
  purchaseType: 'normal' | 'preferencial';
  pointsImpact: number; // El total de puntos (gasto o ganancia)
  userPointsPre: number;
}

const ResumenCompra: React.FC<ResumenCompraProps> = ({
  summaryItems,
  isUsingPoints,
  //purchaseType, // Recibido
  pointsImpact,  // Recibido
  userPointsPre
}) => {
  const totalGeneral = summaryItems.reduce((acc, item) => acc + item.subtotal, 0);

  // 🛑 Obtenemos el saldo de puntos real del usuario
  const { user } = useAuth();
  // Asumimos que ya añadiste 'puntos: number' a tu tipo 'User'
  const userPoints = user?.puntos ?? userPointsPre;

  // --- Datos dinámicos para el Flujo de Puntos ---
  // Calculamos el nuevo saldo
  const nuevoSaldo = isUsingPoints ? (userPoints - pointsImpact) : (userPoints + pointsImpact);
  // Definimos las notas dinámicas
  const notaGasto = `*Se gastan ${pointsImpact} puntos (30% del subtotal).`;
  const notaGanancia = `*Se acumulan ${pointsImpact} puntos (10% del subtotal).`;

  return (
    <div className="sticky top-10">
      {/* Resumen de Compra */}
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

      {/* Bloque de Puntos Condicional (alineación basada en “puntos”) */}
      {isUsingPoints ? (
        // 🟡 GASTAR PUNTOS (PREVENTA)
        <div className="mt-6">
          <div className="flex gap-4 items-end">
            {/* Tarjeta 1 */}
            <div className="flex-1 bg-gray-100 rounded-lg shadow-sm text-center p-6 flex flex-col items-center justify-end min-h-[160px]">
              <div className="flex flex-col justify-end flex-grow">
                <p className="text-sm text-gray-600">Puntos utilizados*</p>
                <p className="text-3xl font-bold text-yellow-700 mt-1">{pointsImpact}</p>
              </div>
              <p className="text-sm text-gray-600 mt-2 leading-none">puntos</p>
            </div>

            {/* Tarjeta 2 */}
            <div className="flex-1 bg-yellow-600 rounded-lg shadow-sm text-center text-white p-6 flex flex-col items-center justify-end min-h-[160px]">
              <div className="flex flex-col justify-end flex-grow">
                <p className="text-sm">Nuevo saldo</p>
                <p className="text-3xl font-bold mt-1">{nuevoSaldo}</p>
              </div>
              <p className="text-sm mt-2 leading-none">puntos</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">{notaGasto}</p>
        </div>
      ) : (
        // 🟢 ACUMULAR PUNTOS (NORMAL)
        <div className="mt-6">
          <div className="flex gap-4 items-end">
            {/* Tarjeta 1 */}
            <div className="flex-1 bg-gray-100 rounded-lg shadow-sm text-center p-6 flex flex-col items-center justify-end h-[135px]">
              <div className="flex flex-col justify-end flex-grow">
                <p className="text-sm text-gray-600">Puntos acumulados*</p>
                <p className="text-3xl font-bold text-yellow-700 mt-1">{pointsImpact}</p>
              </div>
              <p className="text-sm text-gray-600 mt-2 leading-none">puntos</p>
            </div>

            {/* Tarjeta 2 */}
            <div className="flex-1 bg-yellow-600 rounded-lg shadow-sm text-center text-white p-6 flex flex-col items-center justify-end h-[135px]">
              <div className="flex flex-col justify-end flex-grow">
                <p className="text-sm">Nuevo saldo</p>
                <p className="text-3xl font-bold mt-1">{nuevoSaldo}</p>
              </div>
              <p className="text-sm mt-2 leading-none">puntos</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">{notaGanancia}</p>
        </div>
      )}
    </div>
  );
};

export default ResumenCompra;