import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import UbicacionService, { type LocationOption } from "@/services/UbicacionService";
import { normalizeFecha } from "@/utils/normalizeFecha";
import { actualizarEvento, mapEstadoUIToBackend } from "@/services/EventoService";

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
  const [departamento, setDepartamento] = useState("");
  const [provincia, setProvincia] = useState("");
  const [distrito, setDistrito] = useState("");

  const [touchedSubmit, setTouchedSubmit] = useState(false);

  // Select options
  const [departamentos, setDepartamentos] = useState<LocationOption[]>([]);
  const [provincias, setProvincias] = useState<LocationOption[]>([]);
  const [distritos, setDistritos] = useState<LocationOption[]>([]);

  // Prefill cuando cambia event
  useEffect(() => {
    if (!event) return;
    setTouchedSubmit(false);

    setNombre(event.nombre || event.title || "");
    setDescripcion(event.descripcion || event.description || "");

    // Fecha
    if (event.fechaEvento || event.fecha || event.date) {
      const raw = event.fechaEvento || event.fecha || event.date;
      try {
        const isoDate = new Date(raw).toISOString().split("T")[0];
        setFecha(normalizeFecha(isoDate));
        setHora(new Date(raw).toISOString().slice(11, 16));
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

    setDepartamento(event.departamento || "");
    setProvincia(event.provincia || "");
    setDistrito(event.distrito || "");

    // Imagen: no podemos reconstruir File desde base64 fácilmente; se deja null
    setImagen(null);
  }, [event]);

  // Carga inicial de departamentos y dependientes, y react a cambios
  useEffect(() => {
    if (!open) return;
    UbicacionService.getDepartamentos().then(setDepartamentos).catch(() => setDepartamentos([]));
  }, [open]);

  useEffect(() => {
    // Cargar provincias cuando cambia departamento
    if (departamento) {
      UbicacionService.getProvincias(departamento).then(setProvincias).catch(() => setProvincias([]));
    } else {
      setProvincias([]);
      setProvincia("");
      setDistritos([]);
      setDistrito("");
    }
  }, [departamento]);

  useEffect(() => {
    // Cargar distritos cuando cambia provincia
    if (departamento && provincia) {
      UbicacionService.getDistritos(departamento, provincia).then(setDistritos).catch(() => setDistritos([]));
    } else {
      setDistritos([]);
      setDistrito("");
    }
  }, [departamento, provincia]);

  if (!open || !event) return null;

  const handleGuardar = async () => {
    setTouchedSubmit(true);
    if (!event) return;
    if (!nombre.trim() || !descripcion.trim() || !fecha || !hora || !departamento || !provincia || !distrito || !lugar.trim() || !estado) {
      alert("Por favor completa todos los campos obligatorios antes de guardar.");
      return;
    }

    // Convertir imagen si hay nueva
    let imagenPortadaBase64: string | null | undefined = undefined;
    if (imagen) {
      try {
        const base64Result = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => {
            const result = fr.result as string;
            const commaIdx = result.indexOf(",");
            resolve(commaIdx >= 0 ? result.substring(commaIdx + 1) : result);
          };
          fr.onerror = reject;
          fr.readAsDataURL(imagen);
        });
        imagenPortadaBase64 = base64Result;
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
      artistaId: event.artistaId || event.artist?.id || 0,
      departamento: departamento.trim(),
      provincia: provincia.trim(),
      distrito: distrito.trim(),
      lugar: lugar.trim(),
      estado: estadoBackend,
      imagenPortada: imagenPortadaBase64, // undefined => no cambiar, null => eliminar, string => nueva
    };

    try {
      await actualizarEvento(event.id, payload);
      onClose();
      onUpdated();
    } catch (error) {
      console.error("Error actualizando evento:", error);
      alert("No se pudo actualizar el evento.");
    }
  };

  const nombreError = touchedSubmit && !nombre.trim();
  const descripcionError = touchedSubmit && !descripcion.trim();
  const fechaError = touchedSubmit && !fecha;
  const horaError = touchedSubmit && !hora;
  const departamentoError = touchedSubmit && !departamento;
  const provinciaError = touchedSubmit && !provincia;
  const distritoError = touchedSubmit && !distrito;
  const lugarError = touchedSubmit && !lugar.trim();
  const estadoError = touchedSubmit && !estado;

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
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del evento<span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
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
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  fechaError ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fechaError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  horaError ? "border-red-500" : "border-gray-300"
                }`}
              />
              {horaError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
            </div>
          </div>
          {/* Ubicación */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento <span className="text-red-500">*</span>
              </label>
              <select
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  departamentoError ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Selecciona departamento</option>
                {departamentos.map((d) => (
                  <option key={d.id} value={d.nombre}>
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
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
                disabled={!departamento}
                className={`w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100 ${
                  provinciaError ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Selecciona provincia</option>
                {provincias.map((p) => (
                  <option key={p.id} value={p.nombre}>
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
                value={distrito}
                onChange={(e) => setDistrito(e.target.value)}
                disabled={!departamento || !provincia}
                className={`w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100 ${
                  distritoError ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Selecciona distrito</option>
                {distritos.map((di) => (
                  <option key={di.id} value={di.nombre}>
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
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                lugarError ? "border-red-500" : "border-gray-300"
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
              className={`w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                estadoError ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="Borrador">Borrador</option>
              <option value="Publicado">Publicado</option>
              <option value="En revisión">En revisión</option>
            </select>
            {estadoError && <p className="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>}
          </div>
          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de portada del evento</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImagen(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            <p className="mt-1 text-xs text-gray-500">Tamaño recomendado: 1200 × 600 px. Se mostrará en la vista pública del evento.</p>
            {imagen && <p className="mt-1 text-xs text-gray-600">Archivo seleccionado: {imagen.name}</p>}
          </div>
        </div>
        {/* Acciones */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md">
            Cancelar
          </button>
          <button type="button" onClick={handleGuardar} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarEvento;

