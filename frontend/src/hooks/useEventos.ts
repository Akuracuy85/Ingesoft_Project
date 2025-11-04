// src/hooks/useEventos.ts (CORREGIDO para incluir 'filters' en el retorno)

import { useState, useEffect, useCallback } from 'react'; 
import EventoService from '@/services/EventoService';
import { useFilters } from '@/context/FilterContext';
import { type Event } from '@/models/Event'; 
import type { FiltersType } from '@/types/FiltersType'; 

export const useEventos = () => {
    // 🛑 OBTENEMOS EL OBJETO FILTERS DEL CONTEXTO
    const { filters } = useFilters(); 
    
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // CRÍTICO: Usar useCallback para estabilizar fetchEvents
    const fetchEvents = useCallback(async (currentFilters: FiltersType) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log("-> 🔄 Disparando búsqueda con filtros:", currentFilters);
            const data = await EventoService.listar(currentFilters); 
            console.log("-> ✅ Eventos recibidos:", data.length);
            setEvents(data);
        } catch (err: any) {
            console.error("-> ❌ Fallo al cargar eventos con filtros:", err);
            setError(err.message || "No se pudieron cargar los eventos.");
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // El efecto que reacciona al cambio de filtros
    useEffect(() => {
        fetchEvents(filters);
    }, [filters, fetchEvents]);

    // 🛑 CLAVE: Retornar 'filters' junto con los demás estados.
    return { events, isLoading, error, filters }; 
};