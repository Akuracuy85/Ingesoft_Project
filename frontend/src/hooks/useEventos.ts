// src/hooks/useEventos.ts (Corrección del loop infinito)
import { useState, useEffect, useCallback } from 'react'; // <-- Asegúrate de importar useCallback
import EventoService from '@/services/EventoService';
import { useFilters } from '@/context/FilterContext';
import { type Event } from '@/models/Event'; 
import type { FiltersType } from '@/types/FiltersType'; 

export const useEventos = () => {
    const { filters } = useFilters(); 
    
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 🛑 CRÍTICO: Usar useCallback para estabilizar fetchEvents
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
    }, [/* Dependencias vacías si solo usa setStates estables */]);
    // Nota: Aunque EventoService.listar es estable, pasar fetchEvents al useEffect
    // sin useCallback haría que se recree en cada render, causando el loop.

    // El efecto que reacciona al cambio de filtros
    useEffect(() => {
        // La dependencia 'filters' asegura que solo se llama cuando los filtros cambian.
        // fetchEvents ahora es estable gracias a useCallback.
        fetchEvents(filters);
    }, [filters, fetchEvents]); // <-- Añadir fetchEvents como dependencia (aunque sea estable)

    return { events, isLoading, error };
};