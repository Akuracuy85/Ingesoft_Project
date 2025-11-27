import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import NotificationService from "@/services/NotificationService";
import CategoriaService from "@/services/CategoriaService";

interface ModalCrearCategoriaProps {
  open: boolean;
  onClose: () => void;
  onCreated: (categoriaId: number) => void;
}

const ModalCrearCategoria: React.FC<ModalCrearCategoriaProps> = ({ open, onClose, onCreated }) => {
  const [nombre, setNombre] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setNombre("");
      setTouched(false);
    }
  }, [open]);

  if (!open) return null;

  const nombreError = touched && !nombre.trim();

  const handleCrear = async () => {
    setTouched(true);
    if (nombreError) {
      NotificationService.warning("Completa el nombre de la categoría");
      return;
    }
    setLoading(true);
    try {
      const creada = await CategoriaService.createCategoria({ nombre: nombre.trim() });
      if (!creada) {
        NotificationService.error("No se pudo crear la categoría");
      } else {
        NotificationService.success("Categoría creada");
        onClose();
        onCreated(Number(creada.id));
      }
    } catch (error: unknown) {
      const mensaje = (typeof error === 'object' && error !== null && 'response' in error)
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error creando categoría'
        : 'Error creando categoría';
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center" onClick={onClose}>
      <div className="mx-auto my-10 bg-white dark:bg-card dark:text-card-foreground rounded-lg shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Crear categoría</h3>
          <button type="button" onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>
          <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nombre <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-card dark:text-card-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ${nombreError ? "border-red-500" : "border-gray-300 dark:border-border"}`}
            />
            {nombreError && <p className="mt-1 text-xs text-red-600">Obligatorio.</p>}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-card-foreground hover:bg-gray-50 dark:hover:bg-card"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCrear}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCrearCategoria;
