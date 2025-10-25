import React from "react";
import { FeaturedEvent } from "./Banner/FeaturedEvent";
import { EventList } from "./EventList/EventList";
import { eventosMock } from "../../../data/eventosMock";

export const BodySeleccionEventos: React.FC = () => {
  return (
    <main className="flex flex-col w-full items-center justify-start bg-white text-black">
      {/* 🟢 Slider de eventos destacados */}
      <FeaturedEvent events={eventosMock} />

      {/* 🔹 Lista completa de eventos */}
      <section className="w-full max-w-6xl flex flex-col gap-8 p-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Próximos eventos
        </h2>
        <EventList events={eventosMock} />
      </section>
    </main>
  );
};