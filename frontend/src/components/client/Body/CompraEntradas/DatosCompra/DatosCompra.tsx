// ./DatosCompra.tsx

import React, { useState } from "react";
// ✅ Ruta de importación corregida (como en V2)
import type { SummaryItem } from "../Tickets/SelectionSummaryTable";
import ResumenCompra from "./ResumenCompra";

// ✅ Lógica de V1: Imports del servicio y DTO
import CompraService from "../../../../../services/CompraService";
import { type CrearOrdenDto } from "../../../../../types/CrearOrdenDTO";

// ✅ Props de V1 (completas, con eventoId)
interface DatosCompraProps {
  eventoId: number;
  summaryItems: SummaryItem[];
  onBack: () => void;
  isUsingPoints: boolean;
}

interface Attendee {
  id: string; // ID único para el input (ej: "VIP-0")
  zona: string; // Nombre de la zona (ej: "VIP")
  label: string;
}

// ✅ Props de V1 (completas, con eventoId)
const DatosCompra: React.FC<DatosCompraProps> = ({
  eventoId,
  summaryItems,
  onBack,
  isUsingPoints
}) => {

  // --- Estados ---
  // ✅ Estados de V1 (incluye isLoading)
  const [dniValues, setDniValues] = useState<Record<string, string>>({});
  const [conadisCodes, setConadisCodes] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Lógica de Mapeo de Asistentes ---
  // (Combinación de V1 y V2)
  const allAttendees: Attendee[] = summaryItems.flatMap((item) =>
    Array(item.cantidad)
      .fill(null)
      .map((_, index) => ({
        id: `${item.zona}-${index}`,
        zona: item.zona,
        label: `Asistente ${index + 1} (${item.zona})`,
      }))
  );

  // ✅ Lógica de V2 para la vista condicional
  const conadisAttendees = allAttendees.filter((att) =>
    att.zona.toUpperCase().includes("CONADIS")
  );

  // --- Handlers ---
  // ✅ Handlers explícitos (como en V2, pero compatibles con V1)
  const handleDniChange = (id: string, value: string) => {
    setDniValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleConadisChange = (id: string, value: string) => {
    setConadisCodes((prev) => ({ ...prev, [id]: value }));
  };

  // --- Submit Handler ---
  // ✅ Lógica COMPLETA de V1 para el envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert("Debes aceptar los términos y condiciones.");
      return;
    }

    // 1. Validaciones básicas antes de enviar
    const allDnisFilled = allAttendees.every(att => dniValues[att.id] && dniValues[att.id].trim() !== '');
    if (!allDnisFilled) {
        alert("Por favor, complete todos los campos de DNI.");
        return;
    }

    setIsLoading(true);

    // 2. Mapear DNI por Zona
    const dnisPorZona: Record<string, string[]> = allAttendees.reduce((acc, attendee) => {
      const dni = dniValues[attendee.id];
      if (dni) {
        if (!acc[attendee.zona]) {
          acc[attendee.zona] = [];
        }
        acc[attendee.zona].push(dni);
      }
      return acc;
    }, {} as Record<string, string[]>);

    // Construir el array 'items' del DTO usando los zonaId del SummaryItem
    // NOTA: La lógica de V1 recolecta CONADIS pero no los envía en el payload.
    // Se mantiene esa lógica aquí.
    const items = summaryItems.map(summaryItem => {
      const dnis = dnisPorZona[summaryItem.zona] || [];

      return {
        zonaId: summaryItem.zonaId,
        dnis: dnis,
      };
    });

    // 3. Crear el DTO final
    const payload: CrearOrdenDto = {
      eventoId: eventoId, // ✅ Ya es number
      items: items.filter(item => item.dnis.length > 0)
    };

    // 4. Llamada al servicio
    try {
      const response = await CompraService.crearOrden(payload);

      // 5. Éxito y Redirección
      alert(`¡Orden ${response.ordenId} creada! Redirigiendo a pago...`);
      window.location.href = response.paymentUrl;

    } catch (error: any) {
      const errorMessage = error.message || error.response?.data?.message || "Error desconocido al crear la orden.";
      console.error("Error al crear la orden:", error);
      alert(`Error en la compra: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renderizado ---
  // ✅ JSX Base de V2
  return (
    // (Añadí py-8 de V1 para mantener el espaciado)
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8 py-8">
      
      {/* Columna Izquierda: Formulario (Diseño V2) */}
      <form onSubmit={handleSubmit} className="flex-1">
        
        {/* Flecha para volver (Diseño V2) */}
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

        {/* --- Sección 1: DNI de Asistentes (Diseño V2) --- */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            ① Identificación de Asistentes
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Coloque los números de identificación (DNI) de las personas que asistirán al evento:
          </p>
          <div className="space-y-4">
            {/* Lógica de loop de V2 (correcta) */}
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
                          // ✅ Handler de V2 (compatible con V1)
                          onChange={(e) => handleDniChange(attendee.id, e.target.value)}
                          placeholder="Ingrese DNI"
                          // ✅ Clases de V2
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-700 focus:border-yellow-700"
                          required // DNI es requerido (lógica V1)
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Sección 2: Códigos CONADIS (Diseño V2) --- */}
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
                    // ✅ Handler de V2
                    onChange={(e) => handleConadisChange(attendee.id, e.target.value)}
                    placeholder="Ingrese código"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-700 focus:border-yellow-700"
                    // ✅ ELIMINADO 'required' de V2, para coincidir con la lógica de V1 (CONADIS es opcional)
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Checkbox y Botón (Diseño V2 + Lógica V1) --- */}
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
              {/* ✅ Texto de V1 (con markdown) */}
              Declaro que he leído y acepto los **términos y condiciones** de Unite.
            </label>
          </div>
          <button
            type="submit"
            // ✅ Lógica de 'disabled' de V1
            disabled={!termsAccepted || isLoading}
            // ✅ Clases de V1 (con transition)
            className="w-full bg-yellow-700 text-white px-6 py-3 rounded-lg shadow font-semibold hover:bg-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
          >
            {/* ✅ Texto condicional de V1 */}
            {isLoading ? "Procesando la Orden..." : "PAGAR Y CONTINUAR"}
          </button>
        </div>
      </form>

      {/* Columna Derecha: Resumen (Diseño V2) */}
      <div className="w-full md:w-1/3">
        <ResumenCompra
          summaryItems={summaryItems}
          isUsingPoints={isUsingPoints}
        />
        {/* ✅ Se omite el botón duplicado 'Volver' de V1, siguiendo el diseño más limpio de V2 */}
      </div>
    </div>
  );
};

export default DatosCompra;