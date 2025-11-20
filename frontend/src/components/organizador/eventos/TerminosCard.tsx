import { useState } from "react";
import { FileText, Upload, X } from "lucide-react";

export default function TerminosCard() {
  // Estado local: único PDF de términos
  const [terminosPDF, setTerminosPDF] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (!file) return;

    const isPdfByMime = file.type === "application/pdf";
    const isPdfByName = file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfByMime && !isPdfByName) {
      setError("Solo se permite subir archivos PDF.");
      e.target.value = "";
      return;
    }

    setTerminosPDF(file);
  };

  const handleEliminar = () => {
    setTerminosPDF(null);
    setError(null);
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
          <p className="text-sm text-gray-500">Sube un documento PDF con los términos del evento.</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {/* Zona de subida (cuando no hay PDF) */}
      {!terminosPDF && (
        <label
          htmlFor="terminos-upload"
          className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center h-32 text-gray-500 cursor-pointer hover:bg-gray-50"
        >
          <Upload className="h-6 w-6 mb-2" />
          <p className="text-sm">Arrastra el PDF aquí o haz clic para seleccionar</p>
          <p className="text-xs text-gray-400">Solo PDF (máx. 10MB)</p>
          <input
            id="terminos-upload"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}

      {/* Fila con el archivo (cuando hay PDF) */}
      {terminosPDF && (
        <div className="flex justify-between items-center border border-gray-200 rounded-md px-4 py-2 text-sm bg-white">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">{terminosPDF.name}</p>
              <p className="text-xs text-gray-500">PDF · {(terminosPDF.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <button
            onClick={handleEliminar}
            className="text-gray-400 hover:text-red-500 transition"
            aria-label={`Eliminar ${terminosPDF.name}`}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
