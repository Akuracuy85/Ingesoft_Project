import { useState } from "react";
import { FileText } from "lucide-react";

export default function TerminosCard() {
  const [contenido, setContenido] = useState<string>(
    `1. El evento se realizará en la fecha y hora indicadas.\n2. No se permiten reembolsos después de 48 horas.\n3. Los menores de edad deben estar acompañados por un adulto.`
  );

  const handleGuardar = () => {
    alert("Términos y condiciones actualizados correctamente.");
  };

  const handleHistorial = () => {
    alert("Aquí se mostraría el historial de cambios (funcionalidad futura).");
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 p-2 rounded-md">
          <FileText className="h-5 w-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Términos y condiciones</h3>
          <p className="text-sm text-gray-500">Actualiza los términos del evento.</p>
        </div>
      </div>

      {/* Campo de texto */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={6}
          className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 justify-between">
        <button
          onClick={handleHistorial}
          className="border border-gray-300 text-gray-700 rounded-md px-4 py-2 w-1/2 hover:bg-gray-50 text-sm"
          type="button"
        >
          Ver historial
        </button>
        <button
          onClick={handleGuardar}
          className="bg-amber-500 text-white rounded-md px-4 py-2 w-1/2 hover:bg-amber-600 text-sm font-medium"
          type="button"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
