import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import ArtistaService from "@/services/ArtistaService";
import CategoriaService, { type Categoria } from "@/services/CategoriaService";
import NotificationService from "@/services/NotificationService";
import ModalCrearCategoria from "./ModalCrearCategoria";

interface ModalCrearArtistaProps {
  open: boolean;
  onClose: () => void;
  onCreated: (artistaId: number) => void; // devuelve id para autoseleccionar
}

const defaultState = {
  nombre: "",
  prioridad: "0",
  categoriaId: "",
};

const ModalCrearArtista: React.FC<ModalCrearArtistaProps> = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState(defaultState);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openCrearCategoria, setOpenCrearCategoria] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(defaultState);
      setTouched(false);
      CategoriaService.getCategorias().then(setCategorias).catch(() => setCategorias([]));
    }
  }, [open]);

  if (!open) return null;

  const onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const nombreError = touched && !form.nombre.trim();
  const prioridadError = touched && (form.prioridad === "" || isNaN(Number(form.prioridad)) || Number(form.prioridad) < 0);
  const categoriaError = touched && !form.categoriaId;

  const handleCrear = async () => {
    setTouched(true);
    if (nombreError || prioridadError || categoriaError) {
      NotificationService.warning("Completa todos los campos obligatorios");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        prioridad: Number(form.prioridad),
        categoriaId: Number(form.categoriaId),
      };
      const creado = await ArtistaService.createArtista(payload);
      if (creado && creado.id) {
        NotificationService.success("Artista creado correctamente");
        onClose();
        onCreated(Number(creado.id));
      } else {
        NotificationService.error("No se pudo crear el artista");
      }
    } catch (error: unknown) {
      const mensaje = (typeof error === 'object' && error !== null && 'response' in error)
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error creando artista'
        : 'Error creando artista';
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center" onClick={onClose}>
        <div className="mx-auto my-10 bg-white rounded-lg shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Crear artista</h3>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pb-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${nombreError ? "border-red-500" : "border-gray-300"}`}
              />
              {nombreError && <p className="mt-1 text-xs text-red-600">Obligatorio.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="prioridad"
                value={form.prioridad}
                onChange={onChange}
                min={0}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${prioridadError ? "border-red-500" : "border-gray-300"}`}
              />
              {prioridadError && <p className="mt-1 text-xs text-red-600">Entero ≥ 0.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <select
                  name="categoriaId"
                  value={form.categoriaId}
                  onChange={onChange}
                  className={`flex-1 border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${categoriaError ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Selecciona categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setOpenCrearCategoria(true)} className="text-xs px-2 py-2 rounded bg-amber-500 text-white hover:bg-amber-600" aria-label="Crear categoría">+ Nueva</button>
              </div>
              {categoriaError && <p className="mt-1 text-xs text-red-600">Obligatoria.</p>}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
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

      <ModalCrearCategoria
        open={openCrearCategoria}
        onClose={() => setOpenCrearCategoria(false)}
        onCreated={async (categoriaId) => {
          const lista = await CategoriaService.getCategorias();
          setCategorias(lista);
          setForm((prev) => ({ ...prev, categoriaId: String(categoriaId) }));
        }}
      />
    </>
  );
};

export default ModalCrearArtista;
