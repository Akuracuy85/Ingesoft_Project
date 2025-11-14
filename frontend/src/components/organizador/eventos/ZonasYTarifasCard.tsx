import React, { useState, useEffect } from "react";
import { MapPin, ImageOff } from "lucide-react";
import type { Zone } from "@/models/Zone";
import type { Tarifa } from "@/models/Tarifa";
import EventoService from "@/services/EventoService";

interface ZonasYTarifasCardProps { eventoId: number; }

const ZonasYTarifasCard: React.FC<ZonasYTarifasCardProps> = ({ eventoId }) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 p-2 rounded-md">
          <MapPin className="h-5 w-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Zonas y tarifas diferenciadas</h3>
          <p className="text-sm text-gray-500">Visualiza las zonas del evento con sus precios y descuentos.</p>
        </div>
      </div>

      {/* Estados de carga */}
      {isLoading && <div className="text-sm text-gray-600 mb-4">Cargando zonas...</div>}
      {error && !isLoading && <div className="text-sm text-red-600 mb-4">{error}</div>}
      {!isLoading && !error && zones.length === 0 && (
        <div className="text-sm text-gray-500 mb-4">Este evento no tiene zonas registradas.</div>
      )}

      {/* Tabla */}
      {zones.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Zona</th>
                <th className="px-4 py-2 text-left">Capacidad</th>
                <th className="px-4 py-2 text-left">Precio normal</th>
                <th className="px-4 py-2 text-left">Precio preventa</th>
                <th className="px-4 py-2 text-left">Descuento preventa (%)</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z, i) => (
                <tr key={z.id || i} className="border-t border-gray-200">
                  <td className="px-4 py-2">{z.nombre}</td>
                  <td className="px-4 py-2">{z.capacidad}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={z.tarifaNormal?.precio ?? ""}
                      readOnly
                      className="border border-gray-300 rounded-md px-2 py-1 w-full bg-gray-50"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={z.tarifaPreventa?.precio ?? ""}
                      readOnly
                      className="border border-gray-300 rounded-md px-2 py-1 w-full bg-gray-50"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={z.tarifaPreventa?.descuento ?? ""}
                      readOnly
                      className="border border-gray-300 rounded-md px-2 py-1 w-full bg-gray-50"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vista previa del mapa (placeholder) */}
      <div className="mt-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ImageOff className="h-4 w-4" /> No hay mapa del estadio
        </div>
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
