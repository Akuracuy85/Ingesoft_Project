import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import mapaAsientosDefault from "@/assets/EstadioImagen.png";
import { useEventoDetalle } from "@/hooks/useEventoDetalle";
import type { Zone } from "@/models/Zone";
import type { Tarifa } from "@/models/Tarifa";
import { useAuth } from "@/hooks/useAuth";
import NotificationService from "@/services/NotificationService";
import PerfilService from "@/services/PerfilService";
import Loading from "@/components/common/Loading";
import CompraService from "@/services/CompraService";

interface ArtistaDetalle {
  id: number;
  nombre: string;
}

interface EventoDetalle {
  nombre: string;
  imageBanner: string | null;
  imageLugar: string | null;
  date: string;
  departamento: string;
  provincia: string;
  distrito: string;
  artist: ArtistaDetalle | null;
  zonas: Zone[];
  time: string | null;
  lugar: string | null;
  title: string | null;
}

// Helpers
const formatDMY = (iso: string) => {
  if (!iso) return "";
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(iso));
};

const isTarifaActiva = (tarifa?: Tarifa | null) => {
  if (!tarifa) return false;
  const now = new Date();
  const fechaFin = new Date(tarifa.fechaFin);
  fechaFin.setHours(23, 59, 59, 999);
  return new Date(tarifa.fechaInicio) <= now && now <= fechaFin;
};

const isZonaAgotada = (zona: Zone) =>
  zona.capacidad - zona.cantidadComprada <= 0;

export const BodyDetalleEvento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventoId = Number(id);
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const { evento, isLoading, error } = useEventoDetalle(eventoId) as {
    evento: EventoDetalle | null;
    isLoading: boolean;
    error: string | null;
  };

  if (isLoading) return <Loading fullScreen />;

  if (error || !evento) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        {error || "No se encontró el evento solicitado."}
      </div>
    );
  }

  const zonas: Zone[] = evento.zonas || [];
  const tiposTarifas = Array.from(
    new Set(
      zonas.flatMap((z) => {
        const tipos: string[] = [];
        if (z.tarifaPreventa) tipos.push("Preventa");
        if (z.tarifaNormal) tipos.push("Normal");
        return tipos;
      })
    )
  );

  const horaEvento = evento.time || "";

  const primeraZonaConPreventa = zonas.find((z) => z.tarifaPreventa);
  const primeraZonaConNormal = zonas.find((z) => z.tarifaNormal);

  const rangoPreventa = primeraZonaConPreventa?.tarifaPreventa || null;
  const rangoNormal = primeraZonaConNormal?.tarifaNormal || null;

  const handleColaClick = async (tipo: string) => {
    if (!isLoggedIn) {
      NotificationService.warning("Debes iniciar sesión para comprar entradas");
      navigate("/login");
      return;
    }

    if (user?.rol !== "CLIENTE") {
      NotificationService.warning("Solo los clientes pueden comprar entradas");
      return;
    }

    // Preventa: validar puntos
    if (tipo === "Preventa") {
      let minPuntosRequeridos = 99999;

      zonas.forEach((z) => {
        const puntosRequeridos = Math.ceil(
          (z.tarifaPreventa?.precio ?? 99999) * 0.3
        );
        minPuntosRequeridos = Math.min(minPuntosRequeridos, puntosRequeridos);
      });

      const puntos = await PerfilService.getPuntos();

      if (minPuntosRequeridos > (puntos.totalPoints ?? 0)) {
        NotificationService.warning(
          `Necesitas al menos ${minPuntosRequeridos} puntos para comprar en Preventa`
        );
        return;
      }
    }

    const cantidad = await CompraService.getCantidadEntradasPorEvento(Number(id));
    if ((cantidad ?? 0) >= 4) {
      NotificationService.warning("Ya tienes 4 entradas para este evento");
      return;
    }

    navigate(`/cola`, { state: { evento, tipoTarifa: tipo } });
  };

  const formatFechaLarga = (iso: string) => {
    if (!iso) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      iso = iso + "T05:00:00Z";
    }
    const d = new Date(iso);

    return d.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main className="w-full overflow-x-hidden dark:text-gray-100">

      {/* ===== BANNER ===== */}
      <section
        className="
          relative bg-cover bg-center bg-no-repeat 
          text-white px-4 sm:px-8 md:px-16 lg:px-20 xl:px-32 
          py-32 min-h-[85vh]
        "
        style={{
          backgroundImage: `url(${
            evento.imageBanner ||
            "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2"
          })`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-transparent dark:from-black/70 dark:via-black/40 dark:to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">

            {/* TÍTULO = NOMBRE DEL EVENTO */}
            <h1 className="text-4xl md:text-6xl font-extrabold">
              {evento.title}
            </h1>

            {/* Artista (solo si existe) */}
            {evento.artist?.nombre && (
              <h2 className="text-3xl md:text-5xl font-bold mt-4">
                 {evento.artist.nombre}
              </h2>
            )}

            <p className="mt-6 text-lg md:text-3xl text-gray-200 dark:text-gray-300 space-y-2">

              📅 <span className="font-semibold">{formatFechaLarga(evento.date)}</span>
              <br />

              {evento.lugar && (
                <>
                  🏟 <span className="font-semibold">{evento.lugar}</span>
                  <br />
                </>
              )}

              📍 {evento.distrito}, {evento.provincia}
              <br />

              🕐 {horaEvento}
            </p>

          </div>
        </div>
      </section>

      {/* ===== MAPA + TABLA DE TARIFAS ===== */}
      <div className="bg-[#fff4ea] dark:bg-[#0F1424] px-4 md:px-12 pt-10 pb-16">

        <section className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-24">

          {/* Imagen del lugar (CORREGIDO) */}
          <div className="w-full lg:w-1/2 flex justify-center p-4">
            <img
              src={evento.imageLugar || mapaAsientosDefault}
              alt="Lugar del Evento"
              className="
                w-full max-w-md rounded-lg object-contain 
                mix-blend-multiply dark:mix-blend-normal
                transition-transform duration-300 hover:scale-105
              "
            />
          </div>

          {/* Tabla */}
          <div className="
            w-full lg:w-[75%] bg-white dark:bg-gray-800 
            rounded-lg shadow-md overflow-x-auto 
            mt-40 ml-[-20px]
          ">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-10 py-3 text-center text-lg font-medium text-gray-600 dark:text-gray-200 uppercase">
                    ZONA
                  </th>

                  {tiposTarifas.map((tipo) => (
                    <th
                      key={tipo}
                      className="px-10 py-3 text-center text-lg font-medium text-gray-600 dark:text-gray-200 uppercase"
                    >
                      {tipo.toUpperCase()}

                      {tipo === "Preventa" && rangoPreventa && (
                        <div className="text-xs md:text-sm text-gray-400 dark:text-gray-300 mt-1">
                          ({formatDMY(rangoPreventa.fechaInicio)} →
                          {formatDMY(rangoPreventa.fechaFin)})
                        </div>
                      )}

                      {tipo === "Normal" && rangoNormal && (
                        <div className="text-xs md:text-sm text-gray-400 dark:text-gray-300 mt-1">
                          ({formatDMY(rangoNormal.fechaInicio)} →
                          {formatDMY(rangoNormal.fechaFin)})
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {zonas.length > 0 ? (
                  zonas.map((zona) => (
                    <tr
                      key={zona.id}
                      className="hover:bg-orange-100 dark:hover:bg-gray-700"
                    >
                      <td className="px-10 py-4 text-center text-xl text-gray-900 dark:text-gray-100 font-medium">
                        {zona.nombre}
                      </td>

                      <td className="px-10 py-4 text-center text-xl">
                        {zona.tarifaPreventa
                          ? `S/ ${zona.tarifaPreventa.precio.toFixed(2)}`
                          : "—"}
                      </td>

                      <td className="px-10 py-4 text-center text-xl">
                        {zona.tarifaNormal
                          ? `S/ ${zona.tarifaNormal.precio.toFixed(2)}`
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={1 + tiposTarifas.length}
                      className="text-center py-6 text-gray-500 dark:text-gray-300 text-xl"
                    >
                      No hay zonas disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </section>
      </div>

      {/* ===== SECCIÓN COMPRA ===== */}
      <div className="bg-white dark:bg-gray-900 px-4 md:px-12 py-16">

        <section className="text-center py-16">
          <motion.h2
            className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight mb-10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Compra tus entradas para {evento.title?.trim()} <br /> en {evento.distrito}
          </motion.h2>

          <motion.div
            className="flex flex-wrap justify-center gap-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {tiposTarifas.map((tipo) => {
              const tarifa =
                tipo === "Preventa" ? rangoPreventa : rangoNormal;

              const activo = tarifa && isTarifaActiva(tarifa);
              const agotado = zonas.some(isZonaAgotada);
              const disabled = !activo || agotado;

              return (
                <button
                  key={tipo}
                  onClick={() => !disabled && handleColaClick(tipo)}
                  disabled={disabled}
                  className={`
                    px-10 py-4 rounded-md text-lg font-semibold
                    ${disabled ? "bg-gray-400 cursor-not-allowed text-white" 
                               : "bg-black dark:bg-gray-700 text-white hover:bg-gray-900 dark:hover:bg-gray-600 cursor-pointer"}
                  `}
                >
                  Comprar {tipo}
                </button>
              );
            })}
          </motion.div>

        </section>
      </div>

    </main>
  );
};

export default BodyDetalleEvento;
