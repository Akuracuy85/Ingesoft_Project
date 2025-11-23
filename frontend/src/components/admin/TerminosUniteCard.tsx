import { FileText, Upload } from "lucide-react";
import GenericService from "@/services/GenericService";
import NotificationService from "@/services/NotificationService";

interface TerminosUniteCardProps {
  handleSubmit: () => void,
}

export default function TerminosUniteCard({handleSubmit}: TerminosUniteCardProps) {

  const validarArchivo = (file: File): string | null => {
    const isPdfByMime = file.type === "application/pdf";
    const isPdfByName = file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfByMime && !isPdfByName) return "Solo se permite subir archivos PDF.";
    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) return "El archivo excede el tamaño máximo de 10MB.";
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (!file) return;
    const err = validarArchivo(file);
    if (err) {
      e.target.value = "";
      NotificationService.error(err)
      return;
    }
    await subir(file);
  };

  const subir = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(",")[1];
        if (!base64) {
          NotificationService.error("Error al leer el archivo")
          return;
        }
        await GenericService.SubirTerminosYCondiciones(base64);
        NotificationService.success("Se actualizó el archivo correctamente")
        handleSubmit()
      };
      reader.readAsDataURL(file);
    } catch (e: unknown) {
      console.error(e);
      NotificationService.error("Error al subir términos")
    }
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
          <p className="text-sm text-gray-500">Ten en cuenta que estos terminos y condiciones reemplazaran los antiguos que el publico verá.</p>
          <p className="text-sm text-gray-500">¡Descarga los anteriores para tenerlos en caso de emergencia!</p>
        </div>
      </div>

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
    </div>
  );
}