import React from "react";
import { FeaturedEvent } from "./Banner/FeaturedEvent";
import { EventList } from "./EventList/EventList";

// 1. Importar el custom hook desde la ruta correcta
import { useEventos } from "../../../../hooks/useEventos"; 

// import { eventosMock } from "../../../../data/eventosMock"; // 🚫 Ya no es necesario

export const BodySeleccionEventos: React.FC = () => {
    
    // 2. Llamar al hook para obtener el estado de los datos.
    // Lo llamamos sin argumentos para que liste todos los eventos.
    const { events, isLoading, error } = useEventos();     

    // --- Manejo de Estados ---

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
    
    // Opcional: Manejar si no hay eventos
    if (events.length === 0) {
        return (
            <main className="flex justify-center items-center w-full h-96">
                <p className="text-gray-500">No hay eventos disponibles en este momento.</p>
            </main>
        );
    }

    // Usamos un subconjunto de los datos reales para la sección destacada
    const featuredEvents = events.slice(0, 3); 

    return (
        <main className="flex flex-col w-full items-center justify-start bg-white text-black">
            
            {/* 🟢 Slider de eventos destacados: usa datos reales */}
            <FeaturedEvent events={featuredEvents} />

            {/* 🔹 Lista completa de eventos */}
            <section className="w-full max-w-6xl flex flex-col gap-8 p-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Próximos eventos
                </h2>
                {/* Usa la lista completa de eventos */}
                <EventList events={events} /> 
            </section>
        </main>
    );
};