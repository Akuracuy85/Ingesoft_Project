import React, { useEffect, useRef, useState } from "react";
import { Calendar, MoreVertical, Plus, Edit3, Trash2 } from "lucide-react";
import ModalCrearEvento, { type NuevoEventoForm, type EstadoEventoUI } from "./ModalCrearEvento";
import ModalEditarEvento from "./ModalEditarEvento";

// Tipos para la tabla
interface EventoItem {
  nombre: string;
  fecha: string;
  estado: EstadoEventoUI;
  descripcion?: string;
  hora?: string;
  lugar?: string;
  imagenNombre?: string | null;
}

// Datos iniciales
const initialEventos: EventoItem[] = [
  { nombre: "Concierto de Rock 2025", fecha: "2025-03-15", estado: "Publicado", descripcion: "-", hora: "20:00", lugar: "Estadio" },
  { nombre: "Festival de Jazz", fecha: "2025-04-20", estado: "Borrador", descripcion: "-", hora: "18:00", lugar: "Parque" },
  { nombre: "Noche de Salsa", fecha: "2025-05-10", estado: "En revisión", descripcion: "-", hora: "21:00", lugar: "Club" },
];

// Función para clases de badge según estado
function getBadgeClass(estado: EstadoEventoUI): string {
  switch (estado) {
    case "Publicado":
      return "bg-black text-white rounded-full px-3 py-1 text-sm";
    case "Borrador":
      return "bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm";
    case "En revisión":
      return "border border-gray-300 text-gray-700 rounded-full px-3 py-1 text-sm";
    default:
      return "rounded-full px-3 py-1 text-sm";
  }
}

const CardEventos: React.FC = () => {
  // Estado de la lista
  const [eventos, setEventos] = useState<EventoItem[]>([...initialEventos]);

  // Modal crear
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Modal editar
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Menú de acciones por fila
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(null);
      }
    };
    if (menuAbierto !== null) {
      document.addEventListener("click", handleDocClick);
    }
    return () => document.removeEventListener("click", handleDocClick);
  }, [menuAbierto]);

  // Abrir crear
  const handleOpenCreate = () => setIsCreateOpen(true);
  const handleCloseCreate = () => setIsCreateOpen(false);

  // Guardar desde crear
  const handleSaveCreate = (data: NuevoEventoForm) => {
    const nuevo: EventoItem = {
      nombre: data.nombre,
      fecha: data.fecha || "",
      estado: data.estado,
      descripcion: data.descripcion,
      hora: data.hora,
      lugar: data.lugar,
      imagenNombre: data.imagen?.name || null,
    };
    setEventos((prev) => [nuevo, ...prev]);
    alert(`Evento guardado:\n${JSON.stringify(nuevo, null, 2)}`);
    handleCloseCreate();
  };

  // Abrir editar para una fila concreta
  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setIsEditOpen(true);
  };
  const handleCloseEdit = () => {
    setEditingIndex(null);
    setIsEditOpen(false);
  };

  // Guardar cambios de edición
  const handleSaveEdit = (data: NuevoEventoForm) => {
    if (editingIndex === null) return;
    setEventos((prev) => {
      const next = [...prev];
      next[editingIndex] = {
        ...next[editingIndex],
        nombre: data.nombre,
        descripcion: data.descripcion,
        fecha: data.fecha,
        hora: data.hora,
        lugar: data.lugar,
        estado: data.estado,
        imagenNombre: data.imagen?.name || next[editingIndex].imagenNombre || null,
      };
      return next;
    });
    handleCloseEdit();
  };

  // Datos iniciales para el modal de edición en el shape de NuevoEventoForm
  const editInitial: NuevoEventoForm | null = editingIndex !== null
    ? {
        nombre: eventos[editingIndex].nombre || "",
        descripcion: eventos[editingIndex].descripcion || "",
        fecha: eventos[editingIndex].fecha || "",
        hora: eventos[editingIndex].hora || "",
        lugar: eventos[editingIndex].lugar || "",
        estado: eventos[editingIndex].estado,
        imagen: null,
      }
    : null;

  return (
    <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        {/* Izquierda: ícono + títulos */}
        <div className="flex items-start gap-3">
          <div className="mt-1 text-gray-700">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Publicar y gestionar eventos
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Crea, edita y elimina eventos del sistema.
            </p>
          </div>
        </div>

        {/* Derecha: botón "Nuevo evento" */}
        <button
          type="button"
          onClick={handleOpenCreate}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo evento</span>
        </button>
      </div>

      {/* Contenido: lista + tabla */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Lista de eventos</h3>
          <span className="text-xs text-gray-500">Selecciona un evento para editar sus detalles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium">Nombre del evento</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {eventos.map((ev, index) => (
                <tr key={`${ev.nombre}-${ev.fecha}-${index}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{ev.nombre}</td>
                  <td className="px-4 py-3 text-gray-700">{ev.fecha}</td>
                  <td className="px-4 py-3">
                    <span className={getBadgeClass(ev.estado)}>{ev.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div
                      className="relative inline-block text-left"
                      ref={menuAbierto === index ? menuRef : null}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuAbierto(menuAbierto === index ? null : index);
                        }}
                        className="inline-flex items-center justify-center p-2 rounded hover:bg-gray-100 text-gray-600"
                        aria-haspopup="menu"
                        aria-expanded={menuAbierto === index}
                        aria-label={`Acciones para ${ev.nombre}`}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>

                      {menuAbierto === index && (
                        <div
                          className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                          onClick={(e) => e.stopPropagation()}
                          role="menu"
                        >
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                            onClick={() => {
                              setMenuAbierto(null);
                              handleOpenEdit(index);
                            }}
                            role="menuitem"
                          >
                            <Edit3 className="h-4 w-4" />
                            Editar
                          </button>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                            onClick={() => {
                              console.log("Eliminar evento", ev.nombre);
                              setMenuAbierto(null);
                            }}
                            role="menuitem"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      <ModalCrearEvento open={isCreateOpen} onClose={handleCloseCreate} onSave={handleSaveCreate} />

      <ModalEditarEvento
        open={isEditOpen}
        onClose={handleCloseEdit}
        initialData={editInitial}
        onSave={handleSaveEdit}
      />
    </section>
  );
};

export default CardEventos;
