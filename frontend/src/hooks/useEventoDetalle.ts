import { useState, useEffect } from "react";
import EventoService from "@/services/EventoService";
import { type Event } from "@/models/Event";

interface ZonaTarifa {
  id: number;
  nombre: string;
  tarifas: { tipo: string; precio: number }[];
}

interface EventConZonas extends Event {
  zonas?: ZonaTarifa[];
}

/**
 * Hook personalizado para obtener el detalle de un evento por su ID.
 * Permite múltiples tipos de tarifas dinámicas (Preventa, Normal, etc.)
 */
export const useEventoDetalle = (id: number | string | undefined) => {
  const [evento, setEvento] = useState<EventConZonas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchEventoDetalle = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await EventoService.obtenerPorId(Number(id));

        // Tipamos explícitamente las zonas y tarifas
        const zonas = ((data as any).zonas || []).map((z: any) => {
          const tarifas: { tipo: string; precio: number }[] = [];

          // Agregamos dinámicamente todas las tarifas que vengan del backend
          Object.keys(z).forEach((key) => {
            if (key.startsWith("tarifa") && z[key]?.precio) {
              tarifas.push({
                tipo: key.replace("tarifa", ""),
                precio: z[key].precio,
              });
            }
          });

          return { ...z, tarifas };
        });

        setEvento({ ...(data as EventConZonas), zonas });
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
