import React from "react";
import { FeaturedEvent } from "./Banner/FeaturedEvent";
import { EventList } from "./EventList/EventList";

import { useEventos } from "../../../../hooks/useEventos"; 

export const BodySeleccionEventos: React.FC = () => {
    
    const { events, isLoading, error } = useEventos();     

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