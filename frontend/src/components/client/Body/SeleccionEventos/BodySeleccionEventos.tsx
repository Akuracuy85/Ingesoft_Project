// src/pages/BodySeleccionEventos.tsx (CORREGIDO)

import React from "react";
import { FeaturedEvent } from "./Banner/FeaturedEvent";
import { EventList } from "./EventList/EventList";

import { useEventos } from "../../../../hooks/useEventos"; 
import { type FiltersType } from "../../../../types/FiltersType"; // 🛑 Asegúrate de importar FiltersType

export const BodySeleccionEventos: React.FC = () => {
    
    // 🛑 Desestructurar los filtros del hook
    const { events, isLoading, error, filters } = useEventos();     

    // ==========================================================
    // 🛑 LÓGICA CLAVE: Detectar si hay algún filtro activo
    // ==========================================================

const hasActiveFilters = React.useMemo(() => {
        if (!filters) return false;
        
        const checkActiveFilters = (f: FiltersType): boolean => {
            // 1. Verificar si las listas de IDs no están vacías
            if (f.categories.length > 0 || f.artists.length > 0) return true;

            // 2. Verificar si hay una ubicación seleccionada
            if (f.location.departamento || f.location.provincia || f.location.distrito) return true;

            // 🛑 CORRECCIÓN: Usar encadenamiento opcional (?) y doble negación (!!) o simple chequeo

            // 3. Rango de Precio (Chequeo de null primero)
            if (f.priceRange && (f.priceRange.min || f.priceRange.max)) return true;
            // Alternativa más explícita:
            // if (f.priceRange !== null && (f.priceRange.min || f.priceRange.max)) return true;

            // 4. Rango de Fechas (Chequeo de null primero)
            if (f.dateRange && (f.dateRange.start || f.dateRange.end)) return true;
            // Alternativa más explícita:
            // if (f.dateRange !== null && (f.dateRange.start || f.dateRange.end)) return true;

            return false;
        };
        
        return checkActiveFilters(filters);
        
    }, [filters]);


    // ==========================================================
    // RENDERIZADO CONDICIONAL
    // ==========================================================

    if (isLoading) {
        return (
            <main className="flex justify-center items-center w-full h-96">
                <p>Cargando los próximos eventos...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex justify-center items-center w-full h-96">
                <p className="text-red-500">Error al cargar los datos: {error}</p>
            </main>
        );
    }
    
    if (events.length === 0) {
        // 🛑 NUEVO COMPORTAMIENTO: Si no hay eventos, verificamos si hay filtros activos
        if (hasActiveFilters) {
            return (
                <main className="flex justify-center items-center w-full h-96">
                    <div className="text-center p-8 border border-indigo-200 rounded-lg bg-indigo-50">
                        <h3 className="text-2xl font-bold text-indigo-800 mb-2">
                            ¡No hay resultados! 😔
                        </h3>
                        <p className="text-indigo-600">
                            No se encontraron **eventos que coincidan con tus filtros**.
                        </p>
                        <p className="text-sm text-indigo-500 mt-2">
                            Intenta limpiar o ajustar tus criterios de búsqueda.
                        </p>
                    </div>
                </main>
            );
        }
        
        // Comportamiento por defecto (base de datos vacía sin filtros)
        return (
            <main className="flex justify-center items-center w-full h-96">
                <p className="text-gray-500">No hay eventos disponibles en este momento.</p>
            </main>
        );
    }

    const featuredEvents = events.slice(0, 3); 

    return (
        <main className="flex flex-col w-full items-center justify-start bg-white text-black">
            
            <FeaturedEvent events={featuredEvents} />

            <section className="w-full max-w-6xl flex flex-col gap-8 p-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Próximos eventos
                </h2>
                <EventList events={events} /> 
            </section>
        </main>
    );
};