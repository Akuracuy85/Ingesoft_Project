import React from "react";
import Header from "../../components/client/Header";
import ZoneTable from "../../components/client/ZoneTable";
import StepIndicator from "../../components/client/StepIndicator";
import type { Zone } from "../../types/Zone";
import type { Step } from "../../types/Step";
import Encabezado from "../../assets/EstadioImagen.png";

const zones: Zone[] = [
  { zona: "VIP", precio: 340 },
  { zona: "Campo A", precio: 240 },
  { zona: "Campo B", precio: 230 },
  { zona: "Norte", precio: 100 },
  { zona: "CONADIS", precio: 50 },
];

const steps: Step[] = [
  { title: "TICKETS" },
  { title: "DATOS DE COMPRA", number: 2 },
];

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* Pasos */}
      <div className="flex justify-center w-full mb-8">
        <div className="flex items-start w-3/5 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex-1 flex justify-center relative">
              <StepIndicator
                step={step}
                isLast={idx === steps.length - 1}
                isActive={idx === 0} // ✅ Primer paso activo
              />
            </div>
          ))}
        </div>
      </div>




      <main className="flex-1 w-full flex flex-col items-center bg-gray-50 px-8 py-6">
        {/* Encabezado */}
        <img
          src={Encabezado}
          alt="Encabezado"
          className="w-[400px] h-[500px] rounded-lg shadow-sm object-cover"
        />

        {/* Título */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Compra tus entradas 🎟️
        </h1>

        {/* Tabla de zonas */}
        <ZoneTable zones={zones} />

        {/* Botón */}
        <button className="mt-6 bg-yellow-700 text-white px-6 py-2 rounded-lg shadow hover:bg-yellow-800">
          Agregar
        </button>
      </main>
    </div>
  );
};

export default HomePage;