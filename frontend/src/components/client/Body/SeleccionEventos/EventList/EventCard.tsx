// ./EventCard.tsx

import React from "react";
import type { Event } from "../../../../../models/Event";
import { Link } from "react-router-dom";

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { title, date, place, distrito, provincia, image, minPrice } = event;

  // Debug log removed as requested

  const provinciaDistrito = `${provincia}, ${distrito}`;

  return (
    <Link to={`${event.id}/detalle`} className="cursor-pointer select-none">
      <div
        className={
          "flex flex-col " +
          "w-[130px] min-h-[220px] " +
          "md:w-[230px] md:min-h-[240px] " +
          "lg:w-[260px] lg:min-h-[300px] " +
          "bg-neutral-100 dark:bg-gray-800 " +
          "rounded overflow-hidden " +
          "shadow-md dark:shadow-gray-900/40 " +
          "transition duration-300 ease-in-out " +
          "hover:shadow-xl hover:scale-[1.03]"
        }
      >
        <img
          src={image}
          alt={title}
          className="
            w-full h-[110px]
            md:h-[130px]     
            lg:h-[160px]        
            object-cover
          "
        />

        <div className="p-2.5 flex flex-col gap-1 text-black dark:text-white">
          <p className="font-semibold text-sm line-clamp-2">{title}</p>
          {event.artist?.nombre && (
            <p className="text-sm line-clamp-1 text-gray-600 dark:text-gray-300">{event.artist.nombre}</p>
          )}
          <p className="text-sm line-clamp-1">{date}</p>
          <p className="text-sm line-clamp-1">{provinciaDistrito}</p>
          <p className="text-sm line-clamp-1">{place}</p>
          {typeof minPrice === 'number' ? (
            <p className="text-sm font-semibold mt-1">Desde S/. {minPrice.toFixed(2)}</p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">Precio no disponible</p>
          )}
        </div>
      </div>
    </Link>
  );
};
