// ./EventCard.tsx

import React from "react";
import type { Event } from "../../../../../models/Event";
import { Link } from "react-router-dom";

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { title, date, place, distrito, provincia, image } = event;

  const provinciaDistrito = `${provincia}, ${distrito}`;

  return (
    <Link to={`${event.id}/detalle`}>
      <div
        className="
          flex flex-col
          w-[130px] min-h-[220px]       
          md:w-[230px] md:min-h-[240px] 
          lg:w-[260px] lg:min-h-[300px] 
          bg-neutral-100 dark:bg-gray-800
          rounded overflow-hidden 
          shadow-md dark:shadow-gray-900/40
          transition-all duration-300 ease-in-out 
          hover:shadow-xl hover:scale-[1.03]
        "
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

        <div className="p-2.5 flex flex-col gap-1
                        text-black dark:text-white
                        bg-neutral-100 dark:bg-gray-800
                        transition-colors">
          <p className="font-semibold text-sm line-clamp-2">{title}</p>
          <p className="text-sm line-clamp-1">{date}</p>
          <p className="text-sm line-clamp-1">{provinciaDistrito}</p>
          <p className="text-sm line-clamp-1">{place}</p>
        </div>
      </div>
    </Link>
  );
};
