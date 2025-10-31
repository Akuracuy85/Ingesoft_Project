// src/hooks/useEventos.ts

import { useState, useEffect } from 'react';
// Asegúrate de ajustar la ruta de importación de tu servicio
import EventoService from '../services/EventoService'; 
// Asegúrate de ajustar la ruta de importación de tu modelo
import { type Event } from '../models/Event'; 

// Definimos la interfaz del resultado del hook para TypeScript
interface UseEventosResult {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personalizado para cargar y gestionar la lista de eventos.
 * Permite pasar filtros opcionales para usar la misma lógica con búsquedas.
 */
export const useEventos = (filters: Record<string, any> = {}): UseEventosResult => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        // Llama al servicio con los filtros
        const data = await EventoService.listar(filters); 
        setEvents(data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar eventos:", err);
        setError("No se pudieron cargar los eventos. Verifique la conexión.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    
    // Dependencia: Recarga los datos solo cuando los filtros cambian.
    // Usamos JSON.stringify para comparar el objeto de filtros de forma segura.
  }, [JSON.stringify(filters)]); 

  return { events, isLoading, error };
};