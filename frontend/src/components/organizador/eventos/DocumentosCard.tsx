import { useEffect, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import type { DocumentoRespaldo } from "@/models/DocumentoRespaldo";
import { getDocumentosRespaldo, updateDocumentosRespaldo } from "@/services/EventoService";

// Adaptar DTO para enviar al backend (DocumentoDto)
interface DocumentoDtoPayload {
  id?: number;
  nombreArchivo: string;
  tipo: string; // lógico
  tamano: number;
  url?: string;
  contenidoBase64?: string;
}

interface DocumentosCardProps {
  eventoId: number;
}

export default function DocumentosCard({ eventoId }: DocumentosCardProps) {
  const [documentos, setDocumentos] = useState<DocumentoRespaldo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await getDocumentosRespaldo(eventoId);
      // Mapear a DocumentoRespaldo UI agregando estado ficticio
      const mapped: DocumentoRespaldo[] = docs.map((d) => ({
        id: d.id,
        nombreArchivo: d.nombreArchivo,
        tipo: d.tipo,
        tamano: d.tamano,
        url: d.url,
        estado: "Pendiente",
      }));
      setDocumentos(mapped);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los documentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventoId]);

  const filesToDto = async (files: FileList): Promise<DocumentoDtoPayload[]> => {
    const list: DocumentoDtoPayload[] = [];
    for (const file of Array.from(files)) {
      const base64 = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => {
          const result = fr.result as string;
          const commaIdx = result.indexOf(",");
          resolve(commaIdx >= 0 ? result.substring(commaIdx + 1) : result);
        };
        fr.onerror = () => reject(new Error("No se pudo leer el archivo"));
        fr.readAsDataURL(file);
      });
      list.push({ nombreArchivo: file.name, tipo: 'DocumentoRespaldo', tamano: file.size, contenidoBase64: base64 });
    }
    return list;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      const nuevos = await filesToDto(files);
      // Construir payload documentosRespaldo: existentes + nuevos (existentes en formato DTO)
      const existentes: DocumentoDtoPayload[] = documentos.map((d) => ({
        id: d.id,
        nombreArchivo: d.nombreArchivo,
        tipo: 'DocumentoRespaldo',
        tamano: d.tamano,
        url: d.url,
      }));
      const payloadDocs: DocumentoDtoPayload[] = [...existentes, ...nuevos];
      await updateDocumentosRespaldo(eventoId, payloadDocs);
      await cargar();
    } catch (err) {
      console.error("Error subiendo documentos", err);
      setError("Error al subir documentos");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleEliminar = async (id?: number) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      // Mantener sólo otros documentos
      const restantes = documentos.filter((d) => d.id !== id);
      const payloadDocs: DocumentoDtoPayload[] = restantes.map((d) => ({
        id: d.id,
        nombreArchivo: d.nombreArchivo,
        tipo: 'DocumentoRespaldo',
        tamano: d.tamano,
        url: d.url,
      }));
      await updateDocumentosRespaldo(eventoId, payloadDocs);
      await cargar();
    } catch (err) {
      console.error("Error eliminando documento", err);
      setError("No se pudo eliminar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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

      {loading && <p className="text-sm text-gray-500 mb-2">Cargando...</p>}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

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
            key={doc.id || doc.nombreArchivo}
            className="flex justify-between items-center border border-gray-200 rounded-md px-4 py-2 text-sm bg-white"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">{doc.nombreArchivo}</p>
                <p className="text-xs text-gray-500">{(doc.tamano/1024).toFixed(0)} KB · DocumentoRespaldo</p>
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
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-xs hover:underline"
              >
                Descargar
              </a>
              <button
                onClick={() => handleEliminar(doc.id)}
                className="text-gray-400 hover:text-red-500 transition"
                aria-label={`Eliminar ${doc.nombreArchivo}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {!loading && documentos.length === 0 && !error && (
          <p className="text-sm text-gray-500">No hay documentos subidos aún.</p>
        )}
      </div>
    </div>
  );
}
