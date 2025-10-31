import { useState, useEffect } from "react";
import EventoService from "@/services/EventoService";
import { type Event } from "@/models/Event";

/**
 * Hook personalizado para obtener el detalle de un evento por su ID.
 * Incluye zonas con precios mapeados desde tarifaNormal / tarifaPreventa.
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

        // Llamada al backend
        const data = await EventoService.obtenerPorId(Number(id));

        // 🟢 Mapeo de zonas con precios base (por ejemplo: tarifaNormal)
        const zonasMapeadas = (data.zonas || []).map((z: any) => ({
          ...z,
          costo:
            z.tarifaNormal?.precio ??
            z.tarifaPreventa?.precio ??
            0,
        }));

        // 🟢 Crear objeto evento enriquecido
        const eventoConZonas = {
          ...data,
          zonas: zonasMapeadas,
        };

        setEvento(eventoConZonas);
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
