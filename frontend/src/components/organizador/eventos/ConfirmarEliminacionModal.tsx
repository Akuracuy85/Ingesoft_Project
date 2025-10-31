import React from "react";

interface ConfirmarEliminacionModalProps {
  open: boolean;
  nombre: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmarEliminacionModal: React.FC<ConfirmarEliminacionModalProps> = ({ open, nombre, onCancel, onConfirm }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-200 ease-out"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-eliminar"
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="titulo-eliminar" className="text-lg font-semibold mb-2">
          ¿Seguro que deseas eliminar este evento?
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Esta acción no se puede deshacer. El evento <span className="font-medium">{nombre}</span> será eliminado permanentemente del sistema.
        </p>
        <div className="flex items-center justify-center space-x-3">
          <button
            type="button"
            className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            onClick={onConfirm}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarEliminacionModal;

