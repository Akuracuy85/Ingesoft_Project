import React from "react";
import logoUnite from "@/assets/Logo_Unite.svg";
import mapaAsientos from "@/assets/EstadioImagen2.png";
import imagenBanner from "@/assets/artista-banner2.png";
import { motion } from "framer-motion";
import { Footer } from "@/components/client/Footer/Footer";
import { Link } from "react-router-dom";

export const PaginaCompraEvento: React.FC = () => {
  // Simulación de datos de precios
  const precios = [
    { zone: "PLATINUM CENTRAL", preventa: "S/ 550.00", general: "S/ 500.00" },
    { zone: "LATERAL", preventa: "S/ 500.00", general: "S/ 450.00" },
    { zone: "ORIENTE 1 / OCCIDENTE 1", preventa: "S/ 470.00", general: "S/ 420.00" },
    { zone: "ORIENTE 2 / OCCIDENTE 2", preventa: "S/ 460.00", general: "S/ 380.00" },
    { zone: "VIP", preventa: "S/ 440.00", general: "S/ 390.00" },
    { zone: "PREFERENCIAL", preventa: "S/ 350.00", general: "S/ 300.00" },
    { zone: "NORTE", preventa: "S/ 270.00", general: "S/ 220.00" },
  ];

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

      <main>
        {/* ===== SECCIÓN 1: DETALLES DEL EVENTO ===== */}
        <section
          className="relative bg-cover bg-center bg-no-repeat text-white px-6 py-50 md:px-24 min-h-[85vh]"
          style={{ backgroundImage: `url(${imagenBanner})` }}
        >
          {/* Capa de oscurecimiento más suave */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60"></div>

          {/* Información del concierto */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
                TOUR LÁMINA ONCE
                <br />
              </h1>
                <h2 className="text-2xl md:text-4xl font-bold leading-tight drop-shadow-lg">
                CUARTETO DE NOS
                <br/>
              </h2>
              <p className="mt-6 text-lg md:text-xl text-gray-200">
                <span className="font-semibold">SAB 08 NOV - DOM 09 NOV</span>
                <br />
                Lima, Perú
                <br />
                Estadio Nacional
                <br />
                07:00pm
              </p>
            </div>
          </div>
        </section>


        {/* ===== SECCIÓN 2: MAPA Y PRECIOS ===== */}
        <div className="bg-[#fff4ea] px-4 pt-10 pb-16 md:px-24">
          <section className="flex flex-col md:flex-row items-start justify-between gap-12">
            {/* Mapa de Asientos */}
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

            {/* Tabla de Precios */}
            <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md overflow-hidden mt-8 md:mt-25">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ZONA
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      PREVENTA
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      GENERAL
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {precios.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.zone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.preventa}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.general}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ===== SECCIÓN 3: Compra de entradas ===== */}
        <div className="bg-white px-4 py-16 md:px-24">
          <section className="text-center py-16">
            <motion.h2
              className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight mb-10"
              initial={{ opacity: 0, y: 40 }}       // Comienza invisible y más abajo
              whileInView={{ opacity: 1, y: 0 }}    // Aparece y sube al entrar al viewport
              transition={{ duration: 0.8, ease: "easeOut" }}  // Duración y suavidad
              viewport={{ once: false }}             // Solo se ejecuta una vez
            >
              Consigue tus tickets para ver al CUARTETO DE NOS
              <br />
              en el Estadio Nacional
            </motion.h2>

            <motion.div
              className="flex flex-col md:flex-row justify-center gap-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: false }}
            >
              <button className="px-12 py-4 bg-black text-white text-lg font-bold rounded-md hover:bg-gray-800 transition-colors">
                PREVENTA
              </button>
              <button className="px-12 py-4 bg-black text-white text-lg font-bold rounded-md hover:bg-gray-800 transition-colors">
                GENERAL
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
