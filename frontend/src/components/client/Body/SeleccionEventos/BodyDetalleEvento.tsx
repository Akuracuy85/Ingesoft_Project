import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import mapaAsientos from "@/assets/EstadioImagen2.png";
import { useEventoDetalle } from "@/hooks/useEventoDetalle";
import type { Zone } from "@/models/Zone";
import type { Tarifa } from "@/models/Tarifa";
import { useAuth } from "@/hooks/useAuth";
import NotificationService from "@/services/NotificationService";
import PerfilService from "@/services/PerfilService";
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
}

// Helpers
const formatDMY = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const isTarifaActiva = (tarifa?: Tarifa | null) => {
  if (!tarifa) return false;
  const now = new Date();
  return new Date(tarifa.fechaInicio) <= now && now <= new Date(tarifa.fechaFin);
};

const isZonaAgotada = (zona: Zone) =>
  zona.capacidad - zona.cantidadComprada <= 0;

export const BodyDetalleEvento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventoId = Number(id);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const { evento, isLoading, error } = useEventoDetalle(eventoId) as {
    evento: EventoDetalle | null;
    isLoading: boolean;
    error: string | null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg dark:text-gray-200">
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

    let tienePuntosParaEntrada = false;

    if (tipo === "Preventa") {
      let minPuntosRequeridos = 99999;

      zonas.forEach((z) => {
        const puntosRequeridos = Math.ceil(
          (z.tarifaPreventa?.precio ?? 99999) * 0.3
        );
        minPuntosRequeridos = Math.min(minPuntosRequeridos, puntosRequeridos);
      });

      const puntos = await PerfilService.getPuntos();

      if (minPuntosRequeridos <= (puntos.totalPoints ?? 0)) {
        tienePuntosParaEntrada = true;
      }

      if (!tienePuntosParaEntrada) {
        NotificationService.warning(
          "Necesitas al menos " +
            minPuntosRequeridos +
            " puntos para comprar una entrada en Preventa"
        );
        return;
      }
    }

    const cantidad = await CompraService.getCantidadEntradasPorEvento(Number(id));
    if((cantidad ?? 0) >= 4) {
      NotificationService.warning("Parece que ya tienes 4 entradas para este evento");
      return;
    }

    navigate(`/cola`, { state: { evento, tipoTarifa: tipo } });
  };

  const formatFechaLarga = (iso: string) => {
    if (!iso) return "";
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70 dark:to-black/80" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-6xl md:text-8xl font-extrabold">{evento.nombre}</h1>

            <h2 className="text-4xl md:text-6xl font-bold">
              {evento.artist?.nombre?.trim() || "Artista invitado"}
            </h2>

            <p className="mt-6 text-lg md:text-3xl text-gray-200 dark:text-gray-300">
              📅 <span className="font-semibold">{formatFechaLarga(evento.date)}</span>
              <br />
              {evento.lugar && (
                <>
                  📍 {evento.lugar}
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

      {/* Separador entre Sección 1 y Sección 2 */}
      <div className="h-8 bg-gradient-to-b from-black/30 to-[#fff4ea] dark:from-black/30 dark:to-[#0F1424]" />


      {/* ===== MAPA + TABLA DE TARIFAS ===== */}
      <div className="bg-[#fff4ea] dark:bg-[#0F1424] px-4 md:px-12 pt-10 pb-16">

        <section className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-24">

          {/* Imagen del mapa */}
          <div className="w-full lg:w-1/2 flex justify-center p-4">
            <img
              src={evento?.imageLugar ?? mapaAsientos}
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
                  <th className="px-10 py-3 text-center text-base md:text-lg font-medium text-gray-600 dark:text-gray-200 uppercase">
                    ZONA
                  </th>

                  {tiposTarifas.map((tipo) => (
                    <th
                      key={tipo}
                      className="px-10 py-3 text-center text-base md:text-lg font-medium text-gray-600 dark:text-gray-200 uppercase"
                    >
                      <div>{tipo.toUpperCase()}</div>

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
                      <td className="px-10 py-4 text-center text-lg md:text-xl text-gray-900 dark:text-gray-100 font-medium">
                        {zona.nombre}
                      </td>

                      <td className="px-10 py-4 text-center text-lg md:text-xl text-gray-700 dark:text-gray-200">
                        {zona.tarifaPreventa
                          ? `S/ ${zona.tarifaPreventa.precio.toFixed(2)}`
                          : "—"}
                      </td>

                      <td className="px-10 py-4 text-center text-lg md:text-xl text-gray-700 dark:text-gray-200">
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
                      className="text-center py-6 text-gray-500 dark:text-gray-300 text-lg md:text-xl"
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
      
      {/* Separador entre Sección 2 y Sección 3 */}
      <div className="h-8 bg-gradient-to-b from-[#fff4ea] to-white dark:from-[#151526] dark:to-gray-900" />
                  

      {/* ===== SECCIÓN COMPRA ===== */}
      <div className="bg-white dark:bg-gray-900 px-4 md:px-12 py-16">

        <section className="text-center py-16">
          <motion.h2
            className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight mb-10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Compra tus entradas para {evento.artist?.nombre?.trim()} <br />
            en {evento.distrito}
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
                    
                    ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                    ${
                      disabled
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-black dark:bg-gray-700 text-white hover:bg-gray-900 dark:hover:bg-gray-600"
                    }
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
