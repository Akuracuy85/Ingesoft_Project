import React, { useState, useRef } from "react";
import type { Event } from "../../../../../models/Event";
import { useNavigate } from "react-router-dom";

interface FeaturedEventProps {
  events: Event[];
}

export const FeaturedEvent: React.FC<FeaturedEventProps> = ({ events }) => {
  const total = events.length;
  const displayEvents = [events[total - 1], ...events, events[0]];
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleNext = () => {
    if (!isTransitioning) {
      setCurrentIndex(prev => prev + 1);
      setIsTransitioning(true);
    }
  };

  const handlePrev = () => {
    if (!isTransitioning) {
      setCurrentIndex(prev => prev - 1);
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

  return (
    <section className="group relative w-full h-[280px] md:h-[400px] lg:h-[420px] overflow-hidden rounded-lg shadow-md">
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
              className="w-full h-full object-cover flex-shrink-0"
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex flex-col items-start justify-center h-full max-w-6xl mx-auto px-6 text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">{event.title}</h2>
        <p className="text-lg md:text-xl mb-1">📅 {event.date}</p>
        <p className="text-lg md:text-xl mb-1">📍 {distritoProvincia}</p>
        <p className="text-lg md:text-xl mb-4">📍 {event.place}</p>
        <button
          onClick={() => navigate(`/eventos/${event.id}/detalle`)}
          className="px-6 py-2 bg-transparent border border-white rounded-md text-white text-center hover:bg-white/20 transition cursor-pointer"
        >
          VER MÁS
        </button>
      </div>

      <button
        onClick={handlePrev}
        disabled={isTransitioning}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 hover:bg-black/40 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <img
          className="w-[85px]"
          alt="Anterior"
          src="https://c.animaapp.com/mgx1kaihbC7QfN/img/frame-10.svg"
        />
      </button>

      <button
        onClick={handleNext}
        disabled={isTransitioning}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 hover:bg-black/40 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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