import { useState, useEffect } from "react";
import EventoService from "@/services/EventoService";
import type { Event } from "@/models/Event";
import type { Zone } from "@/models/Zone";
import type { Tarifa } from "@/models/Tarifa";

type BackendEventoRaw = Partial<Event> & {
  title: string;
  fechaEvento?: string;
  zonas?: ZonaRaw[];
  place?: string;
  placeEspecific?: string;
};

type ZonaRaw = {
  id: number;
  nombre: string;
  capacidad: number;
  cantidadComprada: number;
  tarifaNormal?: unknown;
  tarifaPreventa?: unknown;
};

export const useEventoDetalle = (id: number | string | undefined) => {
  const [evento, setEvento] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Aver")
    if (!id) return;

    const fetchEventoDetalle = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = (await EventoService.obtenerPorIdParaPantallaDetalle(
          Number(id)
        )) as BackendEventoRaw;

        // === PARSEO DE FECHA Y HORA ===
        let raw = data.fechaEvento || data.date || "";
        raw = raw.replace(" ", "T");
        let dateDMY: string | null = null;
        let timeHM: string | null = null;

        if (raw) {
          const match = raw.match(
            /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):?(\d{2})?/
          );

          if (match) {
            const [, y, m, d, hh, mm] = match;

            // Fecha larga
            const fechaObj = new Date(Number(y), Number(m) - 1, Number(d));
            dateDMY = fechaObj.toLocaleDateString("es-PE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            console.log("Fecha formateada:", dateDMY);

            // El backend ya envía la hora correcta en horario Perú.
            let hNum = parseInt(hh, 10);
            const ampm = hNum >= 12 ? "pm" : "am";

            // Convertir a formato 12h
            if (hNum > 12) hNum -= 12;
            if (hNum === 0) hNum = 12;

            timeHM = `${hNum}:${mm} ${ampm}`;
          }
        }

        // === CONVERSIÓN DE ZONAS ===
        const zonas: Zone[] = (data.zonas || []).map((z) => ({
          id: z.id,
          nombre: z.nombre,
          capacidad: z.capacidad,
          cantidadComprada: z.cantidadComprada,
          tarifaNormal: (z as any).tarifaNormal as Tarifa,
          tarifaPreventa: (z as any).tarifaPreventa as Tarifa | null | undefined,
        }));

        setEvento({
          ...(data as Event),
          zonas,
          date: dateDMY || data.date || "",
          time: timeHM ?? data.time ?? "",
          lugar: data.place ?? "",
          placeEspecific: data.placeEspecific ?? "",
        });
      } catch (err) {
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
