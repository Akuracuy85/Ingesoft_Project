import ZonasYTarifasCard from "./ZonasYTarifasCard";
import TerminosCard from "./TerminosCard";
import DocumentosCard from "./DocumentosCard";

interface EventoSeleccionadoProps {
  eventoId: number;
  nombre: string;
  descripcion?: string;
  fecha: string;
  hora?: string;
  lugar?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  estado: string; // UI estado
}

export default function ConfiguracionEvento({ evento }: { evento: EventoSeleccionadoProps }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Zonas y tarifas ocupa ambas columnas */}
      <div className="col-span-2">
        <ZonasYTarifasCard eventoId={evento.eventoId} eventoEstadoUI={evento.estado} eventoNombre={evento.nombre} />
      </div>
      <TerminosCard eventoId={evento.eventoId} />
      <DocumentosCard eventoId={evento.eventoId} />
    </div>
  );
}
