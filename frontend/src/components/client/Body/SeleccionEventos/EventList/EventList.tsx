import React from "react";
import type { Event } from "../../../../../models/Event";
import { EventCard } from "./EventCard";

interface EventListProps {
  events: Event[];
}

export const EventList: React.FC<EventListProps> = ({ events }) => {
  const ITEMS_PER_PAGE = 20;

  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);

  const paginatedEvents = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return events.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, events]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" }); // opcional
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2 flex-wrap">

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-40 cursor-pointer"
          >
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 border rounded cursor-pointer ${
                currentPage === page
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-indigo-600 hover:bg-indigo-100"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-40 cursor-pointer"
          >
            Siguiente
          </button>

        </div>
      )}

    </div>
  );
};
