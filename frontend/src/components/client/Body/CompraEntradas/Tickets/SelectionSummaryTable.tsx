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
}

const SelectionSummaryTable: React.FC<SelectionSummaryTableProps> = ({
  items,
  onDeleteItem,
  onAcceptSelection, 
}) => {
  const totalGeneral = items.reduce((acc, item) => acc + item.subtotal, 0);

  return (

    <div className="w-full max-w-md bg-white rounded-lg border border-gray-300 overflow-hidden shadow">
      
      <div className="grid grid-cols-9 bg-gray-100 font-semibold text-gray-700">
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
          <div className="py-3 px-4 text-center col-span-3">{item.zona}</div>
          <div className="py-3 px-4 text-center col-span-1">{item.cantidad}</div>
          <div className="py-3 px-4 text-center col-span-3">
            S/ {item.subtotal.toFixed(2)}
          </div>
          <div className="py-3 px-4 text-center col-span-2">
            <button
              onClick={() => onDeleteItem(item.zona)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
              aria-label={`Eliminar ${item.zona}`}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}

      <div className="grid grid-cols-9 border-t-2 border-gray-300 bg-gray-50 font-bold text-gray-800">
        <div className="py-3 px-4 text-right col-span-4">TOTAL</div>
        <div className="py-3 px-4 text-center col-span-3">
          S/ {totalGeneral.toFixed(2)}
        </div>
        <div className="col-span-2" />
      </div>

      <div className="p-4 flex justify-end bg-gray-50 border-t border-gray-200">
        <button
          onClick={onAcceptSelection}
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 font-semibold"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default SelectionSummaryTable;