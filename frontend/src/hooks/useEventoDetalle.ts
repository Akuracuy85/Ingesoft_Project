import { useState, useEffect } from "react";
import EventoService from "@/services/EventoService";
import type { Event } from "@/models/Event";
import type { Zone } from "@/models/Zone";

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

        const data = await EventoService.obtenerPorId(Number(id));

        // Convertimos las zonas al tipo Zone (ya con tarifas normales y preventas)
        const zonas: Zone[] = ((data as any).zonas || []).map((z: any) => ({
          id: z.id,
          nombre: z.nombre,
          capacidad: z.capacidad,
          cantidadComprada: z.cantidadComprada,
          tarifaNormal: z.tarifaNormal,
          tarifaPreventa: z.tarifaPreventa,
        }));

        setEvento({ ...(data as Event), zonas });
      } catch (err: any) {
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
