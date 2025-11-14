import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import type { Documento } from "@/models/Documento";

export default function DocumentosCard() {
  const [documentos, setDocumentos] = useState<Documento[]>([
    { id: 1, nombre: "contrato-venue.pdf", tipo: "PDF", estado: "Aprobado" },
    { id: 2, nombre: "seguro-evento.pdf", tipo: "PDF", estado: "Pendiente" },
  ]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const nuevosDocs: Documento[] = Array.from(files).map((file, index) => ({
        id: Date.now() + index,
        nombre: file.name,
        tipo: file.name.split(".").pop()?.toUpperCase() || "DOC",
        estado: "Pendiente",
      }));
      setDocumentos((prev) => [...prev, ...nuevosDocs]);
    }
  };

  const handleEliminar = (id: number | undefined) => {
    if(id === undefined) {
      console.log("ID del documento no existe");
      return;
    }
    setDocumentos((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 p-2 rounded-md">
          <FileText className="h-5 w-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Documentos de respaldo</h3>
          <p className="text-sm text-gray-500">Sube contratos, permisos y certificados.</p>
        </div>
      </div>

      {/* Área de carga */}
      <label
        htmlFor="file-upload"
        className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center h-32 text-gray-500 cursor-pointer hover:bg-gray-50 mb-4"
      >
        <Upload className="h-6 w-6 mb-2" />
        <p className="text-sm">Arrastra archivos aquí o haz clic para seleccionar</p>
        <p className="text-xs text-gray-400">PDF, DOC, DOCX hasta 10MB</p>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.doc,.docx"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </label>

      {/* Lista de documentos */}
      <div className="space-y-3">
        {documentos.map((doc) => (
          <div
            key={doc.id}
            className="flex justify-between items-center border border-gray-200 rounded-md px-4 py-2 text-sm bg-white"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">{doc.nombre}</p>
                <p className="text-xs text-gray-500">{doc.tipo}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  doc.estado === "Aprobado" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {doc.estado}
              </span>
              <button
                onClick={() => handleEliminar(doc.id)}
                className="text-gray-400 hover:text-red-500 transition"
                aria-label={`Eliminar ${doc.nombre}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
