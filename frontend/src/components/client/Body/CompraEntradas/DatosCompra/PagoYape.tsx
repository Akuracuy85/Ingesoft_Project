import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LogoYape from "@/assets/yape-logo.png";
import LogoUnite from "@/assets/Logo_Unite.svg";

const PagoYape: React.FC<{ monto: number; onClose: () => void; onConfirm: () => Promise<void> }> = ({
  monto,
  onClose,
  onConfirm,
}) => {
  const [celular, setCelular] = useState("");
  const [codigo, setCodigo] = useState("");
  const [buttonAvailable, setButtonAvailable] = useState(true);
  const handleConfirm = async () =>{
    setButtonAvailable(false);
    await onConfirm();
    setButtonAvailable(true);
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-sm p-8 relative dark:bg-gray-800 dark:text-gray-100">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white text-2xl font-bold"
        >
          ×
        </button>

        <img src={LogoUnite} className="mb-4 w-32 mx-auto" />

        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center dark:text-gray-100">
          Ingresa tu celular Yape
        </h2>

        <Input
          type="text"
          placeholder="949 930 037"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
          maxLength={9}
          className="mb-4"
        />

        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center dark:text-gray-100">
          Código de aprobación
        </h2>

        <div className="grid grid-cols-6 gap-2 mb-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Input
              key={index}
              maxLength={1}
              value={codigo[index] || ""}
              className="text-center"
              onChange={(e) => {
                const newCodigo = codigo.split("");
                newCodigo[index] = e.target.value;
                setCodigo(newCodigo.join(""));
              }}
            />
          ))}
        </div>

        <Button
          disabled={!buttonAvailable}
          onClick={handleConfirm}
          className="bg-[#772E9E] hover:bg-[#772E9E] text-white w-full"
        >
          Yapear S/ {monto.toFixed(2)}
        </Button>

        <img src={LogoYape} className="mt-5 w-20 mx-auto" />
      </div>
    </div>,
    document.body
  );
};

export default PagoYape;
