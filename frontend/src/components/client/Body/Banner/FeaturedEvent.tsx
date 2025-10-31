import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Event } from "../../../../models/Event";

interface FeaturedEventProps {
  events: Event[];
}

export const FeaturedEvent: React.FC<FeaturedEventProps> = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = events.length;
  const navigate = useNavigate(); // 👈 Inicializamos el hook de navegación

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const event = events[currentIndex];

  return (
    <section className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] overflow-hidden rounded-lg shadow-md">
      <img
        src={event.image}
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex flex-col items-start justify-center h-full max-w-6xl mx-auto px-6 text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">{event.title}</h2>
        <p className="text-lg md:text-xl mb-1">📅 {event.date}</p>
        <p className="text-lg md:text-xl mb-4">📍 {event.place}</p>

        
        <button
          onClick={() => navigate(`/eventos/${event.id}/detalle`)}
          className="px-5 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
        >
          Ver detalles
        </button>
      </div>

      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 hover:scale-105 transition-transform"
      >
        <img
          className="w-[85px]"
          alt="Anterior"
          src="https://c.animaapp.com/mgx1kaihbC7QfN/img/frame-10.svg"
        />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 hover:scale-105 transition-transform"
      >
        <img
          className="w-[85px]"
          alt="Siguiente"
          src="https://c.animaapp.com/mgx1kaihbC7QfN/img/frame-11.svg"
        />
      </button>
    </section>
  );
};
