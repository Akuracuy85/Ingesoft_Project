import React, { useEffect, useRef, useState } from "react";
import { Calendar, MoreVertical, Plus, Edit3, Trash2, X, ImageOff, Upload } from "lucide-react";
import ModalCrearEvento, { type NuevoEventoForm, type EstadoEventoUI } from "./ModalCrearEvento";
import ModalEditarEvento from "./ModalEditarEvento";
import ConfirmarEliminacionModal from "./ConfirmarEliminacionModal";
import ConfiguracionEvento from "./ConfiguracionEvento";
import { listarDetalladosOrganizador, createEvent, mapEstadoUIToBackend, obtenerEventosDetallados, actualizarEvento } from "@/services/EventoService";
// Eliminado: no forzar ubicación por defecto; se respetan valores opcionales del formulario

// Moved to utils for reuse
import { formatFecha } from "@/utils/formatFecha";
import NotificationService from "@/services/NotificationService";

// Tipos locales auxiliares
type EventoDetalladoOrganizador = {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  fechaEvento: string;
  departamento: string;
  provincia: string;
  distrito: string;
  lugar: string;
  imagenBannerBase64: string | null;
};

interface EditEventData {
  id: number;
  nombre?: string;
  descripcion?: string;
  fechaEvento?: string;
  fecha?: string;
  hora?: string;
  lugar?: string;
  estado?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  imagenBanner?: string | null;
  artistaId?: number;
  artist?: { id: number };
}

// Tipos para la tabla
interface EventoItem {
  id: number;
  nombre: string;
  fecha: string;
  estado: EstadoEventoUI;
  descripcion?: string;
  hora?: string;
  lugar?: string;
  imagenNombre?: string | null;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  imagenPortadaBase64?: string | null;
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
    case "Cancelado":
      return "bg-red-100 text-red-700 rounded-full px-3 py-1 text-sm";
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
    case "CANCELADO":
      return "Cancelado";
    default:
      return "Borrador";
  }
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
  const [selectedEventFull, setSelectedEventFull] = useState<EditEventData | null>(null);

  // Menú de acciones por fila
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  // Nuevo: input de archivo para portada en edición
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Modal eliminar
  const [eventoAEliminar, setEventoAEliminar] = useState<{ index: number; nombre: string } | null>(null);

  // Selección de evento y resalte
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Cargar desde backend (detallados) reutilizable
  const loadEventos = async (): Promise<EventoItem[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const lista = await listarDetalladosOrganizador();
      const items: EventoItem[] = (lista as EventoDetalladoOrganizador[]).map((ev) => {
        const fechaISO = ev.fechaEvento || "";
        let fecha = "";
        let hora = "";
        const d = new Date(fechaISO);
        if (!isNaN(d.getTime())) {
          fecha = d.toISOString().slice(0, 10);
          hora = d.toISOString().slice(11, 16);
        }
        return {
          id: ev.id,
          nombre: ev.nombre,
          fecha,
          estado: mapEstadoToUI(ev.estado),
          descripcion: ev.descripcion || "",
          hora,
          lugar: ev.lugar || "",
          departamento: ev.departamento || "",
          provincia: ev.provincia || "",
          distrito: ev.distrito || "",
          imagenPortadaBase64: ev.imagenBannerBase64 || null,
          imagenNombre: ev.imagenBannerBase64 ? "portada" : null,
        };
      });
      setEventos(items);
      return items;
    } catch (err) {
      console.error("Error cargando eventos detallados:", err);
      setError("Error al cargar los eventos.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Montaje inicial
  useEffect(() => {
    loadEventos();
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

  // Utilidad: convertir File a base64 (sin prefijo data:...)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const commaIdx = result.indexOf(",");
        resolve(commaIdx >= 0 ? result.substring(commaIdx + 1) : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Guardar desde crear: ahora conectado al backend
  const handleSaveCreate = async (data: NuevoEventoForm) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validaciones mínimas
      if (!data.nombre.trim() || !data.descripcion.trim() || !data.fecha || !data.hora) {
        NotificationService.warning("Por favor completa nombre, descripción, fecha y hora");
        return;
      }
      if (!data.artistaId || data.artistaId <= 0) {
        NotificationService.warning("Debes seleccionar un artista para el evento");
        return;
      }

      // Validaciones de ubicación y lugar (requeridos)
      if (!data.departamento || !data.provincia || !data.distrito || !data.lugar.trim()) {
        NotificationService.warning("Por favor completa la ubicación (departamento, provincia, distrito) y el lugar");
        return;
      }

      // Estado para backend
      const estadoBackend = mapEstadoUIToBackend(data.estado);

      // Imagen (opcional)
      let imagenPortada: string | undefined;
      if (data.imagen) {
        try {
          imagenPortada = await fileToBase64(data.imagen);
        } catch (e) {
          console.warn("No se pudo convertir la imagen a base64, se enviará sin imagen.", e);
        }
      }

      const payload = {
        nombre: data.nombre.trim(),
        descripcion: data.descripcion.trim(),
        fecha: data.fecha, // YYYY-MM-DD
        hora: data.hora,   // HH:mm
        artistaId: data.artistaId,
        departamento: data.departamento.trim(),
        provincia: data.provincia.trim(),
        distrito: data.distrito.trim(),
        lugar: data.lugar.trim(),
        estado: estadoBackend,
        imagenPortada,
      };

      const resp = await createEvent(payload);
      if (!resp || !resp.success) {
        console.error("Respuesta inválida del servidor al crear evento", resp);
        NotificationService.error("No se pudo crear el evento");
        return;
      }

      // Actualizar UI localmente sin recargar
      const nuevo: EventoItem = {
        id: resp.eventoId,
        nombre: data.nombre,
        fecha: formatFecha(data.fecha),
        estado: data.estado,
        descripcion: data.descripcion,
        hora: data.hora,
        lugar: data.lugar,
        imagenNombre: data.imagen?.name || null,
      };
      setEventos((prev) => [nuevo, ...prev]);
      NotificationService.success("Evento creado con éxito");
      handleCloseCreate();
    } catch (e) {
      console.error("Error al crear el evento:", e);
      NotificationService.error("No se pudo crear el evento");
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir editar para una fila concreta (fetch por id)
  const handleOpenEdit = async (index: number) => {
    try {
      const ev = eventos[index];
      if (!ev) return;
      setIsLoading(true);
      const detalle = await obtenerEventosDetallados(ev.id);
      const mapped: EditEventData = {
        id: detalle.id,
        nombre: detalle.title,
        descripcion: detalle.description,
        fechaEvento: `${detalle.date}T${(detalle.time || "00:00")}:00`,
        fecha: detalle.date,
        hora: detalle.time,
        lugar: detalle.place,
        estado: ev.estado === "Publicado" ? "PUBLICADO" : ev.estado === "En revisión" ? "PENDIENTE_APROBACION" : ev.estado === "Cancelado" ? "CANCELADO" : "BORRADOR",
        departamento: detalle.departamento,
        provincia: detalle.provincia,
        distrito: detalle.distrito,
        imagenBanner: detalle.image || null,
        artistaId: detalle.artist?.id,
        artist: detalle.artist ? { id: detalle.artist.id } : undefined,
      };
      setSelectedEventFull(mapped);
      setIsEditOpen(true);
    } catch (e) {
      console.error("Error al obtener evento detallado:", e);
      NotificationService.error("No se pudo cargar la información completa del evento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedEventFull(null);
  };

  // Confirmar eliminación (cancelación lógica vía PUT)
  const handleConfirmDelete = async () => {
    try {
      if (!eventoAEliminar) return;
      const evListado = eventos[eventoAEliminar.index];
      if (!evListado) return;

      // Obtener detalle actual para construir payload completo
      const detalle = await obtenerEventosDetallados(evListado.id);

      const artistaId = detalle.artist?.id || 0;
      if (!artistaId) {
        NotificationService.error("No se pudo cancelar: el evento no tiene artista asignado");
        return;
      }

      const fecha = detalle.date;
      const hora = detalle.time || "00:00";
      const departamento = detalle.departamento || "";
      const provincia = detalle.provincia || "";
      const distrito = detalle.distrito || "";
      const lugar = (detalle.place || "").trim();

      if (!fecha || !hora || !departamento || !provincia || !distrito || !lugar) {
        NotificationService.error("No se pudo cancelar: faltan datos obligatorios del evento");
        return;
      }

      const payload = {
        nombre: detalle.title || evListado.nombre,
        descripcion: detalle.description || "",
        fecha,
        hora,
        artistaId,
        departamento,
        provincia,
        distrito,
        lugar,
        estado: "CANCELADO", // solo cambiamos estado
      };

      const resp = await actualizarEvento(evListado.id, payload);
      if (resp && (resp as { success?: boolean }).success) {
        NotificationService.success("Evento cancelado correctamente");
        setEventoAEliminar(null); // cerrar modal
        await loadEventos(); // refrescar listado
        return;
      }
      NotificationService.error("No se pudo cancelar el evento");
    } catch (error) {
      console.error("Error cancelando evento:", error);
      NotificationService.error("No se pudo cancelar el evento");
    }
  };

  // Helper: construye un src válido desde base64 crudo o URL
  const buildImageSrc = (value?: string | null): string | null => {
    if (!value) return null;
    const v = String(value).trim();
    if (!v) return null;
    if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("data:")) {
      return v;
    }
    // Asumimos base64 sin prefijo
    return `data:image/*;base64,${v}`;
  };

  // Maneja click del botón Subir portada en edición
  const handleUploadCoverClick = () => {
    fileInputRef.current?.click();
  };

  // Maneja el cambio de archivo, sube la portada y refresca el evento
  const handleCoverFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    try {
      const file = e.target.files?.[0];
      // permitir seleccionar el mismo archivo nuevamente
      e.target.value = "";
      if (!file) return;

      if (!eventoSeleccionado) {
        NotificationService.warning("Selecciona un evento antes de subir la portada");
        return;
      }

      setIsLoading(true);
      setError(null);

      // Convertir a base64 como en la creación
      const imagenPortada = await fileToBase64(file);

      // Obtener detalle actual para construir payload completo requerido por backend
      const detalle = await obtenerEventosDetallados(eventoSeleccionado.id);

      const artistaId = detalle.artist?.id || 0;
      if (!artistaId) {
        NotificationService.error("No se puede actualizar la portada: el evento no tiene artista asignado");
        return;
      }

      const fecha = detalle.date;
      const hora = detalle.time || "00:00";
      const departamento = detalle.departamento || "";
      const provincia = detalle.provincia || "";
      const distrito = detalle.distrito || "";
      const lugar = (detalle.place || "").trim();

      if (!fecha || !hora || !departamento || !provincia || !distrito || !lugar) {
        NotificationService.error("No se puede actualizar la portada: faltan datos obligatorios del evento");
        return;
      }

      // Mantener estado actual mapeado a backend
      const estado = mapEstadoUIToBackend(eventoSeleccionado.estado);

      const payload = {
        nombre: detalle.title || eventoSeleccionado.nombre,
        descripcion: detalle.description || "",
        fecha,
        hora,
        artistaId,
        departamento,
        provincia,
        distrito,
        lugar,
        estado,
        imagenPortada,
      };

      const resp = await actualizarEvento(eventoSeleccionado.id, payload);
      if (!resp || !(resp as { success?: boolean }).success) {
        NotificationService.error("No se pudo actualizar la portada del evento");
        return;
      }

      // Refrescar lista y re-seleccionar evento
      const items = await loadEventos();
      const idx = items.findIndex((it) => it.id === eventoSeleccionado.id);
      if (idx >= 0) {
        setSelectedIndex(idx);
        setEventoSeleccionado(items[idx]);
      }
      NotificationService.success("Portada actualizada correctamente");
    } catch (err) {
      console.error("Error al subir la portada:", err);
      NotificationService.error("No se pudo actualizar la portada del evento");
    } finally {
      setIsLoading(false);
    }
  };

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
              <div>
                <button
                  type="button"
                  onClick={handleUploadCoverClick}
                  className="border border-gray-300 text-sm rounded-md px-3 py-2 flex items-center gap-2 hover:bg-gray-100"
                >
                  <Upload className="h-4 w-4" /> Subir portada
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverFileChange}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-3">Tamaño recomendado: 1200 × 600 px. Se mostrará en la vista pública del evento.</p>

            {/* Área de imagen */}
            {(() => {
              const portadaSrc = buildImageSrc(eventoSeleccionado.imagenPortadaBase64);
              return portadaSrc ? (
                <div className="h-48 rounded-md border border-gray-200 overflow-hidden bg-white">
                  <img
                    src={portadaSrc}
                    alt={`Portada de ${eventoSeleccionado.nombre}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 bg-white rounded-md h-48 flex flex-col items-center justify-center text-gray-400">
                  <ImageOff className="h-8 w-8 mb-2" />
                  <p>No hay imagen de portada</p>
                </div>
              );
            })()}
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
          event={selectedEventFull}
          onUpdated={loadEventos}
        />

        {/* Modal de confirmación de eliminación */}
        <ConfirmarEliminacionModal
          open={!!eventoAEliminar}
          nombre={eventoAEliminar?.nombre || ""}
          onCancel={() => setEventoAEliminar(null)}
          onConfirm={handleConfirmDelete}
        />
      </section>

      {/* Configuración del evento */}
      {eventoSeleccionado && <ConfiguracionEvento evento={{
        eventoId: eventoSeleccionado.id,
        nombre: eventoSeleccionado.nombre,
        descripcion: eventoSeleccionado.descripcion || "",
        fecha: eventoSeleccionado.fecha,
        hora: eventoSeleccionado.hora || "",
        lugar: eventoSeleccionado.lugar || "",
        departamento: eventoSeleccionado.departamento || "",
        provincia: eventoSeleccionado.provincia || "",
        distrito: eventoSeleccionado.distrito || "",
        estado: eventoSeleccionado.estado
      }} />}
    </>
  );
};

export default CardEventos;
