// ./DatosCompra.tsx

import React, { useState } from "react";
// ✅ Corregí la ruta de importación según tu segundo archivo
import type { SummaryItem } from "../Tickets/SelectionSummaryTable"; 
import ResumenCompra from "./ResumenCompra";

// ✅ 1. Interfaz actualizada con 'isUsingPoints'
interface DatosCompraProps {
  summaryItems: SummaryItem[];
  onBack: () => void;
  isUsingPoints: boolean; // Prop para el flujo de puntos
}

interface Attendee {
  id: string;
  zona: string;
  label: string;
}

// ✅ 2. Recibimos 'isUsingPoints' en los props
const DatosCompra: React.FC<DatosCompraProps> = ({ 
  summaryItems, 
  onBack, 
  isUsingPoints 
}) => {

  // --- Toda la lógica de estado y formulario de tu Versión 1 ---
  const [dniValues, setDniValues] = useState<Record<string, string>>({});
  const [conadisCodes, setConadisCodes] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const allAttendees: Attendee[] = summaryItems.flatMap((item) =>
    Array(item.cantidad)
      .fill(null)
      .map((_, index) => ({
        id: `${item.zona}-${index}`,
        zona: item.zona,
        label: `Asistente ${index + 1} (${item.zona})`,
      }))
  );

  const conadisAttendees = allAttendees.filter((att) =>
    att.zona.toUpperCase().includes("CONADIS")
  );

  const handleDniChange = (id: string, value: string) => {
    setDniValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleConadisChange = (id: string, value: string) => {
    setConadisCodes((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert("Debes aceptar los términos y condiciones.");
      return;
    }
    // Aquí puedes añadir validaciones (ej: que todos los DNIs estén llenos)
    console.log("Datos para enviar:", {
      dnis: dniValues,
      codigos: conadisCodes,
      total: summaryItems.reduce((acc, item) => acc + item.subtotal, 0),
    });
    alert("¡Compra realizada con éxito!");
  };
  // --- Fin de la lógica de la Versión 1 ---

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Columna Izquierda: Formulario (Completo, de tu Versión 1) */}
      <form onSubmit={handleSubmit} className="flex-1">
        {/* Flecha para volver */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>

        {/* --- Sección 1: DNI de Asistentes --- */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            ① Identificación de Asistentes
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Coloque los números de identificación (DNI) de las personas que asistirán al evento:
          </p>
          <div className="space-y-4">
            {summaryItems.map((zoneItem) => (
              <div key={zoneItem.zona}>
                <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-1 capitalize">
                  {zoneItem.zona.toLowerCase()}
                </h4>
                <div className="space-y-3 pl-2">
                  {allAttendees
                    .filter((attendee) => attendee.zona === zoneItem.zona)
                    .map((attendee) => (
                      <div key={attendee.id}>
                        <label htmlFor={`dni-${attendee.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                          {attendee.label}
                        </label>
                        <input
                          type="text"
                          id={`dni-${attendee.id}`}
                          value={dniValues[attendee.id] || ""}
                          onChange={(e) => handleDniChange(attendee.id, e.target.value)}
                          placeholder="Ingrese DNI"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-700 focus:border-yellow-700"
                          required
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Sección 2: Códigos CONADIS --- */}
        {conadisAttendees.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              ② Identificación de asistentes con CONADIS
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Coloque los códigos de CONADIS de las personas que asistirán al evento:
            </p>
            <div className="space-y-3">
              {conadisAttendees.map((attendee) => (
                <div key={attendee.id}>
                  <label htmlFor={`conadis-${attendee.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    {attendee.label}
                  </label>
                  <input
                    type="text"
                    id={`conadis-${attendee.id}`}
                    value={conadisCodes[attendee.id] || ""}
                    onChange={(e) => handleConadisChange(attendee.id, e.target.value)}
                    placeholder="Ingrese código"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-700 focus:border-yellow-700"
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Checkbox y Botón --- */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="h-4 w-4 text-yellow-700 border-gray-300 rounded focus:ring-yellow-600"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              Declaro que he leído y acepto los términos y condiciones de Unite.
            </label>
          </div>
          <button
            type="submit"
            disabled={!termsAccepted}
            className="w-full bg-yellow-700 text-white px-6 py-3 rounded-lg shadow font-semibold hover:bg-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Aceptar y continuar
          </button>
        </div>
      </form>

      {/* Columna Derecha: Resumen (¡MODIFICADO!) */}
      <div className="w-full md:w-1/3">
        {/* ✅ 3. Pasamos 'isUsingPoints' al ResumenCompra */}
        <ResumenCompra 
          summaryItems={summaryItems} 
          isUsingPoints={isUsingPoints}
        />
      </div>
    </div>
  );
};

export default DatosCompra;