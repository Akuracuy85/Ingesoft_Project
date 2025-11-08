import React, { useState } from "react";

interface PagoNiubizModalProps {
  total: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const PagoNiubizModal: React.FC<PagoNiubizModalProps> = ({ total, onClose, onConfirm }) => {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [fecha, setFecha] = useState("");
  const [cvv, setCvv] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const handlePay = async () => {
    if (!nombre || !correo || !tarjeta || !fecha || !cvv) {
      alert("Por favor, completa todos los campos del pago.");
      return;
    }

    setIsPaying(true);

    // Simulación del proceso de pago
    setTimeout(async () => {
      await onConfirm(); // Ejecuta la confirmación real
      setIsPaying(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <div className="text-center mb-4">
          <img src="/unite-logo.png" alt="Logo Unite" className="h-10 mx-auto mb-2" />
          <h2 className="text-xl font-semibold text-gray-800">Pago con Tarjeta</h2>
          <p className="text-gray-500 text-sm">Simulación de pago Niubiz</p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre y Apellido"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Número de tarjeta"
            value={tarjeta}
            onChange={(e) => setTarjeta(e.target.value.replace(/\D/g, ""))}
            maxLength={16}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="MM/AA"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              maxLength={5}
              className="w-1/2 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
              maxLength={3}
              className="w-1/2 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={isPaying}
          className="mt-6 w-full bg-indigo-600 text-white font-semibold rounded-lg py-2 hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {isPaying ? "Procesando..." : `Pagar S/${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default PagoNiubizModal;
