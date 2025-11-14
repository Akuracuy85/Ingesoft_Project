import React, { useState, useEffect } from "react";
import { MapPin, ImageOff, Upload, Plus, Trash2, Save } from "lucide-react";
import type { Zone } from "@/models/Zone";
import type { Tarifa } from "@/models/Tarifa";
import { actualizarEvento, obtenerEventosDetallados, mapEstadoUIToBackend } from "@/services/EventoService";

interface ZonasYTarifasCardProps { eventoId: number; eventoEstadoUI: string; }

const ZonasYTarifasCard: React.FC<ZonasYTarifasCardProps> = ({ eventoId, eventoEstadoUI }) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapa, setMapa] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!eventoId) return;
    let abort = false;
    const fetchZonas = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await EventoService.obtenerPorId(eventoId);
        const zonasRaw = (data as { zonas?: ZonaBackendRaw[] }).zonas || [];
        const mapped: Zone[] = zonasRaw.map((z) => ({
          id: z.id,
          nombre: z.nombre,
          capacidad: z.capacidad,
          cantidadComprada: z.cantidadComprada,
          tarifaNormal: (z.tarifaNormal as Tarifa) ?? { nombre: "tarifaNormal", precio: 0, fechaInicio: "", fechaFin: "", descuento: 0 },
          tarifaPreventa: z.tarifaPreventa ?? null,
        }));
        if (!abort) setZones(mapped);
      } catch (e) {
        console.error("Error cargando zonas del evento", e);
        if (!abort) setError("No se pudieron cargar las zonas del evento.");
      } finally {
        if (!abort) setIsLoading(false);
      }
    };
    fetchZonas();
    return () => { abort = true; };
  }, [eventoId]);

  // Handlers de UI (edición local)
  const handleAddZone = () => {
    const nuevaZona: Zone = {
      nombre: `Zona ${zones.length + 1}`,
      capacidad: 0,
      cantidadComprada: 0,
      tarifaNormal: { nombre: "tarifaNormal", fechaInicio: "", fechaFin: "", precio: 0, descuento: 0 },
      tarifaPreventa: { nombre: "tarifaPreventa", fechaInicio: "", fechaFin: "", precio: 0, descuento: 0 },
    };
    setZones((prev) => [...prev, nuevaZona]);
  };

  const handleChangeTarifa = (
    index: number,
    tipo: "normal" | "preventa",
    field: "precio" | "descuento",
    value: string
  ) => {
    setZones((prev) => {
      const next = [...prev];
      const tarifa = tipo === "normal" ? (next[index].tarifaNormal as Partial<Tarifa> | undefined) : (next[index].tarifaPreventa as Partial<Tarifa> | undefined);
      if (!tarifa) {
        const nueva: Partial<Tarifa> = { precio: 0, descuento: 0 } as Partial<Tarifa>;
        if (tipo === "normal") next[index] = { ...next[index], tarifaNormal: (nueva as Tarifa) };
        else next[index] = { ...next[index], tarifaPreventa: (nueva as Tarifa) };
      }
      const tarifaObj = tipo === "normal" ? (next[index].tarifaNormal as Partial<Tarifa>) : (next[index].tarifaPreventa as Partial<Tarifa>);
      tarifaObj[field] = value === "" ? 0 : Number(value);
      next[index] = { ...next[index] };
      return next;
    });
  };

  const handleChangeCampo = (index: number, field: keyof Zone, value: string | number) => {
    setZones((prev) => {
      const next = [...prev];
      // @ts-expect-error asignación dinámica deliberada
      next[index][field] = field === "capacidad" ? Number(value) : value;
      next[index] = { ...next[index] };
      return next;
    });
  };

  const handleEliminar = (index: number) => setZones((prev) => prev.filter((_, i) => i !== index));

  const handleUploadMapa = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setMapa(e.target.files[0]);
  };

  const handleGuardar = async () => {
    if (!eventoId) return;
    try {
      setIsSaving(true);
      // Obtener detalles completos (para artistaId y campos obligatorios)
      const detalle = await obtenerEventosDetallados(eventoId);

      // Construir zonas DTO (incluye existentes y nuevas)
      const zonasDto = zones.map((z) => ({
        id: z.id,
        nombre: z.nombre.trim(),
        capacidad: z.capacidad,
        cantidadComprada: z.cantidadComprada ?? 0,
        tarifaNormal: z.tarifaNormal ? {
          id: z.tarifaNormal.id,
            nombre: "tarifaNormal",
            precio: z.tarifaNormal.precio,
            fechaInicio: detalle.date, // se podría refinar con inputs
            fechaFin: detalle.date, // misma fecha por ahora
        } : null,
        tarifaPreventa: z.tarifaPreventa ? {
          id: z.tarifaPreventa.id,
          nombre: "tarifaPreventa",
          precio: z.tarifaPreventa.precio,
          fechaInicio: detalle.date,
          fechaFin: detalle.date,
        } : null,
      }));

      // Payload actualizar evento (requeridos según backend)
      const payload = {
        nombre: detalle.title,
        descripcion: detalle.description,
        fecha: detalle.date,
        hora: detalle.time || "00:00",
        artistaId: detalle.artist?.id || 0,
        departamento: detalle.departamento || "",
        provincia: detalle.provincia || "",
        distrito: detalle.distrito || "",
        lugar: detalle.place || "",
        estado: mapEstadoUIToBackend(eventoEstadoUI),
        zonas: zonasDto,
      };

      const resp = await actualizarEvento(eventoId, payload);
      if (!resp || !(resp as any).success) {
        alert("No se pudo crear la zona");
        return;
      }
      // Recargar zonas
      const postData = await obtenerEventosDetallados(eventoId);
      const nuevasZonasRaw = (postData as any).zonas || [];
      const recargadas: Zone[] = nuevasZonasRaw.map((z: any) => ({
        id: z.id,
        nombre: z.nombre,
        capacidad: z.capacidad,
        cantidadComprada: z.cantidadComprada,
        tarifaNormal: z.tarifaNormal as Tarifa,
        tarifaPreventa: (z.tarifaPreventa as Tarifa) || null,
      }));
      setZones(recargadas);
      alert("Zonas guardadas correctamente");
    } catch (e) {
      console.error("Error guardando zonas", e);
      alert("No se pudo crear la zona");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 p-2 rounded-md">
          <MapPin className="h-5 w-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Zonas y tarifas diferenciadas</h3>
          <p className="text-sm text-gray-500">Configura las zonas del evento con mapa, precios y descuentos.</p>
        </div>
      </div>

      {/* Área de subida de mapa (siempre visible) */}
      <label className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center h-40 mb-5 text-gray-500 hover:bg-gray-50 cursor-pointer">
        <Upload className="h-6 w-6 mb-2" />
        <p className="text-sm">Arrastra archivos aquí o haz clic para seleccionar</p>
        <p className="text-xs text-gray-400">PDF, PNG, JPG. Tamaño recomendado: 1200×600 px</p>
        <input type="file" accept="image/*" onChange={handleUploadMapa} className="hidden" />
      </label>

      {/* Estados de carga y error (no ocultan el resto del card) */}
      {isLoading && <div className="text-sm text-gray-600 mb-4">Cargando zonas...</div>}
      {error && !isLoading && <div className="text-sm text-red-600 mb-4">{error}</div>}

      {/* Tabla de zonas y tarifas (siempre visible) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Zona</th>
              <th className="px-4 py-2 text-left">Capacidad</th>
              <th className="px-4 py-2 text-left">Precio normal</th>
              <th className="px-4 py-2 text-left">Precio preventa</th>
              <th className="px-4 py-2 text-left">Descuento preventa (%)</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {zones.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-3 text-sm text-gray-500 text-center">
                  Este evento no tiene zonas registradas.
                </td>
              </tr>
            ) : (
              zones.map((z, i) => (
                <tr key={z.id || i} className="border-t border-gray-200">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={z.nombre}
                      onChange={(e) => handleChangeCampo(i, "nombre", e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={z.capacidad}
                      onChange={(e) => handleChangeCampo(i, "capacidad", e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={z.tarifaNormal?.precio ?? ""}
                      onChange={(e) => handleChangeTarifa(i, "normal", "precio", e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={z.tarifaPreventa?.precio ?? ""}
                      onChange={(e) => handleChangeTarifa(i, "preventa", "precio", e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={z.tarifaPreventa?.descuento ?? ""}
                      onChange={(e) => handleChangeTarifa(i, "preventa", "descuento", e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleEliminar(i)} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm">
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Botones de acción (siempre visibles) */}
      <div className="flex justify-between mt-4">
        <button onClick={handleAddZone} className="bg-amber-500 text-white text-sm rounded-md px-4 py-2 flex items-center gap-2 hover:bg-amber-600">
          <Plus className="h-4 w-4" /> Agregar zona
        </button>
        <button onClick={handleGuardar} disabled={isSaving} className="bg-gray-900 disabled:opacity-60 text-white text-sm rounded-md px-4 py-2 flex items-center gap-2 hover:bg-gray-800">
          <Save className="h-4 w-4" /> {isSaving ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>

      {/* Vista previa del mapa (siempre visible) */}
      <div className="mt-4">
        {mapa ? (
          <div className="text-sm text-gray-700">Mapa seleccionado: {mapa.name}</div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ImageOff className="h-4 w-4" /> No hay mapa del estadio
          </div>
        )}
      </div>
    </div>
  );
};

export default ZonasYTarifasCard;
export type { ZonasYTarifasCardProps };

interface ZonaBackendRaw {
  id: number;
  nombre: string;
  capacidad: number;
  cantidadComprada: number;
  tarifaNormal?: Tarifa;
  tarifaPreventa?: Tarifa | null;
}
