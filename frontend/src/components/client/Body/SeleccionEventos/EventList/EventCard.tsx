// ./EventCard.tsx

import React from "react";
import type { Event } from "../../../../../models/Event";
import { Link } from "react-router-dom";

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { title, date, place, image, time } = event;

  return (
    <Link to={`evento/${event.id}`}>
      {/* ✅ CAMBIOS AQUÍ:
        1. transition-all, duration-300, ease-in-out: Para una animación suave.
        2. hover:shadow-xl: Aumenta la sombra al pasar el mouse.
        3. hover:scale-[1.03]: Agranda ligeramente la tarjeta.
           (Puedes usar scale-105 si prefieres un efecto más notorio)
      */}
      <div 
        className="flex flex-col w-[253px] h-[248px] bg-neutral-100 rounded overflow-hidden shadow-md 
                   transition-all duration-300 ease-in-out 
                   hover:shadow-xl hover:scale-[1.03]"
      >
        <img
          src="https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2" //{image}
          alt={title}
          className="w-full h-[150px] object-cover"
        />
        <div className="p-2.5 flex flex-col gap-1 text-black bg-neutral-100">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-sm">{date}</p>
          <p className="text-sm">{place}</p>
        </div>
      </div>
    </Link>
  );
};