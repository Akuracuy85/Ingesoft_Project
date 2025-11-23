import React from "react";
import type { Event } from "../../../../../models/Event";
import { EventCard } from "./EventCard";
import { useState, useRef, useMemo, useLayoutEffect } from "react";

interface EventListProps {
  events: Event[];
}

export const EventList: React.FC<EventListProps> = ({ events }) => {
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const listRef = useRef<HTMLDivElement | null>(null);
  const scrollAnimRef = useRef<number | null>(null);

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return events.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, events]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useLayoutEffect(() => {
    if (scrollAnimRef.current) {
      cancelAnimationFrame(scrollAnimRef.current);
      scrollAnimRef.current = null;
    }

    const headerEl = document.querySelector("header");
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
    const extraOffset = 100;

    const heading = document.getElementById("proximos-eventos");
    let target = 0;
    if (heading) {
      const rect = heading.getBoundingClientRect();
      target = window.scrollY + rect.top - headerHeight - extraOffset;
    } else if (listRef.current) {
      const rect = listRef.current.getBoundingClientRect();
      target = window.scrollY + rect.top - headerHeight - extraOffset;
    }

    const doc = document.documentElement;
    const docScrollHeight = doc ? doc.scrollHeight : document.body.scrollHeight;
    const startY = Math.max(0, docScrollHeight - window.innerHeight);

    const duration = 650;
    let startTime: number | null = null;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const diff = target - startY;

    window.scrollTo(0, startY);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, Math.round(startY + diff * eased));
      if (elapsed < duration) {
        scrollAnimRef.current = requestAnimationFrame(step);
      } else {
        scrollAnimRef.current = null;
      }
    };

    scrollAnimRef.current = requestAnimationFrame(step);

    return () => {
      if (scrollAnimRef.current) {
        cancelAnimationFrame(scrollAnimRef.current);
        scrollAnimRef.current = null;
      }
    };
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

