import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import UbicacionService, { type LocationOption } from "@/services/UbicacionService";
import { normalizeFecha } from "@/utils/normalizeFecha";
import { actualizarEvento, mapEstadoUIToBackend } from "@/services/EventoService";
import ArtistaService, { type Artista } from "@/services/ArtistaService";
import NotificationService from "@/services/NotificationService";
import ModalCrearArtista from "./ModalCrearArtista";

interface EventoEditable {
  id: number;
  nombre?: string; title?: string;
  descripcion?: string; description?: string;
  fechaEvento?: string; fecha?: string; date?: string;
  hora?: string; time?: string;
  lugar?: string; place?: string;
  estado?: string;
  departamento?: string; provincia?: string; distrito?: string;
  artistaId?: number; artist?: { id: number };
}
interface ModalEditarEventoProps {
  open: boolean;
  onClose: () => void;
  event: EventoEditable | null; // Evento detallado completo
  onUpdated: () => void; // nuevo callback para refrescar lista
}

const ModalEditarEvento: React.FC<ModalEditarEventoProps> = ({ open, onClose, event, onUpdated }) => {
  // Estados individuales
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [lugar, setLugar] = useState("");
  const [estado, setEstado] = useState("Borrador");
  const [imagen, setImagen] = useState<File | null>(null);
  const [departamentoId, setDepartamentoId] = useState<number | null>(null);
  const [provinciaId, setProvinciaId] = useState<number | null>(null);
  const [distritoId, setDistritoId] = useState<number | null>(null);
  const [artistaId, setArtistaId] = useState<number | null>(null);
  // Portada actual (base64) para previsualización dentro del modal
  const [portadaBase64, setPortadaBase64] = useState<string | null>(null);
  const [subiendoPortada, setSubiendoPortada] = useState<boolean>(false);

  // Nuevo: estados faltantes
  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const [departamentos, setDepartamentos] = useState<LocationOption[]>([]);
  const [provincias, setProvincias] = useState<LocationOption[]>([]);
  const [distritos, setDistritos] = useState<LocationOption[]>([]);
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [openCrearArtista, setOpenCrearArtista] = useState(false);

  // Helper reutilizable: convertir File a base64 (sin prefijo data:...)
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

  // Helper para construir src válido para img
  const buildImageSrc = (value?: string | null): string | null => {
    if (!value) return null;
    const v = String(value).trim();
    if (!v) return null;
    if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("data:")) return v;
    return `data:image/*;base64,${v}`;
  };

  // Prefill cuando cambia event
  useEffect(() => {
    if (!event) return;
    setTouchedSubmit(false);
    setPortadaBase64(null);

    setNombre(event.nombre || event.title || "");
    setDescripcion(event.descripcion || event.description || "");

    // Fecha
    if (event.fechaEvento || event.fecha || event.date) {
      const raw = event.fechaEvento ?? event.fecha ?? event.date;
      console.log("Raw: ", raw);
      try {
        const d = new Date(raw as string);
        const isoDate = d.toISOString().split("T")[0];
        setFecha(normalizeFecha(isoDate));
        setHora(d.toISOString().slice(11, 16));
      } catch {
        setFecha("");
        setHora("");
      }
    } else {
      setFecha("");
      setHora("");
    }

    setLugar(event.lugar || event.place || "");

    // Estado backend -> UI
    const estadoBackend = event.estado || "BORRADOR";
    switch (estadoBackend) {
      case "PUBLICADO":
        setEstado("Publicado");
        break;
      case "PENDIENTE_APROBACION":
        setEstado("En revisión");
        break;
      case "BORRADOR":
      default:
        setEstado("Borrador");
    }

    // CORRECCIÓN: Lógica para pre-seleccionar la ubicación
    const prefillUbicacion = async () => {
      if (!open) return;
      
      const todosDepartamentos = await UbicacionService.getDepartamentos();
      setDepartamentos(todosDepartamentos);

      const depActual = todosDepartamentos.find(d => d.nombre === event.departamento);
      if (depActual) {
        setDepartamentoId(depActual.id as number);
        
        const todasProvincias = await UbicacionService.getProvincias(depActual.id as number);
        setProvincias(todasProvincias);

        const provActual = todasProvincias.find(p => p.nombre === event.provincia);
        if (provActual) {
          setProvinciaId(provActual.id as number);

          const todosDistritos = await UbicacionService.getDistritos(depActual.id as number, provActual.id as number);
          setDistritos(todosDistritos);

          const distActual = todosDistritos.find(d => d.nombre === event.distrito);
          if (distActual) {
            setDistritoId(distActual.id as number);
          } else {
            setDistritoId(null);
          }
        } else {
          setProvinciaId(null);
          setDistritoId(null);
        }
      } else {
        setDepartamentoId(null);
        setProvinciaId(null);
        setDistritoId(null);
      }
    };

    if (open) {
      prefillUbicacion();
    }

    // Artista actual
    setArtistaId(event.artistaId || event.artist?.id || null);

    // Imagen: no podemos reconstruir File desde base64 fácilmente; se deja null
    setImagen(null);
  }, [event, open]);

  // Carga inicial de artistas (departamentos ya se cargan en el efecto de arriba)
  useEffect(() => {
    if (!open) return;
    // Cargar artistas
    ArtistaService.getArtistas().then(setArtistas).catch(() => setArtistas([]));
  }, [open]);

  useEffect(() => {
    // Cargar provincias cuando cambia departamento
    if (departamentoId) {
      UbicacionService.getProvincias(departamentoId).then(setProvincias).catch(() => setProvincias([]));
    } else {
      setProvincias([]);
      setProvinciaId(null);
      setDistritos([]);
      setDistritoId(null);
    }
  }, [departamentoId]);

  useEffect(() => {
    // Cargar distritos cuando cambia provincia
    if (departamentoId && provinciaId) {
      UbicacionService.getDistritos(departamentoId, provinciaId).then(setDistritos).catch(() => setDistritos([]));
    } else {
      setDistritos([]);
      setDistritoId(null);
    }
  }, [departamentoId, provinciaId]);

  if (!open || !event) return null;

  const handleGuardar = async () => {
    setTouchedSubmit(true);
    if (!event) return;
    if (!nombre.trim() || !descripcion.trim() || !fecha || !hora || !departamentoId || !provinciaId || !distritoId || !lugar.trim() || !estado || !artistaId) {
      NotificationService.warning("Por favor, completa todos los campos obligatorios antes de guardar");
      return;
    }

    // AÑADIR: Traducir IDs a nombres
    const allDepartamentos = await UbicacionService.getDepartamentos();
    const departamentoNombre = allDepartamentos.find(d => d.id === departamentoId)?.nombre || "";

    const allProvincias = await UbicacionService.getProvincias(departamentoId);
    const provinciaNombre = allProvincias.find(p => p.id === provinciaId)?.nombre || "";

    const allDistritos = await UbicacionService.getDistritos(departamentoId, provinciaId);
    const distritoNombre = allDistritos.find(d => d.id === distritoId)?.nombre || "";

    // Convertir imagen si hay nueva
    let imagenPortadaBase64: string | null | undefined = undefined;
    if (imagen) {
      try {
        imagenPortadaBase64 = await fileToBase64(imagen);
      } catch {
        console.warn("No se pudo convertir la imagen, se enviará sin cambios.");
      }
    }

    const estadoBackend = mapEstadoUIToBackend(estado);

    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      fecha,
      hora,
      artistaId: artistaId,
      // CORRECCIÓN: Usar nombres en lugar de IDs
      departamento: departamentoNombre,
      provincia: provinciaNombre,
      distrito: distritoNombre,
      lugar: lugar.trim(),
      estado: estadoBackend,
      imagenPortada: imagenPortadaBase64,
    };

    try {
      await actualizarEvento(event.id, payload);
      onClose();
      onUpdated();
    } catch (error: any) {
      console.error("Error actualizando evento:", error);
      if (error?.response?.data?.message?.includes('Transición de estado no permitida') || error?.response?.data?.message?.includes('Solo se pueden aprobar') || error?.response?.data?.message?.includes('Solo puedes crear eventos')) {
        NotificationService.warning(error.response.data.message);
      } else if (error?.response?.data?.message?.includes('Un evento PUBLICADO solo puede pasar a CANCELADO') || error?.response?.data?.message?.includes('No puedes cambiar el estado de un evento CANCELADO')) {
        NotificationService.warning(error.response.data.message);
      } else {
        NotificationService.error("No se pudo actualizar el evento");
      }
    }
  };

  // Manejar selección de portada: convertir y subir inmediatamente usando el mismo flujo que creación
  const handleSeleccionarPortada: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    try {
      const file = e.target.files?.[0] || null;
      e.target.value = "";
      setImagen(file);
      if (!file) return;

      if (!event) return;
      if (!nombre.trim() || !descripcion.trim() || !fecha || !hora || !departamentoId || !provinciaId || !distritoId || !lugar.trim() || !artistaId) {
        NotificationService.warning("Completa los datos obligatorios (incluido artista) antes de actualizar la portada");
        return;
      }

      setSubiendoPortada(true);

      // AÑADIR: Traducir IDs a nombres
      const allDepartamentos = await UbicacionService.getDepartamentos();
      const departamentoNombre = allDepartamentos.find(d => d.id === departamentoId)?.nombre || "";

      const allProvincias = await UbicacionService.getProvincias(departamentoId);
      const provinciaNombre = allProvincias.find(p => p.id === provinciaId)?.nombre || "";

      const allDistritos = await UbicacionService.getDistritos(departamentoId, provinciaId);
      const distritoNombre = allDistritos.find(d => d.id === distritoId)?.nombre || "";

      const imagenPortada = await fileToBase64(file);

      const estadoBackend = mapEstadoUIToBackend(estado);
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        fecha,
        hora,
        artistaId: artistaId,
        // CORRECCIÓN: Usar nombres
        departamento: departamentoNombre,
        provincia: provinciaNombre,
        distrito: distritoNombre,
        lugar: lugar.trim(),
        estado: estadoBackend,
        imagenPortada,
      };

      await actualizarEvento(event.id, payload);

      setPortadaBase64(imagenPortada);
      onUpdated();
    } catch (err) {
      console.error("Error al actualizar portada:", err);
      NotificationService.error("No se pudo actualizar la portada. Intenta nuevamente");
    } finally {
      setSubiendoPortada(false);
    }
  };

  const handleArtistaCreado = async (nuevoId: number) => {
    const lista = await ArtistaService.getArtistas();
    setArtistas(lista);
    setArtistaId(nuevoId);
  };

  const nombreError = touchedSubmit && !nombre.trim();
  const descripcionError = touchedSubmit && !descripcion.trim();
  const fechaError = touchedSubmit && !fecha;
  const horaError = touchedSubmit && !hora;
  const departamentoError = touchedSubmit && !departamentoId;
  const provinciaError = touchedSubmit && !provinciaId;
  const distritoError = touchedSubmit && !distritoId;
  const lugarError = touchedSubmit && !lugar.trim();
  const estadoError = touchedSubmit && !estado;
  const artistaError = touchedSubmit && !artistaId;

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="mx-auto bg-white text-gray-900 dark:bg-card dark:text-card-foreground rounded-lg shadow-lg p-6 w-full max-w-lg overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
          <div className="mb-2">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Editar evento</h3>
            <button type="button" onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Completa la información del evento. Puedes guardarlo como borrador o publicarlo directamente.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 px-1">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Nombre del evento<span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-card dark:text-card-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                nombreError ? "border-red-500" : "border-gray-300 dark:border-border"
              }`}
            />
            {nombreError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
          </div>
          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Descripción<span className="text-red-500"> *</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className={`w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-card dark:text-card-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                descripcionError ? "border-red-500" : "border-gray-300 dark:border-border"
              }`}
            />
            {descripcionError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
          </div>

          {/* Artista */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 flex items-center justify-between">
              <span>Artista <span className="text-red-500">*</span></span>
              <button type="button" onClick={() => setOpenCrearArtista(true)} className="text-xs px-2 py-1 rounded bg-amber-500 text-white dark:text-gray-900 hover:bg-amber-600" aria-label="Crear artista">+ Nuevo</button>
            </label>
            <select
              name="artistaId"
              value={artistaId ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                const parsed = val ? Number(val) : NaN;
                setArtistaId(!isNaN(parsed) && parsed > 0 ? parsed : null);
              }}
              className={`w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-card dark:text-card-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                artistaError ? "border-red-500" : "border-gray-300 dark:border-border"
              }`}
            >
              <option value="">Selecciona artista</option>
              {artistas.map((a) => (
                <option key={a.id} value={String(a.id)}>{a.nombre}</option>
              ))}
            </select>
            {artistaError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-card dark:text-card-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  fechaError ? "border-red-500" : "border-gray-300 dark:border-border"
                }`}
              />
              {fechaError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-card dark:text-card-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  horaError ? "border-red-500" : "border-gray-300 dark:border-border"
                }`}
              />
              {horaError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
            </div>
          </div>
          {/* Ubicación */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Departamento <span className="text-red-500">*</span>
              </label>
              <select
                value={departamentoId ?? ""}
                onChange={(e) => setDepartamentoId(e.target.value ? Number(e.target.value) : null)}
                className={`w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-card dark:text-card-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  departamentoError ? "border-red-500" : "border-gray-300 dark:border-border"
                }`}
              >
                <option value="">Selecciona departamento</option>
                {departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
              {departamentoError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provincia <span className="text-red-500">*</span>
              </label>
              <select
                value={provinciaId ?? ""}
                onChange={(e) => setProvinciaId(e.target.value ? Number(e.target.value) : null)}
                disabled={!departamentoId}
                className={`w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-card dark:text-card-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100 dark:disabled:bg-slate-700 ${
                  provinciaError ? "border-red-500" : "border-gray-300 dark:border-border"
                }`}
              >
                <option value="">Selecciona provincia</option>
                {provincias.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              {provinciaError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distrito <span className="text-red-500">*</span>
              </label>
              <select
                value={distritoId ?? ""}
                onChange={(e) => setDistritoId(e.target.value ? Number(e.target.value) : null)}
                disabled={!departamentoId || !provinciaId}
                className={`w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-card dark:text-card-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100 dark:disabled:bg-slate-700 ${
                  distritoError ? "border-red-500" : "border-gray-300 dark:border-border"
                }`}
              >
                <option value="">Selecciona distrito</option>
                {distritos.map((di) => (
                  <option key={di.id} value={di.id}>
                    {di.nombre}
                  </option>
                ))}
              </select>
              {distritoError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
            </div>
          </div>
          {/* Lugar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lugar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              placeholder="Ej: Teatro Nacional"
              className={`w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-card dark:text-card-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                lugarError ? "border-red-500" : "border-gray-300 dark:border-border"
              }`}
            />
            {lugarError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
          </div>
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-card dark:text-card-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                estadoError ? "border-red-500" : "border-gray-300 dark:border-border"
              }`}
              disabled={event?.estado === 'CANCELADO'}
            >
              {(() => {
                const backendEstado = event?.estado || 'BORRADOR';
                if (backendEstado === 'BORRADOR' || backendEstado === 'PENDIENTE_APROBACION') {
                  return [
                    <option key="bor" value="Borrador">Borrador</option>,
                    <option key="rev" value="En revisión">En revisión</option>
                  ];
                }
                if (backendEstado === 'PUBLICADO') {
                  return [
                    <option key="pub" value="Publicado">Publicado</option>,
                    <option key="can" value="Cancelado">Cancelado</option>
                  ];
                }
                if (backendEstado === 'CANCELADO') {
                  return [<option key="can" value="Cancelado">Cancelado</option>];
                }
                return [<option key="bor" value="Borrador">Borrador</option>];
              })()}
            </select>
            {estadoError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
            {event?.estado === 'PUBLICADO' && estado === 'Cancelado' && (
              <p className="mt-1 text-xs text-amber-600">Al guardar se cancelará el evento.</p>
            )}
          </div>
          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de portada del evento</label>
            {buildImageSrc(portadaBase64) && (
              <div className="mb-2 h-32 rounded border overflow-hidden">
                <img src={buildImageSrc(portadaBase64)!} alt="Portada actual" className="w-full h-full object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleSeleccionarPortada}
              disabled={subiendoPortada}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 dark:file:bg-slate-700 file:text-gray-700 dark:file:text-gray-100 hover:file:bg-gray-200 dark:hover:file:bg-slate-600 disabled:opacity-60"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Tamaño recomendado: 1200 × 600 px. Se mostrará en la vista pública del evento.</p>
            {imagen && <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">Archivo seleccionado: {imagen.name}</p>}
          </div>
        </div>
        {/* Acciones */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="bg-gray-100 dark:bg-card hover:bg-gray-200 dark:hover:bg-card text-gray-800 dark:text-card-foreground px-4 py-2 rounded-md">
            Cancelar
          </button>
          <button type="button" onClick={handleGuardar} className="bg-amber-500 hover:bg-amber-600 text-white dark:text-gray-900 px-4 py-2 rounded-md">
            Guardar cambios
          </button>
        </div>
      </div>
      <ModalCrearArtista open={openCrearArtista} onClose={() => setOpenCrearArtista(false)} onCreated={handleArtistaCreado} />
    </div>
  );
};

export default ModalEditarEvento;

