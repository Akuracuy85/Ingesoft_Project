import React, { useState } from "react";
import { createPortal } from "react-dom";
import PagoNiubiz from "./PagoNiubiz";
import PagoYape from "./PagoYape";

import LogoYape from "@/assets/yape-logo.png";
import LogoUnite from "@/assets/Logo_Unite.svg";

interface SelectorPagoProps {
  monto: number;
  pendingOrderId: number | null;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const SelectorPago: React.FC<SelectorPagoProps> = ({
  monto,
  pendingOrderId,
  onConfirm,
  onClose,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [openPopup, setOpenPopup] = useState(false);

  const handleContinue = () => {
    if (!selectedPaymentMethod) return;
    setOpenPopup(true);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-transparent backdrop-blur-sm">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>

        <img
          src={LogoUnite}
          alt="Logo"
          className="mb-4 w-32 mx-auto"
        />
        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
          Elige un medio de pago:
        </h2>

        <div className="flex flex-col gap-4 w-full">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="tarjeta"
              checked={selectedPaymentMethod === "tarjeta"}
              onChange={() => setSelectedPaymentMethod("tarjeta")}
            />
            <span>Tarjeta de crédito y débito</span>
            <div className="flex justify-center gap-3 mt-2 opacity-80">
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" className="h-5" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" className="h-5" />
            </div>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="yape"
              checked={selectedPaymentMethod === "yape"}
              onChange={() => setSelectedPaymentMethod("yape")}
            />
            <span>Pago con Yape</span>
            <img src={LogoYape} className="w-8" />
          </label>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedPaymentMethod}
          className="bg-purple-600 hover:bg-purple-700 text-white w-full mt-4 py-2 rounded-md disabled:opacity-50"
        >
          Continuar
        </button>
      </div>

      {openPopup && selectedPaymentMethod === "tarjeta" && pendingOrderId && (
        <PagoNiubiz total={monto} onClose={onClose} onConfirm={onConfirm} />
      )}

      {openPopup && selectedPaymentMethod === "yape" && pendingOrderId && (
        <PagoYape monto={monto} onClose={onClose} onConfirm={onConfirm} />
      )}
    </div>,
    document.body
  );
};

export default SelectorPago;
