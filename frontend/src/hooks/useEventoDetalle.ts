import { useState, useEffect } from "react";
import EventoService from "@/services/EventoService";
import type { Event } from "@/models/Event";
import type { Zone } from "@/models/Zone";
import type { Tarifa } from "@/models/Tarifa";

type BackendEventoRaw = Partial<Event> & {
  fechaEvento?: string; // ISO o "YYYY-MM-DDTHH:mm:ss"
  zonas?: ZonaRaw[];
};

type ZonaRaw = {
  id: number;
  nombre: string;
  capacidad: number;
  cantidadComprada: number;
  tarifaNormal?: unknown;
  tarifaPreventa?: unknown;
};

/**
 * Hook personalizado para obtener el detalle de un evento por su ID.
 */
export const useEventoDetalle = (id: number | string | undefined) => {
  const [evento, setEvento] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchEventoDetalle = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = (await EventoService.obtenerPorId(Number(id))) as BackendEventoRaw;
        // Parseo seguro de fechaEvento (YYYY-MM-DDTHH:mm:ss[Z] o sin Z)
        const raw = data.fechaEvento || data.date || "";
        let dateDMY: string | null = null;
        let timeHM: string | null = null;
        if (raw) {
          const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):?(\d{2})?/);
          if (match) {
            const [, y, m, d, hh, mm] = match;
            dateDMY = `${d}/${m}/${y}`;
            timeHM = `${hh}:${mm}`;
          }
        }
        // Convertimos las zonas al tipo Zone
        const zonas: Zone[] = (data.zonas || []).map((z) => ({
          id: z.id,
          nombre: z.nombre,
          capacidad: z.capacidad,
          cantidadComprada: z.cantidadComprada,
          tarifaNormal: (z as any).tarifaNormal as Tarifa, // asumimos siempre presente según modelo
          tarifaPreventa: (z as any).tarifaPreventa as Tarifa | null | undefined,
        }));
        setEvento({
          ...(data as Event),
          zonas,
          date: dateDMY || data.date || "",
          time: timeHM || data.time || "",
        });
      } catch (err: unknown) {
        console.error("Error al cargar el detalle del evento:", err);
        setError("No se pudo cargar el detalle del evento. Intente nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventoDetalle();
  }, [id]);

  return { evento, isLoading, error };
};
