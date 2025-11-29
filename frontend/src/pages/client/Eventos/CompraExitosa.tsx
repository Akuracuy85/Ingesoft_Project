import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCompraGuard } from "@/context/CompraGuardContext";


const CompraExitosa: React.FC = () => {
  const navigate = useNavigate();
  const { setIsCompraActive } = useCompraGuard();

  // 🔹 Desactivar isCompraActive al entrar en esta pantalla
  useEffect(() => {
    setIsCompraActive(false);
  }, [setIsCompraActive]);


  const handleVolverEventos = () => {
    navigate("/eventos");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white shadow-md rounded-lg p-8 text-center dark:bg-gray-800 dark:text-gray-100">
        <h1 className="text-2xl font-bold text-[#c87b00] mb-4">
          ¡Compra Exitosa!
        </h1>
        <p className="text-gray-700 dark:text-gray-200 mb-6">
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