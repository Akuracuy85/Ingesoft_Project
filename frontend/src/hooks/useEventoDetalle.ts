import { useState, useEffect } from "react";
import EventoService from "@/services/EventoService";
import { type Event } from "@/models/Event";

interface UseEventoDetalleResult {
  evento: Event | null;
  isLoading: boolean;
  error: string | null;
}

export const useEventoDetalle = (id: number): UseEventoDetalleResult => {
  const [evento, setEvento] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        setIsLoading(true);
        const data = await EventoService.obtenerPorId(id);
        setEvento(data);
        setError(null);
      } catch (err) {
        console.error("Error al obtener evento:", err);
        setError("No se pudo cargar el detalle del evento.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchEvento();
  }, [id]);

  return { evento, isLoading, error };
};
