import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormatearTarjeta, TipoDeTarjeta } from "@/utils/TarjetaUtils";
import type { Tarjeta } from "@/models/Tarjeta";
import { CreditCard } from "lucide-react";

interface PagoTarjetaGuardadaProps {
  tarjetas: Tarjeta[];
  monto: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onNuevaTarjeta: () => void;
}

const PagoTarjetaGuardada: React.FC<PagoTarjetaGuardadaProps> = ({
  tarjetas,
  monto,
  onClose,
  onConfirm,
  onNuevaTarjeta,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const handlePayWithSavedCard = async () => {
    if (!selectedCardId) return;
    const tarjetaSeleccionada = tarjetas.find((card) => card.id === selectedCardId);
    if (!tarjetaSeleccionada) return;

    setIsPaying(true);
    await onConfirm();
    setIsPaying(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-md p-8 relative border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-200 dark:hover:text-white text-2xl font-bold"
        >
          ×
        </button>

        {/* Encabezado */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-100">Elige una tarjeta guardada</h2>
          <p className="text-sm text-gray-600 dark:text-gray-200">Selecciona una tarjeta para realizar el pago.</p>
        </div>

        {/* Tarjetas guardadas */}
        <div className="space-y-4 max-h-75 overflow-y-auto">
          {tarjetas.length > 0 ? (
            tarjetas.map((card) => (
                <Card
                key={card.id}
                className={`cursor-pointer border ${
                  selectedCardId === card.id
                    ? "border-blue-500 dark:border-blue-400"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                onClick={() => setSelectedCardId(card.id!)}
              >
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {TipoDeTarjeta(card.numeroTarjeta)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <div
                    className={`w-12 h-8 bg-gradient-to-r rounded flex items-center justify-center ${
                      TipoDeTarjeta(card.numeroTarjeta) === "Visa"
                        ? "from-blue-500 to-blue-700"
                        : "from-red-600 to-orange-400"
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-200">{FormatearTarjeta(card.numeroTarjeta)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-200">Expira: {card.mesExp}/{card.anExp}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-200">No tienes tarjetas guardadas.</p>
          )}
        </div>

        {/* Botones */}
        <div className="mt-6 space-y-4">
          <Button
            disabled={!selectedCardId || isPaying}
            onClick={handlePayWithSavedCard}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            {isPaying ? "Procesando..." : `Pagar S/${monto.toFixed(2)}`}
          </Button>
          <Button
            disabled={isPaying}
            onClick={onNuevaTarjeta}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
          >
            Usar una nueva tarjeta
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PagoTarjetaGuardada;