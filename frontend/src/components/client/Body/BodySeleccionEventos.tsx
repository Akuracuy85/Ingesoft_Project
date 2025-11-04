// src/pages/eventos/BodySeleccionEventos.tsx (VERSION FINAL Y SIMPLE)

import React from "react";
import { FeaturedEvent } from "./Banner/FeaturedEvent";
import { EventList } from "./EventList/EventList";

import { useEventos } from "../../../hooks/useEventos"; 
import { useFilters } from "../../../context/FilterContext"; 

// 🛑 La función applyFilters fue eliminada.

export const BodySeleccionEventos: React.FC = () => {
    
    const { filters } = useFilters(); 

    // 🚀 El hook llama a la API con los filtros y devuelve la lista filtrada.
    const { events: filteredEvents, isLoading, error } = useEventos(filters); 
    
    // --- RENDERIZADO CONDICIONAL ---
    if (isLoading) {
        return (
            <main className="flex justify-center items-center w-full h-96 pt-[102px]">
                <p>Cargando los próximos eventos...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex justify-center items-center w-full h-96 pt-[102px]">
                <p className="text-red-500">Error al cargar los datos: {error}</p>
            </main>
        );
    }
    
    // Utilizamos la lista filtrada para eventos destacados y la lista principal
    const featuredEvents = filteredEvents.slice(0, 3); 

    // Mostrar mensaje si el BE no devuelve resultados
    if (filteredEvents.length === 0) { 
        return (
            <main className="flex flex-col w-full items-center justify-start bg-white text-black pt-[102px] h-[50vh]">
                <section className="w-full max-w-6xl flex flex-col gap-8 p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Próximos eventos
                    </h2>
                    <p className="text-gray-500 text-xl">
                        No hay eventos que coincidan con los filtros aplicados.
                    </p>
                </section>
            </main>
        );
    }

    return (
        <main className="flex flex-col w-full items-center justify-start bg-white text-black pt-[102px]"> 
            <FeaturedEvent events={featuredEvents} />

            <section className="w-full max-w-6xl flex flex-col gap-8 p-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Próximos eventos ({filteredEvents.length} encontrados)
                </h2>
                <EventList events={filteredEvents} />  
            </section>
        </main>
    );
};