// ./DatosCompra.tsx

import React, { useState } from "react";
import type { SummaryItem } from "../Tickets/SelectionSummaryTable"; 
import ResumenCompra from "./ResumenCompra";

// ✅ CAMBIO CLAVE: Importamos el nuevo servicio en lugar de axios
import CompraService from "../../../../../services/CompraService"; 
import { type CrearOrdenDto } from "../../../../../types/CrearOrdenDTO"; 


interface DatosCompraProps {
  eventoId: number; // ⬅️ ¡CORREGIDO! Ahora acepta 'number'
  summaryItems: SummaryItem[];
  onBack: () => void;
  isUsingPoints: boolean; 
}

interface Attendee {
  id: string; // ID único para el input (ej: "VIP-0")
  zona: string; // Nombre de la zona (ej: "VIP")
  label: string;
}

const DatosCompra: React.FC<DatosCompraProps> = ({ 
  eventoId, 
  summaryItems, 
  onBack, 
  isUsingPoints 
}) => {

  // --- Estados ---
  const [dniValues, setDniValues] = useState<Record<string, string>>({});
  const [conadisCodes, setConadisCodes] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 


  // --- Lógica de Mapeo de Asistentes para el formulario ---
  const allAttendees: Attendee[] = summaryItems.flatMap((item) =>
    Array(item.cantidad)
      .fill(null)
      .map((_, index) => ({
        id: `${item.zona}-${index}`,
        zona: item.zona,
        label: `Asistente ${index + 1} (${item.zona})`,
      }))
  );
    
  // Handler para actualizar DNI
  const handleDniChange = (attendeeId: string, value: string) => {
    setDniValues(prev => ({ ...prev, [attendeeId]: value }));
  };

  // 🚀 Implementación del envío al CompraService
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
    const items = summaryItems.map(summaryItem => {
      const dnis = dnisPorZona[summaryItem.zona] || [];

      return {
        zonaId: summaryItem.zonaId, 
        dnis: dnis,
      };
    });

    // 3. Crear el DTO final
    const payload: CrearOrdenDto = {
      eventoId: eventoId, // ✅ Ya es number, no necesita Number()
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
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8 py-8">
      {/* Columna Izquierda: Formulario (Datos de Asistentes) */}
      <form onSubmit={handleSubmit} className="flex-1 bg-white p-6 rounded-lg shadow-md">
        
        {/* --- Título y botón Volver --- */}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
                Datos de Asistentes 👤
            </h2>
            <button
                type="button"
                onClick={onBack}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
            >
                <span className="text-xl mr-1">←</span> Volver a tickets
            </button>
        </div>
        
        {/* --- Formulario de DNI/CONADIS --- */}
        <div className="space-y-4">
            {allAttendees.map((attendee) => (
                <div key={attendee.id} className="grid grid-cols-2 gap-4 items-center border-b pb-2">
                    {/* Input DNI */}
                    <div>
                        <label htmlFor={`dni-${attendee.id}`} className="block text-sm font-medium text-gray-700">
                            {attendee.label} - DNI
                        </label>
                        <input
                            id={`dni-${attendee.id}`}
                            type="text"
                            value={dniValues[attendee.id] || ''}
                            onChange={(e) => handleDniChange(attendee.id, e.target.value)}
                            maxLength={10}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-700 focus:ring-yellow-700 sm:text-sm p-2"
                        />
                    </div>
                    
                    {/* Input CONADIS (Opcional) */}
                    <div>
                        <label htmlFor={`conadis-${attendee.id}`} className="block text-sm font-medium text-gray-500">
                            Cód. CONADIS (Opcional)
                        </label>
                        <input
                            id={`conadis-${attendee.id}`}
                            type="text"
                            value={conadisCodes[attendee.id] || ''}
                            onChange={(e) => setConadisCodes(prev => ({ ...prev, [attendee.id]: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-700 focus:ring-yellow-700 sm:text-sm p-2"
                        />
                    </div>
                </div>
            ))}
        </div>

        {/* --- Checkbox y Botón de Pago --- */}
        <div className="mt-6 space-y-4 pt-4 border-t">
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
              Declaro que he leído y acepto los **términos y condiciones** de Unite.
            </label>
          </div>
          <button
            type="submit"
            disabled={!termsAccepted || isLoading} 
            className="w-full bg-yellow-700 text-white px-6 py-3 rounded-lg shadow font-semibold hover:bg-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
          >
            {isLoading ? "Procesando la Orden..." : "PAGAR Y CONTINUAR"}
          </button>
        </div>
      </form>

      {/* Columna Derecha: Resumen de Compra */}
      <div className="w-full md:w-1/3">
        <ResumenCompra 
          summaryItems={summaryItems} 
          isUsingPoints={isUsingPoints}
        />
        <div className="mt-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full text-sm text-gray-600 hover:text-gray-800 p-2 border rounded-lg bg-gray-100"
          >
            Volver a seleccionar tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatosCompra;