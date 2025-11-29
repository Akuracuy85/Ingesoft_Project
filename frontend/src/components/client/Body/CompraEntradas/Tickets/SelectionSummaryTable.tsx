import React from "react";

export interface SummaryItem {
  zona: string;
  zonaId: number;
  cantidad: number;
  subtotal: number;
}

interface SelectionSummaryTableProps {
  items: SummaryItem[];
  onDeleteItem: (zoneName: string) => void;
  onAcceptSelection: () => void;
  isUsingPointsFlow: boolean;
  totalPointsImpact: number;
  userPoints: number;
  isSynced: boolean; // 🔹 Indica si la tabla está sincronizada
}

const SelectionSummaryTable: React.FC<SelectionSummaryTableProps> = ({
  items,
  onDeleteItem,
  onAcceptSelection,
  isUsingPointsFlow,
  totalPointsImpact,
  userPoints,
  isSynced,
}) => {
  const totalGeneral = items.reduce((acc, item) => acc + item.subtotal, 0);

  // 🔹 Condición de bloqueo: no sincronizado o puntos insuficientes
  const exceedsPoints = isUsingPointsFlow && totalPointsImpact > userPoints;
  const canAccept = isSynced && !exceedsPoints;

  return (
    <div className="w-full max-w-md bg-white rounded-lg border border-gray-300 overflow-hidden shadow dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200">
      <div className="grid grid-cols-9 bg-gray-100 font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
        <div className="py-2 px-4 text-center col-span-3">Zona</div>
        <div className="py-2 px-4 text-center col-span-1">Cant.</div>
        <div className="py-2 px-4 text-center col-span-3">Subtotal</div>
        <div className="py-2 px-4 text-center col-span-2">Acción</div>
      </div>

      {items.map((item) => (
        <div
          key={item.zona}
          className="grid grid-cols-9 border-t border-gray-200 items-center"
        >
            <div className="py-3 px-4 text-center col-span-3 dark:text-gray-200">{item.zona}</div>
            <div className="py-3 px-4 text-center col-span-1 dark:text-gray-200">{item.cantidad}</div>
            <div className="py-3 px-4 text-center col-span-3 dark:text-gray-200">
              S/ {item.subtotal.toFixed(2)}
            </div>
          <div className="py-3 px-4 text-center col-span-2">
            <button
              onClick={() => onDeleteItem(item.zona)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium cursor-pointer"
              aria-label={`Eliminar ${item.zona}`}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}

      <div className="grid grid-cols-9 border-t-2 border-gray-300 bg-gray-50 font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
        <div className="py-3 px-4 text-right col-span-4">TOTAL</div>
        <div className="py-3 px-4 text-center col-span-3">
          S/ {totalGeneral.toFixed(2)}
        </div>
        <div className="col-span-2" />
      </div>

      <div className="p-3 text-right text-sm border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        {isUsingPointsFlow ? (
          <span
            className={`font-medium ${
              exceedsPoints ? "text-red-700 dark:text-red-300" : "text-red-600 dark:text-red-300"
            }`}
          >
            Usarás {totalPointsImpact} puntos (Saldo: {userPoints})
            {exceedsPoints && (
              <span className="block text-xs text-red-700 dark:text-red-300 mt-1">
                ❌ No tienes suficientes puntos
              </span>
            )}
          </span>
        ) : (
          <span className="text-green-600 dark:text-green-400 font-medium">
            Ganarás {totalPointsImpact} puntos
          </span>
        )}
      </div>

      {/* 🔹 Bloquea el botón si no está sincronizado o no tiene puntos suficientes */}
      <div className="p-4 flex justify-end bg-gray-50 border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <button
          onClick={onAcceptSelection}
          disabled={!canAccept}
          className={`px-6 py-2 rounded-lg shadow font-semibold transition cursor-pointer ${
            canAccept
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-400 text-gray-200 cursor-not-allowed dark:bg-gray-600 dark:text-gray-300"
          }`}
        >
          {!isSynced
            ? "Debe actualizar primero"
            : exceedsPoints
            ? "Puntos insuficientes"
            : "Aceptar"}
        </button>
      </div>
    </div>
  );
};

export default SelectionSummaryTable;
