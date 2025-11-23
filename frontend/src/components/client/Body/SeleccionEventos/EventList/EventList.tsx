import React from "react";
import type { Event } from "../../../../../models/Event";
import { EventCard } from "./EventCard";

interface EventListProps {
  events: Event[];
}

export const EventList: React.FC<EventListProps> = ({ events }) => {
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = React.useState(1);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);

  const paginatedEvents = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return events.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, events]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  return (
    <div className="flex flex-col gap-8">

      {/* GRID */}
      <div
        ref={listRef}
        className="grid gap-6 justify-center"
        style={{ gridTemplateColumns: "repeat(auto-fill, 260px)" }}
      >
        {paginatedEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2 flex-wrap">

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="
              px-3 py-1 border rounded disabled:opacity-40 cursor-pointer
              bg-white dark:bg-gray-800
              text-black dark:text-white
              border-gray-300 dark:border-gray-600
              hover:bg-gray-100 dark:hover:bg-gray-700
            "
          >
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`
                px-3 py-1 border rounded cursor-pointer
                border-gray-300 dark:border-gray-600
                ${currentPage === page
                  ? "bg-[#F6BA26] text-white dark:text-gray-900"
                  : "bg-white dark:bg-gray-800 text-[#F6BA26] dark:text-[#F6BA26] hover:bg-[#F6BA26]/10 dark:hover:bg-gray-700"
                }
              `}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="
              px-3 py-1 border rounded disabled:opacity-40 cursor-pointer
              bg-white dark:bg-gray-800
              text-black dark:text-white
              border-gray-300 dark:border-gray-600
              hover:bg-gray-100 dark:hover:bg-gray-700
            "
          >
            Siguiente
          </button>

        </div>
      )}
    </div>
  );
};
