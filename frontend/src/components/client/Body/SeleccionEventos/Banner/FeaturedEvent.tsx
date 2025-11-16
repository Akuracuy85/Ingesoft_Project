import React, { useState } from "react";
import type { Event } from "../../../../../models/Event";
import { useNavigate } from "react-router-dom";

interface FeaturedEventProps {
  events: Event[];
}

export const FeaturedEvent: React.FC<FeaturedEventProps> = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = events.length;
   const navigate = useNavigate(); 


   
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const event = events[currentIndex];

  const distritoProvincia = `${event.provincia}, ${event.distrito}`;

  // Pequeña optimización: no es necesario 'event = events[currentIndex]'
  // Puedes usar 'events[currentIndex]' directamente abajo.

  return (
    <section className="group relative w-full h-[280px] md:h-[400px] lg:h-[420px] overflow-hidden rounded-lg shadow-md">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div
          className="flex w-full h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {events.map((ev) => (
            <img
              key={ev.id}
              src={ev.image}
              alt={ev.title}
              className="w-full h-full object-cover flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Capa oscura para contraste */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Contenido superpuesto */}
      <div className="relative z-10 flex flex-col items-start justify-center h-full max-w-6xl mx-auto px-6 text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          {events[currentIndex].title}
        </h2>
        <p className="text-lg md:text-xl mb-1">
          📅 {events[currentIndex].date}
        </p>     
        <p className="text-lg md:text-xl mb-1">
          📍 {distritoProvincia}
        </p>
        <p className="text-lg md:text-xl mb-4">
          📍 {events[currentIndex].place}
        </p>
        {/* ✅ Botón con estado 'focus' */}
        <button
          onClick={() => navigate(`/eventos/${event.id}/detalle`)}
            className="
              px-6 py-2 
              bg-transparent 
              border border-white 
              rounded-md 
              text-white 
              text-center
              hover:bg-white/20 
              transition
              cursor-pointer
            "
        >
          VER MÁS
        </button>
      </div>

      {/* 🔹 Flecha izquierda */}
      <button
        onClick={handlePrev}
        // ✅ Clases añadidas:
        // 1. bg-black/20: Fondo semitransparente
        // 2. rounded-full: Para hacerlo circular
        // 3. hover:bg-black/40: Se oscurece al pasar el mouse
        // 4. focus: ...: Para accesibilidad con teclado
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 
                  bg-black/20 rounded-full
                  opacity-0 group-hover:opacity-100
                  transition-all duration-300
                  hover:scale-105 hover:bg-black/40
                  focus:outline-none"

      >
        <img
          className="w-[85px]"
          alt="Anterior"
          src="https://c.animaapp.com/mgx1kaihbC7QfN/img/frame-10.svg"
        />
      </button>

      {/* 🔹 Flecha derecha */}
      <button
        onClick={handleNext}
        // ✅ Mismas clases añadidas que en la flecha izquierda
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 
                  bg-black/20 rounded-full
                  opacity-0 group-hover:opacity-100
                  transition-all duration-300
                  hover:scale-105 hover:bg-black/40
                  focus:outline-none"

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