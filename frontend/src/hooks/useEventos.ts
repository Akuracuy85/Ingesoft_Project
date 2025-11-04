// src/hooks/useEventos.ts (COMPLETO Y CORREGIDO)

import { useState, useEffect, useMemo } from 'react'; 
import EventoService from '../services/EventoService'; 
import { type Event } from '../models/Event'; 
import { type FiltersType } from '../types/FiltersType'; 

/**
 * Define la estructura del valor devuelto por el hook useEventos.
 */
interface UseEventosResult {
    events: Event[];
    isLoading: boolean;
    error: string | null;
}

// 🎯 FUNCIÓN DE MAPEO
// Asegúrate de tipar filters como opcional si tu hook lo recibe así.
const mapFiltersToBackend = (filters: FiltersType | undefined): Record<string, any> => {
    // 🛑 SOLUCIÓN DEFINITIVA: Si 'filters' es nulo o indefinido, devolvemos un objeto vacío.
    if (!filters) {
        return {};
    }

    const backendParams: Record<string, any> = {};

    // 1. Ubicación (Ahora seguro porque filtramos arriba)
    // Aquí solo necesitamos '?' si LocationType permite 'departamento' ser opcional.
    if (filters.location?.departamento) backendParams.departamento = filters.location.departamento;
    if (filters.location?.provincia) backendParams.provincia = filters.location.provincia;
    if (filters.location?.distrito) backendParams.distrito = filters.location.distrito;

    // 2. Precios
    if (filters.priceRange?.min) backendParams.precioMin = filters.priceRange.min;
    if (filters.priceRange?.max) backendParams.precioMax = filters.priceRange.max;

    // 3. Fechas
    if (filters.dateRange?.start) backendParams.fechaInicio = filters.dateRange.start;
    if (filters.dateRange?.end) backendParams.fechaFin = filters.dateRange.end;
    
    // 4. Artistas / Categorías
    if (filters.artists?.length > 0) { // Añadir '?' por seguridad
        backendParams.artistas = filters.artists.join(','); 
    }
    if (filters.categories?.length > 0) { // Añadir '?' por seguridad
        backendParams.categorias = filters.categories.join(',');
    }
    
    return Object.fromEntries(
        Object.entries(backendParams).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    );
};
/**
 * Hook personalizado para cargar eventos, aplicando filtros del Contexto al Backend.
 * @param filters El objeto FiltersType del frontend (Contexto).
 */
export const useEventos = (filters: FiltersType): UseEventosResult => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Mapear los filtros del FE a los parámetros del BE (Memoizado)
    const backendFilters = useMemo(() => mapFiltersToBackend(filters), [filters]);

    // 2. Generar una clave para useEffect que solo cambia si los parámetros del BE cambian
    const filterKey = JSON.stringify(backendFilters);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                // 🚀 Llama al servicio con los parámetros de query mapeados
                const data = await EventoService.listar(backendFilters); 
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
        
    }, [filterKey]); // Recarga solo cuando los parámetros de la API cambian

    return { events, isLoading, error };
};