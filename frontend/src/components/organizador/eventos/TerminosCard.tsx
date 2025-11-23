import { useState, useEffect } from "react";
import { FileText, Upload, X } from "lucide-react";
import { getTerminosUso, updateTerminosUso } from "@/services/EventoService";

interface TerminosCardProps {
  eventoId: number;
  onCambio?: (doc: { nombreArchivo: string; url: string } | null) => void;
}

interface DocumentoTerminos {
  id?: number;
  nombreArchivo: string;
  url: string;
  tamano: number;
  tipo: string;
}

export default function TerminosCard({ eventoId, onCambio }: TerminosCardProps) {
  const [terminosRemoto, setTerminosRemoto] = useState<DocumentoTerminos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [exito, setExito] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(eventoId) || eventoId <= 0) {
      setError("ID de evento inválido");
      setCargandoInicial(false);
      return;
    }
    let activo = true;
    async function cargar() {
      try {
        setCargandoInicial(true);
        const doc = await getTerminosUso(eventoId);
        if (!activo) return;
        if (doc) {
          const adaptado: DocumentoTerminos = {
            id: doc.id,
            nombreArchivo: doc.nombreArchivo,
            url: doc.url,
            tamano: doc.tamano,
            tipo: doc.tipo,
          };
          setTerminosRemoto(adaptado);
          onCambio?.({ nombreArchivo: adaptado.nombreArchivo, url: adaptado.url });
        } else {
          setTerminosRemoto(null);
          onCambio?.(null);
        }
      } catch (e: unknown) {
        console.error("Error cargando términos", e);
        const mensaje = e instanceof Error ? e.message : "Error al cargar términos";
        setError(mensaje);
      } finally {
        if (activo) setCargandoInicial(false);
      }
    }
    cargar();
    return () => { activo = false; };
  }, [eventoId, onCambio]);

  const validarArchivo = (file: File): string | null => {
    const isPdfByMime = file.type === "application/pdf";
    const isPdfByName = file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfByMime && !isPdfByName) return "Solo se permite subir archivos PDF.";
    const maxBytes = 10 * 1024 * 1024; //10MB
    if (file.size > maxBytes) return "El archivo excede el tamaño máximo de 10MB.";
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setExito(null);
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (!file) return;
    const err = validarArchivo(file);
    if (err) {
      setError(err);
      e.target.value = "";
      return;
    }
    await subir(file);
  };

  const subir = async (file: File | null) => {
    if (!Number.isFinite(eventoId) || eventoId <= 0) {
      setError("ID de evento inválido");
      return;
    }
    setSubiendo(true);
    setError(null);
    setExito(null);
    try {
      const resp = await updateTerminosUso(eventoId, file);
      if (resp?.success) {
        setExito(file ? "Términos actualizados" : "Términos eliminados");
        const doc = await getTerminosUso(eventoId);
        if (doc) {
          const adaptado: DocumentoTerminos = {
            id: doc.id,
            nombreArchivo: doc.nombreArchivo,
            url: doc.url,
            tamano: doc.tamano,
            tipo: doc.tipo,
          };
          setTerminosRemoto(adaptado);
          onCambio?.({ nombreArchivo: adaptado.nombreArchivo, url: adaptado.url });
        } else {
          setTerminosRemoto(null);
          onCambio?.(null);
        }
      } else {
        setError("No se pudo actualizar los términos");
      }
    } catch (e: unknown) {
      console.error(e);
      let mensaje = "Error al subir términos";
      if (isAxiosErrorLike(e)) {
        mensaje = e.response?.data?.message || mensaje;
      } else if (e instanceof Error) {
        mensaje = e.message;
      }
      setError(mensaje);
    } finally {
      setSubiendo(false);
    }
  };

  function isAxiosErrorLike(val: unknown): val is { response?: { data?: { message?: string } } } {
    return !!val && typeof val === 'object' && 'response' in val;
  }

  const handleEliminar = async () => {
    await subir(null);
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

      {cargandoInicial && <p className="text-sm text-gray-500 mb-2">Cargando...</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {exito && <p className="text-sm text-green-600 mb-3">{exito}</p>}

      {/* Zona de subida (cuando no hay PDF remoto) */}
      {!terminosRemoto && (
        <label
          htmlFor={`terminos-upload-${eventoId}`}
          className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center h-32 text-gray-500 cursor-pointer hover:bg-gray-50"
        >
          <Upload className="h-6 w-6 mb-2" />
          <p className="text-sm">Arrastra el PDF aquí o haz clic para seleccionar</p>
          <p className="text-xs text-gray-400">Solo PDF (máx. 10MB){subiendo && " - Subiendo..."}</p>
          <input
            id={`terminos-upload-${eventoId}`}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={subiendo}
          />
        </label>
      )}

      {/* Archivo existente */}
      {terminosRemoto && (
        <div className="space-y-3">
          <div className="flex justify-between items-center border border-gray-200 rounded-md px-4 py-2 text-sm bg-white">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">{terminosRemoto.nombreArchivo}</p>
                <p className="text-xs text-gray-500">PDF · {(terminosRemoto.tamano / 1024).toFixed(0)} KB</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <a
                href={terminosRemoto.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-xs hover:underline"
              >
                Ver / Descargar
              </a>
              <label className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                Reemplazar
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={subiendo}
                />
              </label>
              <button
                onClick={handleEliminar}
                className="text-gray-400 hover:text-red-500 transition"
                aria-label={`Eliminar ${terminosRemoto.nombreArchivo}`}
                type="button"
                disabled={subiendo}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          {subiendo && <p className="text-xs text-gray-500">Procesando...</p>}
        </div>
      )}
    </div>
  );
}