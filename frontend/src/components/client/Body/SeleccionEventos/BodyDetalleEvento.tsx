import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import mapaAsientos from "@/assets/EstadioImagen2.png";
import { useEventoDetalle } from "@/hooks/useEventoDetalle";

interface Tarifa {
  tipo: string;
  precio: number;
}

interface Zona {
  id: number;
  nombre: string;
  tarifas?: Tarifa[];
}

interface ArtistaDetalle {
  nombre: string;
}

interface EventoDetalle {
  nombre: string;
  imagenBanner: string | null;
  fechaEvento: string;
  departamento: string;
  provincia: string;
  distrito: string;
  artista: ArtistaDetalle | null;
  zonas: Zona[];
}

export const BodyDetalleEvento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventoId = Number(id);
  const navigate = useNavigate();

  const { evento, isLoading, error } = useEventoDetalle(eventoId) as {
    evento: EventoDetalle | null;
    isLoading: boolean;
    error: string | null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Cargando evento...
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        {error || "No se encontró el evento solicitado."}
      </div>
    );
  }

  const zonas = evento.zonas || [];

  // Determinamos dinámicamente todos los tipos de tarifa existentes
  const tiposTarifas = Array.from(
    new Set(
      zonas.flatMap((z) => (z.tarifas ? z.tarifas.map((t) => t.tipo) : []))
    )
  );

  const horaEvento = new Date(evento.fechaEvento).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Ahora el tipo de compra se pasa dinámicamente
  const handleCompraClick = (tipo: string) => {
    navigate(`/eventos/${eventoId}/compra`, {
      state: { evento, tipoTarifa: tipo },
    });
  };

  return (
    <main className="w-full overflow-x-hidden">
      {/* === SECCIÓN 1: DETALLES DEL EVENTO === */}
      <section
        className="relative bg-cover bg-center bg-no-repeat text-white px-4 sm:px-8 md:px-16 lg:px-20 xl:px-32 py-32 min-h-[85vh] overflow-x-hidden overflow-y-hidden"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
              {evento.nombre}
            </h1>
            <h2 className="text-2xl md:text-4xl font-bold leading-tight drop-shadow-lg">
              {evento.artista?.nombre || "Artista invitado"}
            </h2>
            <p className="mt-6 text-lg md:text-xl text-gray-200">
              <span className="font-semibold">
                {new Date(evento.fechaEvento).toLocaleDateString("es-PE", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <br />
              {`${evento.departamento}, ${evento.provincia}, ${evento.distrito}`}
              <br />
              {horaEvento}
            </p>
          </div>
        </div>
      </section>

      {/* === SECCIÓN 2: MAPA Y TARIFAS === */}
      <div className="bg-[#fff4ea] px-4 md:px-12 pt-10 pb-16 w-full">
        <section className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-24">
          {/* Mapa */}
          <div className="w-full lg:w-1/2 flex justify-center p-4 bg-transparent rounded-lg shadow-none">
            {mapaAsientos ? (
              <img
                src={mapaAsientos}
                alt="Mapa de Asientos"
                className="w-full max-w-md object-contain mix-blend-multiply"
              />
            ) : (
              <div className="w-full max-w-md h-80 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                [Imagen del Mapa de Asientos]
              </div>
            )}
          </div>

          {/* Tabla de tarifas dinámica */}
          <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-md overflow-x-auto mt-12 lg:ml-[-40px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ZONA
                  </th>
                  {tiposTarifas.map((tipo) => (
                    <th
                      key={tipo}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {tipo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {zonas.length > 0 ? (
                  zonas.map((zona) => (
                    <tr key={zona.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {zona.nombre}
                      </td>
                      {tiposTarifas.map((tipo) => {
                        const tarifa = zona.tarifas?.find(
                          (t) => t.tipo.toLowerCase() === tipo.toLowerCase()
                        );
                        return (
                          <td
                            key={tipo}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                          >
                            {tarifa
                              ? `S/ ${tarifa.precio.toFixed(2)}`
                              : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={1 + tiposTarifas.length}
                      className="text-center py-6 text-gray-500 text-sm"
                    >
                      No hay zonas disponibles para este evento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* === SECCIÓN 3: COMPRA === */}
      <div className="bg-white px-4 md:px-12 py-16 w-full">
        <section className="text-center py-16">
          <motion.h2
            className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight mb-10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false }}
          >
            Elige el tipo de entrada para{" "}
            {evento.artista?.nombre || "el artista"} <br />
            en {evento.distrito || "el lugar del evento"}
          </motion.h2>

          {/* Botones dinámicos por tipo de tarifa */}
          <motion.div
            className="flex flex-wrap justify-center gap-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false }}
          >
            {tiposTarifas.map((tipo) => (
              <button
                key={tipo}
                onClick={() => handleCompraClick(tipo)}
                className="px-10 py-4 bg-black text-white text-lg font-semibold rounded-md hover:bg-gray-800 transition-colors"
              >
                Comprar {tipo}
              </button>
            ))}
          </motion.div>
        </section>
      </div>
    </main>
  );
};

export default BodyDetalleEvento;
