import React from "react";
import type { Event } from "../../../../models/Event";
import { Link } from "react-router-dom";

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { title, date, place, image } = event;

  return (
    <Link to={`evento/${event.id}`}>
      <div className="flex flex-col w-[253px] h-[248px] bg-neutral-100 rounded overflow-hidden shadow-md">
        <img
          src={image}
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