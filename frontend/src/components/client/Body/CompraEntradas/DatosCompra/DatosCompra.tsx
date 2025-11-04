// ./DatosCompra.tsx

import React, { useState, useMemo } from "react"; // ✅ Importar useMemo para la validación de duplicados
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

// --- CONSTANTE DE VALIDACIÓN ---
const DNI_LENGTH = 8;

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
  const [dniErrors, setDniErrors] = useState<Record<string, string>>({}); // ✅ Nuevo estado para manejar errores de DNI
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

  // --- Validación de Duplicados (se recalcula al cambiar dniValues) ---
  const duplicateDnis = useMemo(() => {
    const dnis: string[] = Object.values(dniValues).filter(dni => dni.length === DNI_LENGTH);
    const counts: Record<string, number> = {};
    dnis.forEach(dni => {
      counts[dni] = (counts[dni] || 0) + 1;
    });
    return new Set(Object.keys(counts).filter(dni => counts[dni] > 1));
  }, [dniValues]);

  // --- Handlers ---
  // ✅ MODIFICADO: Valida que solo sean dígitos y que no exceda los 8.
  const handleDniChange = (id: string, value: string) => {
    // 1. Restricción de entrada: solo números
    const numericValue = value.replace(/\D/g, ''); 
    
    // 2. Restricción de longitud: máximo 8 dígitos
    const finalValue = numericValue.slice(0, DNI_LENGTH);

    // 3. Actualizar estado
    setDniValues((prev) => ({ ...prev, [id]: finalValue }));

    // 4. Limpiar error si se arregla
    if (finalValue.length === DNI_LENGTH) {
      setDniErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleConadisChange = (id: string, value: string) => {
    setConadisCodes((prev) => ({ ...prev, [id]: value }));
  };

  // --- Submit Handler ---
  // ✅ MODIFICADO: Añade la validación de 8 dígitos y duplicados
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert("Debes aceptar los términos y condiciones.");
      return;
    }

    // --- 1. Validaciones EN FORMULARIO (8 dígitos y unicidad) ---
    let formValid = true;
    const newErrors: Record<string, string> = {};
    const enteredDnis = new Set<string>();
    const duplicateDnisOnSubmit = new Set<string>();

    // a. Validar longitud y existencia
    allAttendees.forEach(att => {
      const dni = dniValues[att.id] ? dniValues[att.id].trim() : '';
      
      if (dni.length === 0) {
        newErrors[att.id] = "El DNI es obligatorio.";
        formValid = false;
      } else if (dni.length !== DNI_LENGTH) {
        newErrors[att.id] = `El DNI debe tener ${DNI_LENGTH} dígitos.`;
        formValid = false;
      } else {
        // b. Validar unicidad
        if (enteredDnis.has(dni)) {
          duplicateDnisOnSubmit.add(dni);
          formValid = false;
        }
        enteredDnis.add(dni);
      }
    });

    // c. Asignar errores de duplicados (a todas las entradas que usen el DNI duplicado)
    if (duplicateDnisOnSubmit.size > 0) {
      allAttendees.forEach(att => {
        const dni = dniValues[att.id] ? dniValues[att.id].trim() : '';
        if (duplicateDnisOnSubmit.has(dni)) {
          newErrors[att.id] = `El DNI ${dni} ya ha sido ingresado para otro asistente.`;
        }
      });
    }

    setDniErrors(newErrors);

    if (!formValid) {
      alert("Por favor, corrige los errores en los campos de DNI.");
      return;
    }
    // --- Fin de Validaciones ---

    setIsLoading(true);

    // 2. Mapear DNI por Zona (La lógica de mapeo se mantiene igual)
    const dnisPorZona: Record<string, string[]> = allAttendees.reduce((acc, attendee) => {
      const dni = dniValues[attendee.id];
      // Nota: Aquí no se necesita validar `dni` ya que `formValid` garantiza que están llenos y son de 8 dígitos
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
            Coloque los números de identificación (DNI de 8 dígitos) de las personas que asistirán al evento:
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
                    .map((attendee) => {
                      const hasError = !!dniErrors[attendee.id]; // ✅ Identificar si hay error
                      const isDuplicate = duplicateDnis.has(dniValues[attendee.id]) && dniValues[attendee.id].length === DNI_LENGTH; // ✅ Resaltar duplicados

                      return (
                        <div key={attendee.id}>
                          <label htmlFor={`dni-${attendee.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            {attendee.label}
                          </label>
                          <input
                            type="text"
                            inputMode="numeric" // ✅ Sugerir teclado numérico
                            pattern="[0-9]*" // ✅ Patrón para solo números (para navegadores)
                            maxLength={DNI_LENGTH} // ✅ Limitar longitud en el input
                            id={`dni-${attendee.id}`}
                            value={dniValues[attendee.id] || ""}
                            onChange={(e) => handleDniChange(attendee.id, e.target.value)}
                            placeholder={`Ingrese DNI de ${DNI_LENGTH} dígitos`}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
                                        ${hasError || isDuplicate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-yellow-700 focus:border-yellow-700'}`} // ✅ Estilos de error/duplicado
                            required // DNI es requerido (lógica V1)
                          />
                          {/* ✅ Mensaje de error visible */}
                          {hasError && (
                            <p className="mt-1 text-sm text-red-600">{dniErrors[attendee.id]}</p>
                          )}
                          {/* ✅ Mensaje de duplicado en tiempo real (si no hay un error específico de handleSubmit) */}
                          {!hasError && isDuplicate && (
                             <p className="mt-1 text-sm text-orange-600">Este DNI está repetido.</p>
                          )}
                        </div>
                      );
                    })}
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
                    onChange={(e) => handleConadisChange(attendee.id, e.target.value)}
                    placeholder="Ingrese código"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-700 focus:border-yellow-700"
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
              Declaro que he leído y acepto los términos y condiciones de Unite.
            </label>
          </div>
          <button
            type="submit"
            // ✅ Lógica de 'disabled' de V1 (Ahora también deshabilitado si hay errores visibles)
            disabled={!termsAccepted || isLoading || Object.keys(dniErrors).length > 0} 
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