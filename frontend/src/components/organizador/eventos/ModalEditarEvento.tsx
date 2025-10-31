import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { NuevoEventoForm } from "./ModalCrearEvento";

interface ModalEditarEventoProps {
  open: boolean;
  onClose: () => void;
  initialData: NuevoEventoForm | null;
  onSave: (data: NuevoEventoForm) => void;
}

const ModalEditarEvento: React.FC<ModalEditarEventoProps> = ({ open, onClose, initialData, onSave }) => {
  const [form, setForm] = useState<NuevoEventoForm>(
    initialData || {
      nombre: "",
      descripcion: "",
      fecha: "",
      hora: "",
      lugar: "",
      estado: "Borrador",
      imagen: null,
    }
  );
  const [touchedSubmit, setTouchedSubmit] = useState(false);

  useEffect(() => {
    if (open && initialData) {
      setForm({ ...initialData });
      setTouchedSubmit(false);
    }
  }, [open, initialData]);

  if (!open || !initialData) return null;

  const onChangeText = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setForm((prev) => ({ ...prev, imagen: file }));
  };

  const handleGuardar = () => {
    setTouchedSubmit(true);
    // En edición: nombre, descripcion, fecha y hora obligatorios
    if (!form.nombre.trim() || !form.descripcion.trim() || !form.fecha || !form.hora) return;
    onSave(form);
  };

  const nombreError = touchedSubmit && !form.nombre.trim();
  const descripcionError = touchedSubmit && !form.descripcion.trim();
  const fechaError = touchedSubmit && !form.fecha;
  const horaError = touchedSubmit && !form.hora;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center" onClick={onClose}>
      <div className="mx-auto my-10 bg-white rounded-lg shadow-lg p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Editar evento</h3>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Completa la información del evento. Puedes guardarlo como borrador o publicarlo directamente.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Nombre del evento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del evento<span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={onChangeText}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                nombreError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {nombreError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción<span className="text-red-500"> *</span>
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={onChangeText}
              rows={4}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                descripcionError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {descripcionError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha<span className="text-red-500"> *</span></label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={onChangeText}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  fechaError ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fechaError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora<span className="text-red-500"> *</span></label>
              <input
                type="time"
                name="hora"
                value={form.hora}
                onChange={onChangeText}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  horaError ? "border-red-500" : "border-gray-300"
                }`}
              />
              {horaError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
            </div>
          </div>

          {/* Lugar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
            <input
              type="text"
              name="lugar"
              value={form.lugar}
              onChange={onChangeText}
              placeholder="Ej: Teatro Nacional"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              name="estado"
              value={form.estado}
              onChange={onChangeText}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Borrador">Borrador</option>
              <option value="Publicado">Publicado</option>
              <option value="En revisión">En revisión</option>
            </select>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de portada del evento</label>
            <input
              type="file"
              name="imagen"
              accept="image/*"
              onChange={onChangeFile}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            <p className="mt-1 text-xs text-gray-500">Tamaño recomendado: 1200 × 600 px. Se mostrará en la vista pública del evento.</p>
            {form.imagen && (
              <p className="mt-1 text-xs text-gray-600">Archivo seleccionado: {form.imagen.name}</p>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarEvento;

