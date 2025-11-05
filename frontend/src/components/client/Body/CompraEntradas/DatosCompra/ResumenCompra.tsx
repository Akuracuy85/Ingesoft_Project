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
  purchaseType, // Recibido
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
  const notaGasto = `*Se gastan ${pointsImpact} puntos (10% del subtotal).`;
  const notaGanancia = `*Se acumulan ${pointsImpact} puntos (5% del subtotal).`;

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

  	 	 {/* Bloque de Puntos Condicional (Ahora dinámico) */}
  	 	 {isUsingPoints ? (
  	 	 	 // GASTAR PUNTOS (PREVENTA)
  	 	 	 <div className="mt-6">
  	 	 	 	 <div className="flex gap-4">
  	 	 	 	 	 <div className="flex-1 bg-gray-100 p-4 rounded-lg text-center shadow-sm">
  	 	 	 	 	 	 <span className="block text-sm text-gray-600">Puntos utilizados*</span>
  	 	 	 	 	 	 <span className="block text-2xl font-bold text-yellow-700">{pointsImpact}</span>
  	 	 	 	 	 	 <span className="block text-sm text-gray-600">puntos</span>
  	 	 	 	 	 </div>
  	 	 	 	 	 <div className="flex-1 bg-yellow-600 p-4 rounded-lg text-center shadow-sm text-white">
  	 	 	 	 	 	 <span className="block text-sm">Nuevo saldo</span>
  	 	 	 	 	 	 <span className="block text-2xl font-bold">{nuevoSaldo}</span>
  	 	 	 	 	 	 <span className="block text-sm">puntos</span>
  	 	 	 	 	 </div>
  	 	 	 	 </div>
  	 	 	 	 <p className="text-xs text-gray-500 mt-2">{notaGasto}</p>
  	 	 	 </div>
  	 	 ) : (
  	 	 	 // ACUMULAR PUNTOS (NORMAL)
  	 	 	 <div className="mt-6">
  	 	 	 	 <div className="flex gap-4">
  	 	 	 	 	 <div className="flex-1 bg-gray-100 p-4 rounded-lg text-center shadow-sm">
  	 	 	 	 	 	 <span className="block text-sm text-gray-600">Puntos acumulados*</span>
  	 	 	 	 	 	 <span className="block text-2xl font-bold text-yellow-700">{pointsImpact}</span>
  	 	 	 	 	 	 <span className="block text-sm text-gray-600">puntos</span>
  	 	 	 	 	 </div>
  	 	 	 	 	 <div className="flex-1 bg-yellow-600 p-4 rounded-lg text-center shadow-sm text-white">
  	 	 	 	 	 	 <span className="block text-sm">Nuevo saldo</span>
  	 	 	 	 	 	 <span className="block text-2xl font-bold">{nuevoSaldo}</span>
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