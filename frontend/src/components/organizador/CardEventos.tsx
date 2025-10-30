import React from "react";
import { Calendar, MoreVertical, Plus } from "lucide-react";

// Tipos
export type EstadoEventoUI = "Publicado" | "Borrador" | "En revisión";

interface EventoItem {
  nombre: string;
  fecha: string; // ISO o YYYY-MM-DD para el ejemplo
  estado: EstadoEventoUI;
}

// Datos de ejemplo
const eventos: EventoItem[] = [
  { nombre: "Concierto de Rock 2025", fecha: "2025-03-15", estado: "Publicado" },
  { nombre: "Festival de Jazz", fecha: "2025-04-20", estado: "Borrador" },
  { nombre: "Noche de Salsa", fecha: "2025-05-10", estado: "En revisión" },
];

// Función para clases de badge según estado
function getBadgeClass(estado: EstadoEventoUI): string {
  switch (estado) {
    case "Publicado":
      return "bg-black text-white rounded-full px-3 py-1 text-sm";
    case "Borrador":
      return "bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm";
    case "En revisión":
      return "border border-gray-300 text-gray-700 rounded-full px-3 py-1 text-sm";
    default:
      return "rounded-full px-3 py-1 text-sm";
  }
}

const CardEventos: React.FC = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        {/* Izquierda: ícono + títulos */}
        <div className="flex items-start gap-3">
          <div className="mt-1 text-gray-700">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Publicar y gestionar eventos
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Crea, edita y elimina eventos del sistema.
            </p>
          </div>
        </div>

        {/* Derecha: botón "Nuevo evento" */}
        <button
          type="button"
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo evento</span>
        </button>
      </div>

      {/* Contenido: lista + tabla */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Lista de eventos</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium">Nombre del evento</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {eventos.map((ev) => (
                <tr key={`${ev.nombre}-${ev.fecha}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{ev.nombre}</td>
                  <td className="px-4 py-3 text-gray-700">{ev.fecha}</td>
                  <td className="px-4 py-3">
                    <span className={getBadgeClass(ev.estado)}>{ev.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center p-2 rounded hover:bg-gray-100 text-gray-600"
                      aria-label={`Acciones para ${ev.nombre}`}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default CardEventos;
