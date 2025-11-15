// src/hooks/useEventos.ts

import { useState, useEffect, useCallback } from 'react';
import EventoService from '../services/EventoService';
import { useFilters } from '../context/FilterContext'; // Usa el contexto para obtener los filtros
import type { Event } from '../models/Event';
import type { FiltersType } from '../types/FiltersType';

export const useEventos = () => {
    // 1. Obtener los filtros actuales del Context
    const { filters } = useFilters(); //  Esta llamada ahora funciona gracias al main.tsx
    
    // 2. Estado local para los datos
    const [events, setEvents] = useState<Event[]>([]);
    const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 3. Función de recarga de eventos
    const fetchEvents = useCallback(async (currentFilters: FiltersType) => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedEvents = await EventoService.listar(currentFilters);
            setEvents(fetchedEvents);

        } catch (err: any) {
            setError(err.message || 'Error al obtener eventos.');
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    }, []); 

    // 4. Función de carga de eventos destacados
    const fetchFeaturedEvents = useCallback(async () => {
        try {
            const fetchedFeatured = await EventoService.listar();
            setFeaturedEvents(fetchedFeatured);
        } catch (err) {
            console.warn("No se pudieron cargar eventos destacados.", err);
            setFeaturedEvents([]);
        }
    }, []);
    
    // 5. EFECTO CLAVE PARA LA PERSISTENCIA Y RECARGA
    useEffect(() => {
        if (featuredEvents.length === 0) {
             fetchFeaturedEvents();
        }

        // Siempre recarga eventos con los filtros actuales del contexto
        fetchEvents(filters); 

    }, [filters, fetchEvents, fetchFeaturedEvents, featuredEvents.length]);
    
    // 6. Retornar el estado y las funciones
    return {
        events,
        featuredEvents,
        isLoading,
        error,
        filters,
        fetchEvents,
    };
};