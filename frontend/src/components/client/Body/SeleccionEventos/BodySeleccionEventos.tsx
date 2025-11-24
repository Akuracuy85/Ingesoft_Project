// src/components/client/Body/SeleccionEventos/BodySeleccionEventos.tsx

import React from "react";
import { FeaturedEvent } from "./Banner/FeaturedEvent"; // Asegúrate de ajustar esta ruta
import { EventList } from "./EventList/EventList"; // Asegúrate de ajustar esta ruta
import { type Event } from '@/models/Event'; 
import { type FiltersType } from "../../../../types/FiltersType"; 

// INTERFAZ: Recibe todos los datos necesarios del padre
interface BodySeleccionEventosProps {
    events: Event[];
    featuredEvents: Event[]; 
    isLoading: boolean;
    error: string | null;
    filters: FiltersType; 
}

export const BodySeleccionEventos: React.FC<BodySeleccionEventosProps> = ({ 
    events, 
    featuredEvents, 
    isLoading, 
    error, 
    filters 
}) => {
    
    // ==========================================================
    // LÓGICA CLAVE: Detectar si hay algún filtro activo
    // ==========================================================
    const hasActiveFilters = React.useMemo(() => {
        if (!filters) return false;
        
        const checkActiveFilters = (f: FiltersType): boolean => {
             // 1. Listas
             if (f.categories.length > 0 || f.artists.length > 0) return true;
             // 2. Ubicación
             if (f.location.departamento || f.location.provincia || f.location.distrito) return true;
             // 3. Rango de Precio
             if (f.priceRange && (f.priceRange.min || f.priceRange.max)) return true;
             // 4. Rango de Fechas
             // Usamos 'start || end' ya que los campos de DateRangeType son Date | null
             if (f.dateRange && (f.dateRange.start || f.dateRange.end)) return true; 
             
             return false;
         };
         return checkActiveFilters(filters);
    }, [filters]);

    const shouldShowFeaturedBanner = !hasActiveFilters && featuredEvents && featuredEvents.length > 0;
    
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
                <p className="text-red-500 dark:text-red-400">Error al cargar los datos: {error}</p>
            </main>
        );
    }
    
    if (events.length === 0) {
        if (hasActiveFilters) {
            return (
                <main className="flex flex-col w-full items-center justify-start 
                    bg-white dark:bg-gray-900 
                    text-black dark:text-white ">
                    {shouldShowFeaturedBanner && <FeaturedEvent events={featuredEvents} />}
                    
                    <div className="w-full max-w-6xl flex justify-center items-center p-6 h-96">
                        <div className="text-center p-8 rounded-lg 
                            border border-[#F6BA26]/30 dark:border-[#C37723]/40
                            bg-[#F6BA26]/10 dark:bg-[#C37723]/20">
                            <h3 className="text-2xl font-bold text-[#C37723] mb-2">
                                ¡No hay resultados!
                            </h3>
                            <p className="text-[#C37723]">
                                No se encontraron eventos que coincidan con tus filtros.
                            </p>
                            <p className="text-sm text-[#C37723] mt-2">
                                Intenta limpiar o ajustar tus criterios de búsqueda.
                            </p>
                        </div>
                    </div>
                </main>
            );
        }
        
        return (
            <main className="flex justify-center items-center w-full h-96">
                <p className="text-gray-500 dark:text-gray-400">No hay eventos disponibles en este momento.</p>
            </main>
        );
    }

    return (
        <main className="flex flex-col w-full items-center justify-start bg-white dark:bg-gray-900 text-black dark:text-white">

            {shouldShowFeaturedBanner && <FeaturedEvent events={featuredEvents} />}

            <section className="w-full max-w-7xl flex flex-col gap-8 p-6">
                <h2 id="proximos-eventos" className="text-4xl font-semibold text-gray-800 dark:text-gray-200 ml-20">
                    {hasActiveFilters ? "Resultados de búsqueda" : "Próximos eventos"}
                </h2>
                <EventList events={events} /> 
            </section>
        </main>
    );
};