import React, { useState, useRef, useEffect } from "react";
import type { Event } from "../../../../../models/Event";
import { useNavigate } from "react-router-dom";
import FlechaIzquierda from '../../../../../assets/Flecha_izquierda.svg';
import FlechaDerecha from '../../../../../assets/Flecha_derecha.svg';

interface FeaturedEventProps {
  events: Event[];
}

export const FeaturedEvent: React.FC<FeaturedEventProps> = ({ events }) => {
  const total = events.length;

  // Clonación para efecto infinito
  const displayEvents = [events[total - 1], ...events, events[0]];

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Intervalo guardado en ref (para poder detenerlo correctamente)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleNext = () => {
    if (!isTransitioning) {
      setCurrentIndex((prev) => prev + 1);
      setIsTransitioning(true);
    }
  };

  const handlePrev = () => {
    if (!isTransitioning) {
      setCurrentIndex((prev) => prev - 1);
      setIsTransitioning(true);
    }
  };

  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(total);
    } else if (currentIndex === total + 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else {
      setIsTransitioning(false);
    }
  };

  const visibleEventIndex =
    currentIndex === 0
      ? total - 1
      : currentIndex === total + 1
      ? 0
      : currentIndex - 1;

  const event = events[visibleEventIndex];
  const distritoProvincia = `${event.provincia}, ${event.distrito}`;

  // AUTOPLAY INTELIGENTE
  useEffect(() => {
    const start = () => {
      if (
        intervalRef.current || // ya está activo
        isHovered ||           // en hover
        isTransitioning ||     // animando
        document.visibilityState !== "visible" // pestaña no visible
      )
        return;

      intervalRef.current = setInterval(() => {
        if (
          !isHovered &&
          !isTransitioning &&
          document.visibilityState === "visible"
        ) {
          handleNext();
        }
      }, 5000);
    };

    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Detecta cambio de visibilidad de pestaña
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        stop();
      } else {
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isHovered, isTransitioning, currentIndex]);

  return (
    <section
      className="group relative w-full h-[280px] md:h-[400px] lg:h-[420px] overflow-hidden shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* CARRUSEL */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div
          ref={containerRef}
          className={`flex w-full h-full ${
            isTransitioning ? "transition-transform duration-500 ease-in-out" : ""
          }`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {displayEvents.map((ev, idx) => (
            <img
              key={idx}
              src={ev.image}
              alt={ev.title}
              className="w-full h-full flex-shrink-0 featured-image"
            />
          ))}
        </div>
      </div>

      {/* OSCURECEDOR */}
      <div className="absolute inset-0 bg-black/50" />

      {/* TEXTO SUPERIOR */}
      <div className="relative z-10 flex flex-col items-start justify-center h-full max-w-6xl mx-auto px-6 text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">{event.title}</h2>
        {event.artist?.nombre && (
          <p className="text-lg md:text-xl mb-1">{event.artist.nombre}</p>
        )}
        <p className="text-lg md:text-xl mb-1">📅 {event.date}</p>
        <p className="text-lg md:text-xl mb-1">📍 {distritoProvincia}</p>
        <p className="text-lg md:text-xl mb-4">🏛️ {event.place}</p>

        <button
          onClick={() => navigate(`/eventos/${event.id}/detalle`)}
          className="px-6 py-2 bg-transparent border border-white rounded-md text-white text-center hover:bg-white/20 transition cursor-pointer"
        >
          VER MÁS
        </button>
      </div>

      {/* BOTÓN ANTERIOR */}
      <button
        onClick={handlePrev}
        disabled={isTransitioning}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-[95px] h-[180px] flex items-center justify-center bg-black/20 rounded-4xl opacity-0 
                   group-hover:opacity-100 transition-all duration-300 
                   hover:scale-105 hover:bg-black/40 
                   focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <img
          className="w-[85px] h-[85px] object-contain"
          alt="Anterior"
          src={FlechaIzquierda}
        />
      </button>

      {/* BOTÓN SIGUIENTE */}
      <button
        onClick={handleNext}
        disabled={isTransitioning}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-[95px] h-[180px] flex items-center justify-center bg-black/20 rounded-4xl opacity-0 
                   group-hover:opacity-100 transition-all duration-300 
                   hover:scale-105 hover:bg-black/40 
                   focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <img
          className="w-[85px] h-[85px] object-contain"
          alt="Siguiente"
          src={FlechaDerecha}
        />
      </button>
    </section>
  );
};
