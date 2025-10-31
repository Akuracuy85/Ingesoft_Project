import TarifasCard from "./TarifasCard";
import ZonasCard from "./ZonasCard";
import TerminosCard from "./TerminosCard";
import DocumentosCard from "./DocumentosCard";

export default function ConfiguracionEvento() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <TarifasCard />
      <ZonasCard />
      <TerminosCard />
      <DocumentosCard />
    </div>
  );
}

