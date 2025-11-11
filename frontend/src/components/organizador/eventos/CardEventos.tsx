import React, { useEffect, useRef, useState } from "react";
import { Calendar, MoreVertical, Plus, Edit3, Trash2, X, ImageOff, Upload } from "lucide-react";
import ModalCrearEvento, { type NuevoEventoForm, type EstadoEventoUI } from "./ModalCrearEvento";
import ModalEditarEvento from "./ModalEditarEvento";
import ConfirmarEliminacionModal from "./ConfirmarEliminacionModal";
import ConfiguracionEvento from "./ConfiguracionEvento";
import { listarBasicosOrganizador, type EventoBasicoOrganizadorDTO } from "@/services/EventoService";


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

// Mapeo de estado backend -> UI
function mapEstadoToUI(estadoApi: string): EstadoEventoUI {
  switch (estadoApi) {
    case "PUBLICADO":
      return "Publicado";
    case "BORRADOR":
      return "Borrador";
    case "PENDIENTE_APROBACION":
      return "En revisión";
    default:
      return "Borrador";
  }
}

// Formatear fecha YYYY-MM-DD a dd/MM/yyyy sin usar Date para evitar desfase de zona horaria.
function formatFechaYMDToDMY(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  if (!y || !m || !d) return ymd;
  return `${d}/${m}/${y}`;
}

const CardEventos: React.FC = () => {
  // Estado de la lista
  const [eventos, setEventos] = useState<EventoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal crear
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Modal editar
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Menú de acciones por fila
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Modal eliminar
  const [eventoAEliminar, setEventoAEliminar] = useState<{ index: number; nombre: string } | null>(null);

  // Selección de evento y resalte
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Cargar desde backend al montar
  useEffect(() => {
    const controller = new AbortController();
    const fetchEventos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const resp = await listarBasicosOrganizador();
        if (resp && Array.isArray(resp.eventos) && resp.eventos.length > 0) {
          console.log("📦 [DEBUG] Eventos recibidos desde el backend:");
          resp.eventos.forEach((ev: EventoBasicoOrganizadorDTO, idx: number) => {
            const raw = typeof ev.fecha === "string" ? ev.fecha : ev.fecha?.toISOString?.() ?? "";
            console.log(`→ #${idx + 1} | Nombre: ${ev.nombre} | Fecha original: ${raw}`);
          });
        } else {
          console.log("⚠️ [DEBUG] No se recibieron eventos o el array está vacío:", resp?.eventos);
        }
        const items: EventoItem[] = resp.eventos.map((e: EventoBasicoOrganizadorDTO) => {
          const ymd = typeof e.fecha === "string" ? e.fecha : e.fecha.toISOString().slice(0, 10);
          const fechaFormateada = formatFechaYMDToDMY(ymd);
          console.log(`🧾 [DEBUG] Preparando item ${e.nombre} → Fecha mostrada: ${fechaFormateada}`);
          return {
            nombre: e.nombre,
            fecha: fechaFormateada,
            estado: mapEstadoToUI(e.estado),
          };
        });
        setEventos(items);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        console.error("Error cargando eventos:", err);
        setError("Error al cargar los eventos.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    fetchEventos();
    return () => controller.abort();
  }, []);

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

  // Mantener selección válida si cambia la lista
  useEffect(() => {
    if (selectedIndex !== null && (selectedIndex < 0 || selectedIndex >= eventos.length)) {
      setSelectedIndex(null);
      setEventoSeleccionado(null);
    } else if (selectedIndex !== null) {
      setEventoSeleccionado(eventos[selectedIndex]);
    }
  }, [eventos, selectedIndex]);

  // Abrir crear
  const handleOpenCreate = () => setIsCreateOpen(true);
  const handleCloseCreate = () => setIsCreateOpen(false);

  // Guardar desde crear (solo UI por ahora)
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

  // Guardar cambios de edición (solo UI por ahora)
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

  // Confirmar eliminación (solo UI)
  const confirmarEliminacion = () => {
    if (!eventoAEliminar) return;
    setEventos((prev) => prev.filter((_, i) => i !== eventoAEliminar.index));
    // Si el eliminado es el seleccionado, limpiar selección
    if (selectedIndex === eventoAEliminar.index) {
      setSelectedIndex(null);
      setEventoSeleccionado(null);
    } else if (selectedIndex !== null && eventoAEliminar.index < selectedIndex) {
      // Ajustar índice si se elimina un elemento anterior a la selección
      setSelectedIndex((prev) => (prev !== null ? prev - 1 : null));
    }
    setEventoAEliminar(null);
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

  // Render del encabezado o detalles
  const renderTopCard = () => {
    // Siempre renderiza el encabezado principal
    return (
      <div className="flex items-start justify-between gap-4">
        {/* Izquierda: ícono + títulos */}
        <div className="flex items-start gap-3">
          <div className="mt-1 text-gray-700">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Publicar y gestionar eventos</h2>
            <p className="text-sm text-gray-600 mt-1">Crea, edita y elimina eventos del sistema.</p>
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
    );
  };

  return (
    <>
      <section className="bg-card border border-border rounded-lg p-6 shadow-sm relative">
        {/* Encabezado fijo */}
        {renderTopCard()}

        {/* Loading y error */}
        {isLoading && (
          <div className="mt-6 text-sm text-gray-600">Cargando eventos...</div>
        )}
        {error && !isLoading && (
          <div className="mt-6 text-sm text-red-600">{error}</div>
        )}

        {/* Detalles del evento seleccionado */}
        {eventoSeleccionado && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-4 relative">
            {/* Botón cerrar */}
            <button
              type="button"
              onClick={() => {
                setEventoSeleccionado(null);
                setSelectedIndex(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Cerrar detalles"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Título + estado */}
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-semibold text-gray-900">{eventoSeleccionado.nombre}</h2>
              <span className={getBadgeClass(eventoSeleccionado.estado)}>{eventoSeleccionado.estado}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{eventoSeleccionado.fecha}</p>

            {/* Encabezado de portada con botón alineado a la derecha */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Imagen de portada del evento</h3>
              <button
                type="button"
                className="border border-gray-300 text-sm rounded-md px-3 py-2 flex items-center gap-2 hover:bg-gray-100"
              >
                <Upload className="h-4 w-4" /> Subir portada
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-3">Tamaño recomendado: 1200 × 600 px. Se mostrará en la vista pública del evento.</p>

            {/* Área de imagen */}
            {eventoSeleccionado.imagenNombre ? (
              <div className="h-48 rounded-md border border-gray-200 overflow-hidden bg-white flex items-center justify-center">
                <div className="text-sm text-gray-600">Portada: {eventoSeleccionado.imagenNombre}</div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 bg-white rounded-md h-48 flex flex-col items-center justify-center text-gray-400">
                <ImageOff className="h-8 w-8 mb-2" />
                <p>No hay imagen de portada</p>
              </div>
            )}
          </div>
        )}

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
                {eventos.map((ev, index) => {
                  console.log(`🧾 [DEBUG] Renderizando evento ${ev.nombre} → Fecha mostrada: ${ev.fecha}`);
                  return (
                  <tr
                    key={`${ev.nombre}-${ev.fecha}-${index}`}
                    className={`${selectedIndex === index ? "bg-amber-50" : ""} hover:bg-gray-50 cursor-pointer`}
                    onClick={() => {
                      setEventoSeleccionado(ev);
                      setSelectedIndex(index);
                    }}
                  >
                    <td className="px-4 py-3 text-gray-900">{ev.nombre}</td>
                    <td className="px-4 py-3 text-gray-700">{ev.fecha}</td>
                    <td className="px-4 py-3">
                      <span className={getBadgeClass(ev.estado)}>{ev.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
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
                                setEventoAEliminar({ index, nombre: ev.nombre });
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
                );})}
              </tbody>
            </table>
            {!isLoading && !error && eventos.length === 0 && (
              <div className="text-sm text-gray-500 p-4">No hay eventos en este momento.</div>
            )}
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

        {/* Modal de confirmación de eliminación */}
        <ConfirmarEliminacionModal
          open={!!eventoAEliminar}
          nombre={eventoAEliminar?.nombre || ""}
          onCancel={() => setEventoAEliminar(null)}
          onConfirm={confirmarEliminacion}
        />
      </section>

      {/* Configuración del evento */}
      {eventoSeleccionado && <ConfiguracionEvento />}
    </>
  );
};

export default CardEventos;
