import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logoUnite from "@/assets/Logo_Unite.svg";
import mapaAsientos from "@/assets/EstadioImagen2.png";
import { Footer } from "@/components/client/Footer/Footer";
import { useEventoDetalle } from "@/hooks/useEventoDetalle";

export const PaginaCompraEvento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventoId = Number(id);
  const navigate = useNavigate();

  const { evento, isLoading, error } = useEventoDetalle(eventoId);

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

  // ✅ Imagen del banner en base64
  const bannerUrl = evento.imagenBanner
    ? `data:image/jpeg;base64,${evento.imagenBanner}`
    : undefined;

  // ✅ Zonas disponibles
  const zonas = evento.zonas || [];

  // ✅ Hora obtenida desde fechaEvento
  const horaEvento = new Date(evento.fechaEvento).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // 🟠 Función para ir a la página de compra
  const handleCompraClick = () => {
    navigate(`/eventos/${eventoId}/compra`, {
      state: { evento }, // Pasamos los datos del evento al flujo de compra
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HEADER ===== */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/eventos">
            <img
              src={logoUnite}
              alt="Logo Unite"
              className="h-10 w-auto cursor-pointer hover:opacity-90 transition-opacity"
            />
          </Link>
        </div>

        <div className="space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-white bg-[#e58c00] rounded-md hover:bg-[#d47d00]"
          >
            Iniciar Sesión
          </Link>

          <Link
            to="/registro"
            className="px-4 py-2 text-sm font-semibold text-[#e58c00] border border-[#e58c00] rounded-md hover:bg-[#fff6ef]"
          >
            Registrarse
          </Link>
        </div>
      </header>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main>
        {/* === SECCIÓN 1: DETALLES DEL EVENTO === */}
        <section
          className="relative bg-cover bg-center bg-no-repeat text-white px-6 py-50 md:px-24 min-h-[85vh]"
          style={{
            backgroundImage: `url(${bannerUrl || "/placeholder-banner.jpg"})`,
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

        {/* === SECCIÓN 2: MAPA Y PRECIOS === */}
        <div className="bg-[#fff4ea] px-4 pt-10 pb-16 md:px-24">
          <section className="flex flex-col md:flex-row items-start justify-between gap-12">
            {/* Mapa del lugar */}
            <div className="w-full md:w-1/2 flex justify-center p-4 bg-transparent rounded-lg shadow-none">
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

            {/* Tabla de precios */}
            <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md overflow-hidden mt-8 md:mt-25">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ZONA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PRECIO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CAPACIDAD
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {zonas.length > 0 ? (
                    zonas.map((zona: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {zona.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {zona.costo
                            ? `S/ ${zona.costo.toFixed(2)}`
                            : "Consultar tarifa"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {zona.capacidad}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
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
        <div className="bg-white px-4 py-16 md:px-24">
          <section className="text-center py-16">
            <motion.h2
              className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight mb-10"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: false }}
            >
              Consigue tus tickets para ver{" "}
              {evento.artista?.nombre || "al artista"} <br />
              en {evento.distrito || "el lugar del evento"}
            </motion.h2>

            <motion.div
              className="flex flex-col md:flex-row justify-center gap-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: false }}
            >
              <button
                onClick={handleCompraClick}
                className="px-12 py-4 bg-black text-white text-lg font-bold rounded-md hover:bg-gray-800 transition-colors"
              >
                Comprar Entrada
              </button>
            </motion.div>
          </section>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <Footer />
    </div>
  );
};

export default PaginaCompraEvento;
