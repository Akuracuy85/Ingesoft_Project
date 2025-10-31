import ZonasYTarifasCard from "./ZonasYTarifasCard";
import TerminosCard from "./TerminosCard";
import DocumentosCard from "./DocumentosCard";

export default function ConfiguracionEvento() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Zonas y tarifas ocupa ambas columnas */}
      <div className="col-span-2">
        <ZonasYTarifasCard />
      </div>
      <TerminosCard />
      <DocumentosCard />
    </div>
  );
}
