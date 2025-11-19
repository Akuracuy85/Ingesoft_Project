import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CompraExitosa: React.FC = () => {
  const navigate = useNavigate();

  const handleVolverEventos = () => {
    navigate("/eventos");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-[#c87b00] mb-4">
          ¡Compra Exitosa!
        </h1>
        <p className="text-gray-700 mb-6">
          Tu compra se ha realizado con éxito. Revisa tu correo para más
          detalles.
        </p>
        <Button onClick={handleVolverEventos} className="bg-[#c87b00] hover:bg-[#c87b00] cursor-pointer text-white">
          Volver a Eventos
        </Button>
      </div>
    </div>
  );
};

export default CompraExitosa;