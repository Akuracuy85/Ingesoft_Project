import React, { useEffect, useRef, useState, useMemo } from "react";
import ReactDOM from "react-dom"; // NUEVO: para portal
import { Calendar, MoreVertical, Plus, Edit3, Trash2, X, ImageOff, Upload } from "lucide-react";
import ModalCrearEvento, { type NuevoEventoForm, type EstadoEventoUI } from "./ModalCrearEvento";
import ModalEditarEvento from "./ModalEditarEvento";
import ConfirmarEliminacionModal from "./ConfirmarEliminacionModal";
import ConfiguracionEvento from "./ConfiguracionEvento";
import { listarDetalladosOrganizador, createEvent, mapEstadoUIToBackend, obtenerEventosDetallados, actualizarEvento, type CrearEventoPayload, type EstadoEventoBackend } from "@/services/EventoService";
import NotificationService from "@/services/NotificationService";
import UbicacionService from "@/services/UbicacionService";

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
      return "bg-black text-white rounded-full px-3 py-1 text-sm dark:bg-amber-500 dark:text-black";
    case "Borrador":
      return "bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm dark:bg-card dark:text-card-foreground dark:border-border";
    case "En revisión":
      return "border border-gray-300 text-gray-700 rounded-full px-3 py-1 text-sm dark:border-border dark:text-card-foreground dark:bg-transparent";
    case "Cancelado":
      return "bg-red-100 text-red-700 rounded-full px-3 py-1 text-sm dark:bg-red-900 dark:text-red-200";
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

  // NUEVO: paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10); // opciones: 5 o 10
  const totalPages = useMemo(() => {
    if (eventos.length === 0) return 0;
    return Math.ceil(eventos.length / pageSize);
  }, [eventos.length, pageSize]);
  const paginatedEventos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return eventos.slice(start, start + pageSize);
  }, [eventos, currentPage, pageSize]);

  // Modal crear
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Modal editar
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEventFull, setSelectedEventFull] = useState<EditEventData | null>(null);

  // Menú de acciones por fila
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // NUEVO: coords y ref del botón que abrió el menú
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number; direction: "down" | "up" } | null>(null);
  const lastButtonRef = useRef<HTMLButtonElement | null>(null);

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
        console.log("Evento: ", ev);
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

  // Eliminado: efecto anterior de cierre usando contención dentro de la celda
  // Reemplazado por nuevo efecto para manejar click fuera, scroll y resize
  useEffect(() => {
    if (menuAbierto !== null) {
      const handleDocMouseDown = (e: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(e.target as Node) &&
          lastButtonRef.current &&
          !lastButtonRef.current.contains(e.target as Node)
        ) {
          setMenuAbierto(null);
          setMenuCoords(null);
        }
      };
      const handleScrollOrResize = () => {
        setMenuAbierto(null);
        setMenuCoords(null);
      };
      document.addEventListener("mousedown", handleDocMouseDown);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      return () => {
        document.removeEventListener("mousedown", handleDocMouseDown);
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }
  }, [menuAbierto]);

  // Efecto: recalcular posición real tras conocer altura/ancho del menú portal
  useEffect(() => {
    if (menuAbierto !== null && menuRef.current && lastButtonRef.current) {
      const buttonRect = lastButtonRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const direction = buttonRect.bottom + menuRect.height <= window.innerHeight ? "down" : "up";
      const top = direction === "down" ? buttonRect.bottom : buttonRect.top - menuRect.height;
      let left = buttonRect.left;
      if (left + menuRect.width > window.innerWidth - 8) {
        left = window.innerWidth - menuRect.width - 8;
      }
      setMenuCoords({ top, left, direction });
    }
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

  // Aseguramos que la página actual no exceda el total tras cambios (e.g. eliminación)
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

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

      // CORRECCIÓN: Validar usando los IDs del formulario
      if (!data.departamentoId || !data.provinciaId || !data.distritoId || !data.lugar.trim()) {
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

      // --- TRADUCIR IDs A NOMBRES ---
      const allDepartamentos = await UbicacionService.getDepartamentos();
      const departamentoNombre = allDepartamentos.find(d => d.id === data.departamentoId)?.nombre || "";

      const allProvincias = await UbicacionService.getProvincias(data.departamentoId);
      const provinciaNombre = allProvincias.find(p => p.id === data.provinciaId)?.nombre || "";

      const allDistritos = await UbicacionService.getDistritos(data.departamentoId, data.provinciaId);
      const distritoNombre = allDistritos.find(d => d.id === data.distritoId)?.nombre || "";

      const payload: CrearEventoPayload = {
        nombre: data.nombre.trim(),
        descripcion: data.descripcion.trim(),
        fecha: data.fecha,
        hora: data.hora,
        artistaId: data.artistaId,
        departamento: departamentoNombre,
        provincia: provinciaNombre,
        distrito: distritoNombre,
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

      // CORRECCIÓN: En lugar de construir manualmente, refrescar desde el backend
      // para obtener la URL de S3 correcta
      await loadEventos(); 
      
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
        estado: "CANCELADO" as EstadoEventoBackend, // solo cambiamos estado
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
          <div className="mt-1 text-gray-700 dark:text-gray-300">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Publicar y gestionar eventos</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Crea, edita y elimina eventos del sistema.</p>
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
          <div className="mt-6 text-sm text-gray-600 dark:text-gray-300">Cargando eventos...</div>
        )}
        {error && !isLoading && (
          <div className="mt-6 text-sm text-red-600">{error}</div>
        )}

        {/* Detalles del evento seleccionado */}
        {eventoSeleccionado && (
          <div className="bg-gray-50 dark:bg-card border border-gray-200 dark:border-border rounded-lg p-6 mt-4 relative">
            {/* Botón cerrar */}
              <button
              type="button"
              onClick={() => {
                setEventoSeleccionado(null);
                setSelectedIndex(null);
              }}
              className="absolute top-4 right-4 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100"
              aria-label="Cerrar detalles"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Título + estado */}
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{eventoSeleccionado.nombre}</h2>
              <span className={getBadgeClass(eventoSeleccionado.estado)}>{eventoSeleccionado.estado}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{eventoSeleccionado.fecha}</p>

            {/* Encabezado de portada con botón alineado a la derecha */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Imagen de portada del evento</h3>
              <div>
                <button
                  type="button"
                  onClick={handleUploadCoverClick}
                  className="border border-gray-300 dark:border-border text-sm rounded-md px-3 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-card"
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
                  <div className="h-48 rounded-md border border-gray-200 dark:border-border overflow-hidden bg-white dark:bg-card">
                  <img
                    src={portadaSrc}
                    alt={`Portada de ${eventoSeleccionado.nombre}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-border bg-white dark:bg-card rounded-md h-48 flex flex-col items-center justify-center text-gray-400 dark:text-card-foreground">
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
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Lista de eventos</h3>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">Selecciona un evento para editar sus detalles</span>
              {/* Selector de tamaño de página */}
                <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-xs text-gray-600 dark:text-gray-300">Por página:</label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1); // reinicia a primera página
                  }}
                  className="border border-gray-300 dark:border-border rounded px-2 py-1 text-xs bg-white dark:bg-card dark:text-card-foreground focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200 bg-gray-50 dark:bg-card dark:text-card-foreground dark:border-border">
                  <th className="px-4 py-3 font-medium">Nombre del evento</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedEventos.map((ev, localIndex) => {
                  const globalIndex = (currentPage - 1) * pageSize + localIndex;
                  return (
                    <tr
                      key={ev.id}
                      className={`${selectedIndex === globalIndex ? "bg-amber-50" : ""} hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer`}
                      onClick={() => {
                        setEventoSeleccionado(ev);
                        setSelectedIndex(globalIndex);
                      }}
                    >
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{ev.nombre}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{ev.fecha}</td>
                      <td className="px-4 py-3">
                        <span className={getBadgeClass(ev.estado)}>{ev.estado}</span>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-block text-left">
                          <button
                            type="button"
                            ref={menuAbierto === globalIndex ? lastButtonRef : null}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (menuAbierto === globalIndex) {
                                setMenuAbierto(null);
                                setMenuCoords(null);
                              } else {
                                setMenuAbierto(globalIndex);
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                const tentativeHeight = 96; // altura estimada del menú (ajustada posteriormente)
                                const direction = rect.bottom + tentativeHeight <= window.innerHeight ? "down" : "up";
                                const top = direction === "down" ? rect.bottom : rect.top - tentativeHeight;
                                const menuWidth = 160; // ancho esperado del menú
                                let left = rect.left;
                                if (left + menuWidth > window.innerWidth - 8) {
                                  left = window.innerWidth - menuWidth - 8;
                                }
                                setMenuCoords({ top, left, direction });
                                lastButtonRef.current = e.currentTarget as HTMLButtonElement;
                              }
                            }}
                            className="inline-flex items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
                            aria-haspopup="menu"
                            aria-expanded={menuAbierto === globalIndex}
                            aria-label={`Acciones para ${ev.nombre}`}
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!isLoading && !error && eventos.length === 0 && (
              <div className="text-sm text-gray-500 p-4">No hay eventos en este momento.</div>
            )}
          </div>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Página {currentPage} de {totalPages} — Mostrando {paginatedEventos.length} de {eventos.length} eventos
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded border text-xs flex items-center gap-1 ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-card dark:text-card-foreground" : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300 dark:bg-card dark:hover:bg-card dark:text-card-foreground dark:border-border"}`}
                >
                  ← Anterior
                </button>
                {/* Números de página */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 text-xs rounded border flex items-center justify-center ${page === currentPage ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-card dark:text-card-foreground dark:border-border dark:hover:bg-card"}`}
                      aria-label={`Ir a página ${page}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded border text-xs flex items-center gap-1 ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-card dark:text-card-foreground" : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300 dark:bg-card dark:hover:bg-card dark:text-card-foreground dark:border-border"}`}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
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

      {/* Portal del menú de acciones */}
      {menuAbierto !== null && menuCoords && ReactDOM.createPortal(
        <div
          ref={menuRef}
          role="menu"
          className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-md shadow-lg w-40 z-[9999] py-1"
          style={{ position: "fixed", top: menuCoords.top, left: menuCoords.left, zIndex: 9999 }}
        >
          <button
            type="button"
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2 text-gray-700 dark:text-gray-200"
            onClick={() => {
              const idx = menuAbierto;
              setMenuAbierto(null);
              setMenuCoords(null);
              if (idx !== null) {
                handleOpenEdit(idx);
              }
            }}
            role="menuitem"
          >
            <Edit3 className="h-4 w-4" />
            Editar
          </button>
          <button
            type="button"
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2 text-red-600"
            onClick={() => {
              const idx = menuAbierto;
              if (idx !== null) {
                const ev = eventos[idx];
                setEventoAEliminar({ index: idx, nombre: ev.nombre });
              }
              setMenuAbierto(null);
              setMenuCoords(null);
            }}
            role="menuitem"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>,
        document.body
      )}
    </>
  );
};

export default CardEventos;
