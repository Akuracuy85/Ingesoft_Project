import React from "react";
import ZonasYTarifasCard, { type ZonasYTarifasCardProps } from "./ZonasYTarifasCard";
import TerminosCard from "./TerminosCard";
import DocumentosCard from "./DocumentosCard";

export default function ConfiguracionEvento({ eventoId }: { eventoId: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Zonas y tarifas ocupa ambas columnas */}
      <div className="col-span-2">
        <ZonasYTarifasCard eventoId={eventoId} />
      </div>
      <TerminosCard />
      <DocumentosCard />
    </div>
  );
}
